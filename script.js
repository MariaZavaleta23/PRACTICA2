// Gestor de Notas Rápidas - JavaScript
class NotesManager {
    constructor() {
        this.notes = this.loadNotesFromStorage();
        this.initializeElements();
        this.bindEvents();
        this.renderNotes();
    }

    // Inicializar elementos del DOM
    initializeElements() {
        this.noteForm = document.getElementById('noteForm');
        this.notesList = document.getElementById('notesList');
        this.emptyState = document.getElementById('emptyState');
        this.notesCount = document.getElementById('notesCount');
        this.clearAllBtn = document.getElementById('clearAllBtn');
    }

    // Vincular eventos
    bindEvents() {
        this.noteForm.addEventListener('submit', (e) => this.handleAddNote(e));
        this.clearAllBtn.addEventListener('click', () => this.clearAllNotes());
    }

    // Manejar el envío del formulario
    handleAddNote(event) {
        event.preventDefault();
        
        const formData = new FormData(this.noteForm);
        const noteData = {
            id: this.generateId(),
            title: formData.get('noteTitle').trim(),
            content: formData.get('noteContent').trim(),
            priority: formData.get('notePriority'),
            createdAt: new Date().toISOString()
        };

        // Validar datos
        if (!noteData.title || !noteData.content) {
            this.showNotification('Por favor, completa todos los campos', 'error');
            return;
        }

        // Agregar nota
        this.addNote(noteData);
        
        // Limpiar formulario
        this.noteForm.reset();
        
        // Mostrar notificación
        this.showNotification('Nota agregada exitosamente', 'success');
    }

    // Agregar nueva nota
    addNote(noteData) {
        this.notes.unshift(noteData); // Agregar al inicio
        this.saveNotesToStorage();
        this.renderNotes();
    }

    // Eliminar nota
    deleteNote(noteId) {
        if (confirm('¿Estás seguro de que quieres eliminar esta nota?')) {
            this.notes = this.notes.filter(note => note.id !== noteId);
            this.saveNotesToStorage();
            this.renderNotes();
            this.showNotification('Nota eliminada', 'info');
        }
    }

    // Limpiar todas las notas
    clearAllNotes() {
        if (this.notes.length === 0) {
            this.showNotification('No hay notas para eliminar', 'info');
            return;
        }

        if (confirm('¿Estás seguro de que quieres eliminar TODAS las notas? Esta acción no se puede deshacer.')) {
            this.notes = [];
            this.saveNotesToStorage();
            this.renderNotes();
            this.showNotification('Todas las notas han sido eliminadas', 'info');
        }
    }

    // Renderizar notas en el DOM
    renderNotes() {
        this.notesList.innerHTML = '';
        
        if (this.notes.length === 0) {
            this.emptyState.classList.add('show');
            this.notesCount.textContent = '0 notas';
            return;
        }

        this.emptyState.classList.remove('show');
        this.notesCount.textContent = `${this.notes.length} ${this.notes.length === 1 ? 'nota' : 'notas'}`;

        this.notes.forEach(note => {
            const noteElement = this.createNoteElement(note);
            this.notesList.appendChild(noteElement);
        });
    }

    // Crear elemento HTML para una nota
    createNoteElement(note) {
        const li = document.createElement('li');
        li.className = `note-item ${note.priority}-priority`;
        
        const formattedDate = this.formatDate(note.createdAt);
        
        li.innerHTML = `
            <div class="note-header">
                <h3 class="note-title">${this.escapeHtml(note.title)}</h3>
                <span class="note-priority ${note.priority}">${this.getPriorityText(note.priority)}</span>
            </div>
            <div class="note-content">${this.escapeHtml(note.content).replace(/\n/g, '<br>')}</div>
            <div class="note-actions">
                <small style="color: #718096; margin-right: auto;">Creada: ${formattedDate}</small>
                <button class="btn-delete" onclick="notesManager.deleteNote('${note.id}')">
                    🗑️ Eliminar
                </button>
            </div>
        `;

        return li;
    }

    // Obtener texto de prioridad
    getPriorityText(priority) {
        const priorities = {
            'high': 'Alta',
            'medium': 'Media',
            'low': 'Baja'
        };
        return priorities[priority] || 'Media';
    }

    // Formatear fecha
    formatDate(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
            return 'Hoy';
        } else if (diffDays === 2) {
            return 'Ayer';
        } else if (diffDays <= 7) {
            return `Hace ${diffDays - 1} días`;
        } else {
            return date.toLocaleDateString('es-ES', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });
        }
    }

    // Escapar HTML para prevenir XSS
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Generar ID único
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    // Mostrar notificación
    showNotification(message, type = 'info') {
        // Crear elemento de notificación
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        // Estilos de la notificación
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '15px 20px',
            borderRadius: '8px',
            color: 'white',
            fontWeight: '600',
            zIndex: '1000',
            transform: 'translateX(100%)',
            transition: 'transform 0.3s ease',
            maxWidth: '300px',
            wordWrap: 'break-word'
        });

        // Colores según el tipo
        const colors = {
            'success': '#38a169',
            'error': '#e53e3e',
            'info': '#3182ce',
            'warning': '#ed8936'
        };
        notification.style.backgroundColor = colors[type] || colors.info;

        // Agregar al DOM
        document.body.appendChild(notification);

        // Animar entrada
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);

        // Remover después de 3 segundos
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    // Guardar notas en localStorage
    saveNotesToStorage() {
        try {
            localStorage.setItem('quickNotes', JSON.stringify(this.notes));
        } catch (error) {
            console.error('Error al guardar notas:', error);
            this.showNotification('Error al guardar las notas', 'error');
        }
    }

    // Cargar notas desde localStorage
    loadNotesFromStorage() {
        try {
            const stored = localStorage.getItem('quickNotes');
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('Error al cargar notas:', error);
            return [];
        }
    }

    // Método para exportar notas (bonus)
    exportNotes() {
        if (this.notes.length === 0) {
            this.showNotification('No hay notas para exportar', 'info');
            return;
        }

        const dataStr = JSON.stringify(this.notes, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `notas-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        this.showNotification('Notas exportadas exitosamente', 'success');
    }

    // Método para importar notas (bonus)
    importNotes(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const importedNotes = JSON.parse(e.target.result);
                if (Array.isArray(importedNotes)) {
                    this.notes = [...this.notes, ...importedNotes];
                    this.saveNotesToStorage();
                    this.renderNotes();
                    this.showNotification(`${importedNotes.length} notas importadas`, 'success');
                } else {
                    throw new Error('Formato de archivo inválido');
                }
            } catch (error) {
                this.showNotification('Error al importar notas: formato inválido', 'error');
            }
        };
        reader.readAsText(file);
    }
}

// Inicializar la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.notesManager = new NotesManager();
    
    // Agregar funcionalidades adicionales
    addKeyboardShortcuts();
    addDragAndDrop();
});

// Atajos de teclado
function addKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        // Ctrl/Cmd + Enter para agregar nota
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            const form = document.getElementById('noteForm');
            if (form) {
                form.dispatchEvent(new Event('submit'));
            }
        }
        
        // Escape para limpiar formulario
        if (e.key === 'Escape') {
            const form = document.getElementById('noteForm');
            if (form) {
                form.reset();
                form.querySelector('input').focus();
            }
        }
    });
}

// Funcionalidad de arrastrar y soltar (bonus)
function addDragAndDrop() {
    const notesList = document.getElementById('notesList');
    
    if (notesList) {
        notesList.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
        });
        
        notesList.addEventListener('drop', (e) => {
            e.preventDefault();
            // Aquí se podría implementar reordenamiento de notas
        });
    }
}

// Funciones globales para uso desde HTML
function clearAllNotes() {
    if (window.notesManager) {
        window.notesManager.clearAllNotes();
    }
}

function deleteNote(noteId) {
    if (window.notesManager) {
        window.notesManager.deleteNote(noteId);
    }
}

// Funciones de utilidad adicionales
function searchNotes(query) {
    if (!window.notesManager) return;
    
    const filteredNotes = window.notesManager.notes.filter(note => 
        note.title.toLowerCase().includes(query.toLowerCase()) ||
        note.content.toLowerCase().includes(query.toLowerCase())
    );
    
    // Aquí se podría implementar un filtro visual
    console.log('Notas encontradas:', filteredNotes);
}

// Función para cambiar tema (bonus)
function toggleTheme() {
    document.body.classList.toggle('dark-theme');
    const isDark = document.body.classList.contains('dark-theme');
    localStorage.setItem('darkTheme', isDark);
}

// Cargar tema guardado
document.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('darkTheme');
    if (savedTheme === 'true') {
        document.body.classList.add('dark-theme');
    }
});
