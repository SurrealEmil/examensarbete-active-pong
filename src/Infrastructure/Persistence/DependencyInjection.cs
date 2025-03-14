using Application.Interfaces;
using Application.Services;
using Domain.DbInterfaces;
using Microsoft.Azure.Cosmos;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Win32;

namespace Infrastructure.Persistence
{
    public static class DependencyInjection
    {
        public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
        {
            string endpointUri = configuration["CosmosDb:Account"];
            string primaryKey = configuration["CosmosDb:Key"];

            if (string.IsNullOrEmpty(endpointUri) || string.IsNullOrEmpty(primaryKey))
            {
                throw new ArgumentNullException("CosmosDB configuration values cannot be null.");
            }

            // Register CosmosDB Client with Gateway Mode
            services.AddSingleton<CosmosClient>(sp =>
            {
                return new CosmosClient(endpointUri, primaryKey, new CosmosClientOptions
                {
                    ConnectionMode = ConnectionMode.Gateway // Uses HTTP instead of Direct TCP
                });
            });

            // Register the CosmosDB Initializer
            services.AddSingleton<CosmosDbInitializer>();

            // Register JWT Service
            services.AddScoped<IJwtService, JwtService>();

            // Register User Repository & Service
            services.AddScoped<IUserRepository, UserRepository>(); // Repository for DB access
            services.AddScoped<IUserService, UserService>();       // Service for business logic

            // Register Leaderboard Repository & Service
            services.AddScoped<ILeaderboardService, LeaderboardService>();
            services.AddScoped<ILeaderboardRepository, LeaderboardRepository>();

            // Register UserLeaderboard Repository & Service
            services.AddScoped<IUserLeaderboardService, UserLeaderboardService>();
            services.AddScoped<IUserLeaderboardRepository, UserLeaderboardRepository>();

            return services;
        }
    }
}
