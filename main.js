/* ══ DATA ══ */
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

let kanbanTasks = [
  { id:1, status:'todo',   tag:'UI Design',   title:'Revamp dashboard bento grid',       desc:'Update the main container layout to support fluid column wrapping on ultra-wide monitors.', avatars:['seed=t1&backgroundColor=b6e3f4','seed=t2&backgroundColor=ffdfbf'], info:'2d left', infoIcon:'clock', urgent:false, live:false },
  { id:2, status:'todo',   tag:'Research',    title:'User accessibility audit',           desc:'Test all color contrasts against WCAG 2.1 standards for dark mode compatibility.',          avatars:['seed=t3&backgroundColor=ffd5dc'],                                  info:'9',      infoIcon:'chat',  urgent:false, live:false },
  { id:3, status:'inprog', tag:'Development', title:'API Integration: Stripe Connect',   desc:'',  avatars:['seed=t4&backgroundColor=b6e3f4'], info:'3', infoIcon:'mic',  urgent:false, live:true  },
  { id:4, status:'inprog', tag:'UI Design',   title:'Mobile Navigation Shell',           desc:'Implementing the fixed BottomNavBar logic for transactional screens.', avatars:['seed=t5&backgroundColor=b6e3f4','seed=t6&backgroundColor=ffdfbf'], info:'', infoIcon:'', urgent:true, live:false },
  { id:5, status:'done',   tag:'Front End',   title:'System-wide font update',           desc:'Migrated all components from entire dashboard.', avatars:['seed=t7&backgroundColor=d1f4e0'], info:'', infoIcon:'', urgent:false, live:false },
  { id:6, status:'done',   tag:'Front End',   title:'Onboarding flow V1',                desc:'', avatars:['seed=t8&backgroundColor=ffd5dc'], info:'', infoIcon:'', urgent:false, live:false },
];

let dashTasks = [
  { id:1, title:'Refactor Authentication Middleware', sub:'Architecture', time:'10:00 AM', cat:'Backend',  done:true  },
  { id:2, title:'Design System Documentation',       sub:'UI/UX',        time:'2:00 PM',  cat:'Design',   done:false },
  { id:3, title:'Prepare API Endpoints for CodeArena',sub:'Feature Dev.',time:'4:30 PM',  cat:'Priority', done:false },
  { id:4, title:'Weekly Team Sync',  sub:'Management', time:'5:00 PM', cat:'Meeting', done:false },
  { id:5, title:'Weekly Team Sync',  sub:'Management', time:'5:00 PM', cat:'Meeting', done:false },
  { id:6, title:'Weekly Team Sync',  sub:'Management', time:'5:00 PM', cat:'Meeting', done:false },
  { id:7, title:'Weekly Team Sync',  sub:'Management', time:'5:00 PM', cat:'Meeting', done:false },
  { id:8, title:'Weekly Team Sync',  sub:'Management', time:'5:00 PM', cat:'Meeting', done:false },
];

let nextTaskId = 200, modalTargetStatus = 'todo';

/* ══ PAGES ══ */
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
  closeSidebar();
}

/* ══ SIDEBAR (mobile drawer) ══ */
function openSidebar() {
  document.getElementById('sidebar').classList.add('open');
  document.getElementById('sidebar-backdrop').style.display = 'block';
}
function closeSidebar() {
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('sidebar-backdrop').style.display = 'none';
}

/* ══ DASHBOARD ══ */
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

/* ══ KANBAN ══ */
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
  const avHtml = t.avatars.map((a,i)=>`<img src="https://api.dicebear.com/7.x/avataaars/svg?${a}" class="w-6 h-6 rounded-full border-2 border-white${i?'-ml-2':''}" alt="">`).join('');
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
function deleteKTask(id){kanbanTasks=kanbanTasks.filter(t=>t.id!==id);renderKanban();}

/* ══ CALENDAR ══ */
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

/* ══ MODAL ══ */
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
function saveNewTask(){
  const title=document.getElementById('m-title').value.trim();
  if(!title){document.getElementById('m-title').focus();return;}
  const tag=document.getElementById('m-tag').value;
  const status=document.getElementById('m-status').value;
  const desc=document.getElementById('m-desc').value.trim();
  kanbanTasks.push({id:nextTaskId++,status,tag,title,desc,avatars:['seed=new&backgroundColor=b6e3f4'],info:'',infoIcon:'',urgent:false,live:false});
  dashTasks.push({id:nextTaskId++,title,sub:tag,time:'',cat:'Design',done:false});
  closeTaskModal();renderKanban();renderDash();
}

function esc(s){return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeTaskModal();});

goTo('dashboard');

fetch("/task")