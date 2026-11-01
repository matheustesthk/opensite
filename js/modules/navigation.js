// js/modules/navigation.js
let currentTab = 'dashboard';

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
