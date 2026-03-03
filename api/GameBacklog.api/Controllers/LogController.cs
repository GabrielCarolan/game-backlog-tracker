using Microsoft.AspNetCore.Mvc;
using GameBacklog.api.Models;
using GameBacklog.api.Dtos;
using GameBacklog.api.Services;
using GameBacklog.api.Data;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace GameBacklog.api.Controllers;

[ApiController]
[Route ("api/[controller]")]
public class LogController : ControllerBase
{
    private readonly ILogStore _store;
    private readonly GameBacklogDbContext _db;
    
    // Temporary fallback until auth/login is fully wired.
    private const int FallbackUserId = 1;

    public LogController (ILogStore store, GameBacklogDbContext db)
    {
        _store = store;
        _db = db;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<LogEntry>>> GetMyLog()
    {
        var userId = GetCurrentUserIdOrFallback();
        var entries = await _store.GetMyLog(userId);
        return Ok(entries);
    }

    [HttpPost]
    public async Task<IActionResult> AddToMyLog([FromBody] AddLogRequest request)
    {
        var userId = GetCurrentUserIdOrFallback();
        var gameExists = await _db.Games.AnyAsync( g => g.Id == request.GameId);
        if (!gameExists)
            return NotFound($"Game {request.GameId} not found");

        var alreadyLogged = await _db.LogEntries.AnyAsync( e => e.UserId == userId && e.GameId == request.GameId);
        if (alreadyLogged)
            return Conflict("Game is already in your log");

        await _store.AddToMyLog(userId, request);

       // We don't have GET /api/log/{id} yet, so point back to the collection
        return CreatedAtAction(nameof(GetMyLog), new {}, null);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> UpdateMyLogEntry(int id, [FromBody] UpdateLogRequest request)
    {
        var userId = GetCurrentUserIdOrFallback();
        var ok = await _store.UpdateMyLogEntry(userId, id, request);
        if(!ok) return NotFound();
        return NoContent();
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeleteMyLogEntry(int id)
    {
        var userId = GetCurrentUserIdOrFallback();
        var ok = await _store.DeleteMyLogEntry(userId, id);
        if(!ok) return NotFound();
        return NoContent();
    }

    private int GetCurrentUserIdOrFallback()
    {
        var userIdClaim =
            //EXPLANATION: User is exposed by the ControllerBase which is HttpContext.User
            User.FindFirstValue(ClaimTypes.NameIdentifier) ??
            User.FindFirstValue("sub");
            //EXPLANATION: Checks to sections of User to find the identifier

        return int.TryParse(userIdClaim, out var userId) ? userId : FallbackUserId;
    }
}
