/* גן הצורות – static content. Independent of K.AREAS / K.TABLES. */
window.K = window.K || {};

K.GEO = {
  region: {
    id: 'garden',
    name: 'גן הצורות',
    emoji: '🌸',
    blurb: 'גן קסום של קווים, זוויות וצורות',
    friend: {
      emoji: '🌈',
      name: 'קשתית',
      line: 'שלום, אני קשתית! בגן שלי כל צורה פורחת בצבע אחר. נתחיל מהזוויות — הן כמו ידיים שנפתחות. מוכנה לבדוק אותן עם פינת דף?'
    },
    wand: { name: 'שרביט הצורות', color: '#ff6fae' }
  }
};

K.GEO.UNITS = [
  { id: 'angles',    name: 'זוויות',             emoji: '📐', ready: true,  color: '#ff6fae',
    blurb: 'זווית חדה, ישרה, קהה ושטוחה',
    tip: 'פינת דף היא זווית ישרה. אם הזווית קטנה ממנה — היא חדה, ואם היא גדולה ממנה — היא קהה.' },
  { id: 'polygons',  name: 'מצולעים',            emoji: '⬡', ready: false, color: '#2fc79a', blurb: 'צורות לפי מספר הצלעות' },
  { id: 'triangles', name: 'משולשים',            emoji: '🔺', ready: false, color: '#4db3ff', blurb: 'מיון לפי צלעות ולפי זוויות' },
  { id: 'lines',     name: 'מקבילים ומאונכים',  emoji: '📏', ready: false, color: '#9a6bff', blurb: 'קווים ישרים שנפגשים או לא' },
  { id: 'quads',     name: 'מרובעים',            emoji: '▭', ready: false, color: '#ffb81f', blurb: 'טרפז, מקבילית, מעוין, מלבן, ריבוע ודלתון' },
  { id: 'measure',   name: 'היקף ושטח',          emoji: '🔲', ready: false, color: '#ff8f3d', blurb: 'היקף, ושטח בריבועי יחידה' },
  { id: 'symmetry',  name: 'סימטריה וסיבוב',     emoji: '🪞', ready: false, color: '#7a4dff', blurb: 'שיקוף, סיבוב וסימטריה' }
];

K.GEO.ANGLE = {
  types: {
    acute:    { id: 'acute',    he: 'חדה',   full: 'זווית חדה',   color: '#4db3ff', tip: 'קטנה מזווית ישרה — פינת הדף לא נכנסת עד הסוף, הזווית צרה יותר.' },
    right:    { id: 'right',    he: 'ישרה',  full: 'זווית ישרה',  color: '#2fc79a', tip: 'פינת הדף יושבת בדיוק על הזווית, בלי רווח ובלי לחרוג.' },
    obtuse:   { id: 'obtuse',   he: 'קהה',   full: 'זווית קהה',   color: '#ff8f3d', tip: 'גדולה מזווית ישרה — פינת הדף נכנסת ויש עוד מקום.' },
    straight: { id: 'straight', he: 'שטוחה', full: 'זווית שטוחה', color: '#9a6bff', tip: 'נפתחת לקו ישר, כמו מקל שוכב. זו חצי סיבוב.' }
  },
  /* classification bands used when reading a measured degree */
  typeOf(deg) {
    const d = Math.abs(Number(deg));
    if (Math.abs(d - 180) <= 8 || Math.abs(d) <= 8) return 'straight';
    if (Math.abs(d - 90) <= 8) return 'right';
    if (d < 90) return 'acute';
    return 'obtuse';
  },
  /* "make this type" success bands */
  inBand(deg, kind) {
    const d = Math.abs(Number(deg));
    if (kind === 'right') return Math.abs(d - 90) <= 10;
    if (kind === 'straight') return Math.abs(d - 180) <= 10 || d <= 10;
    if (kind === 'acute') return d >= 18 && d <= 75;
    if (kind === 'obtuse') return d >= 105 && d <= 165;
    return false;
  },
  paperMsg(kind) {
    return K.GEO.ANGLE.types[kind].tip;
  }
};

K.GEO.MSG = {
  right: ['יפה מאוד!', 'כל הכבוד!', 'בול!', 'איזו גאונה!', 'נהדר!', 'ידעת!'],
  rightHint: ['נכון! פינת הדף עזרה, וככה לומדים.', 'נכון! ועכשיו את גם רואה למה.'],
  wrong: [
    'כמעט! בואי נבדוק עם פינת דף.',
    'לא נורא, ככה לומדים! הנה ההסבר.',
    'עוד קצת! תסתכלי על הזווית ועל פינת הדף.',
    'שווה לנסות! בואי נבין ביחד.'
  ],
  retry: 'בואי ננסה שוב את השאלה הזאת, ועכשיו כבר מכירים אותה!',
  sessionEnd: [
    [0.0, 'עשית צעד חשוב! בפעם הבאה הזוויות יהיו עוד יותר ברורות.'],
    [0.5, 'עבודה יפה! את משתפרת עם כל סבב.'],
    [0.8, 'וואו, כמעט מושלם! את כבר מזהה זוויות מצוין.'],
    [1.0, 'מושלם! את אלופת הזוויות!']
  ]
};
