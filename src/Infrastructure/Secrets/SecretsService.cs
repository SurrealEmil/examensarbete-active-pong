using Microsoft.Extensions.Configuration;
using Domain.Interfaces;

namespace Infrastructure.Secrets
{
    public class SecretsService : ISecretsService
    {
        private readonly IConfiguration _configuration;

        public SecretsService(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public string GetSecret(string secretName)
        {
            var secretValue = _configuration[$"Secrets:{secretName}"];

            if (string.IsNullOrEmpty(secretValue))
            {
                throw new KeyNotFoundException($"Secret '{secretName}' not found in secrets.json.");
            }

            return secretValue;
        }
    }
}

