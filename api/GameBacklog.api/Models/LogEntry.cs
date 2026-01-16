using System.ComponentModel.DataAnnotations;

namespace GameBacklog.api.Models;

public enum GameStatus
{
    NotPlayed = 0,
    Backlogged = 1,
    Playing = 2,
    Played = 3
}

public class LogEntry
{
    public int Id { get; set; }

    public int UserId { get; set; }
    
    [Required]
    public int GameId { get; set; }

    public Game? Game{ get; set; }

    // log tracker fields
    public string? Platform { get; set; }
    public GameStatus Status { get; set; } = GameStatus.NotPlayed;
    public int? Rating { get; set; } // 1-10, optional
    public  string? Notes { get; set; }

    public DateTime DateAddedUtc { get; set; } = DateTime.UtcNow;
}