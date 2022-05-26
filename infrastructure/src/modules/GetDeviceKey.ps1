$jsonpayload = [Console]::In.ReadLine()
$json = ConvertFrom-Json $jsonpayload
$resourceGroup = $json.resourceGroup
$iotHubName = $json.iotHubName

$device = Get-AzIotHubDevice -ResourceGroupName $resourceGroup -IotHubName $iotHubName -DeviceId "LabPowerController"

if (-Not $device){
    $result = Remove-AzIotHubDevice -ResourceGroupName $resourceGroup -IotHubName $iotHubName -DeviceId "LabPowerController" -PassThru
    $device = Add-AzIotHubDevice -ResourceGroupName $resourceGroup -IotHubName $iotHubName -DeviceId "LabPowerController" -AuthMethod "shared_private_key"
}
$deviceKey = $device.Authentication.SymmetricKey.PrimaryKey
Write-Output "{""deviceKey"" : ""$deviceKey""}"

# Add-AzIotHubDevice -ResourceGroupName LabPowerControlResourceGroup -IotHubName LabPowerControlIothub -DeviceId "LabPowerController" -AuthMethod "shared_private_key"
# Get-AzIotHubDevice -ResourceGroupName LabPowerControlResourceGroup -IotHubName LabPowerControlIothub -DeviceId "LabPowerController"
