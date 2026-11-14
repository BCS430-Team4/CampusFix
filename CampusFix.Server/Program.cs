using CampusFix.Server;
using CampusFix.Server.Data;
using CampusFix.Server.Endpoints;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.AddServiceDefaults();
builder.Services.AddProblemDetails();
builder.Services.AddOpenApi();

builder.AddNpgsqlDbContext<AppDbContext>("campusfix-dev");

builder.Services.AddAuthorization();
builder.Services.AddIdentityApiEndpoints<IdentityUser>()
    .AddEntityFrameworkStores<AppDbContext>();

var app = builder.Build();

app.UseExceptionHandler();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();

    using var scope = app.Services.CreateScope();
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    await db.Database.MigrateAsync();
}

app.MapDefaultEndpoints();

app.UseFileServer();

app.UseAuthentication();
app.UseAuthorization();

app.MapGroup("/api/auth").MapIdentityApi<IdentityUser>();
var ticketsGroup = app.MapGroup("/api/tickets");
ticketsGroup.MapTicketEndpoints();
ticketsGroup.MapGroup("/{ticketId}/comments").MapTicketCommentEndpoints();

app.Run();