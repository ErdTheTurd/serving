/* Schedule + profile backend — localStorage only (this device). */

const SCHEDULE_POINTS = { serve: 10, pickup: 5, trade: 3 };

let scheduleCache = [];
let profileCache = { id: 'local', name: '', avatarUrl: '', points: 0, massesServed: 0 };
let scheduleStatus = 'This device only';

function lsGet(key, fallback){
  try{ return localStorage.getItem(key) || fallback; }catch(e){ return fallback; }
}
function lsSet(key, val){
  try{ localStorage.setItem(key, val); }catch(e){}
}
function lsGetJSON(key, fallback){
  try{ const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; }catch(e){ return fallback; }
}
function lsSetJSON(key, val){
  try{ localStorage.setItem(key, JSON.stringify(val)); }catch(e){}
}

function readFileAsDataURL(file){
  return new Promise((resolve, reject)=>{
    const r = new FileReader();
    r.onload = ()=> resolve(r.result);
    r.onerror = ()=> reject(new Error('Could not read image'));
    r.readAsDataURL(file);
  });
}

function buildSeedSlots(){
  const slots = [];
  const times = [
    {t:'7:30 AM', label:'Low Mass'},
    {t:'12:10 PM', label:'Low Mass'},
    {t:'6:30 PM', label:'Low Mass'}
  ];
  const base = new Date();
  base.setHours(0,0,0,0);
  for(let d=0; d<14; d++){
    const day = new Date(base);
    day.setDate(day.getDate() + d);
    const dow = day.getDay();
    const dayTimes = dow === 0 ? [times[0], times[1], times[2]] : (dow === 6 ? [times[0], times[2]] : [times[0], times[1]]);
    dayTimes.forEach(({t, label})=>{
      const id = `mass-${day.toISOString().slice(0,10)}-${t.replace(/[: ]/g,'')}`;
      slots.push({
        id, date: day.toISOString().slice(0,10), time: t, label,
        priest: 'Fr. FSSP', ac1: null, ac2: null, served: false
      });
    });
  }
  return slots;
}

function loadProfileLocal(){
  return lsGetJSON('altar_profile', {
    id: 'local', name: lsGet('altar_serverName', ''), avatarUrl: '', points: 0, massesServed: 0
  });
}
function saveProfileLocal(p){
  lsSetJSON('altar_profile', p);
  profileCache = p;
}

function loadScheduleLocal(){
  return lsGetJSON('altar_schedule', null);
}
function saveScheduleLocal(slots){
  lsSetJSON('altar_schedule', slots);
  scheduleCache = slots;
}

function seedScheduleLocalIfEmpty(){
  if(loadScheduleLocal()) return;
  saveScheduleLocal(buildSeedSlots());
}

function getScheduleStatus(){ return scheduleStatus; }
function loadProfile(){ return profileCache; }
function loadSchedule(){ return scheduleCache; }

function isScheduleAdmin(){ return true; }

function formatSchedDate(iso){
  const d = new Date(iso + 'T12:00:00');
  return d.toLocaleDateString(undefined, {weekday:'short', month:'short', day:'numeric'});
}

function isPastSlot(slot){
  const [h,m] = slot.time.replace(' AM','').replace(' PM','').split(':').map(Number);
  let hr = h;
  if(slot.time.includes('PM') && h !== 12) hr += 12;
  if(slot.time.includes('AM') && h === 12) hr = 0;
  const dt = new Date(slot.date + 'T' + String(hr).padStart(2,'0') + ':' + String(m).padStart(2,'0') + ':00');
  return dt < new Date();
}

function slotAssignee(slot, role){ return slot[role] || null; }

function isMySlot(slot, role){
  const s = slotAssignee(slot, role);
  return s && (s.id === 'me' || s.id === profileCache.id);
}

function myDisplayName(){
  return profileCache.name || 'You';
}

async function initScheduleBackend(){
  seedScheduleLocalIfEmpty();
  scheduleCache = loadScheduleLocal() || [];
  profileCache = loadProfileLocal();
  scheduleStatus = 'Saved on this device';
}

async function saveProfileName(name){
  profileCache.name = name;
  lsSet('altar_serverName', name);
  saveProfileLocal(profileCache);
  scheduleCache.forEach(s=>{
    ['ac1','ac2'].forEach(r=>{ if(isMySlot(s,r) && s[r]) s[r].name = name || 'You'; });
  });
  saveScheduleLocal(scheduleCache);
}

async function saveProfileAvatar(file){
  if(!file || !file.type.startsWith('image/')) throw new Error('Choose an image file');
  if(file.size > 512000) throw new Error('Image must be under 512 KB');
  profileCache.avatarUrl = await readFileAsDataURL(file);
  saveProfileLocal(profileCache);
  return true;
}

async function claimSlot(slotId, role){
  const slot = scheduleCache.find(s=> s.id === slotId);
  if(!slot || slotAssignee(slot, role)) return false;
  slot[role] = { id: 'me', name: myDisplayName(), tradeOffer: false };
  saveScheduleLocal(scheduleCache);
  return true;
}

async function cancelSlot(slotId, role){
  const slot = scheduleCache.find(s=> s.id === slotId);
  if(!slot) return false;
  if(!isMySlot(slot, role) && !isScheduleAdmin()) return false;
  slot[role] = null;
  saveScheduleLocal(scheduleCache);
  return true;
}

async function offerTrade(slotId, role){
  const slot = scheduleCache.find(s=> s.id === slotId);
  if(!slot || !isMySlot(slot, role)) return false;
  slot[role].tradeOffer = true;
  saveScheduleLocal(scheduleCache);
  return true;
}

async function withdrawTrade(slotId, role){
  const slot = scheduleCache.find(s=> s.id === slotId);
  if(!slot || !isMySlot(slot, role)) return false;
  slot[role].tradeOffer = false;
  saveScheduleLocal(scheduleCache);
  return true;
}

async function takeTrade(slotId, role){
  const slot = scheduleCache.find(s=> s.id === slotId);
  const cur = slotAssignee(slot, role);
  if(!slot || !cur || !cur.tradeOffer || isMySlot(slot, role)) return false;
  profileCache.points = (profileCache.points || 0) + SCHEDULE_POINTS.pickup;
  saveProfileLocal(profileCache);
  slot[role] = { id: 'me', name: myDisplayName(), tradeOffer: false };
  saveScheduleLocal(scheduleCache);
  return true;
}

async function markMassServed(slotId){
  const slot = scheduleCache.find(s=> s.id === slotId);
  if(!slot || slot.served) return false;
  if(!isMySlot(slot,'ac1') && !isMySlot(slot,'ac2') && !isScheduleAdmin()) return false;
  slot.served = true;
  if(isMySlot(slot,'ac1') || isMySlot(slot,'ac2')){
    profileCache.points = (profileCache.points || 0) + SCHEDULE_POINTS.serve;
    profileCache.massesServed = (profileCache.massesServed || 0) + 1;
    saveProfileLocal(profileCache);
  }
  saveScheduleLocal(scheduleCache);
  return true;
}

async function adminAddSlot({ date, time, label, priest }){
  const id = `mass-${date}-${time.replace(/[: ]/g,'')}-${Date.now()}`;
  const slot = { id, date, time, label: label || 'Low Mass', priest: priest || 'Fr. FSSP', ac1: null, ac2: null, served: false };
  scheduleCache.push(slot);
  saveScheduleLocal(scheduleCache);
  return slot;
}

async function adminDeleteSlot(slotId){
  scheduleCache = scheduleCache.filter(s=> s.id !== slotId);
  saveScheduleLocal(scheduleCache);
}

async function adminClearRole(slotId, role){
  return cancelSlot(slotId, role);
}

function getMyUpcomingSlots(){
  return scheduleCache.filter(s=> !s.served && (isMySlot(s,'ac1') || isMySlot(s,'ac2')) && !isPastSlot(s));
}

function getTradeBoard(){
  return scheduleCache.filter(s=>{
    if(s.served || isPastSlot(s)) return false;
    const a1 = slotAssignee(s,'ac1');
    const a2 = slotAssignee(s,'ac2');
    return (a1 && a1.tradeOffer && !isMySlot(s,'ac1')) || (a2 && a2.tradeOffer && !isMySlot(s,'ac2')) || !a1 || !a2;
  });
}

async function resetDemoScheduleLocal(){
  lsSetJSON('altar_schedule', null);
  seedScheduleLocalIfEmpty();
  scheduleCache = loadScheduleLocal() || [];
}
