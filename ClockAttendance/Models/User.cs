namespace ClockAttendance.Models;

public class User
{
    public int Id { get; set; }
    public int EmployeeNumber { get; set; }
    public string Password { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
}
