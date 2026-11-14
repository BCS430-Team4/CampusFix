using CampusFix.Server.Data;
using CampusFix.Server.Data.Models;
using Microsoft.EntityFrameworkCore;

namespace CampusFix.Server.Endpoints;

public static class TicketEndpoints
{
    public static RouteGroupBuilder MapTicketEndpoints(this RouteGroupBuilder group)
    {
        // GET /api/tickets
        group.MapGet("/", async (AppDbContext db) =>
        {
            var tickets = await db.Tickets
                .Include(t => t.Comments)
                .OrderByDescending(t => t.CreatedAt)
                .ToListAsync();

            return Results.Ok(tickets.Select(t => t.ToDto()));
        });

        // GET /api/tickets/{id}
        group.MapGet("/{id}", async (string id, AppDbContext db) =>
        {
            var ticket = await db.Tickets
                .Include(t => t.Comments)
                .FirstOrDefaultAsync(t => t.Id == id);

            return ticket is null ? Results.NotFound() : Results.Ok(ticket.ToDto());
        });

        // POST /api/tickets
        group.MapPost("/", async (CreateTicketRequest req, AppDbContext db) =>
        {
            var ticket = new Ticket
            {
                Title = req.Title,
                Category = req.Category,
                Building = string.IsNullOrWhiteSpace(req.Building) ? "Not specified" : req.Building,
                Room = string.IsNullOrWhiteSpace(req.Room) ? "Not specified" : req.Room,
                Description = req.Description ?? ""
            };

            db.Tickets.Add(ticket);
            await db.SaveChangesAsync();

            return Results.Created($"/api/tickets/{ticket.Id}", ticket.ToDto());
        });

        // PATCH /api/tickets/{id}
        group.MapPatch("/{id}", async (string id, UpdateTicketRequest patch, AppDbContext db) =>
        {
            var ticket = await db.Tickets
                .Include(t => t.Comments)
                .FirstOrDefaultAsync(t => t.Id == id);

            if (ticket is null) return Results.NotFound();

            if (patch.Title is not null) ticket.Title = patch.Title;
            if (patch.Category is not null) ticket.Category = patch.Category;
            if (patch.Building is not null) ticket.Building = patch.Building;
            if (patch.Room is not null) ticket.Room = patch.Room;
            if (patch.Description is not null) ticket.Description = patch.Description;
            if (patch.Status is not null) ticket.Status = patch.Status;
            if (patch.Priority is not null) ticket.Priority = patch.Priority;
            if (patch.Technician is not null) ticket.Technician = patch.Technician;
            if (patch.Asset is not null) ticket.Asset = patch.Asset;

            ticket.UpdatedAt = DateTime.UtcNow;
            await db.SaveChangesAsync();

            return Results.Ok(ticket.ToDto());
        });

        // DELETE /api/tickets/{id}
        group.MapDelete("/{id}", async (string id, AppDbContext db) =>
        {
            var ticket = await db.Tickets.FindAsync(id);
            if (ticket is null) return Results.NotFound();

            db.Tickets.Remove(ticket);
            await db.SaveChangesAsync();

            return Results.NoContent();
        });

        // POST /api/tickets/reset (Resets to initial demo data)
        group.MapPost("/reset", async (AppDbContext db) =>
        {
            await SeedDemoDataAsync(db, forceReset: true);
            return Results.Ok(new { message = "Demo data reset" });
        });

        return group;
    }

    public static async Task SeedDemoDataAsync(AppDbContext db, bool forceReset = false)
    {
        if (forceReset)
        {
            db.TicketComments.RemoveRange(db.TicketComments);
            db.Tickets.RemoveRange(db.Tickets);
            await db.SaveChangesAsync();
            await db.Database.ExecuteSqlRawAsync("""ALTER SEQUENCE "TicketNumberSeq" RESTART WITH 1043;""");
        }
        else if (await db.Tickets.AnyAsync())
        {
            return;
        }

        var tickets = new List<Ticket>
        {
            new() { Id = "CF-0977", Title = "No wifi in study room", Category = "IT / Tech", Building = "Colleran Hall", Room = "Room 2C", Description = "Wifi signal drops constantly in the group study room.", Status = "Resolved", Priority = "Medium", Technician = "J. Delgado", Asset = "Access Point — Colleran 2C", CreatedAt = new DateTime(2026, 9, 1, 10, 0, 0, DateTimeKind.Utc), UpdatedAt = new DateTime(2026, 9, 4, 14, 0, 0, DateTimeKind.Utc) },
            new() { Id = "CF-0991", Title = "Jammed door, west entrance", Category = "Furniture", Building = "Gleeson Hall", Room = "Lobby", Description = "The west entrance door sticks and needs a hard shove to close.", Status = "Closed", Priority = "Low", Technician = "M. Torres", CreatedAt = new DateTime(2026, 9, 6, 9, 0, 0, DateTimeKind.Utc), UpdatedAt = new DateTime(2026, 9, 9, 11, 0, 0, DateTimeKind.Utc) },
            new() {
                Id = "CF-1029", Title = "Leaking sink", Category = "Plumbing", Building = "Roosevelt Hall", Room = "Room 3B",
                Description = "Water is pooling under the sink in the second-floor bathroom. Getting worse over the past two days — floor near the door is wet by midday.",
                Status = "In progress", Priority = "Medium", Technician = "M. Torres", Asset = "Sink Unit — Roosevelt 3B",
                CreatedAt = new DateTime(2026, 9, 9, 8, 30, 0, DateTimeKind.Utc), UpdatedAt = new DateTime(2026, 9, 13, 10, 15, 0, DateTimeKind.Utc),
                Comments =
                [
                    new TicketComment { TicketId = "CF-1029", Author = "M. Torres", Role = "Technician", Body = "Heading over this afternoon — can you confirm the bathroom is unlocked during that time?", CreatedAt = new DateTime(2026, 9, 12, 15, 40, 0, DateTimeKind.Utc) },
                    new TicketComment { TicketId = "CF-1029", Author = "Aneudys Garcia", Role = "You", Body = "Yes, it's open until 8pm on weekdays.", CreatedAt = new DateTime(2026, 9, 12, 16, 2, 0, DateTimeKind.Utc) },
                    new TicketComment { TicketId = "CF-1029", Author = "M. Torres", Role = "Technician", Body = "Found the source — replacing a worn pipe fitting. Should be done by end of day.", CreatedAt = new DateTime(2026, 9, 13, 10, 15, 0, DateTimeKind.Utc) }
                ]
            },
            new() { Id = "CF-1038", Title = "Projector won't turn on", Category = "IT / Tech", Building = "Nold Hall", Room = "Room 118", Description = "The ceiling projector doesn't respond to the remote or the wall panel.", Status = "Assigned", Priority = "Low", Technician = "J. Delgado", Asset = "Projector — Nold 118", CreatedAt = new DateTime(2026, 9, 14, 13, 0, 0, DateTimeKind.Utc), UpdatedAt = new DateTime(2026, 9, 15, 9, 0, 0, DateTimeKind.Utc) },
            new() { Id = "CF-1042", Title = "Flickering lights in lab", Category = "Electrical", Building = "Lupton Hall", Room = "Room 204", Description = "The overhead lights near the back row flicker on and off every few minutes during class.", Status = "Open", CreatedAt = new DateTime(2026, 9, 16, 11, 0, 0, DateTimeKind.Utc), UpdatedAt = new DateTime(2026, 9, 16, 11, 0, 0, DateTimeKind.Utc) }
        };

        db.Tickets.AddRange(tickets);
        await db.SaveChangesAsync();
    }
}

public record CreateTicketRequest(string Title, string Category, string? Building, string? Room, string? Description);
public record UpdateTicketRequest(string? Title, string? Category, string? Building, string? Room, string? Description, string? Status, string? Priority, string? Technician, string? Asset);
