-- Adiciona campo Cor na tabela TemasCusto
ALTER TABLE TemasCusto 
ADD COLUMN Cor VARCHAR(7) NOT NULL DEFAULT '#3498db';

-- Atualiza as cores dos temas existentes com cores diferentes
UPDATE TemasCusto SET Cor = '#e74c3c' WHERE Id = 1; -- Vermelho
UPDATE TemasCusto SET Cor = '#3498db' WHERE Id = 2; -- Azul
UPDATE TemasCusto SET Cor = '#2ecc71' WHERE Id = 3; -- Verde
UPDATE TemasCusto SET Cor = '#f39c12' WHERE Id = 4; -- Laranja
UPDATE TemasCusto SET Cor = '#9b59b6' WHERE Id = 5; -- Roxo
UPDATE TemasCusto SET Cor = '#1abc9c' WHERE Id = 6; -- Turquesa
UPDATE TemasCusto SET Cor = '#e67e22' WHERE Id = 7; -- Laranja escuro
UPDATE TemasCusto SET Cor = '#34495e' WHERE Id = 8; -- Cinza escuro
