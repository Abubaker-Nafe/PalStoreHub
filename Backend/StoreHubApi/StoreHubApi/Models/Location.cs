using System.ComponentModel.DataAnnotations;
using MongoDB.Bson.Serialization.Attributes;

namespace StoreHubApi.Models
{
    public class Location
    {
        [BsonElement("address")]
        public string Address { get; set; } = string.Empty;

        [BsonElement("City")]
        public string City { get; set; } = string.Empty;

        [BsonElement("zipCode")]
        public string ZipCode { get; set; } = string.Empty;

        [BsonElement("coordinates")]
        public Coordinates Coordinates { get; set; } = new Coordinates();
    }
}
