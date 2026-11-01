// js/modules/habits.js
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
