using Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Interfaces
{
    public interface IUserService
    {
        Task<User?> GetUserById(string userId);
        Task<List<User>> GetAllUsers();
        Task<User> RegisterUser(string username, string email);
        Task DeleteUser(string userId);
    }
}
