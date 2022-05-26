# Setup

1. Install node.js 
2. Install yarn
3. Install npx
4. Install Terraform
5. Install cdktf ```npm run upgrade``` and ```npm i -g cdktf@latest cdktf-cli@latest```
6. Install Az.IotHub with administration Powershell ```Install-Module -Name Az.IotHub -Force -AllowClobber```
7. Run ```Connect-AzAccount```

# Deploy
Open the first terminal, and run ```npm run watch``` to complie TypeScript.

Open the second terminal,
1. Run ```cdkth get```
2. Run ```cdktf deploy```

