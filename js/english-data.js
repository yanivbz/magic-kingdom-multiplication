/* English Land data: the 26 letters. Example words of the 10 exam letters (A B D E G H I N P T) use ONLY those letters
   (tools/validate_english_exam.py checks this); the letter is highlighted wherever it appears in the word.
   Letters (name + sound in Hebrew letters for an 8-year-old, example word + picture).
   The learned set lives in kefel.v1 → state.english.learnedLetters (parents edit it in פינת ההורים). */
(function () {
  const L = (up, name, sound, word, pic, he) => ({ up, low: up.toLowerCase(), name, sound, word, pic, he });
  K.EN_LETTERS = [
    L('A', 'אֵיי', 'אַ', 'ant', '🐜', 'נמלה'),
    L('B', 'בִּי', 'בּ', 'bed', '🛏️', 'מיטה'),
    L('C', 'סִי', 'ק', 'cat', '🐱', 'חתול'),
    L('D', 'דִי', 'ד', 'dad', '👨', 'אבא'),
    L('E', 'אִי', 'אֶ', 'egg', '🥚', 'ביצה'),
    L('F', 'אֶף', 'פ', 'fish', '🐟', 'דג'),
    L('G', 'גִ׳י', 'ג', 'bag', '👜', 'תיק'),
    L('H', 'אֵייץ׳', 'ה', 'hat', '🎩', 'כובע'),
    L('I', 'אַיי', 'אִ', 'pig', '🐷', 'חזיר'),
    L('J', 'גֵ׳יי', 'ג׳', 'juice', '🧃', 'מיץ'),
    L('K', 'קֵיי', 'ק', 'kite', '🪁', 'עפיפון'),
    L('L', 'אֶל', 'ל', 'lion', '🦁', 'אריה'),
    L('M', 'אֶם', 'מ', 'moon', '🌙', 'ירח'),
    L('N', 'אֶן', 'נ', 'net', '🥅', 'רשת'),
    L('O', 'אוֹ', 'אוֹ', 'octopus', '🐙', 'תמנון'),
    L('P', 'פִּי', 'פּ', 'pen', '🖊️', 'עט'),
    L('Q', 'קְיוּ', 'קוו', 'queen', '👸', 'מלכה'),
    L('R', 'אָר', 'ר', 'rabbit', '🐰', 'ארנב'),
    L('S', 'אֶס', 'ס', 'sun', '☀️', 'שמש'),
    L('T', 'טִי', 'ט', 'ten', '🔟', 'עשר'),
    L('U', 'יוּ', 'אַ', 'umbrella', '☂️', 'מטרייה'),
    L('V', 'וִי', 'וו', 'van', '🚐', 'טנדר'),
    L('W', 'דַאבְּלְיוּ', 'וּ', 'watch', '⌚', 'שעון'),
    L('X', 'אֶקְס', 'קס', 'fox', '🦊', 'שועל'),
    L('Y', 'וַאי', 'י', 'yo-yo', '🪀', 'יויו'),
    L('Z', 'זִי', 'ז', 'zebra', '🦓', 'זברה')
  ];
  K.EN_DEFAULT_LEARNED = ['A', 'B', 'D', 'E', 'G', 'H', 'I', 'N', 'P', 'T'];
  K.enLetter = up => K.EN_LETTERS.find(l => l.up === up);
})();
