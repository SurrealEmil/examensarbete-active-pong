using Domain.Entities;
using System.Collections.Generic;
using Xunit;

namespace Domain.Tests.Entities
{
    public class LeaderboardTests
    {
        [Fact]
        public void Constructor_ShouldInitializeCorrectly()
        {
            // Arrange
            var gameMode = "Pong";
            var entries = new List<LeaderboardEntry>
        {
            new LeaderboardEntry("1", "PlayerOne", 100, 1, gameMode),
            new LeaderboardEntry("2", "PlayerTwo", 200, 2, gameMode)
        };

            // Act
            var leaderboard = new Leaderboard(gameMode, entries);

            // Assert
            Assert.Equal(gameMode, leaderboard.GameMode);
            Assert.Equal(gameMode, leaderboard.LeaderboardId); // Should match GameMode
            Assert.Equal(2, leaderboard.Entries.Count);
        }

        [Fact]
        public void AddOrUpdateEntry_ShouldAddNewPlayer_WhenNotExists()
        {
            // Arrange
            var leaderboard = new Leaderboard("Pong", new List<LeaderboardEntry>());

            // Act
            leaderboard.AddOrUpdateEntry("1", "PlayerOne", 150);

            // Assert
            Assert.Single(leaderboard.Entries);
            Assert.Equal("1", leaderboard.Entries[0].UserId);
            Assert.Equal(150, leaderboard.Entries[0].BestScore);
        }

        [Fact]
        public void AddOrUpdateEntry_ShouldUpdateScore_WhenNewScoreIsHigher()
        {
            // Arrange
            var leaderboard = new Leaderboard("Pong", new List<LeaderboardEntry>
        {
            new LeaderboardEntry("1", "PlayerOne", 100, 1, "Pong")
        });

            // Act
            leaderboard.AddOrUpdateEntry("1", "PlayerOne", 200);

            // Assert
            Assert.Single(leaderboard.Entries);
            Assert.Equal(200, leaderboard.Entries[0].BestScore); // Score should update
        }

        [Fact]
        public void AddOrUpdateEntry_ShouldNotUpdateScore_WhenNewScoreIsLower()
        {
            // Arrange
            var leaderboard = new Leaderboard("Pong", new List<LeaderboardEntry>
        {
            new LeaderboardEntry("1", "PlayerOne", 200, 1, "Pong")
        });

            // Act
            leaderboard.AddOrUpdateEntry("1", "PlayerOne", 150);

            // Assert
            Assert.Single(leaderboard.Entries);
            Assert.Equal(200, leaderboard.Entries[0].BestScore); // Score should not change
        }

        [Fact]
        public void RecalculateRanks_ShouldSortEntriesByBestScore()
        {
            // Arrange
            var leaderboard = new Leaderboard("Pong", new List<LeaderboardEntry>
        {
            new LeaderboardEntry("1", "PlayerOne", 100, 0, "Pong"),
            new LeaderboardEntry("2", "PlayerTwo", 300, 0, "Pong"),
            new LeaderboardEntry("3", "PlayerThree", 200, 0, "Pong")
        });

            // Act
            leaderboard.AddOrUpdateEntry("4", "PlayerFour", 400); // New highest score

            // Assert
            Assert.Equal("4", leaderboard.Entries[0].UserId); // Highest score first
            Assert.Equal("2", leaderboard.Entries[1].UserId);
            Assert.Equal("3", leaderboard.Entries[2].UserId);
            Assert.Equal("1", leaderboard.Entries[3].UserId); // Lowest score last
            Assert.Equal(1, leaderboard.Entries[0].Rank);
            Assert.Equal(2, leaderboard.Entries[1].Rank);
            Assert.Equal(3, leaderboard.Entries[2].Rank);
            Assert.Equal(4, leaderboard.Entries[3].Rank);
        }
    }
}
