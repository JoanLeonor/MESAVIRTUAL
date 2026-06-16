document.addEventListener('DOMContentLoaded', () => {
    
    // --- LÓGICA DE LA INTERFAZ (LOBBY) ---
    const avatarBtn = document.getElementById('avatar-btn');
    const userDropdown = document.getElementById('user-dropdown');

    // Toggle dropdown de usuario
    if (avatarBtn && userDropdown) {
        avatarBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            userDropdown.classList.toggle('show');
        });

        // Cerrar dropdown si se hace click fuera
        document.addEventListener('click', (e) => {
            if (!userDropdown.contains(e.target)) {
                userDropdown.classList.remove('show');
            }
        });
    }

    // --- COLOR PICKER TEMPORAL ---
    const root = document.documentElement;
    const colorBg = document.getElementById('color-bg');
    const colorPanel = document.getElementById('color-panel');
    const colorPrimary = document.getElementById('color-primary');
    const colorText = document.getElementById('color-text');

    if (colorBg) colorBg.addEventListener('input', (e) => root.style.setProperty('--bg-color', e.target.value));
    if (colorPanel) colorPanel.addEventListener('input', (e) => {
        const hex = e.target.value;
        let r = parseInt(hex.slice(1, 3), 16),
            g = parseInt(hex.slice(3, 5), 16),
            b = parseInt(hex.slice(5, 7), 16);
        root.style.setProperty('--panel-bg', `rgba(${r}, ${g}, ${b}, 0.6)`);
    });
    if (colorPrimary) colorPrimary.addEventListener('input', (e) => root.style.setProperty('--primary-color', e.target.value));
    if (colorText) colorText.addEventListener('input', (e) => root.style.setProperty('--text-main', e.target.value));

    // --- LÓGICA DE NAVEGACIÓN (TABS) ---
    const navTabs = document.querySelectorAll('.nav-tab');
    const tabPanes = document.querySelectorAll('.tab-pane');

    navTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Remover 'active' de todos los tabs y paneles
            navTabs.forEach(t => t.classList.remove('active'));
            tabPanes.forEach(p => p.classList.remove('active'));

            // Añadir 'active' al tab clickeado
            tab.classList.add('active');

            // Mostrar el panel correspondiente
            const targetId = tab.getAttribute('data-target');
            if (targetId) {
                const targetPanel = document.getElementById(targetId);
                if (targetPanel) {
                    targetPanel.classList.add('active');
                }
            }
        });
    });

    // --- LÓGICA DE MODALES GLOBALES ---
    const modals = {
        create: document.getElementById('modal-create-section'),
        join: document.getElementById('modal-join-section'),
        invite: document.getElementById('modal-invite'),
        game: document.getElementById('modal-game'),
        character: document.getElementById('modal-character'),
        category: document.getElementById('modal-category'),
        image: document.getElementById('modal-image')
    };

    const openModal = (modalNode) => {
        if(modalNode) modalNode.classList.add('show');
    };
    const closeModal = (modalNode) => {
        if(modalNode) modalNode.classList.remove('show');
    };

    // Botones de Abrir
    document.getElementById('btn-open-create-section')?.addEventListener('click', () => {
        const selectGame = document.getElementById('select-linked-game');
        if(selectGame) {
            selectGame.innerHTML = '<option value="">-- Sin Juego Vinculado (Por defecto) --</option>';
            myGames.forEach(g => {
                const opt = document.createElement('option');
                opt.value = g.id;
                opt.textContent = `${g.icon} ${g.name}`;
                selectGame.appendChild(opt);
            });
        }
        openModal(modals.create);
    });
    document.getElementById('btn-open-join-section')?.addEventListener('click', () => openModal(modals.join));
    document.getElementById('btn-open-invite')?.addEventListener('click', () => openModal(modals.invite));

    // Botones de Cerrar (la X)
    document.querySelectorAll('.modal-close').forEach(btn => {
        btn.addEventListener('click', (e) => {
            closeModal(e.target.closest('.modal-overlay'));
        });
    });

    // Cerrar al clickear fuera del contenido
    Object.values(modals).forEach(modal => {
        if(modal) {
            modal.addEventListener('click', (e) => {
                if(e.target === modal) closeModal(modal);
            });
        }
    });

    // --- LÓGICA DE ENTRAR A LA MESA VIRTUAL ---
    const lobbyScreen = document.getElementById('lobby-screen');
    const gameScreen = document.getElementById('game-screen');
    const displayRoomCode = document.getElementById('display-room-code');
    const historyContainer = document.getElementById('history-container');

    let enterGameRoom = (roomCode, roomName) => {
        // Cerrar modales
        Object.values(modals).forEach(m => closeModal(m));
        
        // Cambiar pantallas
        lobbyScreen.classList.remove('active');
        gameScreen.classList.add('active');

        // Mostrar código en la mesa
        if(displayRoomCode) displayRoomCode.textContent = roomCode;

        // Añadir al historial si no está
        const emptyState = historyContainer.querySelector('.empty-state');
        if(emptyState) emptyState.remove();

        // Crear elemento en historial (siempre arriba)
        const historyItem = document.createElement('div');
        historyItem.className = 'history-item';
        historyItem.innerHTML = `
            <div class="history-item-info">
                <strong>${roomName || 'Mesa Desconocida'}</strong>
                <span>Código: ${roomCode}</span>
            </div>
            <button class="btn secondary" style="width: auto; padding: 8px 16px;">Reingresar</button>
        `;
        // Al clickear "Reingresar" en el historial, entramos directo
        historyItem.querySelector('button').addEventListener('click', () => {
            enterGameRoom(roomCode, roomName);
        });

        // Configurar UI de la Mesa (Ocultar herramientas si están desactivadas en el Juego)
        const game = myGames.find(g => g.id === window.currentLinkedGameId);
        if(game && game.tools) {
            // Ejemplo básico: ocultar panel de dados si tools.dice es false
            const diceSection = document.getElementById('btn-roll-dice')?.parentElement;
            if(diceSection) diceSection.style.display = game.tools.dice ? 'block' : 'none';
        }

        historyContainer.prepend(historyItem);
    };

    // Confirmar Crear Sección
    document.getElementById('btn-confirm-create-section')?.addEventListener('click', () => {
        const nameInput = document.getElementById('input-section-name');
        const selectGame = document.getElementById('select-linked-game');
        
        const roomName = nameInput.value.trim() || 'Nueva Partida';
        window.currentLinkedGameId = selectGame ? Number(selectGame.value) : null;
        
        // Generar un código aleatorio simple
        const roomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
        
        // Ponerlo en el modal de invitar también para cuando lo abra luego
        const inviteInput = document.getElementById('input-invite-code');
        if(inviteInput) inviteInput.value = roomCode;

        enterGameRoom(roomCode, roomName);
        nameInput.value = ''; // limpiar
    });

    // Confirmar Unirse a Sección
    document.getElementById('btn-confirm-join-section')?.addEventListener('click', () => {
        const codeInput = document.getElementById('input-join-code');
        const roomCode = codeInput.value.trim().toUpperCase();
        if(!roomCode) return alert('Por favor, ingresa un código de sala válido.');
        
        enterGameRoom(roomCode, 'Mesa Unida');
        codeInput.value = ''; // limpiar
    });

    // Copiar código de invitación
    document.getElementById('btn-copy-invite-code')?.addEventListener('click', () => {
        const inviteInput = document.getElementById('input-invite-code');
        if(inviteInput && inviteInput.value !== '---') {
            navigator.clipboard.writeText(inviteInput.value);
            alert('¡Código copiado al portapapeles!');
        }
    });

    // Volver al Lobby desde la Mesa
    document.getElementById('btn-back-to-lobby')?.addEventListener('click', () => {
        gameScreen.classList.remove('active');
        lobbyScreen.classList.add('active');
    });

    // Entrada rápida a la mesa desde Inicio
    document.getElementById('btn-quick-enter')?.addEventListener('click', () => {
        window.currentLinkedGameId = null; // Sin juego vinculado por defecto
        enterGameRoom('RAPIDO', 'Mesa de Prueba Rápida');
    });

    // --- LÓGICA DE PESTAÑA "JUEGOS" (FASE 5) ---
    const gamesContainer = document.getElementById('games-container');
    let myGames = [
        { id: Date.now(), name: 'Juego de Ejemplo', icon: '🎲' }
    ];
    let editingGameId = null;

    const renderGames = () => {
        if(!gamesContainer) return;
        gamesContainer.innerHTML = ''; // Limpiar

        if(myGames.length === 0) {
            gamesContainer.innerHTML = `<div class="empty-state" style="grid-column: 1 / -1;">No tienes juegos creados. Haz clic en "Crear Nuevo Juego".</div>`;
            return;
        }

        myGames.forEach(game => {
            const card = document.createElement('div');
            card.className = 'game-card';
            card.innerHTML = `
                <div class="game-card-img">${game.icon}</div>
                <h4>${game.name}</h4>
                <div class="game-card-actions">
                    <button class="btn-edit-game" data-id="${game.id}" title="Editar">✏️</button>
                    <button class="btn-config-game" data-id="${game.id}" title="Configurar">⚙️</button>
                    <button class="btn-delete-game" data-id="${game.id}" title="Eliminar" style="color: #ef4444;">🗑️</button>
                </div>
            `;
            gamesContainer.appendChild(card);
        });

        // Eventos para botones generados
        document.querySelectorAll('.btn-edit-game').forEach(btn => {
            btn.addEventListener('click', (e) => openGameModal(Number(e.target.dataset.id)));
        });
        document.querySelectorAll('.btn-delete-game').forEach(btn => {
            btn.addEventListener('click', (e) => deleteGame(Number(e.target.dataset.id)));
        });
        document.querySelectorAll('.btn-config-game').forEach(btn => {
            btn.addEventListener('click', () => alert('La configuración avanzada estará disponible en próximas fases.'));
        });
    };

    const openGameModal = (gameId = null) => {
        editingGameId = gameId;
        const title = document.getElementById('modal-game-title');
        const inputName = document.getElementById('input-game-name');
        const inputIcon = document.getElementById('input-game-icon');

        if(gameId) {
            title.textContent = 'Editar Juego';
            const game = myGames.find(g => g.id === gameId);
            if(game) {
                inputName.value = game.name;
                inputIcon.value = game.icon;
                
                // Cargar herramientas
                const tools = game.tools || {};
                document.getElementById('tool-dice').checked = tools.dice ?? true;
                document.getElementById('tool-notes').checked = tools.notes ?? false;
                document.getElementById('tool-hp').checked = tools.hp ?? false;
                document.getElementById('tool-mana').checked = tools.mana ?? false;
                document.getElementById('tool-stamina').checked = tools.stamina ?? false;
                document.getElementById('tool-roulette').checked = tools.roulette ?? false;
                document.getElementById('tool-inventory').checked = tools.inventory ?? true;
                document.getElementById('tool-item-counter').checked = tools.itemCounter ?? false;

                // Cargar permisos
                const perms = game.perms || {};
                document.getElementById('perm-edit-stats').checked = perms.editStats ?? true;
                document.getElementById('perm-spawn-assets').checked = perms.spawnAssets ?? true;
                document.getElementById('perm-change-map').checked = perms.changeMap ?? false;
                document.getElementById('perm-spawn-chars').checked = perms.spawnChars ?? true;
            }
        } else {
            title.textContent = 'Crear Nuevo Juego';
            inputName.value = '';
            inputIcon.value = '';
            
            // Valores por defecto
            document.getElementById('tool-dice').checked = true;
            document.getElementById('tool-notes').checked = false;
            document.getElementById('tool-hp').checked = false;
            document.getElementById('tool-mana').checked = false;
            document.getElementById('tool-stamina').checked = false;
            document.getElementById('tool-roulette').checked = false;
            document.getElementById('tool-inventory').checked = true;
            document.getElementById('tool-item-counter').checked = false;

            document.getElementById('perm-edit-stats').checked = true;
            document.getElementById('perm-spawn-assets').checked = true;
            document.getElementById('perm-change-map').checked = false;
            document.getElementById('perm-spawn-chars').checked = true;
        }
        openModal(modals.game);
    };

    const deleteGame = (gameId) => {
        if(confirm('¿Estás seguro de que deseas eliminar este juego?')) {
            myGames = myGames.filter(g => g.id !== gameId);
            renderGames();
        }
    };

    document.getElementById('btn-open-create-game')?.addEventListener('click', () => openGameModal(null));

    document.getElementById('btn-save-game')?.addEventListener('click', () => {
        const inputName = document.getElementById('input-game-name').value.trim();
        const inputIcon = document.getElementById('input-game-icon').value.trim() || '🎲';

        if(!inputName) return alert('Por favor, ingresa un nombre para el juego.');

        const toolsConfig = {
            dice: document.getElementById('tool-dice').checked,
            notes: document.getElementById('tool-notes').checked,
            hp: document.getElementById('tool-hp').checked,
            mana: document.getElementById('tool-mana').checked,
            stamina: document.getElementById('tool-stamina').checked,
            roulette: document.getElementById('tool-roulette').checked,
            inventory: document.getElementById('tool-inventory').checked,
            itemCounter: document.getElementById('tool-item-counter').checked
        };

        const permsConfig = {
            editStats: document.getElementById('perm-edit-stats').checked,
            spawnAssets: document.getElementById('perm-spawn-assets').checked,
            changeMap: document.getElementById('perm-change-map').checked,
            spawnChars: document.getElementById('perm-spawn-chars').checked
        };

        if(editingGameId) {
            // Editar existente
            const game = myGames.find(g => g.id === editingGameId);
            if(game) {
                game.name = inputName;
                game.icon = inputIcon;
                game.tools = toolsConfig;
                game.perms = permsConfig;
            }
        } else {
            // Crear nuevo
            myGames.push({
                id: Date.now(),
                name: inputName,
                icon: inputIcon,
                tools: toolsConfig,
                perms: permsConfig
            });
        }

        closeModal(modals.game);
        renderGames();
    });

    // Render inicial
    renderGames();


    // --- LÓGICA DE PESTAÑA "PERSONAJES" (FASE 6) ---
    const charactersContainer = document.getElementById('characters-container');
    const inputCharImage = document.getElementById('input-char-image');
    const charImagePreview = document.getElementById('char-image-preview');
    const formCharacter = document.getElementById('form-character');
    
    let myCharacters = [];
    let currentUploadedImageBase64 = null;

    const renderCharacters = () => {
        if(!charactersContainer) return;
        charactersContainer.innerHTML = ''; 

        if(myCharacters.length === 0) {
            charactersContainer.innerHTML = `<div class="empty-state" style="grid-column: 1 / -1;">No tienes personajes creados. Haz clic en "Crear Nuevo Personaje".</div>`;
            return;
        }

        myCharacters.forEach(char => {
            const card = document.createElement('div');
            card.className = 'character-card';
            
            // Decidir si mostramos imagen o emoji por defecto
            let avatarContent = char.imageUrl 
                ? `<img src="${char.imageUrl}" class="character-img" alt="${char.name}">` 
                : `<div class="character-img">👤</div>`;

            card.innerHTML = `
                ${avatarContent}
                <div class="character-info">
                    <h4>${char.name}</h4>
                    <span>${char.race || 'Desconocido'} • ${char.role || 'Sin Rol'}</span>
                </div>
                <div class="game-card-actions" style="margin-top: 10px;">
                    <button class="btn-delete-char" data-id="${char.id}" title="Eliminar" style="color: #ef4444;">🗑️</button>
                </div>
            `;
            charactersContainer.appendChild(card);
        });

        document.querySelectorAll('.btn-delete-char').forEach(btn => {
            btn.addEventListener('click', (e) => {
                if(confirm('¿Seguro que deseas eliminar este personaje?')) {
                    myCharacters = myCharacters.filter(c => c.id !== Number(e.target.dataset.id));
                    renderCharacters();
                }
            });
        });
    };

    document.getElementById('btn-open-create-character')?.addEventListener('click', () => {
        formCharacter.reset();
        currentUploadedImageBase64 = null;
        charImagePreview.innerHTML = '👤';
        openModal(modals.character);
    });

    // Preview de Imagen Local usando FileReader
    inputCharImage?.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if(file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                currentUploadedImageBase64 = e.target.result;
                charImagePreview.innerHTML = `<img src="${currentUploadedImageBase64}" style="width: 100%; height: 100%; object-fit: cover;">`;
            };
            reader.readAsDataURL(file);
        }
    });

    // Guardar Personaje
    formCharacter?.addEventListener('submit', (e) => {
        e.preventDefault(); // Evita recargar la página

        const newCharacter = {
            id: Date.now(),
            imageUrl: currentUploadedImageBase64,
            name: document.getElementById('char-name').value.trim(),
            alias: document.getElementById('char-alias').value.trim(),
            age: document.getElementById('char-age').value.trim(),
            birth: document.getElementById('char-birth').value.trim(),
            role: document.getElementById('char-role').value.trim(),
            race: document.getElementById('char-race').value.trim(),
            body: document.getElementById('char-body').value.trim(),
            hairEyes: document.getElementById('char-hair-eyes').value.trim(),
            clothing: document.getElementById('char-clothing').value.trim(),
            traits: document.getElementById('char-traits').value.trim(),
            virtues: document.getElementById('char-virtues').value.trim(),
            flaws: document.getElementById('char-flaws').value.trim(),
            fear: document.getElementById('char-fear').value.trim(),
            motivation: document.getElementById('char-motivation').value.trim(),
            status: document.getElementById('char-status').value.trim(),
            allies: document.getElementById('char-allies').value.trim(),
            enemies: document.getElementById('char-enemies').value.trim(),
            past: document.getElementById('char-past').value.trim(),
            skills: document.getElementById('char-skills').value.trim(),
            weakness: document.getElementById('char-weakness').value.trim()
        };

        myCharacters.push(newCharacter);
        closeModal(modals.character);
        renderCharacters();
    });

    // Render Inicial
    renderCharacters();


    // --- LÓGICA DE INVENTARIO Y ARCHIVOS BASE (FASE 7) ---
    const categoriesContainer = document.getElementById('categories-container');
    const imagesContainer = document.getElementById('inventory-images-container');
    const formCategory = document.getElementById('form-category');
    const formImage = document.getElementById('form-image');
    const selectImgCategory = document.getElementById('img-category');
    let currentCategoryId = null; // Para filtrar imágenes

    let inventoryCategories = [];
    let inventoryImages = [];

    const loadInventory = async () => {
        try {
            const [resCat, resImg] = await Promise.all([
                fetch('/api/categories'),
                fetch('/api/images')
            ]);
            inventoryCategories = await resCat.json();
            inventoryImages = await resImg.json();
            renderCategories();
            renderInventoryImages();
            updateCategorySelects();
        } catch(e) {
            console.error('Error loading inventory:', e);
        }
    };

    const renderCategories = () => {
        if(!categoriesContainer) return;
        categoriesContainer.innerHTML = `
            <div class="category-chip ${currentCategoryId === null ? 'active' : ''}" style="cursor: pointer; padding: 10px; background: rgba(255,255,255,0.05); border-radius: 8px; border: 1px solid ${currentCategoryId === null ? 'var(--primary-color)' : 'transparent'};" onclick="window.selectCategory(null)">
                🌎 Todas las Imágenes
            </div>
        `;
        inventoryCategories.forEach(cat => {
            const div = document.createElement('div');
            div.style.cursor = 'pointer';
            div.style.padding = '10px';
            div.style.background = 'rgba(255,255,255,0.05)';
            div.style.borderRadius = '8px';
            div.style.border = `1px solid ${currentCategoryId === cat.id ? 'var(--primary-color)' : 'transparent'}`;
            div.style.display = 'flex';
            div.style.justifyContent = 'space-between';
            div.innerHTML = `
                <span onclick="window.selectCategory('${cat.id}')">${cat.icon || '📂'} ${cat.name}</span>
                <button class="btn-delete-cat" data-id="${cat.id}" style="background:none; border:none; color:#ef4444; cursor:pointer;">✖</button>
            `;
            categoriesContainer.appendChild(div);
        });

        document.querySelectorAll('.btn-delete-cat').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.stopPropagation();
                if(confirm('¿Seguro que deseas eliminar esta categoría?')) {
                    await fetch(`/api/categories/${e.target.dataset.id}`, { method: 'DELETE' });
                    if(currentCategoryId === e.target.dataset.id) currentCategoryId = null;
                    loadInventory();
                }
            });
        });
    };

    window.selectCategory = (id) => {
        currentCategoryId = id;
        document.getElementById('current-category-title').textContent = id 
            ? inventoryCategories.find(c => c.id === id)?.name 
            : 'Todas las Imágenes';
        renderCategories();
        renderInventoryImages();
    };

    const renderInventoryImages = () => {
        if(!imagesContainer) return;
        imagesContainer.innerHTML = '';
        
        let filtered = inventoryImages;
        if(currentCategoryId) {
            filtered = inventoryImages.filter(i => i.categoryId === currentCategoryId);
        }

        if(filtered.length === 0) {
            imagesContainer.innerHTML = `<div class="empty-state" style="grid-column: 1 / -1;">No hay imágenes. Sube un asset nuevo.</div>`;
            return;
        }

        filtered.forEach(img => {
            const card = document.createElement('div');
            card.style.background = 'rgba(255,255,255,0.05)';
            card.style.border = '1px solid var(--panel-border)';
            card.style.borderRadius = '12px';
            card.style.padding = '10px';
            card.style.textAlign = 'center';
            card.innerHTML = `
                <div style="width:100%; height:120px; background: rgba(0,0,0,0.3); border-radius:8px; overflow:hidden; margin-bottom:10px; display:flex; align-items:center; justify-content:center;">
                    ${img.faceUrl ? `<img src="${img.faceUrl}" style="max-width:100%; max-height:100%; object-fit:contain;">` : 'Sin Imagen'}
                </div>
                <h4 style="margin:0; font-size:1rem;">${img.name}</h4>
                <div style="margin-top:10px; display:flex; justify-content:center; gap:5px;">
                    <button class="btn secondary btn-sm btn-edit-img" data-id="${img.id}">✏️</button>
                    <button class="btn secondary btn-sm btn-delete-img" data-id="${img.id}" style="color:#ef4444;">🗑️</button>
                </div>
            `;
            imagesContainer.appendChild(card);
        });

        document.querySelectorAll('.btn-delete-img').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                if(confirm('¿Eliminar imagen?')) {
                    await fetch(`/api/images/${e.target.dataset.id}`, { method: 'DELETE' });
                    loadInventory();
                }
            });
        });
        
        // Setup botones editar
        document.querySelectorAll('.btn-edit-img').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const img = inventoryImages.find(i => i.id === e.target.dataset.id);
                if(img) openEditImageModal(img);
            });
        });
    };

    const updateCategorySelects = () => {
        if(!selectImgCategory) return;
        selectImgCategory.innerHTML = '<option value="">-- Sin Categoría --</option>';
        inventoryCategories.forEach(cat => {
            const opt = document.createElement('option');
            opt.value = cat.id;
            opt.textContent = `${cat.icon || ''} ${cat.name}`;
            selectImgCategory.appendChild(opt);
        });
    };

    // Creación de Categoría
    document.getElementById('btn-open-create-category')?.addEventListener('click', () => {
        formCategory.reset();
        document.getElementById('cat-id').value = '';
        openModal(modals.category);
    });

    formCategory?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('cat-id').value;
        const payload = {
            name: document.getElementById('cat-name').value,
            icon: document.getElementById('cat-icon').value
        };
        const method = id ? 'PUT' : 'POST';
        const url = id ? `/api/categories/${id}` : '/api/categories';
        
        await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        closeModal(modals.category);
        loadInventory();
    });

    // Subida y Creación de Asset
    const uploadFile = async (file) => {
        const formData = new FormData();
        formData.append('image', file);
        const res = await fetch('/api/upload', { method: 'POST', body: formData });
        const data = await res.json();
        return data.url;
    };

    document.getElementById('btn-open-create-image')?.addEventListener('click', () => {
        formImage.reset();
        document.getElementById('img-id').value = '';
        document.getElementById('img-face-preview').innerHTML = '<span>Sin Imagen</span>';
        document.getElementById('img-back-preview').innerHTML = '<span>Sin Dorso</span>';
        document.getElementById('img-face-url').value = '';
        document.getElementById('img-back-url').value = '';
        if(currentCategoryId) selectImgCategory.value = currentCategoryId;
        openModal(modals.image);
    });

    const openEditImageModal = (img) => {
        document.getElementById('img-id').value = img.id;
        document.getElementById('img-name').value = img.name;
        document.getElementById('img-width').value = img.size?.width || 150;
        document.getElementById('img-height').value = img.size?.height || 150;
        document.getElementById('img-rotation').value = img.rotation || 0;
        document.getElementById('img-opacity').value = img.opacity || 1.0;
        document.getElementById('img-category').value = img.categoryId || '';
        document.getElementById('img-face-url').value = img.faceUrl || '';
        document.getElementById('img-back-url').value = img.backfaceUrl || '';

        document.getElementById('img-face-preview').innerHTML = img.faceUrl ? `<img src="${img.faceUrl}" style="max-height:100%;">` : '<span>Sin Imagen</span>';
        document.getElementById('img-back-preview').innerHTML = img.backfaceUrl ? `<img src="${img.backfaceUrl}" style="max-height:100%;">` : '<span>Sin Dorso</span>';
        openModal(modals.image);
    };

    // Previews Locales
    document.getElementById('input-img-face')?.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if(file) {
            const reader = new FileReader();
            reader.onload = (e) => document.getElementById('img-face-preview').innerHTML = `<img src="${e.target.result}" style="max-height:100%;">`;
            reader.readAsDataURL(file);
        }
    });
    document.getElementById('input-img-back')?.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if(file) {
            const reader = new FileReader();
            reader.onload = (e) => document.getElementById('img-back-preview').innerHTML = `<img src="${e.target.result}" style="max-height:100%;">`;
            reader.readAsDataURL(file);
        }
    });

    formImage?.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        let faceUrl = document.getElementById('img-face-url').value;
        let backUrl = document.getElementById('img-back-url').value;
        
        const faceFile = document.getElementById('input-img-face').files[0];
        const backFile = document.getElementById('input-img-back').files[0];

        if(faceFile) faceUrl = await uploadFile(faceFile);
        if(backFile) backUrl = await uploadFile(backFile);

        const payload = {
            name: document.getElementById('img-name').value,
            categoryId: document.getElementById('img-category').value || null,
            faceUrl,
            backfaceUrl: backUrl,
            size: {
                width: Number(document.getElementById('img-width').value),
                height: Number(document.getElementById('img-height').value)
            },
            rotation: Number(document.getElementById('img-rotation').value),
            opacity: Number(document.getElementById('img-opacity').value)
        };

        const id = document.getElementById('img-id').value;
        const method = id ? 'PUT' : 'POST';
        const url = id ? `/api/images/${id}` : '/api/images';

        await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        closeModal(modals.image);
        loadInventory();
    });

    // Cargar inventario al inicio
    loadInventory();

    // --- LÓGICA DE PESTAÑAS DEL SIDEBAR (DOCK FLOTANTE) ---
    const sidebarTabs = document.querySelectorAll('.sidebar-tab');
    const sidebarPanes = document.querySelectorAll('.floating-tool-window');

    sidebarTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetPane = document.getElementById(tab.getAttribute('data-target'));
            if(!targetPane) return;
            
            // Toggle visibility
            if(targetPane.style.display === 'none' || targetPane.style.display === '') {
                if (targetPane.id === 'panel-dados' || targetPane.id === 'panel-inventory' || targetPane.id === 'panel-stats' || targetPane.id === 'panel-notes' || targetPane.id === 'panel-maps') {
                    targetPane.style.display = 'flex';
                } else {
                    targetPane.style.display = 'block';
                }
                tab.style.background = 'rgba(255,255,255,0.2)'; // Highlight icon
                targetPane.style.zIndex = highestZIndex++; // Bring to front
            } else {
                targetPane.style.display = 'none';
                tab.style.background = '';
            }
        });
    });

    // Cerrar ventanas con la "X"
    document.querySelectorAll('.btn-close-floating').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const windowEl = e.target.closest('.floating-tool-window');
            if(windowEl) {
                windowEl.style.display = 'none';
                // Reset tab color
                const tab = document.querySelector(`.sidebar-tab[data-target="${windowEl.id}"]`);
                if(tab) tab.style.background = '';
            }
        });
    });

    // --- LÓGICA PARA ARRASTRAR VENTANAS FLOTANTES ---
    document.querySelectorAll('.floating-tool-window .window-header').forEach(header => {
        header.addEventListener('pointerdown', (e) => {
            const windowEl = header.closest('.floating-tool-window');
            if(!windowEl) return;
            
            windowEl.style.zIndex = highestZIndex++;
            
            const rect = windowEl.getBoundingClientRect();
            let offsetX = e.clientX - rect.left;
            let offsetY = e.clientY - rect.top;
            
            header.setPointerCapture(e.pointerId);
            
            const onMove = (ev) => {
                windowEl.style.left = (ev.clientX - offsetX) + 'px';
                windowEl.style.top = (ev.clientY - offsetY) + 'px';
            };
            
            const onUp = (ev) => {
                header.releasePointerCapture(ev.pointerId);
                header.removeEventListener('pointermove', onMove);
                header.removeEventListener('pointerup', onUp);
            };
            
            header.addEventListener('pointermove', onMove);
            header.addEventListener('pointerup', onUp);
        });
    });

    // --- LÓGICA CHAT PLEGABLE ---
    const btnToggleChat = document.getElementById('btn-toggle-chat');
    const chatPanel = document.getElementById('chat-panel');
    let isChatOpen = false;
    
    if(btnToggleChat && chatPanel) {
        btnToggleChat.addEventListener('click', () => {
            isChatOpen = !isChatOpen;
            if(isChatOpen) {
                chatPanel.style.right = '0px';
                btnToggleChat.textContent = '❌';
            } else {
                chatPanel.style.right = '-320px';
                btnToggleChat.textContent = '💬';
            }
        });
    }

    // --- HERRAMIENTAS: DADOS Y RULETA ---
    document.querySelectorAll('.btn-dice').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const sides = parseInt(e.target.dataset.sides);
            const result = Math.floor(Math.random() * sides) + 1;
            
            const diceResultDiv = document.getElementById('dice-result');
            diceResultDiv.style.transform = 'scale(1.5)';
            diceResultDiv.textContent = '...';
            
            setTimeout(() => {
                diceResultDiv.style.transform = 'scale(1)';
                diceResultDiv.textContent = result;
                diceResultDiv.style.color = result === sides ? '#10b981' : (result === 1 ? '#ef4444' : 'var(--text-main)');
            }, 300);
        });
    });

    document.getElementById('btn-spin-roulette')?.addEventListener('click', () => {
        const input = document.getElementById('input-roulette').value;
        const resultDiv = document.getElementById('roulette-result');
        if(!input.trim()) {
            resultDiv.textContent = 'Añade opciones primero.';
            return;
        }
        const options = input.split(',').map(s => s.trim()).filter(s => s);
        if(options.length === 0) return;

        resultDiv.style.transform = 'scale(1.1)';
        resultDiv.textContent = 'Girando...';

        setTimeout(() => {
            const winner = options[Math.floor(Math.random() * options.length)];
            resultDiv.style.transform = 'scale(1)';
            resultDiv.textContent = '👉 ' + winner;
        }, 500);
    });

    // --- HERRAMIENTAS: STATS (GLOBAL) ---
    window.adjStat = (statName, delta) => {
        const input = document.getElementById(`stat-${statName}`);
        if(input) {
            let val = parseInt(input.value) || 0;
            input.value = val + delta;
        }
    };

    // --- PANTALLA DM ---
    document.getElementById('btn-open-dm-screen')?.addEventListener('click', () => {
        // Abre una nueva ventana simulando la segunda pantalla para el DM
        const dmWindow = window.open('', '_blank', 'width=800,height=600');
        dmWindow.document.write(`
            <html>
            <head>
                <title>Pantalla del DM Master</title>
                <style>
                    body { background: #0f172a; color: white; font-family: sans-serif; padding: 20px; }
                    h1 { color: #f59e0b; }
                    .panel { background: rgba(255,255,255,0.1); padding: 15px; border-radius: 8px; margin-bottom: 15px; }
                </style>
            </head>
            <body>
                <h1>👑 Modo DM Activado</h1>
                <p>Esta es tu segunda pantalla privada. En fases posteriores sincronizaremos los datos de los jugadores aquí.</p>
                <div class="panel">
                    <h3>Herramientas Privadas</h3>
                    <p>Aquí vendrán: Notas secretas, vida real de los monstruos, tiradas ocultas, etc.</p>
                </div>
            </body>
            </html>
        `);
    });

    // --- CARGAR INVENTARIO EN LA MESA ---
    const loadInventoryToGame = () => {
        const gameInvGrid = document.getElementById('game-inventory-grid');
        const gameCharGrid = document.getElementById('game-character-grid');
        const gameCatSelect = document.getElementById('game-category-select');

        // Poblar select de categorías en la mesa
        if(gameCatSelect) {
            gameCatSelect.innerHTML = '<option value="">-- Todas las Categorías --</option>';
            inventoryCategories.forEach(cat => {
                const opt = document.createElement('option');
                opt.value = cat.id;
                opt.textContent = cat.name;
                gameCatSelect.appendChild(opt);
            });

            gameCatSelect.addEventListener('change', (e) => {
                renderGameInventoryImages(e.target.value);
            });
        }

        const renderGameInventoryImages = (catId = '') => {
            if(!gameInvGrid) return;
            gameInvGrid.innerHTML = '';
            let filtered = inventoryImages;
            if(catId) filtered = inventoryImages.filter(i => i.categoryId === catId);

            if(filtered.length === 0) {
                gameInvGrid.innerHTML = '<span style="color:#64748b; font-size:0.8rem;">Vacio</span>';
                return;
            }

            filtered.forEach(img => {
                const div = document.createElement('div');
                div.style.background = 'rgba(0,0,0,0.5)';
                div.style.padding = '5px';
                div.style.borderRadius = '5px';
                div.style.cursor = 'grab'; // Para Drag & Drop (Fase 9)
                div.innerHTML = `
                    <div style="height:60px; display:flex; align-items:center; justify-content:center;">
                        ${img.faceUrl ? `<img src="${img.faceUrl}" style="max-height:100%; max-width:100%;">` : '📷'}
                    </div>
                    <div style="font-size:0.7rem; text-align:center; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${img.name}</div>
                `;
                div.addEventListener('click', () => {
                    if(typeof window.spawnPiece === 'function') {
                        window.spawnPiece(img.faceUrl, img.backUrl);
                    }
                });
                gameInvGrid.appendChild(div);
            });
        };

        if(gameCharGrid) {
            gameCharGrid.innerHTML = '';
            if(myCharacters.length === 0) {
                gameCharGrid.innerHTML = '<span style="color:#64748b; font-size:0.8rem;">Sin Personajes</span>';
            } else {
                myCharacters.forEach(char => {
                    const div = document.createElement('div');
                    div.style.background = 'rgba(0,0,0,0.5)';
                    div.style.padding = '5px';
                    div.style.borderRadius = '5px';
                    div.style.display = 'flex';
                    div.style.alignItems = 'center';
                    div.style.gap = '10px';
                    div.style.cursor = 'grab';
                    div.innerHTML = `
                        <div style="width:40px; height:40px; border-radius:50%; overflow:hidden; background:var(--panel-bg); display:flex; align-items:center; justify-content:center;">
                            ${char.imageUrl ? `<img src="${char.imageUrl}" style="width:100%; height:100%; object-fit:cover;">` : '👤'}
                        </div>
                        <div style="font-size:0.8rem;">${char.name}</div>
                    `;
                    div.addEventListener('click', () => {
                        if(typeof window.spawnPiece === 'function') {
                            // Los personajes no tienen reverso (backUrl) por ahora
                            window.spawnPiece(char.imageUrl, null);
                        }
                    });
                    gameCharGrid.appendChild(div);
                });
            }
        }

        renderGameInventoryImages();
    };

    // Llamar esto cuando se entra a la mesa (modificaremos enterGameRoom)
    const originalEnterGameRoom = enterGameRoom;
    enterGameRoom = (roomCode, roomName) => {
        originalEnterGameRoom(roomCode, roomName);
        
        loadInventoryToGame();

        // Aplicar permisos visuales según el Juego vinculado
        const game = myGames.find(g => g.id === window.currentLinkedGameId);
        
        // Reset (mostrar todo por defecto si no hay juego vinculado)
        document.getElementById('tab-tool-dice').style.display = 'block';
        document.getElementById('tab-tool-notes').style.display = 'block';
        document.getElementById('tab-tool-stats').style.display = 'block';
        document.getElementById('tab-tool-inventory').style.display = 'block';
        document.getElementById('container-tool-roulette').style.display = 'block';
        document.getElementById('btn-open-dm-screen').style.display = 'block'; // Asumimos que el creador es DM por ahora
        
        if(game) {
            const tools = game.tools || {};
            const perms = game.perms || {};

            document.getElementById('tab-tool-dice').style.display = tools.dice ? 'block' : 'none';
            document.getElementById('tab-tool-notes').style.display = tools.notes ? 'block' : 'none';
            document.getElementById('container-tool-roulette').style.display = tools.roulette ? 'block' : 'none';
            
            // Si no pueden editar stats y no hay HP/Mana visibles, ocultar la pestaña completa
            const canEditStats = perms.editStats !== false;
            document.getElementById('tab-tool-stats').style.display = (tools.hp || tools.mana || tools.stamina || tools.itemCounter) && canEditStats ? 'block' : 'none';
            
            document.getElementById('container-tool-hp').style.display = tools.hp ? 'block' : 'none';
            document.getElementById('container-tool-mana').style.display = tools.mana ? 'block' : 'none';
            document.getElementById('container-tool-stamina').style.display = tools.stamina ? 'block' : 'none';
            document.getElementById('container-tool-item-counter').style.display = tools.itemCounter ? 'block' : 'none';

            // Inventario
            const canSpawnAssets = perms.spawnAssets !== false;
            const canSpawnChars = perms.spawnChars !== false;
            document.getElementById('tab-tool-inventory').style.display = (canSpawnAssets || canSpawnChars || tools.inventory) ? 'block' : 'none';
            
            // Mapas
            document.getElementById('tab-tool-maps').style.display = perms.changeMap ? 'block' : 'none';
        }
    };

    // --- AQUÍ IRÁ LA LÓGICA DE SOCKET.IO Y DRAG&DROP EN LA FASE 9 ---
    
    // FASE 9: Motor Drag & Drop y Menú Contextual
    const boardLayer = document.getElementById('board-layer');
    const boardBackground = document.getElementById('board-background');
    const uploadBoard = document.getElementById('upload-board');
    const contextMenu = document.getElementById('piece-context-menu');
    
    let pieceIdCounter = 0;
    let activePiece = null;
    let dragOffsetX = 0;
    let dragOffsetY = 0;
    let currentContextPiece = null;
    let highestZIndex = 10; // Para que las piezas queden encima unas de otras

    // Cambiar fondo de la mesa
    if(uploadBoard) {
        uploadBoard.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if(file) {
                const reader = new FileReader();
                reader.onload = (ev) => {
                    boardBackground.src = ev.target.result;
                    boardBackground.style.display = 'block';
                };
                reader.readAsDataURL(file);
            }
        });
    }

    // SPAWN de Piezas
    window.spawnPiece = (faceUrl, backUrl) => {
        if(!boardLayer) return;
        if(!faceUrl) return; // Si es un item sin imagen

        const pieceId = 'piece-' + Date.now() + '-' + (pieceIdCounter++);
        const pieceDiv = document.createElement('div');
        pieceDiv.className = 'board-piece';
        pieceDiv.id = pieceId;
        
        // Guardar estado interno
        pieceDiv.dataset.faceUrl = faceUrl;
        pieceDiv.dataset.backUrl = backUrl || '';
        pieceDiv.dataset.isFlipped = 'false';
        pieceDiv.dataset.rotation = '0';
        
        // Posición inicial (centro del tablero aprox)
        const boardRect = boardLayer.getBoundingClientRect();
        pieceDiv.style.left = (boardRect.width / 2 - 40) + 'px';
        pieceDiv.style.top = (boardRect.height / 2 - 40) + 'px';
        pieceDiv.style.width = '80px';
        pieceDiv.style.height = '80px';
        pieceDiv.style.zIndex = highestZIndex++;
        
        const img = document.createElement('img');
        img.src = faceUrl;
        pieceDiv.appendChild(img);

        // Eventos de Arrastre
        pieceDiv.addEventListener('pointerdown', (e) => {
            if(e.button === 2) return; // Ignorar clic derecho para arrastre
            
            activePiece = pieceDiv;
            activePiece.classList.add('dragging');
            activePiece.style.zIndex = highestZIndex++; // Traer al frente
            
            const rect = activePiece.getBoundingClientRect();
            const boardRect = boardLayer.getBoundingClientRect();
            
            // Offset dentro de la pieza
            dragOffsetX = e.clientX - rect.left;
            dragOffsetY = e.clientY - rect.top;
            
            // Cerrar menú contextual si estaba abierto
            closeContextMenu();
            
            // Set pointer capture para no perder el tracking si el mouse sale rápido
            activePiece.setPointerCapture(e.pointerId);
        });

        // Evento Clic Derecho (Context Menu)
        pieceDiv.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            e.stopPropagation();
            openContextMenu(e.clientX, e.clientY, pieceDiv);
        });

        boardLayer.appendChild(pieceDiv);
    };

    // DRAG (Movimiento global)
    document.addEventListener('pointermove', (e) => {
        if(!activePiece) return;
        
        const boardRect = boardLayer.getBoundingClientRect();
        
        let newX = e.clientX - boardRect.left - dragOffsetX;
        let newY = e.clientY - boardRect.top - dragOffsetY;
        
        activePiece.style.left = newX + 'px';
        activePiece.style.top = newY + 'px';
    });

    // DROP (Soltar)
    document.addEventListener('pointerup', (e) => {
        if(activePiece) {
            activePiece.classList.remove('dragging');
            activePiece.releasePointerCapture(e.pointerId);
            activePiece = null;
        }
    });

    // --- MENÚ CONTEXTUAL ---
    const closeContextMenu = () => {
        if(contextMenu) contextMenu.style.display = 'none';
        currentContextPiece = null;
    };

    const openContextMenu = (x, y, piece) => {
        if(!contextMenu) return;
        currentContextPiece = piece;
        
        contextMenu.style.display = 'flex';
        contextMenu.style.left = x + 'px';
        contextMenu.style.top = y + 'px';
        
        // Mostrar u ocultar botón de voltear
        const btnFlip = document.getElementById('ctx-flip');
        if(btnFlip) {
            if(piece.dataset.backUrl) {
                btnFlip.style.display = 'block';
            } else {
                btnFlip.style.display = 'none';
            }
        }
    };

    // Cerrar menú al dar clic en otro lado
    document.addEventListener('click', (e) => {
        if(contextMenu && e.target !== contextMenu && !contextMenu.contains(e.target)) {
            closeContextMenu();
        }
    });

    // Acciones del menú
    document.getElementById('ctx-rotate-right')?.addEventListener('click', () => {
        if(!currentContextPiece) return;
        let rot = parseInt(currentContextPiece.dataset.rotation || '0') + 45;
        currentContextPiece.dataset.rotation = rot;
        currentContextPiece.style.transform = `rotate(${rot}deg)`;
        closeContextMenu();
    });

    document.getElementById('ctx-rotate-left')?.addEventListener('click', () => {
        if(!currentContextPiece) return;
        let rot = parseInt(currentContextPiece.dataset.rotation || '0') - 45;
        currentContextPiece.dataset.rotation = rot;
        currentContextPiece.style.transform = `rotate(${rot}deg)`;
        closeContextMenu();
    });

    document.getElementById('ctx-flip')?.addEventListener('click', () => {
        if(!currentContextPiece) return;
        const img = currentContextPiece.querySelector('img');
        const isFlipped = currentContextPiece.dataset.isFlipped === 'true';
        
        if(isFlipped) {
            img.src = currentContextPiece.dataset.faceUrl;
            currentContextPiece.dataset.isFlipped = 'false';
        } else {
            img.src = currentContextPiece.dataset.backUrl;
            currentContextPiece.dataset.isFlipped = 'true';
        }
        closeContextMenu();
    });

    document.getElementById('ctx-delete')?.addEventListener('click', () => {
        if(!currentContextPiece) return;
        currentContextPiece.remove();
        closeContextMenu();
    });

});
