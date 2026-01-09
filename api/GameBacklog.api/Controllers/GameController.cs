using Microsoft.AspNetCore.Mvc;
using GameBacklog.api.Models;
using GameBacklog.api.Dtos;
using System.Dynamic;

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

    // POST /api/games
    [HttpPost]
    public ActionResult<Game> Create([FromBody] CreateGameRequest request)
    {
        // Generate a new ID (simple approach for in-memory storage)
        var nextId = Games.Count == 0 ? 1 : Games.Max(g => g.Id) + 1;

        var game = new Game
        {
            Id = nextId,
            Title = request.Title,
            Platform = request.Platform,
            ReleaseYear = request.ReleaseYear,
            Status = request.Status,
            Rating = request.Rating,
            Notes = request.Notes,
            DateAddedUtc = DateTime.UtcNow
        };

        Games.Add(game);

        // 201 Created + Location header pointing to GET /api/games/{id}
        return CreatedAtAction(nameof(GetById), new {id = game.Id}, game);
    }

    // PUT /api/games/2
    [HttpPut("{id:int}")]
    public IActionResult Update(int id, [FromBody] UpdateGameRequest request)
    {
        var game = Games.FirstOrDefault(g => g.Id == id);
        if (game is null)
            {return NotFound();}

        game.Title = request.Title;
        game.Platform = request.Platform;
        game.ReleaseYear = request.ReleaseYear;
        game.Status = request.Status;
        game.Rating = request.Rating;
        game.Notes = request.Notes;

        return NoContent(); // 204
    }

    // DELETE /api/games/2
    [HttpDelete("{id:int}")]
    public IActionResult Delete(int id)
    {
        var game = Games.FirstOrDefault(g => g.Id == id);
        if (game is null)
            {return NotFound();}

        Games.Remove(game);
        return NoContent(); // 204
    }
}