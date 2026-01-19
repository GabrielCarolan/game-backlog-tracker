using GameBacklog.api.Models;
using Microsoft.AspNetCore.Components.Web;

namespace GameBacklog.api.Services;


public class InMemoryGameStore : IGameStore
{
    private static readonly List<Game> Games =
    [
        new Game 
        {
            Id = 1,
            Title = "Hades",
            Platform = "PC",
            ReleaseYear = 2020,
        },

        new Game 
        {
            Id = 2,
            Title = "The Legend of Zelda: Breath of the Wild",
            Platform = "Switch",
            ReleaseYear = 2017,
        },

        new Game 
        {
            Id = 3,
            Title = "Grand Theft Auto 6",
            Platform = "PS5",
            ReleaseYear = 2026,
        }
    ];

    public IEnumerable<Game> GetAll() => Games;

    public Game? GetById(int id) => Games.FirstOrDefault(g => g.Id == id);

    public Game Add(Game game)
    {
        var nextId = Games.Count == 0 ? 1 : Games.Max(g => g.Id) + 1;

        game.Id = nextId;

        Games.Add(game);
        return game;
    }

    public bool Update(int id, Game updated)
    {
        var existing = GetById(id);
        if (existing is null) return false;

        existing.Title = updated.Title;
        existing.Platform = updated.Platform;
        existing.ReleaseYear = updated.ReleaseYear;
        
        return true;
    }

    public bool Delete(int id)
    {
        var existing = GetById(id);
        if (existing is null) return false;

        Games.Remove(existing);
        return true;
    }
}