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

        public async Task<User?> GetUserById(string userId)
        {
            return await _userRepository.GetUserById(userId);
        }

        public async Task<List<User>> GetAllUsers()
        {
            return await _userRepository.GetAllUsers();
        }

        public async Task<User?> RegisterUser(string username, string email)
        {
            if (!IsValidEmail(email))
                throw new ArgumentException("Invalid email format.");

            if (!IsValidUsername(username))
                throw new ArgumentException("Invalid username format. Usernames must be 3-20 characters long and contain only letters, numbers, and underscores.");

            var existingEmailUser = await _userRepository.GetUserByEmail(email);
            if (existingEmailUser != null)
                throw new ArgumentException("Email is already in use.");

            var existingUsernameUser = await _userRepository.GetUserByUsername(username);
            if (existingUsernameUser != null)
                throw new ArgumentException("Username is already in use.");

            var userId = Guid.NewGuid().ToString();
            string qrCodeIdentifier = await GenerateUniqueQrCode();

            var user = new User(userId, username, email, qrCodeIdentifier, false);
            await _userRepository.AddUser(user);
            return user;
        }

        public async Task DeleteUser(string userId)
        {
            await _userRepository.DeleteUser(userId);
        }

        public async Task<User> GetUserByEmail(string email)
        {
            return await _userRepository.GetUserByEmail(email);
        }

        public async Task<User?> UpdateUser(string userId, string username, string email)
        {
            var user = await _userRepository.GetUserById(userId);
            if (user == null)
                return null; // ❌ User not found

            if (!string.IsNullOrEmpty(email))
            {
                if (!IsValidEmail(email))
                    throw new ArgumentException("Invalid email format.");

                var existingUser = await _userRepository.GetUserByEmail(email);
                if (existingUser != null && existingUser.UserId != userId)
                    throw new ArgumentException("Email is already in use.");

                user.SetEmail(email);
            }

            if (!string.IsNullOrEmpty(username))
            {
                if (!IsValidUsername(username))
                    throw new ArgumentException("Invalid username format. Usernames must be 3-20 characters long and contain only letters, numbers, and underscores.");

                var existingUser = await _userRepository.GetUserByUsername(username);
                if (existingUser != null && existingUser.UserId != userId)
                    throw new ArgumentException("Username is already in use.");

                user.SetUsername(username);
            }

            await _userRepository.UpdateUser(user); // ✅ Save changes
            return user;
        }

        public async Task<User?> GetUserByQrCode(string qrCode)
        {
            var user = await _userRepository.GetUserByQrCode(qrCode);
            if (user == null) return null;

            // Remove expired users
            RemoveExpiredUsers();

            // Check if user is already in a game
            if (_activePlayers.ContainsKey(user.UserId))
                return null; // ❌ Prevent duplicate scan

            // Add user with a timestamp
            _activePlayers[user.UserId] = DateTime.UtcNow;
            return user;
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
