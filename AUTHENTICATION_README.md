# ConSec - Sistema de Controle Financeiro 💰

Sistema de controle financeiro com autenticação JWT, desenvolvido com ASP.NET Core 6 e Angular.

## 🎯 Funcionalidades Implementadas

### Autenticação
- ✅ Tela de login com validação
- ✅ Sistema de autenticação JWT
- ✅ Proteção de rotas (AuthGuard)
- ✅ Interceptor HTTP para adicionar token automaticamente
- ✅ Controle de perfis (Gestor e Funcionário)
- ✅ Logout com redirecionamento

### Backend (ASP.NET Core 6)
- ✅ API de autenticação (`/api/auth/login` e `/api/auth/register`)
- ✅ Hash de senhas com BCrypt
- ✅ Geração de token JWT
- ✅ Configuração de CORS
- ✅ Entity Framework Core com MySQL

### Frontend (Angular)
- ✅ Componente de login responsivo
- ✅ Serviço de autenticação
- ✅ Guard para proteção de rotas
- ✅ Interceptor HTTP
- ✅ Navegação com informações do usuário logado

## 📋 Pré-requisitos

- .NET 6 SDK
- Node.js (versão 14 ou superior)
- MySQL Server
- Angular CLI

## 🚀 Como Executar

### 1. Configurar o Banco de Dados

Certifique-se de que o MySQL está rodando e atualize a connection string em `appsettings.json` se necessário:

```json
"ConnectionStrings": {
  "DefaultConnection": "Server=localhost;Port=3306;Database=consec_db;Uid=root;Pwd=6315;"
}
```

### 2. Aplicar as Migrações

```bash
dotnet ef database update
```

### 3. (Opcional) Criar Usuários de Teste

Execute o arquivo `SeedData.cs` para criar usuários iniciais:

```bash
dotnet run SeedData.cs
```

Isso criará:
- **Gestor**: email: `admin@consec.com`, senha: `admin123`
- **Funcionário**: email: `funcionario@consec.com`, senha: `func123`

### 4. Executar a Aplicação

```bash
dotnet run
```

A aplicação estará disponível em:
- HTTPS: `https://localhost:5001`
- HTTP: `http://localhost:5000`

## 🔐 Endpoints da API

### Autenticação

#### POST /api/auth/login
Login de usuário

**Request:**
```json
{
  "email": "admin@consec.com",
  "senha": "admin123"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "id": 1,
  "nome": "Administrador",
  "email": "admin@consec.com",
  "cargo": "gestor",
  "expiresAt": "2024-11-10T00:00:00Z"
}
```

#### POST /api/auth/register
Registro de novo usuário (disponível apenas para gestores)

**Request:**
```json
{
  "nome": "Maria Santos",
  "email": "maria@consec.com",
  "senha": "senha123",
  "cargo": "funcionario"
}
```

## 📁 Estrutura do Projeto

```
ConSec/
├── Controllers/           # Controllers da API
│   ├── AuthController.cs
│   └── WeatherForecastController.cs
├── Models/               # Modelos de dados
│   ├── DTOs/            # Data Transfer Objects
│   │   ├── LoginDto.cs
│   │   ├── RegisterDto.cs
│   │   └── AuthResponseDto.cs
│   ├── Custo.cs
│   ├── TemaCusto.cs
│   └── Usuario.cs
├── Services/            # Serviços da aplicação
│   └── AuthService.cs
├── ClientApp/           # Aplicação Angular
│   └── src/
│       └── app/
│           ├── login/              # Componente de login
│           ├── services/           # Serviços Angular
│           │   └── auth.service.ts
│           ├── guards/             # Guards de rota
│           │   └── auth.guard.ts
│           └── interceptors/       # HTTP Interceptors
│               └── auth.interceptor.ts
├── Migrations/          # Migrações EF Core
└── Program.cs          # Configuração da aplicação
```

## 🔑 Configurações de Segurança

### JWT Settings (appsettings.json)

```json
"JwtSettings": {
  "SecretKey": "ChaveSecretaSuperSeguraParaOConSec2024!MinhaChaveJWT",
  "Issuer": "ConSecAPI",
  "Audience": "ConSecClient"
}
```

⚠️ **IMPORTANTE**: Altere a `SecretKey` para um valor único e seguro em produção!

## 👤 Tipos de Usuário

### Gestor
- Pode criar novos usuários
- Pode criar novos temas de custo
- Pode associar temas a usuários
- Tem acesso completo ao sistema

### Funcionário
- Pode cadastrar custos nas tabs associadas
- Pode visualizar seus próprios custos
- Acesso limitado às funcionalidades

## 📝 Próximos Passos

- [ ] Implementar CRUD de Temas de Custo
- [ ] Implementar CRUD de Custos
- [ ] Criar dashboard para gestores
- [ ] Implementar upload de arquivos anexos
- [ ] Adicionar filtros e relatórios
- [ ] Implementar gráficos de gastos
- [ ] Criar sistema de notificações

## 🐛 Resolução de Problemas

### Erro de conexão com o banco de dados
- Verifique se o MySQL está rodando
- Confirme as credenciais na connection string
- Certifique-se de que o banco `consec_db` existe

### Erro de compilação no Angular
```bash
cd ClientApp
npm install
```

### Token expirado
- O token JWT expira em 7 dias
- Faça logout e login novamente

## 📄 Licença

Este projeto foi desenvolvido para fins acadêmicos (TCC).

---

Desenvolvido com ❤️ por Ivama
