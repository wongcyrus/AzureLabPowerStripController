import { Construct } from 'constructs'
import { Eventhub, Iothub } from "../../.gen/providers/azurerm"

export interface AzureFunctionConstructConfig {
    readonly iothub: Iothub;
    readonly eventhub: Eventhub;
}

export class AzureFunctionConstruct extends Construct {

    constructor(
        scope: Construct,
        name: string,
        // config: AzureFunctionConstructConfig
    ) {
        super(scope, name)
       
    
    }
}