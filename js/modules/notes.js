// js/modules/notes.js
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
