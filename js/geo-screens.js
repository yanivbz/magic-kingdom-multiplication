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
    K.mission.setWorld('garden');
    const st = S(), c = chr(), g = region();
    K.geoStore.meet();
    const mission = K.mission.gardenNext();
    const medal = K.geoStore.geo().medals.garden;
    const M = medal ? K.MEDALS[medal] : null;
    const units = K.GEO.UNITS;
    root.innerHTML = `<div class="garden">
      ${K.mission.nowCard(mission, c)}
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
    </div>`;
    $('#mission').onclick = () => { A('pop'); K.mission.start(mission); };
    if (K.examUI) K.examUI.bindExam(root);
    $$('.gunit', root).forEach(b => b.onclick = () => { A('pop'); unitSheet(b.dataset.id); });
  } });

  K.geoUI = { unitSheet };
})();
