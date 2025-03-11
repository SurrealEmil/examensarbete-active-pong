using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Entities
{
    public class PlayerInfo
    {
        public string UserId { get; private set; }
        public string Username { get; private set; }

        public PlayerInfo(string userId, string username)
        {
            if (string.IsNullOrWhiteSpace(userId))
                throw new ArgumentException("UserId cannot be empty.", nameof(userId));

            if (string.IsNullOrWhiteSpace(username))
                throw new ArgumentException("Username cannot be empty.", nameof(username));

            UserId = userId;
            Username = username;
        }
    }
}
