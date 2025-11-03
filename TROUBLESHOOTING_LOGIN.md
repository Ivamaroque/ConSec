# 🔧 Solução de Problemas - Login não funciona

## ✅ Checklist de Verificação

### 1️⃣ **Backend está rodando?**
- Acesse: `https://localhost:7284/api/test/ping`
- Deve retornar: `{"message": "API está funcionando!", "timestamp": "..."}`

### 2️⃣ **Usuários foram criados?**
- Acesse: `https://localhost:7284/api/test/checkusers`
- Deve mostrar quantos usuários existem
- Se retornar `totalUsuarios: 0`, execute: `https://localhost:7284/api/seed/createtestusers`

### 3️⃣ **Verificar erro no Console do Navegador**
1. Abra `https://localhost:44475/login`
2. Pressione **F12**
3. Vá na aba **Console**
4. Tente fazer login
5. Veja que erro aparece

### 4️⃣ **Verificar requisição HTTP**
1. Com F12 aberto, vá na aba **Network**
2. Tente fazer login
3. Procure pela requisição `/api/auth/login`
4. Clique nela e veja:
   - **Status**: Deve ser 200 (sucesso) ou 401 (senha errada)
   - **Response**: A resposta da API
   - **Headers**: Se tem erro de CORS

## 🐛 Erros Comuns

### ❌ Erro: "CORS policy"
**Sintoma**: No console aparece erro relacionado a CORS  
**Causa**: O backend não está permitindo requisições do frontend  
**Solução**: Já está configurado no `Program.cs`, mas verifique se ambos servidores estão rodando

### ❌ Erro: "401 Unauthorized" ou "Email ou senha inválidos"
**Sintoma**: API retorna erro 401  
**Causa**: Credenciais incorretas ou usuário não existe  
**Solução**:
1. Acesse: `https://localhost:7284/api/seed/createtestusers`
2. Use exatamente: `admin@consec.com` / `admin123`

### ❌ Erro: "Network Error" ou "ERR_CONNECTION_REFUSED"
**Sintoma**: Não consegue conectar na API  
**Causa**: Backend não está rodando  
**Solução**:
```powershell
cd C:\Users\ivama\OneDrive\Documentos\TCC\ConSec
dotnet run
```

### ❌ Erro: "Failed to fetch" ou timeout
**Sintoma**: Requisição demora muito e dá timeout  
**Causa**: Problema de rede ou certificado SSL  
**Solução**: Aceite o certificado auto-assinado no navegador

### ❌ Erro: Angular mostra erro de compilação
**Sintoma**: Erros no TypeScript/Angular  
**Causa**: Módulos faltando ou erro de importação  
**Solução**:
```powershell
cd ClientApp
npm install
```

## 🔍 Teste Manual da API

### Teste via PowerShell:

```powershell
$body = @{
    email = "admin@consec.com"
    senha = "admin123"
} | ConvertTo-Json

[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
[System.Net.ServicePointManager]::ServerCertificateValidationCallback = {$true}

Invoke-RestMethod -Uri "https://localhost:7284/api/auth/login" `
    -Method Post `
    -ContentType "application/json" `
    -Body $body
```

### Teste via Curl (se tiver instalado):

```bash
curl -k -X POST https://localhost:7284/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@consec.com","senha":"admin123"}'
```

## 📊 Fluxo de Debug

1. **Verificar se backend está rodando**: `/api/test/ping`
2. **Verificar se usuários existem**: `/api/test/checkusers`
3. **Criar usuários se necessário**: `/api/seed/createtestusers`
4. **Testar login via API diretamente**: Usar PowerShell ou Postman
5. **Testar login pelo frontend**: Se API funciona, problema é no Angular
6. **Verificar console do navegador**: Ver erros específicos

## 🎯 Dados de Login Corretos

**Gestor:**
- Email: `admin@consec.com` (tudo minúsculo!)
- Senha: `admin123`

**Funcionário:**
- Email: `funcionario@consec.com`
- Senha: `func123`

⚠️ **Importante**: O email é case-sensitive no banco de dados!

## 📞 Próximos Passos se nada funcionar

1. Verifique os logs do backend no terminal onde `dotnet run` está rodando
2. Tire um print do erro no Console (F12)
3. Verifique a aba Network para ver a requisição completa
