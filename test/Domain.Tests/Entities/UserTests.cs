using Domain.Entities;
using Xunit;

namespace Domain.Tests.Entities
{
    public class UserTests
    {
        [Fact]
        public void Constructor_ShouldSetPropertiesCorrectly()
        {
            // Arrange
            var userId = "123";
            var username = "TestUser";
            var email = "Test@Email.com";
            var qrCode = "QR123";
            var isAdmin = true;

            // Act
            var user = new User(userId, username, email, qrCode, isAdmin);

            // Assert
            Assert.Equal(userId, user.UserId);
            Assert.Equal(userId, user.PartitionKey); // Ensures partition key consistency
            Assert.Equal("testuser", user.Username); // Username should be stored in lowercase
            Assert.Equal("test@email.com", user.Email); // Email should be stored in lowercase
            Assert.Equal(qrCode, user.QrCodeIdentifier);
            Assert.True(user.IsAdmin);
        }

        [Fact]
        public void SetUsername_ShouldUpdateUsername_ToLowercase()
        {
            // Arrange
            var user = new User("123", "OldName", "old@email.com", "QR123", false);

            // Act
            user.SetUsername("NewUser");

            // Assert
            Assert.Equal("newuser", user.Username); // Should be in lowercase
        }

        [Fact]
        public void SetUsername_ShouldNotUpdate_WhenEmpty()
        {
            // Arrange
            var user = new User("123", "ValidUser", "valid@email.com", "QR123", false);

            // Act
            user.SetUsername("");

            // Assert
            Assert.Equal("validuser", user.Username); // Should remain unchanged
        }

        [Fact]
        public void SetEmail_ShouldUpdateEmail_ToLowercase()
        {
            // Arrange
            var user = new User("123", "user", "old@email.com", "QR123", false);

            // Act
            user.SetEmail("NEW@Email.Com");

            // Assert
            Assert.Equal("new@email.com", user.Email); // Should be in lowercase
        }

        [Fact]
        public void SetEmail_ShouldNotUpdate_WhenEmpty()
        {
            // Arrange
            var user = new User("123", "user", "valid@email.com", "QR123", false);

            // Act
            user.SetEmail("");

            // Assert
            Assert.Equal("valid@email.com", user.Email); // Should remain unchanged
        }
    }
}

