using GameBacklog.api.Models;

namespace GameBacklog.api.Dtos;

public class AddLogRequest
{
    public int GameId { get; set; }
    public string? Platform { get; set; }
    public GameStatus Status { get; set; }
    public int? Rating { get; set; }
    public string? Notes { get; set; }
}