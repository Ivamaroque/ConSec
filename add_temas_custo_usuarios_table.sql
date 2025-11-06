-- Script para adicionar tabela de relacionamento muitos-para-muitos
-- entre TemasCusto e Usuarios

USE consec_db;

-- Criar tabela de relacionamento
CREATE TABLE IF NOT EXISTS TemasCustoUsuarios (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    TemaCustoId INT NOT NULL,
    UsuarioId INT NOT NULL,
    CriadoEm DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Chaves estrangeiras
    CONSTRAINT FK_TemasCustoUsuarios_TemasCusto 
        FOREIGN KEY (TemaCustoId) REFERENCES TemasCusto(Id) ON DELETE CASCADE,
    
    CONSTRAINT FK_TemasCustoUsuarios_Usuarios 
        FOREIGN KEY (UsuarioId) REFERENCES Usuarios(Id) ON DELETE CASCADE,
    
    -- Índice único para evitar duplicatas
    UNIQUE KEY UQ_TemaCustoUsuario (TemaCustoId, UsuarioId)
);

-- Migrar dados existentes da coluna UsuarioId de TemasCusto para a nova tabela
INSERT INTO TemasCustoUsuarios (TemaCustoId, UsuarioId, CriadoEm)
SELECT Id, UsuarioId, NOW()
FROM TemasCusto
WHERE UsuarioId IS NOT NULL;

SELECT 'Tabela TemasCustoUsuarios criada com sucesso!' AS Status;
SELECT COUNT(*) AS 'Registros Migrados' FROM TemasCustoUsuarios;
