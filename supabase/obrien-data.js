/* Source: How to Serve Low Mass & Benediction — Rev. William A. O'Brien, M.A. (Angelus Press / Benziger, 1931) */

const O_BRIEN_SOURCE = "How to Serve Low Mass & Benediction — Rev. William A. O'Brien, M.A.";

const O_BRIEN_SACRISTY = {
  intro: "The sacristy is the place where the priests prepare and vest for Mass. Become familiar with your sacristy so that you will know just where everything belongs, as each thing has its proper place. You should arrive here a few minutes before Mass. Immediately put on your cassock and surplice, place the cruets of wine and water, the finger bowl and towel on the credence table and light the two lowest candles, one on each side of the tabernacle beginning with the one on the Epistle side. While in the sacristy always observe silence and be ever ready to give any assistance requested.",
  items: [
    {n:1, name:"The Lavabo, or Lavatory", desc:"Towel rack where the priest washes his hands before beginning to vest for Mass."},
    {n:2, name:"The Vesting Table", desc:"Vestments laid out in order as the priest puts them on. Frequently has drawers and closets for vestments, linens, missals. A crucifix is generally at the head. A card with prayers for vesting or for the Bishop's intention."},
    {n:3, name:"The Sacrarium", desc:"Basin used to wash the chalice, ciborium, sacred vessels, and linens. Has a drain to the ground. Altar boys may not touch the sacrarium or sacred vessels on account of reverence."},
    {n:4, name:"Cabinets and closets", desc:"Used to hang vestments of all kinds. Sometimes contain drawers for vestments laid flat and albs."},
    {n:5, name:"Storage cabinet", desc:"Usually steel; holds censer, incense boat, holy water pot (aspersorium), incense, tapers, etc."},
    {n:6, name:"Safe", desc:"Steel safe for chalice, ostensorium (monstrance), church record books, and other valuables."},
    {n:7, name:"Kneeling bench (Prie-Dieu)", desc:"Used by the priest for prayers in preparation for Mass or thanksgiving after Mass."}
  ],
  candles: "When lighting the two candles for the usual low Mass, always light the one nearest the tabernacle on the Epistle side first. If more than two candles are to be lighted, light them in order toward the end. Then go to the Gospel side and light the one nearest the tabernacle on that side. When extinguishing, reverse the order — the first one lighted is the last one extinguished."
};

const O_BRIEN_CHALICE = [
  "Spread the purificator over the top of the chalice.",
  "Place the paten bearing the host on top.",
  "Set the pall (linen-covered card) on top.",
  "Cover all with the chalice veil.",
  "Put the burse containing the corporal upon the covered chalice."
];

const O_BRIEN_VESTMENTS = [
  {name:"Amice", desc:"Linen cloth placed on the shoulders first."},
  {name:"Alb", desc:"Long white linen garment."},
  {name:"Cincture", desc:"Cord tied around the waist; hand to priest with tassels at the right. See that the alb hangs evenly."},
  {name:"Maniple", desc:"Worn on the left arm."},
  {name:"Stole", desc:"Worn around the neck."},
  {name:"Chasuble", desc:"Outer vestment; raise the back so the priest may tie the ribbons."}
];

const O_BRIEN_SANCTUARY = [
  {n:1, name:"Crucifix"},
  {n:2, name:"Canopy or Throne of the Altar"},
  {n:3, name:"Tabernacle", desc:"Covered by veil (color of the day or white)."},
  {n:"4-9", name:"Large Candlesticks", desc:"Lighted only for High Mass and Benediction."},
  {n:"10-11", name:"Small Candlesticks", desc:"Lighted only for Low Mass."},
  {n:"12-14", name:"Altar Cards", desc:"Center card: Offertory and Canon prayers. Epistle side: Lavabo prayer. Gospel side: Gospel of St. John (Last Gospel)."},
  {n:"15-16", name:"Gradines (Candlebenches)", desc:"First for smaller candlestick; second for larger."},
  {n:17, name:"Mensa or Altar Table"},
  {n:18, name:"Altar Coverings", desc:"Three linen cloths and wax cloth; top linen often lace-edged."},
  {n:19, name:"Antependium or Frontal", desc:"Colored cloth hanging in front of the altar."},
  {n:20, name:"Gospel Side of the Altar"},
  {n:21, name:"Epistle Side of the Altar"},
  {n:22, name:"Sanctuary Floor"},
  {n:"23-24", name:"Altar Steps"},
  {n:25, name:"Predella or Footpace", desc:"Altar platform."},
  {n:26, name:"Credence Table"},
  {n:"27-29", name:"Wine and water cruets, finger basin, towel"},
  {n:30, name:"Communion Paten"},
  {n:31, name:"Sedilia or Priests' Bench"},
  {n:32, name:"Bell"},
  {n:33, name:"Communion Rail"}
];

const O_BRIEN_POSTURES = [
  {name:"Genuflecting", desc:"Body and head erect. Right knee touching floor, in line with left ankle."},
  {name:"Kneeling", desc:"Body and head erect. Hands before breast, palms joined."},
  {name:"Simple Bow", desc:"Body and shoulders erect, head slightly bent forward."},
  {name:"Profound Bow", desc:"Body erect. Head and shoulders bent forward."}
];

const O_BRIEN_TWO_SERVERS = {
  note: "All ceremonies are the same as when one boy serves Mass, with the following exceptions. These directions are merely suggestive, as customs differ in various places under different circumstances. However, they are in general in conformity with the rules given by approved liturgical authors.",
  duties: [
    {when:"At the Beginning of Mass", ac1:"Receives biretta", ac2:"—"},
    {when:"At the Epistle", ac1:"Transfers the Missal", ac2:"—"},
    {when:"At the Offertory", ac1:"Presents the wine", ac2:"Presents the water"},
    {when:"At the Lavabo", ac1:"Presents the towel", ac2:"Pours the water"},
    {when:"At the Sanctus", ac1:"Rings the bell", ac2:"—"},
    {when:"At the Hanc igitur", ac1:"Rings the bell", ac2:"—"},
    {when:"At the Elevation", ac1:"Holds chasuble and rings bell", ac2:"Holds chasuble"},
    {when:"At Domine, non sum dignus", ac1:"Rings the bell", ac2:"—"},
    {when:"After the Priest's Communion", ac1:"Pours the wine", ac2:"Pours the water"},
    {when:"At the Changing of Missal and Veil", ac1:"Transfers the Veil", ac2:"Transfers the Missal"},
    {when:"If Missal is to be Transferred for Last Gospel", ac1:"—", ac2:"Transfers the Missal"},
    {when:"At the Last Gospel", ac1:"Brings biretta", ac2:"—"},
    {when:"At Communion at the Altar (if given)", ac1:"Acts as directed (see pp. 45–46)", ac2:"Kneels on the Gospel side step"}
  ],
  rules: [
    "All responses are made by both boys.",
    "All genuflections are made by both boys.",
    "Whenever a duty is to be performed by one or both boys, both boys proceed to the center of the altar and genuflect on the floor before and after the action."
  ]
};

const O_BRIEN_LESSONS = [
  {id:"I", title:"Lesson I — From the Beginning of Mass to the Introit", body:`When the priest gives the signal, bow with him to the crucifix and walk before him to the altar with your hands joined palm to palm on your breast. If there is a holy water font at the door, dip the fingers of your right hand in it and touch the tips of the priest's outstretched fingers and then bless yourself. If there is a bell at the sacristy door, ring it to warn the people of the entrance of the priest.

On arriving at the altar, stand a little to the right of the priest, take his biretta by the nearest peak, genuflect with him, place the biretta on the sedilia, come back to the center of the altar steps, genuflect and move about two feet to the Gospel side. Remain standing (or kneel at once on the floor where customary) until the priest descends to begin Mass. Then kneel on the floor, with head erect and hands joined, palm to palm, and make the sign of the cross with the priest.

THE PRAYERS AT THE FOOT OF THE ALTAR — Remain kneeling erect while the priest bows low and says the Confiteor. As the priest says the last words of the Confiteor — "ad Dominum Deum nostrum" — bow your head slightly, turn toward the priest and say Misereatur tui. Then bow head and shoulders low toward the altar for your Confiteor, turning toward the priest at "et tibi, Pater" and "et te, Pater." Strike your breast three times at mea culpa, mea culpa, mea maxima culpa.

Arise at once (where it is customary, lift the priest's alb a little as he goes up the steps), genuflect in the center, go to the Gospel side and kneel on the lowest step. Keep hands folded throughout the Mass except when otherwise occupied.`},
  {id:"II", title:"Lesson II — From the Introit to the Offertory", body:`The priest ascends the steps, goes to the missal at the Epistle side (right) and reads the Introit. Make the sign of the cross with him. You are opposite the missal — this is the rule all through the rest of the Mass.

At Kyrie and Christe, answer each invocation. After the Gloria (when said), respond Et cum spiritu tuo to Dominus vobiscum. At Per omnia saecula saeculorum answer Amen.

THE EPISTLE — When the priest finishes the Epistle (signal: turns head or drops left hand on altar), say Deo gratias. Rise, walk to the Epistle side, genuflect at center, go up side steps, wait on step below platform. Take firm hold of missal stand, turn left, descend front steps diagonally to floor, genuflect, ascend diagonally to Gospel side, place missal turned partly toward tabernacle, stand on first step below platform facing priest.

NOTE: In some places the missal is transferred by descending side steps, passing center, genuflecting, and ascending Gospel side steps. This custom is approved.

THE GOSPEL — Respond Et cum spiritu tuo. Sign forehead, lips, and breast with thumb as priest signs missal. Respond Gloria tibi, Domine. Bow to priest, turn right, descend to floor, walk to Epistle side genuflecting at center. Remain standing during Gospel. At end say Laus tibi, Christe and kneel on lowest step. Bow head when priest genuflects at et incarnatus est during Credo.`},
  {id:"III", title:"Lesson III — From the Offertory to the Canon", body:`When the priest uncovers the chalice, arise without genuflecting, go to credence. Take wine cruet in right hand, water cruet in left, go up side steps facing Gospel side.

Present cruets with slight bow, kissing each cruet before presenting and after receiving back. Each cruet is presented with the right hand; transfer water cruet from left to right as priest takes wine.

For Lavabo: finger towel over left arm, basin in left hand, water cruet in right. Pour water over priest's fingers; turn slightly right for towel. Replace items on credence, return to Epistle side without genuflecting, kneel erect.

At Orate, fratres wait until priest faces altar, bow head and shoulders slightly, respond Suscipiat Dominus.

At Preface respond Amen, Et cum spiritu tuo, Habemus ad Dominum, Dignum et justum est. At Sanctus ring bell three times, fold hands, kneel erect.`},
  {id:"IV", title:"Lesson IV — From the Canon to the Communion", body:`At Hanc igitur when priest extends hands over chalice, ring bell once. Rise, go to middle, genuflect, ascend, kneel on edge of platform a little to the right of the priest.

CONSECRATION OF THE HOST — Bow profoundly and ring bell as priest genuflects; kneeling erect, slightly raise lower end of chasuble with left hand, ring bell again and look at Host as priest elevates; when Host is placed on altar let go of chasuble and ring bell as priest genuflects again.

CONSECRATION OF THE CHALICE — Same five steps: (1) bow profoundly; (2) ring as priest genuflects; (3) raise chasuble with left hand, ring with right at elevation; (4) let go as chalice is placed; (5) ring as priest genuflects.

Rise, go down to center, genuflect, return to Epistle side kneeling as before. At Per omnia saecula saeculorum answer Amen. At end of Pater Noster respond Sed libera nos a malo. At Pax Domini respond Et cum spiritu tuo. Strike breast at Agnus Dei with priest.

At Domine, non sum dignus ring bell each time priest strikes his breast (three times).`},
  {id:"V", title:"Lesson V — From the Communion to the End of Mass", body:`After Communion prayers at center, respond Et cum spiritu tuo and Amen at Per omnia saecula saeculorum. At Ite, missa est or Benedicamus Domino always answer Deo gratias.

If missal was left open, rise, genuflect at middle, transfer missal to Gospel side as after Epistle.

At final blessing kneel, bow head, bless yourself with priest's triple blessing and respond Amen.

At Last Gospel respond Et cum spiritu tuo, Gloria tibi, Domine, and at end Deo gratias. Go to center, genuflect, bring priest's biretta from sedilia, stand Epistle side during Gospel. Precede priest to sacristy; profound bow with priest to crucifix. Help unvest if wished. Extinguish candles Gospel side first.`}
];

const O_BRIEN_PHONETICS = {
  "Ad Deum qui laetificat juventutem meam.": "Odd day'oom kwee lay-tee'fee-cot / you-ven-too'tem may'ahm.",
  "Quia tu es, Deus, fortitudo mea: quare me repulisti, et quare tristis incedo, dum affligit me inimicus?": "Kwee'ah too ez day'oose / for-tee-too'doe may'ah / kwah'ray may ray-poo-lees'tee / ett kwah'ray triss'tiss in-chay'doe / doom ah-flee'jit may in-ee-mee'coose?",
  "Et introibo ad altare Dei: ad Deum qui laetificat juventutem meam.": "Ett int-tro-ee'boe odd ahl-tah'ray day'ee / odd day'oom kwee lay-tee'fee-cot / you-ven-too'tem may'ahm.",
  "Spera in Deo, quoniam adhuc confitebor illi: salutare vultus mei, et Deus meus.": "Spay'rah in day'oh / kwoe'nee-ahm ahd'hook con-fee-tay'bor ill'lee / sah-loo-tah'ray vul'toose may'ee / ett day'oose may'oose.",
  "Sicut erat in principio, et nunc, et semper: et in saecula saeculorum. Amen.": "See'coot err'rot in prin-chee'pee-oh / ett noonk / ett sem'pair / ett in say'coo-lah say-coo-loh'room. Ah-men'.",
  "Qui fecit coelum et terram.": "Kwee fay'chit chay'loom ett ter'rahm.",
  "Misereatur tui omnipotens Deus, et, dimissis peccatis tuis, perducat te ad vitam aeternam.": "Mee-zay-ray-ah'toor too'ee om-nee'poe-tenz day'oose / ett dee-mee'seese pay-kah'teese too'eese / per-doo'cot tay ahd vee'tahm ay-tair'nahm.",
  "Amen.": "Ah-men'.",
  "Et plebs tua laetabitur in te.": "Ett playbs too'ah lay-tah'bee-toor in tay.",
  "Et salutare tuum da nobis.": "Ett sah-loo-tah'ray too'oom dah no'beese.",
  "Et clamor meus ad te veniat.": "Ett clah'more may'oose odd tay vay'nee-ott.",
  "Et cum spiritu tuo.": "Ett coom spee'ree-too too'oh.",
  "Kyrie, eleison.": "Kee'ree-ay ay-lay'ee-son.",
  "Christe, eleison.": "Kree'stay ay-lay'ee-son.",
  "Deo gratias.": "Day'oh graht'see-ahse.",
  "Gloria tibi, Domine.": "Gloh'ree-ah tee'bee doe'mee-nay.",
  "Laus tibi, Christe.": "Louse tee'bee kree'stay.",
  "Suscipiat Dominus sacrificium de manibus tuis ad laudem et gloriam nominis sui, ad utilitatem quoque nostram, totiusque Ecclesiae suae sanctae.": "Soo-she'pee-aht doe'mee-noos sah-cree-fee'chee-oom day mah'nee-boose too'eese / odd lou-dem ett gloh'ree-ahm noe'mee-neese soo'ee / odd oo-tee-lee-tah'tem kwo'kway no'strahm / tote-see-oos'kway ay-clay'zee-ay soo'ay sahnk'tay.",
  "Habemus ad Dominum.": "Hah-bay'moos odd doe'mee-noom.",
  "Dignum et justum est.": "Deen'yoom ett yoos'toom est.",
  "Sed libera nos a malo.": "Said lee'bay-rah noese ah mah'lo."
};

const O_BRIEN_BELL_CHART = [
  {moment:"Sanctus — at \"sine fine dicentes\"", action:"Ring the bell three times, then fold hands and kneel erect."},
  {moment:"Hanc igitur — Priest extends hands over chalice", action:"Ring once; then rise, go to middle, genuflect, ascend, kneel on edge of platform a little to the right of the priest."},
  {moment:"Consecration of the Host — each genuflection", action:"Bow profoundly and ring; raise chasuble with left hand at elevation and ring with right; ring again at genuflection. (Two servers: AC1 holds chasuble and rings; AC2 holds chasuble.)"},
  {moment:"Consecration of the Chalice", action:"Same five steps as for the Host."},
  {moment:"Domine, non sum dignus (×3)", action:"Ring the bell each time the priest strikes his breast."}
];

const O_BRIEN_PREMASS = [
  {id:"arrive", label:"Arrive in the sacristy a few minutes before Mass"},
  {id:"cassock", label:"Put on cassock and surplice"},
  {id:"cruets", label:"Place cruets of wine and water on the credence table"},
  {id:"lavabo", label:"Place finger bowl and towel on the credence table"},
  {id:"candles", label:"Light the two lowest candles — Epistle side (nearest tabernacle) first, then Gospel side"},
  {id:"silence", label:"Observe silence in the sacristy"},
  {id:"assist", label:"Be ready to give any assistance requested"}
];

const O_BRIEN_MOVEMENTS = [
  {id:"ob0", insertBefore:0, role:"ac1", section:"Lesson I — Arrival at the Altar",
   q:"On arriving at the altar with the Priest, what does Altar Boy No. 1 (Epistle side) do with the biretta?",
   options:["Takes it by the nearest peak, genuflects, places it on the sedilia","Places it on the altar","Hands it to Altar Boy No. 2","Keeps it until the Last Gospel"],
   correct:0, explain:"On arriving at the altar, stand a little to the right of the priest, take his biretta by the nearest peak, genuflect with him, place the biretta on the sedilia, come back to the center of the altar steps, genuflect and move about two feet to the Gospel side."},

  {id:"ob1", insertBefore:0, role:"both", section:"Lesson I — Procession",
   q:"When walking before the Priest to the altar, how should both servers hold their hands?",
   options:["Joined palm to palm on the breast","At their sides","Folded behind the back","One hand on the missal"],
   correct:0, explain:"Bow with the priest to the crucifix and walk before him to the altar with hands joined palm to palm on your breast."},

  {id:"ob2", insertBefore:0, role:"both", section:"Lesson I — Prayers at the Foot",
   q:"When the Priest descends to begin Mass, where do both servers kneel?",
   options:["On the floor at the foot of the altar, head erect, hands joined","On the top altar step","Standing at the credence","On the predella"],
   correct:0, explain:"Kneel on the floor, with head erect and hands joined, palm to palm, and make the sign of the cross with the priest."},

  {id:"ob3", insertBefore:16, role:"both", section:"Lesson I — Ascending the Altar",
   q:"After the prayers at the foot, where does the server kneel?",
   options:["On the lowest step on the Gospel side (opposite the missal)","On the Epistle side top step","On the floor at the center","Standing at the credence"],
   correct:0, explain:"Arise at once, genuflect in the center, go to the Gospel side and kneel on the lowest step. Keep hands folded throughout the Mass except when otherwise occupied."},

  {id:"ob4", insertBefore:21, role:"ac1", section:"Lesson II — Epistle",
   q:"After Deo gratias at the Epistle, what does Altar Boy No. 1 do?",
   options:["Transfers the missal from Epistle side to Gospel side","Rings the Sanctus bell","Brings the cruets","Kneels and does nothing"],
   correct:0, explain:"Rise, walk to the Epistle side, genuflect at center, take missal stand, turn left, descend front steps diagonally, genuflect, ascend to Gospel side, place missal turned partly toward tabernacle."},

  {id:"ob5", insertBefore:22, role:"both", section:"Lesson II — Gospel",
   q:"When the Priest signs the missal at the Gospel, what do both servers do?",
   options:["Sign forehead, lips, and breast with thumb of open right hand","Bow only","Ring the bell","Turn away from the altar"],
   correct:0, explain:"At the same time as the priest, with thumb of open right hand make the sign of the cross upon forehead, lips, and center of breast. Respond Gloria tibi, Domine."},

  {id:"ob6", insertBefore:24, role:"ac1", section:"Lesson III — Offertory (Two Servers)",
   q:"At the Offertory with two altar boys, who presents the wine?",
   options:["Altar Boy No. 1 (Epistle side)","Altar Boy No. 2 (Gospel side)","Both together","The Priest fetches it himself"],
   correct:0, explain:"At the Offertory: Altar Boy No. 1 presents the wine; Altar Boy No. 2 presents the water."},

  {id:"ob7", insertBefore:24, role:"ac2", section:"Lesson III — Offertory (Two Servers)",
   q:"At the Offertory with two altar boys, who presents the water?",
   options:["Altar Boy No. 2 (Gospel side)","Altar Boy No. 1 (Epistle side)","Neither — one boy holds both","The MC"],
   correct:0, explain:"At the Offertory: Altar Boy No. 1 presents the wine; Altar Boy No. 2 presents the water."},

  {id:"ob8", insertBefore:24, role:"both", section:"Lesson III — Offertory",
   q:"When presenting the cruets to the Priest, what does O'Brien direct?",
   options:["Kiss each cruet before presenting and after receiving it back","Never touch the cruets with the hands","Present both in the left hand only","Genuflect before each presentation"],
   correct:0, explain:"Make a slight bow and present the cruets, kissing each cruet before presenting it and also after you receive it back from him."},

  {id:"ob9", insertBefore:24, role:"ac1", section:"Lesson III — Lavabo (Two Servers)",
   q:"At the Lavabo with two servers, what does Altar Boy No. 1 do?",
   options:["Presents the towel","Pours the water","Rings the bell","Transfers the missal"],
   correct:0, explain:"At the Lavabo: Altar Boy No. 1 presents the towel; Altar Boy No. 2 pours the water."},

  {id:"ob10", insertBefore:24, role:"ac2", section:"Lesson III — Lavabo (Two Servers)",
   q:"At the Lavabo with two servers, who pours the water over the Priest's fingers?",
   options:["Altar Boy No. 2","Altar Boy No. 1","The Priest","Neither"],
   correct:0, explain:"At the Lavabo: Altar Boy No. 1 presents the towel; Altar Boy No. 2 pours the water."},

  {id:"ob11", insertBefore:30, role:"ac1", section:"Lesson III — Sanctus",
   q:"At the Sanctus, who rings the bell (two-server Low Mass)?",
   options:["Altar Boy No. 1 — three times","Altar Boy No. 2 — three times","Both together","No bell at Low Mass"],
   correct:0, explain:"At Sanctus ring bell three times, then fold hands and kneel erect. With two servers, Altar Boy No. 1 rings the bell."},

  {id:"ob12", insertBefore:31, role:"ac1", section:"Lesson IV — Hanc Igitur",
   q:"At the Hanc igitur, what does the server do after ringing the bell once?",
   options:["Rise, go to middle, genuflect, ascend, kneel on platform right of Priest","Remain on lowest step","Return to credence","Genuflect only"],
   correct:0, explain:"Ring bell at Hanc igitur, then rising, go to the middle, genuflect, go up the steps and kneel on the edge of the platform a little to the right of the priest."},

  {id:"ob13", insertBefore:31, role:"ac1", section:"Lesson IV — Elevation (Two Servers)",
   q:"At the elevation of the Host with two servers, what does Altar Boy No. 1 do?",
   options:["Holds the chasuble and rings the bell","Only rings — does not touch chasuble","Only holds chasuble — does not ring","Kneels at the foot"],
   correct:0, explain:"At the Elevation: Altar Boy No. 1 holds chasuble and rings bell; Altar Boy No. 2 holds chasuble."},

  {id:"ob14", insertBefore:31, role:"ac2", section:"Lesson IV — Elevation (Two Servers)",
   q:"At the elevation with two servers, what does Altar Boy No. 2 do?",
   options:["Holds the chasuble","Rings the bell","Transfers the missal","Pours the wine"],
   correct:0, explain:"At the Elevation: Altar Boy No. 1 holds chasuble and rings bell; Altar Boy No. 2 holds chasuble."},

  {id:"ob15", insertBefore:36, role:"ac1", section:"Lesson IV — Domine non sum dignus",
   q:"At Domine, non sum dignus, when does the server ring the bell?",
   options:["Each time the Priest strikes his breast (three times)","Once only at the end","Not at all at Low Mass","Only at the first"],
   correct:0, explain:"Each time he strikes his breast, ring the bell as a signal of the Communion of the Mass."},

  {id:"ob16", insertBefore:41, role:"ac1", section:"Lesson V — Last Gospel",
   q:"At the Last Gospel, what does Altar Boy No. 1 do before standing at the Epistle side?",
   options:["Brings the Priest's biretta from the sedilia","Rings the bell three times","Transfers the missal to Epistle side","Extinguishes the candles"],
   correct:0, explain:"Go to center, genuflect, bring the priest's biretta from the sedilia and stand at the Epistle side during the Last Gospel."},

  {id:"ob17", insertBefore:0, role:"both", section:"Two Altar Boys — General Rule",
   q:"When one or both boys perform a duty at the altar, what do both do first?",
   options:["Proceed to the center and genuflect on the floor before and after the action","Genuflect only on one knee at their places","Bow at the foot only","No special movement"],
   correct:0, explain:"Whenever a duty is to be performed by one or both boys, both boys proceed to the center of the altar and genuflect on the floor before and after the action."}
];

const O_BRIEN_GLOSSARY = [
  {latin:"Ad Deum qui laetificat juventutem meam", english:"To God who giveth joy to my youth", when:"Psalm 42", phonetic:"Odd day'oom kwee lay-tee'fee-cot / you-ven-too'tem may'ahm."},
  {latin:"Et cum spiritu tuo", english:"And with thy spirit", when:"Reply to Dominus vobiscum", phonetic:"Ett coom spee'ree-too too'oh."},
  {latin:"Deo gratias", english:"Thanks be to God", when:"After Epistle and Last Gospel", phonetic:"Day'oh graht'see-ahse."},
  {latin:"Gloria tibi, Domine", english:"Glory be to Thee, O Lord", when:"Before Gospel", phonetic:"Gloh'ree-ah tee'bee doe'mee-nay."},
  {latin:"Laus tibi, Christe", english:"Praise to Thee, O Christ", when:"After Gospel", phonetic:"Louse tee'bee kree'stay."},
  {latin:"Kyrie, eleison", english:"Lord, have mercy", when:"Ninefold Kyrie", phonetic:"Kee'ree-ay ay-lay'ee-son."},
  {latin:"Christe, eleison", english:"Christ, have mercy", when:"Kyrie", phonetic:"Kree'stay ay-lay'ee-son."},
  {latin:"Suscipiat Dominus sacrificium…", english:"May the Lord receive the sacrifice from thy hands…", when:"Orate, fratres", phonetic:"Soo-she'pee-aht doe'mee-noos sah-cree-fee'chee-oom…"},
  {latin:"Habemus ad Dominum", english:"We have lifted them up unto the Lord", when:"Sursum corda", phonetic:"Hah-bay'moos odd doe'mee-noom."},
  {latin:"Dignum et justum est", english:"It is meet and just", when:"Preface", phonetic:"Deen'yoom ett yoos'toom est."},
  {latin:"Sed libera nos a malo", english:"But deliver us from evil", when:"End of Pater Noster", phonetic:"Said lee'bay-rah noese ah mah'lo."},
  {latin:"Amen", english:"So be it", when:"Throughout", phonetic:"Ah-men'."},
  {latin:"Ite, missa est / Benedicamus Domino", english:"Go, the Mass is ended / Let us bless the Lord", when:"Dismissal — reply Deo gratias", phonetic:"Day'oh grat'see-ahse."}
];
