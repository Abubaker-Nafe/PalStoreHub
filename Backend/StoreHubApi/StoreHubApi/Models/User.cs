using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace StoreHubApi.Models
{
    public class User
    {
        [BsonId]
        public string Username { get; set; } = string.Empty;

        [BsonElement("email")]
        public string Email { get; set; } = string.Empty;

        [BsonElement("passwordHash")]
        public string? PasswordHash { get; set; } = string.Empty;

        [BsonElement("phone")]
        public string Phone { get; set; } = string.Empty;

        [BsonElement("createdAt")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [BsonElement("updatedAt")]
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        [BsonElement("profile")]
        public Profile Profile { get; set; } = new Profile();

        [BsonElement("roles")]
        public List<string> Roles { get; set; } = new List<string> { "user" };

        [BsonElement("isActive")]
        public bool IsActive { get; set; } = true;

        [BsonElement("lastLogin")]
        public DateTime? LastLogin { get; set; }
    }

    public class Profile
    {
        [BsonElement("firstName")]
        public string FirstName { get; set; } = string.Empty;

        [BsonElement("lastName")]
        public string LastName { get; set; } = string.Empty;

        [BsonElement("bio")]
        public string Bio { get; set; } = string.Empty;

        [BsonElement("dob")]
        public DateTime? DateOfBirth { get; set; }

        [BsonElement("location")]
        public string Location { get; set; } = string.Empty;

        [BsonElement("image")]
        public string? Image { get; set; } = string.Empty;
    }
}
