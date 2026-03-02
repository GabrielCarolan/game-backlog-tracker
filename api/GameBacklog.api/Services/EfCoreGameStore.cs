using GameBacklog.api.Data;
using GameBacklog.api.Models;
using Microsoft.EntityFrameworkCore;

namespace GameBacklog.api.Services;

public class EfCoreGameStore : IGameStore
{
    private readonly GameBacklogDbContext _db;

    public EfCoreGameStore(GameBacklogDbContext db)
    {
        _db = db;
    }

    // Q:What is .AsNoTracking() doing? A:I am only reading data. Don't track changes
    public IEnumerable<Game> GetAll() => _db.Games.AsNoTracking().OrderBy(g => g.Id).ToList(); //the toList turns database queries into actual objects

    public Game? GetById(int id) => _db.Games.AsNoTracking().FirstOrDefault(g => g.Id == id);

    public Game Add(Game game)
    {
        _db.Games.Add(game);
        _db.SaveChanges();

        return game;
    }

    public bool Update(int id, Game updated)
    {
        var existing = _db.Games.FirstOrDefault(g => g.Id == id);
        if (existing is null) return false;
        
        existing.Title = updated.Title;
        existing.Platform = updated.Platform;
        existing.ReleaseYear = updated. ReleaseYear;

        _db.SaveChanges();
        return true;
    }

    public bool Delete(int id)
    {
        var existing = _db.Games.FirstOrDefault(g => g.Id == id);
        if(existing is null) return false;

        _db.Games.Remove(existing);
        _db.SaveChanges();
        return true;
    }
}