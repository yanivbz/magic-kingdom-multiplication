/* עומר והממלכה הקסומה – static content & configuration.
   Adding a new times table: set `ready:true` on its entry (all content is generic). */
window.K = window.K || {};

K.CHARACTERS = {
  bear:     { id: 'bear',     name: 'דובי',        title: 'הדוב הנחמד',   color: '#c98b55', blurb: 'אוהב דבש וקפיצות' },
  puppy:    { id: 'puppy',    name: 'פופי',        title: 'הכלבלב המשחק',  color: '#f0b865', blurb: 'מגלה כל סוד בריחרוח' },
  princess: { id: 'princess', name: 'הנסיכה לילי', title: 'נסיכת הכוכבים', color: '#ff7fb5', blurb: 'שומרת על הקסם של הממלכה' }
};

/* Areas on the kingdom map (bottom → top). */
K.AREAS = [
  { id: 'forest',   name: 'יער הדבש',        emoji: '🌲', tables: [1, 2, 5, 10], blurb: 'כאן גרים הדובים והדבורים',
    friend: { emoji: '🐝', name: 'זמזומה הדבורה', line: 'שלום, אני זמזומה! ביער שלנו סופרים בקבוצות של 2, של 5 ושל 10, ממש כמו דבורים בכוורת. בואי נזמזם ביחד!' },
    piece: { name: 'יהלום היער', color: '#2fc79a' } },
  { id: 'meadow',   name: 'אחו הפרפרים',     emoji: '🦋', tables: [4, 3],     blurb: 'פרחים, פרפרים וקשת',
    friend: { emoji: '🦋', name: 'פרפרית', line: 'היי, אני פרפרית! באחו מכפילים ואז מכפילים שוב, וכך טבלת ה-4 נהיית קלה. גם טבלת ה-3 מחכה לך כאן.' },
    piece: { name: 'אבן הוורד', color: '#ff6fae' } },
  { id: 'castle',   name: 'טירת הכוכבים',    emoji: '🏰', tables: [9],        blurb: 'הטירה הקסומה של הממלכה',
    friend: { emoji: '🦉', name: 'נוגה הינשופה', line: 'ברוכה הבאה לטירה! יש לי סוד: טבלת ה-9 מסתתרת בעשר האצבעות שלך. רוצה לגלות?' },
    piece: { name: 'כוכב הזהב', color: '#ffc41f' } },
  { id: 'mountain', name: 'הר הגבישים',      emoji: '💎', tables: [6, 7, 8],  blurb: 'מערות נוצצות בהר',
    friend: { emoji: '🐲', name: 'ניצה הדרקונית', line: 'אני ניצה, הדרקונית הכי חמודה בהר! כאן מפרקים מספרים גדולים לחלקים שכבר מכירים. נטפס ביחד עד הפסגה?' },
    piece: { name: 'גביש ההר', color: '#9a6bff' } }
];
/* Recommended learning order (nothing is locked – this only guides the "recommended next" marker). */
K.ORDER = [2, 5, 10, 1, 4, 3, 9, 6, 7, 8];
K.MEDALS = { bronze: { name: 'ארד', emoji: '🥉', min: .55, rank: 1 }, silver: { name: 'כסף', emoji: '🥈', min: .75, rank: 2 }, gold: { name: 'זהב', emoji: '🥇', min: .9, rank: 3 } };

/* Per-table config. `trick` selects the lesson's third step (see lesson.js). */
K.TABLES = {
  1:  { ready: true,  area: 'forest',   color: '#2fc79a', trick: 'one',
        tip: 'כפל ב-1 זה הכי קל: כל מספר כפול 1 נשאר אותו מספר בדיוק.',
        pattern: 'התוצאה תמיד שווה למספר השני.' },
  2:  { ready: true,  area: 'forest',   color: '#ff8f3d', trick: 'double2',
        tip: 'כפל ב-2 זה להכפיל: 2 פעמים מספר זה המספר ועוד אותו מספר.',
        pattern: 'כל התוצאות זוגיות: הן מסתיימות ב-0, 2, 4, 6 או 8.' },
  3:  { ready: true,  area: 'meadow',   color: '#3fc8a0', trick: 'split', split: 2,
        tip: '3 זה 2 ועוד 1: קודם מכפילים (כפול 2) ואז מוסיפים עוד קבוצה אחת.', pattern: 'סכום הספרות של כל תוצאה מתחלק ב-3.' },
  4:  { ready: true,  area: 'meadow',   color: '#4db3ff', trick: 'double4',
        tip: '4 זה להכפיל ולהכפיל שוב: קודם כפול 2, ואז את התוצאה שוב כפול 2.', pattern: 'כל התוצאות זוגיות.' },
  5:  { ready: true,  area: 'forest',   color: '#ff6fae', trick: 'hand5',
        tip: 'את מכירה את שיטת היד: מחזיקים יד אחת עם 5 אצבעות וסופרים אותה כמה פעמים שצריך!',
        pattern: 'כל התוצאות מסתיימות ב-0 או ב-5.' },
  6:  { ready: true,  area: 'mountain', color: '#9a6bff', trick: 'split', split: 5,
        tip: '6 זה 5 ועוד 1: את מכירה את טבלת ה-5, ומוסיפים עוד קבוצה אחת.', pattern: 'כל התוצאות זוגיות.' },
  7:  { ready: true,  area: 'mountain', color: '#ff8f3d', trick: 'split', split: 5,
        tip: '7 זה 5 ועוד 2: משתמשים בטבלת ה-5 ובטבלת ה-2 ומחברים.', pattern: '' },
  8:  { ready: true,  area: 'mountain', color: '#ff5a6e', trick: 'split', split: 4,
        tip: '8 זה 4 ועוד 4: עושים את טבלת ה-4 פעמיים (או מכפילים שלוש פעמים: כפול 2, כפול 2, כפול 2).', pattern: 'כל התוצאות זוגיות.' },
  9:  { ready: true,  area: 'castle',   color: '#ffb81f', trick: 'fingers9',
        tip: 'טבלת ה-9 מסתתרת בעשר האצבעות שלך!', pattern: 'סכום הספרות של התוצאה הוא תמיד 9.' },
  10: { ready: true,  area: 'forest',   color: '#7a4dff', trick: 'tenzero',
        tip: 'כפל ב-10 זה קל: מוסיפים אפס בסוף המספר.',
        pattern: 'כל התוצאות מסתיימות ב-0.' }
};

K.TABLE_LIST = Object.keys(K.TABLES).map(Number).sort((a, b) => a - b);
K.readyTables = () => K.TABLE_LIST.filter(t => K.TABLES[t].ready);

/* Word problems.  {a} groups, {b} items in each group. */
K.STORIES = [
  { emoji: '🍯', text: (a, b) => `לדובי יש ${a} צנצנות דבש. בכל צנצנת יש ${b} כפות דבש. כמה כפות דבש יש בסך הכול?` },
  { emoji: '🍪', text: (a, b) => `אפינו ${a} מגשי עוגיות. על כל מגש יש ${b} עוגיות. כמה עוגיות אפינו?` },
  { emoji: '🎈', text: (a, b) => `${a} חברים קנו בלונים. כל חבר קנה ${b} בלונים. כמה בלונים קנו כולם?` },
  { emoji: '🍎', text: (a, b) => `יש ${a} שקיות, ובכל שקית ${b} תפוחים. כמה תפוחים יש בסך הכול?` },
  { emoji: '🌷', text: (a, b) => `בגינה יש ${a} שורות של פרחים. בכל שורה ${b} פרחים. כמה פרחים יש בגינה?` },
  { emoji: '🥕', text: (a, b) => `${a} ארנבים אוכלים גזר. כל ארנב אוכל ${b} גזרים. כמה גזרים אכלו כולם?` },
  { emoji: '⭐', text: (a, b) => `בשמיים יש ${a} אשכולות של כוכבים, ובכל אשכול ${b} כוכבים. כמה כוכבים יש?` },
  { emoji: '🍓', text: (a, b) => `לנסיכה יש ${a} סלים של תותים. בכל סל ${b} תותים. כמה תותים יש לה?` },
  { emoji: '🐟', text: (a, b) => `בכל אחד מ-${a} האקווריומים שוחים ${b} דגים. כמה דגים יש בסך הכול?` }
];

/* Home building. cat: garden | furniture | pets | castle.
   zone: 'yard' / 'floor' / 'wall' = slot-based (the child picks a spot), 'fixed' = has its own place on the castle.
   need: {medals:n} any n champion medals · {gold:1} a gold medal · {crown:true} the full crown. */
K.SHOP_CATS = [
  { id: 'garden',    name: 'גינה',    emoji: '🌷' },
  { id: 'furniture', name: 'רהיטים',  emoji: '🛋️' },
  { id: 'pets',      name: 'חיות',    emoji: '🐱' },
  { id: 'castle',    name: 'הטירה',   emoji: '🏰' }
];
K.SHOP = [
  { id: 'flowers',  cat: 'garden', zone: 'fixed', name: 'ערוגת פרחים',  price: 10, emoji: '🌷' },
  { id: 'tree',     cat: 'garden', zone: 'yard',  name: 'עץ פירות',     price: 15, emoji: '🌳' },
  { id: 'mushroom', cat: 'garden', zone: 'yard',  name: 'פטריות קסם',   price: 12, emoji: '🍄' },
  { id: 'sunflower',cat: 'garden', zone: 'yard',  name: 'חמניות',       price: 15, emoji: '🌻' },
  { id: 'swing',    cat: 'garden', zone: 'yard',  name: 'נדנדה',        price: 25, emoji: '🎠' },
  { id: 'fountain', cat: 'garden', zone: 'yard',  name: 'מזרקה',        price: 30, emoji: '⛲' },
  { id: 'rainbow',  cat: 'garden', zone: 'fixed', name: 'קשת בענן',     price: 25, emoji: '🌈' },
  { id: 'butterfly',cat: 'garden', zone: 'fixed', name: 'פרפרים',       price: 15, emoji: '🦋' },
  { id: 'teddy',    cat: 'furniture', zone: 'floor', name: 'דובי פרווה',   price: 12, emoji: '🧸' },
  { id: 'books',    cat: 'furniture', zone: 'floor', name: 'ספרייה',       price: 18, emoji: '📚' },
  { id: 'bed',      cat: 'furniture', zone: 'floor', name: 'מיטת חלומות',  price: 25, emoji: '🛏️' },
  { id: 'sofa',     cat: 'furniture', zone: 'floor', name: 'ספה רכה',      price: 25, emoji: '🛋️' },
  { id: 'piano',    cat: 'furniture', zone: 'floor', name: 'פסנתר',        price: 35, emoji: '🎹', need: { medals: 1 } },
  { id: 'picture',  cat: 'furniture', zone: 'wall',  name: 'תמונה',        price: 15, emoji: '🖼️' },
  { id: 'clock',    cat: 'furniture', zone: 'wall',  name: 'שעון קיר',     price: 20, emoji: '🕰️' },
  { id: 'crownpil', cat: 'furniture', zone: 'floor', name: 'כתר על כרית',  price: 40, emoji: '👑', need: { gold: 1 } },
  { id: 'doghouse', cat: 'pets', zone: 'yard', name: 'בית לחיות',  price: 30, emoji: '🏠' },
  { id: 'kitten',   cat: 'pets', zone: 'yard', name: 'חתלתולה',    price: 25, emoji: '🐱' },
  { id: 'bunny',    cat: 'pets', zone: 'yard', name: 'ארנבונה',    price: 25, emoji: '🐰' },
  { id: 'turtle',   cat: 'pets', zone: 'yard', name: 'צב',          price: 20, emoji: '🐢' },
  { id: 'parrot',   cat: 'pets', zone: 'yard', name: 'תוכי צבעוני', price: 35, emoji: '🦜', need: { medals: 2 } },
  { id: 'unicorn',  cat: 'pets', zone: 'yard', name: 'חד קרן',      price: 45, emoji: '🦄', need: { medals: 1 } },
  { id: 'flag',     cat: 'castle', zone: 'fixed', name: 'דגל על הטירה', price: 15, emoji: '🚩' },
  { id: 'lantern',  cat: 'castle', zone: 'fixed', name: 'פנסי כוכבים',  price: 25, emoji: '✨' },
  { id: 'balloon',  cat: 'castle', zone: 'fixed', name: 'בלון פורח',    price: 20, emoji: '🎈' },
  { id: 'windows',  cat: 'castle', zone: 'fixed', name: 'חלונות קסם',   price: 30, emoji: '💠' },
  { id: 'moon',     cat: 'castle', zone: 'fixed', name: 'ירח קסום',     price: 40, emoji: '🌙' },
  { id: 'turret',   cat: 'castle', zone: 'fixed', name: 'מגדל קסום',    price: 45, emoji: '🏰', need: { medals: 2 } },
  { id: 'goldroof', cat: 'castle', zone: 'fixed', name: 'גגות זהב',     price: 50, emoji: '🌟', need: { gold: 1 } },
  { id: 'crowntop', cat: 'castle', zone: 'fixed', name: 'הכתר על הטירה', price: 0, emoji: '👑', need: { crown: true } }
];
/* slot ground points on the 400×300 home scenes */
K.SLOTS = {
  yard:  [[58, 246], [318, 272], [372, 254], [40, 270], [262, 262], [96, 286], [150, 292], [352, 292], [20, 292], [300, 246]],
  floor: [[70, 262], [150, 280], [250, 280], [332, 262], [200, 246], [110, 236]],
  wall:  [[110, 120], [290, 120], [200, 92]]
};

/* Encouragement lines */
K.MSG = {
  right: ['יפה מאוד!', 'כל הכבוד!', 'מדהים!', 'בול!', 'איזו גאונה!', 'נהדר!', 'ידעת!'],
  rightHint: ['נכון! הרמז עזר, וככה לומדים.', 'נכון! ועכשיו את גם מבינה למה.'],
  streak: n => `${n} תשובות נכונות ברצף! 🔥`,
  wrong: [
    'כמעט! בואי נראה ביחד איך מגיעים לתשובה.',
    'לא נורא, ככה לומדים! הנה ההסבר.',
    'עוד קצת! תסתכלי על התמונה.',
    'שווה לנסות! בואי נבין למה זה יוצא כך.'
  ],
  retry: 'בואי ננסה שוב את התרגיל הזה, ועכשיו כבר מכירים אותו!',
  sessionEnd: [
    [0.0, 'עשית צעד חשוב! בפעם הבאה זה יהיה עוד יותר קל.'],
    [0.5, 'עבודה יפה! את משתפרת עם כל סבב.'],
    [0.8, 'וואו, כמעט מושלם! את כבר מכירה את הטבלה.'],
    [1.0, 'מושלם! את אלופת הכפל!']
  ]
};
