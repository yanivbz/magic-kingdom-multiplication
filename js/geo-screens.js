/* Garden region map + unit sheet. Does not modify K.AREAS or the kefel crown. */
(function () {
  const { $, $$, go, route, sheet, toast } = K.ui;
  const I = () => K.art.icons;
  const A = (n, v) => K.audio.play(n, v);
  const S = () => K.store.state;
  const chr = () => K.CHARACTERS[S().char] || K.CHARACTERS.bear;
  const region = () => K.GEO.region;

  function unitSheet(id) {
    const U = K.GEO.UNITS.find(u => u.id === id);
    if (!U) return;
    if (!U.ready) {
      toast(`${U.name}: היחידה הזאת תגיע בקרוב!`);
      A('wrong');
      return;
    }
    const ts = K.geoStore.ustate(id);
    const lessonFirst = !ts.lesson;
    const s = sheet(`<div class="tsheet">
      <div class="tbadge" style="--nc:${U.color}">${U.emoji}</div>
      <h2>${U.name}</h2><p class="muted">${region().emoji} ${region().name}</p>
      <div class="stars-big">${K.ui.starsRow(ts.stars, 3)}</div>
      <p class="tip">${U.tip}</p>
      <div class="tsheet-actions">
        <button class="btn ${lessonFirst ? 'btn-primary' : 'btn-secondary'} btn-lg" id="les">${I().book} ${lessonFirst ? 'שיעור קצר (מומלץ)' : 'חוזרים על השיעור'}</button>
        <button class="btn ${lessonFirst ? 'btn-secondary' : 'btn-primary'} btn-lg" id="prac">🎯 תרגול</button>
      </div></div>`);
    $('#les', s.el).onclick = () => { s.close(); go('geo-lesson/' + id); };
    $('#prac', s.el).onclick = () => { s.close(); go('geo-practice/' + id); };
  }

  route('garden', { chrome: 'tabs', render(root) {
    const st = S(), c = chr(), g = region(), first = K.geoStore.meet();
    const medal = K.geoStore.geo().medals.garden;
    const M = medal ? K.MEDALS[medal] : null;
    const units = K.GEO.UNITS;
    root.innerHTML = `<div class="garden">
      <div class="garden-head">
        <button class="btn btn-secondary" id="backMap">חזרה למפת הממלכה</button>
        <div class="coin-pill">${I().coin}<b>${st.coins}</b></div>
      </div>
      ${K.geoArt.gardenBanner()}
      <div class="friend card garden-friend">
        <div class="friend-top"><span class="friend-e" aria-hidden="true">${g.friend.emoji}</span><div><small>${g.emoji} ${g.name}</small><b>${g.friend.name}</b></div></div>
        ${K.ui.bubble(g.friend.line)}
      </div>
      <div class="mission card">
        <div class="mission-top"><div class="mission-char">${K.art.char(c.id, 'happy')}</div>${K.ui.bubble(first ? 'ברוכה הבאה לגן הצורות! נתחיל מזוויות — זה הנושא שהכי כדאי לחזק.' : 'בואי נמשיך עם הזוויות, או ננסה את אתגר האלופה של הגן.')}</div>
        <button class="btn btn-primary btn-lg" id="mission">${K.geoStore.ustate('angles').lesson ? 'לתרגול זוויות' : 'לשיעור הזוויות'}</button>
      </div>
      <div class="garden-units" role="list">
        ${units.map((u, i) => {
          const ts = K.geoStore.ustate(u.id);
          const locked = !u.ready;
          return `<button class="gunit${locked ? ' locked' : ''}" data-id="${u.id}" role="listitem" style="--nc:${u.color}" ${locked ? '' : ''} aria-label="${u.name}${locked ? ', בקרוב' : ', ' + ts.stars + ' כוכבים'}">
            <span class="gu-e" aria-hidden="true">${u.emoji}</span>
            <span class="gu-n"><b>${i + 1}. ${u.name}</b><small>${locked ? 'בקרוב' : u.blurb}</small></span>
            ${locked ? `<span class="gu-lock">${I().lock || '🔒'} בקרוב</span>` : `<span class="gu-stars">${K.ui.starsRow(ts.stars, 3, 'sm')}</span>`}
          </button>`;
        }).join('')}
      </div>
      <div class="champ-box garden-champ">
        <span class="champ-medal" aria-hidden="true">${M ? M.emoji : '🏆'}</span>
        <div><b>אתגר האלופה של הגן</b>
          <small>${M ? `יש לך מדליית ${M.name}! אפשר לנסות לשפר.` : 'מבחן מעורב על זוויות. מדליה מעניקה את שרביט הצורות — בנפרד מכתר הכפל של הממלכה.'}</small>
          <small class="muted">ארד 55% · כסף 75% · זהב 90%</small>
        </div>
        <button class="btn btn-primary" id="champ">🏆 לאתגר!</button>
      </div>
    </div>`;
    $('#backMap').onclick = () => { A('pop'); go('map'); };
    $('#mission').onclick = () => { A('pop'); const ts = K.geoStore.ustate('angles'); go(ts.lesson ? 'geo-practice/angles' : 'geo-lesson/angles'); };
    $('#champ').onclick = () => { A('pop'); go('geo-practice/champ'); };
    $$('.gunit', root).forEach(b => b.onclick = () => { A('pop'); unitSheet(b.dataset.id); });
  } });

  K.geoUI = { unitSheet };
})();
