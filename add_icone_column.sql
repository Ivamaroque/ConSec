-- Script para adicionar coluna Icone na tabela TemasCusto
-- Execute este script no MySQL Workbench ou phpMyAdmin

USE consec_db;

-- Adiciona a coluna Icone
ALTER TABLE TemasCusto 
ADD COLUMN Icone VARCHAR(50) NULL DEFAULT 'label';

-- Atualiza os registros existentes com ícones baseados no nome
UPDATE TemasCusto SET Icone = 'directions_bus' WHERE Nome LIKE '%nibus%' OR Nome LIKE '%Ônibus%';
UPDATE TemasCusto SET Icone = 'directions_car' WHERE Nome LIKE '%Carro%' OR Nome LIKE '%carro%';
UPDATE TemasCusto SET Icone = 'restaurant' WHERE Nome LIKE '%Alimenta%' OR Nome LIKE '%alimenta%' OR Nome LIKE '%Comida%';

-- Se preferir, pode atualizar manualmente depois:
-- UPDATE TemasCusto SET Icone = 'directions_bus' WHERE Id = 1;

SELECT * FROM TemasCusto;
