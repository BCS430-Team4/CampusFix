using System.Globalization;

namespace CampusFix.Server.Data.Models;

public class Ticket
{
    public string Id { get; set; } = null!;

    public required string Title { get; set; }
    public required string Category { get; set; }
    public string Building { get; set; } = "Not specified";
    public string Room { get; set; } = "Not specified";
    public string Description { get; set; } = "";

    public string Status { get; set; } = "Open";
    public string? Priority { get; set; }
    public string? Technician { get; set; }
    public string? Asset { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public string? CreatedByUserId { get; set; }

    public List<TicketComment> Comments { get; set; } = [];

    public object ToDto() => new
    {
        id = Id,
        title = Title,
        category = Category,
        building = Building,
        room = Room,
        description = Description,
        status = Status,
        priority = Priority,
        technician = Technician,
        asset = Asset,
        created = CreatedAt.ToString("MMM d, yyyy", CultureInfo.InvariantCulture),
        updated = UpdatedAt.ToString("MMM d, yyyy", CultureInfo.InvariantCulture),
        comments = Comments.OrderBy(c => c.CreatedAt).Select(c => c.ToDto())
    };
}