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
    const environment="dev"
    const deviceId="LabPowerController"

    const resourceGroup = new ResourceGroup(this, "ResourceGroup", {
      location: "EastAsia",
      name: prefix + "ResourceGroup"
    })
    const iotConstruct = new AzureIotConstruct(this, "IotConstruct", {
      environment,
      prefix,
      resourceGroup,
    })

    const azureIotDeviceConstruct = new AzureIotDeviceConstruct(this,"AzureIotDeviceConstruct",{
      deviceId,
      iothub: iotConstruct.iothub,
      environment,
      prefix,
      resourceGroup,
    })

    const appSettings = {
      "IOT_HUB_PRIMARY_CONNECTION_STRING": iotConstruct.iothubPrimaryConnectionString,
      "EVENT_HUB_PRIMARY_CONNECTION_STRING": iotConstruct.eventhubPrimaryConnectionString,
      "EVENTHUB_NAME": iotConstruct.eventhub.name,
      "IOTHUB_NAME": iotConstruct.iothub.name,
      "DeviceId": deviceId
    }

    const azureFunctionConstruct = new AzureFunctionLinuxConstruct(this,"AzureFunctionConstruct",{
      environment,
      prefix,
      resourceGroup,
      appSettings
    })

    new TerraformOutput(this, "FunctionAppHostname", {
      value: azureFunctionConstruct.functionApp.defaultHostname
    });

    new TerraformOutput(this, "deviceKey", {
      value: azureIotDeviceConstruct.deviceKey
    });

  }
}

const app = new App({ skipValidation: true });
new PowerControlStack(app, "infrastructure");
app.synth();
