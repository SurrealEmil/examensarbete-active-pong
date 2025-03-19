using Domain.Interfaces;
using Microsoft.AspNetCore.SignalR;

namespace Infrastructure.SignalR
{
    public class LeaderboardHub : Hub, ILeaderboardUpdateService
    {
        public const string HubUrl = "/leaderboardhub";
        public async Task NotifyLeaderboardUpdated(string message)
        {
            await Clients.All.SendAsync("message");
        }
    }
}

