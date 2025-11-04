-- Script para corrigir a tabela TemasCusto

-- 1. Ver estado atual
SELECT * FROM TemasCusto;
SELECT * FROM Usuarios WHERE Cargo = 'gestor';

-- 2. Atualizar registros existentes com um usuário gestor válido
UPDATE TemasCusto 
SET UsuarioId = (SELECT Id FROM Usuarios WHERE Cargo = 'gestor' LIMIT 1)
WHERE UsuarioId IS NULL OR UsuarioId NOT IN (SELECT Id FROM Usuarios);

-- 3. Verificar se a foreign key já existe
SELECT CONSTRAINT_NAME 
FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS 
WHERE TABLE_SCHEMA = 'consec_db' 
  AND TABLE_NAME = 'TemasCusto' 
  AND CONSTRAINT_NAME = 'FK_TemasCusto_Usuarios_UsuarioId';

-- 4. Se não existir, criar a foreign key
-- ALTER TABLE `TemasCusto` ADD CONSTRAINT `FK_TemasCusto_Usuarios_UsuarioId` 
-- FOREIGN KEY (`UsuarioId`) REFERENCES `Usuarios` (`Id`) ON DELETE RESTRICT;

-- 5. Verificar índice
SELECT INDEX_NAME 
FROM INFORMATION_SCHEMA.STATISTICS 
WHERE TABLE_SCHEMA = 'consec_db' 
  AND TABLE_NAME = 'TemasCusto' 
  AND INDEX_NAME = 'IX_TemasCusto_UsuarioId';

-- 6. Se não existir, criar índice
-- CREATE INDEX `IX_TemasCusto_UsuarioId` ON `TemasCusto` (`UsuarioId`);

-- 7. Marcar a migration como aplicada
INSERT INTO `__EFMigrationsHistory` (`MigrationId`, `ProductVersion`)
VALUES ('20251103203747_AdicionaUsuarioIdEmTemaCusto', '6.0.0');
