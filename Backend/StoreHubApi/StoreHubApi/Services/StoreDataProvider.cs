using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using MongoDB.Bson;
using MongoDB.Driver;
using StoreHubApi.Models;

namespace StoreHubApi.Services
{
    public class StoreDataProvider
    {
        private readonly IMongoCollection<Store> _StoreCollection;
        private readonly UserDataProvider _storeOwnerDataProvider;
        private const string StoreCollectionName = "Stores";
        public StoreDataProvider(MongoDBClient mongoDBClient, IOptions<MongoDBSettings> mongoDBSettings, UserDataProvider storeOwnerDataProvider)
        {
            IMongoDatabase database = mongoDBClient.GetDatabase(mongoDBSettings.Value.DatabaseName);
            _storeOwnerDataProvider = storeOwnerDataProvider; // Injecting the StoreOwnerDataProvider
            _StoreCollection = database.GetCollection<Store>(StoreCollectionName);
        }

        /*Stores Functions*/
        public async Task<List<Store>> GetAsync()
        {
            return await _StoreCollection.Find(new BsonDocument()).ToListAsync();
        }

        public async Task<Store> GetSpecificAsync(string id)
        {
            FilterDefinition<Store> filter = Builders<Store>.Filter.Eq("Id", id);
            var store = await _StoreCollection.Find(filter).FirstOrDefaultAsync();
            return store; //returns null if the specific store is not found
        }

        public async Task CreateAsync(Store store)
        {
            if (string.IsNullOrEmpty(store.Id))//If it is invalid or not entered, it will be generated automaticly
            {
                store.Id = ObjectId.GenerateNewId().ToString();
            }

            if (store.OwnerName == null)
            {
                throw new InvalidOperationException("Cannot create store: StoreOwner Name must be inserted.");
            }

            // Check if the StoreOwner exists
            var storeOwnerExists = await _storeOwnerDataProvider.GetSpecificUser(store.OwnerName);
            if (storeOwnerExists == null)
            {
                throw new InvalidOperationException("Cannot create store: StoreOwner does not exist.");
            }

            if (!string.IsNullOrEmpty(store.Image) && !IsBase64String(store.Image))
            {
                throw new InvalidOperationException("Invalid base64 image format.");
            }
            await _StoreCollection.InsertOneAsync(store);
        }

        public async Task DeleteAsync(string id)
        {
            FilterDefinition<Store> filter = Builders<Store>.Filter.Eq("Id", id);
            await _StoreCollection.DeleteOneAsync(filter);
            return;
        }

        public async Task<List<Store>> GetClosestStoresAsync(Coordinates coordinates, int top)
        {
            var stores = await GetAsync();
            var specifiedStores = stores.Select(store => new
            {
                Store = store,
                Distance = CalculateDistance(coordinates, store.Location.Coordinates)
            }).OrderBy(x => x.Distance).Take(top).Select(x => x.Store).ToList();
            return specifiedStores;
        }

        /*Calculate distance*/
        private double CalculateDistance(Coordinates origin, Coordinates destination)
        {
            const double R = 6371; // Radius for Earth in KM
            var latDistance = DegreesToRadians(destination.Latitude - origin.Latitude);
            var lonDistance = DegreesToRadians(destination.Longitude - origin.Longitude);
            var a = Math.Sin(latDistance / 2) * Math.Sin(latDistance / 2) + Math.Cos(DegreesToRadians(origin.Latitude)) * Math.Cos(DegreesToRadians(destination.Latitude)) *
                    Math.Sin(lonDistance / 2) * Math.Sin(lonDistance / 2);
            var c = 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));
            return R * c; // Distance in KM
        }

        private double DegreesToRadians(double deg) => deg * (Math.PI / 180);

        public async Task<List<Store>> GetStoresByOwnerNameAsync(string ownerName)
        {
            FilterDefinition<Store> filter = Builders<Store>.Filter.Eq(s => s.OwnerName, ownerName);
            return await _StoreCollection.Find(filter).ToListAsync();
        }

        public bool IsBase64String(string base64)
        {
            if (string.IsNullOrEmpty(base64)) return true; // Allow empty base64 strings
            Span<byte> buffer = new Span<byte>(new byte[base64.Length]);
            return Convert.TryFromBase64String(base64, buffer, out _);
        }

        public async Task<List<Store>> SearchStoresByNameAsync(string storeName)
        {
            // Build a filter that searches only by name (case-insensitive)
            var filter = Builders<Store>.Filter.Regex("name", new BsonRegularExpression(storeName, "i"));

            return await _StoreCollection.Find(filter).ToListAsync();
        }

        public async Task UpdateStorePartial(string id, Store updatedFields)
        {
            // Building the update definition dynamically
            var updateDefinition = new List<UpdateDefinition<Store>>();

            // Checking and adding each field for update by checking the non-NULL values, we update the non-NULL values.
            if (!string.IsNullOrEmpty(updatedFields.Name))
            {
                updateDefinition.Add(Builders<Store>.Update.Set(u => u.Name, updatedFields.Name));
            }

            if (!string.IsNullOrEmpty(updatedFields.Email))
            {
                var existingEmailUser = await GetByEmailAsync(updatedFields.Email);
                if (existingEmailUser != null && existingEmailUser.Id != id)
                {
                    throw new InvalidOperationException("Email is already in use.");
                }

                updateDefinition.Add(Builders<Store>.Update.Set(u => u.Email, updatedFields.Email));
            }

            if (!string.IsNullOrEmpty(updatedFields.Image))
            {
                if (!IsBase64String(updatedFields.Image))
                {
                    throw new InvalidOperationException("Invalid base64 image format.");
                }
                updateDefinition.Add(Builders<Store>.Update.Set(u => u.Image, updatedFields.Image));
            }

            if (updatedFields.Location != null)
            {
                if (!string.IsNullOrEmpty(updatedFields.Location.Address))
                {
                    updateDefinition.Add(Builders<Store>.Update.Set(u => u.Location.Address, updatedFields.Location.Address));
                }

                if (!string.IsNullOrEmpty(updatedFields.Location.City))
                {
                    updateDefinition.Add(Builders<Store>.Update.Set(u => u.Location.City, updatedFields.Location.City));
                }

                if (updatedFields.Location.Coordinates != null)
                {
                    if (!Double.IsNaN(updatedFields.Location.Coordinates.Latitude))
                    {
                        updateDefinition.Add(Builders<Store>.Update.Set(u => u.Location.Coordinates.Latitude, updatedFields.Location.Coordinates.Latitude));
                    }

                    if (!Double.IsNaN(updatedFields.Location.Coordinates.Longitude))
                    {
                        updateDefinition.Add(Builders<Store>.Update.Set(u => u.Location.Coordinates.Longitude, updatedFields.Location.Coordinates.Longitude));
                    }
                }
            }

            // Combine all updates into a single operation
            var combinedUpdate = Builders<Store>.Update.Combine(updateDefinition);

            // Perform the update
            var result = await _StoreCollection.UpdateOneAsync(Builders<Store>.Filter.Eq(u => u.Id, id), combinedUpdate);

            if (result.ModifiedCount == 0)
            {
                throw new InvalidOperationException("No updates were made. The store may not exist.");
            }
        }

        // To validate if the Email already exists
        public async Task<Store> GetByEmailAsync(string email)
        {
            FilterDefinition<Store> filter = Builders<Store>.Filter.Eq(o => o.Email, email);
            var store = await _StoreCollection.Find(filter).FirstOrDefaultAsync();
            return store;
        }

        public async Task UpdateStoreRatingAsync(string storeId, double newRating)
        {
            // Fetch the existing store
            var store = await GetSpecificAsync(storeId);
            if (store == null)
            {
                throw new InvalidOperationException($"Store with ID {storeId} does not exist.");
            }

            // Update the rating and ratingCounter
            store.Rating = (store.Rating * store.ratingCounter + newRating) / (store.ratingCounter + 1);
            store.ratingCounter++;

            // Create update definitions
            var updateDefinition = Builders<Store>.Update
                .Set(s => s.Rating, store.Rating)
                .Set(s => s.ratingCounter, store.ratingCounter);

            // Update the store in the database
            var filter = Builders<Store>.Filter.Eq(s => s.Id, storeId);
            var result = await _StoreCollection.UpdateOneAsync(filter, updateDefinition);

            if (result.ModifiedCount == 0)
            {
                throw new InvalidOperationException("Failed to update store rating.");
            }
        }

        public async Task<List<Store>> GetByCity(String CityName)
        {
            FilterDefinition<Store> filter = Builders<Store>.Filter.Eq(s => s.Location.City, CityName);
            var Stores = await _StoreCollection.Find(filter).ToListAsync();
            return Stores;
        }

        public async Task<List<Store>> GetRecommendedStores(String cityname, int top)
        {
            var storesForCity = await GetByCity(cityname);
            if (storesForCity == null || !storesForCity.Any())
            {
                return storesForCity;
            }
            var recommendedStores = storesForCity.OrderByDescending(s => s.Rating).Take(top).ToList();
            return recommendedStores;
        }
    }
}