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

            // ✅ Register CosmosDB Client
            services.AddSingleton<CosmosClient>(sp =>
            {
                return new CosmosClient(endpointUri, primaryKey);
            });


            // Register the CosmosDB Service
            //services.AddScoped<ICosmosDbService, CosmosDbService>();

            // Register the CosmosDB Initializer
            services.AddSingleton<CosmosDbInitializer>();

            // ✅ Register User Repository & Service
            services.AddScoped<IUserRepository, UserRepository>(); // Repository for DB access
            services.AddScoped<IUserService, UserService>();       // Service for business logic

            return services;
        }
    }
}
