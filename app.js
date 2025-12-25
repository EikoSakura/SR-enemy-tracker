// Sovereign Regalia Enemy Tracker v3.0
// External JS for GitHub Pages compatibility

// State
let enemies = [];
let selectedEnemyId = null;
let editAttacks = [];
let obrReady = false;
let OBR = null;

// DOM Elements
const enemyList = document.getElementById('enemyList');
const listView = document.getElementById('listView');
const editorView = document.getElementById('editorView');
const persistenceNotice = document.getElementById('persistenceNotice');
const statusDot = document.getElementById('statusDot');
const persistenceText = document.getElementById('persistenceText');
const attacksEditor = document.getElementById('attacksEditor');

// Initialize OBR SDK
async function initOBR() {
  try {
    const module = await import('https://unpkg.com/@owlbear-rodeo/sdk@latest/dist/index.js');
    OBR = module.default;
    
    OBR.onReady(async () => {
      obrReady = true;
      persistenceNotice.classList.remove('local');
      persistenceNotice.classList.add('obr');
      statusDot.classList.remove('local');
      statusDot.classList.add('obr');
      persistenceText.textContent = 'Connected to Owlbear Rodeo - data synced';
      
      await loadEnemies();
      renderEnemyList();
    });
  } catch (e) {
    console.log('OBR SDK not available, using standalone mode');
    fallbackToLocal();
  }
}

function fallbackToLocal() {
  persistenceText.textContent = 'Standalone mode - data saved locally';
  loadFromLocalStorage();
  renderEnemyList();
}

// Start initialization
initOBR();

// Fallback to localStorage if OBR not ready after 3 seconds
setTimeout(() => {
  if (!obrReady) {
    fallbackToLocal();
  }
}, 3000);

// Storage functions
async function loadEnemies() {
  if (obrReady && OBR) {
    try {
      const metadata = await OBR.room.getMetadata();
      enemies = metadata['sr-enemies'] || [];
    } catch (e) {
      console.error('Failed to load from OBR:', e);
      loadFromLocalStorage();
    }
  } else {
    loadFromLocalStorage();
  }
}

async function saveEnemies() {
  if (obrReady && OBR) {
    try {
      await OBR.room.setMetadata({ 'sr-enemies': enemies });
    } catch (e) {
      console.error('Failed to save to OBR:', e);
    }
  }
  saveToLocalStorage();
}

function loadFromLocalStorage() {
  try {
    const stored = localStorage.getItem('sr-enemies');
    if (stored) {
      enemies = JSON.parse(stored);
    }
  } catch (e) {
    console.error('Failed to load from localStorage:', e);
  }
}

function saveToLocalStorage() {
  try {
    localStorage.setItem('sr-enemies', JSON.stringify(enemies));
  } catch (e) {
    console.error('Failed to save to localStorage:', e);
  }
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Render enemy list
function renderEnemyList() {
  if (enemies.length === 0) {
    enemyList.innerHTML = '<div class="no-enemies">No enemies added yet.<br>Click "+ Add Enemy" to create one.</div>';
    return;
  }

  let html = '';
  
  for (const enemy of enemies) {
    const hpPercent = Math.max(0, Math.min(100, (enemy.currentHp / enemy.maxHp) * 100));
    
    // Build attacks HTML
    let attacksHtml = '';
    if (enemy.attacks && enemy.attacks.length > 0) {
      attacksHtml = '<div class="attacks-list">';
      for (let idx = 0; idx < enemy.attacks.length; idx++) {
        const atk = enemy.attacks[idx];
        const hasEffect = atk.effect && atk.effect.trim();
        attacksHtml += '<div class="attack-item" data-enemy-id="' + escapeHtml(enemy.id) + '" data-attack-idx="' + idx + '">' +
          '<div class="attack-item-header">' +
          '<span class="atk-name">' + escapeHtml(atk.name || 'Attack') + '</span>' +
          '<span class="atk-stats">+' + atk.bonus + ' ' + escapeHtml(atk.aspect) + ' · ' + escapeHtml(atk.element) + (hasEffect ? ' <span class="atk-toggle">▼</span>' : '') + '</span>' +
          '</div>' +
          (hasEffect ? '<div class="attack-item-effect">' + escapeHtml(atk.effect) + '</div>' : '') +
          '</div>';
      }
      attacksHtml += '</div>';
    }

    // Build element interactions
    let interactionsHtml = '';
    if (enemy.weaknesses) interactionsHtml += '<span class="interaction-tag weakness">⚠️ ' + escapeHtml(enemy.weaknesses) + '</span>';
    if (enemy.resistances) interactionsHtml += '<span class="interaction-tag resistance">🛡️ ' + escapeHtml(enemy.resistances) + '</span>';
    if (enemy.immunities) interactionsHtml += '<span class="interaction-tag immunity">🚫 ' + escapeHtml(enemy.immunities) + '</span>';
    if (enemy.absorbs) interactionsHtml += '<span class="interaction-tag absorb">💚 ' + escapeHtml(enemy.absorbs) + '</span>';

    // Build abilities HTML
    let abilityHtml = '';
    if (enemy.abilityDesc) {
      abilityHtml = '<div class="ability-section" data-enemy-id="' + escapeHtml(enemy.id) + '">' +
        '<div class="ability-header">' +
        '<span class="ability-name">📜 Abilities</span>' +
        '<span class="ability-toggle">▼</span>' +
        '</div>' +
        '<div class="ability-content">' + escapeHtml(enemy.abilityDesc) + '</div>' +
        '</div>';
    }

    // Build damage calculator HTML
    const calcHtml = '<div class="calc-section" data-enemy-id="' + escapeHtml(enemy.id) + '">' +
      '<div class="calc-header">' +
      '<span>🎯 Damage Calculator</span>' +
      '<span class="calc-toggle">▼</span>' +
      '</div>' +
      '<div class="calc-content">' +
      '<div class="calc-row">' +
      '<span class="calc-label">Hit Tier</span>' +
      '<div class="tier-buttons">' +
      '<button class="tier-btn" data-tier="noble" data-enemy-id="' + escapeHtml(enemy.id) + '">Noble (2)</button>' +
      '<button class="tier-btn" data-tier="royal" data-enemy-id="' + escapeHtml(enemy.id) + '">Royal (3)</button>' +
      '<button class="tier-btn" data-tier="imperial" data-enemy-id="' + escapeHtml(enemy.id) + '">Imperial (4)</button>' +
      '</div>' +
      '</div>' +
      '<div class="calc-row">' +
      '<span class="calc-label">Critical</span>' +
      '<div class="tier-buttons">' +
      '<button class="tier-btn crit-btn" data-crit="true" data-enemy-id="' + escapeHtml(enemy.id) + '">⚡ Critical (×3)</button>' +
      '</div>' +
      '</div>' +
      '<div class="buff-grid">' +
      '<div class="buff-item">' +
      '<label>Base Dmg</label>' +
      '<input type="number" class="buff-base" data-enemy-id="' + escapeHtml(enemy.id) + '" value="' + (enemy.baseDamage || 0) + '" min="0" max="10">' +
      '</div>' +
      '<div class="buff-item">' +
      '<label>+Damage</label>' +
      '<input type="number" class="buff-dmg" data-enemy-id="' + escapeHtml(enemy.id) + '" value="0" min="-10" max="20">' +
      '</div>' +
      '<div class="buff-item">' +
      '<label>−Reduction</label>' +
      '<input type="number" class="buff-pen" data-enemy-id="' + escapeHtml(enemy.id) + '" value="0" min="0" max="10">' +
      '</div>' +
      '</div>' +
      '<div class="damage-result">' +
      '<div>' +
      '<span class="damage-result-label">Total Damage: </span>' +
      '<span class="damage-result-value" data-enemy-id="' + escapeHtml(enemy.id) + '">—</span>' +
      '</div>' +
      '<button class="btn btn-danger btn-small apply-damage-btn" data-enemy-id="' + escapeHtml(enemy.id) + '">Apply</button>' +
      '</div>' +
      '<div class="damage-breakdown" data-enemy-id="' + escapeHtml(enemy.id) + '">Select a hit tier</div>' +
      '</div>' +
      '</div>';

    html += '<div class="enemy-card' + (selectedEnemyId === enemy.id ? ' selected' : '') + '" data-id="' + escapeHtml(enemy.id) + '">' +
      '<div class="enemy-card-header">' +
      '<span class="enemy-name">' + escapeHtml(enemy.name || 'Unnamed') + '</span>' +
      '<div style="display: flex; align-items: center; gap: 6px;">' +
      '<span class="enemy-type">' + escapeHtml(enemy.type) + (enemy.size > 1 ? ' (Size ' + enemy.size + ')' : '') + (enemy.init > 0 ? ' [Init ' + enemy.init + ']' : '') + '</span>' +
      '<button class="btn btn-small btn-danger delete-card-btn" data-id="' + escapeHtml(enemy.id) + '" title="Delete">✕</button>' +
      '</div>' +
      '</div>' +
      '<div class="hp-bar-container">' +
      '<div class="hp-bar" style="width: ' + hpPercent + '%"></div>' +
      '<span class="hp-text">' + enemy.currentHp + ' / ' + enemy.maxHp + '</span>' +
      '</div>' +
      '<div class="stat-row">' +
      '<div class="stat-box"><div class="stat-label">MOV</div><div class="stat-value">' + enemy.mov + '</div></div>' +
      '<div class="stat-box"><div class="stat-label">EVA</div><div class="stat-value">' + enemy.eva + '</div></div>' +
      '<div class="stat-box"><div class="stat-label">M.EVA</div><div class="stat-value">' + enemy.meva + '</div></div>' +
      '<div class="stat-box"><div class="stat-label">GRD</div><div class="stat-value">' + enemy.guard + '</div></div>' +
      '<div class="stat-box"><div class="stat-label">BAR</div><div class="stat-value">' + enemy.barrier + '</div></div>' +
      '<div class="stat-box"><div class="stat-label">BASE</div><div class="stat-value base-dmg">+' + (enemy.baseDamage || 0) + '</div></div>' +
      '</div>' +
      attacksHtml +
      (interactionsHtml ? '<div class="element-interactions">' + interactionsHtml + '</div>' : '') +
      abilityHtml +
      calcHtml +
      '<div class="quick-actions">' +
      '<div class="damage-input">' +
      '<button class="btn btn-small btn-secondary heal-btn" data-id="' + escapeHtml(enemy.id) + '">+</button>' +
      '<input type="number" class="hp-change" data-id="' + escapeHtml(enemy.id) + '" value="1" min="1">' +
      '<button class="btn btn-small btn-danger damage-btn" data-id="' + escapeHtml(enemy.id) + '">−</button>' +
      '</div>' +
      '<button class="btn btn-small btn-secondary edit-btn" data-id="' + escapeHtml(enemy.id) + '" style="margin-left: auto">Edit</button>' +
      '</div>' +
      '</div>';
  }
  
  enemyList.innerHTML = html;
  attachCardListeners();
}

// Attach event listeners to cards (using event delegation on enemyList)
function attachCardListeners() {
  // We'll use event delegation on the enemyList container
}

// Calculate damage
function calculateDamage(enemyId) {
  const tierBtns = document.querySelectorAll('.tier-btn[data-tier][data-enemy-id="' + enemyId + '"]');
  const critBtn = document.querySelector('.tier-btn[data-crit][data-enemy-id="' + enemyId + '"]');
  const baseDmgInput = document.querySelector('.buff-base[data-enemy-id="' + enemyId + '"]');
  const bonusDmgInput = document.querySelector('.buff-dmg[data-enemy-id="' + enemyId + '"]');
  const penInput = document.querySelector('.buff-pen[data-enemy-id="' + enemyId + '"]');
  const resultEl = document.querySelector('.damage-result-value[data-enemy-id="' + enemyId + '"]');
  const breakdownEl = document.querySelector('.damage-breakdown[data-enemy-id="' + enemyId + '"]');

  let tierDamage = 0;
  let tierName = '';
  tierBtns.forEach(btn => {
    if (btn.classList.contains('active')) {
      const tier = btn.dataset.tier;
      if (tier === 'noble') { tierDamage = 2; tierName = 'Noble'; }
      if (tier === 'royal') { tierDamage = 3; tierName = 'Royal'; }
      if (tier === 'imperial') { tierDamage = 4; tierName = 'Imperial'; }
    }
  });

  if (tierDamage === 0) {
    resultEl.textContent = '—';
    resultEl.classList.remove('crit');
    breakdownEl.textContent = 'Select a hit tier';
    return;
  }

  const baseDmg = parseInt(baseDmgInput.value) || 0;
  const bonusDmg = parseInt(bonusDmgInput.value) || 0;
  const pen = parseInt(penInput.value) || 0;
  const isCrit = critBtn && critBtn.classList.contains('active');

  let total = tierDamage + baseDmg + bonusDmg;
  let breakdown = tierName + ' (' + tierDamage + ') + Base (' + baseDmg + ')';
  
  if (bonusDmg !== 0) {
    breakdown += ' + Buff (' + (bonusDmg > 0 ? '+' : '') + bonusDmg + ')';
  }

  if (isCrit) {
    total = total * 3;
    breakdown += ' × 3 crit';
  }

  if (pen > 0) {
    breakdown += ' (ignores ' + pen + ' reduction)';
  }

  breakdown += ' = ' + total;

  resultEl.textContent = total;
  resultEl.classList.toggle('crit', isCrit);
  breakdownEl.textContent = breakdown;
}

// Change HP
async function changeHp(enemyId, amount) {
  const enemy = enemies.find(e => e.id === enemyId);
  if (!enemy) return;

  enemy.currentHp = Math.max(0, Math.min(enemy.maxHp, enemy.currentHp + amount));
  
  if (enemy.currentHp === 0 && obrReady && OBR) {
    OBR.notification.show(enemy.name + ' has been defeated!', 'WARNING');
  }

  await saveEnemies();
  renderEnemyList();
}

// Edit enemy
function editEnemy(id) {
  const enemy = enemies.find(e => e.id === id);
  if (!enemy) return;

  selectedEnemyId = id;

  document.getElementById('enemyName').value = enemy.name || '';
  document.getElementById('enemyType').value = enemy.type || 'Humanoid';
  document.getElementById('maxHp').value = enemy.maxHp || 10;
  document.getElementById('currentHp').value = enemy.currentHp || 10;
  document.getElementById('enemySize').value = enemy.size || 1;
  document.getElementById('enemyInit').value = enemy.init || 0;
  document.getElementById('enemyMov').value = enemy.mov || 4;
  document.getElementById('enemyEva').value = enemy.eva || 9;
  document.getElementById('enemyMeva').value = enemy.meva || 8;
  document.getElementById('enemyGuard').value = enemy.guard || 1;
  document.getElementById('enemyBarrier').value = enemy.barrier || 0;
  document.getElementById('enemyBaseDamage').value = enemy.baseDamage || 0;
  document.getElementById('enemyWeaknesses').value = enemy.weaknesses || '';
  document.getElementById('enemyResistances').value = enemy.resistances || '';
  document.getElementById('enemyImmunities').value = enemy.immunities || '';
  document.getElementById('enemyAbsorbs').value = enemy.absorbs || '';
  document.getElementById('enemyAbilityDesc').value = enemy.abilityDesc || '';

  editAttacks = enemy.attacks ? JSON.parse(JSON.stringify(enemy.attacks)) : [];
  renderAttacksEditor();

  showTab('editor');
}

// Render attacks editor
function renderAttacksEditor() {
  if (editAttacks.length === 0) {
    attacksEditor.innerHTML = '<div style="color: var(--text-dim); font-size: 11px;">No attacks added yet.</div>';
    return;
  }

  const elements = ['Steel', 'Flame', 'Frost', 'Storm', 'Gale', 'Stone', 'Tide', 'Venom', 'Light', 'Shadow', 'Spirit', 'Decay'];
  
  let html = '';
  for (let idx = 0; idx < editAttacks.length; idx++) {
    const atk = editAttacks[idx];
    
    let elementOptions = '';
    for (const el of elements) {
      elementOptions += '<option value="' + el + '"' + (atk.element === el ? ' selected' : '') + '>' + el + '</option>';
    }
    
    html += '<div class="attack-entry" data-idx="' + idx + '">' +
      '<div class="attack-entry-header">' +
      '<span style="font-weight: 500;">Attack ' + (idx + 1) + '</span>' +
      '<button class="btn btn-danger btn-small remove-attack-btn" data-idx="' + idx + '">Remove</button>' +
      '</div>' +
      '<div class="form-row">' +
      '<div class="form-group" style="flex: 2">' +
      '<label>Name</label>' +
      '<input type="text" class="atk-name-input" data-idx="' + idx + '" value="' + escapeHtml(atk.name || '') + '" placeholder="Attack Name">' +
      '</div>' +
      '<div class="form-group">' +
      '<label>Bonus</label>' +
      '<input type="number" class="atk-bonus-input" data-idx="' + idx + '" value="' + (atk.bonus || 6) + '" min="0">' +
      '</div>' +
      '</div>' +
      '<div class="form-row">' +
      '<div class="form-group">' +
      '<label>Aspect</label>' +
      '<select class="atk-aspect-input" data-idx="' + idx + '">' +
      '<option value="Physical"' + (atk.aspect === 'Physical' ? ' selected' : '') + '>Physical</option>' +
      '<option value="Magical"' + (atk.aspect === 'Magical' ? ' selected' : '') + '>Magical</option>' +
      '</select>' +
      '</div>' +
      '<div class="form-group">' +
      '<label>Element</label>' +
      '<select class="atk-element-input" data-idx="' + idx + '">' +
      elementOptions +
      '</select>' +
      '</div>' +
      '</div>' +
      '<div class="form-group">' +
      '<label>Effect</label>' +
      '<input type="text" class="atk-effect-input" data-idx="' + idx + '" value="' + escapeHtml(atk.effect || '') + '" placeholder="Ranged 2-5. On hit, push 1 space.">' +
      '</div>' +
      '</div>';
  }
  
  attacksEditor.innerHTML = html;
}

// Show tab
function showTab(tabName) {
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.querySelector('.tab[data-tab="' + tabName + '"]').classList.add('active');
  
  listView.style.display = tabName === 'list' ? 'block' : 'none';
  editorView.classList.toggle('active', tabName === 'editor');
}

// Export enemies
function exportEnemies() {
  const exportData = {
    version: '3.0',
    exportDate: new Date().toISOString(),
    encounter: 'Exported Enemies',
    enemies: enemies
  };

  const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'sr-enemies-' + new Date().toISOString().split('T')[0] + '.json';
  a.click();
  URL.revokeObjectURL(url);

  if (obrReady && OBR) {
    OBR.notification.show('Enemies exported!', 'SUCCESS');
  }
}

// Import enemies
async function importEnemies(file) {
  try {
    const text = await file.text();
    const data = JSON.parse(text);
    
    let importedEnemies = [];
    if (Array.isArray(data)) {
      importedEnemies = data;
    } else if (data.enemies && Array.isArray(data.enemies)) {
      importedEnemies = data.enemies;
    }

    // Validate and add IDs if missing
    importedEnemies = importedEnemies.map(enemy => ({
      ...enemy,
      id: enemy.id || 'enemy-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),
      baseDamage: enemy.baseDamage || 0
    }));

    const replaceAll = confirm('Replace all existing enemies?\n\nOK = Replace all\nCancel = Add to existing');
    
    if (replaceAll) {
      enemies = importedEnemies;
    } else {
      enemies = [...enemies, ...importedEnemies];
    }

    await saveEnemies();
    renderEnemyList();

    if (obrReady && OBR) {
      OBR.notification.show('Imported ' + importedEnemies.length + ' enemies!', 'SUCCESS');
    } else {
      alert('Imported ' + importedEnemies.length + ' enemies!');
    }
  } catch (err) {
    console.error('Import failed:', err);
    alert('Failed to import: ' + err.message);
  }
}

// Clear all enemies
async function clearAllEnemies() {
  if (enemies.length === 0) {
    alert('No enemies to clear!');
    return;
  }

  if (confirm('Are you sure you want to delete all ' + enemies.length + ' enemies?\n\nThis cannot be undone!')) {
    enemies = [];
    await saveEnemies();
    renderEnemyList();

    if (obrReady && OBR) {
      OBR.notification.show('All enemies cleared', 'WARNING');
    }
  }
}

// Save enemy from editor
async function saveEnemy() {
  const enemyData = {
    id: selectedEnemyId || 'enemy-' + Date.now(),
    name: document.getElementById('enemyName').value || 'Unnamed Enemy',
    type: document.getElementById('enemyType').value,
    maxHp: parseInt(document.getElementById('maxHp').value) || 10,
    currentHp: parseInt(document.getElementById('currentHp').value) || 10,
    size: parseInt(document.getElementById('enemySize').value) || 1,
    init: parseInt(document.getElementById('enemyInit').value) || 0,
    mov: parseInt(document.getElementById('enemyMov').value) || 4,
    eva: parseInt(document.getElementById('enemyEva').value) || 9,
    meva: parseInt(document.getElementById('enemyMeva').value) || 8,
    guard: parseInt(document.getElementById('enemyGuard').value) || 0,
    barrier: parseInt(document.getElementById('enemyBarrier').value) || 0,
    baseDamage: parseInt(document.getElementById('enemyBaseDamage').value) || 0,
    attacks: editAttacks,
    weaknesses: document.getElementById('enemyWeaknesses').value,
    resistances: document.getElementById('enemyResistances').value,
    immunities: document.getElementById('enemyImmunities').value,
    absorbs: document.getElementById('enemyAbsorbs').value,
    abilityDesc: document.getElementById('enemyAbilityDesc').value
  };

  if (selectedEnemyId) {
    const idx = enemies.findIndex(e => e.id === selectedEnemyId);
    if (idx !== -1) {
      enemies[idx] = enemyData;
    }
  } else {
    enemies.push(enemyData);
  }

  await saveEnemies();
  renderEnemyList();
  showTab('list');

  if (obrReady && OBR) {
    OBR.notification.show('Enemy saved!', 'SUCCESS');
  }
}

// Delete enemy
async function deleteEnemy() {
  if (!selectedEnemyId) return;
  
  if (confirm('Delete this enemy?')) {
    enemies = enemies.filter(e => e.id !== selectedEnemyId);
    await saveEnemies();
    renderEnemyList();
    showTab('list');
    
    if (obrReady && OBR) {
      OBR.notification.show('Enemy deleted', 'WARNING');
    }
  }
}

// Reset editor for new enemy
function resetEditor() {
  selectedEnemyId = null;
  document.getElementById('enemyName').value = '';
  document.getElementById('enemyType').value = 'Humanoid';
  document.getElementById('maxHp').value = 10;
  document.getElementById('currentHp').value = 10;
  document.getElementById('enemySize').value = 1;
  document.getElementById('enemyInit').value = 0;
  document.getElementById('enemyMov').value = 4;
  document.getElementById('enemyEva').value = 9;
  document.getElementById('enemyMeva').value = 8;
  document.getElementById('enemyGuard').value = 1;
  document.getElementById('enemyBarrier').value = 0;
  document.getElementById('enemyBaseDamage').value = 0;
  document.getElementById('enemyWeaknesses').value = '';
  document.getElementById('enemyResistances').value = '';
  document.getElementById('enemyImmunities').value = '';
  document.getElementById('enemyAbsorbs').value = '';
  document.getElementById('enemyAbilityDesc').value = '';
  editAttacks = [{ name: 'Attack', bonus: 6, aspect: 'Physical', element: 'Steel', effect: '' }];
  renderAttacksEditor();
}

// ============================================
// EVENT LISTENERS (all using addEventListener)
// ============================================

// Add Enemy button
document.getElementById('addEnemy').addEventListener('click', () => {
  resetEditor();
  showTab('editor');
});

// Tab clicks
document.querySelectorAll('.tab').forEach(tab => {
  tab.addEventListener('click', () => {
    showTab(tab.dataset.tab);
  });
});

// Export button
document.getElementById('exportBtn').addEventListener('click', exportEnemies);

// Import button
document.getElementById('importBtn').addEventListener('click', () => {
  document.getElementById('importFile').click();
});

document.getElementById('importFile').addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (file) {
    importEnemies(file);
  }
  e.target.value = '';
});

// Clear all button
document.getElementById('clearAllBtn').addEventListener('click', clearAllEnemies);

// Add attack button
document.getElementById('addAttackBtn').addEventListener('click', () => {
  editAttacks.push({ name: 'Attack', bonus: 6, aspect: 'Physical', element: 'Steel', effect: '' });
  renderAttacksEditor();
});

// Save enemy button
document.getElementById('saveEnemyBtn').addEventListener('click', saveEnemy);

// Cancel edit button
document.getElementById('cancelEditBtn').addEventListener('click', () => {
  selectedEnemyId = null;
  showTab('list');
});

// Delete enemy button
document.getElementById('deleteEnemyBtn').addEventListener('click', deleteEnemy);

// Event delegation for enemy list (handles all dynamic elements)
enemyList.addEventListener('click', async (e) => {
  const target = e.target;
  
  // Delete card button
  if (target.classList.contains('delete-card-btn')) {
    e.stopPropagation();
    const id = target.dataset.id;
    if (confirm('Delete this enemy?')) {
      enemies = enemies.filter(en => en.id !== id);
      await saveEnemies();
      renderEnemyList();
    }
    return;
  }
  
  // Edit button
  if (target.classList.contains('edit-btn')) {
    e.stopPropagation();
    editEnemy(target.dataset.id);
    return;
  }
  
  // Heal button
  if (target.classList.contains('heal-btn')) {
    e.stopPropagation();
    const id = target.dataset.id;
    const input = document.querySelector('.hp-change[data-id="' + id + '"]');
    const amount = parseInt(input.value) || 1;
    await changeHp(id, amount);
    return;
  }
  
  // Damage button
  if (target.classList.contains('damage-btn')) {
    e.stopPropagation();
    const id = target.dataset.id;
    const input = document.querySelector('.hp-change[data-id="' + id + '"]');
    const amount = parseInt(input.value) || 1;
    await changeHp(id, -amount);
    return;
  }
  
  // Attack item toggle
  if (target.closest('.attack-item')) {
    const item = target.closest('.attack-item');
    if (item.querySelector('.attack-item-effect')) {
      item.classList.toggle('expanded');
    }
    return;
  }
  
  // Ability header toggle
  if (target.closest('.ability-header')) {
    e.stopPropagation();
    const section = target.closest('.ability-section');
    section.classList.toggle('expanded');
    return;
  }
  
  // Calc header toggle
  if (target.closest('.calc-header')) {
    e.stopPropagation();
    const section = target.closest('.calc-section');
    section.classList.toggle('expanded');
    return;
  }
  
  // Tier buttons
  if (target.classList.contains('tier-btn') && target.dataset.tier) {
    e.stopPropagation();
    const enemyId = target.dataset.enemyId;
    const tier = target.dataset.tier;
    
    // Toggle active state within same enemy's tier buttons
    document.querySelectorAll('.tier-btn[data-tier][data-enemy-id="' + enemyId + '"]').forEach(b => {
      if (b === target) {
        b.classList.toggle('active');
      } else {
        b.classList.remove('active');
      }
    });
    
    calculateDamage(enemyId);
    return;
  }
  
  // Crit button
  if (target.classList.contains('crit-btn')) {
    e.stopPropagation();
    target.classList.toggle('active');
    calculateDamage(target.dataset.enemyId);
    return;
  }
  
  // Apply damage button
  if (target.classList.contains('apply-damage-btn')) {
    e.stopPropagation();
    const enemyId = target.dataset.enemyId;
    const resultEl = document.querySelector('.damage-result-value[data-enemy-id="' + enemyId + '"]');
    const damage = parseInt(resultEl.textContent);
    
    if (!isNaN(damage) && damage > 0) {
      await changeHp(enemyId, -damage);
    }
    return;
  }
});

// Event delegation for buff inputs
enemyList.addEventListener('input', (e) => {
  const target = e.target;
  
  if (target.classList.contains('buff-dmg') || 
      target.classList.contains('buff-base') || 
      target.classList.contains('buff-pen')) {
    calculateDamage(target.dataset.enemyId);
  }
});

// Event delegation for attacks editor
attacksEditor.addEventListener('click', (e) => {
  if (e.target.classList.contains('remove-attack-btn')) {
    const idx = parseInt(e.target.dataset.idx);
    editAttacks.splice(idx, 1);
    renderAttacksEditor();
  }
});

attacksEditor.addEventListener('change', (e) => {
  const target = e.target;
  const idx = parseInt(target.dataset.idx);
  
  if (idx === undefined || isNaN(idx)) return;
  
  if (target.classList.contains('atk-name-input')) editAttacks[idx].name = target.value;
  if (target.classList.contains('atk-bonus-input')) editAttacks[idx].bonus = parseInt(target.value) || 6;
  if (target.classList.contains('atk-aspect-input')) editAttacks[idx].aspect = target.value;
  if (target.classList.contains('atk-element-input')) editAttacks[idx].element = target.value;
  if (target.classList.contains('atk-effect-input')) editAttacks[idx].effect = target.value;
});
