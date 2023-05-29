import * as N3 from 'n3';
import {
    type IPolicyType,
    PolicyPlugin
} from 'koreografeye';

/**
 * A plugin the executes each handler untill it returns a true
 */
export class WaterfallPlugin extends PolicyPlugin {
    handlers : PolicyPlugin[];

    constructor(handlers: PolicyPlugin[]) {
        super();
        this.handlers = handlers;
    }

    public async execute (mainStore: N3.Store, policyStore: N3.Store, policy: IPolicyType) : Promise<boolean> {
        this.logger.log(`starting WaterfallPlugin`);

        let result = false;

        for (let i = 0 ; i < this.handlers.length ; i++) {
            const handler = this.handlers[i];
            result  = await handler.execute(mainStore, policyStore, policy);

            if (result) {
                this.logger.debug(`${handler} succeeded`);
                break;
            }
            else {
                this.logger.debug(`${handler} failed`);
            }
        }
        
        return result;
    }
}