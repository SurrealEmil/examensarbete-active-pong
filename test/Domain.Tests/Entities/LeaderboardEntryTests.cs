using Domain.Entities;
using Xunit;

namespace Domain.Tests.Entities
{
    public class LeaderboardEntryTests
    {
        [Fact]
        public void Constructor_ShouldInitializeCorrectly()
        {
            // Arrange
            var entry = new LeaderboardEntry("1", "PlayerOne", 100, 1, "Pong");

            // Assert
            Assert.Equal("1", entry.UserId);
            Assert.Equal("PlayerOne", entry.Username);
            Assert.Equal(100, entry.BestScore);
            Assert.Equal(1, entry.Rank);
            Assert.Equal("Pong", entry.GameMode);
        }

        [Fact]
        public void UpdateScore_ShouldUpdate_WhenNewScoreIsHigher()
        {
            // Arrange
            var entry = new LeaderboardEntry("1", "PlayerOne", 100, 1, "Pong");

            // Act
            entry.UpdateScore(150);

            // Assert
            Assert.Equal(150, entry.BestScore);
        }

        [Fact]
        public void UpdateScore_ShouldNotUpdate_WhenNewScoreIsLower()
        {
            // Arrange
            var entry = new LeaderboardEntry("1", "PlayerOne", 100, 1, "Pong");

            // Act
            entry.UpdateScore(50);

            // Assert
            Assert.Equal(100, entry.BestScore); // Should not update
        }

        [Fact]
        public void UpdateRank_ShouldChangeRank()
        {
            // Arrange
            var entry = new LeaderboardEntry("1", "PlayerOne", 100, 1, "Pong");

            // Act
            entry.UpdateRank(2);

            // Assert
            Assert.Equal(2, entry.Rank);
        }

        [Fact]
        public void SetUsername_ShouldUpdateUsername()
        {
            // Arrange
            var entry = new LeaderboardEntry("1", "PlayerOne", 100, 1, "Pong");

            // Act
            entry.SetUsername("NewPlayer");

            // Assert
            Assert.Equal("NewPlayer", entry.Username);
        }
    }
}
