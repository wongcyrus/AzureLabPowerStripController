import { StringResource } from '@cdktf/provider-random'
import { Construct } from 'constructs'
import { ResourceGroup, ApplicationInsights, ServicePlan, LinuxFunctionApp, StorageAccount } from "../../.gen/providers/azurerm"

export interface AzureFunctionLinuxConstructConfig {
    readonly prefix: string
    readonly environment: string
    readonly resourceGroup: ResourceGroup
    readonly appSettings: { [key: string]: string }
    readonly skuName?: string
}

export class AzureFunctionLinuxConstruct extends Construct {
    public readonly functionApp: LinuxFunctionApp;
    constructor(
        scope: Construct,
        name: string,
        config: AzureFunctionLinuxConstructConfig
    ) {
        super(scope, name)

        const applicationInsights = new ApplicationInsights(this, "ApplicationInsights", {
            name: config.prefix + "ApplicationInsights",
            location: config.resourceGroup.location,
            resourceGroupName: config.resourceGroup.name,
            applicationType: "other"
        })

        const appServicePlan = new ServicePlan(this, "AppServicePlan", {
            name: config.prefix + "AppServicePlan",
            location: config.resourceGroup.location,
            resourceGroupName: config.resourceGroup.name,
            skuName: config.skuName ?? "Y1",
            osType: "Linux",            
        })

        const suffix = new StringResource(this, "Random", {
            length: 5,
            special: false,
            lower: true,
            upper: false,
        })
        const storageAccount = new StorageAccount(this, "StorageAccount", {
            name: suffix.result,
            location: config.resourceGroup.location,
            resourceGroupName: config.resourceGroup.name,
            accountTier: "Standard",
            accountReplicationType: "LRS"
        })

        config.appSettings['FUNCTIONS_WORKER_RUNTIME'] = "dotnet"
        config.appSettings['AzureWebJobsStorage'] = storageAccount.primaryConnectionString
        config.appSettings['APPINSIGHTS_INSTRUMENTATIONKEY'] = applicationInsights.instrumentationKey
        config.appSettings['WEBSITE_RUN_FROM_PACKAGE'] = "1"
        config.appSettings['FUNCTIONS_WORKER_RUNTIME'] = "dotnet"

        this.functionApp = new LinuxFunctionApp(this, "FunctionApp", {
            name: config.prefix + "FunctionApp",
            location: config.resourceGroup.location,
            resourceGroupName: config.resourceGroup.name,
            servicePlanId: appServicePlan.id,            
            storageAccountName: storageAccount.name,
            storageAccountAccessKey: storageAccount.primaryAccessKey,

            identity: { type: "SystemAssigned" },
            lifecycle: {
                ignoreChanges: ["app_settings[\"WEBSITE_RUN_FROM_PACKAGE\"]"]
            },
            appSettings: config.appSettings,
            siteConfig: {
            }
        })

    }
}