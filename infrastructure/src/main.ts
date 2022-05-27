import { Construct } from "constructs";
import { App, TerraformOutput, TerraformStack } from "cdktf";
import { AzurermProvider, ResourceGroup } from "../.gen/providers/azurerm";

import { AzureIotConstruct } from "./modules/AzureIotConstruct"
import { AzureIotDeviceConstruct } from "./modules/AzureIoTDeviceConstruct";
import { AzureFunctionLinuxConstruct } from "./modules/AzureFunctionLinuxConstruct";


class PowerControlStack extends TerraformStack {
  constructor(scope: Construct, name: string) {
    super(scope, name);

    new AzurermProvider(this, "AzureRm", {
      features: {}
    })

    const prefix = "LabPowerControl"
    const environment = "dev"
    const deviceId = "LabPowerController"

    const resourceGroup = new ResourceGroup(this, "ResourceGroup", {
      location: "EastAsia",
      name: prefix + "ResourceGroup"
    })
    const azureIotConstruct = new AzureIotConstruct(this, "IotConstruct", {
      environment,
      prefix,
      resourceGroup,
    })

    const azureIotDeviceConstruct = new AzureIotDeviceConstruct(this, "AzureIotDeviceConstruct", {
      deviceId,
      iothub: azureIotConstruct.iothub,
      environment,
      prefix,
      resourceGroup,
    })

    const appSettings = {
      "IotHubPrimaryConnectionString": azureIotConstruct.iothubPrimaryConnectionString,
      "EventHubPrimaryConnectionString": azureIotConstruct.eventhubPrimaryConnectionString,
      "EventHubName": azureIotConstruct.eventhub.name,
      "IotHubName": azureIotConstruct.iothub.name,
      "DeviceId": deviceId
    }

    const azureFunctionConstruct = new AzureFunctionLinuxConstruct(this, "AzureFunctionConstruct", {
      environment,
      prefix,
      resourceGroup,
      appSettings
    })

    new TerraformOutput(this, "FunctionAppHostname", {
      value: azureFunctionConstruct.functionApp.name
    });

    new TerraformOutput(this, "DeviceKey", {
      value: azureIotDeviceConstruct.deviceKey
    });

    new TerraformOutput(this, "Environment", {
      value: environment
    });

    new TerraformOutput(this, "AzureWebJobsStorage", {
      sensitive: true,   
      value: azureFunctionConstruct.storageAccount.primaryConnectionString
    });   

    for (let [key, value] of Object.entries(appSettings)) {
      new TerraformOutput(this, key, {
        sensitive: true,      
        value: value
      });
    }

  }
}

const app = new App({ skipValidation: true });
new PowerControlStack(app, "infrastructure");
app.synth();
