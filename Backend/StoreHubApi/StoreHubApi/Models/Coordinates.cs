using System.ComponentModel.DataAnnotations;
using MongoDB.Bson.Serialization.Attributes;

namespace StoreHubApi.Models
{
    public class Coordinates
    {
        [BsonElement("latitude")]
        public double Latitude { get; set; } = 0.0;

        [BsonElement("longitude")]
        public double Longitude { get; set; } = 0.0;
    }
}
