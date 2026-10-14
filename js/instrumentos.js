/* ============================================================================
   INSTRUMENTOS.JS — Componentes interactivos de la práctica
   1. Trayectoria : esquema de la parábola y sus componentes
   2. Montaje     : lanzador, compuerta y sensor, con puntos sensibles
   3. Simulador   : tiro parabólico en vivo y curva de alcance
   4. Analisis    : promedios, Tabla 2, gráfica del alcance, v₀ y gravedad
   ========================================================================== */

const SIN_MOVIMIENTO = window.matchMedia &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function fmt(x, d){ return Number(x).toFixed(d).replace('.', ','); }

function leerNum(id){
  const el = document.getElementById(id);
  if (!el) return null;
  const n = parseFloat(String(el.value).replace(/\s/g, '').replace(',', '.'));
  return isFinite(n) ? n : null;
}

/* Flecha con punta, usada por varios esquemas */
function flecha(x1, y1, x2, y2, color, ancho){
  const a = Math.atan2(y2 - y1, x2 - x1), p = 9;
  return `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}"
            stroke="${color}" stroke-width="${ancho}"/>
          <path d="M ${(x2 - p*Math.cos(a-0.38)).toFixed(1)} ${(y2 - p*Math.sin(a-0.38)).toFixed(1)}
                   L ${x2.toFixed(1)} ${y2.toFixed(1)}
                   L ${(x2 - p*Math.cos(a+0.38)).toFixed(1)} ${(y2 - p*Math.sin(a+0.38)).toFixed(1)}"
            fill="none" stroke="${color}" stroke-width="${ancho}"
            stroke-linejoin="round" stroke-linecap="round"/>`;
}

/* Tiempo de vuelo y trayectoria, dados v₀, θ (grados), y₀ y g */
function vuelo(v0, angGr, y0, g){
  const r = angGr * Math.PI / 180;
  const vx = v0 * Math.cos(r), vy = v0 * Math.sin(r);
  const tv = (vy + Math.sqrt(vy*vy + 2*g*Math.max(0, y0))) / g;
  return { vx, vy, tv, alcance: vx * tv, sube: vy*vy/(2*g), alturaMax: y0 + vy*vy/(2*g) };
}

/* ==========================================================================
   1. ESQUEMA DE LA TRAYECTORIA
   ========================================================================== */
const Trayectoria = (() => {
  function montar(id){
    const host = document.getElementById(id);
    if (!host) return;

    const V0 = 2.35, ANG = 35, Y0 = 0.228, G = 9.80;
    const d = vuelo(V0, ANG, Y0, G);
    const M = { l: 96, r: 40, t: 46, b: 92 };
    const W = 660, H = 350;
    const xMax = d.alcance * 1.1, yMax = d.alturaMax * 1.25;
    const px = x => M.l + x / xMax * (W - M.l - M.r);
    const py = y => (H - M.b) - y / yMax * (H - M.b - M.t);

    /* la parábola, con la mesa en y = 0 y la salida en y = Y0 */
    let dPath = '';
    for (let k = 0; k <= 90; k++){
      const t = d.tv * k / 90;
      const x = d.vx * t, y = Y0 + d.vy * t - 0.5 * G * t * t;
      dPath += (k ? 'L' : 'M') + px(x).toFixed(1) + ' ' + py(Math.max(0, y)).toFixed(1) + ' ';
    }
    const tCima = d.vy / G;
    const xCima = d.vx * tCima;

    const sal = { x: px(0), y: py(Y0) };
    const esc2 = 42;                                      // escala de los vectores
    const ux = d.vx / V0, uy = d.vy / V0;

    host.innerHTML = `
    <svg viewBox="0 0 ${W} ${H}" role="img"
         aria-label="Trayectoria parabólica con la altura inicial, la altura máxima, el alcance y las componentes de la velocidad inicial">

      <!-- mesa -->
      <line class="g-eje" x1="${M.l - 44}" y1="${py(0).toFixed(1)}" x2="${W - 18}" y2="${py(0).toFixed(1)}"/>
      <text class="m-lab" x="${W - 18}" y="${(py(0) + 20).toFixed(1)}" text-anchor="end">mesa</text>

      <!-- altura inicial -->
      <line x1="${(sal.x - 36).toFixed(1)}" y1="${py(0).toFixed(1)}"
            x2="${(sal.x - 36).toFixed(1)}" y2="${sal.y.toFixed(1)}" stroke="#0C2B52" stroke-width="2.2"/>
      <path d="M ${(sal.x - 41).toFixed(1)} ${(sal.y + 10).toFixed(1)} L ${(sal.x - 36).toFixed(1)} ${sal.y.toFixed(1)} L ${(sal.x - 31).toFixed(1)} ${(sal.y + 10).toFixed(1)}"
            fill="none" stroke="#0C2B52" stroke-width="2" stroke-linejoin="round"/>
      <path d="M ${(sal.x - 41).toFixed(1)} ${(py(0) - 10).toFixed(1)} L ${(sal.x - 36).toFixed(1)} ${py(0).toFixed(1)} L ${(sal.x - 31).toFixed(1)} ${(py(0) - 10).toFixed(1)}"
            fill="none" stroke="#0C2B52" stroke-width="2" stroke-linejoin="round"/>
      <line x1="${(sal.x - 42).toFixed(1)}" y1="${sal.y.toFixed(1)}" x2="${sal.x.toFixed(1)}" y2="${sal.y.toFixed(1)}"
            stroke="#8A8171" stroke-width="1" stroke-dasharray="4 3"/>
      <text class="m-et" x="${(sal.x - 48).toFixed(1)}" y="${((sal.y + py(0))/2 + 5).toFixed(1)}" text-anchor="end">y₀</text>

      <!-- trayectoria -->
      <path d="${dPath}" fill="none" stroke="#0C2B52" stroke-width="3" stroke-linejoin="round"/>

      <!-- altura máxima -->
      <line x1="${px(xCima).toFixed(1)}" y1="${py(d.alturaMax).toFixed(1)}"
            x2="${px(xCima).toFixed(1)}" y2="${py(0).toFixed(1)}"
            stroke="#C87020" stroke-width="1.2" stroke-dasharray="4 3"/>
      <circle cx="${px(xCima).toFixed(1)}" cy="${py(d.alturaMax).toFixed(1)}" r="5" fill="#C87020"/>
      <text class="m-et" x="${px(xCima).toFixed(1)}" y="${(py(d.alturaMax) - 36).toFixed(1)}"
            fill="#C87020" text-anchor="middle">y máx</text>
      <text class="m-lab" x="${px(xCima).toFixed(1)}" y="${(py(d.alturaMax) - 18).toFixed(1)}"
            text-anchor="middle">aquí v<tspan dy="4" font-size="10">y</tspan><tspan dy="-4"> = 0</tspan></text>

      <!-- alcance -->
      <line x1="${px(0).toFixed(1)}" y1="${(py(0) + 34).toFixed(1)}"
            x2="${px(d.alcance).toFixed(1)}" y2="${(py(0) + 34).toFixed(1)}"
            stroke="#C87020" stroke-width="2.2"/>
      <path d="M ${(px(0) + 10).toFixed(1)} ${(py(0) + 29).toFixed(1)} L ${px(0).toFixed(1)} ${(py(0) + 34).toFixed(1)} L ${(px(0) + 10).toFixed(1)} ${(py(0) + 39).toFixed(1)}"
            fill="none" stroke="#C87020" stroke-width="2" stroke-linejoin="round"/>
      <path d="M ${(px(d.alcance) - 10).toFixed(1)} ${(py(0) + 29).toFixed(1)} L ${px(d.alcance).toFixed(1)} ${(py(0) + 34).toFixed(1)} L ${(px(d.alcance) - 10).toFixed(1)} ${(py(0) + 39).toFixed(1)}"
            fill="none" stroke="#C87020" stroke-width="2" stroke-linejoin="round"/>
      <line x1="${px(0).toFixed(1)}" y1="${sal.y.toFixed(1)}" x2="${px(0).toFixed(1)}" y2="${(py(0) + 38).toFixed(1)}"
            stroke="#8A8171" stroke-width="1" stroke-dasharray="4 3"/>
      <text class="m-et" x="${((px(0) + px(d.alcance))/2).toFixed(1)}" y="${(py(0) + 54).toFixed(1)}"
            fill="#C87020" text-anchor="middle">alcance x</text>

      <!-- componentes de la velocidad inicial -->
      ${flecha(sal.x, sal.y, sal.x + ux*esc2*2.1, sal.y - uy*esc2*2.1, '#A62F26', 3)}
      <text class="m-et" x="${(sal.x + ux*esc2*2.1 + 8).toFixed(1)}" y="${(sal.y - uy*esc2*2.1 - 6).toFixed(1)}"
            fill="#A62F26" text-anchor="start">v₀</text>
      ${flecha(sal.x, sal.y, sal.x + ux*esc2*2.1, sal.y, '#2F6B4A', 2.2)}
      <text class="m-lab" x="${(sal.x + ux*esc2*1.05).toFixed(1)}" y="${(sal.y + 16).toFixed(1)}"
            text-anchor="middle" fill="#2F6B4A">v₀·cos θ</text>
      ${flecha(sal.x, sal.y, sal.x, sal.y - uy*esc2*2.1, '#2F6B4A', 2.2)}
      <text class="m-lab" x="${(sal.x - 8).toFixed(1)}" y="${(sal.y - uy*esc2*1.05).toFixed(1)}"
            text-anchor="end" fill="#2F6B4A">v₀·sen θ</text>
      <line x1="${(sal.x + ux*esc2*2.1).toFixed(1)}" y1="${sal.y.toFixed(1)}"
            x2="${(sal.x + ux*esc2*2.1).toFixed(1)}" y2="${(sal.y - uy*esc2*2.1).toFixed(1)}"
            stroke="#8A8171" stroke-width="1" stroke-dasharray="3 3"/>
      <line x1="${sal.x.toFixed(1)}" y1="${(sal.y - uy*esc2*2.1).toFixed(1)}"
            x2="${(sal.x + ux*esc2*2.1).toFixed(1)}" y2="${(sal.y - uy*esc2*2.1).toFixed(1)}"
            stroke="#8A8171" stroke-width="1" stroke-dasharray="3 3"/>

      <!-- ángulo -->
      <path d="M ${(sal.x + 34).toFixed(1)} ${sal.y.toFixed(1)} A 34 34 0 0 0 ${(sal.x + 34*ux).toFixed(1)} ${(sal.y - 34*uy).toFixed(1)}"
            fill="none" stroke="#C87020" stroke-width="1.8"/>
      <text class="m-et" x="${(sal.x + 42).toFixed(1)}" y="${(sal.y - 8).toFixed(1)}" fill="#C87020">θ</text>
    </svg>
    <div class="montaje__leyenda">
      <b>Dos movimientos a la vez.</b> La componente horizontal de la velocidad, en verde, no
      cambia nunca: el proyectil avanza siempre a la misma rapidez. La vertical disminuye, se anula
      en el punto más alto y después crece hacia abajo. La trayectoria que resulta de combinarlas
      es una parábola, y como la salida está a una altura y₀ sobre la mesa, la bola recorre más
      bajando que subiendo.
    </div>`;
  }
  return { montar };
})();

/* ==========================================================================
   2. MONTAJE CON PUNTOS SENSIBLES
   ========================================================================== */
const Montaje = (() => {
  function montar(id){
    const host = document.getElementById(id);
    if (!host) return;

    const V0 = 2.35, ANG = 32, Y0 = 0.225, G = 9.80;
    const d = vuelo(V0, ANG, Y0, G);

    /* Geometría del dibujo. Se elige de modo que el impacto quede a media mesa:
       así queda sitio a la derecha para el cronómetro sin que la trayectoria lo
       atraviese, y ninguna etiqueta se monta sobre otra. */
    const XS = 168, YMESA = 320;                   // salida del cañón y nivel de la mesa
    const ESC_Y = 142 / d.alturaMax;               // la cima queda 142 px sobre la mesa
    const ESC_X = 332 / d.alcance;                 // el impacto, 332 px a la derecha
    const px = x => XS + x * ESC_X;
    const py = y => YMESA - y * ESC_Y;

    let traza = '';
    for (let k = 0; k <= 90; k++){
      const t = d.tv * k / 90;
      const x = d.vx * t, y = Y0 + d.vy * t - 0.5 * G * t * t;
      traza += (k ? 'L' : 'M') + px(x).toFixed(1) + ' ' + py(Math.max(0, y)).toFixed(1) + ' ';
    }
    const ySal = py(Y0), xFin = px(d.alcance);
    const xCima = px(d.vx * d.vy / G), yCima = py(d.alturaMax);
    /* El punto sensible de la trayectoria no va en la cima —ahí pasa el cable—
       sino sobre la rama descendente. */
    const tP = d.tv * 0.70, xP = px(d.vx * tP), yP = py(Y0 + d.vy*tP - 0.5*G*tP*tP);
    const CX = 545, CY = YMESA - 78;               // esquina del cronómetro

    host.innerHTML = `
    <svg viewBox="24 146 664 256" role="img"
         aria-label="Lanzador de proyectiles con transportador, compuerta óptica, trayectoria, sensor de impacto y cronómetro de dos canales">

      <!-- mesa -->
      <rect x="30" y="${YMESA}" width="650" height="13" fill="#8F8C80" stroke="#1F1C17" stroke-width="2"/>
      <text class="m-lab" x="674" y="${YMESA + 28}" text-anchor="end">mesa</text>

      <!-- columna del lanzador -->
      <path d="M 84 ${YMESA} L 98 ${(ySal + 44).toFixed(1)} L 138 ${(ySal + 44).toFixed(1)} L 152 ${YMESA} Z"
            fill="#4A4234" stroke="#1F1C17" stroke-width="2" stroke-linejoin="round"/>

      <!-- transportador -->
      <path d="M ${XS - 54} ${(ySal + 30).toFixed(1)} A 56 56 0 0 1 ${XS + 58} ${(ySal + 30).toFixed(1)}"
            fill="none" stroke="#8A8171" stroke-width="2"/>
      <text class="m-lab" x="${XS + 72}" y="${(ySal + 35).toFixed(1)}" text-anchor="start">transportador</text>

      <!-- cañón -->
      <g transform="rotate(${-ANG} ${XS} ${ySal.toFixed(1)})">
        <rect x="${XS - 86}" y="${(ySal - 15).toFixed(1)}" width="96" height="30" rx="5"
              fill="#D6DEE9" stroke="#0C2B52" stroke-width="2.4"/>
        <rect x="${XS - 96}" y="${(ySal - 10).toFixed(1)}" width="14" height="20" rx="3"
              fill="#A8A497" stroke="#1F1C17" stroke-width="1.6"/>
      </g>

      <!-- compuerta óptica -->
      <rect x="${XS - 9}" y="${(ySal - 34).toFixed(1)}" width="18" height="26" rx="3"
            fill="#5A5346" stroke="#1F1C17" stroke-width="1.8"/>
      <circle cx="${XS}" cy="${(ySal - 21).toFixed(1)}" r="3.4" fill="#C0272D"/>
      <line x1="${XS - 11}" y1="${(ySal - 30).toFixed(1)}" x2="${XS - 26}" y2="${(ySal - 46).toFixed(1)}"
            stroke="#8A8171" stroke-width="1.2"/>
      <text class="m-lab" x="${XS - 30}" y="${(ySal - 46).toFixed(1)}" text-anchor="end">compuerta óptica</text>

      <!-- trayectoria -->
      <path d="${traza}" fill="none" stroke="#0C2B52" stroke-width="2.6" stroke-dasharray="6 5"/>

      <!-- altura inicial, acotada a la izquierda de la columna -->
      <line x1="70" y1="${YMESA}" x2="70" y2="${ySal.toFixed(1)}"
            stroke="#2F6B4A" stroke-width="2.2"/>
      <path d="M 65 ${(ySal + 10).toFixed(1)} L 70 ${ySal.toFixed(1)} L 75 ${(ySal + 10).toFixed(1)}"
            fill="none" stroke="#2F6B4A" stroke-width="2" stroke-linejoin="round"/>
      <path d="M 65 ${YMESA - 10} L 70 ${YMESA} L 75 ${YMESA - 10}"
            fill="none" stroke="#2F6B4A" stroke-width="2" stroke-linejoin="round"/>
      <line x1="70" y1="${ySal.toFixed(1)}" x2="${XS - 12}" y2="${ySal.toFixed(1)}"
            stroke="#2F6B4A" stroke-width="1" stroke-dasharray="4 3"/>
      <text class="m-et" x="62" y="${(ySal + 44).toFixed(1)}" text-anchor="end" fill="#2F6B4A">y₀</text>

      <!-- sensor de impacto -->
      <rect x="${(xFin - 40).toFixed(1)}" y="${YMESA - 13}" width="80" height="13" rx="2"
            fill="#3F3A33" stroke="#1F1C17" stroke-width="1.8"/>
      <rect x="${(xFin - 34).toFixed(1)}" y="${YMESA - 19}" width="68" height="6"
            fill="#EDE5CF" stroke="#1F1C17" stroke-width="1.2"/>
      <line x1="${(xFin - 30).toFixed(1)}" y1="${YMESA - 22}" x2="${(xFin - 34).toFixed(1)}" y2="${YMESA - 32}"
            stroke="#8A8171" stroke-width="1.2"/>
      <text class="m-lab" x="${(xFin - 36).toFixed(1)}" y="${YMESA - 34}" text-anchor="end">sensor de impacto</text>

      <!-- alcance -->
      <line x1="${px(0).toFixed(1)}" y1="${YMESA + 46}" x2="${xFin.toFixed(1)}" y2="${YMESA + 46}"
            stroke="#C87020" stroke-width="2.2"/>
      <path d="M ${(px(0) + 10).toFixed(1)} ${YMESA + 41} L ${px(0).toFixed(1)} ${YMESA + 46} L ${(px(0) + 10).toFixed(1)} ${YMESA + 51}"
            fill="none" stroke="#C87020" stroke-width="2" stroke-linejoin="round"/>
      <path d="M ${(xFin - 10).toFixed(1)} ${YMESA + 41} L ${xFin.toFixed(1)} ${YMESA + 46} L ${(xFin - 10).toFixed(1)} ${YMESA + 51}"
            fill="none" stroke="#C87020" stroke-width="2" stroke-linejoin="round"/>
      <line x1="${px(0).toFixed(1)}" y1="${ySal.toFixed(1)}" x2="${px(0).toFixed(1)}" y2="${YMESA + 50}"
            stroke="#8A8171" stroke-width="1" stroke-dasharray="4 3"/>
      <text class="m-et" x="${((px(0) + xFin)/2).toFixed(1)}" y="${YMESA + 64}"
            fill="#C87020" text-anchor="middle">alcance x</text>

      <!-- cronómetro, sobre la mesa y más allá del punto de impacto -->
      <rect x="${CX}" y="${CY}" width="120" height="72" rx="7" fill="#EDE5CF"
            stroke="#1F1C17" stroke-width="2.4"/>
      <rect x="${CX + 12}" y="${CY + 12}" width="96" height="24" rx="3" fill="#0C2B52"/>
      <text class="m-visor" x="${CX + 60}" y="${CY + 29}" text-anchor="middle">0.3641 s</text>
      <circle cx="${CX + 24}" cy="${CY + 54}" r="5.4" fill="#C87020" stroke="#1F1C17" stroke-width="1.3"/>
      <circle cx="${CX + 48}" cy="${CY + 54}" r="5.4" fill="#E5DBC1" stroke="#1F1C17" stroke-width="1.3"/>
      <circle cx="${CX + 72}" cy="${CY + 54}" r="5.4" fill="#E5DBC1" stroke="#1F1C17" stroke-width="1.3"/>
      <text class="m-lab" x="${CX + 60}" y="${CY - 10}" text-anchor="middle">cronómetro · 2 canales</text>
      <!-- cable 1: compuerta → entrada 1, por encima de la parábola -->
      <path d="M ${XS + 11} ${(ySal - 24).toFixed(1)} C 260 ${(yCima - 24).toFixed(1)} 430 ${(yCima - 6).toFixed(1)} ${CX + 4} ${CY + 18}"
            fill="none" stroke="#1F1C17" stroke-width="1.2" stroke-dasharray="3 4" opacity=".42"/>
      <!-- cable 2: sensor → entrada 2, a ras de mesa -->
      <path d="M ${(xFin + 40).toFixed(1)} ${YMESA - 7} C ${(xFin + 62).toFixed(1)} ${YMESA - 7} ${CX - 10} ${YMESA - 4} ${CX + 4} ${CY + 60}"
            fill="none" stroke="#1F1C17" stroke-width="1.2" stroke-dasharray="3 4" opacity=".42"/>

      <!-- puntos sensibles -->
      <g class="punto-caliente" data-parte="lan" tabindex="0" role="button" aria-label="Lanzador de proyectiles">
        <circle cx="118" cy="${YMESA - 30}" r="14" fill="#C87020" fill-opacity=".18" stroke="#C87020" stroke-width="2"/>
      </g>
      <g class="punto-caliente" data-parte="ang" tabindex="0" role="button" aria-label="Transportador y ángulo">
        <circle cx="${XS + 56}" cy="${(ySal + 28).toFixed(1)}" r="13" fill="#C87020" fill-opacity=".18" stroke="#C87020" stroke-width="2"/>
      </g>
      <g class="punto-caliente" data-parte="com" tabindex="0" role="button" aria-label="Compuerta óptica">
        <circle cx="${XS}" cy="${(ySal - 21).toFixed(1)}" r="13" fill="#C87020" fill-opacity=".18" stroke="#C87020" stroke-width="2"/>
      </g>
      <g class="punto-caliente" data-parte="y0" tabindex="0" role="button" aria-label="Altura inicial">
        <circle cx="70" cy="${(ySal + 22).toFixed(1)}" r="12" fill="#C87020" fill-opacity=".18" stroke="#C87020" stroke-width="2"/>
      </g>
      <g class="punto-caliente" data-parte="tra" tabindex="0" role="button" aria-label="Trayectoria parabólica">
        <circle cx="${xP.toFixed(1)}" cy="${yP.toFixed(1)}" r="14" fill="#C87020" fill-opacity=".18" stroke="#C87020" stroke-width="2"/>
      </g>
      <g class="punto-caliente" data-parte="alc" tabindex="0" role="button" aria-label="Alcance horizontal">
        <circle cx="${(px(0) + 72).toFixed(1)}" cy="${YMESA + 46}" r="13" fill="#C87020" fill-opacity=".18" stroke="#C87020" stroke-width="2"/>
      </g>
      <g class="punto-caliente" data-parte="sen" tabindex="0" role="button" aria-label="Sensor de impacto">
        <circle cx="${(xFin + 26).toFixed(1)}" cy="${YMESA - 7}" r="13" fill="#C87020" fill-opacity=".18" stroke="#C87020" stroke-width="2"/>
      </g>
      <g class="punto-caliente" data-parte="cro" tabindex="0" role="button" aria-label="Cronómetro">
        <circle cx="${CX + 96}" cy="${CY + 54}" r="13" fill="#C87020" fill-opacity=".18" stroke="#C87020" stroke-width="2"/>
      </g>
    </svg>
    <div class="montaje__leyenda" id="montaje-leyenda" role="status" aria-live="polite">
      <b>Toca un punto naranja</b> para leer qué función cumple cada parte del montaje. El origen
      del movimiento es la compuerta óptica, no la boca del cañón: desde ahí se miden el tiempo, la
      altura y el alcance.
    </div>`;

    const leyenda = host.querySelector('#montaje-leyenda');
    const mostrar = clave => {
      const p = PARTES.find(x => x.id === clave);
      if (p) leyenda.innerHTML = `<b>${esc(p.n)}.</b> ${esc(p.d)}`;
    };
    host.querySelectorAll('.punto-caliente').forEach(g => {
      g.addEventListener('click', () => mostrar(g.dataset.parte));
      g.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' '){ mostrar(g.dataset.parte); e.preventDefault(); }
      });
    });
  }
  return { montar };
})();

/* ==========================================================================
   3. SIMULADOR DE TIRO PARABÓLICO
   ========================================================================== */
const Simulador = (() => {
  const VW = 660, VH = 520;
  const T = { l: 70, r: 26, t: 30, b: 300 };            // zona de la trayectoria
  const G2 = { l: 86, r: 26, t: 344, b: 50 };           // zona de la curva de alcance

  let host, svg, ang = 35, v0 = 2.35, y0 = 0.225;
  let t = 0, estado = 'listo', anim = null, ultimo = 0;

  const G = () => G_PEREIRA;
  const datos = () => vuelo(v0, ang, y0, G());

  /* alcance en función del ángulo, con la misma v₀ y la misma altura */
  const alcanceDe = a => vuelo(v0, a, y0, G()).alcance;
  function anguloOptimo(){
    let mejor = 1, mx = -1;
    for (let a = 1; a <= 89; a += 0.25){
      const r = alcanceDe(a);
      if (r > mx){ mx = r; mejor = a; }
    }
    return { ang: mejor, alcance: mx };
  }

  function dibujar(){
    const d = datos(), opt = anguloOptimo();
    const xMax = Math.max(opt.alcance, d.alcance) * 1.08;
    const yMax = Math.max(0.45, d.alturaMax * 1.25);
    const px = x => T.l + x / xMax * (VW - T.l - T.r);
    const py = y => (VH - T.b) - y / yMax * (VH - T.b - T.t);

    let traza = '', recorrido = '';
    for (let k = 0; k <= 90; k++){
      const tt = d.tv * k / 90;
      const x = d.vx * tt, y = y0 + d.vy * tt - 0.5 * G() * tt * tt;
      traza += (k ? 'L' : 'M') + px(x).toFixed(1) + ' ' + py(Math.max(0, y)).toFixed(1) + ' ';
    }
    const tAct = Math.min(t, d.tv);
    const nAct = Math.round(tAct / d.tv * 90);
    for (let k = 0; k <= nAct; k++){
      const tt = d.tv * k / 90;
      const x = d.vx * tt, y = y0 + d.vy * tt - 0.5 * G() * tt * tt;
      recorrido += (k ? 'L' : 'M') + px(x).toFixed(1) + ' ' + py(Math.max(0, y)).toFixed(1) + ' ';
    }
    const xb = d.vx * tAct, yb = Math.max(0, y0 + d.vy * tAct - 0.5 * G() * tAct * tAct);

    /* curva de alcance frente al ángulo */
    const anchoG = VW - G2.r - G2.l, altoG = VH - G2.b - G2.t;
    const aMax = 90, rMax = Math.max(0.1, opt.alcance * 1.15);
    const pxG = a => G2.l + a / aMax * anchoG;
    const pyG = r => (VH - G2.b) - r / rMax * altoG;
    let rej = '', curva = '';
    for (let i = 0; i <= 6; i++){
      const a = aMax * i / 6;
      rej += `<line class="g-rejilla" x1="${pxG(a).toFixed(1)}" y1="${G2.t}" x2="${pxG(a).toFixed(1)}" y2="${VH - G2.b}"/>
              <text class="g-num" x="${pxG(a).toFixed(1)}" y="${VH - G2.b + 15}" text-anchor="middle">${a}</text>`;
    }
    for (let i = 0; i <= 4; i++){
      const r = rMax * i / 4;
      rej += `<line class="g-rejilla" x1="${G2.l}" y1="${pyG(r).toFixed(1)}" x2="${VW - G2.r}" y2="${pyG(r).toFixed(1)}"/>
              <text class="g-num" x="${G2.l - 6}" y="${(pyG(r) + 4).toFixed(1)}" text-anchor="end">${fmt(r,2)}</text>`;
    }
    for (let a = 1; a <= 89; a += 1){
      curva += (a === 1 ? 'M' : 'L') + pxG(a).toFixed(1) + ' ' + pyG(alcanceDe(a)).toFixed(1) + ' ';
    }

    svg.innerHTML = `
      <!-- mesa -->
      <line class="g-eje" x1="${T.l - 34}" y1="${py(0).toFixed(1)}" x2="${VW - 14}" y2="${py(0).toFixed(1)}"/>

      <!-- cañón -->
      <g transform="rotate(${-ang} ${px(0).toFixed(1)} ${py(y0).toFixed(1)})">
        <rect x="${(px(0) - 52).toFixed(1)}" y="${(py(y0) - 9).toFixed(1)}" width="56" height="18" rx="4"
              fill="#D6DEE9" stroke="#0C2B52" stroke-width="2.2"/>
      </g>
      <line x1="${(px(0) - 24).toFixed(1)}" y1="${py(0).toFixed(1)}"
            x2="${px(0).toFixed(1)}" y2="${py(y0).toFixed(1)}" stroke="#4A4234" stroke-width="5"/>
      <line x1="${(px(0) - 26).toFixed(1)}" y1="${py(y0).toFixed(1)}"
            x2="${(px(0) - 26).toFixed(1)}" y2="${py(0).toFixed(1)}" stroke="#2F6B4A" stroke-width="1.8"/>
      <text class="m-lab" x="${(px(0) - 32).toFixed(1)}" y="${((py(y0) + py(0))/2 + 4).toFixed(1)}"
            text-anchor="end" fill="#2F6B4A">y₀</text>

      <!-- trayectoria -->
      <path d="${traza}" fill="none" stroke="var(--linea)" stroke-width="2.4" stroke-dasharray="5 4"/>
      <path d="${recorrido}" fill="none" stroke="#0C2B52" stroke-width="3" stroke-linejoin="round"/>
      <circle cx="${px(xb).toFixed(1)}" cy="${py(yb).toFixed(1)}" r="7" fill="#C87020"
              stroke="#F3ECD9" stroke-width="2"/>

      <!-- sensor de impacto -->
      <rect x="${(px(d.alcance) - 26).toFixed(1)}" y="${(py(0) - 7).toFixed(1)}" width="52" height="7"
            rx="2" fill="#3F3A33" stroke="#1F1C17" stroke-width="1.4"/>
      <text class="m-et" x="${px(d.alcance).toFixed(1)}" y="${(py(0) + 22).toFixed(1)}"
            text-anchor="middle" fill="#C87020">${fmt(d.alcance,3)} m</text>

      <!-- curva de alcance frente al ángulo -->
      ${rej}
      <line class="g-eje" x1="${G2.l}" y1="${VH - G2.b}" x2="${VW - G2.r}" y2="${VH - G2.b}"/>
      <line class="g-eje" x1="${G2.l}" y1="${G2.t}" x2="${G2.l}" y2="${VH - G2.b}"/>
      <text class="g-tit" x="${((VW - G2.r + G2.l)/2).toFixed(1)}" y="${VH - 8}" text-anchor="middle">ángulo de disparo θ (°)</text>
      <text class="g-tit" x="${(-(VH - G2.b + G2.t)/2).toFixed(1)}" y="${G2.l - 54}" text-anchor="middle"
            transform="rotate(-90)">alcance (m)</text>
      <text class="g-tit" x="${G2.l}" y="${G2.t - 12}" text-anchor="start">alcance en función del ángulo, con esta v₀ y esta y₀</text>
      <path d="${curva}" fill="none" stroke="#8A8171" stroke-width="2.4"/>
      <line x1="${pxG(opt.ang).toFixed(1)}" y1="${pyG(opt.alcance).toFixed(1)}"
            x2="${pxG(opt.ang).toFixed(1)}" y2="${(VH - G2.b).toFixed(1)}"
            stroke="#2F6B4A" stroke-width="1.6" stroke-dasharray="4 3"/>
      <text class="g-num" x="${pxG(opt.ang).toFixed(1)}" y="${(pyG(opt.alcance) - 9).toFixed(1)}"
            text-anchor="middle" fill="#2F6B4A">óptimo ${fmt(opt.ang,1)}°</text>
      <circle cx="${pxG(ang).toFixed(1)}" cy="${pyG(d.alcance).toFixed(1)}" r="6"
              fill="#C87020" stroke="#F3ECD9" stroke-width="2"/>`;

    svg.setAttribute('aria-valuetext',
      `ángulo ${fmt(ang,0)} grados, alcance ${fmt(d.alcance,3)} metros, óptimo en ${fmt(opt.ang,1)} grados`);
  }

  function refrescar(){
    dibujar();
    const d = datos(), opt = anguloOptimo();
    host.querySelector('#sim-lecturas').innerHTML = `
      <div class="visor"><div class="visor__et">Tiempo de vuelo</div>
        <div class="visor__v">${fmt(d.tv,4)}<small> s</small></div></div>
      <div class="visor"><div class="visor__et">Alcance</div>
        <div class="visor__v" style="color:#8FE3A8">${fmt(d.alcance,3)}<small> m</small></div></div>
      <div class="visor"><div class="visor__et">Altura máxima</div>
        <div class="visor__v" style="color:#FF9E85">${fmt(d.alturaMax,3)}<small> m</small></div></div>
      <div class="visor"><div class="visor__et">Ángulo óptimo</div>
        <div class="visor__v">${fmt(opt.ang,1)}<small>°</small></div></div>`;
    host.querySelector('#sim-cuenta').innerHTML =
      `v₀·cos θ = <b>${fmt(d.vx,3)} m/s</b> · v₀·sen θ = <b>${fmt(d.vy,3)} m/s</b> · ` +
      `t<sub>V</sub> = <b>${fmt(d.tv,4)} s</b> · x = v₀·cosθ·t<sub>V</sub> = <b>${fmt(d.alcance,3)} m</b>`;
    host.querySelector('#out-ang').textContent = fmt(ang,0) + '°';
    host.querySelector('#out-v0').textContent  = fmt(v0,2) + ' m/s';
    host.querySelector('#out-y0').textContent  = fmt(y0,3) + ' m';
    host.querySelector('#sim-ang').value = ang;
    host.querySelector('#sim-v0').value  = v0.toFixed(2);
    host.querySelector('#sim-y0').value  = y0.toFixed(3);
    host.querySelector('#sim-disparar').textContent =
      estado === 'volando' ? '■ Detener' : '▶ Disparar';
  }

  function bucle(ahora){
    if (!ultimo) ultimo = ahora;
    t += Math.min((ahora - ultimo) / 1000, 0.05) / 1.6;   // algo más lento que el real
    ultimo = ahora;
    const d = datos();
    if (t >= d.tv){ t = d.tv; estado = 'fin'; anim = null; ultimo = 0; refrescar(); return; }
    refrescar();
    anim = requestAnimationFrame(bucle);
  }

  function disparar(){
    if (estado === 'volando'){ cancelAnimationFrame(anim); anim = null; ultimo = 0; estado = 'listo'; refrescar(); return; }
    t = 0; estado = 'volando'; ultimo = 0;
    if (SIN_MOVIMIENTO){ t = datos().tv; estado = 'fin'; refrescar(); return; }
    cancelAnimationFrame(anim);
    refrescar();
    anim = requestAnimationFrame(bucle);
  }

  function reiniciar(){
    cancelAnimationFrame(anim); anim = null; ultimo = 0;
    t = 0; estado = 'listo'; refrescar();
  }

  function montar(id){
    host = document.getElementById(id);
    if (!host) return;
    host.innerHTML = `
      <svg class="parab-svg" viewBox="0 0 ${VW} ${VH}" role="img"
           aria-label="Trayectoria parabólica del proyectil junto a la curva del alcance en función del ángulo"></svg>
      <div class="lectura-caja" id="sim-lecturas" style="margin-top:13px"></div>
      <p id="sim-cuenta" class="instr__ayuda"
         style="margin:12px 0 0;font-family:var(--mono);font-size:.84rem;color:var(--azul)"></p>
      <div class="controles">
        <div class="control">
          <label for="sim-ang">Ángulo de disparo · <output id="out-ang"></output></label>
          <input type="range" id="sim-ang" min="5" max="80" step="1" value="${ang}">
        </div>
        <div class="control">
          <label for="sim-v0">Rapidez inicial · <output id="out-v0"></output></label>
          <input type="range" id="sim-v0" min="1" max="6" step="0.05" value="${v0}">
        </div>
        <div class="control">
          <label for="sim-y0">Altura y₀ · <output id="out-y0"></output></label>
          <input type="range" id="sim-y0" min="0" max="0.6" step="0.005" value="${y0}">
        </div>
      </div>
      <div class="materiales" role="group" aria-label="Control de la simulación">
        <button class="chip" id="sim-disparar">▶ Disparar</button>
        <button class="chip" id="sim-reiniciar">↺ Reiniciar</button>
      </div>`;

    svg = host.querySelector('.parab-svg');
    host.querySelector('#sim-ang').addEventListener('input', e => { ang = parseFloat(e.target.value); reiniciar(); });
    host.querySelector('#sim-v0').addEventListener('input',  e => { v0  = parseFloat(e.target.value); reiniciar(); });
    host.querySelector('#sim-y0').addEventListener('input',  e => { y0  = parseFloat(e.target.value); reiniciar(); });
    host.querySelector('#sim-disparar').addEventListener('click', disparar);
    host.querySelector('#sim-reiniciar').addEventListener('click', reiniciar);
    refrescar();
  }

  return { montar };
})();

/* ==========================================================================
   4. ANÁLISIS
   ========================================================================== */
const Analisis = (() => {

  function datosAngulo(i){
    const th  = rad(ANGULOS[i]);
    const y0  = leerNum(`y0-${i+1}`);
    const xs  = [0,1,2].map(j => leerNum(`x-${i+1}-${j}`));
    const tvs = [0,1,2].map(j => leerNum(`tv-${i+1}-${j}`));
    const okX = xs.every(v => v !== null && v > 0);
    const okT = tvs.every(v => v !== null && v > 0);
    const okY = y0 !== null && y0 >= 0;
    const xb  = okX ? (xs[0] + xs[1] + xs[2]) / 3 : null;
    const tb  = okT ? (tvs[0] + tvs[1] + tvs[2]) / 3 : null;
    const v0  = (xb !== null && tb !== null) ? xb / (Math.cos(th) * tb) : null;
    const g   = (v0 !== null && okY) ? 2 * (v0 * Math.sin(th) * tb + y0) / (tb * tb) : null;
    const sube = (v0 !== null && g !== null && g > 0) ? (v0 * Math.sin(th)) ** 2 / (2 * g) : null;
    const y   = (sube !== null) ? y0 + sube : null;
    return { i, ang: ANGULOS[i], y0, xs, tvs, xb, tb, v0, g, sube, y,
             okX, okT, okY, completa: okX && okT && okY && v0 !== null && g !== null };
  }

  const completos = () => [0,1,2,3,4].map(datosAngulo).filter(d => d.completa);

  /* -------------------------------- Cuadro de cálculo bajo cada ángulo */
  function pintarPromedios(){
    for (let i = 0; i < N_ANG; i++){
      const caja = document.getElementById('prom-' + (i + 1));
      if (!caja) continue;
      const d = datosAngulo(i);
      if (!d.okX || !d.okT){
        caja.innerHTML = '<span class="tabla-mini__pendiente">Faltan lecturas: escribe los tres ' +
          'alcances y los tres tiempos para calcular los promedios.</span>';
        continue;
      }
      let html = `<span class="nw">x̄ = <b>${fmt(d.xb,4)} m</b></span> &nbsp;·&nbsp; ` +
                 `<span class="nw">t̄<sub>V</sub> = <b>${fmt(d.tb,5)} s</b></span>`;
      if (d.v0 !== null){
        html += `<br>v₀ = x̄/(cos ${d.ang}° · t̄<sub>V</sub>) = <b class="nw">${fmt(d.v0,4)} m/s</b>`;
      }
      if (d.g !== null){
        html += `<br><span class="nw">g = <b>${fmt(d.g,3)} m/s²</b></span>` +
                ` &nbsp;·&nbsp; <span class="nw">sube <b>${fmt(d.sube,4)} m</b></span>` +
                ` &nbsp;·&nbsp; <span class="nw">y = <b>${fmt(d.y,4)} m</b></span>`;
      } else if (!d.okY){
        html += `<br><b style="color:var(--err)">Falta y₀:</b> sin ella no hay gravedad ni altura máxima.`;
      }
      caja.innerHTML = html;
    }
  }

  /* ------------------------------------------------------- Tabla 2 */
  function pintarTabla2(){
    const host = document.getElementById('tabla-2');
    if (!host) return;
    const vacio = '<span style="color:var(--tinta-3);font-style:italic">—</span>';
    const cel = (v, d) => (v === null || v === undefined) ? vacio : `<span class="dato">${fmt(v,d)}</span>`;
    let filas = '';
    for (let i = 0; i < N_ANG; i++){
      const d = datosAngulo(i);
      filas += `<tr>
        <td class="col-mag">${d.ang}</td>
        <td class="td-centro">${d.okY ? cel(d.y0,3) : vacio}</td>
        <td class="td-centro">${cel(d.xb,4)}</td>
        <td class="td-centro">${cel(d.tb,5)}</td>
        <td class="td-centro" style="background:rgba(12,43,82,.06)">${cel(d.v0,4)}</td>
        <td class="td-centro">${cel(d.y,4)}</td>
        <td class="td-centro" style="background:rgba(200,112,32,.08)">${cel(d.g,3)}</td>
      </tr>`;
    }
    host.innerHTML = `<div class="tabla-caja" style="margin-top:16px">
      <table class="tabla" style="min-width:720px">
        <thead>
          <tr><th colspan="7" class="th-grupo">Tabla 2 · análisis de los cinco ángulos</th></tr>
          <tr>
            <th style="width:11%">θ <span class="ud">(°)</span></th><th style="width:13%">y₀ <span class="ud">(m)</span></th>
            <th style="width:15%">x̄ <span class="ud">(m)</span></th><th style="width:16%">t̄<sub>V</sub> <span class="ud">(s)</span></th>
            <th style="width:15%">v₀ <span class="ud">(m/s)</span></th><th style="width:15%">y <span class="ud">(m)</span></th>
            <th style="width:15%">g <span class="ud">(m/s²)</span></th>
          </tr>
        </thead>
        <tbody>${filas}</tbody>
      </table>
      <caption>Tabla 2. Se completa sola con los datos de la Tabla 1. La columna de v₀ debería salir
      constante; la de g también. La columna de la gravedad no está en el formato impreso: la añade
      el cuaderno porque el tercer objetivo la pide.</caption>
    </div>`;
  }

  function pintarLectura(){
    const host = document.getElementById('lectura-analisis');
    if (!host) return;
    const P = completos();
    if (P.length < 2){
      host.innerHTML = `<div class="nota"><strong>Faltan datos.</strong> Completa al menos dos
        ángulos de la Tabla 1 para que el cuaderno pueda comentar los resultados.</div>`;
      return;
    }
    const v0s = P.map(d => d.v0), gs = P.map(d => d.g);
    const v0m = v0s.reduce((s,x) => s+x, 0) / v0s.length;
    const gm  = gs.reduce((s,x) => s+x, 0) / gs.length;
    const dispV = (Math.max(...v0s) - Math.min(...v0s)) / v0m * 100;
    const dispG = (Math.max(...gs) - Math.min(...gs)) / gm * 100;
    const mejorX = P.reduce((a,b) => b.xb > a.xb ? b : a);
    const mejorY = P.reduce((a,b) => b.y  > a.y  ? b : a);

    host.innerHTML = `
      <div class="nota">
        <strong>La rapidez inicial no depende del ángulo</strong><br>
        Los ${P.length} valores de v₀ promedian <span class="dato">${fmt(v0m,4)} m/s</span> y se
        apartan entre sí un <span class="dato">${fmt(dispV,2)} %</span>:
        ${dispV <= 3
          ? 'prácticamente nada. Es lo que debe salir, porque la rapidez la fija el resorte y no la inclinación del cañón.'
          : 'más de lo esperable. Revisa si en algún lanzamiento el resorte no quedó enganchado en el mismo rango, o si el alcance se midió desde un punto distinto.'}
      </div>
      <div class="nota">
        <strong>La gravedad tampoco</strong><br>
        Los ${P.length} valores de g promedian <span class="dato">${fmt(gm,3)} m/s²</span> con una
        dispersión del <span class="dato">${fmt(dispG,2)} %</span>.
        ${dispG <= 4
          ? 'La coincidencia entre ángulos distintos es la mejor señal de que las medidas son consistentes.'
          : 'Conviene revisar las alturas y₀: son lo que más influye en g y lo más fácil de arrastrar de un ángulo a otro.'}
      </div>
      <div class="nota">
        <strong>Alcance y altura</strong><br>
        El mayor alcance de tu tabla es <span class="dato">${fmt(mejorX.xb,4)} m</span>, con
        <span class="dato">${mejorX.ang}°</span>; la mayor altura,
        <span class="dato">${fmt(mejorY.y,4)} m</span>, con <span class="dato">${mejorY.ang}°</span>.
        Son los dos datos que piden las preguntas 2 y 3 del informe.
      </div>`;
  }

  /* ----------------------------------------- Gráfica del alcance */
  function y0Interpolada(a, P){
    if (!P.length) return 0;
    if (a <= P[0].ang) return P[0].y0;
    if (a >= P[P.length-1].ang) return P[P.length-1].y0;
    for (let k = 0; k < P.length - 1; k++){
      if (a >= P[k].ang && a <= P[k+1].ang){
        const f = (a - P[k].ang) / (P[k+1].ang - P[k].ang);
        return P[k].y0 + f * (P[k+1].y0 - P[k].y0);
      }
    }
    return P[0].y0;
  }

  function pintarGraficaAlcance(){
    const host = document.getElementById('graf-alcance');
    if (!host) return;
    const P = completos();
    const W = 660, H = 360, M = { l: 66, r: 22, t: 20, b: 52 };
    const aMin = 0, aMax = 60;
    const v0m = P.length ? P.reduce((s,d) => s + d.v0, 0) / P.length : 2.35;
    const gm  = P.length ? P.reduce((s,d) => s + d.g,  0) / P.length : G_REF;

    /* curva teórica con la v₀ y la y₀ del propio grupo */
    const teor = a => vuelo(v0m, a, y0Interpolada(a, P), gm).alcance;
    let rMax = P.length ? Math.max(...P.map(d => d.xb)) : 0.8;
    for (let a = 5; a <= aMax; a += 1) rMax = Math.max(rMax, teor(a));
    rMax *= 1.15;

    const px = a => M.l + (a - aMin) / (aMax - aMin) * (W - M.l - M.r);
    const py = r => (H - M.b) - r / rMax * (H - M.b - M.t);

    let g = '';
    for (let i = 0; i <= 6; i++){
      const a = aMin + (aMax - aMin) * i / 6;
      g += `<line class="g-rejilla" x1="${px(a).toFixed(1)}" y1="${M.t}" x2="${px(a).toFixed(1)}" y2="${H - M.b}"/>
            <text class="g-num" x="${px(a).toFixed(1)}" y="${H - M.b + 16}" text-anchor="middle">${fmt(a,0)}</text>`;
    }
    for (let i = 0; i <= 5; i++){
      const r = rMax * i / 5;
      g += `<line class="g-rejilla" x1="${M.l}" y1="${py(r).toFixed(1)}" x2="${W - M.r}" y2="${py(r).toFixed(1)}"/>
            <text class="g-num" x="${M.l - 7}" y="${(py(r) + 4).toFixed(1)}" text-anchor="end">${fmt(r,2)}</text>`;
    }
    g += `<line class="g-eje" x1="${M.l}" y1="${H - M.b}" x2="${W - M.r}" y2="${H - M.b}"/>
          <line class="g-eje" x1="${M.l}" y1="${M.t}" x2="${M.l}" y2="${H - M.b}"/>
          <text class="g-tit" x="${((W + M.l)/2).toFixed(1)}" y="${H - 8}" text-anchor="middle">ángulo de disparo θ (°)</text>
          <text class="g-tit" x="${(-((H - M.b + M.t)/2)).toFixed(1)}" y="14" text-anchor="middle"
                transform="rotate(-90)">alcance promedio x̄ (m)</text>`;

    if (P.length >= 2){
      let curva = '';
      for (let a = 1; a <= aMax; a += 0.5){
        curva += (curva ? 'L' : 'M') + px(a).toFixed(1) + ' ' + py(teor(a)).toFixed(1) + ' ';
      }
      g += `<path d="${curva}" fill="none" stroke="#8A8171" stroke-width="2.2" stroke-dasharray="6 4"/>`;
      /* óptimo teórico */
      let mejor = 1, mx = -1;
      for (let a = 1; a <= 89; a += 0.25){ const r = teor(a); if (r > mx){ mx = r; mejor = a; } }
      if (mejor <= aMax){
        g += `<line x1="${px(mejor).toFixed(1)}" y1="${py(mx).toFixed(1)}"
                 x2="${px(mejor).toFixed(1)}" y2="${(H - M.b).toFixed(1)}"
                 stroke="#2F6B4A" stroke-width="1.6" stroke-dasharray="4 3"/>
              <text class="g-num" x="${px(mejor).toFixed(1)}" y="${(py(mx) - 10).toFixed(1)}"
                 text-anchor="middle" fill="#2F6B4A">óptimo ${fmt(mejor,1)}°</text>`;
      }
    }

    P.forEach(d => {
      g += `<circle cx="${px(d.ang).toFixed(1)}" cy="${py(d.xb).toFixed(1)}" r="5.5"
              fill="#C87020" stroke="#1F1C17" stroke-width="1.5">
              <title>θ = ${d.ang}°, x̄ = ${fmt(d.xb,4)} m</title></circle>`;
    });

    host.innerHTML = `<svg viewBox="0 0 ${W} ${H}" role="img"
        aria-label="Alcance horizontal promedio en función del ángulo de disparo">${g}</svg>
      <div class="leyenda">
        <span><i class="punto" style="background:#C87020"></i>alcances medidos</span>
        <span><i style="background:#8A8171"></i>curva teórica con tu v₀ y tu y₀</span>
      </div>` +
      (P.length ? '' : '<p class="instr__ayuda" style="margin:10px 0 0">Completa la Tabla 1 para que aparezcan los puntos.</p>');
  }

  function pintarResumenAlcance(){
    const host = document.getElementById('resumen-alcance');
    if (!host) return;
    const P = completos();
    if (P.length < 2){
      host.innerHTML = `<div class="nota nota--aviso"><strong>Faltan datos.</strong> Completa al
        menos dos ángulos de la Tabla 1 para que el cuaderno trace la curva y localice el
        óptimo.</div>`;
      return;
    }
    const mejorX = P.reduce((a,b) => b.xb > a.xb ? b : a);
    const mejorY = P.reduce((a,b) => b.y  > a.y  ? b : a);
    const v0m = P.reduce((s,d) => s + d.v0, 0) / P.length;
    const gm  = P.reduce((s,d) => s + d.g,  0) / P.length;
    const teor = a => vuelo(v0m, a, y0Interpolada(a, P), gm).alcance;
    let opt = 1, mx = -1;
    for (let a = 1; a <= 89; a += 0.25){ const r = teor(a); if (r > mx){ mx = r; opt = a; } }
    const y0m = P.reduce((s,d) => s + d.y0, 0) / P.length;
    const fuera = opt > Math.max(...P.map(d => d.ang));

    host.innerHTML = `
      <div class="nota">
        <strong>Lo que dicen tus datos</strong><br>
        El mayor alcance medido fue <span class="dato">${fmt(mejorX.xb,4)} m</span>, con el ángulo
        de <span class="dato">${mejorX.ang}°</span>. La mayor altura,
        <span class="dato">${fmt(mejorY.y,4)} m</span>, con <span class="dato">${mejorY.ang}°</span>.
      </div>
      <div class="nota">
        <strong>Dónde está en realidad el óptimo</strong><br>
        Con tu rapidez inicial (${fmt(v0m,3)} m/s) y tu altura de lanzamiento (unos
        ${fmt(y0m,3)} m), la teoría sitúa el alcance máximo en
        <span class="dato" style="font-size:1.1em">${fmt(opt,1)}°</span>, por debajo de los 45°
        que corresponderían a un lanzamiento desde la mesa.
        ${fuera
          ? 'Ese óptimo queda <b>fuera del intervalo que ensayaste</b>, así que el máximo de tu tabla es solo el mayor de los cinco ángulos probados, no el máximo absoluto. Conviene decirlo en la respuesta a la pregunta 2.'
          : 'Ese óptimo queda dentro del intervalo que ensayaste, de modo que el ángulo de mayor alcance de tu tabla es también, aproximadamente, el óptimo.'}
      </div>
      <div class="nota nota--aviso">
        <strong>Por qué el óptimo baja de 45°.</strong> Al salir desde una altura, el proyectil
        dispone de un tramo de caída que no tendría si partiera de la mesa. Le conviene entonces
        salir más tendido, con más velocidad horizontal, y aprovechar ese tiempo extra avanzando.
        Cuanto mayor sea y₀ frente a lo que el proyectil sube por sí mismo, más bajo queda el
        ángulo óptimo. Con y₀ = 0 vuelve a ser exactamente 45°, y entonces ángulos complementarios
        como 30° y 60° dan el mismo alcance.
      </div>`;
  }

  /* ----------------------------------------- Rapidez inicial y gravedad */
  function pintarResultados(){
    const host = document.getElementById('resultados-host');
    if (!host) return;
    const P = completos();
    const gref = leerNum('g-ref') ?? G_REF;

    if (P.length < 2){
      host.innerHTML = `<div class="nota"><strong>Faltan datos.</strong> Completa al menos dos
        ángulos de la Tabla 1 para que el cuaderno promedie los resultados.</div>`;
      return;
    }
    const v0m = P.reduce((s,d) => s + d.v0, 0) / P.length;
    const gm  = P.reduce((s,d) => s + d.g,  0) / P.length;
    const err = gref > 0 ? Math.abs(gm - gref) / gref * 100 : null;
    const bien = err !== null && err <= 3;

    host.innerHTML = `
      <div class="vs">
        <div class="vs__caja">
          <div class="vs__et">Rapidez inicial v₀</div>
          <div class="vs__v">${fmt(v0m,3)}</div>
          <div class="vs__u">m/s</div>
        </div>
        <div class="vs__sep" aria-hidden="true">y</div>
        <div class="vs__caja vs__caja--ref">
          <div class="vs__et">Gravedad g</div>
          <div class="vs__v">${fmt(gm,3)}</div>
          <div class="vs__u">m/s²</div>
        </div>
      </div>
      <div class="nota${bien ? '' : ' nota--aviso'}">
        <strong>Comparación con el valor de referencia</strong><br>
        La gravedad obtenida promedia <span class="dato">${fmt(gm,3)} m/s²</span> frente a los
        ${fmt(gref,2)} m/s² de referencia: un error de
        <span class="dato" style="color:${bien ? 'var(--ok)' : 'var(--err)'}">${err !== null ? fmt(err,2) + ' %' : '—'}</span>.<br>
        ${bien
          ? 'Un acuerdo notable si se tiene en cuenta que la gravedad no se midió directamente, sino que se dedujo de longitudes y de tiempos de unas décimas de segundo.'
          : 'La diferencia es mayor de lo habitual. Las causas más probables son la medida del alcance —el punto desde el que se mide— y la de las alturas y₀, que cambian con cada ángulo.'}
      </div>
      <div class="nota">
        <strong>La rapidez inicial, ángulo por ángulo</strong><br>
        ${P.map(d => `${d.ang}°: <span class="dato">${fmt(d.v0,4)}</span>`).join(' &nbsp;·&nbsp; ')} m/s.<br>
        Que los ${P.length} valores coincidan confirma que el rango del resorte fija la rapidez de
        salida con independencia de la inclinación del cañón, que es el primer objetivo de la
        práctica.
      </div>`;
  }

  /* ------------------------------------------------------------ Refresco */
  function refrescar(){
    pintarPromedios();
    pintarTabla2();
    pintarLectura();
    pintarGraficaAlcance();
    pintarResumenAlcance();
    pintarResultados();

    /* Modelos de las casillas que el estudiante transcribe */
    const poner = (id, v) => { if (CLAVES[id]) CLAVES[id].modelo = v; };
    const P = completos();
    if (P.length >= 1){
      const mejorX = P.reduce((a,b) => b.xb > a.xb ? b : a);
      const mejorY = P.reduce((a,b) => b.y  > a.y  ? b : a);
      poner('alc-max',  fmt(mejorX.xb,4));
      poner('ang-max',  String(mejorX.ang));
      poner('y-max',    fmt(mejorY.y,4));
      poner('ang-ymax', String(mejorY.ang));
    } else {
      ['alc-max','ang-max','y-max','ang-ymax'].forEach(id => poner(id, ''));
    }
    if (P.length >= 2){
      const v0m = P.reduce((s,d) => s + d.v0, 0) / P.length;
      const gm  = P.reduce((s,d) => s + d.g,  0) / P.length;
      const gref = leerNum('g-ref') ?? G_REF;
      poner('v0-exp', fmt(v0m,3));
      poner('g-exp',  fmt(gm,3));
      poner('err-g',  gref > 0 ? fmt(Math.abs(gm - gref) / gref * 100, 2) : '');
    } else {
      ['v0-exp','g-exp','err-g'].forEach(id => poner(id, ''));
    }
  }

  return { refrescar, datosAngulo, completos, vuelo };
})();

/* Estilos de los textos dentro de los SVG */
(function estilosSVG(){
  const s = document.createElement('style');
  s.textContent = `
    .m-lab{ font-family:var(--texto); font-size:12px; fill:#5A5346; }
    .m-et{ font-family:var(--mono); font-size:15px; font-weight:700; fill:#0C2B52; }
    .m-visor{ font-family:var(--mono); font-size:13px; font-weight:700; fill:#8FE3A8; }
    .g-eje{ stroke:#4A4234; stroke-width:1.3; }
    .g-rejilla{ stroke:rgba(120,100,66,.18); stroke-width:1; }
    .g-num{ font-family:var(--mono); font-size:10px; fill:#5A5346; }
    .g-tit{ font-family:var(--texto); font-size:11px; fill:#4A4234; }
  `;
  document.head.appendChild(s);
})();
