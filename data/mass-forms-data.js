/* Sung Mass & High Mass content — Extraordinary Form rubrics for acolytes (two servers).
   Low Mass content remains in obrien-data.js (O'Brien, 1931).
   Sung/High rubrics follow standard EF ceremonial (Fortescue / Wapelhorst). */

const MASS_FORMS = {
  low: {
    id: 'low',
    label: 'Low Mass',
    shortLabel: 'Low',
    desc: 'Spoken Mass · 2 candles',
    intro: 'Practice Latin responses, altar movements, and parish rubrics for Low Mass.',
    guideTitle: 'Ceremonies for Low Mass with Two Altar Boys',
    source: 'How to Serve Low Mass & Benediction — Rev. William A. O\'Brien, M.A. (1931)'
  },
  sung: {
    id: 'sung',
    label: 'Sung Mass',
    shortLabel: 'Sung',
    desc: 'Missa cantata · 6 candles · choir',
    intro: 'Practice server duties for Sung Mass — acolytes, thurifer, and MC roles. Choir sings the propers; servers assist at incense and follow ceremonial.',
    guideTitle: 'Acolyte Duties at Sung Mass (Missa Cantata)',
    source: 'Extraordinary Form ceremonial — acolyte rubrics for Missa cantata with two servers'
  },
  high: {
    id: 'high',
    label: 'High Mass',
    shortLabel: 'High',
    desc: 'Solemn Mass · deacon · subdeacon · MC',
    intro: 'Practice Solemn High Mass — acolytes, thurifer, MC, Deacon, and Subdeacon. Follow the MC, hold torches at the Gospel, double genuflections, and incense.',
    guideTitle: 'Acolyte Duties at Solemn High Mass',
    source: 'Extraordinary Form ceremonial — acolyte rubrics for Missa solemnis with two servers'
  }
};

/* Step index overrides applied on top of base STEPS in index.html */
const STEP_OVERRIDES = {
  sung: {
    18: {
      referenceOnly: true,
      priest: '(The choir sings the Kyrie. The Priest may join or listen at the altar.)',
      priestT: 'Lord, have mercy — sung by choir',
      server: '(No server response — kneel erect, hands joined.)',
      serverT: 'Kneel and listen while the choir sings the Kyrie.',
      note: 'At Sung Mass the Kyrie is not recited by the servers.'
    },
    19: {
      referenceOnly: true,
      priest: '(The Gloria is sung by the choir or intoned by the Priest when prescribed.)',
      priestT: 'Glory to God in the highest — sung',
      server: '(Respond Et cum spiritu tuo only after Dominus vobiscum following the Gloria.)',
      serverT: 'Kneel during the Gloria; respond only to Dominus vobiscum.',
      note: 'Servers kneel during the sung Gloria.'
    },
    26: {
      referenceOnly: true,
      note: 'The Credo is sung by choir or intoned by the Priest — servers kneel and do not recite the full Credo aloud.'
    },
    33: {
      referenceOnly: true,
      note: 'The Sanctus is sung by the choir — servers kneel; bell is rung as at Low Mass.'
    },
    38: {
      referenceOnly: true,
      priest: '(The Agnus Dei is sung by the choir or said by the Priest.)',
      priestT: 'Lamb of God — sung',
      server: '(Kneel with the Priest; strike breast at Agnus Dei if the Priest does so.)',
      serverT: 'Usually sung by choir — join if recited.',
      note: 'At Sung Mass the Agnus Dei is typically sung by the choir.'
    }
  },
  high: {
    18: {
      referenceOnly: true,
      priest: '(The choir sings the Kyrie. The Sacred Ministers listen at the altar.)',
      priestT: 'Kyrie — sung by choir',
      server: '(No server response — kneel erect, hands joined.)',
      serverT: 'Kneel while the choir sings.',
      note: 'At Solemn Mass the Kyrie is sung by the choir.'
    },
    19: {
      referenceOnly: true,
      priest: '(The choir sings the Gloria when prescribed.)',
      server: '(Kneel — respond Et cum spiritu tuo after Dominus vobiscum.)',
      note: 'Servers kneel during the sung Gloria.'
    },
    26: {
      referenceOnly: true,
      note: 'Credo sung by choir — servers kneel.'
    },
    33: {
      referenceOnly: true,
      note: 'Sanctus sung by choir — acolyte 1 rings bell three times.'
    },
    22: {
      priest: '(The Subdeacon chants the Epistle at the altar.)',
      priestT: 'Epistle chanted by Subdeacon',
      note: 'At High Mass the Subdeacon sings the Epistle — acolytes do not transfer the missal. Still respond Deo gratias.'
    },
    24: {
      priest: '(The Deacon chants the Gospel facing north.)',
      priestT: 'Gospel chanted by Deacon',
      note: 'Hold your torch flanking the Deacon. Still respond Gloria tibi, Domine and Laus tibi, Christe.'
    },
    38: {
      referenceOnly: true,
      note: 'Agnus Dei sung by choir.'
    }
  }
};

/* Movements excluded from certain forms (id → forms to exclude from) */
const MOVEMENT_EXCLUDE = {
  ob4: ['high']  /* missal transfer at Epistle — Subdeacon reads at High Mass */
};

const SUNG_MASS_MOVEMENTS = [
  {id:'sm0', insertBefore:0, role:'both', section:'Sung Mass — Preparation',
   q:'How many candles are lighted for Sung Mass on the altar?',
   options:['Six — three on each side on the gradines','Two — as at Low Mass','Four only','None until Offertory'],
   correct:0, explain:'Sung Mass (Missa cantata) uses six candles on the altar — the large candlesticks on the gradines, three per side. Light from the tabernacle outward on each side; extinguish in reverse order.'},

  {id:'sm1', insertBefore:0, role:'both', section:'Sung Mass — Preparation',
   q:'Before Sung Mass, what should acolytes verify in the sacristy beyond the usual Low Mass setup?',
   options:['Incense, charcoal, and thurible are ready; six candles prepared','Only the two low Mass candles','Torches for the Gospel procession','Nothing extra is needed'],
   correct:0, explain:'Sung Mass typically includes incense at the Offertory (and often at other points). Ensure the thurible, boat, and lit charcoal are ready. Light six altar candles.'},

  {id:'sm2', insertBefore:18, role:'both', section:'Sung Mass — Kyrie & Gloria',
   q:'While the choir sings the Kyrie and Gloria, what do the acolytes do?',
   options:['Kneel erect with hands joined — no vocal response to the Kyrie','Recite every Kyrie with the choir','Stand at the credence','Ring the bell'],
   correct:0, explain:'At Sung Mass the choir sings the Kyrie. Acolytes kneel at their places with hands joined and do not recite the Kyrie responses.'},

  {id:'sm3', insertBefore:28, role:'both', section:'Sung Mass — Offertory & Incense',
   q:'When the thurifer incenses the acolytes at the Offertory, what do both servers do?',
   options:['Remove biretta (if worn), bow head, then replace biretta after incensation','Turn away from the altar','Remain standing with hands at sides','Leave the sanctuary'],
   correct:0, explain:'When incensed, remove the biretta with the right hand, bow the head, replace the biretta. This applies whenever a sacred minister or acolyte is incensed.'},

  {id:'sm4', insertBefore:28, role:'both', section:'Sung Mass — Offertory & Incense',
   q:'During the Offertory incensation of the altar at Sung Mass, where do the acolytes kneel?',
   options:['At their usual places on the lowest steps until the incensation is complete','On the predella beside the Priest','At the credence table','Standing at the center'],
   correct:0, explain:'Acolytes kneel at the foot of the altar on their usual side during the incensation of the altar and ministers, unless performing a specific duty.'},

  {id:'sm5', insertBefore:35, role:'both', section:'Sung Mass — Elevations',
   q:'At the elevations in Sung Mass with two acolytes, are the bell and chasuble duties the same as Low Mass?',
   options:['Yes — AC1 rings and holds chasuble; AC2 holds chasuble','No bell is used at Sung Mass','Only AC2 rings the bell','The thurifer rings the bell'],
   correct:0, explain:'Bell and chasuble duties at the consecration are the same as Low Mass: Altar Boy No. 1 holds the chasuble and rings; Altar Boy No. 2 holds the chasuble.'}
];

const HIGH_MASS_MOVEMENTS = [
  {id:'hm0', insertBefore:0, role:'both', section:'High Mass — General',
   q:'At Solemn High Mass, who directs the acolytes\' movements?',
   options:['The Master of Ceremonies (MC)','The Deacon directly','The Subdeacon','Each acolyte decides independently'],
   correct:0, explain:'At High Mass the MC directs all ministers and acolytes. Watch the MC and move only on his signal, usually a tap or gesture.'},

  {id:'hm1', insertBefore:0, role:'both', section:'High Mass — Procession',
   q:'In the solemn procession to the altar, where do the acolytes walk?',
   options:['In front of the Sacred Ministers, flanking the processional cross as directed by the MC','Behind the Priest only','They wait at the altar','At the communion rail'],
   correct:0, explain:'Acolytes typically walk in the entrance procession in front of or beside the Sacred Ministers as the MC directs, often flanking the crucifer.'},

  {id:'hm2', insertBefore:23, role:'both', section:'High Mass — Epistle',
   q:'At High Mass, who reads the Epistle and do acolytes transfer the missal?',
   options:['The Subdeacon chants it at the altar — acolytes do not transfer the missal','The Priest reads from the missal as at Low Mass','AC1 transfers the missal as usual','The Deacon reads the Epistle'],
   correct:0, explain:'The Subdeacon sings the Epistle from the altar. The missal is not transferred to the Gospel side for the Epistle at Solemn Mass.'},

  {id:'hm3', insertBefore:25, role:'ac1', section:'High Mass — Gospel',
   q:'At the Solemn Gospel, where does Altar Boy No. 1 stand with the torch?',
   options:['To the Deacon\'s left (facing north), holding the torch','On the Epistle side at the credence','Behind the Subdeacon','At the center with no torch'],
   correct:0, explain:'The Deacon chants the Gospel facing north (toward the people). Acolyte 1 holds a torch to the Deacon\'s left; Acolyte 2 to his right.'},

  {id:'hm4', insertBefore:25, role:'ac2', section:'High Mass — Gospel',
   q:'At the Solemn Gospel, where does Altar Boy No. 2 stand with the torch?',
   options:['To the Deacon\'s right (facing north), holding the torch','On the Gospel side step without a torch','At the credence','Beside the Subdeacon at the altar'],
   correct:0, explain:'Acolyte 2 holds the torch to the Deacon\'s right. Both torches remain lit until the Deacon has kissed the book and the MC directs otherwise.'},

  {id:'hm5', insertBefore:25, role:'both', section:'High Mass — Gospel',
   q:'When the Deacon sings the Gospel at High Mass, do acolytes make the sign of the cross on themselves?',
   options:['Yes — forehead, lips, and breast as the Deacon signs the book','No — only the Subdeacon signs','Only AC1 signs','They kneel with eyes downcast only'],
   correct:0, explain:'As at Low Mass, sign forehead, lips, and breast with the thumb when the Deacon signs the Gospel book. Respond Gloria tibi, Domine and Laus tibi, Christe.'},

  {id:'hm6', insertBefore:28, role:'both', section:'High Mass — Offertory',
   q:'At the Solemn Offertory, what happens before the acolytes bring the cruets?',
   options:['The altar and ministers are incensed; acolytes are incensed when the MC directs','Cruets are brought first, then incense','No incense at High Mass Offertory','Only the Priest is incensed'],
   correct:0, explain:'At High Mass the altar, cross, and ministers are incensed in the proper order before the Offertory prayers. Acolytes kneel and are incensed when the thurifer reaches them.'},

  {id:'hm7', insertBefore:35, role:'both', section:'High Mass — Elevations',
   q:'At the elevations in Solemn High Mass, what kind of genuflection do the acolytes make?',
   options:['Double genuflection — kneel briefly, rise, kneel again (three times on each knee at the consecration)','Single genuflection as at Low Mass','No genuflection — bow only','They remain standing on the predella'],
   correct:0, explain:'At High Mass a double genuflection is made at each consecration: genuflect, rise immediately, genuflect again. Bell and chasuble duties otherwise follow Low Mass custom for the acolytes on the predella.'},

  {id:'hm8', insertBefore:35, role:'both', section:'High Mass — Elevations',
   q:'During the consecration at High Mass, who incenses the Host and Chalice?',
   options:['The Deacon (or Priest) — acolytes ring bells and hold chasubles','The thurifer incenses the elevations','The MC incenses','No incense at the consecration'],
   correct:0, explain:'The Deacon incenses the Host and Chalice at the elevations while acolytes perform their usual bell and chasuble duties. The thurifer kneels at the MC\'s place.'}
];

const SUNG_PREMASS = [
  {id:'arrive', label:'Arrive in the sacristy 20–30 minutes before Mass'},
  {id:'cassock', label:'Put on cassock and surplice'},
  {id:'incense', label:'Prepare thurible, boat, and lit charcoal for incensation'},
  {id:'cruets', label:'Place wine and water cruets and Lavabo items on the credence'},
  {id:'candles6', label:'Light six altar candles — Epistle side (near tabernacle) first, outward; then Gospel side'},
  {id:'silence', label:'Observe silence in the sacristy'},
  {id:'assist', label:'Be ready to assist the MC or celebrant as directed'}
];

const HIGH_PREMASS = [
  {id:'arrive', label:'Arrive early — 30+ minutes before Solemn Mass'},
  {id:'cassock', label:'Put on cassock and surplice'},
  {id:'incense', label:'Verify thurible, boat, charcoal, and torch candles are ready'},
  {id:'cruets', label:'Place cruets and Lavabo items on the credence'},
  {id:'candles6', label:'Light six altar candles in proper order'},
  {id:'torches', label:'Check torch candles for the Gospel and procession'},
  {id:'mc', label:'Confirm duties with the MC before procession'},
  {id:'silence', label:'Observe silence in the sacristy'}
];

const SUNG_BELL_CHART = [
  {moment:'Sanctus — at "sine fine dicentes"', action:'Ring three times (AC1), then kneel — same as Low Mass.'},
  {moment:'Hanc igitur — Priest extends hands', action:'Ring once; ascend to predella as at Low Mass.'},
  {moment:'Consecration of Host & Chalice', action:'Same five steps as Low Mass — bow, ring at genuflections, hold chasuble at elevation.'},
  {moment:'Domine, non sum dignus (×3)', action:'Ring each time the Priest strikes his breast.'},
  {moment:'Note', action:'At Sung Mass with organ, bell cues may need to be clear — coordinate with the MC if present.'}
];

const HIGH_BELL_CHART = [
  {moment:'Sanctus', action:'AC1 rings three times at the Sanctus — choir sings.'},
  {moment:'Hanc igitur', action:'Ring once; ascend to predella.'},
  {moment:'Consecration', action:'Ring at genuflections and elevations; make double genuflection with the Sacred Ministers.'},
  {moment:'Domine, non sum dignus', action:'Ring at each breast-strike (three times).'},
  {moment:'Note', action:'The MC may signal timing — follow the MC if he directs a delay for the choir or organ.'}
];

const SUNG_MASS_LESSON = {
  id: 'sungOverview',
  title: 'Sung Mass — Overview for Acolytes',
  body: `Sung Mass (Missa cantata) is a Mass at which the Priest sings parts of the Ordinary and the choir sings the propers and polyphony. There is no Deacon or Subdeacon required, but ceremonial is more solemn than Low Mass.

PREPARATION — Light six candles on the gradines. Prepare incense for the Offertory. Arrive early.

PROCESSION & FOOT — Same as Low Mass for two acolytes: walk before the Priest with hands joined, receive the biretta, prayers at the foot, Confiteor responses.

KYRIE & GLORIA — The choir sings. Acolytes kneel at their places and do not recite the Kyrie. Kneel during the Gloria; respond Et cum spiritu tuo after Dominus vobiscum.

EPISTLE & GOSPEL — Same as Low Mass: AC1 transfers the missal after Deo gratias; both sign at the Gospel; same Latin responses.

OFFERTORY — Incense is used. When the thurifer incenses you, remove biretta, bow head, replace biretta. Present cruets and Lavabo as at Low Mass.

CANON — Bell and chasuble duties identical to Low Mass. Choir sings Sanctus and often Agnus Dei — kneel and listen.

COMMUNION & CLOSING — Same responses and movements as Low Mass through the Last Gospel.`
};

const HIGH_MASS_LESSON = {
  id: 'highOverview',
  title: 'High Mass — Overview for Acolytes',
  body: `Solemn High Mass (Missa solemnis) is celebrated by a Priest with Deacon and Subdeacon, assisted by a Master of Ceremonies, thurifer, and acolytes.

THE MC — Watch the MC at all times. Move only on his signal. He directs genuflections, processions, and when to bring cruets or hold torches.

PROCESSION — Enter in order as the MC directs, usually with crucifer and acolytes before the Sacred Ministers.

EPistle — The Subdeacon chants the Epistle at the altar. Acolytes do not transfer the missal. Kneel and listen; respond Deo gratias.

GOSPEL — The Deacon chants the Gospel facing north. AC1 holds a torch to the Deacon's left; AC2 to his right. Sign yourself at the Gospel; respond Gloria tibi, Domine and Laus tibi, Christe.

OFFERTORY — Full incensation of altar, cross, and ministers before cruets. Kneel when incensed. Cruets and Lavabo as at Low Mass.

CONSECRATION — Double genuflection at each elevation. AC1 rings and holds chasuble; AC2 holds chasuble. Deacon incenses the Host and Chalice.

CLOSING — Same Latin responses as Low Mass. Follow MC for recession and candle extinction (Gospel side first).`
};

const SUNG_TWO_SERVERS = {
  note: 'At Sung Mass with two acolytes, all Low Mass duties apply unless noted below. Six candles; incense at Offertory.',
  duties: [
    {when:'Before Mass', ac1:'Help light six candles', ac2:'Help prepare credence & incense'},
    {when:'Kyrie & Gloria', ac1:'Kneel — no Kyrie response', ac2:'Kneel — no Kyrie response'},
    {when:'Offertory — Incense', ac1:'Kneel when incensed; then wine cruet', ac2:'Kneel when incensed; then water cruet'},
    {when:'Sanctus through Communion', ac1:'Same as Low Mass (bell, chasuble)', ac2:'Same as Low Mass (chasuble)'}
  ],
  rules: [
    'All altar Latin responses are still made by both acolytes when the Priest speaks to them.',
    'When incensed, remove biretta, bow head, replace biretta.',
    'Six candles are used — not the two small Low Mass candlesticks alone.'
  ]
};

/* Practice roles available per mass form */
const PRACTICE_ROLES = {
  ac1: { id: 'ac1', label: 'Acolyte 1 · Senior', shortLabel: 'AC1', side: 'Epistle', hasResponses: true, forms: ['low', 'sung', 'high'] },
  ac2: { id: 'ac2', label: 'Acolyte 2 · Junior', shortLabel: 'AC2', side: 'Gospel', hasResponses: true, forms: ['low', 'sung', 'high'] },
  thurifer: { id: 'thurifer', label: 'Thurifer', shortLabel: 'Thurifer', hasResponses: false, forms: ['sung', 'high'] },
  mc: { id: 'mc', label: 'Master of Ceremonies', shortLabel: 'MC', hasResponses: false, forms: ['sung', 'high'] },
  deacon: { id: 'deacon', label: 'Deacon', shortLabel: 'Deacon', hasResponses: false, forms: ['high'] },
  subdeacon: { id: 'subdeacon', label: 'Subdeacon', shortLabel: 'Subdeacon', hasResponses: false, forms: ['high'] }
};

const THURIFER_MOVEMENTS = [
  { id: 'th0', insertBefore: 0, role: 'thurifer', section: 'Thurifer — Preparation',
    q: 'Before Mass, what must the thurifer prepare in the sacristy?',
    options: ['Lit charcoal in the thurible; fill the boat with incense; verify thurible chain and cover', 'Only light the six altar candles', 'Prepare the cruets for the acolytes', 'Nothing — the MC handles incense'],
    correct: 0, explain: 'The thurifer prepares the thurible with lit charcoal and fills the boat with incense before Mass. Check that the thurible is clean and the chain moves freely.' },

  { id: 'th1', insertBefore: 0, role: 'thurifer', section: 'Thurifer — Procession',
    q: 'In the entrance procession at Sung or High Mass, where does the thurifer walk?',
    options: ['As directed by the MC — often in front of or beside the crucifer, carrying the thurible (unlit until Offertory)', 'Behind the Sacred Ministers only', 'At the communion rail until the Gloria', 'The thurifer does not process'],
    correct: 0, explain: 'The thurifer walks in the procession as the MC directs — typically near the crucifer. The thurible is not lit for incense until the Offertory (unless otherwise directed).' },

  { id: 'th2', insertBefore: 28, role: 'thurifer', section: 'Thurifer — Offertory',
    q: 'At the Offertory, in what order does the thurifer incense at Solemn or Sung Mass?',
    options: ['Altar (center, then each side), cross, then ministers and acolytes in order set by the MC', 'Ministers first, then altar, then cross', 'Acolytes only — the Priest incenses the altar', 'Altar only — no incensation of ministers'],
    correct: 0, explain: 'Standard order: incense the altar (center, Gospel side, Epistle side), then the cross, then the Sacred Ministers and acolytes as the MC directs. Bow to each person incensed.' },

  { id: 'th3', insertBefore: 28, role: 'thurifer', section: 'Thurifer — Offertory',
    q: 'When incensing a minister or acolyte, how does the thurifer make the triple swing?',
    options: ['Two swings at chest height, one at knee height — bow to the person after the third swing', 'Three swings all at head height only', 'One swing only for acolytes', 'Swing continuously while walking past'],
    correct: 0, explain: 'The triple swing of the thurible: two at chest height, one lower (knee height). After the third swing, bow to the person incensed before moving to the next.' },

  { id: 'th4', insertBefore: 25, role: 'thurifer', section: 'Thurifer — Gospel',
    q: 'At High Mass, does the thurifer incense the Gospel book?',
    options: ['Yes — when the MC directs, incense the book before the Deacon reads (often at the altar before procession to the Gospel side)', 'No — only the Deacon handles the book', 'Only at Low Mass', 'The thurifer holds a torch instead'],
    correct: 0, explain: 'At Solemn Mass the thurifer may incense the Gospel book when directed by the MC, typically before the Deacon chants the Gospel.' },

  { id: 'th5', insertBefore: 35, role: 'thurifer', section: 'Thurifer — Canon',
    q: 'During the Canon at High Mass, where does the thurifer kneel?',
    options: ['At the MC\'s place (south side of the sanctuary floor) — thurible on the floor or held as directed', 'On the predella beside the acolytes', 'Standing at the credence', 'Behind the Subdeacon at the altar'],
    correct: 0, explain: 'At the consecration the thurifer kneels at the MC\'s place with the thurible. The Deacon (not the thurifer) incenses the Host and Chalice at the elevations.' },

  { id: 'th6', insertBefore: 47, role: 'thurifer', section: 'Thurifer — Closing',
    q: 'After Mass, what is the thurifer\'s duty regarding the thurible?',
    options: ['Empty remaining charcoal safely; clean the thurible and return it to the sacristy', 'Leave the thurible on the credence', 'Process out with the thurible still lit', 'The MC always cleans it — thurifer has no closing duty'],
    correct: 0, explain: 'After Mass the thurifer empties hot charcoal safely, cleans the thurible, and returns all incense items to their place in the sacristy.' }
];

const MC_MOVEMENTS = [
  { id: 'mc0', insertBefore: 0, role: 'mc', section: 'MC — Before Mass',
    q: 'What is the MC\'s first duty before Sung or High Mass begins?',
    options: ['Verify all ministers, servers, and vessels are ready; confirm positions with thurifer, acolytes, and choir', 'Vest the Priest only', 'Light all candles personally', 'Begin the organ prelude'],
    correct: 0, explain: 'The MC checks that every server knows his place, incense is ready, candles are lit, and the procession order is clear before the ministers enter.' },

  { id: 'mc1', insertBefore: 0, role: 'mc', section: 'MC — Procession',
    q: 'In the solemn entrance procession, where does the MC walk?',
    options: ['Beside or just ahead of the Sacred Ministers — directing pace and stops with gestures', 'At the very front ahead of the crucifer', 'At the back of the procession only', 'The MC waits at the altar and does not process'],
    correct: 0, explain: 'The MC walks near the Sacred Ministers to direct the procession — slowing, stopping for genuflections, and signaling when to ascend the altar steps.' },

  { id: 'mc2', insertBefore: 23, role: 'mc', section: 'MC — Epistle',
    q: 'At High Mass during the Epistle, what does the MC direct?',
    options: ['Subdeacon chants at the altar — MC ensures acolytes do not transfer the missal; signals when to respond Deo gratias', 'Acolyte 1 transfers the missal as at Low Mass', 'MC reads the Epistle from the Missal stand', 'MC holds the book for the Priest'],
    correct: 0, explain: 'At High Mass the Subdeacon sings the Epistle at the altar. The MC prevents the Low Mass missal transfer and cues acolytes for their responses.' },

  { id: 'mc3', insertBefore: 25, role: 'mc', section: 'MC — Gospel',
    q: 'At the Solemn Gospel, what does the MC signal the torch bearers to do?',
    options: ['Take torches and flank the Deacon facing north — hold steady until the MC directs them to leave', 'Extinguish torches before the Gospel', 'Stand at the credence during the Gospel', 'Ring the bell three times'],
    correct: 0, explain: 'The MC directs acolytes to take lit torches and flank the Deacon at the Gospel side. They hold until the Gospel is finished and the MC signals departure.' },

  { id: 'mc4', insertBefore: 28, role: 'mc', section: 'MC — Offertory',
    q: 'During the Offertory incensation, how does the MC coordinate the acolytes?',
    options: ['Signals when acolytes rise to present cruets after incensation is complete — timing with the thurifer and ministers', 'Acolytes bring cruets before any incense', 'MC carries the cruets personally', 'No coordination needed — acolytes decide'],
    correct: 0, explain: 'The MC ensures incensation finishes before signaling acolytes to ascend with cruets. He coordinates thurifer, torch bearers, and ministers throughout the Offertory.' },

  { id: 'mc5', insertBefore: 35, role: 'mc', section: 'MC — Canon',
    q: 'At the double genuflection during the consecration, what does the MC do?',
    options: ['Genuflect with the ministers on the floor — may hold the MC\'s staff; ensure acolytes make the double genuflection', 'Stand on the predella to watch the acolytes', 'Ring the bell for the acolytes', 'Incense the Host at the elevation'],
    correct: 0, explain: 'The MC genuflects on the sanctuary floor with the Sacred Ministers and verifies acolytes perform the double genuflection at each elevation.' },

  { id: 'mc6', insertBefore: 47, role: 'mc', section: 'MC — Recession',
    q: 'In the recession after High Mass, how does the MC lead?',
    options: ['Directs the order of departure — ministers, then servers — and signals when acolytes may extinguish candles (Gospel side first)', 'Leaves first before all ministers', 'Stays at the altar while servers leave alone', 'Extinguishes all candles before the recession begins'],
    correct: 0, explain: 'The MC directs the recession order and cues acolytes to extinguish candles after ministers depart — Gospel side first, then Epistle, reverse of lighting order.' }
];

const DEACON_MOVEMENTS = [
  { id: 'dc0', insertBefore: 0, role: 'deacon', section: 'Deacon — Preparation',
    q: 'Before Solemn High Mass, where does the Deacon vest and what does he verify?',
    options: ['In the sacristy with the Subdeacon — dalmatic, stole (over left shoulder), and maniple; review Gospel book placement', 'At the altar in chasuble', 'Only the Priest vests in the sacristy', 'The Deacon arrives already vested from the rectory'],
    correct: 0, explain: 'The Deacon vests in dalmatic, stole worn over the left shoulder (unlike the Priest), and maniple. He confirms the Gospel book and his place in the procession.' },

  { id: 'dc1', insertBefore: 0, role: 'deacon', section: 'Deacon — Procession',
    q: 'In the entrance procession, where does the Deacon walk?',
    options: ['Between the Subdeacon and the Priest (Celebrant) — in order of dignity as the MC directs', 'In front of the crucifer', 'Behind the acolytes at the rear', 'Alone on the Gospel side of the nave'],
    correct: 0, explain: 'Procession order (typical): thurifer/crucifer, acolytes, Subdeacon, Deacon, Priest, MC nearby. The Deacon walks directly before the Celebrant.' },

  { id: 'dc2', insertBefore: 25, role: 'deacon', section: 'Deacon — Gospel',
    q: 'When chanting the Gospel at High Mass, which direction does the Deacon face?',
    options: ['North (toward the people\'s left / liturgical north) — book held by the Subdeacon', 'East toward the altar cross only', 'South toward the choir', 'Toward the Celebrant at the altar'],
    correct: 0, explain: 'The Deacon faces north to chant the Gospel toward the people. The Subdeacon holds the book; acolytes flank with torches as the MC directs.' },

  { id: 'dc3', insertBefore: 25, role: 'deacon', section: 'Deacon — Gospel',
    q: 'Before proclaiming the Gospel, what does the Deacon do with his maniple?',
    options: ['Places it on the altar or hands it to the Subdeacon — does not wear it while reading the Gospel', 'Keeps it on his left arm throughout', 'Gives it to the thurifer', 'Places it on the Gospel book'],
    correct: 0, explain: 'The Deacon removes his maniple before reading the Gospel (placed on the altar or given to the Subdeacon) and replaces it afterward.' },

  { id: 'dc4', insertBefore: 28, role: 'deacon', section: 'Deacon — Offertory',
    q: 'At the Offertory, what is the Deacon\'s primary duty after incensation?',
    options: ['Assist the Subdeacon and Priest — hold the chalice veil or assist with the chalice as directed', 'Bring the wine and water cruets', 'Ring the bell at the Sanctus', 'Chant the Offertory verse alone'],
    correct: 0, explain: 'The Deacon assists at the Offertory — helping with the chalice, paten, and veil as the Celebrant prepares the gifts. He is incensed with the other ministers.' },

  { id: 'dc5', insertBefore: 35, role: 'deacon', section: 'Deacon — Canon',
    q: 'At the elevations during the Canon, what does the Deacon do with the thurible?',
    options: ['Incenses the Host and Chalice at each elevation with three double swings (six swings total each time)', 'Hands the thurible to the thurifer to incense', 'Kneels without incensing — only the Priest incenses', 'Incenses only the Celebrant, not the Host'],
    correct: 0, explain: 'At High Mass the Deacon incenses the consecrated Host and Chalice at each elevation — three double swings (six swings) per elevation, kneeling beside the Celebrant.' },

  { id: 'dc6', insertBefore: 39, role: 'deacon', section: 'Deacon — Communion',
    q: 'During Communion of the Sacred Ministers, what does the Deacon do?',
    options: ['Receives Communion after the Celebrant — may assist with the pall or purificator as directed', 'Distributes Communion to the faithful at the rail', 'Leaves the sanctuary during Communion', 'Chants the Communion antiphon alone always'],
    correct: 0, explain: 'The Deacon receives Communion at the altar after the Priest. He may assist with vessels and remains on the predella unless directed otherwise.' }
];

const SUBDEACON_MOVEMENTS = [
  { id: 'sd0', insertBefore: 0, role: 'subdeacon', section: 'Subdeacon — Preparation',
    q: 'What vestments does the Subdeacon wear at High Mass?',
    options: ['Tunicle and maniple — no stole; arms covered by the tunicle', 'Dalmatic and stole over both shoulders', 'Chasuble like the Celebrant', 'Cassock and surplice only'],
    correct: 0, explain: 'The Subdeacon wears the tunicle (similar to a dalmatic but without the distinctive Deacon\'s ornamentation) and maniple. He does not wear a stole.' },

  { id: 'sd1', insertBefore: 23, role: 'subdeacon', section: 'Subdeacon — Epistle',
    q: 'At High Mass, how does the Subdeacon chant the Epistle?',
    options: ['From the altar at the Epistle corner — facing the book toward the altar cross, not facing the people', 'From the pulpit facing the people', 'Walking through the nave like the Gospel', 'From the Missal stand on the Gospel side'],
    correct: 0, explain: 'The Subdeacon chants the Epistle at the altar (Epistle side), facing the book toward the cross — unlike the Gospel which is chanted facing north.' },

  { id: 'sd2', insertBefore: 25, role: 'subdeacon', section: 'Subdeacon — Gospel',
    q: 'During the Solemn Gospel, what does the Subdeacon hold?',
    options: ['The Gospel book for the Deacon — standing to the Deacon\'s left (facing north)', 'A torch like the acolytes', 'The thurible', 'The paten only'],
    correct: 0, explain: 'The Subdeacon holds the Gospel book for the Deacon during the proclamation. He stands on the Deacon\'s left side as the Deacon faces north.' },

  { id: 'sd3', insertBefore: 28, role: 'subdeacon', section: 'Subdeacon — Offertory',
    q: 'What does the Subdeacon carry in the Offertory procession to the altar?',
    options: ['The chalice (veiled) and paten — held veiled on the humeral veil over his shoulders', 'The wine and water cruets', 'The thurible', 'The processional cross'],
    correct: 0, explain: 'The Subdeacon carries the chalice and paten veiled on the humeral veil, held by both hands under the veil — a sign of reverence for the sacred vessels.' },

  { id: 'sd4', insertBefore: 35, role: 'subdeacon', section: 'Subdeacon — Canon',
    q: 'During the Canon, what does the Subdeacon hold and where does he stand?',
    options: ['The paten (veiled) at chest height — standing at the Celebrant\'s left on the predella', 'The Gospel book at the MC\'s place', 'A torch at the Gospel side', 'Nothing — kneels on the floor with the MC'],
    correct: 0, explain: 'From the Offertory through Communion the Subdeacon holds the paten veiled at chest height, standing on the predella at the Celebrant\'s left — a distinctive duty of the Subdeacon at High Mass.' },

  { id: 'sd5', insertBefore: 39, role: 'subdeacon', section: 'Subdeacon — Communion',
    q: 'When may the Subdeacon consume the ablutions at High Mass?',
    options: ['After the Celebrant and Deacon — if no other ordained minister is present to assist; otherwise he does not consume', 'Always before the Deacon', 'Never under any circumstances', 'Before the Canon begins'],
    correct: 0, explain: 'The Subdeacon may consume the ablutions only when necessary (no other ordained assistant). Normally the Deacon or another priest assists with ablutions.' }
];

const HIGH_TWO_SERVERS = {
  note: 'At Solemn High Mass the MC directs acolytes. Torch duties at Gospel; no missal transfer at Epistle.',
  duties: [
    {when:'Procession', ac1:'As MC directs — often with torch or flanking cross', ac2:'As MC directs'},
    {when:'Epistle', ac1:'Kneel — Subdeacon reads', ac2:'Kneel — no missal transfer'},
    {when:'Gospel', ac1:'Torch at Deacon\'s left', ac2:'Torch at Deacon\'s right'},
    {when:'Offertory', ac1:'Incensed; wine cruet', ac2:'Incensed; water cruet'},
    {when:'Elevations', ac1:'Bell, chasuble, double genuflection', ac2:'Chasuble, double genuflection'},
    {when:'Last Gospel', ac1:'Biretta (as Low Mass)', ac2:'—'}
  ],
  rules: [
    'Follow the MC — do not move without his signal.',
    'Double genuflection at each consecration.',
    'Hold torches steadily at the Gospel until the MC directs you to extinguish or depart.',
    'All spoken Latin responses at the altar are still made by both acolytes.'
  ]
};

function getFormMeta(form){
  return MASS_FORMS[form] || MASS_FORMS.low;
}

function getStepOverride(form, idx){
  const o = STEP_OVERRIDES[form];
  return o && o[idx] ? o[idx] : null;
}

function getRolesForForm(form){
  return Object.values(PRACTICE_ROLES).filter(r => r.forms.includes(form)).map(r => r.id);
}

function getRoleMeta(role){
  return PRACTICE_ROLES[role] || PRACTICE_ROLES.ac1;
}

function roleHasResponses(role){
  return getRoleMeta(role).hasResponses !== false;
}

function normalizeRole(form, role){
  const roles = getRolesForForm(form);
  return roles.includes(role) ? role : roles[0];
}

function movementMatchesRole(m, role){
  if(m.roles) return m.roles.includes(role);
  if(m.role === 'both') return role === 'ac1' || role === 'ac2';
  return m.role === role;
}

function getMovementRoleTag(mq){
  if(mq.role === 'both') return 'Both Acolytes';
  const meta = getRoleMeta(mq.role);
  return meta ? meta.label : mq.role;
}

function getMovementsForForm(form){
  let list = O_BRIEN_MOVEMENTS.filter(m=>{
    const ex = MOVEMENT_EXCLUDE[m.id];
    if(ex && ex.includes(form)) return false;
    return true;
  });
  if(form === 'sung' || form === 'high') list = list.concat(SUNG_MASS_MOVEMENTS);
  if(form === 'high') list = list.concat(HIGH_MASS_MOVEMENTS);
  if(form === 'sung' || form === 'high') list = list.concat(THURIFER_MOVEMENTS, MC_MOVEMENTS);
  if(form === 'high') list = list.concat(DEACON_MOVEMENTS, SUBDEACON_MOVEMENTS);
  return list;
}

function getPremassForForm(form){
  if(form === 'sung') return SUNG_PREMASS;
  if(form === 'high') return HIGH_PREMASS;
  return O_BRIEN_PREMASS;
}

function getBellChartForForm(form){
  if(form === 'sung') return SUNG_BELL_CHART;
  if(form === 'high') return HIGH_BELL_CHART;
  return O_BRIEN_BELL_CHART;
}

function getTwoServersForForm(form){
  if(form === 'sung') return SUNG_TWO_SERVERS;
  if(form === 'high') return HIGH_TWO_SERVERS;
  return O_BRIEN_TWO_SERVERS;
}

function getFormLesson(form){
  if(form === 'sung') return SUNG_MASS_LESSON;
  if(form === 'high') return HIGH_MASS_LESSON;
  return null;
}
