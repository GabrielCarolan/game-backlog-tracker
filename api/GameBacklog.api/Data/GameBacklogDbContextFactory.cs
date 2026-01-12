using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.Extensions.Configuration;

namespace GameBacklog.api.Data;

public class GameBacklogDbContextFactory : IDesignTimeDbContextFactory<GameBacklogDbContext>
{
    public GameBacklogDbContext CreateDbContext(string[] args)
    {
        var config = new ConfigurationBuilder()
            .SetBasePath(Directory.GetCurrentDirectory())
            .AddJsonFile("appsettings.json", optional: false)
            .AddJsonFile("appsettings.Development.json", optional: true)
            .AddEnvironmentVariables()
            .Build();

        var connectionString = config.GetConnectionString("DefaultConnection");
        if (string.IsNullOrWhiteSpace(connectionString))
            throw new InvalidOperationException("DefaultConnection connection string is missing or empty.");

        var optionsBuilder = new DbContextOptionsBuilder<GameBacklogDbContext>();
        optionsBuilder.UseSqlite(connectionString);

        return new GameBacklogDbContext(optionsBuilder.Options);
    }
}
