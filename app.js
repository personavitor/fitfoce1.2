// ═══════════════════════════════════════════
//  FITFORCE – APP ENGINE v2.0
// ═══════════════════════════════════════════

// ── SUPABASE CONFIG ─────────────────────────
// ⚠️  Substitua pelos seus dados em:
//     https://app.supabase.com → seu projeto → Settings → API
const SUPABASE_URL = 'https://tbqmsevphrsjnftiotsb.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_Wlfm0MR1he4FONCi50ltdg_xlp4U1sa';

const { createClient } = supabase;
const db = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ── STATE ──────────────────────────────────
let state = {
  currentUser: null,
  users: {},
  currentTab: 'home',
  selectedPlan: 'free',
  quizData: {
    name: null, goal: null, level: null, days: 3, place: null,
    age: null, weight: null, height: null, gender: null,
    bodyType: null, workType: null, availableTime: null,
    planIntensity: null, equipment: [],
    hasInjury: null, injuryDetail: null,
    // Nutrition quiz
    eatBreakfast: null, eatBread: null, eatEggs: null,
    eatRiceAndBeans: null, eatSweetPotato: null, mealsPerDay: null,
    foodChallenge: null, foodRestriction: null, foodBudget: null,
    // Physical test
    pushupCount: null, squatCount: null, plankTime: null
  },
  workoutPlan: null,
  activeSession: null,
  sessionTimer: null,
  weekStats: { workouts: 0, minutes: 0, kcal: 0, xp: 0 },
  nutritionLog: [],  // daily food log
  progressLog: [],   // weight/measurement logs
};

// ── CALISTHENICS PROGRESSION DATABASE ──────
const CALISTHENICS_PROGRESSIONS = {
  push: [
    { id: 'p1', name: 'Flexão de Joelho', icon: '🤸', level: 1, sets: 3, reps: '8-10', rest: '60s', kcal: 5, unlockAt: 0 },
    { id: 'p2', name: 'Flexão Normal', icon: '💪', level: 2, sets: 3, reps: '10-15', rest: '60s', kcal: 8, unlockAt: 15 },
    { id: 'p3', name: 'Flexão Diamante', icon: '💎', level: 3, sets: 3, reps: '8-12', rest: '75s', kcal: 10, unlockAt: 30 },
    { id: 'p4', name: 'Flexão Arqueiro', icon: '🏹', level: 4, sets: 3, reps: '6-10', rest: '90s', kcal: 12, unlockAt: 50 },
    { id: 'p5', name: 'Flexão 1 Braço', icon: '⚡', level: 5, sets: 3, reps: '3-6', rest: '120s', kcal: 15, unlockAt: 80 },
  ],
  pull: [
    { id: 'pu1', name: 'Remada Invertida', icon: '🔄', level: 1, sets: 3, reps: '8-10', rest: '60s', kcal: 7, unlockAt: 0 },
    { id: 'pu2', name: 'Barra Australiana', icon: '🏗️', level: 2, sets: 3, reps: '8-12', rest: '75s', kcal: 10, unlockAt: 15 },
    { id: 'pu3', name: 'Barra Fixa (Negativa)', icon: '⬇️', level: 3, sets: 3, reps: '5-8', rest: '90s', kcal: 12, unlockAt: 30 },
    { id: 'pu4', name: 'Barra Fixa Completa', icon: '🏆', level: 4, sets: 4, reps: '6-10', rest: '90s', kcal: 14, unlockAt: 50 },
    { id: 'pu5', name: 'Muscle Up', icon: '🔥', level: 5, sets: 3, reps: '3-6', rest: '120s', kcal: 18, unlockAt: 80 },
  ],
  legs: [
    { id: 'l1', name: 'Agachamento Livre', icon: '🦵', level: 1, sets: 3, reps: '15-20', rest: '60s', kcal: 10, unlockAt: 0 },
    { id: 'l2', name: 'Agachamento Sumô', icon: '🤼', level: 2, sets: 3, reps: '12-15', rest: '60s', kcal: 11, unlockAt: 15 },
    { id: 'l3', name: 'Afundo', icon: '🦿', level: 3, sets: 3, reps: '10 cada', rest: '75s', kcal: 13, unlockAt: 30 },
    { id: 'l4', name: 'Pistol Squat (apoio)', icon: '🎯', level: 4, sets: 3, reps: '6-8 cada', rest: '90s', kcal: 16, unlockAt: 50 },
    { id: 'l5', name: 'Pistol Squat', icon: '⚡', level: 5, sets: 3, reps: '5-8 cada', rest: '90s', kcal: 18, unlockAt: 80 },
  ],
  core: [
    { id: 'c1', name: 'Prancha', icon: '🧘', level: 1, sets: 3, reps: '20-30s', rest: '45s', kcal: 4, unlockAt: 0 },
    { id: 'c2', name: 'Prancha Dinâmica', icon: '🔄', level: 2, sets: 3, reps: '30-45s', rest: '45s', kcal: 6, unlockAt: 15 },
    { id: 'c3', name: 'L-Sit (chão)', icon: '🧗', level: 3, sets: 3, reps: '10-20s', rest: '60s', kcal: 8, unlockAt: 30 },
    { id: 'c4', name: 'Dragon Flag (negativa)', icon: '🐉', level: 4, sets: 3, reps: '5-8', rest: '90s', kcal: 12, unlockAt: 50 },
    { id: 'c5', name: 'Dragon Flag', icon: '🔥', level: 5, sets: 3, reps: '4-6', rest: '90s', kcal: 14, unlockAt: 80 },
  ],
  statics: [
    { id: 's1', name: 'Frog Stand', icon: '🐸', level: 1, sets: 3, reps: '10-20s', rest: '60s', kcal: 5, unlockAt: 0 },
    { id: 's2', name: 'Tuck Planche', icon: '🧘', level: 2, sets: 3, reps: '5-10s', rest: '90s', kcal: 8, unlockAt: 20 },
    { id: 's3', name: 'L-Sit na Barra', icon: '🏗️', level: 3, sets: 3, reps: '10-15s', rest: '90s', kcal: 10, unlockAt: 40 },
    { id: 's4', name: 'Handstand (parede)', icon: '🤸', level: 4, sets: 3, reps: '15-30s', rest: '90s', kcal: 12, unlockAt: 60 },
    { id: 's5', name: 'Planche Completa', icon: '⚡', level: 5, sets: 3, reps: '5-10s', rest: '120s', kcal: 15, unlockAt: 90 },
  ]
};

// ── WORKOUT DATABASE ────────────────────────
const EXERCISES = {
  chest: [
    { name: 'Supino Reto', icon: '🏋️', sets: 4, reps: '8-12', rest: '90s', kcal: 15 },
    { name: 'Supino Inclinado', icon: '🏋️', sets: 3, reps: '10-12', rest: '90s', kcal: 13 },
    { name: 'Crossover', icon: '🔗', sets: 3, reps: '12-15', rest: '60s', kcal: 10 },
    { name: 'Flexão', icon: '🤸', sets: 4, reps: '15-20', rest: '60s', kcal: 8 },
    { name: 'Peck Deck', icon: '🦋', sets: 3, reps: '12-15', rest: '60s', kcal: 10 },
  ],
  back: [
    { name: 'Puxada Frente', icon: '🏋️', sets: 4, reps: '8-12', rest: '90s', kcal: 15 },
    { name: 'Remada Curvada', icon: '⛏️', sets: 4, reps: '8-12', rest: '90s', kcal: 15 },
    { name: 'Remada Unilateral', icon: '💪', sets: 3, reps: '10-12', rest: '75s', kcal: 12 },
    { name: 'Pulldown', icon: '⬇️', sets: 3, reps: '12-15', rest: '60s', kcal: 11 },
    { name: 'Barra Fixa', icon: '🏗️', sets: 4, reps: '6-10', rest: '120s', kcal: 14 },
  ],
  legs: [
    { name: 'Agachamento', icon: '🦵', sets: 4, reps: '8-12', rest: '120s', kcal: 20 },
    { name: 'Leg Press', icon: '🦿', sets: 4, reps: '10-15', rest: '90s', kcal: 18 },
    { name: 'Extensão', icon: '🦵', sets: 3, reps: '12-15', rest: '75s', kcal: 12 },
    { name: 'Stiff', icon: '🏋️', sets: 3, reps: '10-12', rest: '90s', kcal: 14 },
    { name: 'Cadeira Flexora', icon: '💺', sets: 3, reps: '12-15', rest: '60s', kcal: 11 },
    { name: 'Panturrilha', icon: '🦶', sets: 4, reps: '15-20', rest: '60s', kcal: 7 },
  ],
  shoulders: [
    { name: 'Desenvolvimento', icon: '🏋️', sets: 4, reps: '8-12', rest: '90s', kcal: 13 },
    { name: 'Elevação Lateral', icon: '↔️', sets: 3, reps: '12-15', rest: '60s', kcal: 9 },
    { name: 'Elevação Frontal', icon: '⬆️', sets: 3, reps: '12-15', rest: '60s', kcal: 9 },
    { name: 'Encolhimento', icon: '🤷', sets: 3, reps: '12-15', rest: '60s', kcal: 8 },
    { name: 'Arnold Press', icon: '🏆', sets: 3, reps: '10-12', rest: '75s', kcal: 11 },
  ],
  arms: [
    { name: 'Rosca Direta', icon: '💪', sets: 4, reps: '10-12', rest: '75s', kcal: 9 },
    { name: 'Rosca Martelo', icon: '🔨', sets: 3, reps: '12', rest: '60s', kcal: 8 },
    { name: 'Tríceps Pulley', icon: '🔽', sets: 4, reps: '12-15', rest: '60s', kcal: 9 },
    { name: 'Tríceps Testa', icon: '🧠', sets: 3, reps: '10-12', rest: '75s', kcal: 8 },
    { name: 'Rosca Concentrada', icon: '🎯', sets: 3, reps: '12', rest: '60s', kcal: 7 },
  ],
  core: [
    { name: 'Prancha', icon: '🧘', sets: 3, reps: '45s', rest: '45s', kcal: 5 },
    { name: 'Abdominal Crunch', icon: '🤸', sets: 4, reps: '20', rest: '45s', kcal: 6 },
    { name: 'Mountain Climber', icon: '🧗', sets: 3, reps: '30s', rest: '30s', kcal: 8 },
    { name: 'Russian Twist', icon: '🔄', sets: 3, reps: '20', rest: '45s', kcal: 6 },
    { name: 'Leg Raise', icon: '🦵', sets: 3, reps: '15', rest: '45s', kcal: 5 },
  ],
  cardio: [
    { name: 'Esteira (30min)', icon: '🏃', sets: 1, reps: '30min', rest: '-', kcal: 300 },
    { name: 'Bike (20min)', icon: '🚴', sets: 1, reps: '20min', rest: '-', kcal: 200 },
    { name: 'Pular Corda', icon: '⚡', sets: 4, reps: '3min', rest: '1min', kcal: 150 },
    { name: 'Burpees', icon: '🔥', sets: 4, reps: '15', rest: '60s', kcal: 50 },
    { name: 'HIIT Sprint', icon: '⚡', sets: 8, reps: '30s', rest: '30s', kcal: 120 },
  ],
  bodyweight: [
    { name: 'Flexão', icon: '🤸', sets: 4, reps: '15-20', rest: '60s', kcal: 8 },
    { name: 'Agachamento Livre', icon: '🦵', sets: 4, reps: '20', rest: '60s', kcal: 12 },
    { name: 'Afundo', icon: '🦵', sets: 3, reps: '12 cada', rest: '60s', kcal: 10 },
    { name: 'Barra Fixa', icon: '🏗️', sets: 3, reps: 'máx', rest: '90s', kcal: 12 },
    { name: 'Dips', icon: '⬇️', sets: 3, reps: '12-15', rest: '75s', kcal: 10 },
  ]
};

const WORKOUT_TEMPLATES = {
  'Perda de peso-Iniciante-3': [
    { day: 'Seg', name: 'Full Body A', muscle: 'Corpo Inteiro', groups: ['bodyweight', 'cardio', 'core'], duration: 45, kcal: 380 },
    { day: 'Qua', name: 'Cardio + Core', muscle: 'Cardio', groups: ['cardio', 'core'], duration: 35, kcal: 320 },
    { day: 'Sex', name: 'Full Body B', muscle: 'Corpo Inteiro', groups: ['bodyweight', 'core'], duration: 45, kcal: 350 },
  ],
  'Perda de peso-Intermediário-4': [
    { day: 'Seg', name: 'Superior + Cardio', muscle: 'Superior', groups: ['chest', 'back', 'cardio'], duration: 55, kcal: 450 },
    { day: 'Ter', name: 'HIIT', muscle: 'Cardio', groups: ['cardio', 'core'], duration: 40, kcal: 400 },
    { day: 'Qui', name: 'Inferior + Cardio', muscle: 'Inferior', groups: ['legs', 'core', 'cardio'], duration: 55, kcal: 480 },
    { day: 'Sex', name: 'Full Body + HIIT', muscle: 'Corpo Inteiro', groups: ['bodyweight', 'cardio'], duration: 50, kcal: 500 },
  ],
  'Ganho de massa-Intermediário-4': [
    { day: 'Seg', name: 'Treino A – Peito/Tríceps', muscle: 'Peito + Tríceps', groups: ['chest', 'arms'], duration: 60, kcal: 350 },
    { day: 'Ter', name: 'Treino B – Costas/Bíceps', muscle: 'Costas + Bíceps', groups: ['back', 'arms'], duration: 60, kcal: 370 },
    { day: 'Qui', name: 'Treino C – Pernas', muscle: 'Pernas', groups: ['legs', 'core'], duration: 65, kcal: 420 },
    { day: 'Sex', name: 'Treino D – Ombros', muscle: 'Ombros + Braços', groups: ['shoulders', 'arms'], duration: 55, kcal: 330 },
  ],
  'Ganho de massa-Avançado-5': [
    { day: 'Seg', name: 'Peito', muscle: 'Peito', groups: ['chest', 'core'], duration: 65, kcal: 360 },
    { day: 'Ter', name: 'Costas', muscle: 'Costas', groups: ['back'], duration: 65, kcal: 380 },
    { day: 'Qua', name: 'Pernas', muscle: 'Pernas', groups: ['legs'], duration: 70, kcal: 450 },
    { day: 'Qui', name: 'Ombros', muscle: 'Ombros', groups: ['shoulders', 'arms'], duration: 60, kcal: 330 },
    { day: 'Sex', name: 'Braços + Core', muscle: 'Braços + Core', groups: ['arms', 'core'], duration: 55, kcal: 280 },
  ],
};

function getTemplateKey(goal, level, days) {
  const key = `${goal}-${level}-${days}`;
  if (WORKOUT_TEMPLATES[key]) return WORKOUT_TEMPLATES[key];
  return buildFallbackTemplate(goal, level, days);
}

function buildFallbackTemplate(goal, level, days) {
  const splits = [];
  const dayNames = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  const isWeight = goal.includes('peso') || goal.includes('Condicionamento');
  const templates = [
    { name: 'Full Body', muscle: 'Corpo Inteiro', groups: isWeight ? ['bodyweight','cardio','core'] : ['chest','back','legs'], duration: 50, kcal: 380 },
    { name: 'Superior', muscle: 'Superior', groups: ['chest','back','shoulders'], duration: 55, kcal: 360 },
    { name: 'Inferior', muscle: 'Inferior', groups: ['legs','core'], duration: 60, kcal: 400 },
    { name: 'Push', muscle: 'Empurrar', groups: ['chest','shoulders','arms'], duration: 55, kcal: 340 },
    { name: 'Pull', muscle: 'Puxar', groups: ['back','arms'], duration: 55, kcal: 350 },
    { name: 'Cardio', muscle: 'Cardio + Core', groups: ['cardio','core'], duration: 40, kcal: 380 },
  ];
  for (let i = 0; i < Math.min(days, 6); i++) {
    splits.push({ ...templates[i % templates.length], day: dayNames[i] });
  }
  return splits;
}

function buildWorkout(templateDay) {
  const exercises = [];
  templateDay.groups.forEach(group => {
    const pool = EXERCISES[group] || [];
    const count = group === 'cardio' ? 1 : Math.min(2, pool.length);
    shuffleArr(pool).slice(0, count).forEach(ex => exercises.push({ ...ex, group }));
  });
  return exercises;
}

function shuffleArr(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ── TDEE CALCULATION ─────────────────────────
function calculateTDEE(user) {
  const { age, weight, height, gender, workType, days } = user.quizData || {};
  if (!age || !weight || !height) return 2000;

  // Harris-Benedict BMR
  let bmr;
  if (gender === 'Masculino') {
    bmr = 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age);
  } else {
    bmr = 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age);
  }

  // Activity multiplier
  let activityMultiplier = 1.375; // default moderate
  if (workType === 'Sedentário (escritório)') activityMultiplier = 1.2;
  else if (workType === 'Levemente ativo') activityMultiplier = 1.375;
  else if (workType === 'Muito ativo (físico)') activityMultiplier = 1.725;

  // Add workout days
  const workoutBonus = (days || 3) * 50;
  return Math.round(bmr * activityMultiplier + workoutBonus);
}

function calculateMacros(tdee, goal) {
  let target = tdee;
  if (goal === 'Emagrecer') target = Math.round(tdee * 0.8);
  else if (goal === 'Ganhar massa') target = Math.round(tdee * 1.1);

  const protein = Math.round((target * 0.3) / 4);
  const carbs = Math.round((target * 0.45) / 4);
  const fat = Math.round((target * 0.25) / 9);

  return { calories: target, protein, carbs, fat };
}

// ── CALISTHENICS LEVEL SYSTEM ─────────────────
function getUserCalisthenicsLevel(user) {
  const pushups = user.quizData?.pushupCount || 0;
  if (pushups >= 15) return 3;
  if (pushups >= 6) return 2;
  return 1;
}

function getProgressionExercise(category, userLevel) {
  const exercises = CALISTHENICS_PROGRESSIONS[category] || [];
  // Find the most advanced exercise the user can do
  const available = exercises.filter(ex => userLevel * 20 >= ex.unlockAt);
  return available[available.length - 1] || exercises[0];
}

function getCalisthenicsWorkout(user) {
  const level = getUserCalisthenicsLevel(user);
  const days = user.quizData?.days || 3;
  const dayNames = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  const pushEx = getProgressionExercise('push', level);
  const pullEx = getProgressionExercise('pull', level);
  const legsEx = getProgressionExercise('legs', level);
  const coreEx = getProgressionExercise('core', level);
  const staticEx = getProgressionExercise('statics', level);

  const templates = [
    {
      name: 'Push Day',
      muscle: 'Empurrar',
      exercises: [pushEx, coreEx],
      duration: 40, kcal: 280
    },
    {
      name: 'Pull Day',
      muscle: 'Puxar',
      exercises: [pullEx, staticEx],
      duration: 40, kcal: 260
    },
    {
      name: 'Legs & Core',
      muscle: 'Pernas + Core',
      exercises: [legsEx, coreEx],
      duration: 45, kcal: 300
    },
    {
      name: 'Full Body',
      muscle: 'Corpo Inteiro',
      exercises: [pushEx, pullEx, legsEx],
      duration: 55, kcal: 380
    },
    {
      name: 'Estáticos',
      muscle: 'Controle Corporal',
      exercises: [staticEx, coreEx],
      duration: 35, kcal: 200
    },
    {
      name: 'Freestyle',
      muscle: 'Habilidade',
      exercises: [pushEx, pullEx, staticEx],
      duration: 50, kcal: 320
    },
  ];

  return Array.from({ length: Math.min(days, 6) }, (_, i) => ({
    ...templates[i % templates.length],
    day: dayNames[i],
    completed: false
  }));
}

// ── AUTH ────────────────────────────────────
async function handleLogin() {
  const email = document.getElementById('login-email').value.trim();
  const pwd = document.getElementById('login-password').value;
  if (!email || !pwd) { showToast('⚠️ Preencha todos os campos'); return; }

  const btn = document.querySelector('#login-form .btn-primary');
  btn.textContent = 'Entrando...'; btn.disabled = true;

  const { data, error } = await db.auth.signInWithPassword({ email, password: pwd });
  btn.textContent = 'ENTRAR'; btn.disabled = false;

  if (error) {
    if (error.message.includes('Email not confirmed')) {
      showToast('📧 Confirme seu e-mail — ou desative isso no Supabase (Auth → Settings)');
    } else if (error.message.includes('Invalid')) {
      showToast('❌ E-mail ou senha incorretos');
    } else {
      showToast('❌ ' + error.message);
    }
    return;
  }

  const hasData = await loadData();
  if (hasData && state.currentUser) {
    if (state.currentUser.workoutPlan) {
      state.workoutPlan = state.currentUser.workoutPlan;
      launchApp();
    } else {
      showScreen('onboarding');
    }
  }
}

async function handleRegister() {
  const name = document.getElementById('reg-name').value.trim();
  const email = document.getElementById('reg-email').value.trim();
  const pwd = document.getElementById('reg-password').value;
  if (!name || !email || !pwd) { showToast('⚠️ Preencha todos os campos'); return; }
  if (pwd.length < 8) { showToast('⚠️ Senha deve ter 8+ caracteres'); return; }

  const btn = document.querySelector('#register-form .btn-primary');
  btn.textContent = 'Criando conta...'; btn.disabled = true;

  const { data, error } = await db.auth.signUp({
    email, password: pwd,
    options: { data: { name } }
  });
  btn.textContent = 'CRIAR CONTA →'; btn.disabled = false;

  if (error) { showToast('❌ ' + error.message); return; }
  if (!data.user) { showToast('❌ Erro ao criar conta'); return; }

  // Aguarda o trigger do Supabase criar o perfil antes de continuar
  await new Promise(r => setTimeout(r, 1000));

  // Atualiza o perfil com nome e plano (o trigger pode não ter o nome ainda)
  await db.from('profiles').upsert({
    id: data.user.id,
    name,
    plan: state.selectedPlan,
    friend_code: Math.random().toString(36).substr(2, 6).toUpperCase(),
  }, { onConflict: 'id' });

  // Monta o usuário localmente sem precisar do loadData (evita erro de email não confirmado)
  const newUser = {
    id: data.user.id,
    name,
    email,
    plan: state.selectedPlan,
    xp: 0, level: 1, streak: 0, maxStreak: 0,
    totalWorkouts: 0, totalMinutes: 0,
    lastWorkout: null,
    friendCode: genCode(),
    friends: [], challenges: [],
    workoutHistory: [],
    nutritionLog: [],
    progressLog: [],
    workoutDays: new Set(),
    quizData: {},
    tdee: null,
    macros: null,
    calisthenicsLevel: 1,
    isCalisthenics: false,
    workoutPlan: null,
  };

  seedDemoFriends(newUser);
  state.users[newUser.id] = newUser;
  state.currentUser = newUser;

  showToast('✅ Conta criada!');
  showScreen('onboarding');
}

function seedDemoFriends(user) {
  const demoFriends = [
    { id: 'demo1', name: 'Carlos Silva', xp: 2340, level: 5, streak: 12, plan: 'pro', friendCode: 'DEMO01' },
    { id: 'demo2', name: 'Ana Oliveira', xp: 1890, level: 4, streak: 7, plan: 'elite', friendCode: 'DEMO02' },
    { id: 'demo3', name: 'Pedro Lima', xp: 980, level: 2, streak: 3, plan: 'free', friendCode: 'DEMO03' },
    { id: 'demo4', name: 'Julia Costa', xp: 3100, level: 6, streak: 21, plan: 'elite', friendCode: 'DEMO04' },
  ];
  demoFriends.forEach(f => {
    state.users[f.id] = { ...f, email: '', password: '', friends: [], challenges: [], workoutHistory: [], workoutDays: new Set() };
    user.friends.push(f.id);
  });
  user.challenges = [
    { id: 'c1', type: 'workouts', typeLabel: 'Mais treinos em 7 dias', challenger: 'demo1', challengerName: 'Carlos Silva', myScore: 3, theirScore: 5, duration: 7, daysLeft: 4, status: 'active', bet: 'Almoço grátis 🍔' },
    { id: 'c2', type: 'streak', typeLabel: 'Maior sequência', challenger: 'demo4', challengerName: 'Julia Costa', myScore: 0, theirScore: 0, duration: 14, daysLeft: 14, status: 'pending', bet: '' }
  ];
}

function genCode() {
  return Math.random().toString(36).substr(2, 6).toUpperCase();
}

function loginUser(user) {
  state.currentUser = user;
  if (!user.workoutPlan) {
    showScreen('onboarding');
  } else {
    state.workoutPlan = user.workoutPlan;
    launchApp();
  }
}

async function logout() {
  await db.auth.signOut();
  state.currentUser = null;
  state.users = {};
  showScreen('auth');
  showToast('👋 Até logo!');
}

function showRegister() {
  document.getElementById('login-form').classList.add('hidden');
  document.getElementById('register-form').classList.remove('hidden');
}
function showLogin() {
  document.getElementById('register-form').classList.add('hidden');
  document.getElementById('login-form').classList.remove('hidden');
}

function selectPlan(plan, el) {
  state.selectedPlan = plan;
  document.querySelectorAll('.plan-card').forEach(c => c.classList.remove('selected'));
  el.classList.add('selected');
}

// ── ONBOARDING ──────────────────────────────
function selectOption(el, key, value) {
  const parent = el.parentElement;
  parent.querySelectorAll('.option-card, .option-row').forEach(c => c.classList.remove('selected'));
  el.classList.add('selected');
  state.quizData[key] = value;
}

function selectDays(el, days) {
  document.querySelectorAll('.day-btn').forEach(b => b.classList.remove('selected'));
  el.classList.add('selected');
  state.quizData.days = days;
  document.getElementById('days-label').textContent = `${days} dias por semana`;
}

function selectFoodOption(el, key, value) {
  const group = el.closest('.food-options');
  group.querySelectorAll('.food-btn').forEach(b => b.classList.remove('selected'));
  el.classList.add('selected');
  state.quizData[key] = value;
}

function nextStep(step) {
  document.querySelectorAll('.quiz-step').forEach(s => s.classList.remove('active'));
  document.getElementById(`step${step}`).classList.add('active');
  const totalSteps = 8;
  document.querySelectorAll('.step-dot').forEach((d, i) => {
    d.classList.toggle('active', i === step - 1);
    d.classList.toggle('done', i < step - 1);
  });
  document.getElementById('step-label').textContent = `Passo ${step} de ${totalSteps}`;
}

function generateWorkout() {
  const age = document.getElementById('q-age').value;
  const weight = document.getElementById('q-weight').value;
  const height = document.getElementById('q-height').value;
  const gender = document.getElementById('q-gender').value;
  if (!age || !weight || !height || !gender) { showToast('⚠️ Preencha seus dados físicos'); return; }
  // Save name if provided
  if (state.quizData.name && state.currentUser) state.currentUser.name = state.quizData.name;
  state.quizData = { ...state.quizData, age: +age, weight: +weight, height: +height, gender };
  showScreen('generating');
  runGenerationAnimation();
}

function runGenerationAnimation() {
  const fill = document.getElementById('gen-fill');
  const steps = [1,2,3,4,5,6];
  let i = 0;
  const iv = setInterval(() => {
    if (i >= steps.length) { clearInterval(iv); setTimeout(buildAndLaunch, 600); return; }
    const el = document.getElementById(`gs${steps[i]}`);
    if (el) el.classList.add('active');
    fill.style.width = ((i+1)/steps.length*100) + '%';
    i++;
  }, 600);
}

function buildAndLaunch() {
  const { goal, level, days } = state.quizData;

  // Save quiz data to user
  state.currentUser.quizData = { ...state.quizData };

  // Calculate TDEE and macros
  const tdee = calculateTDEE(state.currentUser);
  const macros = calculateMacros(tdee, goal || 'Manter');
  state.currentUser.tdee = tdee;
  state.currentUser.macros = macros;

  // Determine calisthenics level
  state.currentUser.calisthenicsLevel = getUserCalisthenicsLevel(state.currentUser);

  // Build workout plan
  const isCalisthenics = (state.quizData.place || '').includes('casa') || (state.quizData.place || '').includes('livre');
  let workoutPlan;

  if (isCalisthenics) {
    workoutPlan = getCalisthenicsWorkout(state.currentUser);
  } else {
    const template = getTemplateKey(goal || 'Saúde geral', level || 'Iniciante', days || 3);
    workoutPlan = template.map(t => ({
      ...t,
      exercises: buildWorkout(t),
      completed: false
    }));
  }

  state.workoutPlan = workoutPlan;
  state.currentUser.workoutPlan = workoutPlan;
  state.currentUser.isCalisthenics = isCalisthenics;

  saveData();
  launchApp();
}

// ── APP LAUNCH ──────────────────────────────
function launchApp() {
  showScreen('app');
  updateUI();
  setInterval(updateStreakCheck, 60000);
}

function updateUI() {
  const u = state.currentUser;
  if (!u) return;

  document.getElementById('user-avatar').textContent = u.name.charAt(0).toUpperCase();
  document.getElementById('user-name-display').textContent = u.name.split(' ')[0];
  document.getElementById('user-plan-display').textContent = u.plan.toUpperCase();
  document.getElementById('streak-count').textContent = u.streak;

  const now = new Date();
  const hrs = now.getHours();
  const greeting = hrs < 12 ? 'Bom dia! ☀️' : hrs < 18 ? 'Boa tarde! 💪' : 'Boa noite! 🌙';
  document.getElementById('home-greeting').textContent = greeting + ' ' + u.name.split(' ')[0];
  document.getElementById('home-date').textContent = now.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });

  document.getElementById('home-streak').textContent = u.streak;
  renderStreakWeek();
  renderTodayPreview();

  const lvl = u.level;
  const xpInLvl = u.xp - (lvl - 1) * 500;
  const xpNeeded = lvl * 500;
  document.getElementById('user-level').textContent = lvl;
  document.getElementById('user-xp').textContent = `${u.xp} / ${lvl * 500} XP`;
  document.getElementById('xp-fill').style.width = Math.min(100, (xpInLvl / xpNeeded) * 100) + '%';

  const ws = computeWeekStats();
  document.getElementById('week-workouts').textContent = ws.workouts;
  document.getElementById('week-minutes').textContent = ws.minutes;
  document.getElementById('week-kcal').textContent = ws.kcal;
  document.getElementById('week-xp').textContent = ws.xp;

  renderWorkoutPlan();
  renderRanking('friends');
  renderChallenges();
  renderProfile();
  renderNutrition();
  renderProgress();
}

function computeWeekStats() {
  const u = state.currentUser;
  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const recent = (u.workoutHistory || []).filter(w => w.date > weekAgo);
  return {
    workouts: recent.length,
    minutes: recent.reduce((s, w) => s + (w.minutes || 0), 0),
    kcal: recent.reduce((s, w) => s + (w.kcal || 0), 0),
    xp: recent.reduce((s, w) => s + (w.xp || 0), 0),
  };
}

function renderStreakWeek() {
  const container = document.getElementById('streak-week');
  const days = 7;
  const today = new Date();
  container.innerHTML = '';
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today); d.setDate(d.getDate() - i);
    const key = d.toDateString();
    const done = (state.currentUser.workoutHistory || []).some(w => new Date(w.date).toDateString() === key);
    const isToday = i === 0;
    const dot = document.createElement('div');
    dot.className = 'streak-dot' + (isToday ? ' today' : done ? ' done' : '');
    container.appendChild(dot);
  }
}

function renderTodayPreview() {
  if (!state.workoutPlan) return;
  const todayName = new Date().toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '');
  const todayMap = { 'seg': 'Seg', 'ter': 'Ter', 'qua': 'Qua', 'qui': 'Qui', 'sex': 'Sex', 'sáb': 'Sáb', 'dom': 'Dom' };
  const key = todayMap[todayName.toLowerCase()] || '';
  const plan = state.workoutPlan.find(p => p.day === key) || state.workoutPlan[0];
  if (!plan) return;
  document.getElementById('today-type').textContent = plan.muscle || plan.name;
  document.getElementById('today-exercises').textContent = plan.exercises?.length || 0;
  document.getElementById('today-duration').textContent = plan.duration + 'min';
  document.getElementById('today-kcal').textContent = plan.kcal;
}

function renderWorkoutPlan() {
  if (!state.workoutPlan) return;
  const container = document.getElementById('workout-days');
  container.innerHTML = '';
  const today = new Date().toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '');
  const todayMap = { 'seg': 'Seg', 'ter': 'Ter', 'qua': 'Qua', 'qui': 'Qui', 'sex': 'Sex', 'sáb': 'Sáb', 'dom': 'Dom' };
  const todayKey = todayMap[today.toLowerCase()] || '';
  const completedToday = (state.currentUser.workoutHistory || []).some(w => new Date(w.date).toDateString() === new Date().toDateString());

  state.workoutPlan.forEach((plan, idx) => {
    const isToday = plan.day === todayKey;
    const card = document.createElement('div');
    card.className = 'day-card' + (isToday ? ' today-card-day' : '');

    let badgeClass = '', badgeText = '';
    if (isToday && completedToday) { badgeClass = 'done'; badgeText = '✓ FEITO'; }
    else if (isToday) { badgeClass = ''; badgeText = 'HOJE'; }
    else { badgeClass = ''; badgeText = plan.day; }

    // Show calisthenics level badge if applicable
    const isCali = state.currentUser.isCalisthenics;
    const levelBadge = isCali ? `<span class="cali-badge">🤸 Calistenia</span>` : '';

    card.innerHTML = `
      <div class="day-header" onclick="toggleDayCard(this)">
        <div>
          <div class="day-name">${plan.name} ${levelBadge}</div>
          <div class="day-type">${plan.muscle} · ${plan.exercises?.length || 0} exercícios · ${plan.duration}min</div>
        </div>
        <div class="day-badge ${badgeClass}">${badgeText}</div>
      </div>
      <div class="day-exercises" style="display:none">
        ${(plan.exercises || []).map(ex => `
          <div class="exercise-item">
            <div class="ex-icon">${ex.icon}</div>
            <div class="ex-info">
              <div class="ex-name">${ex.name}</div>
              <div class="ex-meta">${ex.sets} séries × ${ex.reps} · Descanso: ${ex.rest}</div>
              ${ex.level ? `<div class="ex-level">Nível ${ex.level}</div>` : ''}
            </div>
          </div>
        `).join('')}
        <button class="start-day-btn" onclick="startSession(${idx})">▶ INICIAR ESTE TREINO</button>
      </div>
    `;
    container.appendChild(card);
  });

  // Calisthenics progression panel
  if (state.currentUser.isCalisthenics) {
    renderCalisthenicsProgress(container);
  }
}

function renderCalisthenicsProgress(container) {
  const userLevel = state.currentUser.calisthenicsLevel || 1;
  const panel = document.createElement('div');
  panel.className = 'cali-progression-panel';
  panel.innerHTML = `
    <div class="section-header" style="margin-top:24px">
      <h3>🏆 Progressão Calistenia</h3>
      <span class="badge-today">Nível ${userLevel}</span>
    </div>
    ${Object.entries(CALISTHENICS_PROGRESSIONS).map(([cat, exercises]) => {
      const current = getProgressionExercise(cat, userLevel);
      const next = exercises.find(e => e.level > current.level);
      const catNames = { push: 'Empurrar', pull: 'Puxar', legs: 'Pernas', core: 'Core', statics: 'Estáticos' };
      return `
        <div class="cali-prog-card">
          <div class="cali-prog-header">
            <span class="cali-cat">${catNames[cat] || cat}</span>
            <span class="cali-current">${current.icon} ${current.name}</span>
          </div>
          ${next ? `
            <div class="cali-next">
              <span>Próximo: ${next.icon} ${next.name}</span>
              <span class="cali-req">Desbloqueio: ${next.unlockAt} pts XP</span>
            </div>
          ` : '<div class="cali-next cali-max">🏆 Nível máximo desbloqueado!</div>'}
        </div>
      `;
    }).join('')}
  `;
  container.appendChild(panel);
}

function toggleDayCard(header) {
  const exSection = header.nextElementSibling;
  exSection.style.display = exSection.style.display === 'none' ? 'block' : 'none';
}

// ── SESSION ─────────────────────────────────
let sessionStartTime = null;
let sessionInterval = null;
let sessionDoneCount = 0;

function startSession(planIdx) {
  const plan = state.workoutPlan[planIdx];
  if (!plan) return;

  sessionStartTime = Date.now();
  sessionDoneCount = 0;
  const modal = document.getElementById('modal-session');
  modal.classList.remove('hidden');

  document.getElementById('session-name').textContent = plan.name;
  document.getElementById('s-total').textContent = plan.exercises.length;
  document.getElementById('s-done').textContent = 0;
  document.getElementById('s-xp').textContent = '+0';

  const exList = document.getElementById('session-exercises');
  exList.innerHTML = plan.exercises.map((ex, i) => `
    <div class="session-ex" id="sex${i}">
      <div class="session-check" id="sc${i}" onclick="toggleExercise(${i}, ${plan.exercises.length})">
        <span id="sct${i}"></span>
      </div>
      <div class="ex-info">
        <div class="ex-name">${ex.icon} ${ex.name}</div>
        <div class="ex-meta">${ex.sets} séries × ${ex.reps}</div>
      </div>
    </div>
  `).join('');

  if (sessionInterval) clearInterval(sessionInterval);
  sessionInterval = setInterval(() => {
    const elapsed = Math.floor((Date.now() - sessionStartTime) / 1000);
    const m = String(Math.floor(elapsed / 60)).padStart(2, '0');
    const s = String(elapsed % 60).padStart(2, '0');
    document.getElementById('session-timer').textContent = `${m}:${s}`;
  }, 1000);

  state.activeSession = { planIdx, plan };
}

function toggleExercise(idx, total) {
  const el = document.getElementById(`sex${idx}`);
  const check = document.getElementById(`sc${idx}`);
  const tick = document.getElementById(`sct${idx}`);
  const wasDone = el.classList.contains('done');

  el.classList.toggle('done', !wasDone);
  check.classList.toggle('checked', !wasDone);
  tick.textContent = wasDone ? '' : '✓';

  sessionDoneCount += wasDone ? -1 : 1;
  sessionDoneCount = Math.max(0, sessionDoneCount);

  document.getElementById('s-done').textContent = sessionDoneCount;
  const xp = sessionDoneCount * 15;
  document.getElementById('s-xp').textContent = '+' + xp;
}

function endSession() {
  if (!state.activeSession) return;
  const elapsed = Math.floor((Date.now() - sessionStartTime) / 1000);
  const minutes = Math.floor(elapsed / 60);
  const xp = sessionDoneCount * 15 + Math.floor(minutes * 0.5);
  const plan = state.activeSession.plan;

  clearInterval(sessionInterval);
  document.getElementById('modal-session').classList.add('hidden');

  const record = {
    date: Date.now(),
    name: plan.name,
    minutes,
    kcal: plan.kcal,
    xp,
    exercises: sessionDoneCount,
  };
  state.currentUser.workoutHistory = state.currentUser.workoutHistory || [];
  state.currentUser.workoutHistory.push(record);
  state.currentUser.totalWorkouts = (state.currentUser.totalWorkouts || 0) + 1;
  state.currentUser.totalMinutes = (state.currentUser.totalMinutes || 0) + minutes;

  // Persiste treino no Supabase
  db.from('workout_history').insert({
    user_id: state.currentUser.id,
    name: plan.name,
    minutes,
    kcal: plan.kcal,
    xp,
    exercises: sessionDoneCount,
  }).then(({ error }) => { if (error) console.warn('workout_history insert:', error.message); });

  state.currentUser.xp = (state.currentUser.xp || 0) + xp;
  const newLevel = Math.floor(state.currentUser.xp / 500) + 1;
  const leveledUp = newLevel > state.currentUser.level;
  state.currentUser.level = newLevel;

  // Update calisthenics level based on XP
  if (state.currentUser.isCalisthenics) {
    state.currentUser.calisthenicsLevel = Math.min(5, Math.floor(state.currentUser.xp / 200) + 1);
  }

  updateStreak();
  updateChallengeProgress();

  saveData();
  state.activeSession = null;
  updateUI();

  showToast(`🎉 Treino concluído! +${xp} XP`);
  if (leveledUp) {
    setTimeout(() => { showToast(`⚡ LEVEL UP! Nível ${newLevel}!`); launchConfetti(); }, 1500);
  }
}

function updateStreak() {
  const u = state.currentUser;
  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86400000).toDateString();
  const history = u.workoutHistory || [];
  const doneToday = history.some(w => new Date(w.date).toDateString() === today && w !== history[history.length-1]);

  if (!doneToday) {
    const doneYesterday = history.some(w => new Date(w.date).toDateString() === yesterday);
    if (doneYesterday || u.streak === 0) {
      u.streak = (u.streak || 0) + 1;
    } else {
      const stillToday = history.slice(-2).some(w => new Date(w.date).toDateString() === today);
      if (!stillToday) u.streak = 1;
    }
    u.maxStreak = Math.max(u.maxStreak || 0, u.streak);
  }
}

function updateChallengeProgress() {
  const u = state.currentUser;
  (u.challenges || []).forEach(c => {
    if (c.status === 'active') {
      if (c.type === 'workouts') c.myScore = (c.myScore || 0) + 1;
      if (c.type === 'xp') c.myScore = u.xp;
      if (c.type === 'streak') c.myScore = u.streak;
    }
  });
}

// ── NUTRITION MODULE ─────────────────────────
function renderNutrition() {
  const u = state.currentUser;
  const macros = u.macros || { calories: 2000, protein: 150, carbs: 225, fat: 56 };
  const today = new Date().toDateString();
  const todayLog = (u.nutritionLog || []).filter(e => new Date(e.date).toDateString() === today);

  const consumed = todayLog.reduce((acc, e) => ({
    calories: acc.calories + (e.calories || 0),
    protein: acc.protein + (e.protein || 0),
    carbs: acc.carbs + (e.carbs || 0),
    fat: acc.fat + (e.fat || 0),
  }), { calories: 0, protein: 0, carbs: 0, fat: 0 });

  const calPct = Math.min(100, Math.round((consumed.calories / macros.calories) * 100));
  const protPct = Math.min(100, Math.round((consumed.protein / macros.protein) * 100));
  const carbPct = Math.min(100, Math.round((consumed.carbs / macros.carbs) * 100));
  const fatPct = Math.min(100, Math.round((consumed.fat / macros.fat) * 100));

  const container = document.getElementById('nutrition-content');
  if (!container) return;

  // AI suggestions based on eating habits
  const suggestions = getNutritionSuggestions(u, consumed, macros);

  container.innerHTML = `
    <!-- TDEE Card -->
    <div class="nutrition-tdee-card">
      <div class="tdee-left">
        <div class="tdee-label">Meta calórica diária</div>
        <div class="tdee-value">${macros.calories} <span>kcal</span></div>
        <div class="tdee-goal">${u.quizData?.goal || 'Manter peso'}</div>
      </div>
      <div class="tdee-ring">
        <svg viewBox="0 0 60 60" width="60" height="60">
          <circle cx="30" cy="30" r="24" fill="none" stroke="var(--surface2)" stroke-width="6"/>
          <circle cx="30" cy="30" r="24" fill="none" stroke="var(--accent)" stroke-width="6"
            stroke-dasharray="${(calPct/100)*150.8} 150.8"
            stroke-linecap="round" transform="rotate(-90 30 30)"/>
        </svg>
        <div class="tdee-ring-pct">${calPct}%</div>
      </div>
    </div>

    <!-- Macros -->
    <div class="macros-grid">
      <div class="macro-card">
        <div class="macro-icon">🥩</div>
        <div class="macro-name">Proteína</div>
        <div class="macro-val">${consumed.protein}g <span>/ ${macros.protein}g</span></div>
        <div class="macro-bar"><div class="macro-fill prot" style="width:${protPct}%"></div></div>
      </div>
      <div class="macro-card">
        <div class="macro-icon">🍚</div>
        <div class="macro-name">Carboidrato</div>
        <div class="macro-val">${consumed.carbs}g <span>/ ${macros.carbs}g</span></div>
        <div class="macro-bar"><div class="macro-fill carb" style="width:${carbPct}%"></div></div>
      </div>
      <div class="macro-card">
        <div class="macro-icon">🥑</div>
        <div class="macro-name">Gordura</div>
        <div class="macro-val">${consumed.fat}g <span>/ ${macros.fat}g</span></div>
        <div class="macro-bar"><div class="macro-fill fat" style="width:${fatPct}%"></div></div>
      </div>
    </div>

    <!-- AI Suggestions -->
    <div class="section-header"><h3>🤖 Sugestões de hoje</h3></div>
    <div class="nutrition-suggestions">
      ${suggestions.map(s => `
        <div class="suggestion-card">
          <span class="sug-icon">${s.icon}</span>
          <span class="sug-text">${s.text}</span>
        </div>
      `).join('')}
    </div>

    <!-- Food Log -->
    <div class="section-header">
      <h3>📋 Registro de hoje</h3>
      <button class="btn-sm" onclick="showAddFood()">+ Adicionar</button>
    </div>
    <div class="food-log">
      ${todayLog.length === 0
        ? '<p class="empty-log">Nenhum alimento registrado hoje</p>'
        : todayLog.map((e, i) => `
          <div class="food-entry">
            <div class="food-entry-name">${e.name}</div>
            <div class="food-entry-macros">${e.calories} kcal · P: ${e.protein}g · C: ${e.carbs}g · G: ${e.fat}g</div>
            <button class="food-del" onclick="deleteFoodEntry(${i})">✕</button>
          </div>
        `).join('')
      }
    </div>
  `;
}

function getNutritionSuggestions(user, consumed, macros) {
  const suggestions = [];
  const quiz = user.quizData || {};

  if (quiz.eatBreakfast === 'Não') {
    suggestions.push({ icon: '🌅', text: 'Tomar café da manhã pode aumentar seu metabolismo em até 10%' });
  }
  if (consumed.protein < macros.protein * 0.5) {
    if (quiz.eatEggs === 'Sim') {
      suggestions.push({ icon: '🥚', text: 'Adicione 3 ovos cozidos ao lanche — fácil e rico em proteína' });
    } else {
      suggestions.push({ icon: '🥩', text: `Você precisa de mais ${macros.protein - consumed.protein}g de proteína hoje` });
    }
  }
  if (quiz.eatRiceAndBeans === 'Sim') {
    suggestions.push({ icon: '🍛', text: 'Arroz + feijão é uma ótima combinação proteica! Continue com isso.' });
  }
  if (consumed.calories < macros.calories * 0.3 && new Date().getHours() > 14) {
    suggestions.push({ icon: '⚡', text: 'Você comeu pouco hoje — seu treino pode sofrer com isso' });
  }
  if (suggestions.length === 0) {
    suggestions.push({ icon: '✅', text: 'Ótima alimentação hoje! Continue assim.' });
  }
  return suggestions.slice(0, 3);
}

function showAddFood() {
  document.getElementById('modal-food').classList.remove('hidden');
}

function addFood() {
  const name = document.getElementById('food-name').value.trim();
  const calories = +document.getElementById('food-calories').value || 0;
  const protein = +document.getElementById('food-protein').value || 0;
  const carbs = +document.getElementById('food-carbs').value || 0;
  const fat = +document.getElementById('food-fat').value || 0;

  if (!name) { showToast('⚠️ Digite o nome do alimento'); return; }

  const entry = { name, calories, protein, carbs, fat, date: Date.now() };
  state.currentUser.nutritionLog = state.currentUser.nutritionLog || [];
  state.currentUser.nutritionLog.push(entry);

  // Persiste no Supabase
  db.from('nutrition_log').insert({
    user_id: state.currentUser.id,
    food_name: name,
    calories, protein, carbs, fat,
  }).then(({ data: rows, error }) => {
    if (error) console.warn('nutrition_log insert:', error.message);
    else if (rows && rows[0]) entry.id = rows[0].id;
  });

  saveData();
  closeModal('modal-food');
  renderNutrition();
  showToast('✅ Alimento registrado!');

  // Clear fields
  ['food-name','food-calories','food-protein','food-carbs','food-fat'].forEach(id => {
    document.getElementById(id).value = '';
  });
}

function deleteFoodEntry(idx) {
  const today = new Date().toDateString();
  const todayEntries = (state.currentUser.nutritionLog || [])
    .map((e, i) => ({ ...e, originalIdx: i }))
    .filter(e => new Date(e.date).toDateString() === today);

  const entry = todayEntries[idx];
  if (entry !== undefined) {
    state.currentUser.nutritionLog.splice(entry.originalIdx, 1);
    if (entry.id) {
      db.from('nutrition_log').delete().eq('id', entry.id)
        .then(({ error }) => { if (error) console.warn('nutrition_log delete:', error.message); });
    }
    saveData();
    renderNutrition();
  }
}

// ── PROGRESS MODULE ───────────────────────────
function renderProgress() {
  const u = state.currentUser;
  const container = document.getElementById('progress-content');
  if (!container) return;

  const history = u.workoutHistory || [];
  const progressLog = u.progressLog || [];
  const last30 = history.filter(w => w.date > Date.now() - 30 * 86400000);

  // Build weekly workout chart data (last 7 days)
  const chartData = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i);
    const key = d.toDateString();
    const count = history.filter(w => new Date(w.date).toDateString() === key).length;
    chartData.push({ day: d.toLocaleDateString('pt-BR', { weekday: 'short' }).substring(0,3), count });
  }

  const maxCount = Math.max(...chartData.map(d => d.count), 1);

  // AI analysis
  const aiAnalysis = getAIAnalysis(u);

  container.innerHTML = `
    <!-- Overall Stats -->
    <div class="progress-header">
      <h2>📈 Meu Progresso</h2>
      <button class="btn-sm" onclick="showLogWeight()">+ Registrar peso</button>
    </div>

    <div class="progress-stats-row">
      <div class="pstat-big">
        <span>${u.totalWorkouts || 0}</span>
        <label>Total treinos</label>
      </div>
      <div class="pstat-big">
        <span>${Math.round((u.totalMinutes || 0) / 60)}h</span>
        <label>Horas ativas</label>
      </div>
      <div class="pstat-big accent">
        <span>${u.streak || 0}🔥</span>
        <label>Sequência atual</label>
      </div>
      <div class="pstat-big">
        <span>${u.maxStreak || 0}</span>
        <label>Recorde</label>
      </div>
    </div>

    <!-- Workout frequency chart -->
    <div class="section-header"><h3>📊 Frequência semanal</h3></div>
    <div class="freq-chart">
      ${chartData.map(d => `
        <div class="freq-bar-wrap">
          <div class="freq-bar" style="height:${d.count > 0 ? Math.max(20, (d.count/maxCount)*80) : 4}px; background: ${d.count > 0 ? 'var(--accent)' : 'var(--surface2)'}"></div>
          <div class="freq-label">${d.day}</div>
          <div class="freq-count">${d.count > 0 ? d.count : ''}</div>
        </div>
      `).join('')}
    </div>

    <!-- Weight log -->
    <div class="section-header"><h3>⚖️ Histórico de peso</h3></div>
    <div class="weight-log">
      ${progressLog.length === 0
        ? '<p class="empty-log">Registre seu peso para acompanhar a evolução</p>'
        : progressLog.slice(-5).reverse().map(e => `
          <div class="weight-entry">
            <span class="weight-date">${new Date(e.date).toLocaleDateString('pt-BR')}</span>
            <span class="weight-val">${e.weight} kg</span>
            ${e.note ? `<span class="weight-note">${e.note}</span>` : ''}
          </div>
        `).join('')
      }
    </div>

    <!-- Calisthenics Levels (if applicable) -->
    ${u.isCalisthenics ? `
      <div class="section-header"><h3>🤸 Nível Calistenia</h3></div>
      <div class="cali-level-grid">
        ${Object.entries(CALISTHENICS_PROGRESSIONS).map(([cat, exercises]) => {
          const catLevel = Math.min(5, Math.floor((u.xp || 0) / 200) + 1);
          const current = getProgressionExercise(cat, catLevel);
          const catNames = { push: '💪 Push', pull: '🔄 Pull', legs: '🦵 Legs', core: '🧘 Core', statics: '⚡ Estáticos' };
          return `
            <div class="cali-level-card">
              <div class="cali-level-cat">${catNames[cat]}</div>
              <div class="cali-level-name">${current.name}</div>
              <div class="cali-level-badge">Nível ${current.level}</div>
            </div>
          `;
        }).join('')}
      </div>
    ` : ''}

    <!-- AI Analysis -->
    <div class="section-header"><h3>🤖 Análise Inteligente</h3></div>
    <div class="ai-analysis-card">
      <div class="ai-icon">🤖</div>
      <div class="ai-content">
        <div class="ai-status ${aiAnalysis.type}">${aiAnalysis.status}</div>
        <div class="ai-message">${aiAnalysis.message}</div>
        <div class="ai-tip">${aiAnalysis.tip}</div>
      </div>
    </div>

    <!-- Recent workouts timeline -->
    <div class="section-header"><h3>📅 Histórico recente</h3></div>
    <div class="workout-timeline">
      ${last30.length === 0
        ? '<p class="empty-log">Nenhum treino nos últimos 30 dias</p>'
        : last30.slice(-8).reverse().map(w => `
          <div class="timeline-item">
            <div class="timeline-dot"></div>
            <div class="timeline-content">
              <div class="timeline-name">${w.name}</div>
              <div class="timeline-meta">${new Date(w.date).toLocaleDateString('pt-BR')} · ${w.minutes}min · +${w.xp} XP</div>
            </div>
          </div>
        `).join('')
      }
    </div>
  `;
}

function getAIAnalysis(user) {
  const history = user.workoutHistory || [];
  const last7 = history.filter(w => w.date > Date.now() - 7 * 86400000);
  const last14 = history.filter(w => w.date > Date.now() - 14 * 86400000);
  const nutritionLog = user.nutritionLog || [];
  const todayNutrition = nutritionLog.filter(e => new Date(e.date).toDateString() === new Date().toDateString());
  const macros = user.macros || {};

  // Determine state
  if (last7.length === 0) {
    return {
      type: 'warning',
      status: '⚠️ Atenção',
      message: 'Você não treinou nos últimos 7 dias.',
      tip: 'Retome o ritmo amanhã com um treino curto de 20 minutos.'
    };
  }

  if (last7.length >= (user.quizData?.days || 3)) {
    const avgProtein = todayNutrition.reduce((s, e) => s + (e.protein || 0), 0);
    if (macros.protein && avgProtein < macros.protein * 0.7) {
      return {
        type: 'caution',
        status: '🍽️ Revise sua alimentação',
        message: 'Sua frequência de treino está ótima, mas sua proteína está abaixo do ideal.',
        tip: 'Sua alimentação pode estar limitando seus resultados. Tente adicionar mais proteína.'
      };
    }
    return {
      type: 'success',
      status: '✅ Você está evoluindo!',
      message: `${last7.length} treinos esta semana. Continue assim!`,
      tip: user.streak >= 7 ? `🔥 ${user.streak} dias seguidos — você está destruindo!` : 'Mantenha a consistência para melhores resultados.'
    };
  }

  if (last7.length < last14.length / 2) {
    return {
      type: 'caution',
      status: '📉 Ritmo caindo',
      message: 'Sua frequência caiu em relação à semana passada.',
      tip: 'Tente fazer ao menos um treino hoje para retomar o momentum.'
    };
  }

  return {
    type: 'success',
    status: '💪 Bom progresso!',
    message: `${last7.length} treinos nesta semana.`,
    tip: 'Continue com a consistência para ver resultados a longo prazo.'
  };
}

function showLogWeight() {
  document.getElementById('modal-weight').classList.remove('hidden');
}

function logWeight() {
  const weight = +document.getElementById('log-weight').value;
  const note = document.getElementById('log-weight-note').value.trim();
  if (!weight || weight < 20 || weight > 300) { showToast('⚠️ Peso inválido'); return; }

  state.currentUser.progressLog = state.currentUser.progressLog || [];
  state.currentUser.progressLog.push({ weight, note, date: Date.now() });

  // Persiste no Supabase
  db.from('progress_log').insert({
    user_id: state.currentUser.id,
    weight, note: note || null,
  }).then(({ error }) => { if (error) console.warn('progress_log insert:', error.message); });

  // Update current weight in profile
  state.currentUser.quizData = state.currentUser.quizData || {};
  state.currentUser.quizData.weight = weight;

  // Recalculate TDEE
  const tdee = calculateTDEE(state.currentUser);
  const macros = calculateMacros(tdee, state.currentUser.quizData?.goal || 'Manter');
  state.currentUser.tdee = tdee;
  state.currentUser.macros = macros;

  saveData();
  closeModal('modal-weight');
  renderProgress();
  renderNutrition();
  showToast('⚖️ Peso registrado!');
}

// ── RANKING ────────────────────────────────
function renderRanking(mode) {
  const u = state.currentUser;
  const list = document.getElementById('ranking-list');
  list.innerHTML = '';

  let entries = [];
  if (mode === 'friends') {
    entries.push({ id: u.id, name: u.name, xp: u.xp || 0, streak: u.streak || 0, level: u.level || 1, isMe: true });
    (u.friends || []).forEach(fid => {
      const f = state.users[fid];
      if (f) entries.push({ id: fid, name: f.name, xp: f.xp || 0, streak: f.streak || 0, level: f.level || 1, isMe: false });
    });
  } else if (mode === 'global') {
    entries = Object.values(state.users)
      .filter(usr => usr.id !== 'demo5')
      .map(usr => ({ id: usr.id, name: usr.name, xp: usr.xp || 0, streak: usr.streak || 0, level: usr.level || 1, isMe: usr.id === u.id }));
  } else {
    const ws = computeWeekStats();
    entries.push({ id: u.id, name: u.name, xp: ws.xp, streak: u.streak, level: u.level, isMe: true });
    (u.friends || []).forEach(fid => {
      const f = state.users[fid];
      if (f) entries.push({ id: fid, name: f.name, xp: Math.floor((f.xp||0) * 0.1), streak: f.streak||0, level: f.level||1, isMe: false });
    });
  }

  entries.sort((a, b) => b.xp - a.xp);
  const myPos = entries.findIndex(e => e.isMe) + 1;

  document.getElementById('my-rank-num').textContent = myPos;
  document.getElementById('my-rank-xp').textContent = (u.xp || 0) + ' XP';
  document.getElementById('my-rank-streak').textContent = u.streak || 0;
  document.getElementById('my-friend-code').textContent = u.friendCode || '------';

  const colors = ['#ff5722','#4fc3f7','#ab47bc','#00e676','#ffd700','#ff8a50'];

  entries.forEach((e, i) => {
    const pos = i + 1;
    const item = document.createElement('div');
    item.className = 'rank-item' + (e.isMe ? ' me' : '');
    const posClass = pos === 1 ? 'gold' : pos === 2 ? 'silver' : pos === 3 ? 'bronze' : '';
    const posText = pos === 1 ? '🥇' : pos === 2 ? '🥈' : pos === 3 ? '🥉' : pos;
    item.innerHTML = `
      <div class="rank-pos ${posClass}">${posText}</div>
      <div class="rank-avatar" style="background:${colors[i % colors.length]}">${e.name.charAt(0)}</div>
      <div class="rank-info">
        <div class="rank-name">${e.name}${e.isMe ? ' <span style="font-size:10px;color:var(--accent)">VOCÊ</span>' : ''}</div>
        <div class="rank-detail">Nível ${e.level} · 🔥 ${e.streak}</div>
      </div>
      <div class="rank-xp">${e.xp}</div>
    `;
    list.appendChild(item);
  });
}

function switchRankTab(mode, el) {
  document.querySelectorAll('.rank-tab').forEach(t => t.classList.remove('active'));
  el.classList.add('active');
  renderRanking(mode);
}

async function addFriend() {
  const code = document.getElementById('friend-code').value.trim().toUpperCase();
  if (!code) { showToast('⚠️ Digite o código do amigo'); return; }

  // Busca no Supabase pelo código de amigo
  let friend = Object.values(state.users).find(u => u.friendCode === code && u.id !== state.currentUser.id);
  if (!friend) {
    const { data: fp } = await db.from('profiles').select('id, name, xp, level, streak, plan, friend_code').eq('friend_code', code).single();
    if (fp && fp.id !== state.currentUser.id) {
      friend = { id: fp.id, name: fp.name, xp: fp.xp, level: fp.level, streak: fp.streak, plan: fp.plan, friendCode: fp.friend_code, friends: [], challenges: [], workoutHistory: [], workoutDays: new Set() };
      state.users[fp.id] = friend;
    }
  }
  if (!friend) { showToast('❌ Código não encontrado'); return; }
  if (state.currentUser.friends.includes(friend.id)) { showToast('👥 Já são amigos!'); return; }
  state.currentUser.friends.push(friend.id);

  // Persiste amizade no Supabase
  db.from('friends').insert({ user_id: state.currentUser.id, friend_id: friend.id })
    .then(({ error }) => { if (error && !error.message.includes('unique')) console.warn('friends insert:', error.message); });

  saveData();
  document.getElementById('friend-code').value = '';
  showToast(`✅ ${friend.name} adicionado!`);
  renderRanking('friends');
}

// ── CHALLENGES ─────────────────────────────
function renderChallenges() {
  const u = state.currentUser;
  const activeEl = document.getElementById('active-challenges');
  const pendingEl = document.getElementById('pending-challenges');
  activeEl.innerHTML = '';
  pendingEl.innerHTML = '';

  (u.challenges || []).forEach(c => {
    const card = buildChallengeCard(c);
    if (c.status === 'active') activeEl.appendChild(card);
    else if (c.status === 'pending') pendingEl.appendChild(card);
  });

  if (activeEl.innerHTML === '') activeEl.innerHTML = '<p style="color:var(--text2);font-size:13px;padding:8px 0">Nenhum desafio ativo. Crie um!</p>';
  if (pendingEl.innerHTML === '') pendingEl.innerHTML = '<p style="color:var(--text2);font-size:13px;padding:8px 0">Nenhum convite pendente.</p>';

  renderQuickChallenges();
}

function buildChallengeCard(c) {
  const card = document.createElement('div');
  card.className = 'challenge-card';
  const progress = Math.min(100, (c.myScore / (c.type === 'workouts' ? c.duration : c.myScore + c.theirScore + 1)) * 100) || 0;
  const leading = c.myScore >= c.theirScore;
  const statusEl = `<div class="chall-status ${c.status}">${c.status === 'active' ? 'ATIVO' : 'PENDENTE'}</div>`;
  const actionsEl = c.status === 'pending' ? `
    <div class="chall-actions">
      <button class="btn-accept" onclick="acceptChallenge('${c.id}')">✓ ACEITAR</button>
      <button class="btn-decline" onclick="declineChallenge('${c.id}')">✕ RECUSAR</button>
    </div>
  ` : `
    <div class="chall-progress">
      <div class="chall-bar"><div class="chall-fill" style="width:${progress}%"></div></div>
    </div>
  `;

  card.innerHTML = `
    <div class="chall-top">
      <div>
        <div class="chall-title">⚔️ ${c.typeLabel}</div>
        <div class="chall-days">${c.daysLeft} dias restantes${c.bet ? ' · Aposta: ' + c.bet : ''}</div>
      </div>
      ${statusEl}
    </div>
    <div class="chall-vs">
      <div class="chall-player">
        <div class="chall-player-name">Você</div>
        <div class="chall-player-score ${leading ? 'leading' : ''}">${c.myScore}</div>
      </div>
      <div class="chall-sep">VS</div>
      <div class="chall-player">
        <div class="chall-player-name">${c.challengerName}</div>
        <div class="chall-player-score ${!leading ? 'leading' : ''}">${c.theirScore}</div>
      </div>
    </div>
    ${actionsEl}
  `;
  return card;
}

function acceptChallenge(id) {
  const c = state.currentUser.challenges.find(c => c.id === id);
  if (c) { c.status = 'active'; saveData(); renderChallenges(); showToast('⚔️ Desafio aceito!'); }
}

function declineChallenge(id) {
  state.currentUser.challenges = state.currentUser.challenges.filter(c => c.id !== id);
  saveData(); renderChallenges(); showToast('✕ Desafio recusado');
}

function renderQuickChallenges() {
  const quick = [
    { icon: '🔥', name: '7 Dias Streak', desc: 'Quem mantém a maior sequência em 7 dias' },
    { icon: '💪', name: 'XP Battle', desc: 'Mais XP em 14 dias' },
    { icon: '🏃', name: 'Treino Sprint', desc: 'Mais treinos em 5 dias' },
    { icon: '⚡', name: 'Desafio 30 dias', desc: 'Quem treina mais no mês' },
  ];
  const container = document.getElementById('quick-challenges');
  container.innerHTML = quick.map(q => `
    <div class="quick-card" onclick="showCreateChallenge()">
      <div class="quick-icon">${q.icon}</div>
      <div class="quick-name">${q.name}</div>
      <div class="quick-desc">${q.desc}</div>
    </div>
  `).join('');
}

function showCreateChallenge() {
  document.getElementById('modal-challenge').classList.remove('hidden');
}

function createChallenge() {
  const type = document.getElementById('chall-type').value;
  const duration = document.getElementById('chall-duration').value;
  const friendCode = document.getElementById('chall-friend').value.trim().toUpperCase();
  const bet = document.getElementById('chall-bet').value.trim();

  const typeLabels = { workouts: 'Mais treinos', streak: 'Maior sequência', xp: 'Mais XP', exercises: 'Mais exercícios' };

  let opponentName = 'Amigo';
  if (friendCode) {
    const friend = Object.values(state.users).find(u => u.friendCode === friendCode);
    if (friend) opponentName = friend.name;
    else { showToast('❌ Amigo não encontrado'); return; }
  } else if (state.currentUser.friends.length > 0) {
    const fid = state.currentUser.friends[0];
    const f = state.users[fid];
    if (f) opponentName = f.name;
  }

  const challenge = {
    id: 'c' + Date.now(), type, typeLabel: typeLabels[type], challenger: null, challengerName: opponentName,
    myScore: 0, theirScore: 0, duration: +duration, daysLeft: +duration, status: 'active', bet
  };
  state.currentUser.challenges = state.currentUser.challenges || [];
  state.currentUser.challenges.push(challenge);
  saveData();
  closeModal('modal-challenge');
  renderChallenges();
  showToast('⚔️ Desafio criado!');
}

// ── PROFILE ────────────────────────────────
function renderProfile() {
  const u = state.currentUser;
  document.getElementById('profile-avatar').textContent = u.name.charAt(0).toUpperCase();
  document.getElementById('profile-name').textContent = u.name;
  document.getElementById('profile-plan').textContent = u.plan.toUpperCase();
  document.getElementById('p-total-workouts').textContent = u.totalWorkouts || 0;
  document.getElementById('p-streak').textContent = u.streak || 0;
  document.getElementById('p-total-xp').textContent = u.xp || 0;
  document.getElementById('p-level').textContent = u.level || 1;

  const banner = document.getElementById('upgrade-banner');
  if (u.plan !== 'free') banner.style.display = 'none';
}

function showUpgrade() { document.getElementById('modal-upgrade').classList.remove('hidden'); }
async function subscribe(plan) {
  state.currentUser.plan = plan;
  await saveData();
  closeModal('modal-upgrade');
  updateUI();
  showToast(`🚀 Bem-vindo ao plano ${plan.toUpperCase()}!`);
  launchConfetti();
}

function showPayment() { showToast('💳 Gerencie seu plano nas configurações'); }
function showEditProfile() { showToast('✏️ Edição de perfil em breve!'); }
function showWorkoutSettings() { showToast('⚙️ Reconfigurando treino...'); setTimeout(() => showScreen('onboarding'), 1000); }
function shareProfile() {
  const text = `Veja meu perfil no FitForce! Código: ${state.currentUser.friendCode}`;
  if (navigator.share) navigator.share({ title: 'FitForce', text });
  else { showToast('📋 Código copiado: ' + state.currentUser.friendCode); }
}

function regenerateWorkout() {
  showToast('🔄 Gerando novo treino...');
  setTimeout(() => { buildAndLaunch(); updateUI(); showToast('✅ Novo treino gerado!'); }, 800);
}

// ── NAVIGATION ─────────────────────────────
function switchTab(tab, el) {
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  if (el) el.classList.add('active');
  document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
  document.getElementById(`tab-${tab}`).classList.add('active');
  state.currentTab = tab;

  // Refresh modules on tab switch
  if (tab === 'nutrition') renderNutrition();
  if (tab === 'progress') renderProgress();
}

function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => {
    s.classList.remove('active');
    s.style.display = '';
  });
  const screen = document.getElementById(id);
  screen.classList.add('active');
  if (id === 'app') screen.style.display = 'flex';
}

function closeModal(id) {
  document.getElementById(id).classList.add('hidden');
}

function showNotif() {
  showToast('🔔 Sem notificações novas');
}

// ── TOAST ───────────────────────────────────
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.remove('hidden');
  clearTimeout(window._toastTimer);
  window._toastTimer = setTimeout(() => t.classList.add('hidden'), 2800);
}

// ── CONFETTI ────────────────────────────────
function launchConfetti() {
  const canvas = document.getElementById('confetti-canvas');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  const ctx = canvas.getContext('2d');
  const particles = Array.from({ length: 120 }, () => ({
    x: Math.random() * canvas.width, y: -10,
    r: Math.random() * 6 + 3, d: Math.random() * Math.PI * 2,
    color: ['#ff5722','#ffd700','#00f5a0','#4fc3f7','#ab47bc'][Math.floor(Math.random() * 5)],
    tilt: Math.random() * 10 - 5, speed: Math.random() * 3 + 2
  }));
  let frame = 0;
  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.ellipse(p.x, p.y, p.r, p.r * 0.5, p.d, 0, Math.PI * 2);
      ctx.fill();
      p.y += p.speed; p.x += Math.sin(p.d + frame / 20) * 2; p.d += 0.05;
    });
    frame++;
    if (frame < 120) requestAnimationFrame(draw);
    else ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
  draw();
}

// ── STREAK CHECK ────────────────────────────
function updateStreakCheck() {
  const u = state.currentUser;
  if (!u) return;
  const lastW = u.workoutHistory?.[u.workoutHistory.length - 1];
  if (!lastW) return;
  const daysSince = Math.floor((Date.now() - lastW.date) / 86400000);
  if (daysSince > 1 && u.streak > 0) { u.streak = 0; saveData(); updateUI(); }
}

// ── PERSISTENCE (Supabase) ───────────────────

/** Salva/atualiza o perfil principal do usuário no Supabase */
async function saveData() {
  const u = state.currentUser;
  if (!u || !u.id) return;
  try {
    const { error } = await db.from('profiles').upsert({
      id: u.id,
      name: u.name,
      plan: u.plan,
      xp: u.xp || 0,
      level: u.level || 1,
      streak: u.streak || 0,
      max_streak: u.maxStreak || 0,
      total_workouts: u.totalWorkouts || 0,
      total_minutes: u.totalMinutes || 0,
      last_workout: u.lastWorkout ? new Date(u.lastWorkout).toISOString() : null,
      friend_code: u.friendCode,
      tdee: u.tdee || null,
      macros: u.macros || null,
      quiz_data: u.quizData || null,
      workout_plan: u.workoutPlan
        ? JSON.parse(JSON.stringify(u.workoutPlan, (k, v) => v instanceof Set ? [...v] : v))
        : null,
      is_calisthenics: u.isCalisthenics || false,
      calisthenics_level: u.calisthenicsLevel || 1,
    }, { onConflict: 'id' });
    if (error) console.warn('saveData error:', error.message);
  } catch (e) { console.warn('saveData exception:', e); }
}

/** Carrega perfil + logs do usuário autenticado */
async function loadData() {
  try {
    const { data: { user: authUser } } = await db.auth.getUser();
    if (!authUser) return false;

    // Perfil
    const { data: profile, error: pErr } = await db
      .from('profiles')
      .select('*')
      .eq('id', authUser.id)
      .single();
    if (pErr || !profile) return false;

    // Histórico de treinos
    const { data: workoutHistory } = await db
      .from('workout_history')
      .select('*')
      .eq('user_id', authUser.id)
      .order('logged_at', { ascending: true });

    // Log de nutrição
    const { data: nutritionLog } = await db
      .from('nutrition_log')
      .select('*')
      .eq('user_id', authUser.id)
      .order('logged_at', { ascending: true });

    // Log de progresso/peso
    const { data: progressLog } = await db
      .from('progress_log')
      .select('*')
      .eq('user_id', authUser.id)
      .order('logged_at', { ascending: true });

    // Amigos
    const { data: friendRows } = await db
      .from('friends')
      .select('friend_id')
      .eq('user_id', authUser.id);

    const friendIds = (friendRows || []).map(r => r.friend_id);
    let friendProfiles = [];
    if (friendIds.length > 0) {
      const { data: fps } = await db
        .from('profiles')
        .select('id, name, xp, level, streak, plan, friend_code')
        .in('id', friendIds);
      friendProfiles = fps || [];
    }

    // Desafios
    const { data: challenges } = await db
      .from('challenges')
      .select('*, challenger:profiles!challenges_challenger_id_fkey(name), challenged:profiles!challenges_challenged_id_fkey(name)')
      .or(`challenger_id.eq.${authUser.id},challenged_id.eq.${authUser.id}`)
      .neq('status', 'finished');

    // Montar objeto de usuário
    const mappedUser = {
      id: profile.id,
      name: profile.name,
      email: authUser.email,
      plan: profile.plan,
      xp: profile.xp,
      level: profile.level,
      streak: profile.streak,
      maxStreak: profile.max_streak,
      totalWorkouts: profile.total_workouts,
      totalMinutes: profile.total_minutes,
      lastWorkout: profile.last_workout ? new Date(profile.last_workout).getTime() : null,
      friendCode: profile.friend_code,
      tdee: profile.tdee,
      macros: profile.macros,
      quizData: profile.quiz_data || {},
      workoutPlan: profile.workout_plan || null,
      isCalisthenics: profile.is_calisthenics,
      calisthenicsLevel: profile.calisthenics_level,
      workoutDays: new Set(),
      workoutHistory: (workoutHistory || []).map(w => ({
        id: w.id,
        date: new Date(w.logged_at).getTime(),
        name: w.name,
        minutes: w.minutes,
        kcal: w.kcal,
        xp: w.xp,
        exercises: w.exercises,
      })),
      nutritionLog: (nutritionLog || []).map(n => ({
        id: n.id,
        name: n.food_name,
        calories: n.calories,
        protein: parseFloat(n.protein),
        carbs: parseFloat(n.carbs),
        fat: parseFloat(n.fat),
        meal: n.meal,
        date: new Date(n.logged_at).getTime(),
      })),
      progressLog: (progressLog || []).map(p => ({
        id: p.id,
        weight: parseFloat(p.weight),
        note: p.note,
        date: new Date(p.logged_at).getTime(),
      })),
      friends: friendIds,
      challenges: (challenges || []).map(c => {
        const iAmChallenger = c.challenger_id === authUser.id;
        const opponentName = iAmChallenger ? c.challenged?.name : c.challenger?.name;
        const daysLeft = Math.max(0, Math.ceil((new Date(c.ends_at) - Date.now()) / 86400000));
        return {
          id: c.id,
          type: c.type,
          typeLabel: c.type_label,
          challenger: iAmChallenger ? c.challenged_id : c.challenger_id,
          challengerName: opponentName || 'Amigo',
          myScore: iAmChallenger ? c.challenger_score : c.challenged_score,
          theirScore: iAmChallenger ? c.challenged_score : c.challenger_score,
          duration: c.duration_days,
          daysLeft,
          status: c.status,
          bet: c.bet || '',
          _isChallenger: iAmChallenger,
          _dbId: c.id,
        };
      }),
    };

    // Adicionar amigos ao state.users para o ranking
    friendProfiles.forEach(fp => {
      state.users[fp.id] = {
        id: fp.id, name: fp.name, xp: fp.xp, level: fp.level,
        streak: fp.streak, plan: fp.plan, friendCode: fp.friend_code,
        email: '', friends: [], challenges: [], workoutHistory: [], workoutDays: new Set()
      };
    });

    // Demo friends (mantém compatibilidade com ranking visual)
    seedDemoFriends(mappedUser);

    state.users[mappedUser.id] = mappedUser;
    state.currentUser = mappedUser;
    return true;
  } catch (e) {
    console.warn('loadData exception:', e);
    return false;
  }
}

// ── INIT ────────────────────────────────────
window.addEventListener('DOMContentLoaded', async () => {
  showScreen('splash');

  const freePlan = document.querySelector('.plan-card');
  if (freePlan) freePlan.classList.add('selected');

  // Se aberto via file://, pula Supabase (sem servidor = timeout de 40s)
  const isLocalFile = location.protocol === 'file:';
  if (isLocalFile) {
    await new Promise(r => setTimeout(r, 1400));
    showScreen('auth');
    return;
  }

  // Splash e autenticação em paralelo
  const splashTimer = new Promise(r => setTimeout(r, 1400));
  const sessionPromise = db.auth.getSession();
  const [, { data: { session } }] = await Promise.all([splashTimer, sessionPromise]);

  if (session) {
    const hasSession = await loadData();
    if (hasSession && state.currentUser) {
      if (state.currentUser.workoutPlan) {
        state.workoutPlan = state.currentUser.workoutPlan;
        launchApp();
      } else {
        showScreen('onboarding');
      }
      return;
    }
  }
  showScreen('auth');
});

// Listener de mudança de autenticação
db.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_OUT') {
    state.currentUser = null;
    state.users = {};
    showScreen('auth');
  }
});

window.addEventListener('popstate', () => {
  const active = document.querySelector('.screen.active');
  if (active?.id === 'app') return;
  showScreen('app');
});

document.addEventListener('touchend', e => {
  const now = Date.now();
  if (now - (window._lastTouch || 0) < 300) e.preventDefault();
  window._lastTouch = now;
}, { passive: false });