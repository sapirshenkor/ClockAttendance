using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ClockAttendance.Migrations
{
    /// <inheritdoc />
    public partial class AddEmployeeNumberSequence : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.EnsureSchema(
                name: "dbo");

            migrationBuilder.CreateSequence<int>(
                name: "EmployeeNumbers",
                schema: "dbo",
                startValue: 1102L);

            migrationBuilder.AlterColumn<string>(
                name: "UserId",
                table: "EmployeeProfiles",
                type: "nvarchar(450)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.CreateIndex(
                name: "IX_EmployeeProfiles_EmployeeNumber",
                table: "EmployeeProfiles",
                column: "EmployeeNumber",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_EmployeeProfiles_UserId",
                table: "EmployeeProfiles",
                column: "UserId",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_EmployeeProfiles_EmployeeNumber",
                table: "EmployeeProfiles");

            migrationBuilder.DropIndex(
                name: "IX_EmployeeProfiles_UserId",
                table: "EmployeeProfiles");

            migrationBuilder.DropSequence(
                name: "EmployeeNumbers",
                schema: "dbo");

            migrationBuilder.AlterColumn<string>(
                name: "UserId",
                table: "EmployeeProfiles",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(450)");
        }
    }
}
