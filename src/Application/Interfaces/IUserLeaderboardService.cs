using Application.DTOs.UserLeaderboardDTOs;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Interfaces
{
    public interface IUserLeaderboardService
    {
        Task<UserLeaderboardDto?> GetUserLeaderboardInfo(string userId);
    }
}
