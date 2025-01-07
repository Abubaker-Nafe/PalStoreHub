using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace StoreHubApi.Models
{
    public class Product
    {
        [BsonId, BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }

        [BsonElement("storeId")]
        public string StoreId { get; set; } = string.Empty;

        [BsonElement("productName")]
        public string ProductName { get; set; } = string.Empty;

        [BsonElement("description")]
        public string Description { get; set; } = string.Empty;

        [BsonElement("price")]
        public double? Price { get; set; } = 0.0;

        [BsonElement("image")]
        public string? Image { get; set; } = string.Empty;
    }
}
