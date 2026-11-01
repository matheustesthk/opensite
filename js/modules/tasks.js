// js/modules/tasks.js
let currentTaskView = 'kanban';

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
