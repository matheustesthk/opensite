// js/modules/dashboard.js
let dashChartInstance = null;

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
