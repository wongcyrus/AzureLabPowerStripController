using System;
using Microsoft.Azure.WebJobs;
using Microsoft.Extensions.Configuration;

namespace PowerStripControllerFunctionApp.Helper;

public class Config
{
    public enum Key
    {
        AzureWebJobsStorage,
        IotHubPrimaryConnectionString,
        IotHubName,
        Environment,
        StorageAccountName,
        StorageAccountKey,
        DeviceId
    }

    private readonly IConfigurationRoot _config;

    public Config(ExecutionContext context)
    {
        _config = new ConfigurationBuilder()
            .SetBasePath(context.FunctionAppDirectory)
            .AddJsonFile("local.settings.json", true, true)
            .AddEnvironmentVariables()
            .Build();
    }

    public string GetConfig(Key key)
    {
        var name = Enum.GetName(typeof(Key), key);
        return _config[name];
    }
}