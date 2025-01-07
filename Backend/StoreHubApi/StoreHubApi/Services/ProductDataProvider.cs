using Microsoft.Extensions.Options;
using MongoDB.Bson;
using MongoDB.Driver;
using StoreHubApi.Models;

namespace StoreHubApi.Services
{
    public class ProductDataProvider
    {
        private readonly IMongoCollection<Product> _ProductCollection;
        private const string ProductCollectionName = "Products";

        public ProductDataProvider(MongoDBClient mongoDBClient, IOptions<MongoDBSettings> mongoDBSettings)
        {
            IMongoDatabase database = mongoDBClient.GetDatabase(mongoDBSettings.Value.DatabaseName);
            _ProductCollection = database.GetCollection<Product>(ProductCollectionName);
        }

        // Retrieve all products
        public async Task<List<Product>> GetAsync()
        {
            return await _ProductCollection.Find(new BsonDocument()).ToListAsync();
        }

        // Retrieve products for a specific store
        public async Task<List<Product>> GetProductsByStoreIdAsync(string storeId)
        {
            var filter = Builders<Product>.Filter.Eq(p => p.StoreId, storeId);
            return await _ProductCollection.Find(filter).ToListAsync();
        }

        // Retrieve a specific product by ID
        public async Task<Product> GetSpecificProductAsync(string productId)
        {
            var filter = Builders<Product>.Filter.Eq(p => p.Id, productId);
            return await _ProductCollection.Find(filter).FirstOrDefaultAsync();
        }

        // Add a new product
        public async Task CreateAsync(Product product)
        {
            if (string.IsNullOrEmpty(product.Id)) //If it is invalid or not entered, it will be generated automaticly
            {
                product.Id = ObjectId.GenerateNewId().ToString();
            }

            // Validate base64 image
            if (!string.IsNullOrEmpty(product.Image) && !IsBase64String(product.Image))
            {
                throw new InvalidOperationException("Invalid base64 image format.");
            }

            await _ProductCollection.InsertOneAsync(product);
        }

        // Delete a product by ID
        public async Task DeleteProductAsync(string id)
        {
            var filter = Builders<Product>.Filter.Eq(p => p.Id, id);
            await _ProductCollection.DeleteOneAsync(filter);
        }

        public bool IsBase64String(string base64)
        {
            if (string.IsNullOrEmpty(base64)) return true; // Allow empty base64 strings
            Span<byte> buffer = new Span<byte>(new byte[base64.Length]);
            return Convert.TryFromBase64String(base64, buffer, out _);
        }

        public async Task UpdateProductPartial(string productId, Product updatedFields)
        {
            // Building the update definition dynamically
            var updateDefinition = new List<UpdateDefinition<Product>>();

            // Checking and adding each field for update by checking the non-NULL values, we update the non-NULL values.
            if (!string.IsNullOrEmpty(updatedFields.ProductName))
            {
                updateDefinition.Add(Builders<Product>.Update.Set(u => u.ProductName, updatedFields.ProductName));
            }

            if (!string.IsNullOrEmpty(updatedFields.Description))
            {
                updateDefinition.Add(Builders<Product>.Update.Set(u => u.Description, updatedFields.Description));
            }

            if (updatedFields.Price != null)
            {
                updateDefinition.Add(Builders<Product>.Update.Set(u => u.Price, updatedFields.Price));
            }

            if (!string.IsNullOrEmpty(updatedFields.Image))
            {
                updateDefinition.Add(Builders<Product>.Update.Set(u => u.Image, updatedFields.Image));
            }

            // Combine all updates into a single operation
            var combinedUpdate = Builders<Product>.Update.Combine(updateDefinition);

            // Perform the update
            var result = await _ProductCollection.UpdateOneAsync(Builders<Product>.Filter.Eq(u => u.Id, productId), combinedUpdate);

            if (result.ModifiedCount == 0)
            {
                throw new InvalidOperationException("No updates were made. The product may not exist.");
            }

        }
        public async Task<List<Product>> SearchProductsAsync(FilterDefinition<Product> filter, SortDefinition<Product> sort)
        {
            return await _ProductCollection
                .Find(filter)
                .Sort(sort)
                .ToListAsync();
        }
    }
}
