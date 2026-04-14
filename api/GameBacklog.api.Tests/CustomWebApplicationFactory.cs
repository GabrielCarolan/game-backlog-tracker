using GameBacklog.api.Data;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;

namespace GameBacklog.api.Tests;

public class CustomWebApplicationFactory : WebApplicationFactory<Program>
{
    public const string TestJwtKey = "super-secret-test-key-for-jwt-signing-12345";
    public const string TestJwtIssuer = "GameBacklog.Tests";
    public const string TestJwtAudience = "GameBacklog.Tests.Client";

    private SqliteConnection? _connection;

    public async Task ExecuteDbContextAsync(Func<GameBacklogDbContext, Task> action)
    {
        await using var scope = Services.CreateAsyncScope(); 
        var db = scope.ServiceProvider.GetRequiredService<GameBacklogDbContext>();
        await action(db);
    }

    // Override the WebApplicationFactory<Program> method to configure the test services
    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.ConfigureAppConfiguration((_, configBuilder) =>
        {
            configBuilder.AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["Jwt:Key"] = TestJwtKey,
                ["Jwt:Issuer"] = TestJwtIssuer,
                ["Jwt:Audience"] = TestJwtAudience
            });
        });

        builder.ConfigureServices(services =>
        {
            services.RemoveAll<DbContextOptions<GameBacklogDbContext>>();
            services.RemoveAll<GameBacklogDbContext>();
            services.RemoveAll<SqliteConnection>();

            _connection = new SqliteConnection("DataSource=:memory:");
            _connection.Open();

            // Configure the app to use the temp/test database
            services.AddSingleton(_connection); // Keep the connection open for the lifetime of the application
            services.AddDbContext<GameBacklogDbContext>(options =>
                options.UseSqlite(_connection)); // Use the in-memory SQLite database when the application requests a GameBacklogDbContext

            // Build container and resolve the DbContext
            using var serviceProvider = services.BuildServiceProvider(); // Make the container from registrations
            using var scope = serviceProvider.CreateScope(); // Create the proper lifetime scope to resolve the DbContext
            var db = scope.ServiceProvider.GetRequiredService<GameBacklogDbContext>(); // Get the actual DbContext instance that the application will use

            // Initialize a fresh database
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
