import { Construct } from "constructs";
import { App, TerraformStack } from "cdktf";
import { AzurermProvider, ResourceGroup } from "../.gen/providers/azurerm";

import { IotConstruct } from "./modules/IotConstruct"

class PowerControlStack extends TerraformStack {
  constructor(scope: Construct, name: string) {
    super(scope, name);

    new AzurermProvider(this, "AzureRm", {
      features: {}
    })

    const prefix= "LabPowerControl";

    const resourceGroup = new ResourceGroup(this, "ResourceGroup", {
      location: "EastAsia",
      name: prefix + "ResourceGroup"
    })
    new IotConstruct(this, "IotConstruct", {
      environment: "dev",
      prefix,
      resourceGroup: resourceGroup,   
    })
  }
}

const app = new App({skipValidation: true});
new PowerControlStack(app, "infrastructure");
app.synth();
