using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Entities
{
    public class User
    {
        private Guid _userId;

        [JsonProperty("id")]
        public string UserId => _userId.ToString();

        public string PartitionKey => UserId;

        public string Username { get; private set; }
        public string Email { get; private set; }
        public string QrCode { get; private set; }
        public int MatchesPlayed { get; private set; }
        public bool IsAdmin { get; private set; }
        public string? JwtToken { get; private set; }

        [JsonConstructor]
        private User(string id, string username, string email, string qrCode, int matchesPlayed, bool isAdmin, string? jwtToken)
        {
            _userId = Guid.Parse(id);
            Username = username;
            Email = email;
            QrCode = qrCode;
            MatchesPlayed = matchesPlayed;
            IsAdmin = isAdmin;
            JwtToken = jwtToken;
        }

        public User(Guid userId, string username, string email, string qrCode, bool isAdmin)
        {
            _userId = userId;
            Username = username;
            Email = email;
            QrCode = qrCode;
            MatchesPlayed = 0;
            IsAdmin = isAdmin;
            JwtToken = null;
        }

        public void IncrementMatchesPlayed() => MatchesPlayed++;

        public void SetJwtToken(string token) => JwtToken = token;
    }

}
