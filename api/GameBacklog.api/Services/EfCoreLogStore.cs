using GameBacklog.api.Models;
using GameBacklog.api.Dtos;
using GameBacklog.api.Data;
using Microsoft.EntityFrameworkCore;

namespace GameBacklog.api.Services;

public class EfCoreLogStore : ILogStore
{
    private readonly GameBacklogDbContext _db;

    public EfCoreLogStore (GameBacklogDbContext db)
    {
        _db = db;
    }

    public async Task<IEnumerable<LogEntry>> GetMyLog(int userId)
    {
        return await _db.LogEntries
            .Where(e => e.UserId == userId)
            .Include(e => e.Game)
            .OrderByDescending(e => e.DateAddedUtc)
            .AsNoTracking()
            .ToListAsync();
    }

    public async Task<bool> AddToMyLog(int userId, AddLogRequest request)
    {
        var entry = new LogEntry
        {
            UserId = userId,
            GameId = request.GameId,
            Platform = string.IsNullOrWhiteSpace(request.Platform) ? null : request.Platform.Trim(),
            Status = request.Status,
            Rating = request.Rating,
            Notes = string.IsNullOrWhiteSpace(request.Notes) ? null : request.Notes.Trim(),
            DateAddedUtc = DateTime.UtcNow
        };

        _db.LogEntries.Add(entry);
        await _db.SaveChangesAsync();

        return true;
    }

    public async Task<bool> UpdateMyLogEntry(int userId, int entryId, UpdateLogRequest request)
    {
        // retrieves and tracks entity
        var entry = await _db.LogEntries.FirstOrDefaultAsync( e => e.Id == entryId && e.UserId == userId);

        if(entry is null)
            return false;

        entry.Platform = string.IsNullOrWhiteSpace(request.Platform) ? null : request.Platform.Trim();
        entry.Status = request.Status;
        entry.Rating = request.Rating;
        entry.Notes = string.IsNullOrWhiteSpace(request.Notes) ? null : request.Notes.Trim();

        await _db.SaveChangesAsync();
        return true;
    }

    public async Task<bool> DeleteMyLogEntry(int userId, int entryId)
    {
        var entry = await _db.LogEntries
            .FirstOrDefaultAsync( e => e.Id == entryId && e.UserId == userId);

        if(entry is null)
            return false;

        _db.LogEntries.Remove(entry);
        await _db.SaveChangesAsync();

        return true; // 204
    }
}