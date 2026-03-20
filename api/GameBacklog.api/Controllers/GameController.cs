using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using GameBacklog.api.Models;
using GameBacklog.api.Dtos;
using System.Dynamic;
using GameBacklog.api.Services;
using GameBacklog.api.Data;

namespace GameBacklog.api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class GamesController : ControllerBase
{
    private readonly IGameStore _store;

    //constructor
    public GamesController(IGameStore store)
    {
        _store = store;
    }
    
    // GET /api/games
    [HttpGet]
    public ActionResult<IEnumerable<Game>> GetAll()
    {
        return Ok(_store.GetAll());
    }

    // GET /api/games/2
    [HttpGet("{id:int}")]
    public ActionResult<Game> GetById(int id)
    {
        var game = _store.GetById(id);
        if (game is null)
            {return NotFound();}

        return Ok(game);
    }

    // POST /api/games
    [HttpPost]
    [Authorize(Roles = "Admin")] // Require user to be in Admin role to create a game
    public ActionResult<Game> Create([FromBody] CreateGameRequest request)
    {
        var game = new Game
        {
            Title = request.Title,
            Platform = request.Platform,
            ReleaseYear = request.ReleaseYear,
        };

        var created = _store.Add(game);
        // 201 Created + Location header pointing to GET /api/games/{id}
        return CreatedAtAction(nameof(GetById), new {id = game.Id}, created);
    }

    // PUT /api/games/2
    [HttpPut("{id:int}")]
    [Authorize(Roles = "Admin")] // Require user to be in Admin role to update a game
    public IActionResult Update(int id, [FromBody] UpdateGameRequest request)
    {
        var updated = new Game
        {
            Title = request.Title,
            Platform = request.Platform,
            ReleaseYear = request.ReleaseYear,
        };

        if (!_store.Update(id, updated)) return NotFound();
        return NoContent(); // 204
    }

    // DELETE /api/games/2
    [HttpDelete("{id:int}")]
    [Authorize(Roles = "Admin")] // Require user to be in Admin role to delete a game
    public IActionResult Delete(int id)
    {
        if (!_store.Delete(id)) return NotFound();
        return NoContent();
    }
}
