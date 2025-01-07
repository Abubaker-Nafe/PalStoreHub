using StoreHubApi.Models;
using StoreHubApi.Services;

var builder = WebApplication.CreateBuilder(args);

// Configure MongoDB and services
builder.Services.Configure<MongoDBSettings>(builder.Configuration.GetSection("MongoDB"));
builder.Services.AddSingleton<MongoDBClient>();
builder.Services.AddSingleton<StoreDataProvider>();
builder.Services.AddSingleton<UserDataProvider>();
builder.Services.AddSingleton<ProductDataProvider>();

// Add CORS policy
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontendOrigin", policy =>
    {
        // Allow request from local host and production
        policy.WithOrigins("http://localhost:5173", "https://palstorehub.azurewebsites.net")
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage();
}

app.UseSwagger();
app.UseSwaggerUI();

// Enable CORS
app.UseCors("AllowFrontendOrigin");

app.UseHttpsRedirection();

app.Use(async (context, next) =>
{
    var originalBodyStream = context.Response.Body;
    using var memoryStream = new MemoryStream();
    context.Response.Body = memoryStream;
    try
    {
        await next(); 
    }
    catch (Exception ex)
    {
        context.Response.StatusCode = StatusCodes.Status500InternalServerError;
        context.Response.ContentType = "text/plain";
        var errorMessage = "Status Code(500)A server error occurred. Please try again later.";
        var errorBytes = System.Text.Encoding.UTF8.GetBytes(errorMessage);
        await context.Response.Body.WriteAsync(errorBytes, 0, errorBytes.Length);
    }

    if (context.Response.StatusCode >= 500 && context.Response.StatusCode < 600)
     {
        context.Response.ContentType = "text/plain";
        var errorMessage = "A server error occurred. Please try again later.";
        var errorBytes = System.Text.Encoding.UTF8.GetBytes(errorMessage);
        context.Response.Body = originalBodyStream; // Reset the body to original stream
        await context.Response.Body.WriteAsync(errorBytes, 0, errorBytes.Length);
     }
    else
      {
        memoryStream.Seek(0, SeekOrigin.Begin);
        await memoryStream.CopyToAsync(originalBodyStream);
      }
   
});

// Map controllers
app.MapControllers();

app.Run();
