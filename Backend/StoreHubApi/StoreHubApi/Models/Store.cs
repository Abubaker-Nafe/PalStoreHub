using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace StoreHubApi.Models
{
    public class Store
    {
        [BsonId, BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }

        [BsonElement("name")]
        public string? Name { get; set; }

        [BsonElement("rating")]
        public double? Rating { get; set; } = 0.0;

        [BsonElement("location")]
        public Location Location { get; set; } = new Location();

        [BsonElement("email")]
        public string? Email { get; set; } = string.Empty;

        [BsonElement("ownerId")]
        public string? OwnerName { get; set; }

        [BsonElement("image")]
        public string? Image { get; set; } = string.Empty;

        [BsonElement("ratingcounter")]
        public int ratingCounter { get; set; }
    }
}