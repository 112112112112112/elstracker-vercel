require('dotenv').config();
const BOT_TOKEN = process.env.BOT_TOKEN;
const { app, BrowserWindow, ipcMain, dialog, Notification } = require('electron/main');
const { autoUpdater } = require('electron-updater');
const path = require('path');
const fs = require('fs');
const db = require('./database.js');
const crypto = require('crypto');
const tasks = require('./tasks.js');
const axios = require('axios');
let server = null;

const ICONS_DIR = path.join(app.getPath('userData'), 'img', 'tasks');
fs.mkdirSync(ICONS_DIR, { recursive: true });

function startServer() {
    const express = require('express');
    const expressApp = express();
    const outPath = path.join(__dirname, 'out');
    const userDataPath = app.getPath('userData');
    const iconsDir = path.join(userDataPath, 'img', 'tasks');
    
    expressApp.use(express.static(outPath));
    expressApp.use('/img/tasks', express.static(iconsDir));
    
    expressApp.use((req, res) => {
        res.sendFile(path.join(outPath, 'index.html'));
    });
    
    server = expressApp.listen(3001, () => {
        console.log('App listening on port 3001 http://localhost:3001');
    });
}

// * Daily and weekly resets -------------------------------------------------------------------*

const resetPath = app.isPackaged ? path.join(app.getPath('userData'), 'reset.json') : path.join(__dirname, 'reset.json');

function getResetData() {
  try {
    const data = fs.readFileSync(resetPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return {lastDailyReset: null, lastWeeklyReset: null};
  }
}

function saveReset(data) {
  fs.writeFileSync(resetPath, JSON.stringify(data, null, 2));
}

function tasksReset() {
  const now = new Date();
  const resetData = getResetData();
  const lastDaily = resetData.lastDailyReset ? new Date(resetData.lastDailyReset) : null;
  let needsReset = false;

  const dailyResetTime = new Date(now);
  dailyResetTime.setUTCHours(0, 0, 0, 0);

  if (now >= dailyResetTime) {
    if (!lastDaily || lastDaily < dailyResetTime) {
      db.prepare(`UPDATE checklist SET completed = 0 WHERE task_id IN (SELECT id FROM tasks WHERE reset = 'daily')`).run();
      resetData.lastDailyReset = now.toISOString();
      needsReset = true;
    }
  }

  console.log('Current UTC:', now.toISOString());
  console.log('Reset time:', dailyResetTime.toISOString());
  console.log('Should reset?', now >= dailyResetTime);

  const day = now.getUTCDay();
  const lastWeeklyReset = resetData.lastWeeklyReset ? new Date(resetData.lastWeeklyReset) : null;
  const currentWednesday = new Date(now);
  currentWednesday.setUTCHours(0, 0, 0, 0);
  const daysBackWednesday = (day - 3 + 7) % 7; 
  currentWednesday.setUTCDate(now.getUTCDate() - daysBackWednesday);

  if (!lastWeeklyReset || lastWeeklyReset < currentWednesday) {
    db.prepare(`UPDATE checklist SET completed = 0 WHERE task_id IN (SELECT id FROM tasks WHERE reset = 'weekly')`).run();

    const challengeData = getChallengeData();

    for (const id in challengeData.characters) {
      challengeData.characters[id].resetTicketUsed = 0;
    }

    saveChallengeData(challengeData);
    resetData.lastWeeklyReset = currentWednesday.toISOString();
    needsReset = true;
  }

  if (needsReset) {
    saveReset(resetData);

    if (resetData.lastDailyReset || resetData.lastWeeklyReset) {
      new Notification({
        title: 'ElsTracker',
        body: 'Your tasks have been reset!',
        icon: path.join(__dirname, 'build', 'icon.png')
      }).show();
    }
  }
}

// * Challenge Aura Calculator -------------------------------------------------------------------*

const challengePath = app.isPackaged ? path.join(app.getPath('userData'), 'challengeData.json') : path.join(__dirname, 'challengeData.json');

function getChallengeData() {
  try {
    const data = fs.readFileSync(challengePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return {characters: {}};
  }
}

function saveChallengeData(data) {
  fs.writeFileSync(challengePath, JSON.stringify(data, null, 2));
}

function getCurrentWeek() {
  const now = new Date();
  const startDate = new Date('2026-07-01T00:00:00Z'); // * starting on July 1, it's Rosso week, then alternate Berthe->Rosso->Berthe etc... every reset
  const daysSinceStart = (now - startDate) / (1000 * 60 * 60 * 24);
  const weeksSinceStart = Math.floor(daysSinceStart / 7);

  return weeksSinceStart % 2 === 0 ? 'Rosso' : 'Berthe';
}

// * Notepad stuff -------------------------------------------------------------------*

const notesPath = app.isPackaged ? path.join(app.getPath('userData'), 'notepad.txt') : path.join(__dirname, 'notepad.txt');

ipcMain.handle('save-notes', (event, content) => {
  fs.writeFileSync(notesPath, content, 'utf8');
  return {success: true};
});

ipcMain.handle('load-notes', () => {
  try { 
    return fs.readFileSync(notesPath, 'utf8');
  } catch (error) {
    return '';
  }
})

// * ----------------------------------------------------------------------------------*

const createWindow = () => {
  // const preloadPath = app.isPackaged ? path.join(__dirname, 'app.asar', 'out', 'preload.js') : path.join(__dirname, 'out', 'preload.js');
  const preloadPath = path.join(__dirname, 'preload.js');
  const win = new BrowserWindow({
    width: 1300,
    height: 800,
    minWidth: 1100,
    title: `ElsTracker ${app.getVersion()}`,
    webPreferences: {
      preload: preloadPath,
      contextIsolation: true,
      nodeIntegration: false,
      webSecurity: false,
      allowFileAccess: true,
      sandbox: false,
    },
  });

  win.webContents.on('preload-error', (event, preloadPath, error) => {
    console.error('PRELOAD FAILED!!!!!!!!!!', preloadPath, error);
  });

  if (!app.isPackaged) {
    setTimeout(() => {
      win.loadURL('http://localhost:3000');
    }, 2000);
    require('electron-reload')(__dirname, {
      electron: path.join(__dirname, 'node_modules', '.bin', 'electron'),
      ignored: /node_modules|\.git|elstracker.db|\.next|out|dist/,
      watch: ['pages', 'components', 'styles'],
      hardResetMethod: 'exit'
    })
  } else {
    startServer();
    setTimeout(() => {
      win.loadURL('http://localhost:3001');
      // win.loadFile(path.join(__dirname, 'out', 'index.html'));
    }, 2000);
  }

  win.once('ready-to-show', () => {
    win.show();
  });

  win.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    console.log('failed to load!!!!!!!', errorCode, errorDescription);
  });

  win.webContents.on('did-finish-load', () => {
    console.log('✅ Window loaded');
    win.webContents.executeJavaScript('console.log("window.db:", window.db)');
  });
}

autoUpdater.on('update-available', () => {
  console.log('An update is available. Downloading...');
});

autoUpdater.on('update-downloaded', () => {
  console.log('An update has been downloaded. Restarting...');
  autoUpdater.quitAndInstall();
});

autoUpdater.on('error', (error) => {
  console.error('Error when updating: ', error);
});

// * Database stuff -------------------------------------------------------------------*

function syncTasks() {
    const allTasks = db.prepare('SELECT id, bound FROM tasks').all();
    const characters = db.prepare('SELECT id FROM characters').all();

    allTasks.forEach(task => {
      const rows = task.bound === 'account' ? [{id: 0}] : characters;
      rows.forEach(row => {

        if (row.id !== 0) {
          const charExists = db.prepare('SELECT COUNT(*) as count FROM characters WHERE id = ?').get(row.id);
          if (charExists.count === 0) {
            return;
          }
        }
        const exists = db.prepare('SELECT COUNT(*) as count FROM checklist WHERE character_id = ? AND task_id = ?').get(row.id, task.id);


        // * sync account tasks (inserts missing tasks)
        if (exists.count === 0) {

          db.prepare('INSERT INTO checklist (character_id, task_id, completed, enabled) VALUES (?, ?, ?, ?)').run(row.id, task.id, 0, 1);
        } 
      })
    })
}

ipcMain.handle('get-characters', () => {
    return db.prepare('SELECT * FROM characters WHERE id != 0').all();
});

ipcMain.handle('get-tasks', () => {
    return db.prepare('SELECT * FROM tasks').all();
});

ipcMain.handle('get-checklist', () => {
    return db.prepare('SELECT * FROM checklist').all();
});

ipcMain.handle('get-current-week', () => {
  return getCurrentWeek();
});

ipcMain.handle('get-challenge-data', () => {
  return getChallengeData();
});

ipcMain.handle('get-pity', (event, characterId, taskId) => {
  const row = db.prepare('SELECT percent FROM pity WHERE character_id = ? AND task_id = ?').get(characterId, taskId);
  return row?.percent || 0;
})

ipcMain.handle('get-classes', () => {
    // ? get classes icons from classes folder
    const classDir = path.join(__dirname, 'public', 'img', 'classes');
    try {
        const files = fs.readdirSync(classDir);
        return files
            .filter(file => file.endsWith('.png'))
            .map(file => file.replace('.png', ''))
            .sort();
    } catch (error) {
        console.error('Error reading class images:', error);
        return [];
    }
});

ipcMain.handle('update-checklist', (event, characterId, taskId, completed) => {
    return db.prepare(`UPDATE checklist SET completed = ? WHERE character_id = ? AND task_id = ?`).run(completed, characterId, taskId);
});

ipcMain.handle('update-aura', (event, characterId, dungeon, amount) => {
  const data = getChallengeData();

  if (!data.characters[characterId]) {
    data.characters[characterId] = {rossoAura: 0, bertheAura: 0, resetTicketUsed: 0};
  }

  if (dungeon === 'Rosso') {
    data.characters[characterId].rossoAura += amount;
  } else {
    data.characters[characterId].bertheAura += amount;
  }

  saveChallengeData(data);

  const task = db.prepare('SELECT id FROM tasks WHERE title = ?').get('Challenge Mode');
  
  if (task) {
    db.prepare('UPDATE checklist SET completed = 1 WHERE character_id = ? AND task_id = ?').run(characterId, task.id);
  }

  return data.characters[characterId];
});

ipcMain.handle('set-aura', (event, characterId, dungeon, amount) => {
  const data = getChallengeData();

  if (!data.characters[characterId]) {
    data.characters[characterId] = {rossoAura: 0, bertheAura: 0, resetTicketUsed: 0};
  }

  if (dungeon === 'Rosso') {
    data.characters[characterId].rossoAura = amount;
  } else {
    data.characters[characterId].bertheAura = amount;
  }

  saveChallengeData(data);

  return data.characters[characterId];
});

ipcMain.handle('reset-aura', (event, characterId, dungeon) => {
  const data = getChallengeData();

  if (!data.characters[characterId]) return null;

  if (dungeon === 'Rosso') {
    data.characters[characterId].rossoAura = 0;
  } else {
    data.characters[characterId].bertheAura = 0;

  }
  saveChallengeData(data);
  return data.characters[characterId];
});

ipcMain.handle('use-reset-ticket', (event, characterId) => {
  const data = getChallengeData();

  if (!data.characters[characterId]) {
    data.characters[characterId] = {rossoAura: 0, bertheAura: 0, resetTicketUsed: 0};
  }

  if (data.characters[characterId].resetTicketUsed >= 2) {
    return {error: 'You already used 2 tickets this week!'};
  }

  data.characters[characterId].resetTicketUsed +=1;
  saveChallengeData(data);

  const task = db.prepare('SELECT id FROM tasks WHERE title = ?').get('Challenge Mode');

  if (task) {
    db.prepare('UPDATE checklist SET completed = 0 WHERE character_id = ? AND task_id = ?').run(characterId, task.id);
  }

  return data.characters[characterId];
});

ipcMain.handle('toggle-task-enabled', (event, characterId, taskId, enabled) => {
    return db.prepare('UPDATE checklist SET enabled = ? WHERE character_id = ? AND task_id = ?').run(enabled, characterId, taskId);
});

ipcMain.handle('add-character', (event, charName, charClass, color) => {
    const res = db.prepare('INSERT INTO characters (name, class, color) VALUES (?, ?, ?)').run(charName, charClass, color);
    syncTasks();
    return res;
});

ipcMain.handle('add-task', (event, icon, title, reset, bound) => {
    const res = db.prepare('INSERT INTO tasks (icon, title, reset, bound) VALUES (?, ?, ?, ?)').run(icon, title, reset, bound);
    syncTasks();
    return res;
});

ipcMain.handle('add-run', (event, characterId, taskId) => {
  const task = db.prepare('SELECT title FROM tasks WHERE id = ?').get(taskId);
  const rate = task?.title === 'Serpentium' ? 12.5 : 11.12;
  const current = db.prepare('SELECT percent FROM pity WHERE character_id = ? AND task_id = ?').get(characterId, taskId);
  let percent = (current?.percent || 0) + rate;

  if (percent >= 100) {
    percent = percent - 100;
  }

  if (percent === 100) percent = 0;

  if (!current) {
    db.prepare('INSERT INTO pity (character_id, task_id, percent) VALUES (?, ?, ?)').run(characterId, taskId, percent);
  } else {
    db.prepare('UPDATE pity SET percent = ? WHERE character_id = ? AND task_id = ?').run(percent, characterId, taskId);
  }

  return percent;
})

ipcMain.handle('remove-run', (event, characterId, taskId) => {
  const task = db.prepare('SELECT title FROM tasks WHERE id = ?').get(taskId);
  const rate = task?.title === 'Serpentium' ? 12.5 : 11.12;
  const current = db.prepare('SELECT percent FROM pity WHERE character_id = ? AND task_id = ?').get(characterId, taskId);
    
  if (!current || current.percent === 0) return 0;

  let percent = current.percent - rate;

  if (percent < 0) percent = 0;

  db.prepare('UPDATE pity SET percent = ? WHERE character_id = ? AND task_id = ?').run(percent, characterId, taskId);
  
  return percent;
})

ipcMain.handle('set-percent', (event, characterId, taskId, percent) => {
  if (percent > 100) percent = 100;
  if (percent < 0) percent = 0;

  const current = db.prepare('SELECT percent FROM pity WHERE character_id = ? AND task_id = ?').get(characterId, taskId);
    
  if (!current) {
    db.prepare('INSERT INTO pity (character_id, task_id, percent) VALUES (?, ?, ?)').run(characterId, taskId, percent);
  } else {
    db.prepare('UPDATE pity SET percent = ? WHERE character_id = ? AND task_id = ?').run(percent, characterId, taskId);
  }

  return percent;
})

ipcMain.handle('select-icon', async () => {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    properties: ['openFile'],
    filters: [
      {name: 'Images', extensions: ['png', 'jpg', 'jpeg', 'webp']}
    ]
  })

  if (canceled || filePaths.length === 0) {
    return null;
  }
  const sourcePath = filePaths[0];

  if (!fs.existsSync(sourcePath)) {
    throw new Error(`Selected file no longer exists: ${sourcePath}`);
  }

  const ext = path.extname(sourcePath);
  const fileName = `${crypto.randomUUID()}${ext}`;
  const destPath = path.join(ICONS_DIR, fileName);

  await fs.promises.copyFile(sourcePath, destPath);

  return fileName;
});

ipcMain.handle('get-icon-path', (_event, fileName) => {
  return path.join(ICONS_DIR, fileName);
});
  
ipcMain.handle('edit-character', (event, characterId, charName, charClass, color) => {
      console.log('🔧 Editing character:', characterId, charName, charClass, color);

    const res = db.prepare('UPDATE characters SET name = ?, class = ?, color = ? WHERE id = ?').run(charName, charClass, color, characterId);
        console.log('📊 Result:', res);

    return res;
});

ipcMain.handle('delete-character', (event, characterId) => {
    db.prepare('DELETE FROM checklist WHERE character_id = ?').run(characterId);
    db.prepare('DELETE FROM pity WHERE character_id = ?').run(characterId);
    db.prepare('DELETE FROM characters WHERE id = ?').run(characterId);
    return true;
});

ipcMain.handle('delete-task', (event, taskId) => {
    db.prepare('DELETE FROM checklist WHERE task_id = ?').run(taskId);
    db.prepare('DELETE FROM tasks WHERE id = ?').run(taskId);
    return true;
});

// * ----------------------------------------------------------------------------------*

app.whenReady().then(() => {
  tasksReset();
  setInterval(tasksReset, 60000);
  syncTasks();
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })

  if (app.isPackaged) {
    autoUpdater.checkForUpdatesAndNotify();
  }
})

app.on('window-all-closed', () => {
  if (server) server.close();
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
