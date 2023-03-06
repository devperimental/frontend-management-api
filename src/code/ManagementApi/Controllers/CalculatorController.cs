using ManagementApi.Types;
using Microsoft.AspNetCore.Mvc;
using Swashbuckle.AspNetCore.Annotations;

namespace ManagementApi.Controllers;

/// <summary>
/// CalculatorController
/// </summary>
[ApiController]
[Route("frontend/management-api/[controller]")]
[Produces("application/json")]
public class calculatorController : ControllerBase
{
    private readonly ILogger<calculatorController> _logger;

    /// <summary>
    /// CalculatorController constructor
    /// </summary>
    /// <param name="logger"></param>
    public calculatorController(ILogger<calculatorController> logger)
    {
        _logger = logger;
    }

    /// <summary>
    /// Perform x + y
    /// </summary>
    /// <param name="request"></param>
    /// <returns>Sum of x and y.</returns>
    [HttpPost("add")]
    [SwaggerOperation(OperationId="add", Description = "Sum of x and y", Tags = new[] {"frontend-management-api"})]
    [Produces(typeof(AddResponseM))]
    public AddResponseM Add(AddRequestM request)
    {
        var response = new AddResponseM()
        {
            Result = request.X + request.Y
        };

        _logger.LogInformation("{x} plus {y} is {x + y}", request.X, request.Y, response.Result);
        return response;
    }
}
