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

        public async Task<User> GetUserByQrCode(string qrCode)
        {
            return await _userRepository.GetUserByQrCode(qrCode);
        }


        //TODO: Move IsValidEmail and IsValidUsername to handler or simular
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
    }
}
