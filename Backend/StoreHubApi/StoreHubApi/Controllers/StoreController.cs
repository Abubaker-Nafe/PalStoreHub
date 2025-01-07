using Microsoft.AspNetCore.Mvc;
using MongoDB.Bson;
using StoreHubApi.Models;
using StoreHubApi.Services;

namespace StoreHubApi.Controllers
{
    [ApiController]
    [Route("api/stores")]
    public class StoreController(StoreDataProvider storeDataProvider) : ControllerBase
    {
        private readonly StoreDataProvider _storeDataProvider = storeDataProvider;

        [HttpGet("getStores")]
        public async Task<List<Store>> Get()
        {
            return await _storeDataProvider.GetAsync();
        }

        // Search for stores
        [HttpGet("SearchStores")]
        public async Task<ActionResult<List<Store>>> SearchStores([FromQuery] string name)
        {
            if (string.IsNullOrWhiteSpace(name))
            {
                return BadRequest("Store name cannot be empty.");
            }

            var stores = await _storeDataProvider.SearchStoresByNameAsync(name);

            if (stores == null || !stores.Any())
            {
                return NotFound("No stores found with the specified name.");
            }

            return Ok(stores);
        }

        [HttpGet("getStoreById/{id}")]
        public async Task<IActionResult> GetbyId(string id)
        {
            if (!ObjectId.TryParse(id, out var objectId)) //this function check if the id is a valic mongoDB id :)
            {
                return BadRequest("ID isn't Valid for DB tool!");
            }
            var store = await _storeDataProvider.GetSpecificAsync(id);
            if (store == null)
            {
                return NotFound($"Element with ID {id} not found");
            }
            else
            {
                return Ok(store);
            }
        }

        [HttpGet("/api/closetstores")]
        public async Task<List<Store>> GetClosestStores([FromQuery] Coordinates coordinates, int top) //@ I added it beacause the long is a keyword and to be the url as that required
        {
            return await _storeDataProvider.GetClosestStoresAsync(coordinates, top);
        }

        [HttpPatch("UpdateStore/{storeId}")]
        public async Task<IActionResult> Update(string storeId, [FromBody] Store store)
        {
            try
            {
                await _storeDataProvider.UpdateStorePartial(storeId, store);
                return Ok("Store updated successfully.");
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { error = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "An unexpected error occurred.", details = ex.Message });
            }
        }

        [HttpPost("postStore")]
        public async Task<IActionResult> Post([FromBody] Store store)
        {
            // Validate base64 image
            if (!string.IsNullOrEmpty(store.Image) && !_storeDataProvider.IsBase64String(store.Image))
            {
                return BadRequest("Invalid base64 image format.");
            }

            await _storeDataProvider.CreateAsync(store);
            return Ok(store);
        }

        [HttpDelete("deleteStore")]
        public async Task<IActionResult> Delete(string id)
        {
            if (!ObjectId.TryParse(id, out var objectId))
            {
                return BadRequest("ID isn't Valid for DB tool!");
            }
            var store = await _storeDataProvider.GetSpecificAsync(id);
            if (store == null)
            {
                return NotFound($"Element with ID {id} not found");
            }
            await _storeDataProvider.DeleteAsync(id);
            return NoContent();
        }

        [HttpGet("getStoreByOwnerName/{ownerName}")]
        public async Task<ActionResult<List<Store>>> GetByOwnerName(string ownerName)
        {
            var stores = await _storeDataProvider.GetStoresByOwnerNameAsync(ownerName);
            if (stores == null || !stores.Any())
            {
                return NotFound("No stores found for the given owner Name");
            }

            return Ok(stores);
        }

        [HttpPatch("updateRating/{storeId}")]
        public async Task<IActionResult> updateRating(string storeId, [FromQuery] double rating)
        {
            if (rating < 0 || rating > 5)
            {
                return BadRequest("Rating must be between 0 and 5.");
            }

            try
            {
                await _storeDataProvider.UpdateStoreRatingAsync(storeId, rating);
                return Ok("Store rating updated successfully.");
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { error = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "An unexpected error occurred.", details = ex.Message });
            }
        }

        [HttpGet("citystores")]
        public async Task<IActionResult> GetByCity([FromQuery] String cityname)
        {
            var Stores = await _storeDataProvider.GetByCity(cityname);
            if (Stores == null || !Stores.Any())
            {
                return StatusCode(204, $"No Stores in ${cityname} City");

            }
            return Ok(Stores);
        }

        [HttpGet("recommendedstores")]
        public async Task<IActionResult> GetRecommendedStores([FromQuery] String cityname, [FromQuery] int top)
        {
            var Stores = await _storeDataProvider.GetRecommendedStores(cityname, top);
            if (Stores == null || !Stores.Any())
            {
                return StatusCode(204, $"No Stores in ${cityname} City");
            }
            return Ok(Stores);
        }
    }
}