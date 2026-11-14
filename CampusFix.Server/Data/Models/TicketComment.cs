using System.Globalization;

namespace CampusFix.Server.Data.Models;

public class TicketComment
{
    public int Id { get; set; }
    public string TicketId { get; set; }
    public Ticket Ticket { get; set; } = null!;

    public required string Author { get; set; }
    public required string Role { get; set; }
    public required string Body { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public object ToDto() => new
    {
        author = Author,
        role = Role,
        when = CreatedAt.ToString("MMM d, h:mm tt", CultureInfo.InvariantCulture),
        body = Body
    };
}