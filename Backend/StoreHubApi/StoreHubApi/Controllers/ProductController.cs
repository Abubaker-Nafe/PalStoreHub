using Microsoft.AspNetCore.Mvc;
using MongoDB.Bson;
using MongoDB.Driver;
using StoreHubApi.Models;
using StoreHubApi.Services;

namespace StoreHubApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProductController : ControllerBase
    {
        private readonly ProductDataProvider _productService;

        public ProductController(ProductDataProvider productService)
        {
            _productService = productService;
        }

        // Get all products for a specific store
        [HttpGet("getStoreProducts/{storeId}")]
        public async Task<IActionResult> GetProductsByStoreId(string storeId)
        {
            var products = await _productService.GetProductsByStoreIdAsync(storeId);
            return Ok(products);
        }

        [HttpGet("SearchProducts")]
        public async Task<IActionResult> SearchProducts([FromQuery] string storeId, [FromQuery] string productName = "",
                        [FromQuery] double? minPrice = null, [FromQuery] double? maxPrice = null, [FromQuery] string sortBy = "productName")
        {
            if (string.IsNullOrWhiteSpace(storeId))
            {
                return BadRequest("Store ID cannot be empty.");
            }

            var filter = Builders<Product>.Filter.Eq(p => p.StoreId, storeId);

            // Add productName filter if given by user
            if (!string.IsNullOrWhiteSpace(productName))
            {
                filter = Builders<Product>.Filter.And(
                    filter, Builders<Product>.Filter.Regex("productName", new BsonRegularExpression(productName, "i")));
            }

            // Add price range filters if givenn
            if (minPrice.HasValue)
            {
                filter = Builders<Product>.Filter.And(filter, Builders<Product>.Filter.Gte(p => p.Price, minPrice.Value));
            }
            if (maxPrice.HasValue)
            {
                filter = Builders<Product>.Filter.And(filter, Builders<Product>.Filter.Lte(p => p.Price, maxPrice.Value));
            }

            // Apply sorting whether it's ascending or descending ( use '-' for descending) (default is ascending)
            var sort = Builders<Product>.Sort.Ascending(sortBy);
            if (sortBy.StartsWith("-"))
            {
                sortBy = sortBy.TrimStart('-');
                sort = Builders<Product>.Sort.Descending(sortBy);
            }

            // Fetch all matching products
            var products = await _productService.SearchProductsAsync(filter, sort);

            return Ok(products);
        }

        // Create a new product for a specific store
        [HttpPost("PostProduct/product")]
        public async Task<IActionResult> CreateProduct([FromBody] Product product)
        {
            // Validate base64 image
            if (!string.IsNullOrEmpty(product.Image) && !_productService.IsBase64String(product.Image))
            {
                return BadRequest("Invalid base64 image format.");
            }

            await _productService.CreateAsync(product);

            return CreatedAtRoute(new { productId = product.Id }, product);
        }

        [HttpPatch("UpdateProduct/{productId}")]
        public async Task<IActionResult> updateProduct(string productId, [FromBody] Product product)
        {
            try
            {
                await _productService.UpdateProductPartial(productId, product);
                return Ok("Product updated successfully.");
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
        // Delete a product by product ID
        [HttpDelete("DeleteProduct/{productId}")]
        public async Task<IActionResult> DeleteProduct(string productId)
        {
            var product = await _productService.GetSpecificProductAsync(productId);
            if (product == null)
            {
                return NotFound();
            }

            await _productService.DeleteProductAsync(productId);
            return NoContent();
        }
    }
}
