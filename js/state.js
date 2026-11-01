// Chave para armazenamento no localStorage
const STORAGE_KEY = 'mindhub_state_v2';

// Estado padrão inicial da aplicação
const defaultState = {
  tasks: [
    { id: '1', title: 'Revisar relatório trimestral', priority: 'Alta', status: 'In Progress', category: 'Trabalho', dueDate: '2026-10-10' }
  ],
  finances: [
    { id: '1', title: 'Salário Mensal', amount: 4500, type: 'income', category: 'Salário', date: '2026-10-01' }
  ],
  habits: [
    { id: '1', title: 'Beber 2L de água', category: 'Saúde', streak: 7, completedDays: [0, 1, 2, 3] }
  ],
  notes: [
    { id: '1', title: 'Ideias de Projeto 2026', content: 'Texto da nota...', tags: ['ideias', 'dev'] }
  ],
  pomodoro: {
    focusMinutesToday: 75,
    sessionsToday: 3,
    mode: 'focus'
  }
};

// Carrega o estado inicial
let state = loadState();

function loadState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error("Erro ao carregar o estado:", e);
  }
  return JSON.parse(JSON.stringify(defaultState));
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  if (typeof refreshUI === 'function') {
    refreshUI();
  }
}

function resetDataModal() {
  if (confirm("Tem certeza que deseja resetar todos os dados para o padrão?")) {
    state = JSON.parse(JSON.stringify(defaultState));
    saveState();
    location.reload();
  }
}
