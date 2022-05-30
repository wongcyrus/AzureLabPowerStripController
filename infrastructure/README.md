# Development Setup Overview
1. Install chocolatey.
2. Using chocolatey install Terraform, node.js, jq, Python, OpenJDK, Maven
3. Install yarn
4. Install npx
5. Install cdktf ```npm run upgrade``` and ```npm i -g cdktf@latest cdktf-cli@latest```
6. Install Az.IotHub with administration Powershell ```Install-Module -Name Az.IotHub -Force -AllowClobber```
7. Run ```Connect-AzAccount```

# Deploy
Open the first terminal, and run ```npm run watch``` to complie TypeScript.

Open the second terminal,
1. Run ```cdkth get```
2. Run ```cdktf deploy --auto-approve```


Get output
```cdktf output```

Save output to json
```cdktf output --outputs-file-include-sensitive-outputs --outputs-file secrets.json```


