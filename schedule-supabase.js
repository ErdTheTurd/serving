/* Schedule + profile backend: Supabase when available, localStorage fallback. */

const SCHEDULE_POINTS = { serve: 10, pickup: 5, trade: 3 };

let sbClient = null;
let scheduleCache = [];
let profileCache = { id: null, name: '', points: 0, massesServed: 0 };
let myUserId = null;
let scheduleBackend = 'local'; // 'supabase' | 'local'
let scheduleStatus = 'Connecting…';
let scheduleChannel = null;

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

function rowToSlot(row){
  return {
    id: row.id,
    date: row.mass_date,
    time: row.mass_time,
    label: row.label,
    priest: row.priest,
    ac1: row.ac1_id ? { id: row.ac1_id, name: row.ac1_name || 'Server', tradeOffer: !!row.ac1_trade_offer } : null,
    ac2: row.ac2_id ? { id: row.ac2_id, name: row.ac2_name || 'Server', tradeOffer: !!row.ac2_trade_offer } : null,
    served: !!row.served
  };
}

function slotToRow(slot){
  return {
    id: slot.id,
    mass_date: slot.date,
    mass_time: slot.time,
    label: slot.label,
    priest: slot.priest,
    ac1_id: slot.ac1?.id || null,
    ac1_name: slot.ac1?.name || null,
    ac1_trade_offer: slot.ac1?.tradeOffer || false,
    ac2_id: slot.ac2?.id || null,
    ac2_name: slot.ac2?.name || null,
    ac2_trade_offer: slot.ac2?.tradeOffer || false,
    served: slot.served
  };
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
    id: 'local', name: lsGet('altar_serverName', ''), points: 0, massesServed: 0
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

function getScheduleBackend(){ return scheduleBackend; }
function getScheduleStatus(){ return scheduleStatus; }
function loadProfile(){ return profileCache; }
function loadSchedule(){ return scheduleCache; }

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
  if(!s) return false;
  if(scheduleBackend === 'supabase') return s.id === myUserId;
  return s.id === 'me' || s.id === myUserId;
}

function myDisplayName(){
  return profileCache.name || 'You';
}

async function refreshFromSupabase(){
  const { data: slots, error: sErr } = await sbClient.from('mass_slots').select('*').order('mass_date').order('mass_time');
  if(sErr) throw sErr;
  scheduleCache = (slots || []).map(rowToSlot);

  const { data: prof, error: pErr } = await sbClient.from('profiles').select('*').eq('id', myUserId).maybeSingle();
  if(pErr) throw pErr;
  if(prof){
    profileCache = {
      id: prof.id,
      name: prof.display_name || lsGet('altar_serverName', ''),
      points: prof.points || 0,
      massesServed: prof.masses_served || 0
    };
  }
}

async function seedSupabaseIfEmpty(){
  const { count, error } = await sbClient.from('mass_slots').select('*', { count: 'exact', head: true });
  if(error) throw error;
  if(count > 0) return;
  const rows = buildSeedSlots().map(slotToRow);
  const { error: insErr } = await sbClient.from('mass_slots').insert(rows);
  if(insErr) throw insErr;
}

async function updateSlotRow(slotId, patch){
  const { error } = await sbClient.from('mass_slots').update(patch).eq('id', slotId);
  if(error) throw error;
}

async function updateProfilePatch(patch){
  const { error } = await sbClient.from('profiles').update({ ...patch, updated_at: new Date().toISOString() }).eq('id', myUserId);
  if(error) throw error;
}

function subscribeSchedule(){
  if(!sbClient || scheduleChannel) return;
  scheduleChannel = sbClient.channel('mass_slots_live')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'mass_slots' }, ()=>{
      refreshFromSupabase().then(()=>{ if(typeof window.onScheduleUpdated === 'function') window.onScheduleUpdated(); }).catch(()=>{});
    })
    .subscribe();
}

async function initScheduleBackend(){
  seedScheduleLocalIfEmpty();
  scheduleCache = loadScheduleLocal() || [];
  profileCache = loadProfileLocal();

  if(typeof supabase === 'undefined' || typeof SUPABASE_URL === 'undefined'){
    scheduleBackend = 'local';
    scheduleStatus = 'Offline — using this device only';
    return;
  }

  try{
    sbClient = supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
    let { data: { session } } = await sbClient.auth.getSession();
    if(!session){
      const { data, error } = await sbClient.auth.signInAnonymously();
      if(error) throw error;
      session = data.session;
    }
    myUserId = session.user.id;
    scheduleBackend = 'supabase';
    scheduleStatus = 'Live — synced with parish schedule';

    await seedSupabaseIfEmpty();
    await refreshFromSupabase();
    subscribeSchedule();

    const savedName = lsGet('altar_serverName', '');
    if(savedName && !profileCache.name){
      await updateProfilePatch({ display_name: savedName });
      profileCache.name = savedName;
    }
  }catch(e){
    console.warn('Supabase schedule fallback:', e.message || e);
    scheduleBackend = 'local';
    scheduleStatus = e.message?.includes('anonymous') || e.message?.includes('Anonymous')
      ? 'Enable Anonymous Auth in Supabase, then refresh'
      : 'Offline — run supabase/schema.sql in SQL Editor, then refresh';
    scheduleCache = loadScheduleLocal() || [];
    profileCache = loadProfileLocal();
  }
}

async function saveProfileName(name){
  profileCache.name = name;
  lsSet('altar_serverName', name);
  if(scheduleBackend === 'supabase'){
    await updateProfilePatch({ display_name: name });
    const slots = scheduleCache.filter(s=> isMySlot(s,'ac1') || isMySlot(s,'ac2'));
    for(const slot of slots){
      const patch = {};
      if(isMySlot(slot,'ac1')) patch.ac1_name = name || 'You';
      if(isMySlot(slot,'ac2')) patch.ac2_name = name || 'You';
      await updateSlotRow(slot.id, patch);
    }
    await refreshFromSupabase();
  } else {
    saveProfileLocal(profileCache);
    scheduleCache.forEach(s=>{
      ['ac1','ac2'].forEach(r=>{ if(isMySlot(s,r) && s[r]) s[r].name = name || 'You'; });
    });
    saveScheduleLocal(scheduleCache);
  }
}

async function claimSlot(slotId, role){
  const slot = scheduleCache.find(s=> s.id === slotId);
  if(!slot || slotAssignee(slot, role)) return false;
  const assign = { id: scheduleBackend === 'supabase' ? myUserId : 'me', name: myDisplayName(), tradeOffer: false };
  if(scheduleBackend === 'supabase'){
    await updateSlotRow(slotId, {
      [`${role}_id`]: myUserId,
      [`${role}_name`]: assign.name,
      [`${role}_trade_offer`]: false
    });
    await refreshFromSupabase();
  } else {
    slot[role] = assign;
    saveScheduleLocal(scheduleCache);
  }
  return true;
}

async function cancelSlot(slotId, role){
  const slot = scheduleCache.find(s=> s.id === slotId);
  if(!slot || !isMySlot(slot, role)) return false;
  if(scheduleBackend === 'supabase'){
    await updateSlotRow(slotId, { [`${role}_id`]: null, [`${role}_name`]: null, [`${role}_trade_offer`]: false });
    await refreshFromSupabase();
  } else {
    slot[role] = null;
    saveScheduleLocal(scheduleCache);
  }
  return true;
}

async function offerTrade(slotId, role){
  const slot = scheduleCache.find(s=> s.id === slotId);
  if(!slot || !isMySlot(slot, role)) return false;
  if(scheduleBackend === 'supabase'){
    await updateSlotRow(slotId, { [`${role}_trade_offer`]: true });
    await refreshFromSupabase();
  } else {
    slot[role].tradeOffer = true;
    saveScheduleLocal(scheduleCache);
  }
  return true;
}

async function withdrawTrade(slotId, role){
  const slot = scheduleCache.find(s=> s.id === slotId);
  if(!slot || !isMySlot(slot, role)) return false;
  if(scheduleBackend === 'supabase'){
    await updateSlotRow(slotId, { [`${role}_trade_offer`]: false });
    await refreshFromSupabase();
  } else {
    slot[role].tradeOffer = false;
    saveScheduleLocal(scheduleCache);
  }
  return true;
}

async function takeTrade(slotId, role){
  const slot = scheduleCache.find(s=> s.id === slotId);
  const cur = slotAssignee(slot, role);
  if(!slot || !cur || !cur.tradeOffer || isMySlot(slot, role)) return false;
  if(scheduleBackend === 'supabase'){
    profileCache.points = (profileCache.points || 0) + SCHEDULE_POINTS.pickup;
    await updateProfilePatch({ points: profileCache.points });
    await updateSlotRow(slotId, {
      [`${role}_id`]: myUserId,
      [`${role}_name`]: myDisplayName(),
      [`${role}_trade_offer`]: false
    });
    await refreshFromSupabase();
  } else {
    profileCache.points = (profileCache.points || 0) + SCHEDULE_POINTS.pickup;
    saveProfileLocal(profileCache);
    slot[role] = { id: 'me', name: myDisplayName(), tradeOffer: false };
    saveScheduleLocal(scheduleCache);
  }
  return true;
}

async function markMassServed(slotId){
  const slot = scheduleCache.find(s=> s.id === slotId);
  if(!slot || slot.served) return false;
  if(!isMySlot(slot,'ac1') && !isMySlot(slot,'ac2')) return false;
  if(scheduleBackend === 'supabase'){
    profileCache.points = (profileCache.points || 0) + SCHEDULE_POINTS.serve;
    profileCache.massesServed = (profileCache.massesServed || 0) + 1;
    await updateProfilePatch({ points: profileCache.points, masses_served: profileCache.massesServed });
    await updateSlotRow(slotId, { served: true });
    await refreshFromSupabase();
  } else {
    slot.served = true;
    profileCache.points = (profileCache.points || 0) + SCHEDULE_POINTS.serve;
    profileCache.massesServed = (profileCache.massesServed || 0) + 1;
    saveProfileLocal(profileCache);
    saveScheduleLocal(scheduleCache);
  }
  return true;
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
