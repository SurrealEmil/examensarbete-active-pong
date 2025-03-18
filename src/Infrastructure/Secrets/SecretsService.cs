using Azure.Identity;
using Azure.Security.KeyVault.Secrets;
using Domain.Interfaces;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;

namespace Infrastructure.Secrets
{
    public class SecretsService : ISecretsService
    {
        private readonly Dictionary<string, string> _secrets;
        private readonly IConfiguration _configuration;
        private readonly bool _useKeyVault;

        public SecretsService(IConfiguration configuration)
        {
            _configuration = configuration;
            _secrets = new Dictionary<string, string>();

            // Read from appsettings.json whether to use Key Vault
            _useKeyVault = _configuration.GetValue<bool>("UseAzureKeyVault");

            if (_useKeyVault)
            {
                Console.WriteLine("[SecretsService] Using Azure Key Vault.");
                TryInitializeAzureKeyVault();
            }
            else
            {
                Console.WriteLine("[SecretsService] Using secrets.json.");
                InitializeSecretsFromJson();
            }
        }

        private void TryInitializeAzureKeyVault()
        {
            try
            {
                var keyVaultUrl = Environment.GetEnvironmentVariable("AzureKeyVaultUrl")
                                  ?? _configuration["AzureKeyVault:Url"];

                if (string.IsNullOrEmpty(keyVaultUrl))
                {
                    throw new InvalidOperationException("Azure Key Vault URL not found. Ensure it is set in configuration.");
                }

                var keyVaultClient = new SecretClient(new Uri(keyVaultUrl), new DefaultAzureCredential());

                var secretNames = new[]
                {
                    "CosmosDbAccount",
                    "CosmosDbKey",
                    "CosmosDbDatabaseName",
                    "JwtKey",
                    "JwtIssuer",
                    "JwtAudience"
                };

                foreach (var secretName in secretNames)
                {
                    try
                    {
                        var secret = keyVaultClient.GetSecret(secretName);
                        if (!string.IsNullOrEmpty(secret?.Value?.Value))
                        {
                            _secrets[secretName] = secret.Value.Value;
                        }
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine($"[SecretsService] Warning: Failed to retrieve secret '{secretName}' from Key Vault: {ex.Message}");
                    }
                }

                Console.WriteLine($"[SecretsService] {_secrets.Count} secrets successfully loaded from Azure Key Vault.");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[SecretsService] Error initializing Azure Key Vault: {ex.Message}");
                throw; // Throw an exception so the app does not silently continue
            }
        }

        private void InitializeSecretsFromJson()
        {
            foreach (var key in new[]
            {
                "CosmosDbAccount",
                "CosmosDbKey",
                "CosmosDbDatabaseName",
                "JwtKey",
                "JwtIssuer",
                "JwtAudience"
            })
            {
                var secretValue = _configuration[$"Secrets:{key}"];
                if (!string.IsNullOrEmpty(secretValue))
                {
                    _secrets[key] = secretValue;
                }
            }

            Console.WriteLine("[SecretsService] Secrets loaded from configuration (secrets.json or environment variables).");
        }

        public string GetSecret(string secretName)
        {
            if (_secrets.ContainsKey(secretName))
            {
                return _secrets[secretName];
            }

            throw new KeyNotFoundException($"Secret '{secretName}' not found.");
        }
    }
}
