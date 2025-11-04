using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ConSec.Migrations
{
    public partial class AdicionaUsuarioIdEmTemaCusto : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Verifica se a coluna já existe antes de adicionar
            migrationBuilder.Sql(@"
                SET @columnExists = (
                    SELECT COUNT(*) 
                    FROM INFORMATION_SCHEMA.COLUMNS 
                    WHERE TABLE_SCHEMA = DATABASE() 
                    AND TABLE_NAME = 'TemasCusto' 
                    AND COLUMN_NAME = 'UsuarioId'
                );
                
                SET @sql = IF(@columnExists = 0, 
                    'ALTER TABLE `TemasCusto` ADD `UsuarioId` int NULL', 
                    'SELECT ''Column already exists''');
                    
                PREPARE stmt FROM @sql;
                EXECUTE stmt;
                DEALLOCATE PREPARE stmt;
            ");

            // Atualiza os registros existentes com o primeiro usuário gestor encontrado
            migrationBuilder.Sql(@"
                UPDATE TemasCusto 
                SET UsuarioId = (SELECT Id FROM Usuarios WHERE Cargo = 'gestor' LIMIT 1)
                WHERE UsuarioId IS NULL;
            ");

            // Cria o índice se não existir
            migrationBuilder.Sql(@"
                SET @indexExists = (
                    SELECT COUNT(*) 
                    FROM INFORMATION_SCHEMA.STATISTICS 
                    WHERE TABLE_SCHEMA = DATABASE() 
                    AND TABLE_NAME = 'TemasCusto' 
                    AND INDEX_NAME = 'IX_TemasCusto_UsuarioId'
                );
                
                SET @sql = IF(@indexExists = 0, 
                    'CREATE INDEX `IX_TemasCusto_UsuarioId` ON `TemasCusto` (`UsuarioId`)', 
                    'SELECT ''Index already exists''');
                    
                PREPARE stmt FROM @sql;
                EXECUTE stmt;
                DEALLOCATE PREPARE stmt;
            ");

            // Adiciona a foreign key se não existir
            migrationBuilder.Sql(@"
                SET @fkExists = (
                    SELECT COUNT(*) 
                    FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS 
                    WHERE TABLE_SCHEMA = DATABASE() 
                    AND TABLE_NAME = 'TemasCusto' 
                    AND CONSTRAINT_NAME = 'FK_TemasCusto_Usuarios_UsuarioId'
                );
                
                SET @sql = IF(@fkExists = 0, 
                    'ALTER TABLE `TemasCusto` ADD CONSTRAINT `FK_TemasCusto_Usuarios_UsuarioId` FOREIGN KEY (`UsuarioId`) REFERENCES `Usuarios` (`Id`)', 
                    'SELECT ''Foreign key already exists''');
                    
                PREPARE stmt FROM @sql;
                EXECUTE stmt;
                DEALLOCATE PREPARE stmt;
            ");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_TemasCusto_Usuarios_UsuarioId",
                table: "TemasCusto");

            migrationBuilder.DropIndex(
                name: "IX_TemasCusto_UsuarioId",
                table: "TemasCusto");

            migrationBuilder.DropColumn(
                name: "UsuarioId",
                table: "TemasCusto");
        }
    }
}
