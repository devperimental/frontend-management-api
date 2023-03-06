using ManagementApi.Controllers;
using Microsoft.Extensions.Logging;
using Moq;

namespace ManagementApi.Tests
{
    public class CalculatorControllerTests
    {
        [SetUp]
        public void Setup()
        {

        }

        [Test]
        public void AddTest()
        {
            var loggerMock = new Mock<ILogger<calculatorController>>();
            var controller = new calculatorController(loggerMock.Object);
            var result = controller.Add(new Types.AddRequestM { X = 20, Y = 50 });
            Assert.Pass();
        }
    }
}