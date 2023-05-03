import * as N3 from 'n3';
import {
    type IPolicyType,
    PolicyPlugin
} from 'koreografeye';

/**
 * A mock LDN inbox locator. Every resource will get an inbox based on a faseBaseUrl
 */
export class MockInboxLocatorPlugin extends PolicyPlugin {
    fakeBaseUrl : string;

    /**
     * @constructor
     * @param fakeBaseUrl - The base url for a fake inbox
     */
    constructor(fakeBaseUrl: string) {
        super();
        this.fakeBaseUrl = fakeBaseUrl;
    }

    /**
     * Required policy parameter ex:predicate (the predicate that points to a resource
     * to discover the LDN inbox for).
     */
    public async execute (mainStore: N3.Store, _policyStore: N3.Store, policy: IPolicyType) : Promise<boolean> {

        return new Promise<boolean>( async (resolve,_) => {
            const subject   = policy.args['http://example.org/subject']?.value;
            const predicate = policy.args['http://example.org/predicate']?.value;
            const object    = policy.args['http://example.org/object']?.value;

            if (subject === undefined ||
                predicate === undefined ||
                object === undefined) {
                this.logger.error(`no subject, predicate or object in policy`);
                resolve(false);
                return;
            }

            const inboxValue = this.fakeResolveInbox(object);

            this.logger.info(`${object} has inbox ${inboxValue}`);

            this.logger.debug(`adding the inbox to the main store`);

            mainStore.addQuad(
                N3.DataFactory.namedNode(subject),
                N3.DataFactory.namedNode(predicate),
                N3.DataFactory.namedNode(object),
                N3.DataFactory.defaultGraph()
            );

            mainStore.addQuad(
                    N3.DataFactory.namedNode(object),
                    N3.DataFactory.namedNode('https://www.w3.org/ns/ldp#inbox'),
                    N3.DataFactory.namedNode(inboxValue),
                    N3.DataFactory.defaultGraph()
            );

            resolve(true);
        });
    }

    private fakeResolveInbox(resource: string) : string {
        this.logger.info(`resolving inbox for ${resource}`);
        const baseUrl = resource.replace(/^http(s)?:\/\//,'')
                                .replace(/\/.*/,'')
                                .replace(/$/,'/inbox/');
        return this.fakeBaseUrl + '/' + baseUrl;
    }
}