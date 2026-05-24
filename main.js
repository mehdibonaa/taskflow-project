const MEMBERS = [
  { name: 'Mehdi',  initials: 'AM', tw: 'bg-violet-50  text-violet-400' },
  { name: 'Mohammed',   initials: 'BL', tw: 'bg-teal-50    text-teal-500'   },
  { name: 'Anass',  initials: 'CN', tw: 'bg-coral-50   text-coral-400'  },
  { name: 'Oussama',   initials: 'DR', tw: 'bg-pink-50    text-pink-400'   },
  { name: 'khalid',   initials: 'EC', tw: 'bg-emerald-50 text-emerald-500'},
];
 
// Fallback tw colors using inline hex for dark-mode safety
const MEMBER_COLORS = [
  { bg: '#EEEDFE', color: '#534AB7' },
  { bg: '#E1F5EE', color: '#085041' },
  { bg: '#FAECE7', color: '#993C1D' },
  { bg: '#FBEAF0', color: '#993556' },
  { bg: '#EAF6F0', color: '#0F6E56' },
];
 
let tasks = [
  { id: 1, title: "Définir l'architecture back-end", desc: 'Choisir le framework et la structure BDD', status: 'done',   priority: 'high', member: 'Bruno Leroy'  },
  { id: 2, title: 'Maquettes UI — dashboard',        desc: 'Wireframes basse fidélité + validation équipe',            status: 'done',   priority: 'high', member: 'Chloé Nguyen' },
  { id: 3, title: 'Intégrer les maquettes',           desc: 'HTML / CSS / JS responsive',                               status: 'inprog', priority: 'high', member: 'Alice Martin' },
  { id: 4, title: "Système d'authentification",       desc: 'Login / logout / gestion de session',                      status: 'inprog', priority: 'high', member: 'David Rossi'  },
  { id: 5, title: 'Tests unitaires API',              desc: 'Couverture minimale 80%',                                  status: 'todo',   priority: 'med',  member: 'Bruno Leroy'  },
  { id: 6, title: 'Rédiger la documentation',         desc: 'Guide développeur + README',                               status: 'todo',   priority: 'low',  member: 'Emma Chatel'  },
  { id: 7, title: 'Optimisation performances',        desc: 'Profiling et cache Redis',                                  status: 'todo',   priority: 'med',  member: 'Alice Martin' },
  { id: 8, title: 'Configuration CI/CD',              desc: 'Pipeline GitHub Actions + déploiement Vercel',             status: 'todo',   priority: 'low',  member: ''             },
];
 
let nextId = 100, editingId = null, deletingId = null, activeFilter = 'all';
 
/* ── INIT ── */
function init() {
  populateMemberSelects();
  renderBoard();
}
 
function populateMemberSelects() {
  const inputSel  = document.getElementById('input-member');
  const filterSel = document.getElementById('member-filter');
  inputSel.innerHTML  = '<option value="">— Non assigné —</option>';
  filterSel.innerHTML = '<option value="all">Tous les membres</option>';
  MEMBERS.forEach(m => {
    [inputSel, filterSel].forEach(sel => {
      const opt = document.createElement('option');
      opt.value = m.name; opt.textContent = m.name;
      sel.appendChild(opt);
    });
  });
}
 
function getMemberInfo(name) { return MEMBERS.find(m => m.name === name) || null; }
function getMemberIdx(name)  { return MEMBERS.findIndex(m => m.name === name); }
 
/* ── FILTER ── */
function filterPriority(val, el) {
  activeFilter = val;
  document.querySelectorAll('.filter-btn').forEach(b => {
    b.classList.remove('bg-stone-900','dark:bg-stone-50','text-stone-50','dark:text-stone-900');
    b.classList.add('bg-transparent','text-stone-500','dark:text-stone-400');
  });
  el.classList.remove('bg-transparent','text-stone-500','dark:text-stone-400');
  el.classList.add('bg-stone-900','dark:bg-stone-50','text-stone-50','dark:text-stone-900');
  renderBoard();
}
 
function getFilteredTasks() {
  const mf = document.getElementById('member-filter').value;
  return tasks.filter(t =>
    (activeFilter === 'all' || t.priority === activeFilter) &&
    (mf === 'all' || t.member === mf)
  );
}
 
/* ── RENDER ── */
function renderBoard() {
  const filtered = getFilteredTasks();
  const cols = { todo: [], inprog: [], done: [] };
  filtered.forEach(t => cols[t.status].push(t));
 
  ['todo','inprog','done'].forEach(s => {
    const el    = document.getElementById('col-' + s);
    const count = document.getElementById('count-' + s);
    count.textContent = cols[s].length;
    el.innerHTML = cols[s].length
      ? cols[s].map(renderTask).join('')
      : '<p class="text-[11px] text-stone-400 text-center italic py-5">Aucune tâche</p>';
  });
 
  updateStats();
}
 
function priorityClasses(p) {
  return {
    high: 'bg-rose-50  text-rose-300',
    med:  'bg-amber-50 text-amber-200',
    low:  'bg-emerald-50 text-emerald-400',
  }[p];
}
function priorityLabel(p) { return { high:'Haute', med:'Moyenne', low:'Basse' }[p]; }
 
function renderTask(t) {
  const mi  = getMemberIdx(t.member);
  const mc  = mi >= 0 ? MEMBER_COLORS[mi] : null;
  const m   = getMemberInfo(t.member);
  const isDone = t.status === 'done';
 
  const memberHtml = m && mc ? `
    <div class="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full border border-black/10 dark:border-white/10 bg-stone-100 dark:bg-stone-700 text-stone-500 dark:text-stone-400">
      <span class="w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-medium flex-shrink-0"
        style="background:${mc.bg};color:${mc.color}">${m.initials}</span>
      ${m.name.split(' ')[0]}
    </div>` : '';
 
  return `
    <div class="task-card bg-stone-50 dark:bg-stone-900 border border-black/10 dark:border-white/10 rounded-lg p-3 cursor-pointer hover:border-black/20 dark:hover:border-white/20 hover:shadow-md hover:-translate-y-px transition-all animate-slideIn">
      <div class="flex items-start justify-between gap-2 mb-2">
        <p class="text-[13px] font-medium leading-snug flex-1 ${isDone ? 'line-through text-stone-400 dark:text-stone-500' : 'text-stone-900 dark:text-stone-50'}">${escHtml(t.title)}</p>
        <div class="task-actions flex gap-1 flex-shrink-0">
          <button class="w-6 h-6 flex items-center justify-center rounded bg-stone-100 dark:bg-stone-700 text-stone-500 hover:bg-stone-200 dark:hover:bg-stone-600 hover:text-stone-900 dark:hover:text-stone-50 transition-colors"
            onclick="openModal(${t.id})" title="Modifier">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </button>
          <button class="w-6 h-6 flex items-center justify-center rounded bg-stone-100 dark:bg-stone-700 text-stone-500 hover:bg-rose-50 dark:hover:bg-rose-900/30 hover:text-rose-300 transition-colors"
            onclick="openDelModal(${t.id})" title="Supprimer">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
          </button>
        </div>
      </div>
      ${t.desc ? `<p class="text-[11px] text-stone-400 dark:text-stone-500 mt-1 mb-2 leading-relaxed line-clamp-2">${escHtml(t.desc)}</p>` : ''}
      <div class="flex items-center gap-1.5 flex-wrap mt-2">
        <span class="text-[10px] px-2 py-0.5 rounded-full font-medium uppercase tracking-wide ${priorityClasses(t.priority)}">${priorityLabel(t.priority)}</span>
        ${memberHtml}
      </div>
    </div>`;
}
 
function updateStats() {
  const all  = tasks;
  const done = all.filter(t => t.status === 'done').length;
  const pct  = all.length ? Math.round((done / all.length) * 100) : 0;
  document.getElementById('stat-total').textContent  = all.length;
  document.getElementById('stat-todo').textContent   = all.filter(t => t.status === 'todo').length;
  document.getElementById('stat-inprog').textContent = all.filter(t => t.status === 'inprog').length;
  document.getElementById('stat-done').textContent   = done;
  document.getElementById('progress-fill').style.width = pct + '%';
  document.getElementById('progress-pct').textContent  = pct + '%';
}
 
/* ── MODAL ── */
function openModal(id = null) {
  editingId = id;
  if (id) {
    const t = tasks.find(x => x.id === id);
    document.getElementById('modal-title').textContent    = 'Modifier la tâche';
    document.getElementById('modal-save-btn').textContent = 'Enregistrer';
    document.getElementById('input-title').value    = t.title;
    document.getElementById('input-desc').value     = t.desc || '';
    document.getElementById('input-status').value   = t.status;
    document.getElementById('input-priority').value = t.priority;
    document.getElementById('input-member').value   = t.member || '';
  } else {
    document.getElementById('modal-title').textContent    = 'Nouvelle tâche';
    document.getElementById('modal-save-btn').textContent = 'Créer la tâche';
    document.getElementById('input-title').value    = '';
    document.getElementById('input-desc').value     = '';
    document.getElementById('input-status').value   = 'todo';
    document.getElementById('input-priority').value = 'med';
    document.getElementById('input-member').value   = '';
  }
  showModal('modal');
  setTimeout(() => document.getElementById('input-title').focus(), 120);
}
 
function closeModal()    { hideModal('modal'); editingId = null; }
function openDelModal(id) {
  deletingId = id;
  const t = tasks.find(x => x.id === id);
  document.getElementById('del-task-name').textContent = '"' + t.title + '"';
  showModal('modal-del');
}
function closeDelModal() { hideModal('modal-del'); deletingId = null; }
 
function showModal(id) {
  const backdrop = document.getElementById(id);
  const box      = backdrop.querySelector('.modal-box');
  backdrop.classList.remove('opacity-0','pointer-events-none');
  backdrop.classList.add('opacity-100');
  box.classList.remove('translate-y-3','opacity-0');
  box.classList.add('translate-y-0','opacity-100');
}
function hideModal(id) {
  const backdrop = document.getElementById(id);
  const box      = backdrop.querySelector('.modal-box');
  backdrop.classList.remove('opacity-100');
  backdrop.classList.add('opacity-0');
  box.classList.remove('translate-y-0','opacity-100');
  box.classList.add('translate-y-3','opacity-0');
  setTimeout(() => backdrop.classList.add('pointer-events-none'), 200);
}
 
function handleBackdropClick(e)    { if (e.target.id === 'modal')     closeModal(); }
function handleDelBackdropClick(e) { if (e.target.id === 'modal-del') closeDelModal(); }
 
function saveTask() {
  const titleEl = document.getElementById('input-title');
  const title   = titleEl.value.trim();
  if (!title) {
    titleEl.focus();
    titleEl.classList.add('border-rose-300');
    setTimeout(() => titleEl.classList.remove('border-rose-300'), 1500);
    return;
  }
  const data = {
    title,
    desc:     document.getElementById('input-desc').value.trim(),
    status:   document.getElementById('input-status').value,
    priority: document.getElementById('input-priority').value,
    member:   document.getElementById('input-member').value,
  };
  if (editingId) {
    const idx = tasks.findIndex(t => t.id === editingId);
    tasks[idx] = { ...tasks[idx], ...data };
    showNotif('Tâche modifiée ✓');
  } else {
    tasks.push({ id: nextId++, ...data });
    showNotif('Tâche créée ✓');
  }
  closeModal();
  renderBoard();
}
 
function confirmDelete() {
  if (!deletingId) return;
  tasks = tasks.filter(t => t.id !== deletingId);
  closeDelModal();
  renderBoard();
  showNotif('Tâche supprimée');
}
 
/* ── TOAST ── */
let notifTimer;
function showNotif(msg) {
  const el = document.getElementById('notif');
  el.textContent = msg;
  el.classList.remove('translate-y-14','opacity-0');
  el.classList.add('translate-y-0','opacity-100');
  clearTimeout(notifTimer);
  notifTimer = setTimeout(() => {
    el.classList.add('translate-y-14','opacity-0');
    el.classList.remove('translate-y-0','opacity-100');
  }, 2200);
}
 
/* ── DARK MODE ── */
function toggleTheme() {
  const html = document.documentElement;
  const isDark = html.classList.toggle('dark');
  document.getElementById('sun-icon').classList.toggle('hidden', isDark);
  document.getElementById('moon-icon').classList.toggle('hidden', !isDark);
}
 
function escHtml(s) {
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
 
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') { closeModal(); closeDelModal(); }
});
 
init();