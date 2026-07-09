/* Schedule + profile backend: Supabase when available, localStorage fallback. */

const SCHEDULE_POINTS = { serve: 10, pickup: 5, trade: 3 };
const ADMIN_EMAILS = ['erdunn706@gmail.com', 'froneill@fssp.com'];

let sbClient = null;
let scheduleCache = [];
let profileCache = { id: null, name: '', email: '', avatarUrl: '', points: 0, massesServed: 0 };
let myUserId = null;
let authSession = null;
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

function readFileAsDataURL(file){
  return new Promise((resolve, reject)=>{
    const r = new FileReader();
    r.onload = ()=> resolve(r.result);
    r.onerror = ()=> reject(new Error('Could not read image'));
    r.readAsDataURL(file);
  });
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
    id: 'local', name: lsGet('altar_serverName', ''), email: '', avatarUrl: '', points: 0, massesServed: 0
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
function getAuthEmail(){ return (profileCache.email || authSession?.user?.email || '').toLowerCase(); }

function isScheduleAdmin(){
  const email = getAuthEmail();
  return ADMIN_EMAILS.includes(email);
}

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

function applyProfileFromRow(prof, session){
  if(!prof) return;
  profileCache = {
    id: prof.id,
    name: prof.display_name || lsGet('altar_serverName', ''),
    email: (session?.user?.email || profileCache.email || '').toLowerCase(),
    avatarUrl: prof.avatar_url || profileCache.avatarUrl || '',
    points: prof.points || 0,
    massesServed: prof.masses_served || 0
  };
}

async function refreshFromSupabase(){
  const { data: slots, error: sErr } = await sbClient.from('mass_slots').select('*').order('mass_date').order('mass_time');
  if(sErr) throw sErr;
  scheduleCache = (slots || []).map(rowToSlot);

  const { data: { session } } = await sbClient.auth.getSession();
  authSession = session;
  myUserId = session?.user?.id || myUserId;

  const { data: prof, error: pErr } = await sbClient.from('profiles').select('*').eq('id', myUserId).maybeSingle();
  if(pErr) throw pErr;
  if(prof) applyProfileFromRow(prof, session);
  else if(session?.user?.email) profileCache.email = session.user.email.toLowerCase();
}

async function seedSupabaseIfEmpty(){
  const payload = buildSeedSlots().map(s=>({
    id: s.id, date: s.date, time: s.time, label: s.label, priest: s.priest
  }));
  const { error } = await sbClient.rpc('seed_mass_slots_if_empty', { slots: payload });
  if(error) throw error;
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

function getAuthRedirectUrl(){
  return window.location.origin + window.location.pathname;
}

async function handleAuthCallback(){
  if(!sbClient) return null;
  const url = new URL(window.location.href);
  const code = url.searchParams.get('code');
  if(code){
    const { data, error } = await sbClient.auth.exchangeCodeForSession(code);
    if(error) throw formatAuthError(error);
    authSession = data.session;
    myUserId = data.session?.user?.id || myUserId;
    if(data.session?.user?.email) profileCache.email = data.session.user.email.toLowerCase();
    lsSet('altar_pendingEmail', '');
    lsSet('altar_authPending', '');
    window.history.replaceState({}, '', url.pathname);
    return data.session;
  }
  if(window.location.hash.includes('access_token')){
    await sbClient.auth.getSession();
    window.history.replaceState({}, '', url.pathname);
  }
  return null;
}

function getPendingSignInEmail(){ return lsGet('altar_pendingEmail', ''); }
function getAuthPending(){ return lsGet('altar_authPending', ''); }
function clearPendingSignInEmail(){
  lsSet('altar_pendingEmail', '');
  lsSet('altar_authPending', '');
}

function formatAuthError(error){
  const msg = (error && (error.message || error.msg || error.error_description)) || 'Authentication failed';
  const id = error && error.error_id;
  const suffix = id ? ` (log: ${id})` : '';
  if(/Error sending confirmation|unexpected_failure|500/i.test(msg)){
    return new Error(
      'Could not send email. Verify fsspserve.com in Resend, set Supabase sender to no-reply@fsspserve.com, ' +
      'SMTP smtp.resend.com:587 user resend password re_ API key. Check Resend → Logs.' + suffix
    );
  }
  if(/email not confirmed/i.test(msg)) return new Error('Confirm your email first — click the link we sent you.' + suffix);
  if(/rate limit|too many/i.test(msg)) return new Error('Too many attempts — wait a few minutes.' + suffix);
  if(/invalid login|invalid credentials/i.test(msg)) return new Error('Wrong email or password, or email not yet confirmed.' + suffix);
  if(/already registered|already exists/i.test(msg)) return new Error('Account exists — sign in instead.' + suffix);
  return new Error(msg + suffix);
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
    sbClient = supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
      auth: { persistSession: true, detectSessionInUrl: true, flowType: 'pkce' }
    });
    sbClient.auth.onAuthStateChange((event, session)=>{
      authSession = session;
      if(session?.user?.email) profileCache.email = session.user.email.toLowerCase();
      if((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && typeof window.onScheduleUpdated === 'function'){
        window.onScheduleUpdated();
      }
    });

    try{ await handleAuthCallback(); }catch(e){ console.warn('Auth callback:', e.message); }

    let { data: { session } } = await sbClient.auth.getSession();
    if(session?.user?.email){
      authSession = session;
      myUserId = session.user.id;
      profileCache.email = session.user.email.toLowerCase();
    } else {
      if(!session){
        const { data, error } = await sbClient.auth.signInAnonymously();
        if(error) throw error;
        session = data.session;
      }
      authSession = session;
      myUserId = session.user.id;
    }
    scheduleBackend = 'supabase';
    scheduleStatus = isScheduleAdmin()
      ? 'Live — admin schedule control'
      : 'Live — synced with parish schedule';

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

async function signUpWithEmail(email, password){
  if(scheduleBackend !== 'supabase') throw new Error('Sign-in requires Supabase');
  const normalized = email.trim().toLowerCase();
  if(!normalized.includes('@')) throw new Error('Enter a valid email');
  if(!password || password.length < 8) throw new Error('Password must be at least 8 characters');
  await sbClient.auth.signOut();
  const { data, error } = await sbClient.auth.signUp({
    email: normalized,
    password,
    options: { emailRedirectTo: getAuthRedirectUrl() }
  });
  if(error) throw formatAuthError(error);
  lsSet('altar_pendingEmail', normalized);
  lsSet('altar_authPending', 'signup');
  if(data.session){
    authSession = data.session;
    myUserId = data.session.user.id;
    profileCache.email = normalized;
    lsSet('altar_pendingEmail', '');
    lsSet('altar_authPending', '');
    await refreshFromSupabase();
  }
  return normalized;
}

async function signInWithEmail(email){
  if(scheduleBackend !== 'supabase') throw new Error('Sign-in requires Supabase');
  const normalized = email.trim().toLowerCase();
  if(!normalized.includes('@')) throw new Error('Enter a valid email');
  const { error } = await sbClient.auth.signInWithOtp({
    email: normalized,
    options: { shouldCreateUser: false, emailRedirectTo: getAuthRedirectUrl() }
  });
  if(error) throw formatAuthError(error);
  lsSet('altar_pendingEmail', normalized);
  lsSet('altar_authPending', 'signin');
  return normalized;
}

async function verifyEmailOtp(email, token){
  if(scheduleBackend !== 'supabase') throw new Error('Sign-in requires Supabase');
  const normalized = email.trim().toLowerCase();
  const code = token.trim().replace(/\D/g, '');
  if(code.length < 6) throw new Error('Enter the 6-digit code from your email');
  const { data, error } = await sbClient.auth.verifyOtp({ email: normalized, token: code, type: 'email' });
  if(error) throw formatAuthError(error);
  authSession = data.session;
  myUserId = data.session.user.id;
  profileCache.email = (data.session.user.email || normalized).toLowerCase();
  lsSet('altar_pendingEmail', '');
  lsSet('altar_authPending', '');
  scheduleStatus = isScheduleAdmin() ? 'Live — admin schedule control' : 'Live — synced with parish schedule';
  await refreshFromSupabase();
  return true;
}

async function signInWithPassword(email, password){
  if(scheduleBackend !== 'supabase') throw new Error('Sign-in requires Supabase');
  const normalized = email.trim().toLowerCase();
  if(!normalized.includes('@')) throw new Error('Enter a valid email');
  if(!password) throw new Error('Enter your password');
  await sbClient.auth.signOut();
  const { data, error } = await sbClient.auth.signInWithPassword({ email: normalized, password });
  if(error){
    await sbClient.auth.signInAnonymously().catch(()=>{});
    throw formatAuthError(error);
  }
  authSession = data.session;
  myUserId = data.session.user.id;
  profileCache.email = normalized;
  lsSet('altar_pendingEmail', '');
  lsSet('altar_authPending', '');
  scheduleStatus = isScheduleAdmin() ? 'Live — admin schedule control' : 'Live — synced with parish schedule';
  await refreshFromSupabase();
  return true;
}

async function signOutUser(){
  if(scheduleBackend !== 'supabase') return;
  await sbClient.auth.signOut();
  const { data, error } = await sbClient.auth.signInAnonymously();
  if(error) throw error;
  authSession = data.session;
  myUserId = data.session.user.id;
  profileCache.email = '';
  await refreshFromSupabase();
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

async function saveProfileAvatar(file){
  if(!file || !file.type.startsWith('image/')) throw new Error('Choose an image file');
  if(file.size > 512000) throw new Error('Image must be under 512 KB');

  if(scheduleBackend === 'supabase'){
    const ext = (file.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg';
    const path = `${myUserId}/avatar.${ext}`;
    const { error: upErr } = await sbClient.storage.from('avatars').upload(path, file, { upsert: true, contentType: file.type });
    if(upErr) throw upErr;
    const { data: { publicUrl } } = sbClient.storage.from('avatars').getPublicUrl(path);
    const bustUrl = `${publicUrl}?t=${Date.now()}`;
    await updateProfilePatch({ avatar_url: bustUrl });
    profileCache.avatarUrl = bustUrl;
  } else {
    profileCache.avatarUrl = await readFileAsDataURL(file);
    saveProfileLocal(profileCache);
  }
  return true;
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
  if(!slot) return false;
  if(!isMySlot(slot, role) && !isScheduleAdmin()) return false;
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
  if(!isMySlot(slot,'ac1') && !isMySlot(slot,'ac2') && !isScheduleAdmin()) return false;
  if(scheduleBackend === 'supabase'){
    if(isMySlot(slot,'ac1') || isMySlot(slot,'ac2')){
      profileCache.points = (profileCache.points || 0) + SCHEDULE_POINTS.serve;
      profileCache.massesServed = (profileCache.massesServed || 0) + 1;
      await updateProfilePatch({ points: profileCache.points, masses_served: profileCache.massesServed });
    }
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

async function adminAddSlot({ date, time, label, priest }){
  if(!isScheduleAdmin()) throw new Error('Admin sign-in required');
  const id = `mass-${date}-${time.replace(/[: ]/g,'')}-${Date.now()}`;
  const slot = { id, date, time, label: label || 'Low Mass', priest: priest || 'Fr. FSSP', ac1: null, ac2: null, served: false };
  if(scheduleBackend === 'supabase'){
    const { error } = await sbClient.from('mass_slots').insert(slotToRow(slot));
    if(error) throw error;
    await refreshFromSupabase();
  } else {
    scheduleCache.push(slot);
    saveScheduleLocal(scheduleCache);
  }
  return slot;
}

async function adminDeleteSlot(slotId){
  if(!isScheduleAdmin()) throw new Error('Admin sign-in required');
  if(scheduleBackend === 'supabase'){
    const { error } = await sbClient.from('mass_slots').delete().eq('id', slotId);
    if(error) throw error;
    await refreshFromSupabase();
  } else {
    scheduleCache = scheduleCache.filter(s=> s.id !== slotId);
    saveScheduleLocal(scheduleCache);
  }
}

async function adminUpdateSlot(slotId, { date, time, label, priest }){
  if(!isScheduleAdmin()) throw new Error('Admin sign-in required');
  const patch = {};
  if(date) patch.mass_date = date;
  if(time) patch.mass_time = time;
  if(label) patch.label = label;
  if(priest) patch.priest = priest;
  if(scheduleBackend === 'supabase'){
    const { error } = await sbClient.from('mass_slots').update(patch).eq('id', slotId);
    if(error) throw error;
    await refreshFromSupabase();
  } else {
    const slot = scheduleCache.find(s=> s.id === slotId);
    if(!slot) return;
    if(date) slot.date = date;
    if(time) slot.time = time;
    if(label) slot.label = label;
    if(priest) slot.priest = priest;
    saveScheduleLocal(scheduleCache);
  }
}

async function adminClearRole(slotId, role){
  if(!isScheduleAdmin()) throw new Error('Admin sign-in required');
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
