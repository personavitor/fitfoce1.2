# ⚡ FITFORCE – App de Treino Inteligente

## 📱 Funcionalidades

- **Cadastro + Questionário** → Treino gerado com IA baseado no seu perfil
- **Planos pagos** → Grátis / PRO (R$29/mês) / Elite (R$59/mês)
- **Contador de Sequência (Streak)** → Mantém o histórico de dias consecutivos
- **Ranking entre amigos** → Comparação por XP, sequência e treinos
- **Desafios** → Desafie amigos com aposta e prazo
- **Sistema de XP + Níveis** → Gamificação completa
- **Sessão de treino ao vivo** → Timer + check de exercícios

---

## 🚀 Como rodar

### Pré-requisitos
- Node.js 18+
- npm ou yarn

### 1. Instalar dependências
```bash
cd fitforce-app
npm install
```

### 2. Rodar o servidor
```bash
npm start
# Acesse: http://localhost:3000
```

---

## 📦 Converter para APK (Android)

### Pré-requisitos adicionais
- Java JDK 17+
- Android Studio instalado
- Android SDK configurado

### Passo 1 – Instalar Capacitor
```bash
npm install @capacitor/core @capacitor/cli @capacitor/android
```

### Passo 2 – Inicializar
```bash
npx cap init FitForce com.fitforce.app --web-dir .
```

### Passo 3 – Adicionar plataforma Android
```bash
npx cap add android
```

### Passo 4 – Sincronizar
```bash
npx cap sync android
```

### Passo 5 – Abrir no Android Studio
```bash
npx cap open android
```

### Passo 6 – Gerar APK
No Android Studio:
1. Menu `Build` → `Build Bundle(s) / APK(s)` → `Build APK(s)`
2. O APK estará em `android/app/build/outputs/apk/debug/`

---

## 💳 Integração de Pagamento

### Opções recomendadas para Brasil:
- **MercadoPago** – mercadopago.com.br/developers
- **Stripe** – stripe.com (aceita BRL)
- **PagSeguro** – dev.pagseguro.uol.com.br
- **Pix via Gerencianet** – gerencianet.com.br

### Configurar pagamento (exemplo MercadoPago):
```javascript
// No server.js, adicione:
const mercadopago = require('mercadopago');
mercadopago.configure({ access_token: 'SEU_ACCESS_TOKEN' });

app.post('/api/subscribe', async (req, res) => {
  const preference = await mercadopago.preferences.create({
    items: [{ title: 'FitForce PRO', unit_price: 29.00, quantity: 1 }],
    back_urls: { success: '/success', failure: '/failure' },
    auto_return: 'approved'
  });
  res.json({ init_point: preference.body.init_point });
});
```

---

## 🏗️ Estrutura do Projeto

```
fitforce-app/
├── index.html          # App principal (todas as telas)
├── style.css           # Design system + componentes
├── app.js              # Lógica completa do app
├── server.js           # Servidor Node.js + API endpoints
├── package.json        # Dependências
├── capacitor.config.js # Config para APK
└── README.md           # Este arquivo
```

---

## 🎮 Como usar o app

1. **Criar conta** → Escolha seu plano
2. **Responder questionário** → 5 perguntas sobre objetivo, nível, dias, local e dados físicos
3. **Treino gerado automaticamente** → Plano semanal personalizado
4. **Iniciar treino** → Timer ao vivo + check de exercícios
5. **Ganhar XP** → Suba de nível a cada 500 XP
6. **Competir** → Ranking e desafios com amigos via código

---

## 📲 PWA (Alternativa ao APK)

Para instalar como app sem APK, adicione ao `<head>` do index.html:

```html
<link rel="manifest" href="manifest.json">
<meta name="theme-color" content="#0a0a0f">
```

E crie `manifest.json`:
```json
{
  "name": "FitForce",
  "short_name": "FitForce",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#0a0a0f",
  "theme_color": "#ff5722",
  "icons": [{ "src": "icon.png", "sizes": "512x512", "type": "image/png" }]
}
```

O usuário pode instalar direto pelo Chrome no Android sem precisar da Play Store!
