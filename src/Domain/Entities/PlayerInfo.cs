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
            UserId = userId;
            Username = username;
        }
    }
}
