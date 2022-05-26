import { Construct } from 'constructs'
import { Eventhub, EventhubNamespace, EventhubAuthorizationRule, Iothub, IothubEndpointEventhub, IothubRouteA, IothubEnrichmentA, ResourceGroup } from "../../.gen/providers/azurerm"
import { StringResource } from '@cdktf/provider-random'

import { DataExternal } from "../../.gen/providers/external";
import { TerraformOutput } from 'cdktf';
import path = require('path');

export interface IoTConfig {
    readonly prefix: string
    readonly environment: string
    readonly resourceGroup: ResourceGroup
}

export class IotConstruct extends Construct {
    public readonly iothub: Iothub;
    public readonly eventhub: Eventhub;
    public readonly deviceKey: string;

    constructor(
        scope: Construct,
        name: string,
        config: IoTConfig
    ) {
        super(scope, name)

        const suffix = new StringResource(this, "Random", {
            length: 5,
            special: false
        })
        const eventhubNamespace = new EventhubNamespace(this, "EventhubNamespace", {
            name: "EventhubNamespace" + suffix.result,
            location: config.resourceGroup.location,
            resourceGroupName: config.resourceGroup.name,
            sku: "Standard"
        })

        this.eventhub = new Eventhub(this, "Eventhub", {
            name: config.prefix + "Eventhub",
            resourceGroupName: config.resourceGroup.name,
            messageRetention: 1,
            namespaceName: eventhubNamespace.name,
            partitionCount: 1
        })

        const azureFunctionEventhubAuthorizationRule = new EventhubAuthorizationRule(this, "AzureFunctionEventhubAuthorizationRule", {
            name: "AzureFunctionEventhubAuthorizationRule",
            namespaceName: eventhubNamespace.name,
            eventhubName: this.eventhub.name,
            resourceGroupName: config.resourceGroup.name,
            listen: true,
            send: true,
            manage: true
        })


        this.iothub = new Iothub(this, "Iothub", {
            name: config.prefix + "Iothub",
            resourceGroupName: config.resourceGroup.name,
            location: config.resourceGroup.location,
            sku: { capacity: 1, name: "S1" },
            cloudToDevice: {
                maxDeliveryCount: 30,
                defaultTtl: "PT1H",
                feedback: [{ timeToLive: "PT1H10M", maxDeliveryCount: 15, lockDuration: "PT30S" }]
            },
            tags: { environment: config.environment }
        })

        const iothubEndpointEventhub = new IothubEndpointEventhub(this, "IothubEndpointEventhub", {
            resourceGroupName: config.resourceGroup.name,
            iothubId: this.iothub.id,
            name: config.prefix + "IothubEndpointEventhub",
            connectionString: azureFunctionEventhubAuthorizationRule.primaryConnectionString
        })

        new IothubRouteA(this, "IothubRouteDeviceMessages", {
            name: "eventhubdevicemessages",
            source: "DeviceMessages",
            condition: "true",
            endpointNames: [iothubEndpointEventhub.name],
            enabled: true,
            iothubName: this.iothub.name,
            resourceGroupName: config.resourceGroup.name,
        })

        new IothubRouteA(this, "IothubRouteTwinChangeEvents", {
            name: "eventhubtwinchangeevents",
            source: "TwinChangeEvents",
            condition: "true",
            endpointNames: [iothubEndpointEventhub.name],
            enabled: true,
            iothubName: this.iothub.name,
            resourceGroupName: config.resourceGroup.name,
        })

        new IothubRouteA(this, "IothubRouteDeviceConnectionStateEvents", {
            name: "eventhubdeviceconnectionstateevents",
            source: "DeviceConnectionStateEvents",
            condition: "true",
            endpointNames: [iothubEndpointEventhub.name],
            enabled: true,
            iothubName: this.iothub.name,
            resourceGroupName: config.resourceGroup.name,
        })

        new IothubEnrichmentA(this, "IothubEnrichmentA", {
            iothubName: this.iothub.name,
            resourceGroupName: config.resourceGroup.name,
            key: "tenant",
            value: "$twin.tags.Tenant",
            endpointNames: [iothubEndpointEventhub.name]
        })

        const psScriptPath = path.join(__dirname, "GetDeviceKey.ps1");
        const deviceKeyExternal = new DataExternal(this, "DeviceKeyExternal", {
            program: ["PowerShell", psScriptPath],
            query: {
                resourceGroup: config.resourceGroup.name,
                iotHubName: this.iothub.name
            }
        })
        this.deviceKey = deviceKeyExternal.result.lookup("deviceKey")

        new TerraformOutput(this, "deviceKey", {
            value: this.deviceKey          
        });

    }
}