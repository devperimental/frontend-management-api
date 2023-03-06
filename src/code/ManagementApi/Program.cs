using PlatformX.Startup.Extensions;
using PlatformX.Startup.Middleware;
using System.Diagnostics.CodeAnalysis;

var builder = WebApplication.CreateBuilder(args);

// Load bootstrapConfiguration
var bootstrapConfiguration = builder.Services.AddBootstrapConfiguration();

// Configure the container dependancies
builder.Services.AddContainerService(builder.Configuration, builder.Logging, bootstrapConfiguration);

// Add services to the container.
builder.Services.AddControllers();

// Add AWS Lambda support. When application is run in Lambda Kestrel is swapped out as the web server with Amazon.Lambda.AspNetCoreServer. This
// package will act as the webserver translating request and responses between the Lambda event source and ASP.NET Core.
builder.Services.AddAWSLambdaHosting(LambdaEventSource.RestApi);

var app = builder.Build();

app.UseApi(bootstrapConfiguration, () => {
    app.UseAuthorization();
    app.MapControllers();
    app.MapGet("/", () => "Welcome to running ASP.NET Core Minimal API on AWS Lambda");
});


app.Run();

/// <summary>
/// DI Entry point
/// </summary>
[ExcludeFromDescription]
[ExcludeFromCodeCoverage]
public partial class Program { }
