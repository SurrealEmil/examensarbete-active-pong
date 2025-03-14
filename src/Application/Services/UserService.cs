using Application.DTOs.UserDTOs;
using Application.Interfaces;
using Domain.DbInterfaces;
using Domain.Entities;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace Application.Services
{
    public class UserService : IUserService
    {
        private readonly IUserRepository _userRepository;
        private static readonly Dictionary<string, DateTime> _activePlayers = new();

        public UserService(IUserRepository userRepository)
        {
            _userRepository = userRepository;
        }

        public async Task<UserDto?> RegisterUser(string username, string email)
        {
            username = username.ToLower();
            email = email.ToLower();

            // Validate input
            if (!IsValidEmail(email))
                throw new ArgumentException("Invalid email format.");

            if (!IsValidUsername(username))
                throw new ArgumentException("Invalid username format. Usernames must be 3-20 characters long and contain only letters, numbers, and underscores.");

            // Ensure email and username are not already taken
            if (await _userRepository.GetUserByEmail(email) != null)
                throw new ArgumentException("Email is already in use.");

            if (await _userRepository.GetUserByUsername(username) != null)
                throw new ArgumentException("Username is already in use.");

            // Generate User ID and Unique QR Code
            var userId = Guid.NewGuid().ToString();
            string qrCodeIdentifier = await GenerateUniqueQrCode();

            // Create new User entity
            var user = new User(userId, username, email, qrCodeIdentifier, false);
            await _userRepository.AddUser(user);

            return new UserDto(user);
        }

        public async Task<UserDto?> GetUserById(string userId)
        {
            var user = await _userRepository.GetUserById(userId);
            return user != null ? new UserDto(user) : null;
        }

        public async Task<UserDto?> GetUserByEmail(string email)
        {
            email = email.ToLower();

            var user = await _userRepository.GetUserByEmail(email);
            return user != null ? new UserDto(user) : null;
        }

        public async Task<UserDto?> GetUserByQrCode(string qrCode)
        {
            var user = await _userRepository.GetUserByQrCode(qrCode);
            if (user == null) return null;

            // Remove expired users before adding a new one
            RemoveExpiredUsers();

            // Prevent duplicate scan
            if (_activePlayers.ContainsKey(user.UserId))
                throw new InvalidOperationException("User is already in a game.");

            _activePlayers[user.UserId] = DateTime.UtcNow;
            return new UserDto(user);
        }

        public async Task<List<UserDto>> GetAllUsers()
        {
            var users = await _userRepository.GetAllUsers();
            return users.Select(user => new UserDto(user)).ToList();
        }

        public async Task<UserDto?> UpdateUser(string userId, string username, string email)
        {
            username = username.ToLower();
            email = email.ToLower();

            var user = await _userRepository.GetUserById(userId);
            if (user == null)
                return null;

            // Validate and update email
            if (!string.IsNullOrEmpty(email))
            {
                if (!IsValidEmail(email))
                    throw new ArgumentException("Invalid email format.");

                var existingUser = await _userRepository.GetUserByEmail(email);
                if (existingUser != null && existingUser.UserId != userId)
                    throw new ArgumentException("Email is already in use.");

                user.SetEmail(email);
            }

            // Validate and update username
            if (!string.IsNullOrEmpty(username))
            {
                if (!IsValidUsername(username))
                    throw new ArgumentException("Invalid username format. Usernames must be 3-20 characters long and contain only letters, numbers, and underscores.");

                var existingUser = await _userRepository.GetUserByUsername(username);
                if (existingUser != null && existingUser.UserId != userId)
                    throw new ArgumentException("Username is already in use.");

                user.SetUsername(username);
            }

            await _userRepository.UpdateUser(user);
            return new UserDto(user);
        }

        public async Task DeleteUser(string userId)
        {
            var user = await _userRepository.GetUserById(userId);
            if (user == null)
                throw new ArgumentException("User not found.");

            await _userRepository.DeleteUser(userId);
        }


        //TODO: Move to handler or simular
        private void RemoveExpiredUsers()
        {
            var expirationTime = TimeSpan.FromMinutes(10); // Adjust the time as needed
            var now = DateTime.UtcNow;

            // Find users whose session has expired
            var expiredUsers = _activePlayers
                .Where(entry => now - entry.Value > expirationTime)
                .Select(entry => entry.Key)
                .ToList();

            // Remove them from active list
            foreach (var userId in expiredUsers)
            {
                _activePlayers.Remove(userId);
            }
        }

        public void RemoveUserFromActiveList(string userId)
        {
            _activePlayers.Remove(userId);
        }

        private bool IsValidEmail(string email)
        {
            var emailRegex = new Regex(@"^[^@\s]+@[^@\s]+\.[^@\s]+$", RegexOptions.IgnoreCase);
            return emailRegex.IsMatch(email);
        }

        private bool IsValidUsername(string username)
        {
            var usernameRegex = new Regex(@"^[a-zA-Z0-9_]{3,20}$", RegexOptions.IgnoreCase);
            return usernameRegex.IsMatch(username);
        }

        private async Task<string> GenerateUniqueQrCode()
        {
            Random random = new Random();
            string newQrCode;
            bool exists;

            do
            {
                newQrCode = random.Next(100000, 999999).ToString(); // Generate a 6-digit number
                exists = await _userRepository.QrCodeExists(newQrCode);
            } while (exists); // Loop until we get a unique number

            return newQrCode;
        }
    }
}
