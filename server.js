// ═══════════════════════════════════════════
//  FITFORCE – Node.js Server
//  Para servir o app e preparar para APK
// ═══════════════════════════════════════════

const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Servir arquivos estáticos
app.use(express.static(path.join(__dirname, '.')));
app.use(express.json());

// Rota principal
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// ── API ENDPOINTS (para versão backend futura) ──

// Criar usuário
app.post('/api/users', (req, res) => {
  const { name, email, password, plan } = req.body;
  // Em produção: salvar no banco de dados
  res.json({ success: true, message: 'Usuário criado', userId: Date.now().toString() });
});

// Login
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  // Em produção: verificar no banco de dados
  res.json({ success: true, token: 'jwt-token-aqui' });
});

// Salvar progresso de treino
app.post('/api/workout/complete', (req, res) => {
  const { userId, workoutId, duration, xp } = req.body;
  res.json({ success: true, xpGained: xp, newStreak: 1 });
});

// Ranking
app.get('/api/ranking', (req, res) => {
  res.json({ ranking: [] });
});

// Desafios
app.post('/api/challenges', (req, res) => {
  const { challenger, opponent, type, duration } = req.body;
  res.json({ success: true, challengeId: Date.now().toString() });
});

// Webhook de pagamento (Stripe/PagSeguro)
app.post('/api/payment/webhook', (req, res) => {
  const event = req.body;
  console.log('Webhook recebido:', event.type);
  // Processar eventos de pagamento
  res.json({ received: true });
});

// Assinar plano
app.post('/api/subscribe', (req, res) => {
  const { userId, plan, paymentMethod } = req.body;
  // Em produção: processar pagamento via Stripe/PagSeguro/MercadoPago
  res.json({ success: true, plan, nextBillingDate: new Date(Date.now() + 30*24*60*60*1000) });
});

app.listen(PORT, () => {
  console.log(`\n⚡ FITFORCE Server rodando em http://localhost:${PORT}`);
  console.log(`\n📱 Para converter em APK, siga os passos em README.md\n`);
});

module.exports = app;
