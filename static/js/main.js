const BADGE_MAP = {
  'UI Design':   { bg:'#ede9ff', color:'#3525CD',  label:'UI Design'   },
  'Development': { bg:'#ecfdf5', color:'#065f46',  label:'Development' },
  'Research':    { bg:'#fff7ed', color:'#9a3412',  label:'Research'    },
  'Front End':   { bg:'#fdf4ff', color:'#7e22ce',  label:'Front End'   },
};
const DASH_BADGE = {
  Backend:  { bg:'#ede9fe', c:'#5b21b6' },
  Design:   { bg:'#ede9ff', c:'#5B4FE9' },
  Priority: { bg:'#fff3e0', c:'#c2410c' },
  Meeting:  { bg:'#f3f4f6', c:'#4b5563' },
};

let kanbanTasks = [];
let dashTasks = [];
let nextTaskId = 200, modalTargetStatus = 'todo';

const PAGES = ['dashboard','mytasks','calendar','members'];

function goTo(page) {
  PAGES.forEach(p => {
    document.getElementById('page-'+p).classList.remove('active');
    const sb = document.getElementById('nav-'+p);
    if (sb) sb.classList.remove('active');
    const bn = document.getElementById('bnav-'+p);
    if (bn) bn.classList.remove('active');
  });
  document.getElementById('page-'+page).classList.add('active');
  const sb = document.getElementById('nav-'+page);
  if (sb) sb.classList.add('active');
  const bn = document.getElementById('bnav-'+page);
  if (bn) bn.classList.add('active');

  if (page==='dashboard') renderDash();
  if (page==='mytasks')   renderKanban();
  if (page==='calendar')  renderCal();
  if (page==='members')   loadMembers();
  closeSidebar();
}

function openSidebar() {
  document.getElementById('sidebar').classList.add('open');
  document.getElementById('sidebar-backdrop').style.display = 'block';
}
function closeSidebar() {
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('sidebar-backdrop').style.display = 'none';
}

function renderDash() {
  const list = document.getElementById('dash-task-list');
  document.getElementById('dash-task-count').textContent = dashTasks.filter(t=>!t.done).length;
  list.innerHTML = dashTasks.map(t => {
    const b = DASH_BADGE[t.cat] || DASH_BADGE.Meeting;
    return `<div class="flex items-center gap-3 px-4 md:px-5 py-3 border-b border-gray-50 hover:bg-gray-50 transition-colors">
      <div onclick="toggleDash(${t.id})" class="w-5 h-5 rounded-md border-2 flex items-center justify-center cursor-pointer flex-shrink-0 transition-all ${t.done?'bg-brand-500 border-brand-500':'border-gray-300'}">
        ${t.done?'<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>':''}
      </div>
      <div class="flex-1 min-w-0">
        <p class="text-sm font-medium truncate ${t.done?'line-through text-gray-400':'text-gray-900'}">${esc(t.title)}</p>
        <p class="text-[11px] text-gray-400">${esc(t.sub)}${t.time?' · Due '+esc(t.time):''}</p>
      </div>
      <span class="text-[10px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap hidden xs:inline-block" style="background:${b.bg};color:${b.c}">${esc(t.cat)}</span>
      <button onclick="deleteDash(${t.id})" class="text-gray-300 hover:text-red-400 transition-colors flex-shrink-0"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/></svg></button>
    </div>`;
  }).join('');
}

function toggleDash(id){const t=dashTasks.find(x=>x.id===id);if(t){t.done=!t.done;renderDash();}}
function deleteDash(id){dashTasks=dashTasks.filter(x=>x.id!==id);renderDash();}

function renderKanban() {
  ['todo','inprog','done'].forEach(s => {
    const items = kanbanTasks.filter(t=>t.status===s);
    document.getElementById('count-'+s).textContent = items.length;
    document.getElementById('col-'+s).innerHTML = items.map(renderKCard).join('');
  });
}

function renderKCard(t) {
  const tag = BADGE_MAP[t.tag] || { bg:'#f3f4f6', color:'#4b5563', label:t.tag };
  const isDone = t.status === 'done';
  const avHtml = t.avatars.map((a,i)=>`<img src="https://api.dicebear.com/7.x/avataaars/svg?${a}" class="w-6 h-6 rounded-full border-2 border-white${i?' -ml-2':''}" alt="">`).join('');
  const infoHtml = t.infoIcon==='clock'
    ? `<div class="flex items-center gap-1 text-[11px] text-gray-400"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>${esc(t.info)}</div>`
    : t.infoIcon==='chat'
    ? `<div class="flex items-center gap-1 text-[11px] text-gray-400"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 0-2 2z"/></svg>${esc(t.info)}</div>`
    : t.infoIcon==='mic'
    ? `<div class="flex items-center gap-1 text-[11px] text-gray-400"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>${esc(t.info)}</div>` : '';
  const liveBadge = t.live ? `<span class="flex items-center gap-1 text-[10px] font-bold text-red-500"><span class="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>LIVE</span>` : '';
  const urgentBadge = t.urgent ? `<div class="flex items-center gap-1 text-[11px] font-bold text-amber-500"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>URGENT</div>` : '';
  const progBar = t.live ? `<div class="mt-2 mb-1 h-1 bg-gray-100 rounded-full overflow-hidden"><div class="h-full bg-brand-400 rounded-full" style="width:65%"></div></div>` : '';

  return `<div class="kcard group">
    <div class="flex items-center justify-between mb-2">
      <span class="kcard-tag" style="background:${tag.bg};color:${tag.color}">${esc(tag.label)}</span>
      <div class="flex items-center gap-2">
        ${liveBadge}
        <button onclick="deleteKTask(${t.id})" class="opacity-0 group-hover:opacity-100 transition-opacity text-gray-300 hover:text-red-400"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/></svg></button>
      </div>
    </div>
    <p class="font-bold text-gray-900 text-sm leading-snug mb-1 ${isDone?'line-through text-gray-400':''}">${esc(t.title)}</p>
    ${t.desc?`<p class="text-[12px] text-gray-400 leading-relaxed mb-2">${esc(t.desc)}</p>`:''}
    ${progBar}
    <div class="flex items-center justify-between mt-2">
      <div class="flex items-center">${avHtml}</div>
      <div class="flex items-center gap-2">${urgentBadge}${infoHtml}</div>
    </div>
  </div>`;
}

async function deleteKTask(id) {
  await fetch(`/task/${id}`, { method: "DELETE" });
  kanbanTasks = kanbanTasks.filter(t=>t.id!==id);
  dashTasks = dashTasks.filter(t=>t.id!==id);
  renderKanban();
  renderDash();
}

let calYear=2026, calMonth=5;
const MONTH_NAMES=['January','February','March','April','May','June','July','August','September','October','November','December'];
const CAL_EVENTS = {
  '2026-5-2':  [{ label:'API Review',  bg:'#ede9ff', c:'#5B4FE9' }],
  '2026-5-11': [{ label:'Sprint Demo', bg:'#e0f7fa', c:'#00838f' },{ label:'Design Sync', bg:'#ede9ff', c:'#5B4FE9' }],
};

function renderCal() {
  document.getElementById('cal-month-label').textContent = MONTH_NAMES[calMonth]+' '+calYear;
  const grid = document.getElementById('cal-grid');
  const first = new Date(calYear,calMonth,1).getDay();
  const offset = first===0?6:first-1;
  const dim = new Date(calYear,calMonth+1,0).getDate();
  const prev = new Date(calYear,calMonth,0).getDate();
  const total = Math.ceil((offset+dim)/7)*7;
  let html='', day=1, nd=1;
  for(let i=0;i<total;i++){
    if(i<offset){ html+=`<div class="cal-day other">${prev-offset+i+1}</div>`; }
    else if(day<=dim){
      const key=`${calYear}-${calMonth}-${day}`;
      const evs=CAL_EVENTS[key]||[];
      const isSel=(calYear===2026&&calMonth===5&&day===11);
      const isTod=(calYear===2026&&calMonth===5&&day===8);
      let cls='cal-day';
      if(isTod) cls+=' today';
      if(isSel) cls+=' !bg-brand-50';
      const border = isSel?'style="outline:2px solid #7c6ff7;outline-offset:-2px;"':'';
      const dayNum = isSel?`<span class="font-bold text-brand-500">${day}</span>`:`<span>${day}</span>`;
      const evHtml=evs.map(e=>`<div class="cal-event" style="background:${e.bg};color:${e.c}">${e.label}</div>`).join('');
      html+=`<div class="${cls}" ${border}>${dayNum}${evHtml}</div>`;
      day++;
    } else { html+=`<div class="cal-day other">${nd++}</div>`; }
  }
  grid.innerHTML=html;
}
function calPrev(){calMonth--;if(calMonth<0){calMonth=11;calYear--;}renderCal();}
function calNext(){calMonth++;if(calMonth>11){calMonth=0;calYear++;}renderCal();}

function openTaskModal(status='todo'){
  modalTargetStatus=status;
  document.getElementById('m-title').value='';
  document.getElementById('m-desc').value='';
  document.getElementById('m-status').value=status;
  const m=document.getElementById('task-modal'),b=document.getElementById('task-modal-box');
  m.classList.remove('opacity-0','pointer-events-none');m.classList.add('opacity-100');
  b.classList.remove('translate-y-3','opacity-0');b.classList.add('translate-y-0','opacity-100');
  setTimeout(()=>document.getElementById('m-title').focus(),120);
}
function closeTaskModal(){
  const m=document.getElementById('task-modal'),b=document.getElementById('task-modal-box');
  m.classList.remove('opacity-100');m.classList.add('opacity-0');
  b.classList.remove('translate-y-0','opacity-100');b.classList.add('translate-y-3','opacity-0');
  setTimeout(()=>m.classList.add('pointer-events-none'),200);
}
function handleModalBd(e){if(e.target.id==='task-modal')closeTaskModal();}

async function saveNewTask() {
  const title = document.getElementById('m-title').value.trim();
  if (!title) { document.getElementById('m-title').focus(); return; }
  const tag = document.getElementById('m-tag').value;
  const status = document.getElementById('m-status').value;
  const desc = document.getElementById('m-desc').value.trim();

  const response = await fetch("/task", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, description: desc, assigned_to: "" })
  });

  const newTask = await response.json();
  kanbanTasks.push({
    id: newTask.id, status, tag, title, desc,
    avatars: ["seed=new&backgroundColor=b6e3f4"],
    info: "", infoIcon: "", urgent: false, live: false
  });
  dashTasks.push({ id: newTask.id, title, sub: tag, time: "", cat: "Design", done: false });
  closeTaskModal();
  renderKanban();
  renderDash();
}

function openMemberModal() {
  document.getElementById('mem-name').value = '';
  document.getElementById('mem-username').value = '';
  document.getElementById('mem-role').value = '';
  const m = document.getElementById('member-modal'), b = document.getElementById('member-modal-box');
  m.classList.remove('opacity-0', 'pointer-events-none'); m.classList.add('opacity-100');
  b.classList.remove('translate-y-3', 'opacity-0'); b.classList.add('translate-y-0', 'opacity-100');
  setTimeout(() => document.getElementById('mem-name').focus(), 120);
}

function closeMemberModal() {
  const m = document.getElementById('member-modal'), b = document.getElementById('member-modal-box');
  m.classList.remove('opacity-100'); m.classList.add('opacity-0');
  b.classList.remove('translate-y-0', 'opacity-100'); b.classList.add('translate-y-3', 'opacity-0');
  setTimeout(() => m.classList.add('pointer-events-none'), 200);
}

function handleMemberModalBd(e) { if (e.target.id === 'member-modal') closeMemberModal(); }

async function saveMember() {
  const name = document.getElementById('mem-name').value.trim();
  const username = document.getElementById('mem-username').value.trim();
  const role = document.getElementById('mem-role').value.trim();
  const department = document.getElementById('mem-dept').value;

  if (!name || !username) {
    document.getElementById('mem-name').focus();
    return;
  }

  await fetch("/members/add", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, username, role, department })
  });

  closeMemberModal();
  loadMembers();
}

async function loadMembers() {
  const response = await fetch("/members");
  const data = await response.json();
  const grid = document.querySelector('#page-members .grid.grid-cols-1');
  if (!grid) return;

  grid.innerHTML = data.users.map(u => `
    <div class="bg-white rounded-2xl p-4 shadow-sm">
      <div class="flex items-start justify-between mb-3">
        <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=${u.username}&backgroundColor=b6e3f4" class="w-11 h-11 rounded-full" alt="">
        <button onclick="deleteMember('${u.username}')" class="text-gray-300 hover:text-red-400">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/></svg>
        </button>
      </div>
      <p class="font-bold text-gray-900 text-sm">${esc(u.name || u.username)}</p>
      <p class="text-[12px] text-gray-400 mb-2">${esc(u.role || 'Member')}</p>
      <div class="flex flex-wrap gap-1 mb-3">
        <span class="badge" style="background:#ede9ff;color:#5B4FE9">${esc(u.department || 'Engineering')}</span>
      </div>
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-1.5">
          <div class="status-dot dot-active"></div>
          <span class="text-[11px] text-green-600 font-semibold">Active</span>
        </div>
      </div>
    </div>
  `).join('') + `
    <div class="dashed-add min-h-[160px]" onclick="openMemberModal()">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
      <p class="font-semibold text-sm">Add New Member</p>
      <p class="text-[11px] text-center">Expand your team</p>
    </div>
  `;
}

function showConfirm(message) {
  return new Promise(resolve => {
    const modal = document.createElement('div');
    modal.innerHTML = `
      <div class="fixed inset-0 bg-black/40 backdrop-blur-sm z-[200] flex items-center justify-center p-5">
        <div class="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full text-center">
          <div class="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/></svg>
          </div>
          <h3 class="font-bold text-gray-900 text-lg mb-2">Delete Member</h3>
          <p class="text-gray-500 text-sm mb-6">${message}</p>
          <div class="flex gap-3">
            <button id="confirm-cancel" class="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-semibold text-sm hover:bg-gray-50">Cancel</button>
            <button id="confirm-ok" class="flex-1 py-2.5 rounded-xl bg-red-500 text-white font-semibold text-sm hover:bg-red-600">Delete</button>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
    modal.querySelector('#confirm-ok').onclick = () => { document.body.removeChild(modal); resolve(true); };
    modal.querySelector('#confirm-cancel').onclick = () => { document.body.removeChild(modal); resolve(false); };
  });
}

async function deleteMember(username) {
  const confirmed = await showConfirm(`Are you sure you want to remove <strong>${username}</strong> from the team?`);
  if (!confirmed) return;
  await fetch(`/members/${username}`, { method: "DELETE" });
  loadMembers();
}

function esc(s){return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
document.addEventListener('keydown',e=>{if(e.key==='Escape'){closeTaskModal();closeMemberModal();}});

fetch("/task")
  .then(r => r.json())
  .then(data => {
    kanbanTasks = data.task.map(t => ({
      id: t.id,
      status: t.status === "À faire" ? "todo" : t.status === "En cours" ? "inprog" : "done",
      tag: "Development",
      title: t.title,
      desc: t.description || "",
      avatars: ["seed=u1&backgroundColor=b6e3f4"],
      info: "", infoIcon: "", urgent: false, live: false
    }));
    dashTasks = data.task.map(t => ({
      id: t.id,
      title: t.title,
      sub: "Development",
      time: "",
      cat: "Design",
      done: t.status === "Terminé"
    }));
    goTo('dashboard');
    document.querySelector('#topbar input').addEventListener('input', function() {
  const q = this.value.toLowerCase();
  const cards = document.querySelectorAll('#page-members .bg-white.rounded-2xl');
  cards.forEach(card => {
    const name = card.querySelector('p.font-bold');
    if (name) {
      card.style.display = name.textContent.toLowerCase().includes(q) ? '' : 'none';
    }
  });
});
  });