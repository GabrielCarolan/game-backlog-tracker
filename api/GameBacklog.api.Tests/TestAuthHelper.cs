using System.Net.Http.Headers;
using System.Net.Http.Json;
using GameBacklog.api.Dtos;

namespace GameBacklog.api.Tests;

public static class TestAuthHelper
{
    public static async Task<AuthResponse> RegisterAndGetAuthAsync(
        HttpClient client,
        string email = "user@example.com",
        string password = "Password123!")
    {
        var response = await client.PostAsJsonAsync("/api/auth/register", new RegisterRequest // RegisterRequest only creates normal users, so this is used for normal user tests
        {
            Email = email,
            Password = password
        });

        response.EnsureSuccessStatusCode();

        return (await response.Content.ReadFromJsonAsync<AuthResponse>())!;
    }

    public static async Task<AuthResponse> LoginAndGetAuthAsync(
        HttpClient client,
        string email,
        string password)
    {
        var response = await client.PostAsJsonAsync("/api/auth/login", new LoginRequest
        {
            Email = email,
            Password = password
        });

        response.EnsureSuccessStatusCode();

        return (await response.Content.ReadFromJsonAsync<AuthResponse>())!;
    }

    public static async Task<HttpClient> CreateAuthenticatedClientAsync(
        CustomWebApplicationFactory factory,
        string email = "user@example.com",
        string password = "Password123!")
    {
        var client = factory.CreateClient();
        var auth = await RegisterAndGetAuthAsync(client, email, password); // Automatically registers a new non-admin user and gets the token for that user
        AttachBearerToken(client, auth.Token);
        return client;
    }

    public static async Task<HttpClient> CreateAdminClientAsync(
        CustomWebApplicationFactory factory,
        string email = "admin@example.com",
        string password = "Password123!")
    {
        // Register only creates normal users, so admin tests seed an admin account and then log in for the token.
        await TestDataSeeder.SeedUserAsync(factory, email, password, role: "Admin");

        var client = factory.CreateClient();
        var auth = await LoginAndGetAuthAsync(client, email, password);
        AttachBearerToken(client, auth.Token);
        return client;
    }

    public static void AttachBearerToken(HttpClient client, string token)
    {
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
    }
}
