using Application.Interfaces;
using Application.Services;
using Domain.DbInterfaces;
using Domain.Interfaces;
using Infrastructure.Secrets;
using Microsoft.Azure.Cosmos;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Win32;

namespace Infrastructure.Persistence
{
    public static class DependencyInjection
    {
        public static IServiceCollection AddInfrastructure(this IServiceCollection services)
        {
            // 🔹 Register Secrets Service in DI
            services.AddSingleton<ISecretsService, SecretsService>();

            // 🔹 Retrieve Secrets from the DI Container
            services.AddSingleton(sp =>
            {
                var secretsService = sp.GetRequiredService<ISecretsService>();

                string endpointUri = secretsService.GetSecret("CosmosDbAccount");
                string primaryKey = secretsService.GetSecret("CosmosDbKey");

                if (string.IsNullOrEmpty(endpointUri) || string.IsNullOrEmpty(primaryKey))
                {
                    throw new ArgumentNullException("CosmosDB configuration values cannot be null.");
                }

                // ✅ Register CosmosDB Client with Gateway Mode
                return new CosmosClient(endpointUri, primaryKey, new CosmosClientOptions
                {
                    ConnectionMode = ConnectionMode.Gateway // Uses HTTP instead of Direct TCP
                });
            });

            // ✅ Register the CosmosDB Initializer
            services.AddSingleton<CosmosDbInitializer>();

            // ✅ Register JWT Service
            services.AddScoped<IJwtService, JwtService>();

            // ✅ Register User Repository & Service
            services.AddScoped<IUserRepository, UserRepository>();
            services.AddScoped<IUserService, UserService>();

            // ✅ Register Leaderboard Repository & Service
            services.AddScoped<ILeaderboardService, LeaderboardService>();
            services.AddScoped<ILeaderboardRepository, LeaderboardRepository>();

            // ✅ Register UserLeaderboard Repository & Service
            services.AddScoped<IUserLeaderboardService, UserLeaderboardService>();
            services.AddScoped<IUserLeaderboardRepository, UserLeaderboardRepository>();

            return services;
        }
    }

}
