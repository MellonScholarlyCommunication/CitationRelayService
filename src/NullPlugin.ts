import * as N3 from 'n3';
import {
    type IPolicyType,
    PolicyPlugin
} from 'koreografeye';

/**
 * A do nothing plugin
 */
export class NullPlugin extends PolicyPlugin {
    public async execute (_mainStore: N3.Store, _policyStore: N3.Store, _policy: IPolicyType) : Promise<boolean> {
        this.logger.log(`starting NullPlugin`);
        return true;
    }
}