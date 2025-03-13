using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.DTOs.UserDTOs
{
    public class UserDto
    {
        public string UserId { get; init; }
        public string Username { get; init; }
        public string Email { get; init; }
        public string QrCodeIdentifier { get; init; }
        public bool IsAdmin { get; init; }

        // Constructor for easier mapping
        public UserDto(Domain.Entities.User user)
        {
            UserId = user.UserId;
            Username = user.Username;
            Email = user.Email;
            QrCodeIdentifier = user.QrCodeIdentifier;
            IsAdmin = user.IsAdmin;
        }
    }
}
