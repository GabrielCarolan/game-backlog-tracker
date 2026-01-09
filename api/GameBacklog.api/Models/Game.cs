namespace GameBacklog.api.Models;

public enum GameStatus
{
    NotPlayed = 0,
    Backlogged = 1,
    Playing = 2,
    Played = 3
}

public class Game
{
    public int Id { get; set; }
    public string Title { get; set; } = "";
    public string? Platform { get; set; }
    public int? ReleaseYear { get; set; }

    // Backlog tracker fields
    public GameStatus Status { get; set; } = GameStatus.NotPlayed;
    public int? Rating { get; set; } // 1-10, optional
    public  string? Notes { get; set; }
    public DateTime DateAddedUtc { get; set; } = DateTime.UtcNow;
}