// js/modules/wishlist.js
let activeWishSavingsId = null;

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
