using System.Net;
using System.Net.Http.Json;
using GameBacklog.api.Models;

namespace GameBacklog.api.Tests;

public class GamesEndpointsTests
{
    [Fact] // Indicates this is a single test case
    public async Task GetGames_ReturnsEmptyList_WhenNoGamesExist()
    {
        using var factory = new CustomWebApplicationFactory();
        using var client = factory.CreateClient();

        var response = await client.GetAsync("/api/games");

        response.EnsureSuccessStatusCode();

        var games = await response.Content.ReadFromJsonAsync<List<Game>>();

        Assert.NotNull(games);
        Assert.Empty(games);
    }

    [Fact]
    public async Task GetGames_ReturnsSeededGames()
    {
        using var factory = new CustomWebApplicationFactory();
        using var client = factory.CreateClient();

        await TestDataSeeder.SeedGameAsync(factory, title: "Halo 3", platform: "Xbox 360", releaseYear: 2007);
        await TestDataSeeder.SeedGameAsync(factory, title: "The Legend of Zelda", platform: "Switch", releaseYear: 2017);

        var response = await client.GetAsync("/api/games");

        response.EnsureSuccessStatusCode();
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var games = await response.Content.ReadFromJsonAsync<List<Game>>();

        Assert.NotNull(games);
        Assert.Equal(2, games.Count);
        Assert.Contains(games, g => g.Title == "Halo 3" && g.Platform == "Xbox 360" && g.ReleaseYear == 2007);
        Assert.Contains(games, g => g.Title == "The Legend of Zelda" && g.Platform == "Switch" && g.ReleaseYear == 2017);
    }
}
