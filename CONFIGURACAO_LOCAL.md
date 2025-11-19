# Configuração para Desenvolvimento Local

Este guia explica como configurar o frontend para apontar para o backend local durante o desenvolvimento.

## 🚀 Configuração Automática

Por padrão, quando você roda o app em modo de desenvolvimento (`npm start` ou `expo start`), o frontend **automaticamente** apontará para `http://localhost:8000` (backend local).

## 📋 Pré-requisitos

1. **Backend rodando localmente:**
   ```bash
   cd Funny-Back-Py
   python run.py
   # ou
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

2. **Frontend rodando:**
   ```bash
   cd Funny-Front
   npm start
   # ou
   npx expo start
   ```

## 🔧 Opções de Configuração

### Opção 1: Automático (Recomendado)

Se você está rodando em **modo de desenvolvimento** (`__DEV__ = true`), o frontend automaticamente usa `http://localhost:8000`.

**Funciona para:**
- ✅ iOS Simulator
- ✅ Web (navegador)
- ⚠️ Android Emulator (pode precisar de ajuste - veja abaixo)

### Opção 2: Variável de Ambiente

Crie um arquivo `.env` na raiz do projeto `Funny-Front`:

```env
EXPO_PUBLIC_API_URL=http://localhost:8000
```

**Para Android Emulator**, use:
```env
EXPO_PUBLIC_API_URL=http://10.0.2.2:8000
```

**Para dispositivo físico**, use o IP da sua máquina:
```env
EXPO_PUBLIC_API_URL=http://192.168.1.100:8000
```

> **Nota:** Substitua `192.168.1.100` pelo IP da sua máquina na rede local.

### Opção 3: Configuração no app.json

Adicione a URL no arquivo `app.json`:

```json
{
  "expo": {
    "extra": {
      "API_URL": "http://localhost:8000",
      "RECAPTCHA_SITE_KEY": "..."
    }
  }
}
```

## 📱 Configurações Específicas por Plataforma

### iOS Simulator
- ✅ Usa `localhost` automaticamente
- URL: `http://localhost:8000`

### Android Emulator
- ⚠️ Precisa usar `10.0.2.2` ao invés de `localhost`
- URL: `http://10.0.2.2:8000`

**Solução:** Crie um arquivo `.env` com:
```env
EXPO_PUBLIC_API_URL=http://10.0.2.2:8000
```

### Dispositivo Físico (iOS/Android)
- ⚠️ Precisa usar o IP da sua máquina na rede local
- URL: `http://SEU_IP_LOCAL:8000`

**Como descobrir seu IP:**
- **Windows:** `ipconfig` (procure por IPv4)
- **Mac/Linux:** `ifconfig` ou `ip addr`

**Solução:** Crie um arquivo `.env` com:
```env
EXPO_PUBLIC_API_URL=http://192.168.1.100:8000
```

### Web (Navegador)
- ✅ Usa `localhost` automaticamente
- URL: `http://localhost:8000`

## 🔍 Verificar Configuração

Quando o app iniciar em modo de desenvolvimento, você verá no console:

```
🔗 Backend URL configurada: http://localhost:8000
```

Isso confirma qual URL está sendo usada.

## 🐛 Troubleshooting

### Erro: "Network request failed" ou "Connection refused"

1. **Verifique se o backend está rodando:**
   ```bash
   # No terminal do backend, você deve ver:
   INFO:     Uvicorn running on http://0.0.0.0:8000
   ```

2. **Teste o backend diretamente:**
   ```bash
   curl http://localhost:8000/health
   # ou abra no navegador: http://localhost:8000/docs
   ```

3. **Para Android Emulator:**
   - Use `10.0.2.2` ao invés de `localhost`
   - Certifique-se de que o backend está rodando em `0.0.0.0` (não apenas `127.0.0.1`)

4. **Para dispositivo físico:**
   - Verifique se o dispositivo está na mesma rede Wi-Fi
   - Use o IP correto da sua máquina
   - Verifique se o firewall não está bloqueando a porta 8000

### Erro: CORS

Se você receber erros de CORS, verifique se o backend está configurado para aceitar requisições do frontend:

No arquivo `Funny-Back-Py/app/main.py`, o CORS deve estar configurado assim:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Em desenvolvimento
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## 📝 Ordem de Prioridade

A URL do backend é determinada nesta ordem:

1. **Variável de ambiente** `EXPO_PUBLIC_API_URL` (maior prioridade)
2. **Configuração no app.json** (`extra.API_URL`)
3. **Modo desenvolvimento** → `http://localhost:8000`
4. **Produção** → `https://funny-back-py.onrender.com` (fallback)

## 🚀 Produção

Em produção, o app automaticamente usa a URL de produção (`https://funny-back-py.onrender.com`) a menos que você configure uma variável de ambiente diferente.

---

**Dica:** Para desenvolvimento local, a configuração automática geralmente funciona. Só precisa ajustar se estiver usando Android Emulator ou dispositivo físico.

