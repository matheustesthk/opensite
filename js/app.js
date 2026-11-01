// js/app.js
let currentTab = 'dashboard';
let currentTaskView = 'kanban';
let currentModalType = null;
let activeWishSavingsId = null;
let pomodoroTimer = null;
let dashChartInstance = null;
let finChartInstance = null;

function switchTab(tab) {
    currentTab = tab;

    ['dashboard', 'tasks', 'finances', 'habits', 'notes', 'pomodoro', 'wishlist'].forEach(v => {
        const targetView = document.getElementById(`view-${v}`);
        if (targetView) targetView.classList.add('hidden');
        
        const navBtn = document.getElementById(`nav-${v}`);
        if (navBtn) navBtn.classList.remove('nav-item-active');

        const mobBtn = document.getElementById(`mobile-nav-${v}`);
        if (mobBtn) {
            mobBtn.classList.remove('text-brand-400');
            mobBtn.classList.add('text-gray-400');
        }
    });

    const activeView = document.getElementById(`view-${tab}`);
    if (activeView) activeView.classList.remove('hidden');

    const activeNav = document.getElementById(`nav-${tab}`);
    if (activeNav) activeNav.classList.add('nav-item-active');

    const activeMob = document.getElementById(`mobile-nav-${tab}`);
    if (activeMob) {
        activeMob.classList.remove('text-gray-400');
        activeMob.classList.add('text-brand-400');
    }

    const titleMap = {
        dashboard: ['fa-chart-pie text-brand-400', 'Dashboard'],
        tasks: ['fa-list-check text-brand-400', 'Tarefas & Kanban'],
        finances: ['fa-wallet text-accent-cyan', 'Gestão Financeira'],
        habits: ['fa-fire text-accent-amber', 'Rastreador de Hábitos'],
        notes: ['fa-note-sticky text-brand-400', 'Notas & Ideias'],
        pomodoro: ['fa-stopwatch text-accent-purple', 'Timer Pomodoro'],
        wishlist: ['fa-wand-magic-sparkles text-accent-pink', 'Lista de Desejos']
    };
    const [iconClass, label] = titleMap[tab];
    document.getElementById('page-title').innerHTML = `<i class="fa-solid ${iconClass}"></i><span>${label}</span>`;

    refreshUI();
}

function toggleMobileMenu() {
    const sidebar = document.getElementById('sidebar');
    sidebar.classList.toggle('hidden');
}

function renderDashboard() {
    const totalTasks = state.tasks.length;
    const doneTasks = state.tasks.filter(t => t.status === 'Done').length;
    const taskPct = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;
    document.getElementById('dash-task-count').textContent = `${doneTasks}/${totalTasks}`;
    document.getElementById('dash-task-pct').textContent = `${taskPct}%`;

    const inc = state.finances.filter(f => f.type === 'income').reduce((a, b) => a + b.amount, 0);
    const exp = state.finances.filter(f => f.type === 'expense').reduce((a, b) => a + b.amount, 0);
    const bal = inc - exp;
    document.getElementById('dash-balance').textContent = `R$ ${bal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;

    const totalHabits = state.habits.length;
    const todayIdx = (new Date().getDay() + 6) % 7;
    const doneHabits = state.habits.filter(h => h.completedDays.includes(todayIdx)).length;
    const habitPct = totalHabits > 0 ? Math.round((doneHabits / totalHabits) * 100) : 0;
    document.getElementById('dash-habit-pct').textContent = `${habitPct}%`;
    document.getElementById('dash-habit-count').textContent = `${doneHabits}/${totalHabits}`;

    const totalWish = state.wishlist.length;
    const conqueredWish = state.wishlist.filter(w => w.conquered).length;
    const totalWishTarget = state.wishlist.reduce((acc, w) => acc + w.targetAmount, 0);
    const totalWishSaved = state.wishlist.reduce((acc, w) => acc + w.savedAmount, 0);
    const wishPct = totalWishTarget > 0 ? Math.min(100, Math.round((totalWishSaved / totalWishTarget) * 100)) : 0;
    
    document.getElementById('dash-wish-pct').textContent = `${wishPct}%`;
    document.getElementById('dash-wish-count').textContent = `${conqueredWish}/${totalWish}`;
    
    const pendingWishCount = totalWish - conqueredWish;
    document.getElementById('wishlist-badge-count').textContent = pendingWishCount;

    const prioTasksContainer = document.getElementById('dash-task-list');
    prioTasksContainer.innerHTML = '';
    const priorityTasks = state.tasks.filter(t => t.status !== 'Done').slice(0, 3);
    
    if (priorityTasks.length === 0) {
        prioTasksContainer.innerHTML = '<p class="text-xs text-gray-500 italic py-2">Nenhuma tarefa pendente!</p>';
    } else {
        priorityTasks.forEach(t => {
            const prioColor = t.priority === 'Alta' ? 'text-accent-rose' : (t.priority === 'Média' ? 'text-accent-amber' : 'text-gray-400');
            prioTasksContainer.innerHTML += `
                <div class="flex items-center justify-between p-2.5 rounded-lg bg-dark-bg border border-dark-border text-xs">
                    <div class="flex items-center gap-2">
                        <input type="checkbox" onchange="toggleTaskStatus('${t.id}')" class="rounded custom-checkbox w-4 h-4 cursor-pointer">
                        <span class="font-medium text-white">${escapeHtml(t.title)}</span>
                    </div>
                    <span class="font-bold text-[10px] ${prioColor}">${t.priority}</span>
                </div>
            `;
        });
    }

    const habitsContainer = document.getElementById('dash-habit-list');
    habitsContainer.innerHTML = '';
    state.habits.forEach(h => {
        const isDone = h.completedDays.includes(todayIdx);
        habitsContainer.innerHTML += `
            <button onclick="toggleHabitDay('${h.id}', ${todayIdx})" class="p-3 rounded-xl border text-left flex items-center justify-between transition ${isDone ? 'bg-brand-500/10 border-brand-500/30 text-brand-400' : 'bg-dark-bg border-dark-border text-gray-400 hover:text-white'}">
                <div>
                    <p class="text-xs font-bold text-white">${escapeHtml(h.title)}</p>
                    <p class="text-[10px] opacity-75">Sequência: ${h.streak} dias 🔥</p>
                </div>
                <i class="fa-solid ${isDone ? 'fa-circle-check text-brand-400' : 'fa-circle text-gray-600'} text-base"></i>
            </button>
        `;
    });

    const wishContainer = document.getElementById('dash-wishlist-container');
    wishContainer.innerHTML = '';
    const pendingWishes = state.wishlist
        .filter(w => !w.conquered)
        .map(w => ({ ...w, pct: w.targetAmount > 0 ? Math.min(100, Math.round((w.savedAmount / w.targetAmount) * 100)) : 0 }))
        .sort((a, b) => b.pct - a.pct)
        .slice(0, 2);

    if (pendingWishes.length === 0) {
        wishContainer.innerHTML = '<p class="text-xs text-gray-500 italic py-2 col-span-2">Nenhum desejo pendente! Adicione novas metas.</p>';
    } else {
        pendingWishes.forEach(w => {
            wishContainer.innerHTML += `
                <div class="p-3 rounded-xl bg-dark-bg border border-dark-border space-y-2">
                    <div class="flex items-center justify-between">
                        <span class="font-bold text-xs text-white truncate max-w-[140px]">${escapeHtml(w.title)}</span>
                        <span class="text-[10px] font-mono font-bold text-accent-pink">${w.pct}%</span>
                    </div>
                    <div class="w-full bg-dark-card rounded-full h-1.5 overflow-hidden">
                        <div class="bg-gradient-to-r from-accent-pink to-accent-purple h-full rounded-full" style="width: ${w.pct}%"></div>
                    </div>
                    <div class="flex justify-between items-center text-[10px] text-gray-400">
                        <span>R$ ${w.savedAmount.toLocaleString('pt-BR')} / ${w.targetAmount.toLocaleString('pt-BR')}</span>
                        <button onclick="quickAddSavingsPrompt('${w.id}')" class="text-accent-pink hover:underline font-bold">+ Economia</button>
                    </div>
                </div>
            `;
        });
    }

    renderDashChart();
}

function renderDashChart() {
    const ctx = document.getElementById('dash-finance-chart');
    if (!ctx) return;

    const categories = {};
    state.finances.filter(f => f.type === 'expense').forEach(f => {
        categories[f.category] = (categories[f.category] || 0) + f.amount;
    });

    const labels = Object.keys(categories);
    const data = Object.values(categories);

    if (dashChartInstance) dashChartInstance.destroy();

    dashChartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels.length ? labels : ['Sem Gastos'],
            datasets: [{
                data: data.length ? data : [1],
                backgroundColor: ['#22c55e', '#06b6d4', '#f59e0b', '#f43f5e', '#a855f7'],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'bottom', labels: { color: '#9ca3af', font: { size: 10 } } }
            },
            cutout: '70%'
        }
    });
}

function setTaskView(view) {
    currentTaskView = view;
    if (view === 'kanban') {
        document.getElementById('tasks-kanban-view').classList.remove('hidden');
        document.getElementById('tasks-list-view').classList.add('hidden');
        document.getElementById('btn-view-kanban').className = 'px-2.5 py-1 text-xs font-semibold rounded bg-brand-600 text-white transition';
        document.getElementById('btn-view-list').className = 'px-2.5 py-1 text-xs font-semibold rounded text-gray-400 hover:text-white transition';
    } else {
        document.getElementById('tasks-kanban-view').classList.add('hidden');
        document.getElementById('tasks-list-view').classList.remove('hidden');
        document.getElementById('btn-view-list').className = 'px-2.5 py-1 text-xs font-semibold rounded bg-brand-600 text-white transition';
        document.getElementById('btn-view-kanban').className = 'px-2.5 py-1 text-xs font-semibold rounded text-gray-400 hover:text-white transition';
    }
    renderTasks();
}

function renderTasks() {
    const search = document.getElementById('task-search').value.toLowerCase();
    const prioFilter = document.getElementById('task-filter-priority').value;

    let filtered = state.tasks.filter(t => {
        const matchesSearch = t.title.toLowerCase().includes(search);
        const matchesPrio = prioFilter === 'all' || t.priority === prioFilter;
        return matchesSearch && matchesPrio;
    });

    if (currentTaskView === 'kanban') {
        const todoCol = document.getElementById('col-todo');
        const inProgressCol = document.getElementById('col-in-progress');
        const doneCol = document.getElementById('col-done');

        todoCol.innerHTML = '';
        inProgressCol.innerHTML = '';
        doneCol.innerHTML = '';

        let todoCount = 0, inProgCount = 0, doneCount = 0;

        filtered.forEach(t => {
            const card = createTaskCard(t);
            if (t.status === 'To Do') {
                todoCol.appendChild(card);
                todoCount++;
            } else if (t.status === 'In Progress') {
                inProgressCol.appendChild(card);
                inProgCount++;
            } else if (t.status === 'Done') {
                doneCol.appendChild(card);
                doneCount++;
            }
        });

        document.getElementById('count-todo').textContent = todoCount;
        document.getElementById('count-in-progress').textContent = inProgCount;
        document.getElementById('count-done').textContent = doneCount;

    } else {
        const listContainer = document.getElementById('tasks-list-container');
        listContainer.innerHTML = '';
        filtered.forEach(t => {
            listContainer.innerHTML += `
                <div class="py-3 flex items-center justify-between text-xs">
                    <div class="flex items-center gap-3">
                        <input type="checkbox" ${t.status === 'Done' ? 'checked' : ''} onchange="toggleTaskStatus('${t.id}')" class="rounded custom-checkbox w-4 h-4 cursor-pointer">
                        <div>
                            <p class="font-bold text-white ${t.status === 'Done' ? 'line-through text-gray-500' : ''}">${escapeHtml(t.title)}</p>
                            <p class="text-[10px] text-gray-400">${t.category} • Vencimento: ${t.dueDate}</p>
                        </div>
                    </div>
                    <div class="flex items-center gap-2">
                        <span class="px-2 py-0.5 rounded text-[10px] font-bold ${t.priority === 'Alta' ? 'bg-rose-500/10 text-rose-400' : 'bg-amber-500/10 text-amber-400'}">${t.priority}</span>
                        <button onclick="deleteTask('${t.id}')" class="text-gray-500 hover:text-rose-400 p-1"><i class="fa-solid fa-trash"></i></button>
                    </div>
                </div>
            `;
        });
    }
}

function createTaskCard(t) {
    const div = document.createElement('div');
    div.className = 'glass-card p-3 rounded-xl space-y-2 border border-dark-border hover:border-brand-500/40 transition cursor-pointer';
    
    const prioBadge = t.priority === 'Alta' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' : (t.priority === 'Média' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-gray-500/10 text-gray-400 border-gray-500/20');

    div.innerHTML = `
        <div class="flex items-start justify-between gap-2">
            <span class="text-xs font-bold text-white leading-snug">${escapeHtml(t.title)}</span>
            <button onclick="deleteTask('${t.id}')" class="text-gray-500 hover:text-rose-400 text-xs"><i class="fa-solid fa-trash"></i></button>
        </div>
        <div class="flex items-center justify-between pt-1">
            <span class="text-[10px] px-2 py-0.5 rounded border ${prioBadge} font-bold">${t.priority}</span>
            <select onchange="updateTaskStatus('${t.id}', this.value)" class="bg-dark-bg text-[10px] text-gray-300 border border-dark-border rounded px-1.5 py-0.5 focus:outline-none">
                <option value="To Do" ${t.status === 'To Do' ? 'selected' : ''}>A Fazer</option>
                <option value="In Progress" ${t.status === 'In Progress' ? 'selected' : ''}>Em Progresso</option>
                <option value="Done" ${t.status === 'Done' ? 'selected' : ''}>Concluído</option>
            </select>
        </div>
    `;
    return div;
}

function toggleTaskStatus(id) {
    const task = state.tasks.find(t => t.id === id);
    if (task) {
        task.status = task.status === 'Done' ? 'To Do' : 'Done';
        saveState();
    }
}

function updateTaskStatus(id, newStatus) {
    const task = state.tasks.find(t => t.id === id);
    if (task) {
        task.status = newStatus;
        saveState();
    }
}

function deleteTask(id) {
    state.tasks = state.tasks.filter(t => t.id !== id);
    saveState();
}

function renderFinances() {
    const inc = state.finances.filter(f => f.type === 'income').reduce((a, b) => a + b.amount, 0);
    const exp = state.finances.filter(f => f.type === 'expense').reduce((a, b) => a + b.amount, 0);
    const bal = inc - exp;

    document.getElementById('fin-income').textContent = `R$ ${inc.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
    document.getElementById('fin-expense').textContent = `R$ ${exp.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
    document.getElementById('fin-balance').textContent = `R$ ${bal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;

    const listContainer = document.getElementById('finance-list');
    listContainer.innerHTML = '';

    state.finances.forEach(f => {
        const isInc = f.type === 'income';
        listContainer.innerHTML += `
            <div class="py-3 flex items-center justify-between text-xs">
                <div class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded-lg ${isInc ? 'bg-brand-500/10 text-brand-400' : 'bg-rose-500/10 text-rose-400'} flex items-center justify-center">
                        <i class="fa-solid ${isInc ? 'fa-arrow-down-left' : 'fa-arrow-up-right'}"></i>
                    </div>
                    <div>
                        <p class="font-bold text-white">${escapeHtml(f.title)}</p>
                        <p class="text-[10px] text-gray-400">${f.category} • ${f.date}</p>
                    </div>
                </div>
                <div class="flex items-center gap-3">
                    <span class="font-bold ${isInc ? 'text-brand-400' : 'text-rose-400'}">${isInc ? '+' : '-'} R$ ${f.amount.toFixed(2)}</span>
                    <button onclick="deleteFinance('${f.id}')" class="text-gray-500 hover:text-rose-400"><i class="fa-solid fa-trash"></i></button>
                </div>
            </div>
        `;
    });

    const ctx = document.getElementById('finance-chart-main');
    if (ctx) {
        const categories = {};
        state.finances.filter(f => f.type === 'expense').forEach(f => {
            categories[f.category] = (categories[f.category] || 0) + f.amount;
        });

        if (finChartInstance) finChartInstance.destroy();
        finChartInstance = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: Object.keys(categories),
                datasets: [{
                    label: 'Gastos R$',
                    data: Object.values(categories),
                    backgroundColor: '#f43f5e',
                    borderRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    x: { ticks: { color: '#9ca3af', font: { size: 10 } }, grid: { display: false } },
                    y: { ticks: { color: '#9ca3af', font: { size: 10 } }, grid: { color: '#1f2937' } }
                }
            }
        });
    }
}

function deleteFinance(id) {
    state.finances = state.finances.filter(f => f.id !== id);
    saveState();
}

function renderHabits() {
    const daysName = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
    const container = document.getElementById('habits-matrix-container');
    container.innerHTML = '';

    state.habits.forEach(h => {
        let daysHtml = '';
        daysName.forEach((day, idx) => {
            const isDone = h.completedDays.includes(idx);
            daysHtml += `
                <button onclick="toggleHabitDay('${h.id}', ${idx})" class="flex flex-col items-center gap-1 p-2 rounded-xl border transition ${isDone ? 'bg-brand-500/20 border-brand-500 text-brand-400' : 'bg-dark-bg border-dark-border text-gray-500 hover:text-white'}">
                    <span class="text-[10px] font-bold">${day}</span>
                    <i class="fa-solid ${isDone ? 'fa-check' : 'fa-minus'} text-xs"></i>
                </button>
            `;
        });

        container.innerHTML += `
            <div class="glass-card p-4 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div class="flex items-center justify-between md:justify-start gap-4">
                    <div>
                        <h4 class="font-bold text-white text-sm">${escapeHtml(h.title)}</h4>
                        <span class="text-[10px] text-gray-400">${h.category}</span>
                    </div>
                    <div class="bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1">
                        <i class="fa-solid fa-fire"></i> ${h.streak}d
                    </div>
                </div>
                <div class="grid grid-cols-7 gap-1.5 sm:gap-2">
                    ${daysHtml}
                </div>
            </div>
        `;
    });
}

function toggleHabitDay(habitId, dayIdx) {
    const habit = state.habits.find(h => h.id === habitId);
    if (habit) {
        if (habit.completedDays.includes(dayIdx)) {
            habit.completedDays = habit.completedDays.filter(d => d !== dayIdx);
        } else {
            habit.completedDays.push(dayIdx);
        }
        habit.streak = habit.completedDays.length * 2;
        saveState();
    }
}

function renderNotes() {
    const search = document.getElementById('note-search').value.toLowerCase();
    const grid = document.getElementById('notes-grid');
    grid.innerHTML = '';

    const filtered = state.notes.filter(n => 
        n.title.toLowerCase().includes(search) || 
        n.content.toLowerCase().includes(search) ||
        n.tags.some(t => t.toLowerCase().includes(search))
    );

    filtered.forEach(n => {
        grid.innerHTML += `
            <div class="glass-card p-4 rounded-2xl space-y-3 flex flex-col justify-between border border-dark-border hover:border-brand-500/30 transition">
                <div class="space-y-2">
                    <div class="flex items-start justify-between gap-2">
                        <h4 class="font-bold text-white text-sm">${escapeHtml(n.title)}</h4>
                        <button onclick="toggleFavoriteNote('${n.id}')" class="${n.favorite ? 'text-amber-400' : 'text-gray-600 hover:text-amber-400'} text-xs">
                            <i class="fa-solid fa-star"></i>
                        </button>
                    </div>
                    <p class="text-xs text-gray-300 leading-relaxed whitespace-pre-line line-clamp-4">${escapeHtml(n.content)}</p>
                </div>
                <div class="pt-2 border-t border-dark-border flex items-center justify-between text-[10px]">
                    <div class="flex gap-1 flex-wrap">
                        ${n.tags.map(t => `<span class="bg-dark-bg text-gray-400 px-1.5 py-0.5 rounded border border-dark-border">#${t}</span>`).join('')}
                    </div>
                    <button onclick="deleteNote('${n.id}')" class="text-gray-500 hover:text-rose-400"><i class="fa-solid fa-trash"></i></button>
                </div>
            </div>
        `;
    });
}

function toggleFavoriteNote(id) {
    const note = state.notes.find(n => n.id === id);
    if (note) {
        note.favorite = !note.favorite;
        saveState();
    }
}

function deleteNote(id) {
    state.notes = state.notes.filter(n => n.id !== id);
    saveState();
}

function setPomoMode(mode) {
    state.pomodoro.mode = mode;
    if (pomodoroTimer) clearInterval(pomodoroTimer);
    state.pomodoro.isRunning = false;

    if (mode === 'focus') state.pomodoro.timeLeft = 25 * 60;
    else if (mode === 'shortBreak') state.pomodoro.timeLeft = 5 * 60;
    else if (mode === 'longBreak') state.pomodoro.timeLeft = 15 * 60;

    updatePomoUI();
}

function togglePomodoro() {
    if (state.pomodoro.isRunning) {
        clearInterval(pomodoroTimer);
        state.pomodoro.isRunning = false;
    } else {
        state.pomodoro.isRunning = true;
        pomodoroTimer = setInterval(() => {
            if (state.pomodoro.timeLeft > 0) {
                state.pomodoro.timeLeft--;
                updatePomoUI();
            } else {
                clearInterval(pomodoroTimer);
                state.pomodoro.isRunning = false;
                playChime();
                if (state.pomodoro.mode === 'focus') {
                    state.pomodoro.focusMinutesToday += 25;
                    state.pomodoro.sessionsToday += 1;
                }
                saveState();
                alert("Sessão Pomodoro Concluída! 🎉");
            }
        }, 1000);
    }
    updatePomoUI();
}

function resetPomodoro() {
    setPomoMode(state.pomodoro.mode);
}

function updatePomoUI() {
    const min = Math.floor(state.pomodoro.timeLeft / 60);
    const sec = state.pomodoro.timeLeft % 60;
    const timeStr = `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;

    document.getElementById('pomo-timer-text').textContent = timeStr;
    document.getElementById('dash-pomo-display').textContent = timeStr;

    const btnText = state.pomodoro.isRunning ? 'Pausar' : 'Iniciar Foco';
    document.getElementById('pomo-main-btn').textContent = btnText;
    document.getElementById('dash-pomo-btn').textContent = btnText;

    const total = state.pomodoro.mode === 'focus' ? 25 * 60 : (state.pomodoro.mode === 'shortBreak' ? 5 * 60 : 15 * 60);
    const offset = 691 - (state.pomodoro.timeLeft / total) * 691;
    const ring = document.getElementById('pomo-progress-ring');
    if (ring) ring.style.strokeDashoffset = offset;

    document.getElementById('pomo-sessions-count').textContent = state.pomodoro.sessionsToday;
    document.getElementById('pomo-total-time').textContent = `${state.pomodoro.focusMinutesToday} min`;
}

function renderWishlist() {
    const search = (document.getElementById('wish-search')?.value || '').toLowerCase();
    const catFilter = document.getElementById('wish-filter-category')?.value || 'all';
    const prioFilter = document.getElementById('wish-filter-priority')?.value || 'all';
    const statusFilter = document.getElementById('wish-filter-status')?.value || 'all';

    const totalSaved = state.wishlist.reduce((acc, w) => acc + w.savedAmount, 0);
    const totalTarget = state.wishlist.reduce((acc, w) => acc + w.targetAmount, 0);
    const totalConquered = state.wishlist.filter(w => w.conquered).length;
    const totalCount = state.wishlist.length;
    const overallPct = totalTarget > 0 ? Math.min(100, Math.round((totalSaved / totalTarget) * 100)) : 0;

    document.getElementById('wish-total-saved').textContent = `R$ ${totalSaved.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
    document.getElementById('wish-total-target').textContent = `R$ ${totalTarget.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
    document.getElementById('wish-conquered-count').textContent = `${totalConquered} / ${totalCount}`;
    document.getElementById('wish-overall-pct').textContent = `${overallPct}%`;
    document.getElementById('wish-overall-bar').style.width = `${overallPct}%`;

    const filtered = state.wishlist.filter(w => {
        const matchesSearch = w.title.toLowerCase().includes(search) || (w.notes && w.notes.toLowerCase().includes(search));
        const matchesCat = catFilter === 'all' || w.category === catFilter;
        const matchesPrio = prioFilter === 'all' || w.priority === prioFilter;
        const matchesStatus = statusFilter === 'all' || (statusFilter === 'conquered' ? w.conquered : !w.conquered);
        return matchesSearch && matchesCat && matchesPrio && matchesStatus;
    });

    const grid = document.getElementById('wishlist-cards-grid');
    grid.innerHTML = '';

    if (filtered.length === 0) {
        grid.innerHTML = `
            <div class="col-span-full py-12 text-center text-gray-500 space-y-3 glass-card rounded-2xl">
                <i class="fa-solid fa-wand-magic-sparkles text-3xl text-accent-pink/40"></i>
                <p class="text-sm font-semibold">Nenhum desejo encontrado nesta categoria.</p>
                <button onclick="openModal('wish')" class="text-xs text-accent-pink font-bold hover:underline">+ Cadastrar novo desejo</button>
            </div>
        `;
        return;
    }

    filtered.forEach(w => {
        const pct = w.targetAmount > 0 ? Math.min(100, Math.round((w.savedAmount / w.targetAmount) * 100)) : 0;
        const isConquered = w.conquered;

        const prioClass = w.priority === 'Alta' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' : (w.priority === 'Média' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-gray-500/10 text-gray-400 border-gray-500/20');

        const catIcons = {
            'Tecnologia': 'fa-laptop',
            'Viagens': 'fa-plane',
            'Lazer': 'fa-gamepad',
            'Casa': 'fa-couch',
            'Estudos': 'fa-graduation-cap',
            'Vestuário': 'fa-shirt',
            'Outros': 'fa-gift'
        };
        const catIcon = catIcons[w.category] || 'fa-gift';

        grid.innerHTML += `
            <div class="glass-card glass-card-hover p-5 rounded-2xl space-y-4 flex flex-col justify-between relative overflow-hidden border ${isConquered ? 'border-brand-500/40 bg-brand-500/5' : 'border-dark-border'}">
                <div class="space-y-3">
                    <div class="flex items-center justify-between">
                        <span class="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5 bg-dark-bg px-2.5 py-1 rounded-md border border-dark-border">
                            <i class="fa-solid ${catIcon} text-accent-pink"></i>
                            <span>${w.category}</span>
                        </span>
                        
                        <div class="flex items-center gap-2">
                            <span class="text-[10px] font-bold px-2 py-0.5 rounded border ${prioClass}">${w.priority}</span>
                            <button onclick="deleteWish('${w.id}')" class="text-gray-500 hover:text-rose-400 text-xs transition"><i class="fa-solid fa-trash"></i></button>
                        </div>
                    </div>

                    <div class="space-y-1">
                        <div class="flex items-start justify-between gap-2">
                            <h4 class="font-extrabold text-white text-base leading-snug ${isConquered ? 'line-through opacity-80' : ''}">${escapeHtml(w.title)}</h4>
                            ${isConquered ? '<span class="bg-brand-500/20 text-brand-400 border border-brand-500/30 text-[10px] font-black px-2 py-0.5 rounded-full uppercase shrink-0">Conquistado 🎉</span>' : ''}
                        </div>
                        ${w.notes ? `<p class="text-xs text-gray-400 line-clamp-2">${escapeHtml(w.notes)}</p>` : ''}
                    </div>
                </div>

                <div class="space-y-2 bg-dark-bg/60 p-3 rounded-xl border border-dark-border">
                    <div class="flex items-center justify-between text-xs">
                        <span class="text-gray-400">Progresso</span>
                        <span class="font-mono font-bold text-accent-pink">${pct}%</span>
                    </div>
                    
                    <div class="w-full bg-dark-card rounded-full h-2 overflow-hidden">
                        <div class="bg-gradient-to-r ${isConquered ? 'from-brand-500 to-brand-400' : 'from-accent-pink to-accent-cyan'} h-full rounded-full transition-all duration-500" style="width: ${pct}%"></div>
                    </div>

                    <div class="flex justify-between items-center text-xs pt-1 font-mono">
                        <div>
                            <span class="text-[10px] text-gray-500 block">Guardado</span>
                            <span class="font-bold text-white">R$ ${w.savedAmount.toLocaleString('pt-BR')}</span>
                        </div>
                        <div class="text-right">
                            <span class="text-[10px] text-gray-500 block">Meta</span>
                            <span class="font-bold text-gray-300">R$ ${w.targetAmount.toLocaleString('pt-BR')}</span>
                        </div>
                    </div>
                </div>

                <div class="pt-2 flex items-center justify-between gap-2 border-t border-dark-border">
                    <button onclick="quickAddSavingsPrompt('${w.id}')" ${isConquered ? 'disabled class="opacity-40 text-gray-500 text-xs cursor-not-allowed"' : 'class="bg-accent-pink/10 hover:bg-accent-pink/20 text-accent-pink border border-accent-pink/30 text-xs font-bold px-3 py-1.5 rounded-lg transition flex items-center gap-1.5"'}>
                        <i class="fa-solid fa-plus text-[10px]"></i> + Economia
                    </button>

                    <div class="flex items-center gap-1.5">
                        ${w.url ? `<a href="${escapeHtml(w.url)}" target="_blank" class="p-1.5 text-gray-400 hover:text-white bg-dark-bg hover:bg-dark-border rounded-lg border border-dark-border text-xs transition" title="Abrir link do produto"><i class="fa-solid fa-arrow-up-right-from-square"></i></a>` : ''}
                        
                        <button onclick="toggleWishConquered('${w.id}')" class="p-1.5 ${isConquered ? 'bg-brand-500/20 text-brand-400 border-brand-500/40' : 'bg-dark-bg text-gray-400 hover:text-white'} border border-dark-border rounded-lg text-xs transition" title="${isConquered ? 'Marcar como não conquistado' : 'Marcar como conquistado'}">
                            <i class="fa-solid fa-trophy"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    });
}

function toggleWishConquered(id) {
    const wish = state.wishlist.find(w => w.id === id);
    if (wish) {
        wish.conquered = !wish.conquered;
        if (wish.conquered) {
            wish.savedAmount = wish.targetAmount;
            triggerConfetti();
        }
        saveState();
    }
}

function deleteWish(id) {
    if (confirm("Tem certeza que deseja remover este desejo?")) {
        state.wishlist = state.wishlist.filter(w => w.id !== id);
        saveState();
    }
}

function quickAddSavingsPrompt(id) {
    activeWishSavingsId = id;
    openModal('add-savings');
}

function openModal(type) {
    currentModalType = type;
    const modal = document.getElementById('app-modal');
    const title = document.getElementById('modal-title');
    const body = document.getElementById('modal-body');

    body.innerHTML = '';
    modal.classList.remove('hidden');

    if (type === 'task' || type === 'quick-add') {
        title.textContent = 'Criar Nova Tarefa';
        body.innerHTML = `
            <div>
                <label class="text-xs text-gray-400 font-semibold">Título</label>
                <input type="text" name="title" required class="w-full bg-dark-bg border border-dark-border rounded-lg p-2 text-xs text-white mt-1">
            </div>
            <div class="grid grid-cols-2 gap-2">
                <div>
                    <label class="text-xs text-gray-400 font-semibold">Prioridade</label>
                    <select name="priority" class="w-full bg-dark-bg border border-dark-border rounded-lg p-2 text-xs text-white mt-1">
                        <option value="Alta">Alta</option>
                        <option value="Média" selected>Média</option>
                        <option value="Baixa">Baixa</option>
                    </select>
                </div>
                <div>
                    <label class="text-xs text-gray-400 font-semibold">Categoria</label>
                    <input type="text" name="category" value="Geral" class="w-full bg-dark-bg border border-dark-border rounded-lg p-2 text-xs text-white mt-1">
                </div>
            </div>
        `;
    } else if (type === 'finance') {
        title.textContent = 'Nova Transação';
        body.innerHTML = `
            <div>
                <label class="text-xs text-gray-400 font-semibold">Descrição</label>
                <input type="text" name="title" required class="w-full bg-dark-bg border border-dark-border rounded-lg p-2 text-xs text-white mt-1">
            </div>
            <div class="grid grid-cols-2 gap-2">
                <div>
                    <label class="text-xs text-gray-400 font-semibold">Valor (R$)</label>
                    <input type="number" step="0.01" name="amount" required class="w-full bg-dark-bg border border-dark-border rounded-lg p-2 text-xs text-white mt-1">
                </div>
                <div>
                    <label class="text-xs text-gray-400 font-semibold">Tipo</label>
                    <select name="type" class="w-full bg-dark-bg border border-dark-border rounded-lg p-2 text-xs text-white mt-1">
                        <option value="expense">Despesa</option>
                        <option value="income">Receita</option>
                    </select>
                </div>
            </div>
            <div>
                <label class="text-xs text-gray-400 font-semibold">Categoria</label>
                <input type="text" name="category" value="Outros" class="w-full bg-dark-bg border border-dark-border rounded-lg p-2 text-xs text-white mt-1">
            </div>
        `;
    } else if (type === 'habit') {
        title.textContent = 'Novo Hábito';
        body.innerHTML = `
            <div>
                <label class="text-xs text-gray-400 font-semibold">Nome do Hábito</label>
                <input type="text" name="title" required class="w-full bg-dark-bg border border-dark-border rounded-lg p-2 text-xs text-white mt-1">
            </div>
            <div>
                <label class="text-xs text-gray-400 font-semibold">Categoria</label>
                <input type="text" name="category" value="Saúde" class="w-full bg-dark-bg border border-dark-border rounded-lg p-2 text-xs text-white mt-1">
            </div>
        `;
    } else if (type === 'note') {
        title.textContent = 'Nova Nota';
        body.innerHTML = `
            <div>
                <label class="text-xs text-gray-400 font-semibold">Título</label>
                <input type="text" name="title" required class="w-full bg-dark-bg border border-dark-border rounded-lg p-2 text-xs text-white mt-1">
            </div>
            <div>
                <label class="text-xs text-gray-400 font-semibold">Conteúdo</label>
                <textarea name="content" rows="4" required class="w-full bg-dark-bg border border-dark-border rounded-lg p-2 text-xs text-white mt-1"></textarea>
            </div>
            <div>
                <label class="text-xs text-gray-400 font-semibold">Tags (separadas por vírgula)</label>
                <input type="text" name="tags" placeholder="trabalho, ideias" class="w-full bg-dark-bg border border-dark-border rounded-lg p-2 text-xs text-white mt-1">
            </div>
        `;
    } else if (type === 'wish') {
        title.textContent = 'Novo Desejo / Meta';
        body.innerHTML = `
            <div>
                <label class="text-xs text-gray-400 font-semibold">Nome do Item / Meta</label>
                <input type="text" name="title" placeholder="ex: MacBook Pro, Viagem Japão" required class="w-full bg-dark-bg border border-dark-border rounded-lg p-2 text-xs text-white mt-1">
            </div>
            <div class="grid grid-cols-2 gap-2">
                <div>
                    <label class="text-xs text-gray-400 font-semibold">Valor Total (R$)</label>
                    <input type="number" step="0.01" name="targetAmount" required class="w-full bg-dark-bg border border-dark-border rounded-lg p-2 text-xs text-white mt-1">
                </div>
                <div>
                    <label class="text-xs text-gray-400 font-semibold">Já Economizado (R$)</label>
                    <input type="number" step="0.01" name="savedAmount" value="0" class="w-full bg-dark-bg border border-dark-border rounded-lg p-2 text-xs text-white mt-1">
                </div>
            </div>
            <div class="grid grid-cols-2 gap-2">
                <div>
                    <label class="text-xs text-gray-400 font-semibold">Categoria</label>
                    <select name="category" class="w-full bg-dark-bg border border-dark-border rounded-lg p-2 text-xs text-white mt-1">
                        <option value="Tecnologia">Tecnologia</option>
                        <option value="Viagens">Viagens</option>
                        <option value="Lazer">Lazer</option>
                        <option value="Casa">Casa</option>
                        <option value="Estudos">Estudos</option>
                        <option value="Vestuário">Vestuário</option>
                        <option value="Outros">Outros</option>
                    </select>
                </div>
                <div>
                    <label class="text-xs text-gray-400 font-semibold">Prioridade</label>
                    <select name="priority" class="w-full bg-dark-bg border border-dark-border rounded-lg p-2 text-xs text-white mt-1">
                        <option value="Alta">Alta</option>
                        <option value="Média" selected>Média</option>
                        <option value="Baixa">Baixa</option>
                    </select>
                </div>
            </div>
            <div>
                <label class="text-xs text-gray-400 font-semibold">Link / URL do Produto (opcional)</label>
                <input type="url" name="url" placeholder="https://..." class="w-full bg-dark-bg border border-dark-border rounded-lg p-2 text-xs text-white mt-1">
            </div>
            <div>
                <label class="text-xs text-gray-400 font-semibold">Observações / Motivação</label>
                <textarea name="notes" rows="2" placeholder="Por que deseja conquistar este item?" class="w-full bg-dark-bg border border-dark-border rounded-lg p-2 text-xs text-white mt-1"></textarea>
            </div>
        `;
    } else if (type === 'add-savings') {
        const wish = state.wishlist.find(w => w.id === activeWishSavingsId);
        const remaining = wish ? wish.targetAmount - wish.savedAmount : 0;
        title.textContent = `Adicionar Economia: ${wish ? wish.title : ''}`;
        body.innerHTML = `
            <p class="text-xs text-gray-400">Restante para alcançar a meta: <strong class="text-accent-pink">R$ ${remaining.toLocaleString('pt-BR')}</strong></p>
            <div>
                <label class="text-xs text-gray-400 font-semibold">Valor a Adicionar (R$)</label>
                <input type="number" step="0.01" name="addedAmount" required class="w-full bg-dark-bg border border-dark-border rounded-lg p-2 text-xs text-white mt-1">
            </div>
        `;
    }
}

function closeModal() {
    document.getElementById('app-modal').classList.add('hidden');
}

function handleModalSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.target);

    if (currentModalType === 'task' || currentModalType === 'quick-add') {
        state.tasks.push({
            id: Date.now().toString(),
            title: formData.get('title'),
            priority: formData.get('priority'),
            status: 'To Do',
            category: formData.get('category') || 'Geral',
            dueDate: new Date().toISOString().split('T')[0]
        });
    } else if (currentModalType === 'finance') {
        state.finances.push({
            id: Date.now().toString(),
            title: formData.get('title'),
            amount: parseFloat(formData.get('amount')),
            type: formData.get('type'),
            category: formData.get('category') || 'Outros',
            date: new Date().toISOString().split('T')[0]
        });
    } else if (currentModalType === 'habit') {
        state.habits.push({
            id: Date.now().toString(),
            title: formData.get('title'),
            category: formData.get('category') || 'Geral',
            streak: 0,
            completedDays: []
        });
    } else if (currentModalType === 'note') {
        const tagsStr = formData.get('tags') || '';
        state.notes.push({
            id: Date.now().toString(),
            title: formData.get('title'),
            content: formData.get('content'),
            tags: tagsStr.split(',').map(t => t.trim()).filter(Boolean),
            favorite: false,
            date: new Date().toISOString().split('T')[0]
        });
    } else if (currentModalType === 'wish') {
        const targetAmount = parseFloat(formData.get('targetAmount')) || 0;
        const savedAmount = parseFloat(formData.get('savedAmount')) || 0;
        const conquered = savedAmount >= targetAmount && targetAmount > 0;

        state.wishlist.push({
            id: Date.now().toString(),
            title: formData.get('title'),
            targetAmount: targetAmount,
            savedAmount: savedAmount,
            category: formData.get('category') || 'Outros',
            priority: formData.get('priority') || 'Média',
            conquered: conquered,
            url: formData.get('url') || '',
            notes: formData.get('notes') || ''
        });

        if (conquered) triggerConfetti();
    } else if (currentModalType === 'add-savings') {
        const added = parseFloat(formData.get('addedAmount')) || 0;
        const wish = state.wishlist.find(w => w.id === activeWishSavingsId);
        if (wish) {
            wish.savedAmount += added;
            if (wish.savedAmount >= wish.targetAmount) {
                wish.savedAmount = wish.targetAmount;
                wish.conquered = true;
                triggerConfetti();
            }
        }
    }

    closeModal();
    saveState();
}

function refreshUI() {
    renderDashboard();
    renderTasks();
    renderFinances();
    renderHabits();
    renderNotes();
    renderWishlist();
    updatePomoUI();
}

window.addEventListener('DOMContentLoaded', () => {
    refreshUI();
});
// js/app.js
function refreshUI() {
    renderDashboard();
    renderTasks();
    renderFinances();
    renderHabits();
    renderNotes(58448);
    renderWishlist();
    updatePomoUI();
}

window.addEventListener('DOMContentLoaded', () => {
    refreshUI();
});
