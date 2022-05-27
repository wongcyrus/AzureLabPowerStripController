using System;
using System.IO;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.WebJobs;
using Microsoft.Azure.WebJobs.Extensions.Http;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using Microsoft.Azure.Devices;
using PowerStripControllerFunctionApp.Helper;

namespace PowerStripControllerFunctionApp
{
    public static class PowerStatusFunction
    {
        [FunctionName(nameof(PowerStatusFunction))]
        public static async Task<IActionResult> Run(
            [HttpTrigger(AuthorizationLevel.Function, "get", Route = null)] HttpRequest req,
            ExecutionContext context,
            ILogger log)
        {
            log.LogInformation("HTTP trigger PowerStatusFunction processed a request.");
            var config = new Config(context);
            using var client = ServiceClient.CreateFromConnectionString(config.GetConfig(Config.Key.IotHubPrimaryConnectionString));
            using var manager = RegistryManager.CreateFromConnectionString(config.GetConfig(Config.Key.IotHubPrimaryConnectionString));
            var twin = await manager.GetTwinAsync(config.GetConfig(Config.Key.DeviceId));          

            return new OkObjectResult(JsonConvert.SerializeObject(twin.Properties.Reported));
        }
    }
}
