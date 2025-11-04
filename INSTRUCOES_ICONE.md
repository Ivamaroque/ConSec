# INSTRUÇÕES PARA ADICIONAR O CAMPO ÍCONE

## Passos para executar:

### 1. Abra o MySQL Workbench ou phpMyAdmin

### 2. Execute o seguinte SQL:

```sql
USE consec_db;

ALTER TABLE TemasCusto 
ADD COLUMN Icone VARCHAR(50) NULL DEFAULT 'label';

UPDATE TemasCusto SET Icone = 'directions_bus' WHERE Nome LIKE '%nibus%' OR Nome LIKE '%Ônibus%';
UPDATE TemasCusto SET Icone = 'directions_car' WHERE Nome LIKE '%Carro%' OR Nome LIKE '%carro%';
UPDATE TemasCusto SET Icone = 'restaurant' WHERE Nome LIKE '%Alimenta%' OR Nome LIKE '%alimenta%';

SELECT * FROM TemasCusto;
```

### 3. Após executar o SQL:
- Pare o backend (se estiver rodando)
- Execute `dotnet run` novamente
- O backend agora reconhecerá o novo campo!

### 4. Teste:
- Vá para "Gerenciar Temas"
- Crie ou edite um tema
- Escolha um ícone no seletor visual
- Salve e veja o ícone aparecer no card!

## Obs:
O arquivo `add_icone_column.sql` contém o mesmo script para referência.
