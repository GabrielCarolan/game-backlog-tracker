using GameBacklog.api.Data;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;

namespace GameBacklog.api.Tests;

public class CustomWebApplicationFactory : WebApplicationFactory<Program>
{
    private SqliteConnection? _connection;

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.ConfigureServices(services =>
        {
            services.RemoveAll<DbContextOptions<GameBacklogDbContext>>();
            services.RemoveAll<GameBacklogDbContext>();
            services.RemoveAll<SqliteConnection>();

            _connection = new SqliteConnection("DataSource=:memory:");
            _connection.Open();

            services.AddSingleton(_connection); // Keep the connection open for the lifetime of the application
            services.AddDbContext<GameBacklogDbContext>(options =>
                options.UseSqlite(_connection)); // Use the in-memory SQLite database when the application requests a GameBacklogDbContext

            using var serviceProvider = services.BuildServiceProvider(); // Make the container from registrations
            using var scope = serviceProvider.CreateScope(); // Create the proper lifetime scope to resolve the DbContext
            var db = scope.ServiceProvider.GetRequiredService<GameBacklogDbContext>(); // Get the actual DbContext instance that the application will use

            db.Database.EnsureDeleted();
            db.Database.EnsureCreated();
        });
    }

    protected override void Dispose(bool disposing)
    {
        base.Dispose(disposing);

        if (disposing)
        {
            _connection?.Dispose();
            _connection = null;
        }
    }
}
