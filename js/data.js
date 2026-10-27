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
  { id: 'forest',   name: 'יער הדבש',        emoji: '🌲', tables: [2, 5, 10], blurb: 'כאן גרים הדובים והדבורים' },
  { id: 'meadow',   name: 'אחו הפרפרים',     emoji: '🦋', tables: [3, 4],     blurb: 'פרחים, פרפרים וקשת' },
  { id: 'mountain', name: 'הר הגבישים',      emoji: '💎', tables: [6, 7, 8],  blurb: 'מערות נוצצות בהר' },
  { id: 'castle',   name: 'טירת הכוכבים',    emoji: '🏰', tables: [9],        blurb: 'הטירה הקסומה של הממלכה' }
];

/* Per-table config. `trick` selects the lesson's third step (see lesson.js). */
K.TABLES = {
  2:  { ready: true,  area: 'forest',   color: '#ff8f3d', trick: 'double2',
        tip: 'כפל ב-2 זה להכפיל: 2 פעמים מספר זה המספר ועוד אותו מספר.',
        pattern: 'כל התוצאות זוגיות: הן מסתיימות ב-0, 2, 4, 6 או 8.' },
  3:  { ready: false, area: 'meadow',   color: '#3fc8a0', trick: 'split', split: 2,
        tip: '3 זה 2 ועוד 1: קודם מכפילים ואז מוסיפים עוד קבוצה.', pattern: '' },
  4:  { ready: false, area: 'meadow',   color: '#4db3ff', trick: 'split', split: 2,
        tip: '4 זה להכפיל פעמיים: קודם כפול 2 ואז שוב כפול 2.', pattern: '' },
  5:  { ready: true,  area: 'forest',   color: '#ff6fae', trick: 'hand5',
        tip: 'את מכירה את שיטת היד: מחזיקים יד אחת עם 5 אצבעות וסופרים אותה כמה פעמים שצריך!',
        pattern: 'כל התוצאות מסתיימות ב-0 או ב-5.' },
  6:  { ready: false, area: 'mountain', color: '#9a6bff', trick: 'split', split: 5,
        tip: '6 זה 5 ועוד 1: את מכירה את טבלת ה-5 ומוסיפים קבוצה אחת.', pattern: '' },
  7:  { ready: false, area: 'mountain', color: '#ff8f3d', trick: 'split', split: 5,
        tip: '7 זה 5 ועוד 2: משתמשים בטבלת ה-5 ובטבלת ה-2.', pattern: '' },
  8:  { ready: false, area: 'mountain', color: '#ff5a6e', trick: 'split', split: 4,
        tip: '8 זה לכפול פעמיים ועוד פעם אחת: כפול 2, כפול 2, כפול 2.', pattern: '' },
  9:  { ready: false, area: 'castle',   color: '#ffb81f', trick: 'fingers9',
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

/* Things to buy for the castle home – coins. `slot` ids are positioned in art.js (homeScene). */
K.SHOP = [
  { id: 'flowers',  name: 'ערוגת פרחים',  price: 10, emoji: '🌷' },
  { id: 'tree',     name: 'עץ פירות',     price: 15, emoji: '🌳' },
  { id: 'flag',     name: 'דגל על הטירה', price: 15, emoji: '🚩' },
  { id: 'butterfly',name: 'פרפרים',       price: 15, emoji: '🦋' },
  { id: 'balloon',  name: 'בלון פורח',    price: 20, emoji: '🎈' },
  { id: 'rainbow',  name: 'קשת בענן',     price: 25, emoji: '🌈' },
  { id: 'swing',    name: 'נדנדה',        price: 25, emoji: '🎠' },
  { id: 'lantern',  name: 'פנסי כוכבים',  price: 25, emoji: '✨' },
  { id: 'fountain', name: 'מזרקה',        price: 30, emoji: '⛲' },
  { id: 'doghouse', name: 'בית לחיות',    price: 30, emoji: '🏠' },
  { id: 'unicorn',  name: 'חד קרן',       price: 45, emoji: '🦄' },
  { id: 'moon',     name: 'ירח קסום',     price: 40, emoji: '🌙' }
];

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
