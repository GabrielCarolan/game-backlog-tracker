namespace GameBacklog.api.Models;

public class Game
{
    public int Id { get; set; }
    public string Title { get; set; } = "";
    public string? Platform { get; set; }
    public int? ReleaseYear { get; set; }
}