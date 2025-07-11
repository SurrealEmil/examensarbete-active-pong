﻿using Newtonsoft.Json;
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
        public string PartitionKey { get; private set; }

        public string Username { get; private set; }
        public string Email { get; private set; }
        public string QrCodeIdentifier { get; private set; }
        public bool IsAdmin { get; private set; }

        public User(string userId, string username, string email, string qrCodeIdentifier, bool isAdmin)
        {
            UserId = userId;
            PartitionKey = userId;
            Username = username.ToLower();
            Email = email.ToLower();
            QrCodeIdentifier = qrCodeIdentifier;
            IsAdmin = isAdmin;
        }

        public void SetUsername(string newUsername)
        {
            if (!string.IsNullOrEmpty(newUsername))
                Username = newUsername.ToLower();
        }

        public void SetEmail(string newEmail)
        {
            if (!string.IsNullOrEmpty(newEmail))
                Email = newEmail.ToLower();
        }
    }
}
