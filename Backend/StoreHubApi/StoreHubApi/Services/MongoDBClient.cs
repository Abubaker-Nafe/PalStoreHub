using MongoDB.Driver;
using Microsoft.Extensions.Options;
using StoreHubApi.Models;

namespace StoreHubApi.Services
{
    public class MongoDBClient(IOptions<MongoDBSettings> mongoDBSettings)
    {
        private readonly MongoClient _client = new(mongoDBSettings.Value.ConnectionURI);

        public IMongoDatabase GetDatabase(string databaseName)
        {
            return _client.GetDatabase(databaseName);
        }

    }
}
