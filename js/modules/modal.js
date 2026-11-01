// js/modules/modal.js
let currentModalType = null;

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
