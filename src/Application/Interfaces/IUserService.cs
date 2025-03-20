using Application.DTOs.UserDTOs;
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
        Task<UserDto?> GetUserById(string userId);
        Task<List<UserDto>> GetAllUsers();
        Task<UserDto> RegisterUser(string username, string email);
        Task DeleteUser(string userId);
        Task<UserDto> GetUserByEmail(string email);
        Task<UserDto?> UpdateUser(string userId, string username, string email);
        Task<UserDto> GetUserByQrCode(string qrCode);
    }
}
