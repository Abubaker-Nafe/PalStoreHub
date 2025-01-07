using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using MongoDB.Bson;
using MongoDB.Driver;
using StoreHubApi.Models;

namespace StoreHubApi.Services
{
    public class UserDataProvider
    {
        private readonly IMongoCollection<User> _UserCollection;
        private const string UserCollectionName = "Users";
        public UserDataProvider(MongoDBClient mongoDBClient, IOptions<MongoDBSettings> mongoDBSettings)
        {
            IMongoDatabase database = mongoDBClient.GetDatabase(mongoDBSettings.Value.DatabaseName);
            _UserCollection = database.GetCollection<User>(UserCollectionName);
        }

        public async Task<List<User>> GetAllUsersAsync()
        {
            // Fetch all users from the collection
            return await _UserCollection.Find(new BsonDocument()).ToListAsync();
        }

        public async Task<User?> GetSpecificUser(string username)
        {
            var filter = Builders<User>.Filter.Eq(u => u.Username, username);
            return await _UserCollection.Find(filter).FirstOrDefaultAsync();
        }

        public async Task CreateNewUser([FromBody] User user)
        {
            // Ensure Username is set as the _id
            if (string.IsNullOrEmpty(user.Username))
            {
                throw new InvalidOperationException("Username is required.");
            }

            // Check if the Username already exists
            var existingUser = await GetByUsernameAsync(user.Username);
            if (existingUser != null)
            {
                throw new InvalidOperationException("Username already exists.");
            }

            user.CreatedAt = DateTime.UtcNow;
            user.UpdatedAt = DateTime.UtcNow;

            // Validate base64 image
            if (!string.IsNullOrEmpty(user.Profile.Image) && !IsBase64String(user.Profile.Image))
            {
                throw new InvalidOperationException("Invalid base64 image format.");
            }

            await _UserCollection.InsertOneAsync(user);
        }

        public async Task UpdateUserPartial(string username, User updatedFields)
        {
            // Building the update definition dynamically
            var updateDefinition = new List<UpdateDefinition<User>>();

            // Checking and adding each field for update by checking the non-NULL values, we update the non-NULL values.
            if (!string.IsNullOrEmpty(updatedFields.Email))
            {
                var existingEmailUser = await GetByEmailAsync(updatedFields.Email);
                if (existingEmailUser != null && existingEmailUser.Username != username)
                {
                    throw new InvalidOperationException("Email is already in use.");
                }
                updateDefinition.Add(Builders<User>.Update.Set(u => u.Email, updatedFields.Email));
            }

            if (!string.IsNullOrEmpty(updatedFields.PasswordHash))
            {
                updateDefinition.Add(Builders<User>.Update.Set(u => u.PasswordHash, updatedFields.PasswordHash));
            }

            if (!string.IsNullOrEmpty(updatedFields.Phone))
            {
                updateDefinition.Add(Builders<User>.Update.Set(u => u.Phone, updatedFields.Phone));
            }

            if (updatedFields.Roles != null && updatedFields.Roles.Any())
            {
                updateDefinition.Add(Builders<User>.Update.Set(u => u.Roles, updatedFields.Roles));
            }

            if (updatedFields.Profile != null)
            {
                if (!string.IsNullOrEmpty(updatedFields.Profile.FirstName))
                {
                    updateDefinition.Add(Builders<User>.Update.Set(u => u.Profile.FirstName, updatedFields.Profile.FirstName));
                }

                if (!string.IsNullOrEmpty(updatedFields.Profile.LastName))
                {
                    updateDefinition.Add(Builders<User>.Update.Set(u => u.Profile.LastName, updatedFields.Profile.LastName));
                }

                if (!string.IsNullOrEmpty(updatedFields.Profile.Location))
                {
                    updateDefinition.Add(Builders<User>.Update.Set(u => u.Profile.Location, updatedFields.Profile.Location));
                }

                if (!string.IsNullOrEmpty(updatedFields.Profile.Bio))
                {
                    updateDefinition.Add(Builders<User>.Update.Set(u => u.Profile.Bio, updatedFields.Profile.Bio));
                }

                if (!string.IsNullOrEmpty(updatedFields.Profile.Image))
                {
                    if (!IsBase64String(updatedFields.Profile.Image))
                    {
                        throw new InvalidOperationException("Invalid base64 image format.");
                    }
                    updateDefinition.Add(Builders<User>.Update.Set(u => u.Profile.Image, updatedFields.Profile.Image));
                }
            }

            // Update the updatedAt timestamp
            updateDefinition.Add(Builders<User>.Update.Set(u => u.UpdatedAt, DateTime.UtcNow));

            // Combine all updates into a single operation
            var combinedUpdate = Builders<User>.Update.Combine(updateDefinition);

            // Perform the update
            var result = await _UserCollection.UpdateOneAsync(Builders<User>.Filter.Eq(u => u.Username, username), combinedUpdate);

            if (result.ModifiedCount == 0)
            {
                throw new InvalidOperationException("No updates were made. The user may not exist.");
            }
        }

        public async Task DeleteUser(string username)
        {
            var filter = Builders<User>.Filter.Eq(u => u.Username, username);
            await _UserCollection.DeleteOneAsync(filter);
        }

        public async Task<User> GetByUsernameAsync(string username)
        {
            FilterDefinition<User> filter = Builders<User>.Filter.Eq(o => o.Username, username);
            var user = await _UserCollection.Find(filter).FirstOrDefaultAsync();
            return user;
        }

        // To validate if the Email already exists
        public async Task<User> GetByEmailAsync(string email)
        {
            FilterDefinition<User> filter = Builders<User>.Filter.Eq(o => o.Email, email);
            var user = await _UserCollection.Find(filter).FirstOrDefaultAsync();
            return user;
        }

        public bool IsBase64String(string base64)
        {
            if (string.IsNullOrEmpty(base64)) return true; // Allow empty base64 strings
            Span<byte> buffer = new Span<byte>(new byte[base64.Length]);
            return Convert.TryFromBase64String(base64, buffer, out _);
        }

    }
}