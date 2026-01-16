using Microsoft.AspNetCore.Mvc;
using GameBacklog.api.Models;
using GameBacklog.api.Dtos;
using System.Dynamic;
using GameBacklog.api.Services;
using GameBacklog.api.Data;
using Microsoft.EntityFrameworkCore;

namespace GameBacklog.api.Controllers;

[ApiController]
[Route ("api/log")]
public class LogController : ControllerBase
{
    private readonly GameBacklogDbContext _db;
    
    // TEMP until authentication exists
    private const int CurrentUserId = 1;

    public LogController (GameBacklogDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<object>>> GetMyLog()
    {
        var entries = await _db.LogEntries
            .Where( e => e.UserId == CurrentUserId)
            .Include( e => e.Game)
            .OrderByDescending( e => e.DateAddedUtc)
            .Select(e => new
            {
                entryId = e.Id,
                platform = e.Platform,
                status = e.Status,
                rating = e.Rating,
                notes = e.Notes,
                dateAddedUtc = e.DateAddedUtc,

                game = new
                {
                    id = e.Game!.Id,
                    title = e.Game.Title,
                    releaseYear = e.Game.ReleaseYear
                }
            })
            .ToListAsync();

            return Ok(entries);
    }

    [HttpPost]
    public async Task<IActionResult> AddToMyLog([FromBody] AddLogRequest request)
    {
        if(request.GameId <= 0)
            return BadRequest("Game Id must be a positive integer.");

        var gameExists = await _db.Games.AnyAsync( g => g.Id == request.GameId);
        if (!gameExists)
            return NotFound($"Game {request.GameId} not found");

        var alreadyLogged = await _db.LogEntries.AnyAsync( e => e.UserId == CurrentUserId && e.GameId == request.GameId);
        if (alreadyLogged)
            return Conflict("Game is already in your log");

        var entry = new LogEntry
        {
            UserId = CurrentUserId,
            GameId = request.GameId,
            Platform = request.Platform,
            Status = request.Status,
            Rating = request.Rating,
            Notes = string.IsNullOrWhiteSpace(request.Notes) ? null : request.Notes.Trim(),
            DateAddedUtc = DateTime.UtcNow
        };

        _db.LogEntries.Add(entry);
        await _db.SaveChangesAsync();

        //no URL so don't pass specific URL back as they are user specific
        return CreatedAtAction(nameof(GetMyLog), new {}, null);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> UpdateMyLogEntry(int id, [FromBody] UpdateLogRequest request)
    {
        // retrieves and tracks entity
        var entry = await _db.LogEntries.FirstOrDefaultAsync( e => e.Id == id && e.UserId == CurrentUserId);

        if(entry is null)
            return NotFound();

        entry.Platform = string.IsNullOrWhiteSpace(request.Platform) ? null : request.Platform.Trim();
        entry.Status = request.Status;
        entry.Rating = request.Rating;
        entry.Notes = string.IsNullOrWhiteSpace(request.Notes) ? null : request.Notes.Trim();

        await _db.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeleteMyLogEntry(int id)
    {
        var entry = await _db.LogEntries.FirstOrDefaultAsync( e => e.Id == id && e.UserId == CurrentUserId);

        if(entry is null)
            return NotFound();

        _db.LogEntries.Remove(entry);
        await _db.SaveChangesAsync();

        return NoContent(); // 204
    }
}