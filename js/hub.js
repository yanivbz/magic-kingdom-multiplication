/* Home hub + "ההתקדמות שלי" progress screen. */
(function () {
  const { $, $$, go, route } = K.ui;
  const S = () => K.store.state;
  const A = (n, v) => K.audio.play(n, v);
  const I = () => K.art.icons;
  const chr = () => K.CHARACTERS[S().char] || K.CHARACTERS.bear;
  const esc = K.ui.esc;

  route('hub', { chrome: 'tabs', render(root) {
    const st = S(), c = chr(), m = K.mission.hubNext();
    const name = st.name ? esc(st.name) : 'עומר';
    root.innerHTML = `<div class="hub">
      <div class="hub-hello">
        <div class="hub-char">${K.art.char(c.id, 'happy')}</div>
        <div class="hub-hi">
          <h1>שלום ${name}!</h1>
          <p>${c.name} איתך במסע. לאן נלך?</p>
        </div>
      </div>
      ${K.mission.nowCard(m, c)}
      <div class="worlds">
        <button class="world-btn kefel" id="toKefel" type="button">
          <span class="wb-e" aria-hidden="true">🏰</span>
          <span class="wb-t"><b>ממלכת הכפל</b><small>טבלאות, משחקים ומדליות</small></span>
        </button>
        <button class="world-btn garden" id="toGarden" type="button">
          <span class="wb-e" aria-hidden="true">🌸</span>
          <span class="wb-t"><b>גן הצורות</b><small>זוויות וצורות עם קשתית</small></span>
        </button>
      </div>
      <button class="btn btn-secondary btn-lg" id="toProg">✨ ההתקדמות שלי</button>
    </div>`;
    $('#mission').onclick = () => { A('pop'); K.mission.start(m); };
    $('#toKefel').onclick = () => { A('pop'); K.mission.setWorld('kefel'); go('map'); };
    $('#toGarden').onclick = () => { A('pop'); K.mission.setWorld('garden'); go('garden'); };
    $('#toProg').onclick = () => { A('pop'); go('progress'); };
  } });

  route('progress', { chrome: 'tabs', render(root) {
    const st = S(), fa = K.mission.friendArea();
    const pieces = K.store.crownPieces();
    const g = K.GEO && K.GEO.region;
    const geoMedal = K.geoStore ? K.geoStore.geo().medals.garden : null;
    const GM = geoMedal ? K.MEDALS[geoMedal] : null;
    const met = (st.friends || []).map(id => K.AREAS.find(a => a.id === id)).filter(Boolean);
    const kashet = g && K.geoStore && (K.geoStore.geo().friends || []).length;
    root.innerHTML = `<div class="progress-page">
      <h1 class="prog-title">ההתקדמות שלי</h1>
      <div class="prog-grid">
        <div class="crown-card card" id="crownCard">${K.art.crown()}<div><b>הכתר של הממלכה</b><small>${pieces} מתוך ${K.AREAS.length} חלקים · כל מדליה באתגר האלופה של אזור מוסיפה חלק</small></div></div>
        ${g ? `<div class="crown-card card geo-wand-card"><span class="wand-e" aria-hidden="true">${GM ? GM.emoji : '🪄'}</span><div><b>${g.wand.name}</b><small>${GM ? `יש לך מדליית ${GM.name} בגן הצורות.` : 'המדליה של גן הצורות נפרדת מכתר הכפל. מרוויחים אותה באתגר האלופה של הגן.'}</small></div></div>` : ''}
        <div class="week card">${K.mission.weekStrip()}</div>
        ${K.mission.orderRow()}
        <div class="friend card">
          <div class="friend-top"><span class="friend-e" aria-hidden="true">${fa.friend.emoji}</span><div><small>${fa.emoji} ${fa.name}</small><b>${fa.friend.name}</b></div></div>
          ${K.ui.bubble(fa.friend.line)}
          ${(met.length || kashet) ? `<div class="friend-met">${met.map(a => `<span class="fchip" title="${a.friend.name}">${a.friend.emoji} ${a.friend.name}</span>`).join('')}${kashet ? `<span class="fchip">${g.friend.emoji} ${g.friend.name}</span>` : ''}</div>` : ''}
        </div>
        <div class="prog-links card">
          <b>עוד בממלכה</b>
          <div class="map-tools">
            <button class="tool-btn" id="toExp" type="button">${I().grid}<span>לוח הכפל</span></button>
            <button class="tool-btn" id="toIntro" type="button">${I().book}<span>מה זה כפל?</span></button>
          </div>
        </div>
      </div>
    </div>`;
    $('#crownCard').onclick = () => { A('pop'); go('home'); };
    $('#toExp').onclick = () => { A('pop'); go('explorer'); };
    $('#toIntro').onclick = () => { A('pop'); go('intro'); };
  } });
})();
