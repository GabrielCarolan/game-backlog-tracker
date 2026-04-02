using System.ComponentModel.DataAnnotations;
using GameBacklog.api.Models;

namespace GameBacklog.api.Dtos;

public class UpdateLogRequest
{
    [StringLength(100, ErrorMessage = "Platform cannot exceed 100 characters.")]
    public string? Platform { get; set;} 

    [EnumDataType(typeof(GameStatus), ErrorMessage = "Status must be a valid game status.")]
    public GameStatus Status { get; set;}

    [Range(1, 10, ErrorMessage = "Rating must be between 1 and 10.")]
    public int? Rating { get; set;}

    [StringLength(2000, ErrorMessage = "Notes cannot exceed 2000 characters.")]
    public string? Notes { get; set;}
}
