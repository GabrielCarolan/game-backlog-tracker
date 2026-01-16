using System.ComponentModel.DataAnnotations;
using GameBacklog.api.Models;

namespace GameBacklog.api.Dtos;

public class UpdateLogRequest
{
    public string? Platform { get; set;} 
    public GameStatus Status { get; set;}

    [Range(1, 10, ErrorMessage = "Rating must be betweeen 1 and 10.")]
    public int? Rating { get; set;}
    public string? Notes { get; set;}
}