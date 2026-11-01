// js/modules/finances.js
let finChartInstance = null;

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
