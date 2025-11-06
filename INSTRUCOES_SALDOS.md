# INSTRUÇÕES PARA ADICIONAR TABELA DE SALDOS

## O problema
As migrações do Entity Framework estão com conflito devido a tentativas de modificar constraints que podem ou não existir.

## Solução: Executar SQL manualmente

### Passo 1: Abra o MySQL Workbench ou phpMyAdmin

### Passo 2: Execute o arquivo `fix_database_saldos.sql`

Ou copie e cole o seguinte SQL:

```sql
USE consec_db;

-- 1. Corrigir coluna UsuarioId para permitir NULL
ALTER TABLE `TemasCusto` MODIFY COLUMN `UsuarioId` int NULL;

-- 2. Adicionar coluna Cor se não existir
SET @corExists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'TemasCusto' AND COLUMN_NAME = 'Cor');
SET @sql = IF(@corExists = 0, 'ALTER TABLE `TemasCusto` ADD COLUMN `Cor` varchar(7) NOT NULL DEFAULT ''''', 'SELECT ''Cor exists''');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- 3. Adicionar coluna Icone se não existir
SET @iconeExists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'TemasCusto' AND COLUMN_NAME = 'Icone');
SET @sql = IF(@iconeExists = 0, 'ALTER TABLE `TemasCusto` ADD COLUMN `Icone` varchar(50) NULL DEFAULT ''label''', 'SELECT ''Icone exists''');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- 4. Criar tabela Saldos
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

-- 5. Verificar
SELECT * FROM Saldos LIMIT 1;
SELECT * FROM TemasCusto LIMIT 1;
```

### Passo 3: Após executar o SQL

Execute no terminal:
```bash
dotnet build
dotnet run
```

### Passo 4: O frontend já está pronto!

Após o backend iniciar, você poderá acessar a nova funcionalidade "Gerenciar Saldo".

## O que foi criado:

✅ **Backend:**
- Models/Saldo.cs
- Models/DTOs/SaldoDto.cs  
- Controllers/SaldoController.cs (API completa)
- ApplicationDbContext atualizado

✅ **Frontend:**
- services/saldo.service.ts

⏳ **Próximo passo:** Criar o componente Angular para a interface
