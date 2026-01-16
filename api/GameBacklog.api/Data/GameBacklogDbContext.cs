using GameBacklog.api.Models;
using Microsoft.EntityFrameworkCore;

namespace GameBacklog.api.Data;

public class GameBacklogDbContext : DbContext
{
    public GameBacklogDbContext(DbContextOptions<GameBacklogDbContext> options) : base(options)
    {
        
    }

    //exposes EF Core’s internal collection of Game entities as a named property, using C# shorthand for a getter.
    public DbSet<Game> Games => Set<Game>();
    public DbSet<LogEntry> LogEntries => Set<LogEntry>();
}