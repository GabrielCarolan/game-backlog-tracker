using GameBacklog.Api.Models;
using GameBacklog.api.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace GameBacklog.api.Tests;

public static class TestDataSeeder
{
    public static async Task<User> SeedUserAsync(
        // Defualt values for convenience, but can be overridden when calling the method
        CustomWebApplicationFactory factory,
        string email = "user@example.com",
        string password = "Password123!",
        string role = "User")
    {
        User? createdUser = null;

        await factory.ExecuteDbContextAsync(async db =>
        {
            var normalizedEmail = email.Trim().ToLowerInvariant();
            var existingUser = await db.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == normalizedEmail);
            if (existingUser is not null)
            {
                createdUser = existingUser;
                return;
            }

            var user = new User
            {
                Email = normalizedEmail,
                Role = role
            };

            var passwordHasher = new PasswordHasher<User>();
            user.PasswordHash = passwordHasher.HashPassword(user, password);

            db.Users.Add(user);
            await db.SaveChangesAsync();
            createdUser = user;
        });

        return createdUser!;
    }

    public static async Task<Game> SeedGameAsync(
        CustomWebApplicationFactory factory,
        string title = "Test Game",
        string? platform = "PC",
        int? releaseYear = 2024)
    {
        Game? createdGame = null;

        await factory.ExecuteDbContextAsync(async db =>
        {
            var game = new Game
            {
                Title = title,
                Platform = platform,
                ReleaseYear = releaseYear
            };

            db.Games.Add(game);
            await db.SaveChangesAsync();
            createdGame = game;
        });

        return createdGame!;
    }

    public static async Task<LogEntry> SeedLogEntryAsync(
        CustomWebApplicationFactory factory,
        int userId,
        int gameId,
        GameStatus status = GameStatus.Backlogged,
        int? rating = null,
        string? platform = "PC",
        string? notes = "Seeded test entry")
    {
        LogEntry? createdEntry = null;

        await factory.ExecuteDbContextAsync(async db =>
        {
            var entry = new LogEntry
            {
                UserId = userId,
                GameId = gameId,
                Status = status,
                Rating = rating,
                Platform = platform,
                Notes = notes,
                DateAddedUtc = DateTime.UtcNow
            };

            db.LogEntries.Add(entry);
            await db.SaveChangesAsync();
            createdEntry = entry;
        });

        return createdEntry!;
    }
}
