using GameBacklog.api.Models;

namespace GameBacklog.api.Services;

public interface IGameStore
{
    IEnumerable<Game> GetAll();
    Game? GetById(int id);
    Game Add(Game game);
    bool Update(int id, Game updated);
    bool Delete(int id);
}