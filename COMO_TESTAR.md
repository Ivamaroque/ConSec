# 🚀 Como Testar o Sistema ConSec

## ✅ Status Atual
- ✅ Backend rodando em: `https://localhost:7284`
- ✅ Frontend Angular rodando em: `https://localhost:44475`
- ✅ Sistema de autenticação JWT implementado

## 📝 Passos para Testar

### 1️⃣ Criar Usuários de Teste

Abra no navegador:
```
https://localhost:7284/api/seed/createtestusers
```

Isso criará automaticamente:
- **Gestor**: 
  - Email: `admin@consec.com`
  - Senha: `admin123`
  
- **Funcionário**:
  - Email: `funcionario@consec.com`
  - Senha: `func123`

### 2️⃣ Acessar a Aplicação

Abra o navegador em:
```
https://localhost:44475
```

Você será automaticamente redirecionado para a tela de login.

### 3️⃣ Fazer Login

Use uma das credenciais criadas:
- Digite o email
- Digite a senha
- Clique em "Entrar"

### 4️⃣ Verificar Autenticação

Após o login bem-sucedido:
- ✅ Você será redirecionado para a página inicial
- ✅ Verá seu nome e cargo no menu superior
- ✅ Terá acesso às páginas protegidas
- ✅ Poderá fazer logout clicando em "Sair"

## 🔍 Testar Funcionalidades

### Testar Proteção de Rotas
1. Faça logout
2. Tente acessar diretamente: `https://localhost:44475/counter`
3. Você será redirecionado para o login ✅

### Testar Token JWT
1. Abra as Ferramentas do Desenvolvedor (F12)
2. Vá em "Application" > "Local Storage"
3. Verifique que existe:
   - `token`: seu JWT
   - `currentUser`: seus dados

### Testar API Diretamente

#### Login via API:
```bash
POST https://localhost:7284/api/auth/login
Content-Type: application/json

{
  "email": "admin@consec.com",
  "senha": "admin123"
}
```

#### Registro via API:
```bash
POST https://localhost:7284/api/auth/register
Content-Type: application/json

{
  "nome": "Maria Santos",
  "email": "maria@consec.com",
  "senha": "senha123",
  "cargo": "funcionario"
}
```

## 🐛 Solução de Problemas

### Angular não inicia
```bash
cd ClientApp
npm install
npm start
```

### Backend não conecta ao banco
- Verifique se o MySQL está rodando
- Confirme a connection string em `appsettings.json`
- Execute as migrações: `dotnet ef database update`

### Erro de CORS
- Verifique se o Angular está rodando em `https://localhost:44475`
- Confirme a configuração de CORS no `Program.cs`

### Token inválido/expirado
- Faça logout e login novamente
- Limpe o Local Storage do navegador

## 📊 Estrutura de Dados

### Tabelas no Banco:
- `Usuarios` - Dados dos usuários (gestor/funcionário)
- `TemasCusto` - Temas/categorias de custos
- `Custos` - Registros de custos

### Campos do Usuário:
- Id (int)
- Nome (string)
- Email (string)
- Senha (hash BCrypt)
- Cargo ("gestor" ou "funcionario")
- CreatedAt (datetime)
- UpdatedAt (datetime)

## 🎯 Próximas Implementações

- [ ] CRUD de Temas de Custo (apenas gestor)
- [ ] CRUD de Custos (funcionários)
- [ ] Dashboard com gráficos
- [ ] Upload de arquivos anexos
- [ ] Filtros e relatórios
- [ ] Notificações

---

✨ **Tudo funcionando!** Você agora tem um sistema completo de autenticação com JWT!
