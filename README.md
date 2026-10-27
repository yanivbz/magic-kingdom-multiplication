# עומר והממלכה הקסומה
**Omer and the Magic Kingdom** · repo: `magic-kingdom-multiplication`

משחק PWA בעברית (RTL) ללימוד לוח הכפל לכיתה ג'. HTML/CSS/JS רגיל, בלי build. עובד גם בלי חיבור לרשת ואפשר להתקין על טלפון, טאבלט ומחשב.

**הרצה:** `python3 -m http.server 8080` בתיקיית הפרויקט, ואז http://localhost:8080
**הוספת טבלה:** ב-`js/data.js` מגדירים `ready:true` ב-`K.TABLES` (3,4,6,7,8,9 כבר מוגדרות). בכל שינוי בקבצים מעלים את `VERSION` ב-`sw.js`.
**התקדמות:** נשמרת ב-localStorage (`kefel.v1`). פינת ההורים מאחורי תרגיל כפל.

A Hebrew RTL PWA that teaches the grade-3 multiplication table to Omer, with a character to pick (bear, puppy, princess), a magic-kingdom map, short lessons, adaptive practice, rewards, a multiplication-table explorer and a parent corner. Plain HTML/CSS/JS, no build step, works offline.

**Run:** `python3 -m http.server 8080` in the project folder, then open http://localhost:8080
**Add a table:** set `ready:true` for it in `K.TABLES` (`js/data.js`). Bump `VERSION` in `sw.js` after any change.
**Progress** is stored in localStorage (`kefel.v1`). The parent corner is behind a multiplication gate.
