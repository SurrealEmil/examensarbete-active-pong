using Domain.Entities;
using System.Collections.Generic;
using Xunit;

namespace Domain.Tests.Entities
{
    public class UserLeaderboardTests
    {
        [Fact]
        public void Constructor_ShouldInitializeWithDefaultValues()
        {
            // Act
            var userLeaderboard = new UserLeaderboard();

            // Assert
            Assert.NotNull(userLeaderboard.GameStats);
            Assert.Empty(userLeaderboard.GameStats); // Should start empty
            Assert.Equal(string.Empty, userLeaderboard.UserId);
            Assert.Equal(string.Empty, userLeaderboard.Username);
            Assert.Equal(string.Empty, userLeaderboard.Email);
            Assert.Equal(string.Empty, userLeaderboard.QrCodeIdentifier);
        }

        [Fact]
        public void CanAddGameStats()
        {
            // Arrange
            var userLeaderboard = new UserLeaderboard { UserId = "123", Username = "PlayerOne" };
            var gameStats = new GameStats { GameMode = "Pong", Rank = 1, BestScore = 300 };

            // Act
            userLeaderboard.GameStats.Add(gameStats);

            // Assert
            Assert.Single(userLeaderboard.GameStats);
            Assert.Equal("Pong", userLeaderboard.GameStats[0].GameMode);
            Assert.Equal(1, userLeaderboard.GameStats[0].Rank);
            Assert.Equal(300, userLeaderboard.GameStats[0].BestScore);
        }

        [Fact]
        public void CanUpdateExistingGameStats()
        {
            // Arrange
            var userLeaderboard = new UserLeaderboard { UserId = "123", Username = "PlayerOne" };
            var gameStats = new GameStats { GameMode = "Pong", Rank = 2, BestScore = 200 };
            userLeaderboard.GameStats.Add(gameStats);

            // Act
            userLeaderboard.GameStats[0].Rank = 1;
            userLeaderboard.GameStats[0].BestScore = 400;

            // Assert
            Assert.Equal(1, userLeaderboard.GameStats[0].Rank);
            Assert.Equal(400, userLeaderboard.GameStats[0].BestScore);
        }
    }
}
