using CampusFix.Server.Data;
using CampusFix.Server.Data.Models;
using Microsoft.EntityFrameworkCore;

namespace CampusFix.Server.Endpoints;

public static class TicketCommentEndpoints
{
    public static RouteGroupBuilder MapTicketCommentEndpoints(this RouteGroupBuilder group)
    {
        // GET /api/tickets/{ticketId}/comments
        group.MapGet("/", async (string ticketId, AppDbContext db) =>
        {
            var exists = await db.Tickets.AnyAsync(t => t.Id == ticketId);
            if (!exists) return Results.NotFound();

            var comments = await db.TicketComments
                .Where(c => c.TicketId == ticketId)
                .OrderBy(c => c.CreatedAt)
                .ToListAsync();

            return Results.Ok(comments.Select(c => c.ToDto()));
        });

        // POST /api/tickets/{ticketId}/comments
        group.MapPost("/", async (string ticketId, AddCommentRequest req, AppDbContext db) =>
        {
            var ticket = await db.Tickets
                .Include(t => t.Comments)
                .FirstOrDefaultAsync(t => t.Id == ticketId);

            if (ticket is null) return Results.NotFound();

            var comment = new TicketComment
            {
                TicketId = ticket.Id,
                Author = string.IsNullOrWhiteSpace(req.Author) ? "Aneudys Garcia" : req.Author,
                Role = string.IsNullOrWhiteSpace(req.Role) ? "You" : req.Role,
                Body = req.Body
            };

            ticket.Comments.Add(comment);
            ticket.UpdatedAt = DateTime.UtcNow;
            await db.SaveChangesAsync();

            return Results.Created($"/api/tickets/{ticket.Id}/comments/{comment.Id}", ticket.ToDto());
        });

        // PATCH /api/tickets/{ticketId}/comments/{commentId}
        group.MapPatch("/{commentId:int}", async (string ticketId, int commentId, UpdateCommentRequest req, AppDbContext db) =>
        {
            var comment = await db.TicketComments
                .FirstOrDefaultAsync(c => c.TicketId == ticketId && c.Id == commentId);

            if (comment is null) return Results.NotFound();

            comment.Body = req.Body;
            await db.SaveChangesAsync();

            return Results.Ok(comment.ToDto());
        });

        // DELETE /api/tickets/{ticketId}/comments/{commentId}
        group.MapDelete("/{commentId:int}", async (string ticketId, int commentId, AppDbContext db) =>
        {
            var comment = await db.TicketComments
                .FirstOrDefaultAsync(c => c.TicketId == ticketId && c.Id == commentId);

            if (comment is null) return Results.NotFound();

            db.TicketComments.Remove(comment);
            await db.SaveChangesAsync();

            return Results.NoContent();
        });

        return group;
    }
}

public record AddCommentRequest(string Body, string? Author = null, string? Role = null);
public record UpdateCommentRequest(string Body);
