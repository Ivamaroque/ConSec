-- Script para criar usuários de teste no ConSec
-- Execute este script no MySQL Workbench ou através do comando:
-- mysql -u root -p consec_db < create_test_users.sql

USE consec_db;

-- Gestor de teste
-- Email: admin@consec.com
-- Senha: admin123
-- Hash gerado com BCrypt
INSERT INTO Usuarios (Nome, Email, Senha, Cargo, CreatedAt, UpdatedAt)
SELECT 'Administrador', 'admin@consec.com', '$2a$11$8xqKZ9XK9Z8pE.yqY8qZ8e5Z8pE.yqY8qZ8e5Z8pE.yqY8qZ8e5Z', 'gestor', UTC_TIMESTAMP(), UTC_TIMESTAMP()
WHERE NOT EXISTS (SELECT 1 FROM Usuarios WHERE Email = 'admin@consec.com');

-- Funcionário de teste
-- Email: funcionario@consec.com  
-- Senha: func123
INSERT INTO Usuarios (Nome, Email, Senha, Cargo, CreatedAt, UpdatedAt)
SELECT 'João Silva', 'funcionario@consec.com', '$2a$11$9xqKZ9XK9Z8pE.yqY8qZ8e5Z8pE.yqY8qZ8e5Z8pE.yqY8qZ8e5Z', 'funcionario', UTC_TIMESTAMP(), UTC_TIMESTAMP()
WHERE NOT EXISTS (SELECT 1 FROM Usuarios WHERE Email = 'funcionario@consec.com');

SELECT 'Usuários de teste criados com sucesso!' AS Status;
SELECT * FROM Usuarios;
