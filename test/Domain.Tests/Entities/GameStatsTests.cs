using Domain.Entities;
using Xunit;

namespace Domain.Tests.Entities
{
    public class GameStatsTests
    {
        [Fact]
        public void Constructor_ShouldInitializeWithDefaultValues()
        {
            // Act
            var gameStats = new GameStats();

            // Assert
            Assert.Equal("N/A", gameStats.GameMode);
            Assert.Equal(0, gameStats.Rank);
            Assert.Equal(0, gameStats.BestScore);
        }

        [Fact]
        public void CanUpdateGameStats()
        {
            // Arrange
            var gameStats = new GameStats();

            // Act
            gameStats.GameMode = "Arcade";
            gameStats.Rank = 1;
            gameStats.BestScore = 500;

            // Assert
            Assert.Equal("Arcade", gameStats.GameMode);
            Assert.Equal(1, gameStats.Rank);
            Assert.Equal(500, gameStats.BestScore);
        }
    }
}
