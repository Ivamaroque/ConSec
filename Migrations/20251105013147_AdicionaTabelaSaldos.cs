using System;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ConSec.Migrations
{
    public partial class AdicionaTabelaSaldos : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Remove a foreign key se existir antes de recriar
            migrationBuilder.Sql(@"
                SET @fkExists = (
                    SELECT COUNT(*) 
                    FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS 
                    WHERE TABLE_SCHEMA = DATABASE() 
                    AND TABLE_NAME = 'TemasCusto' 
                    AND CONSTRAINT_NAME = 'FK_TemasCusto_Usuarios_UsuarioId'
                );
                
                SET @sql = IF(@fkExists > 0, 
                    'ALTER TABLE `TemasCusto` DROP FOREIGN KEY `FK_TemasCusto_Usuarios_UsuarioId`', 
                    'SELECT ''Foreign key does not exist''');
                    
                PREPARE stmt FROM @sql;
                EXECUTE stmt;
                DEALLOCATE PREPARE stmt;
            ");

            // Adiciona coluna Cor se não existir
            migrationBuilder.Sql(@"
                SET @columnExists = (
                    SELECT COUNT(*) 
                    FROM INFORMATION_SCHEMA.COLUMNS 
                    WHERE TABLE_SCHEMA = DATABASE() 
                    AND TABLE_NAME = 'TemasCusto' 
                    AND COLUMN_NAME = 'Cor'
                );
                
                SET @sql = IF(@columnExists = 0, 
                    'ALTER TABLE `TemasCusto` ADD `Cor` varchar(7) NOT NULL DEFAULT ''''', 
                    'SELECT ''Column Cor already exists''');
                    
                PREPARE stmt FROM @sql;
                EXECUTE stmt;
                DEALLOCATE PREPARE stmt;
            ");

            // Adiciona coluna Icone se não existir
            migrationBuilder.Sql(@"
                SET @columnExists = (
                    SELECT COUNT(*) 
                    FROM INFORMATION_SCHEMA.COLUMNS 
                    WHERE TABLE_SCHEMA = DATABASE() 
                    AND TABLE_NAME = 'TemasCusto' 
                    AND COLUMN_NAME = 'Icone'
                );
                
                SET @sql = IF(@columnExists = 0, 
                    'ALTER TABLE `TemasCusto` ADD `Icone` varchar(50) NULL', 
                    'SELECT ''Column Icone already exists''');
                    
                PREPARE stmt FROM @sql;
                EXECUTE stmt;
                DEALLOCATE PREPARE stmt;
            ");

            migrationBuilder.CreateTable(
                name: "Saldos",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    Descricao = table.Column<string>(type: "varchar(200)", maxLength: 200, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Valor = table.Column<decimal>(type: "decimal(10,2)", nullable: false),
                    DataEntrada = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    ArquivoAnexoPath = table.Column<string>(type: "varchar(500)", maxLength: 500, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    UsuarioId = table.Column<int>(type: "int", nullable: false),
                    CriadoEm = table.Column<DateTime>(type: "datetime(6)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Saldos", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Saldos_Usuarios_UsuarioId",
                        column: x => x.UsuarioId,
                        principalTable: "Usuarios",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateIndex(
                name: "IX_Saldos_UsuarioId",
                table: "Saldos",
                column: "UsuarioId");

            migrationBuilder.AddForeignKey(
                name: "FK_TemasCusto_Usuarios_UsuarioId",
                table: "TemasCusto",
                column: "UsuarioId",
                principalTable: "Usuarios",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_TemasCusto_Usuarios_UsuarioId",
                table: "TemasCusto");

            migrationBuilder.DropTable(
                name: "Saldos");

            migrationBuilder.DropColumn(
                name: "Cor",
                table: "TemasCusto");

            migrationBuilder.DropColumn(
                name: "Icone",
                table: "TemasCusto");

            migrationBuilder.AddForeignKey(
                name: "FK_TemasCusto_Usuarios_UsuarioId",
                table: "TemasCusto",
                column: "UsuarioId",
                principalTable: "Usuarios",
                principalColumn: "Id");
        }
    }
}
