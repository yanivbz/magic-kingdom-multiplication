/* Unit 1 lesson: זוויות — rays/vertex, paper-corner checker, rotatable arm, straight angle. */
(function () {
  const { $, $$, go, route, confetti, burstAt } = K.ui;
  const I = () => K.art.icons;
  const A = (n, v) => K.audio.play(n, v);
  const typ = d => K.GEO.ANGLE.typeOf(d);
  const Tof = d => K.GEO.ANGLE.types[typ(d)];

  function steps(charId) {
    const nm = K.CHARACTERS[charId].name;
    return [
      {
        title: 'מהי זווית?',
        say: `בגן של קשתית, זווית היא הפתיחה בין שתי קרניים שנפגשות בקודקוד. ${nm} מצביע על הקודקוד — זה המקום שבו הקרניים נפגשות.`,
        render(stage) {
          let deg = 70, rot = 25;
          stage.innerHTML = `<div class="geo-stage" id="gs"></div>
            <p class="trick-note">שתי קרניים, וקודקוד אחד. הפתיחה ביניהן היא הזווית.</p>`;
          const dial = K.geoArt.mountDial($('#gs', stage), { deg, rot, size: 300, parts: true, showName: false, onChange() {} });
          return () => dial.destroy();
        }
      },
      {
        title: 'זווית ישרה ופינת דף',
        say: 'פינה של דף היא תמיד זווית ישרה. אם מצמידים אותה לזווית והיא יושבת בדיוק — זאת זווית ישרה!',
        render(stage) {
          stage.innerHTML = `<div class="geo-row">
              <div class="geo-fig">${K.geoArt.angleSVG({ deg: 90, rot: 0, size: 250, paper: true, names: true, markRight: true })}</div>
            </div>
            <p class="trick-note" id="note">פינת הדף הצהובה יושבת בדיוק על הזווית. בלי רווח, ובלי לחרוג. זאת זווית ישרה.</p>
            <button class="btn btn-primary" id="flip">סובבי את הזווית</button>`;
          let rots = [0, 35, 90, 145, 200, 250], i = 0;
          $('#flip', stage).onclick = () => {
            i = (i + 1) % rots.length; A('pop');
            $('.geo-fig', stage).innerHTML = K.geoArt.angleSVG({ deg: 90, rot: rots[i], size: 250, paper: true, names: true, markRight: true });
            $('#note', stage).textContent = 'גם כשמסובבים את הזווית — היא נשארת ישרה! פינת הדף עדיין יושבת בדיוק.';
          };
        }
      },
      {
        title: 'בודקים עם פינת דף',
        say: 'בואי נבדוק שלוש זוויות. לחצי על זווית, ואז על «בדיקה עם פינת דף». נראה אם פינת הדף גדולה, קטנה, או יושבת בדיוק.',
        render(stage) {
          const samples = [
            { deg: 45, rot: 20, label: 'א' },
            { deg: 90, rot: 200, label: 'ב' },
            { deg: 135, rot: 110, label: 'ג' }
          ];
          stage.innerHTML = `<div class="geo-samples" id="sm">${samples.map((s, i) =>
            `<button class="geo-samp" data-i="${i}" aria-label="זווית ${s.label}">
              <span class="geo-samp-l">${s.label}</span>
              ${K.geoArt.angleSVG({ deg: s.deg, rot: s.rot, size: 180, names: false })}
            </button>`).join('')}</div>
            <button class="btn btn-primary btn-lg" id="chk" disabled>בדיקה עם פינת דף</button>
            <p class="trick-note" id="note">לחצי על אחת הזוויות כדי לבדוק אותה.</p>`;
          let sel = null;
          const note = $('#note', stage);
          $$('.geo-samp', stage).forEach(b => b.onclick = () => {
            sel = Number(b.dataset.i); A('tap');
            $$('.geo-samp', stage).forEach(x => x.classList.toggle('on', x === b));
            $('#chk', stage).disabled = false;
            note.textContent = `נבחרה זווית ${samples[sel].label}. לחצי על הבדיקה!`;
          });
          $('#chk', stage).onclick = () => {
            if (sel == null) return;
            const s = samples[sel], t = Tof(s.deg);
            A('pop');
            $$('.geo-samp', stage).forEach((b, i) => {
              if (i === sel) b.innerHTML = `<span class="geo-samp-l">${s.label}</span>${K.geoArt.angleSVG({ deg: s.deg, rot: s.rot, size: 180, paper: true, names: true })}`;
            });
            note.innerHTML = `<b style="color:${t.color}">${t.full}!</b> ${t.tip}`;
            burstAt($('.geo-samp.on', stage) || stage, { count: 28, stars: true });
            if (t.id === 'right') A('star');
          };
        }
      },
      {
        title: 'חדה, ישרה וקהה',
        say: 'גררי את הנקודה הוורודה וצרי זוויות לבד. תראי איך השם משתנה: חדה, ישרה, או קהה. נסי גם להצמיד בדיוק לזווית ישרה!',
        render(stage) {
          stage.innerHTML = `<div class="geo-stage" id="gs"></div>
            <p class="trick-note">כשהזווית נסגרת ליד פינת דף — היא ישרה. קטנה ממנה: חדה. גדולה ממנה: קהה.</p>`;
          const dial = K.geoArt.mountDial($('#gs', stage), { deg: 55, rot: 20, size: 310, showName: true, paper: false, onChange(d, t) {
            if (t === 'right' || t === 'straight') A('dot', 3);
          } });
          return () => dial.destroy();
        }
      },
      {
        title: 'זווית שטוחה',
        say: 'יש עוד סוג אחד: זווית שטוחה. כששתי הקרניים נפתחות לקו ישר, כמו מקל שוכב — זאת זווית שטוחה. פינת הדף קטנה ממנה בהרבה!',
        render(stage) {
          stage.innerHTML = `<div class="geo-row two">
              <div class="geo-fig"><p class="muted">זווית ישרה</p>${K.geoArt.angleSVG({ deg: 90, rot: 0, size: 200, paper: true, names: true, markRight: true })}</div>
              <div class="geo-fig"><p class="muted">זווית שטוחה</p>${K.geoArt.angleSVG({ deg: 180, rot: 0, size: 200, paper: true, names: true })}</div>
            </div>
            <p class="trick-note">בזווית שטוחה הקרניים ממשיכות זו את זו ויוצרות קו ישר. אפשר לחשוב על זה כחצי סיבוב.</p>
            <div class="geo-stage" id="gs"></div>`;
          const dial = K.geoArt.mountDial($('#gs', stage), { deg: 150, rot: 0, size: 260, showName: true, onChange() {} });
          return () => dial.destroy();
        }
      },
      {
        title: 'מוכנה?',
        ready: true,
        say: 'יופי! עכשיו את מכירה זווית חדה, ישרה, קהה ושטוחה, ויודעת לבדוק אותן עם פינת דף. בואי נתרגל!',
        render(stage) {
          stage.innerHTML = `<div class="ready"><ul class="recap">
            <li><span>1</span> זווית היא הפתיחה בין שתי קרניים שנפגשות בקודקוד.</li>
            <li><span>2</span> פינת דף היא זווית ישרה. מצמידים אותה כדי לבדוק.</li>
            <li><span>3</span> קטנה מפינת הדף — חדה. גדולה ממנה — קהה.</li>
            <li><span>4</span> נפתחת לקו ישר — זווית שטוחה.</li>
            <li><span>★</span> גם אם מסובבים את הזווית, הסוג שלה לא משתנה!</li>
          </ul></div>`;
        }
      }
    ];
  }

  route('geo-lesson', { chrome: 'flow', render(root, unit) {
    if (unit && unit !== 'angles') return go('garden', true);
    const st = K.store.state, c = K.CHARACTERS[st.char] || K.CHARACTERS.bear;
    const stepsList = steps(c.id); let i = 0, stageCleanup = null;
    root.style.setProperty('--tc', '#ff6fae');
    root.innerHTML = `<div class="flow lesson geo-lesson">
      <header class="flow-bar"><button class="icon-btn" id="x" aria-label="יציאה לגן">${I().close}</button><div class="step-dots" id="sd"></div><span class="flow-title">זוויות</span></header>
      <div class="lesson-body"><div class="coach"><div class="coach-char" id="cc"></div><div id="cb"></div></div><h2 class="step-title" id="tt"></h2><div class="stage" id="stage"></div></div>
      <footer class="flow-foot"><button class="btn btn-secondary" id="prev">הקודם</button><button class="btn btn-primary btn-lg" id="next">הבא</button></footer></div>`;
    const stage = $('#stage', root);
    function show(dir = 1) {
      if (stageCleanup) { try { stageCleanup(); } catch (e) {} stageCleanup = null; }
      const s = stepsList[i];
      $('#sd', root).innerHTML = stepsList.map((_, k) => `<i class="${k === i ? 'on' : k < i ? 'done' : ''}"></i>`).join('');
      $('#cc', root).innerHTML = K.art.char(c.id, s.ready ? 'cheer' : 'happy');
      $('#cb', root).innerHTML = K.ui.bubble(s.say);
      $('#tt', root).textContent = s.title;
      stage.className = 'stage ' + (dir > 0 ? 'in-next' : 'in-prev'); stage.innerHTML = '';
      void stage.offsetWidth; stage.classList.add('go');
      const r = s.render(stage); if (typeof r === 'function') stageCleanup = r;
      $('#prev', root).style.visibility = i === 0 ? 'hidden' : 'visible';
      const nx = $('#next', root);
      nx.textContent = s.ready ? 'לתרגול! 🎯' : 'הבא';
      if (s.ready) { K.geoStore.ustate('angles').lesson = true; K.store.save(); A('fanfare'); setTimeout(() => confetti({ y: innerHeight * .4, count: 50, stars: true }), 200); }
    }
    $('#next', root).onclick = () => { if (stepsList[i].ready) return go('geo-practice/angles'); i++; A('whoosh'); show(1); };
    $('#prev', root).onclick = () => { if (i > 0) { i--; A('tap'); show(-1); } };
    $('#x', root).onclick = () => go('garden');
    show();
    return () => stageCleanup && stageCleanup();
  } });
})();
