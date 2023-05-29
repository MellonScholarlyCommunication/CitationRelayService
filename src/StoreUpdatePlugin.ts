import * as N3 from 'n3';
import {
    type IPolicyType,
    PolicyPlugin
} from 'koreografeye';

/**
 * Add triples to the main store
 */
export class StoreUpdatePlugin extends PolicyPlugin {
    
    public async execute (mainStore: N3.Store, _policyStore: N3.Store, policy: IPolicyType) : Promise<boolean> {

        return new Promise<boolean>( async (resolve,_) => {
            this.logger.log(`starting StoreUpdatePlugin`);
            
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

            mainStore.addQuad(
                N3.DataFactory.namedNode(subject),
                N3.DataFactory.namedNode(predicate),
                N3.DataFactory.namedNode(object),
                N3.DataFactory.defaultGraph()
            );

            resolve(true);
        });
    }
}