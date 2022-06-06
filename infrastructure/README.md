# Development Setup Overview
1. Install chocolatey.
2. Using chocolatey install Terraform, node.js
3. Install Azure CLI and Login your Azure Acocunt.
4. Install yarn and npx
5. Install cdktf ```npm run upgrade``` and ```npm i -g cdktf@latest cdktf-cli@latest```

# Deploy
Open the first terminal, and run ```npm run watch``` to complie TypeScript.

Open the second terminal, and run ```cdktf deploy --auto-approve```


Get output
```cdktf output```

Save output to json
```cdktf output --outputs-file-include-sensitive-outputs --outputs-file secrets.json```


