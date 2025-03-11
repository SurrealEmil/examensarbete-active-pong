using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Xml.Serialization;

namespace Domain.Entities
{
    public class User
    {
        [JsonProperty("id")]  // Required by CosmosDB
        public string UserId { get; private set; }

        [JsonProperty("UserId")]  // Ensure this matches the container partition key
        public string PartitionKey => UserId;

        public string Username { get; private set; }
        public string Email { get; private set; }
        public int QrCodeIdentifier { get; private set; }
        public int MatchesPlayed { get; private set; }
        public bool IsAdmin { get; private set; }
        public string? JwtToken { get; private set; }

        public User(string userId, string username, string email, int qrCodeIdentifier, bool isAdmin)
        {
            UserId = userId;
            Username = username;
            Email = email;
            QrCodeIdentifier = qrCodeIdentifier;
            MatchesPlayed = 0;
            IsAdmin = isAdmin;
            JwtToken = null;
        }

        public void IncrementMatchesPlayed() => MatchesPlayed++;

        public void SetJwtToken(string token) => JwtToken = token;
    }
}
