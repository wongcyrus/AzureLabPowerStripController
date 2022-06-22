import { Construct } from "constructs";
import { App, TerraformOutput, TerraformStack } from "cdktf";
import { AzurermProvider, ResourceGroup } from "cdktf-azure-providers/.gen/providers/azurerm";

import { AzureIotDeviceConstruct } from "azure-common-construct/patterns/AzureIoTDeviceConstruct";
import { AzureFunctionLinuxConstruct, PublishMode } from "azure-common-construct/patterns/AzureFunctionLinuxConstruct";
import { AzureIotConstruct } from "azure-common-construct/patterns/AzureIotConstruct";
import path = require("path");

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
    const azureIotConstruct = new AzureIotConstruct(this, "AzureIotConstruct", {
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
    azureIotDeviceConstruct.node.addDependency(azureIotConstruct)

    const appSettings = {
      "IotHubPrimaryConnectionString": azureIotConstruct.iothubPrimaryConnectionString,
      "IotHubName": azureIotConstruct.iothub.name,
      "DeviceId": deviceId
    }

    const functionNames= ["PowerControlFunction","PowerStatusFunction"];
    const azureFunctionConstruct = new AzureFunctionLinuxConstruct(this, "AzureFunctionConstruct", {
      environment,
      prefix,
      resourceGroup,
      appSettings,
      vsProjectPath: path.join(__dirname, "../../", "PowerStripController/PowerStripControllerFunctionApp"),
      publishMode: PublishMode.Always,
      functionNames
    })

    new TerraformOutput(this, "FunctionAppHostname", {
      value: azureFunctionConstruct.functionApp.name
    });

    for(const functionName of functionNames){
      new TerraformOutput(this, functionName+"Url", {
        value: azureFunctionConstruct.functionUrls![functionName]
      });
    }

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
