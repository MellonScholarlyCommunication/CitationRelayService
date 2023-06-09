import * as N3 from 'n3';
import parseLinkHeader from 'parse-link-header';
import {
    type IPolicyType,
    PolicyPlugin
} from 'koreografeye';

/**
 * An LDN inbox discover plugin. Follows the object of an ex:predicate and 
 * tries to find the LDN inbox location from the HTTP Link headers
 */
export class InboxLocatorPlugin extends PolicyPlugin {

    /**
     * Required policy parameter ex:predicate (the predicate that points to a resource
     * to discover the LDN inbox for).
     */
    public async execute (mainStore: N3.Store, _policyStore: N3.Store, policy: IPolicyType) : Promise<boolean> {

        return new Promise<boolean>( async (resolve,_) => {
            this.logger.log(`starting InboxLocatorPlugin`);

            const object    = policy.args['http://example.org/object'];

            if (object === undefined) {
                this.logger.error(`no object in policy`);
                resolve(false);
                return;
            }

            const inboxValue = await this.resolveInbox(object[0].value);

            if (inboxValue) {
                this.logger.info(`${object} has inbox ${inboxValue}`);

                this.logger.debug(`adding the inbox to the main store`);

                mainStore.addQuad(
                        N3.DataFactory.namedNode(object[0].value),
                        N3.DataFactory.namedNode('http://www.w3.org/ns/ldp#inbox'),
                        N3.DataFactory.namedNode(inboxValue),
                        N3.DataFactory.defaultGraph()
                );
                resolve(true);
            }
            else {
                this.logger.info(`no inbox for ${object[0].value}`);
                resolve(false);
            }
        });
    }

    private async resolveInbox(resource: string) : Promise<string|null> {
        return new Promise( async(resolve,_) => {
            try {
                const response = await fetch(resource, { method: 'HEAD'} );

                if (! response.ok) {
                    this.logger.error(`failed to retrieve ${resource} : ${(await response).status}`);
                    resolve(null);
                    return;
                }

                const linkHeaders = response.headers.get('Link');

                this.logger.debug(`linked headers ${resource} : ${linkHeaders}`);

                if (linkHeaders === null) {
                    this.logger.info(`${resource} does not have link headers`);
                    resolve(null);
                    return;
                }

                const parsedLinkHeaders = parseLinkHeader(linkHeaders);

                if (parsedLinkHeaders == null) {
                    this.logger.info(`${resource} failed to parse link headers`);
                    resolve(null);
                    return;
                }

                if (parsedLinkHeaders['http://www.w3.org/ns/ldp#inbox']) {
                    const inbox = parsedLinkHeaders['http://www.w3.org/ns/ldp#inbox']['url'];
                    this.logger.info(`${resource} HEAD has inbox ${inbox}`);
                    resolve(inbox);
                }
                else {
                    this.logger.info(`${resource} HEAD has no http://www.w3.org/ns/ldp#inbox`);
                    resolve(null);
                    return;
                }
            }
            catch (e) {
                this.logger.error(`failed to retrieve ${resource} : general error`);
                resolve(null);
                return;
            }
        });
    }
}