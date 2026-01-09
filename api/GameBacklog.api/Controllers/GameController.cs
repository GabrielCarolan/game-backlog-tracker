using Microsoft.AspNetCore.Mvc;
using GameBacklog.api.Models;

namespace GameBacklog.api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class GamesController : ControllerBase
{
    // In-memory "fake database" for now
    private static readonly List<Game> Games =
    [
        new Game {Id = 1, Title = "Hades", Platform = "PC", ReleaseYear = 2020},
        new Game {Id = 2, Title = "The Legend of Zelda: Breath of the Wild", Platform = "Switch", ReleaseYear = 2017},
        new Game {Id = 3, Title = "Elden Ring", Platform = "PS5", ReleaseYear = 2022},
        new Game {Id = 4, Title = "Crash Bandicoot", Platform = "PS1", ReleaseYear = 1996}
    ];

    // GET /api/games
    [HttpGet]
    public ActionResult<IEnumerable<Game>> GetAll()
    {
        return Ok(Games);
    }

    // GET /api/games/2
    [HttpGet("{id:int}")]
    public ActionResult<Game> GetById(int id)
    {
        var game = Games.FirstOrDefault(g => g.Id == id);
        if (game is null)
            {return NotFound();}

        return Ok(game);
    }
}