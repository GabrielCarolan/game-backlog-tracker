using Microsoft.AspNetCore.Mvc;
using GameBacklog.api.Models;
using GameBacklog.api.Dtos;
using GameBacklog.api.Services;
using GameBacklog.api.Data;
using Microsoft.EntityFrameworkCore;

namespace GameBacklog.api.Controllers;

[ApiController]
[Route ("api/[controller]")]
public class LogController : ControllerBase
{
    private readonly ILogStore _store;
    private readonly GameBacklogDbContext _db;
    
    // TEMP until authentication exists
    private const int CurrentUserId = 1;

    public LogController (ILogStore store, GameBacklogDbContext db)
    {
        _store = store;
        _db = db;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<LogEntry>>> GetMyLog()
    {
        var entries = await _store.GetMyLog(CurrentUserId);
        return Ok(entries);
    }

    [HttpPost]
    public async Task<IActionResult> AddToMyLog([FromBody] AddLogRequest request)
    {
        var gameExists = await _db.Games.AnyAsync( g => g.Id == request.GameId);
        if (!gameExists)
            return NotFound($"Game {request.GameId} not found");

        var alreadyLogged = await _db.LogEntries.AnyAsync( e => e.UserId == CurrentUserId && e.GameId == request.GameId);
        if (alreadyLogged)
            return Conflict("Game is already in your log");

        await _store.AddToMyLog(CurrentUserId, request);

       // We don't have GET /api/log/{id} yet, so point back to the collection
        return CreatedAtAction(nameof(GetMyLog), new {}, null);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> UpdateMyLogEntry(int id, [FromBody] UpdateLogRequest request)
    {
        var ok = await _store.UpdateMyLogEntry(CurrentUserId, id, request);
        if(!ok) return NotFound();
        return NoContent();
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeleteMyLogEntry(int id)
    {
        var ok = await _store.DeleteMyLogEntry(CurrentUserId, id);
        if(!ok) return NotFound();
        return NoContent();
    }
}