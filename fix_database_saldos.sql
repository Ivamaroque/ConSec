-- Script para corrigir estrutura do banco e adicionar tabela Saldos
USE consec_db;

-- 1. Verificar e corrigir a coluna UsuarioId em TemasCusto
SET @columnExists = (
    SELECT COUNT(*) 
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'TemasCusto' 
    AND COLUMN_NAME = 'UsuarioId'
);

-- Se a coluna existe, modificar para permitir NULL
SET @sql = IF(@columnExists > 0, 
    'ALTER TABLE `TemasCusto` MODIFY COLUMN `UsuarioId` int NULL', 
    'SELECT ''Column does not exist yet''');
    
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 2. Adicionar coluna Cor se não existir
SET @corExists = (
    SELECT COUNT(*) 
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'TemasCusto' 
    AND COLUMN_NAME = 'Cor'
);

SET @sql = IF(@corExists = 0, 
    'ALTER TABLE `TemasCusto` ADD COLUMN `Cor` varchar(7) NOT NULL DEFAULT ''''', 
    'SELECT ''Cor column already exists''');
    
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 3. Adicionar coluna Icone se não existir  
SET @iconeExists = (
    SELECT COUNT(*) 
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'TemasCusto' 
    AND COLUMN_NAME = 'Icone'
);

SET @sql = IF(@iconeExists = 0, 
    'ALTER TABLE `TemasCusto` ADD COLUMN `Icone` varchar(50) NULL DEFAULT ''label''', 
    'SELECT ''Icone column already exists''');
    
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 4. Criar tabela Saldos se não existir
CREATE TABLE IF NOT EXISTS `Saldos` (
    `Id` int NOT NULL AUTO_INCREMENT,
    `Descricao` varchar(200) NOT NULL,
    `Valor` decimal(10,2) NOT NULL,
    `DataEntrada` datetime(6) NOT NULL,
    `ArquivoAnexoPath` varchar(500) NULL,
    `UsuarioId` int NOT NULL,
    `CriadoEm` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    PRIMARY KEY (`Id`),
    KEY `IX_Saldos_UsuarioId` (`UsuarioId`),
    CONSTRAINT `FK_Saldos_Usuarios_UsuarioId` FOREIGN KEY (`UsuarioId`) REFERENCES `Usuarios` (`Id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. Verificar estrutura final
SELECT 'TemasCusto columns:' as info;
SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
AND TABLE_NAME = 'TemasCusto';

SELECT 'Saldos table:' as info;
SELECT COUNT(*) as table_exists
FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_SCHEMA = DATABASE()
AND TABLE_NAME = 'Saldos';
