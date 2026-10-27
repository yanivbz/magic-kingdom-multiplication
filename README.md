# עומר והממלכה הקסומה
**Omer and the Magic Kingdom** · repo: `magic-kingdom-multiplication`

משחק PWA בעברית (RTL) ללימוד לוח הכפל לכיתה ג'. HTML/CSS/JS רגיל, בלי build. עובד גם בלי חיבור לרשת ואפשר להתקין על טלפון, טאבלט ומחשב.

**הרצה:** `python3 -m http.server 8080` בתיקיית הפרויקט, ואז http://localhost:8080
**הוספת טבלה:** ב-`js/data.js` מגדירים `ready:true` ב-`K.TABLES` (3,4,6,7,8,9 כבר מוגדרות). בכל שינוי בקבצים מעלים את `VERSION` ב-`sw.js`.
**הקראה בקול:** ליד כל טקסט יש כפתור רמקול 🔊 (לחיצה מקריאה, לחיצה נוספת עוצרת; מסך חדש עוצר). משתמשים רק ב-Web Speech של הדפדפן ובוחרים את הקול העברי הנשי הטוב ביותר שבמכשיר (Carmit / Hila / Google עברית), מהירות 0.9 וטון 1.1. מספרים ותרגילים מוקראים כמילים ("שלוש כפול חמש שווה חמש עשרה"). אם אין קול עברי במכשיר הכפתורים מוסתרים. הקראה אוטומטית: פינת ההורים ← הגדרות (כבויה כברירת מחדל). הקוד: `js/speech.js`.
**התקדמות:** נשמרת ב-localStorage (`kefel.v1`). פינת ההורים מאחורי תרגיל כפל.

A Hebrew RTL PWA that teaches the grade-3 multiplication table to Omer, with a character to pick (bear, puppy, princess), a magic-kingdom map, short lessons, adaptive practice, rewards, a multiplication-table explorer and a parent corner. Plain HTML/CSS/JS, no build step, works offline.

**Run:** `python3 -m http.server 8080` in the project folder, then open http://localhost:8080
**Add a table:** set `ready:true` for it in `K.TABLES` (`js/data.js`). Bump `VERSION` in `sw.js` after any change.
**Progress** is stored in localStorage (`kefel.v1`). The parent corner is behind a multiplication gate.

**Read-aloud:** a 🔊 button sits next to every meaningful text (tap = read, tap again = stop, changing screen stops it). It uses only the browser's Web Speech API and picks the best he-IL female voice by name (Carmit / Hila / Google Hebrew), rate 0.9, pitch 1.1. Numbers and equations are spoken as Hebrew words ("שלוש כפול חמש שווה חמש עשרה"). With no Hebrew voice on the device the buttons are hidden. Auto-read: parent corner → settings (off by default). Code: `js/speech.js`. Voice quality depends on the device's voices.
