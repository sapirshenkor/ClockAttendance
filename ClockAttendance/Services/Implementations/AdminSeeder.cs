using ClockAttendance.Data;
using ClockAttendance.Models;
using ClockAttendance.Services.Interfaces;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using System;
using System.Threading.Tasks;


namespace ClockAttendance.Services.Implementations
{
    public class AdminSeeder : IAdminSeeder
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly RoleManager<IdentityRole> _roleManager;
        private readonly IConfiguration _configuration;

        public AdminSeeder(UserManager<ApplicationUser> userManager, RoleManager<IdentityRole> roleManager, IConfiguration configuration)
        {
            _userManager = userManager;
            _roleManager = roleManager;
            _configuration = configuration;
        }

        public async Task SeedAdminAsync()
        {
            // Seed roles
            if (!await _roleManager.RoleExistsAsync("Admin"))
            {
                await _roleManager.CreateAsync(new IdentityRole("Admin"));
            }

            if (!await _roleManager.RoleExistsAsync("Employee"))
            {
                await _roleManager.CreateAsync(new IdentityRole("Employee"));
            }

            // Seed admin user
            var adminEmployeeNumber = Environment.GetEnvironmentVariable("SEED_ADMIN_EMPLOYEE_NUMBER");
            var adminPassword = Environment.GetEnvironmentVariable("SEED_ADMIN_PASSWORD");
            var adminFirstName = Environment.GetEnvironmentVariable("SEED_ADMIN_FIRST_NAME");
            var adminLastName = Environment.GetEnvironmentVariable("SEED_ADMIN_LAST_NAME");

            var adminUser = await _userManager.FindByNameAsync(adminEmployeeNumber);
            if (adminUser == null)
            {
                adminUser = new ApplicationUser
                {
                    UserName = adminEmployeeNumber,
                    Email = $"admin{adminEmployeeNumber}@example.com",
                    EmailConfirmed = true
                };

                var result = await _userManager.CreateAsync(adminUser, adminPassword);
                if (result.Succeeded)
                {
                    await _userManager.AddToRoleAsync(adminUser, "Admin");
                }
            }
        }
    }
}