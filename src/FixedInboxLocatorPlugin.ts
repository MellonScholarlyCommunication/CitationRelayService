import * as N3 from 'n3';
import {
    type IPolicyType,
    PolicyPlugin
} from 'koreografeye';

/**
 * A fixed inbox locator. Every resource gets the same inbox
 */
export class FixedInboxLocatorPlugin extends PolicyPlugin {
    fakeBaseUrl : string;

    /**
     * @constructor
     * @param fakeBaseUrl - The base url for a fake inbox
     */
    constructor(fakeBaseUrl: string) {
        super();
        this.fakeBaseUrl = fakeBaseUrl;
    }

    public async execute (mainStore: N3.Store, _policyStore: N3.Store, policy: IPolicyType) : Promise<boolean> {

        return new Promise<boolean>( async (resolve,_) => {
            this.logger.log(`starting FixedInboxLocatorPlugin`);

            const object    = policy.args['http://example.org/object'];

            if (object === undefined) {
                this.logger.error(`no object in policy`);
                resolve(false);
                return;
            }

            this.logger.info(`${object[0].value} has inbox ${this.fakeBaseUrl}`);

            this.logger.debug(`adding the inbox to the main store`);

            mainStore.addQuad(
                    N3.DataFactory.namedNode(object[0].value),
                    N3.DataFactory.namedNode('http://www.w3.org/ns/ldp#inbox'),
                    N3.DataFactory.namedNode(this.fakeBaseUrl),
                    N3.DataFactory.defaultGraph()
            );

            resolve(true);
        });
    }
}