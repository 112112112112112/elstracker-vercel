console.log('=== PRELOAD IS RUNNING ===');
const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('db', {
    getCharacters: () => ipcRenderer.invoke('get-characters'),
    getTasks: () => ipcRenderer.invoke('get-tasks'),
    getChecklist: () => ipcRenderer.invoke('get-checklist'),
    getClasses: () => ipcRenderer.invoke('get-classes'),

    getCurrentWeek: () => ipcRenderer.invoke('get-current-week'),
    getChallengeData: () => ipcRenderer.invoke('get-challenge-data'),
    useResetTicket: (characterId) => ipcRenderer.invoke('use-reset-ticket', characterId),

    getPity: (characterId, taskId) => ipcRenderer.invoke('get-pity', characterId, taskId),
    addRun: (characterId, taskId) => ipcRenderer.invoke('add-run', characterId, taskId),
    removeRun: (characterId, taskId) => ipcRenderer.invoke('remove-run', characterId, taskId),
    setPercent: (characterId, taskId, percent) => ipcRenderer.invoke('set-percent', characterId, taskId, percent),

    saveNotes: (content) => ipcRenderer.invoke('save-notes', content),
    loadNotes: () => ipcRenderer.invoke('load-notes'),

    updateAura: (characterId, dungeon, amount) =>
        ipcRenderer.invoke('update-aura', characterId, dungeon, amount),

    setAura: (characterId, dungeon, amount) =>
        ipcRenderer.invoke('set-aura', characterId, dungeon, amount),

    resetAura: (characterId, dungeon) => 
        ipcRenderer.invoke('reset-aura', characterId, dungeon),

    updateChecklist: (characterId, taskId, completed) =>
        ipcRenderer.invoke('update-checklist', characterId, taskId, completed),

    toggleTaskEnabled: (characterId, taskId, enabled) =>
        ipcRenderer.invoke('toggle-task-enabled', characterId, taskId, enabled),
    
    addCharacter: (charName, charClass, color) =>
        ipcRenderer.invoke('add-character', charName, charClass, color),

    addTask: (icon, title, reset, bound) =>
        ipcRenderer.invoke('add-task', icon, title, reset, bound),

    selectIcon: () => ipcRenderer.invoke('select-icon'),
    getIconPath: (fileName) => ipcRenderer.invoke('get-icon-path', fileName),

    editCharacter: (characterId, charName, charClass, color) =>
        ipcRenderer.invoke('edit-character', characterId, charName, charClass, color),

    deleteCharacter: (characterId) =>
        ipcRenderer.invoke('delete-character', characterId),

    deleteTask: (taskId) =>
        ipcRenderer.invoke('delete-task', taskId),

    sendDiscordMsg: (message) =>
        ipcRenderer.invoke('send-discord-msg', message),
})