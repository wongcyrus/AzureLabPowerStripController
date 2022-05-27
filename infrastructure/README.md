# Development Setup Overview
1. Install chocolatey.
2. Using chocolatey install Terraform
3. Using chocolatey install node.js 
5. Using chocolatey install jq
5. Install yarn
6. Install npx
7. Install cdktf ```npm run upgrade``` and ```npm i -g cdktf@latest cdktf-cli@latest```
8. Install Az.IotHub with administration Powershell ```Install-Module -Name Az.IotHub -Force -AllowClobber```
9. Run ```Connect-AzAccount```

# Deploy
Open the first terminal, and run ```npm run watch``` to complie TypeScript.

Open the second terminal,
1. Run ```cdkth get```
2. Run ```cdktf deploy --auto-approve```


Get output
```cdktf output```

Save output to json
```cdktf output --outputs-file-include-sensitive-outputs --outputs-file secrets.json```


