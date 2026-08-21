const storage = {
    get: (key) => JSON.parse(localStorage.getItem(key) || '[]'),
    set: (key, data) => localStorage.setItem(key, JSON.stringify(data))
};

export const initDB = async () => {
    if (!localStorage.getItem('characterCounter')) {
        const chars = storage.get('characters');
        const maxId = chars.reduce((max, c) => Math.max(max, c.id || 0), 0);
        const startFrom = Math.max(maxId + 1, 1);
        localStorage.setItem('characterCounter', JSON.stringify(startFrom));
        console.log('✅ characterCounter initialized at:', startFrom);
    }

    let tasks = storage.get('tasks');
    if (tasks.length === 0) {
        const defaultTasks = [
            { id: 1, title: 'Battle Pass Daily', reset: 'daily', bound: 'account', icon: 'battlepass.png' },
            { id: 2, title: 'Serpentium Daily', reset: 'daily', bound: 'account', icon: 'serpdaily.png' },
            { id: 3, title: 'Heroic Dungeon', reset: 'daily', bound: 'character', icon: 'heroic.png' },
            { id: 4, title: 'Aqua Whistle', reset: 'daily', bound: 'character', icon: 'aquawhistle.png' },
            { id: 5, title: 'ED Weekly Mission', reset: 'weekly', bound: 'account', icon: 'ed.webp' },
            { id: 6, title: 'Battle Pass Weekly', reset: 'weekly', bound: 'account', icon: 'battlepass.png' },
            { id: 7, title: 'Enhancement Quest', reset: 'weekly', bound: 'account', icon: 'enhancement.png' },
            { id: 8, title: 'Secret Dungeon', reset: 'weekly', bound: 'account', icon: 'secretdungeon.png' },
            { id: 9, title: 'Blacksmith Craft', reset: 'weekly', bound: 'account', icon: 'blacksmith.png' },
            { id: 10, title: 'Dragon Lens Craft', reset: 'weekly', bound: 'account', icon: 'lenscraft.png' },
            { id: 11, title: 'Serpentium Weekly', reset: 'weekly', bound: 'account', icon: 'serpweekly.png' },
            { id: 12, title: 'Henir', reset: 'weekly', bound: 'character', icon: 'henir.png' },
            { id: 13, title: 'Abyss', reset: 'weekly', bound: 'character', icon: 'abyss.png' },
            { id: 14, title: 'Serpentium', reset: 'weekly', bound: 'character', icon: 'serpentiumraid.png' },
            { id: 15, title: 'Doom Aporia', reset: 'weekly', bound: 'character', icon: 'doom.png' },
            { id: 16, title: 'Challenge Mode', reset: 'weekly', bound: 'character', icon: '' },
            { id: 17, title: "x10 Spirit Lord's Temple", reset: 'weekly', bound: 'character', icon: 'atma.png' },
            { id: 18, title: 'Mirror Del', reset: 'weekly', bound: 'character', icon: 'mirrordel.png' },
            { id: 19, title: 'Devil of Chaos', reset: 'weekly', bound: 'character', icon: 'devilofchaos.png' },
            { id: 20, title: 'High Entropy', reset: 'weekly', bound: 'character', icon: 'highentropy.png' }
        ];
        storage.set('tasks', defaultTasks);
    }

    const chars = storage.get('characters');
    if (!chars.some(c => c.id === 0)) {
        chars.unshift({ id: 0, name: 'Account', class: 'None', color: '#ffffff' });
        storage.set('characters', chars);
    }

    const checklist = storage.get('checklist');
    const accountTasks = tasks.filter(t => t.bound === 'account');
    for (const task of accountTasks) {
        if (!checklist.some(c => c.character_id === 0 && c.task_id === task.id)) {
            checklist.push({ id: Date.now(), character_id: 0, task_id: task.id, completed: 0, enabled: 1 });
        }
    }
    storage.set('checklist', checklist);
};

export const getTasks = async () => storage.get('tasks');
export const getCharacters = async () => storage.get('characters').filter(c => c.id !== 0);
export const getChecklist = async () => storage.get('checklist');

export const getClasses = async () => {
    return [
        '01-KE', '02-RM', '03-IM', '04-GS', '05-AeS',
        '06-OZ', '07-MtM', '08-LA', '09-AN', '10-DaB',
        '11-TW', '12-PR', '13-FB', '14-RH', '15-NI',
        '16-RV', '17-CU', '18-CE', '19-CS', '20-CA',
        '21-CC', '22-FP', '23-CeT', '24-DA', '25-ApS',
        '26-Devi', '27-ShK', '28-SU', '29-ES', '30-FL',
        '31-BQ', '32-AD', '33-DB', '34-DoM', '35-MPx',
        '36-OM', '37-CaT', '38-IN', '39-DiA', '40-DeM',
        '41-TB', '42-BM', '43-MN', '44-PO', '45-RT',
        '46-BL', '47-HR', '48-OP', '49-EtW', '50-RaS',
        '51-NL', '52-TP', '53-LB', '54-CL', '55-NP',
        '56-MO', '57-GB', '58-AV', '59-AC', '60-MC'
    ];
};

export const getCurrentWeek = async () => {
    const now = new Date();
    const wednesdayReset = new Date(now);
    const day = wednesdayReset.getUTCDay();
    const diff = (day >= 3) ? day - 3 : day + 4;
    wednesdayReset.setUTCDate(wednesdayReset.getUTCDate() - diff);
    wednesdayReset.setUTCHours(12, 0, 0, 0);
    const getWeekNumber = (date) => {
        const firstDayYear = new Date(date.getFullYear(), 0, 1);
        const pastDaysYear = (date - firstDayYear) / 86400000;
        return Math.ceil((pastDaysYear + firstDayYear.getDay() + 1) / 7);
    };
    const currentWeek = now >= wednesdayReset ? getWeekNumber(now) : getWeekNumber(now) - 1;
    return currentWeek % 2 === 1 ? 'Berthe' : 'Rosso';
};

export const getChallengeData = async () => {
    return JSON.parse(localStorage.getItem('challengeData') || '{"characters":{}}');
};

export const getPity = async (characterId, taskId) => {
    const pity = JSON.parse(localStorage.getItem('pity') || '{}');
    const key = `${characterId}-${taskId}`;
    return pity[key] !== undefined ? { percent: pity[key] } : null;
};

export const loadNotes = async () => {
    return localStorage.getItem('notes') || '';
};

export const updateChecklist = async (characterId, taskId, completed) => {
    const checklist = storage.get('checklist');
    const updated = checklist.map(row =>
        row.character_id === characterId && row.task_id === taskId
            ? { ...row, completed }
            : row
    );
    storage.set('checklist', updated);
};

export const toggleTaskEnabled = async (characterId, taskId, enabled) => {
    const checklist = storage.get('checklist');
    const updated = checklist.map(row =>
        row.character_id === characterId && row.task_id === taskId
            ? { ...row, enabled }
            : row
    );
    storage.set('checklist', updated);
};

const getNextId = () => {
    const counter = JSON.parse(localStorage.getItem('characterCounter') || '1');
    const newId = counter;
    localStorage.setItem('characterCounter', JSON.stringify(counter + 1));
    return newId;
};

export const addCharacter = async (charName, charClass, color) => {
    const chars = storage.get('characters');
    // const maxId = chars.reduce((max, c) => Math.max(max, c.id || 0), 0);
    const newId = getNextId();
    chars.push({ id: newId, name: charName, class: charClass, color: color || '#8b5cf6' });
    storage.set('characters', chars);

    const tasks = storage.get('tasks');
    const charTasks = tasks.filter(t => t.bound === 'character');
    const checklist = storage.get('checklist');
    for (const task of charTasks) {
        checklist.push({ id: Date.now() + task.id, character_id: newId, task_id: task.id, completed: 0, enabled: 1 });
    }
    storage.set('checklist', checklist);
};

export const editCharacter = async (characterId, charName, charClass, color) => {
    const chars = storage.get('characters');
    const updated = chars.map(c =>
        c.id === characterId ? { ...c, name: charName, class: charClass, color: color || c.color } : c
    );
    storage.set('characters', updated);
};

export const deleteCharacter = async (characterId) => {
    const chars = storage.get('characters').filter(c => c.id !== characterId);
    storage.set('characters', chars);
    const checklist = storage.get('checklist').filter(c => c.character_id !== characterId);
    storage.set('checklist', checklist);
};

export const addTask = async (icon, title, reset, bound) => {
    const tasks = storage.get('tasks');
    const maxId = tasks.reduce((max, t) => Math.max(max, t.id || 0), 0);
    tasks.push({ id: maxId + 1, title, reset, bound, icon: icon || null, system: 0 });
    storage.set('tasks', tasks);
};

export const deleteTask = async (taskId) => {
    const tasks = storage.get('tasks').filter(t => t.id !== taskId);
    storage.set('tasks', tasks);
    const checklist = storage.get('checklist').filter(c => c.task_id !== taskId);
    storage.set('checklist', checklist);
};

export const addRun = async (characterId, taskId, type) => {
    const pity = JSON.parse(localStorage.getItem('pity') || '{}');
    const key = `${characterId}-${taskId}`;
    const rate = type === 'serpentium' ? 12.5 : 11.12;
    const current = pity[key] || 0;
    pity[key] = Math.min(100, current + rate);
    let newPercent = current + rate;
    
    if (newPercent >= 100) {
        newPercent = 0;
    }

    pity[key] = newPercent;
    localStorage.setItem('pity', JSON.stringify(pity));
};

export const removeRun = async (characterId, taskId, type) => {
    const pity = JSON.parse(localStorage.getItem('pity') || '{}');
    const key = `${characterId}-${taskId}`;
    const rate = type === 'serpentium' ? 12.5 : 11.12;
    pity[key] = Math.max(0, (pity[key] || 0) - rate);
    localStorage.setItem('pity', JSON.stringify(pity));
};

export const setPercent = async (characterId, taskId, percent) => {
    const pity = JSON.parse(localStorage.getItem('pity') || '{}');
    const key = `${characterId}-${taskId}`;
    pity[key] = Math.min(100, Math.max(0, percent));
    localStorage.setItem('pity', JSON.stringify(pity));
};

export const saveNotes = async (content) => {
    localStorage.setItem('notes', content);
};

export const updateAura = async (characterId, dungeon, amount) => {
    const data = JSON.parse(localStorage.getItem('challengeData') || '{"characters":{}}');
    if (!data.characters[characterId]) {
        data.characters[characterId] = { rossoAura: 0, bertheAura: 0, resetTicketUsed: 0 };
    }

    if (dungeon === 'Rosso') {
        data.characters[characterId].rossoAura += amount;
    } else {
        data.characters[characterId].bertheAura += amount;
    }
    
    localStorage.setItem('challengeData', JSON.stringify(data));
    return data.characters[characterId];
};

export const setAura = async (characterId, dungeon, amount) => {
    const data = JSON.parse(localStorage.getItem('challengeData') || '{"characters":{}}');
    if (!data.characters[characterId]) {
        data.characters[characterId] = { rossoAura: 0, bertheAura: 0, resetTicketUsed: 0 };
    }
    if (dungeon === 'Rosso') {
        data.characters[characterId].rossoAura = amount;
    } else {
        data.characters[characterId].bertheAura = amount;
    }
    localStorage.setItem('challengeData', JSON.stringify(data));
    return data.characters[characterId];
};

export const resetAura = async (characterId, dungeon) => {
    const data = JSON.parse(localStorage.getItem('challengeData') || '{"characters":{}}');
    if (!data.characters[characterId]) return null;
    if (dungeon === 'Rosso') {
        data.characters[characterId].rossoAura = 0;
    } else {
        data.characters[characterId].bertheAura = 0;
    }
    localStorage.setItem('challengeData', JSON.stringify(data));
    return data.characters[characterId];
};

export const useResetTicket = async (characterId) => {
    const data = JSON.parse(localStorage.getItem('challengeData') || '{"characters":{}}');
    if (!data.characters[characterId]) {
        data.characters[characterId] = { rossoAura: 0, bertheAura: 0, resetTicketUsed: 0 };
    }

    if (data.characters[characterId].resetTicketUsed >= 2) {
        return { error: 'Already used 2 tickets this week' };
    }

    data.characters[characterId].resetTicketUsed = (data.characters[characterId].resetTicketUsed || 0) + 1;
    localStorage.setItem('challengeData', JSON.stringify(data));
    return data.characters[characterId];
};

export const selectIcon = async () => null;
export const getIconPath = async () => null;
export const sendDiscordMsg = async () => {};