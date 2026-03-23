using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using ClockAttendance.Models;

namespace ClockAttendance.Data;

public class ApplicationDbContext : IdentityDbContext<ApplicationUser>
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }
       
     public DbSet<User> Users { get; set; }
     public DbSet<EmployeeProfile> EmployeeProfiles { get; set; }
     public DbSet<AttendanceShift> AttendanceShifts { get; set; }
     public DbSet<AuditLog> AuditLogs { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.HasSequence<int>("EmployeeNumbers", schema: "dbo")
            .StartsAt(1102)
            .IncrementsBy(1);

        modelBuilder.Entity<EmployeeProfile>()
            .HasIndex(e => e.EmployeeNumber)
            .IsUnique();

        modelBuilder.Entity<EmployeeProfile>()
            .HasIndex(e => e.UserId)
            .IsUnique();
    }
}
