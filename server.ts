import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import cookieParser from "cookie-parser";

const app = express();
const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET || "default-secret-change-this";

// In-memory data store
const users: any[] = [];
const jobs: any[] = [];
const messages: any[] = [];
const reviews: any[] = [];
const notifications: any[] = [];
let notificationClients: any[] = [];

// Account Recovery Storage
const recoveryOtps = new Map<string, { otp: string, expires: number, attempts: number, userId: string }>();

const ADMIN_EMAIL = 'rafaeldenzel12@gmail.com';

// SSE helper to send notifications
const sendNotification = (userId: string, notification: any) => {
  const payload = `data: ${JSON.stringify(notification)}\n\n`;
  notificationClients
    .filter(client => client.userId === userId)
    .forEach(client => client.res.write(payload));
};

const JOB_CATEGORIES = [
  "Limpeza de casas", "Limpeza de escritórios", "Lavagem de carros", "Entrega de encomendas",
  "Motoboy / estafeta", "Montagem de móveis", "Reparação de móveis", "Pintura de casas",
  "Pequenos trabalhos de construção", "Ajuda em mudanças", "Jardinagem", "Corte de relva",
  "Limpeza de quintal", "Babysitting", "Apoio escolar (explicador)", "Aulas de inglês",
  "Aulas de matemática", "Aulas de informática", "Fotografia de eventos", "Edição de vídeo",
  "Criação de logotipos", "Design gráfico simples", "Gestão de redes sociais", "Publicação de posts",
  "Criação de conteúdos TikTok", "Marketing digital básico", "Venda de produtos online",
  "Assistente virtual", "Digitação de documentos", "Tradução simples", "Reparação de telemóveis",
  "Instalação de apps", "Configuração de Wi-Fi", "Reparação de computadores", "Formatação de PCs",
  "Instalação de Windows", "Suporte técnico básico", "Venda de peças eletrónicas",
  "Instalação de câmeras de segurança", "Reparação de eletrodomésticos", "Culinária (cozinhar em casa do cliente)",
  "Venda de comida caseira", "Catering pequeno evento", "Organização de festas", "Decoração de eventos",
  "Limpeza pós-festa", "Segurança privada informal", "Auxiliar de loja", "Repositor de stock", "Atendimento em eventos"
];
const loginAttempts: Record<string, number> = {};

// AI Dynamic Configuration
let aiConfig = {
  systemInstructions: `Você é o "Génio do Trampo", o assistente virtual oficial da plataforma Trampo Rápido em Angola. 
Sua personalidade é prestativa, conhecedora do mercado local (Angola/Luanda) e motivacional. 
Ajude os usuários a encontrar trabalhos, melhorar seus perfis ou entender como a plataforma funciona. 
Use gírias leves de Angola de forma profissional (ex: "Mambo", "Tudo nice").`,
  modelName: "gemini-3-flash-preview"
};

app.use(express.json());
app.use(cookieParser());

// Authentication Middleware
const authenticateToken = (req: any, res: any, next: any) => {
  const token = req.cookies.token;
  if (!token) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// AI Config Endpoint
app.get("/api/ai/config", (req, res) => {
  res.json(aiConfig);
});

// Admin update AI Config
app.post("/api/admin/ai/config", authenticateToken, (req: any, res) => {
  const user = users.find(u => u.id === req.user.id);
  if (!user || user.email !== ADMIN_EMAIL) return res.status(403).json({ message: "Acesso negado" });
  
  const { systemInstructions, modelName } = req.body;
  if (systemInstructions) aiConfig.systemInstructions = systemInstructions;
  if (modelName) aiConfig.modelName = modelName;
  
  res.json({ message: "Configuração do Gemini atualizada com sucesso!", config: aiConfig });
});

// Debug middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// API Routes - AUTH
app.post("/api/register", async (req, res) => {
  const { phone, email, password, name, role } = req.body;

  if (phone && !phone.startsWith("+244")) {
    return res.status(400).json({ message: "Número deve começar com +244" });
  }
  if (password.length < 6) {
    return res.status(400).json({ message: "Palavra-passe deve ter no mínimo 6 caracteres" });
  }

  const existingUser = users.find(u => (phone && u.phone === phone) || (email && u.email === email));
  if (existingUser) {
    return res.status(400).json({ message: "Utilizador com este contacto já existe" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = { 
    id: Math.random().toString(36).substring(2, 9),
    phone: phone || null, 
    email: email || null, 
    password: hashedPassword, 
    name, 
    role: role || 'client',
    balance: 0,
    pendingBalance: 0,
    rating: 5.0,
    reviewCount: 0,
    verified: false,
    online: true,
    bio: '',
    location: { city: 'Luanda', country: 'Angola', show: true },
    verification: { status: 'not_verified', bi: false, selfie: false, email: false, phone: true },
    visibility: { public: true, online: true },
    security: { biometric: false, twoFactor: false, dailyLimit: 50000, confirmSend: true },
    work: { categories: [], maxDistance: 10, sleepMode: false, autoAccept: false, minPrice: 0 },
    notifications: { all: true, jobs: true, payments: true, messages: true, system: true, sound: true, vibration: true },
    preferences: { language: 'PT', currency: 'KZ', theme: 'dark', dataSaving: false, aiSuggestions: true },
    history: []
  };
  users.push(newUser);

  const token = jwt.sign({ id: newUser.id, phone }, JWT_SECRET, { expiresIn: '7d' });
  res.cookie('token', token, { httpOnly: true, secure: true, sameSite: 'none' });
  res.json({ message: "Registado com sucesso", user: newUser });
});

app.post("/api/login", async (req, res) => {
  const { login, password } = req.body;

  if (loginAttempts[login] >= 3) {
    return res.status(403).json({ message: "Máximo de tentativas atingido. Tente mais tarde." });
  }

  const user = users.find(u => u.phone === login || u.email === login);
  if (!user || !(await bcrypt.compare(password, user.password))) {
    loginAttempts[login] = (loginAttempts[login] || 0) + 1;
    return res.status(401).json({ message: "Contacto ou palavra-passe incorretos" });
  }

  delete loginAttempts[login];

  const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '7d' });
  res.cookie('token', token, { httpOnly: true, secure: true, sameSite: 'none' });
  res.json({ message: "Login realizado", user });
});

app.post("/api/auth/recovery/initiate", (req, res) => {
  const { identifier } = req.body; // Can be phone or email
  const user = users.find(u => u.phone === identifier || u.email === identifier);
  
  if (!user) return res.status(404).json({ message: "Conta não encontrada" });

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expires = Date.now() + (5 * 60 * 1000); // 5 minutes

  recoveryOtps.set(identifier, { otp, expires, attempts: 0, userId: user.id });

  console.log(`[RECOVERY SYSTEM] OTP for ${identifier}: ${otp} (Expires in 5m)`);
  
  res.json({ 
    message: "Código enviado com sucesso", 
    method: user.phone === identifier ? 'sms' : 'email',
    target: identifier.replace(/.(?=.{4})/g, '*')
  });
});

app.post("/api/auth/recovery/verify", (req, res) => {
  const { identifier, otp } = req.body;
  const entry = recoveryOtps.get(identifier);

  if (!entry) return res.status(400).json({ message: "Sessão expirada ou inválida" });
  if (Date.now() > entry.expires) {
    recoveryOtps.delete(identifier);
    return res.status(400).json({ message: "Código expirado" });
  }
  if (entry.attempts >= 3) {
    recoveryOtps.delete(identifier);
    return res.status(403).json({ message: "Muitas tentativas falhadas. Tente novamente mais tarde." });
  }

  if (entry.otp !== otp) {
    entry.attempts += 1;
    return res.status(400).json({ message: "Código incorreto" });
  }

  res.json({ message: "Identidade confirmada", recoveryToken: Math.random().toString(36).substring(2) });
});

app.post("/api/auth/recovery/reset", (req, res) => {
  const { identifier, otp, newPassword } = req.body;
  const entry = recoveryOtps.get(identifier);

  if (!entry || entry.otp !== otp) return res.status(400).json({ message: "Operação inválida" });

  const user = users.find(u => u.id === entry.userId);
  if (user) {
    // Encrypt password using existing pattern in register
    user.password = bcrypt.hashSync(newPassword, 10);
    recoveryOtps.delete(identifier);
    res.json({ message: "Palavra-passe redefinida com sucesso" });
  } else {
    res.status(404).json({ message: "A conta foi removida durante o processo" });
  }
});

app.get("/api/users/:id/reviews", (req, res) => {
  const userReviews = reviews.filter(r => r.targetId === req.params.id);
  res.json(userReviews);
});

app.post("/api/reviews", authenticateToken, (req: any, res) => {
  const { targetId, jobId, rating, comment } = req.body;
  
  const newReview = {
    id: Math.random().toString(36).substring(2, 9),
    authorId: req.user.id,
    targetId,
    jobId,
    rating,
    comment,
    createdAt: Date.now()
  };
  
  reviews.push(newReview);
  
  const targetUser = users.find(u => u.id === targetId);
  if (targetUser) {
    const userReviews = reviews.filter(r => r.targetId === targetId);
    const avg = userReviews.reduce((sum, r) => sum + r.rating, 0) / userReviews.length;
    targetUser.rating = Number(avg.toFixed(1));
    targetUser.reviewCount = userReviews.length;
  }
  
  res.status(201).json(newReview);
});

app.post("/api/admin/verify/:id", authenticateToken, (req: any, res) => {
  const admin = users.find(u => u.id === req.user.id);
  if (!admin || admin.email !== ADMIN_EMAIL) return res.status(403).json({ message: "Sem permissão" });
  
  const user = users.find(u => u.id === req.params.id);
  if (user) {
    user.verified = true;
    res.json({ message: "Utilizador verificado", user });
  } else {
    res.status(404).json({ message: "Utilizador não encontrado" });
  }
});

app.get("/api/admin/stats", authenticateToken, (req: any, res) => {
  const user = users.find(u => u.id === req.user.id);
  if (!user || user.email !== ADMIN_EMAIL) {
    return res.status(403).json({ message: "Acesso negado. Apenas o administrador pode ver estas estatísticas." });
  }

  const totalUsers = users.length;
  const totalJobs = jobs.length;
  const activeJobs = jobs.filter(j => j.status !== 'completed').length;
  const completedJobs = jobs.filter(j => j.status === 'completed').length;
  const totalEscrow = jobs.reduce((sum, j) => sum + (j.status === 'completed' ? 0 : j.price), 0);
  
  // Growth simulation or real data if available
  const dailyActivity = [
    { name: 'Seg', valor: jobs.filter(j => new Date(j.createdAt).getDay() === 1).length * 100 },
    { name: 'Ter', valor: jobs.filter(j => new Date(j.createdAt).getDay() === 2).length * 100 },
    { name: 'Qua', valor: jobs.filter(j => new Date(j.createdAt).getDay() === 3).length * 100 },
    { name: 'Qui', valor: jobs.filter(j => new Date(j.createdAt).getDay() === 4).length * 100 },
    { name: 'Sex', valor: jobs.filter(j => new Date(j.createdAt).getDay() === 5).length * 100 },
    { name: 'Sáb', valor: jobs.filter(j => new Date(j.createdAt).getDay() === 6).length * 100 },
    { name: 'Dom', valor: jobs.filter(j => new Date(j.createdAt).getDay() === 0).length * 100 },
  ];

  res.json({
    totalUsers,
    totalJobs,
    activeJobs,
    completedJobs,
    totalEscrow,
    dailyActivity
  });
});

app.get("/api/notifications/stream", authenticateToken, (req: any, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  const clientId = Date.now();
  const newClient = { id: clientId, userId: req.user.id, res };
  notificationClients.push(newClient);

  req.on('close', () => {
    notificationClients = notificationClients.filter(c => c.id !== clientId);
  });
});

app.get("/api/notifications", authenticateToken, (req: any, res) => {
  const userNotifications = notifications.filter(n => n.userId === req.user.id).reverse();
  res.json(userNotifications);
});

app.post("/api/notifications/read", authenticateToken, (req: any, res) => {
  notifications
    .filter(n => n.userId === req.user.id)
    .forEach(n => n.read = true);
  res.json({ message: "Notificações lidas" });
});

app.get("/api/me", authenticateToken, (req: any, res) => {
  const user = users.find(u => u.id === req.user.id);
  res.json({ user });
});

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", usersCount: users.length });
});

// API Routes - CHAT
app.get("/api/jobs/:id/messages", authenticateToken, (req: any, res) => {
  const jobMessages = messages.filter(m => m.jobId === req.params.id);
  res.json(jobMessages);
});

app.post("/api/jobs/:id/messages", authenticateToken, (req: any, res) => {
  const { content, type } = req.body;
  const newMessage = {
    id: Math.random().toString(36).substring(2, 9),
    jobId: req.params.id,
    senderId: req.user.id,
    content,
    type: type || 'text',
    timestamp: Date.now()
  };
  messages.push(newMessage);
  res.json(newMessage);
});

app.get("/api/jobs/search", authenticateToken, (req: any, res) => {
  const { q, category, urgency, minPrice, maxPrice, sortBy } = req.query;
  
  let results = jobs.filter(j => j.status === 'open');

  if (q) {
    const query = q.toString().toLowerCase();
    results = results.filter(j => 
      j.title.toLowerCase().includes(query) || 
      j.description.toLowerCase().includes(query) ||
      j.category.toLowerCase().includes(query)
    );
  }

  if (category) {
    results = results.filter(j => j.category === category);
  }

  if (urgency) {
    results = results.filter(j => j.urgency === urgency);
  }

  if (minPrice) {
    results = results.filter(j => j.price >= Number(minPrice));
  }

  if (maxPrice) {
    results = results.filter(j => j.price <= Number(maxPrice));
  }

  // AI-inspired sorting/suggestions
  if (sortBy === 'urgent') {
    results.sort((a, b) => {
      const urgencyMap: Record<string, number> = { high: 3, medium: 2, low: 1 };
      return urgencyMap[b.urgency] - urgencyMap[a.urgency];
    });
  } else if (sortBy === 'price') {
    results.sort((a, b) => b.price - a.price);
  } else {
    results.sort((a, b) => b.createdAt - a.createdAt);
  }

  res.json(results);
});

// Expanded API Routes - JOBS
app.post("/api/jobs", authenticateToken, (req: any, res) => {
  const { title, description, category, price, urgency, location } = req.body;
  const user = users.find(u => u.id === req.user.id);
  
  if (!title || !category || !location || !price) {
    return res.status(400).json({ message: "Todos os campos obrigatórios devem ser preenchidos" });
  }

  if (!JOB_CATEGORIES.includes(category)) {
    return res.status(400).json({ message: "Categoria de trabalho inválida" });
  }

  if (user.balance < price) {
    return res.status(400).json({ message: "Saldo insuficiente para bloquear o valor em escrow" });
  }

  // Deduct from balance to escrow
  user.balance -= price;
  user.pendingBalance += (user.pendingBalance || 0) + Number(price);

  const newJob = {
    id: Math.random().toString(36).substring(2, 9),
    clientId: req.user.id,
    providerId: null,
    title,
    description,
    category,
    price: Number(price),
    urgency: urgency || 'medium',
    location,
    status: 'open', 
    paymentStatus: 'escrowed', 
    createdAt: Date.now(),
    updates: [{ status: 'open', timestamp: Date.now(), note: 'Trabalho publicado (Valor bloqueado em Escrow)' }]
  };
  jobs.push(newJob);

  // Notify providers in the same category
  users.filter(u => u.role === 'provider' && u.id !== req.user.id).forEach(provider => {
    const notification = {
      id: Math.random().toString(36).substring(2, 9),
      userId: provider.id,
      title: "Novo Job Disponível!",
      message: `Um novo trabalho de "${category}" foi publicado: ${title}`,
      type: 'new_job',
      createdAt: Date.now(),
      read: false,
      data: { jobId: newJob.id }
    };
    notifications.push(notification);
    sendNotification(provider.id, notification);
  });

  res.json(newJob);
});

app.post("/api/jobs/:id/proposals", authenticateToken, (req: any, res) => {
  const { price, coverLetter } = req.body;
  const job = jobs.find(j => j.id === req.params.id);
  if (!job) return res.status(404).json({ message: "Job não encontrado" });

  const provider = users.find(u => u.id === req.user.id);
  const notification = {
    id: Math.random().toString(36).substring(2, 9),
    userId: job.clientId,
    title: "Nova Proposta Recebida",
    message: `Você recebeu uma proposta de ${provider?.name || 'um prestador'} para o job: ${job.title}`,
    type: 'new_proposal',
    createdAt: Date.now(),
    read: false,
    data: { jobId: job.id }
  };
  notifications.push(notification);
  sendNotification(job.clientId, notification);

  res.status(201).json({ message: "Proposta enviada" });
});

app.get("/api/jobs", authenticateToken, (req: any, res) => {
  const user = users.find(u => u.id === req.user.id);
  if (user.role === 'provider') {
    res.json(jobs.filter(j => j.status === 'open' || j.providerId === req.user.id));
  } else {
    res.json(jobs.filter(j => j.clientId === req.user.id));
  }
});

app.post("/api/jobs/:id/accept", authenticateToken, (req: any, res) => {
  const job = jobs.find(j => j.id === req.params.id);
  
  // CRITICAL: Strict check for status and worker_id to prevent double acceptance
  if (!job) return res.status(404).json({ message: "Trabalho não encontrado" });
  if (job.status !== 'open' || job.providerId) {
    return res.status(400).json({ message: "Trabalho já não está disponível para aceitação" });
  }

  if (job.clientId === req.user.id) {
    return res.status(400).json({ message: "Não pode aceitar o seu próprio trabalho" });
  }
  
  job.status = 'accepted';
  job.providerId = req.user.id;
  job.acceptedAt = Date.now();
  job.paymentStatus = 'escrowed';
  job.updates.push({ status: 'accepted', timestamp: Date.now(), note: 'Trabalho aceite pelo prestador' });
  
  res.json(job);
});

app.patch("/api/jobs/:id/status", authenticateToken, (req: any, res) => {
  const job = jobs.find(j => j.id === req.params.id);
  if (!job) return res.status(404).json({ message: "Trabalho não encontrado" });

  const { status, note } = req.body;
  const user = users.find(u => u.id === req.user.id);

  // Validate state transitions
  const allowedProviderTransitions: Record<string, string[]> = {
    'accepted': ['on_the_way', 'cancelled'],
    'on_the_way': ['at_location', 'cancelled'],
    'at_location': ['in_progress', 'cancelled'],
    'in_progress': ['completed'],
  };

  if (job.providerId === req.user.id) {
    if (!allowedProviderTransitions[job.status]?.includes(status)) {
       return res.status(400).json({ message: `Transição de ${job.status} para ${status} não permitida para o prestador` });
    }
  } else if (job.clientId === req.user.id) {
    // Client can basically only dispute or cancel if not started
    if (status === 'dispute' && job.status === 'completed') {
       // Proceed to dispute
    } else if (status === 'cancelled' && job.status === 'accepted') {
       // Proceed to cancel
    } else {
       return res.status(403).json({ message: "Apenas o prestador pode atualizar o progresso da execução" });
    }
  }

  job.status = status;
  job.updates.push({ status, timestamp: Date.now(), note: note || `Status alterado para ${status}` });
  res.json(job);
});

app.post("/api/jobs/:id/confirm-finish", authenticateToken, (req: any, res) => {
  const job = jobs.find(j => j.id === req.params.id);
  if (!job) return res.status(404).json({ message: "Trabalho não encontrado" });
  
  if (job.clientId !== req.user.id) {
    return res.status(403).json({ message: "Apenas o cliente pode confirmar a conclusão" });
  }

  job.status = 'completed';
  job.paymentStatus = 'released';
  job.updates.push({ status: 'completed', timestamp: Date.now(), note: 'Conclusão confirmada pelo cliente' });

  const client = users.find(u => u.id === job.clientId);
  const provider = users.find(u => u.id === job.providerId);
  
  if (client) client.pendingBalance -= job.price;
  if (provider) provider.balance += (job.price * 0.85);

  res.json(job);
});

app.post("/api/jobs/:id/rate", authenticateToken, (req: any, res) => {
  const { rating, comment, targetId } = req.body;
  reviews.push({
    jobId: req.params.id,
    fromId: req.user.id,
    toId: targetId,
    rating,
    comment,
    timestamp: Date.now()
  });

  const targetUser = users.find(u => u.id === targetId);
  if (targetUser) {
    const userReviews = reviews.filter(r => r.toId === targetId);
    const avg = userReviews.reduce((acc, r) => acc + r.rating, 0) / userReviews.length;
    targetUser.rating = avg;
  }

  res.json({ message: "Avaliação registada" });
});

app.post("/api/jobs/:id/cancel", authenticateToken, (req: any, res) => {
  const job = jobs.find(j => j.id === req.params.id);
  if (!job) return res.status(404).json({ message: "Trabalho não encontrado" });
  
  const user = users.find(u => u.id === req.user.id);
  const provider = job.providerId ? users.find(u => u.id === job.providerId) : null;

  if (job.status === 'completed' || job.status === 'cancelled') {
    return res.status(400).json({ message: "Trabalho já finalizado ou cancelado" });
  }

  // Basic penalty logic
  let refundAmount = job.price;
  if (job.status !== 'open') {
    // If job was already accepted/in progress, apply a 10% penalty
    const penalty = job.price * 0.1;
    refundAmount = job.price - penalty;
    
    // Penalty goes to the other party (simplified)
    if (user.id === job.clientId && provider) {
      provider.balance += (penalty * 0.5); // Half to provider, half to platform
    }
  }

  job.status = 'cancelled';
  job.updates.push({ status: 'cancelled', timestamp: Date.now(), note: `Trabalho cancelado por ${user.name}` });

  const client = users.find(u => u.id === job.clientId);
  if (client) {
    client.pendingBalance -= job.price;
    client.balance += refundAmount;
  }

  res.json(job);
});

// API Routes - PROFILE
app.patch("/api/me", authenticateToken, (req: any, res) => {
  const user = users.find(u => u.id === req.user.id);
  Object.assign(user, req.body);
  res.json(user);
});

app.post("/api/logout", (req, res) => {
  res.clearCookie('token');
  res.json({ message: "Logout realizado" });
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
