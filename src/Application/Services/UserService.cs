using Application.Interfaces;
using Domain.DbInterfaces;
using Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
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

        public async Task<User> RegisterUser(string username, string email)
        {
            var userId = Guid.NewGuid().ToString();
            int qrCodeIdentifier = await GenerateUniqueQrCode();

            var user = new User(userId, username, email, qrCodeIdentifier, false);
            await _userRepository.AddUser(user);
            return user;
        }

        private async Task<int> GenerateUniqueQrCode()
        {
            Random random = new Random();
            int newQrCode;
            bool exists;

            do
            {
                newQrCode = random.Next(100000, 999999); // Generate a 6-digit number
                exists = await _userRepository.QrCodeExists(newQrCode);
            } while (exists); // Loop until we get a unique number

            return newQrCode;
        }


        public async Task DeleteUser(string userId)
        {
            await _userRepository.DeleteUser(userId);
        }
    }
}
