using Microsoft.AspNetCore.Mvc;

namespace GameBacklog.api.Controllers;

[ApiController]
[Route("health")]
public class HomeController : ControllerBase
{
    [HttpGet]
    public IActionResult Get()
    {
        return Ok(new {status = "ok"});
    }
}