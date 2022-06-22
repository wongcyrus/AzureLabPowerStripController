using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.Devices;
using Microsoft.Azure.WebJobs;
using Microsoft.Azure.WebJobs.Extensions.Http;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using PowerStripControllerFunctionApp.Helper;
using System.IO;
using System.Linq;
using System.Threading.Tasks;

namespace PowerStripControllerFunctionApp
{
    public static class PowerControlFunction
    {
        [FunctionName(nameof(PowerControlFunction))]
        public static async Task<IActionResult> Run(
            [HttpTrigger(AuthorizationLevel.Function, "get", "post", Route = null)] HttpRequest req,
            ExecutionContext context,
            ILogger log)
        {
            string device = req.Query["device"];
            string powerOn = req.Query["powerOn"];

            string requestBody = await new StreamReader(req.Body).ReadToEndAsync();
            dynamic data = JsonConvert.DeserializeObject(requestBody);
            device ??= data?.device;
            powerOn ??= data?.powerOn;

            var isPowerOn = powerOn.ToLower() == "true";

            string responseMessage = string.IsNullOrEmpty(device)
                ? "No Device"
                : $" {device} is powerOn = {isPowerOn}";

            var config = new Config(context);
            using var client = ServiceClient.CreateFromConnectionString(config.GetConfig(Config.Key.IotHubPrimaryConnectionString));
            using var manager = RegistryManager.CreateFromConnectionString(config.GetConfig(Config.Key.IotHubPrimaryConnectionString));

            var twin = await manager.GetTwinAsync(config.GetConfig(Config.Key.DeviceId));

            var deviceSet = Enumerable.Range(1, 3).Select(c => "Plug_" + c).ToHashSet();

            if (deviceSet.Contains(device))
            {
                twin.Properties.Desired[device] = isPowerOn;
            }
            else if (device.ToLower() == "all")
            {
                foreach (var d in deviceSet)
                {
                    twin.Properties.Desired[d] = isPowerOn;
                }
            }
            await manager.UpdateTwinAsync(twin.DeviceId, twin, twin.ETag);

            log.LogInformation(responseMessage);
            return new OkObjectResult(responseMessage);
        }
    }
}
