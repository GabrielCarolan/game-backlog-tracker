using System.ComponentModel.DataAnnotations;
using GameBacklog.api.Models;

namespace GameBacklog.api.Dtos;

public class CreateGameRequest
{
    [Required]
    [MinLength(1)]
    public string Title {get; set;} = "";

    public string? Platform {get; set;}

    [Range(1950, 2100)]
    public int? ReleaseYear {get; set;} 
}