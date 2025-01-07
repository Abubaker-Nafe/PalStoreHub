using Microsoft.AspNetCore.Mvc;
using MongoDB.Bson;
using StoreHubApi.Models;
using StoreHubApi.Services;
namespace StoreHubApi.Controllers
{
    [ApiController]
    [Route("api/user")]
    public class UserController(UserDataProvider userDataProvider, StoreDataProvider storeDataProvider) : ControllerBase
    {
        private readonly UserDataProvider _userDataProvider = userDataProvider;
        private readonly StoreDataProvider _storeDataProvider = storeDataProvider;

        [HttpGet("getAllUsers")]
        public async Task<IActionResult> GetProfiles()
        {
            try
            {
                // Fetch all users
                var users = await _userDataProvider.GetAllUsersAsync();

                // Exclude PasswordHash by setting it to null
                var sanitizedUsers = users.Select(user =>
                {
                    user.PasswordHash = null;
                    return user;
                }).ToList();

                return Ok(sanitizedUsers);
            }
            catch (Exception ex)
            {
                // Return error response in case of failure
                return StatusCode(500, new { error = "An error occurred while fetching users.", details = ex.Message });
            }
        }

        [HttpGet("getUser/{username}")]
        public async Task<IActionResult> GetByUsername(string username)
        {
            var user = await _userDataProvider.GetSpecificUser(username);
            if (user == null)
            {
                return NotFound($"User with username '{username}' is not found.");
            }
            user.PasswordHash = null;
            return Ok(user);
        }

        [HttpGet("auth/login")]
        public async Task<IActionResult> Login(string username, string password)
        {
            if (string.IsNullOrWhiteSpace(username) || string.IsNullOrWhiteSpace(password))
            {
                return BadRequest("Username and password must be provided.");
            }

            var user = await _userDataProvider.GetByUsernameAsync(username);
            if (user == null)
            {
                return NotFound("User with this username not found.");
            }

            if (user.PasswordHash == password)
            {
                user.PasswordHash = null;
                return Ok(user);
            }
            else
            {
                return Unauthorized("Incorrect username or password.");
            }
        }

        [HttpPost("auth/Signup")]
        public async Task<IActionResult> AddUser([FromBody] User user)
        {
            var existingUser = await _userDataProvider.GetByUsernameAsync(user.Username);
            if (existingUser != null)
            {
                return Conflict("Username already exists.");
            }
            var existingUser2 = await _userDataProvider.GetByEmailAsync(user.Email);
            if (existingUser2 != null)
            {
                return Conflict("Email already exists.");
            }

            // Validate base64 image
            if (!string.IsNullOrEmpty(user.Profile.Image) && !_userDataProvider.IsBase64String(user.Profile.Image))
            {
                return BadRequest("Invalid base64 image format.");
            }
            await _userDataProvider.CreateNewUser(user);
            return CreatedAtAction(nameof(GetByUsername), new { username = user.Username }, user.Profile);
        }

        [HttpPatch("updateUser/{username}")]
        public async Task<IActionResult> UpdateUserPartial(string username, [FromBody] User user)
        {
            try
            {
                await _userDataProvider.UpdateUserPartial(username, user);
                return Ok("User updated successfully.");
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

        [HttpDelete("deleteUser/{username}")]
        public async Task<IActionResult> Delete(string username)
        {
            var user = await _userDataProvider.GetSpecificUser(username);
            if (user == null)
            {
                return NotFound($"User with username '{username}' is not found.");
            }

            await _userDataProvider.DeleteUser(username);
            return Ok(user.Profile);
        }
        private string HashPassword(string password) => BCrypt.Net.BCrypt.HashPassword(password);
    }
}
