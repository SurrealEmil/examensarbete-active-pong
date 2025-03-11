using Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.DbInterfaces
{
    public interface IUserRepository
    {
        Task<User?> GetUserById(string userId);
        Task<List<User>> GetAllUsers();
        Task AddUser(User user);
        Task DeleteUser(string userId);
        Task<bool> UserExists(string userId);
        Task<bool> QrCodeExists(int qrCode);
    }
}
