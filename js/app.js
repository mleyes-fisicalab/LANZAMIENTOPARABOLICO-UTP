/* ============================================================================
   APP.JS — Navegación, persistencia, autocompletado y verificación
   ========================================================================== */

const LLAVE = 'cuaderno_fisica1_lanzamiento_parabolico_utp_v1';
const TOTAL = PAGINAS.length;
let actual = 0;

/* ------------------------------------------------------------- Utilidades */
const $  = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));

function normaliza(s){
  return String(s ?? '').trim().toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/\s+/g, ' ');
}

function aNumero(s){
  const n = parseFloat(String(s ?? '').replace(/\s/g, '').replace(',', '.'));
  return isFinite(n) ? n : null;
}

let tToast;
function aviso(texto){
  const t = $('#toast');
  t.textContent = texto;
  t.dataset.visible = 'true';
  clearTimeout(tToast);
  tToast = setTimeout(() => { t.dataset.visible = 'false'; }, 3800);
}

function confirmar({ titulo, texto, ok = 'Continuar' }){
  return new Promise(res => {
    const m = $('#modal');
    $('#modal-tit').textContent = titulo;
    $('#modal-txt').innerHTML = texto;
    $('#modal-ok').textContent = ok;
    m.hidden = false;
    $('#modal-ok').focus();
    const cerrar = v => {
      m.hidden = true;
      $('#modal-ok').removeEventListener('click', si);
      $('#modal-no').removeEventListener('click', no);
      document.removeEventListener('keydown', tecla);
      res(v);
    };
    const si = () => cerrar(true);
    const no = () => cerrar(false);
    const tecla = e => { if (e.key === 'Escape') cerrar(false); };
    $('#modal-ok').addEventListener('click', si);
    $('#modal-no').addEventListener('click', no);
    document.addEventListener('keydown', tecla);
  });
}

/* --------------------------------------------------------- Armado del libro */
function encabezado(){
  return `
    <header class="enc">
      <div class="enc__marca">
        <div class="enc__utp">UTP<small>Universidad Tecnológica<br>de Pereira</small></div>
        <div class="enc__caja">Facultad de<br>Ciencias Básicas</div>
      </div>
      <div class="enc__asignatura">${esc(META.asignatura)}<br>${esc(META.departamento)}</div>
    </header>
    <div class="enc__regla" aria-hidden="true"></div>`;
}

function pie(i){
  return `
    <footer class="pie">
      <span>${esc(META.practica)} · ${esc(META.titulo)}</span>
      <span class="pie__num">${String(i + 1).padStart(2, '0')} / ${TOTAL}</span>
    </footer>`;
}

function construirLibro(){
  $('#libro').innerHTML = PAGINAS.map((fn, i) => `
    <section class="pagina" id="pag-${i}" ${i === 0 ? '' : 'hidden'}
             aria-label="${esc(SECCIONES[i].t)}">
      ${i === 0 ? '' : encabezado()}
      <div class="cuerpo">${fn()}</div>
      ${pie(i)}
    </section>`).join('');
}

function construirCajon(){
  $('#cajon-lista').innerHTML = SECCIONES.map((s, i) => `
    <li class="cajon__item">
      <button class="cajon__enlace" data-ir="${i}">
        <span class="cajon__num">${String(i).padStart(2, '0')}</span>
        <span>${esc(s.t)}</span>
      </button>
    </li>`).join('');
}

function construirRegla(){
  let s = '';
  for (let i = 0; i < TOTAL; i++){
    s += `<span class="regla__marca regla__marca--larga" style="left:${((i + 0.5) / TOTAL * 100).toFixed(3)}%"></span>`;
    if (i < TOTAL - 1){
      s += `<span class="regla__marca regla__marca--corta" style="left:${((i + 1) / TOTAL * 100).toFixed(3)}%"></span>`;
    }
  }
  $('#regla-marcas').innerHTML = s;
}

/* --------------------------------------------------------------- Navegación */
function irA(n, hazScroll = true){
  n = Math.min(TOTAL - 1, Math.max(0, n));
  $$('.pagina').forEach((p, i) => { p.hidden = (i !== n); });
  actual = n;

  $('#regla-nonio').style.left = ((n + 0.5) / TOTAL * 100).toFixed(3) + '%';
  $('#regla-lectura').textContent = String(n + 1).padStart(2, '0') + ' / ' + TOTAL;
  $('#nav-centro').textContent = SECCIONES[n].t;
  $('#btn-ant').disabled = (n === 0);
  $('#btn-sig').disabled = (n === TOTAL - 1);

  $$('#cajon-lista .cajon__enlace').forEach((b, i) =>
    b.setAttribute('aria-current', i === n ? 'true' : 'false'));

  /* Varias páginas se construyen con los datos de las tablas, de modo que se
     recalculan cada vez que se cambia de página. */
  Analisis.refrescar();
  if (hazScroll) window.scrollTo({ top: 0, behavior: 'auto' });
  try { localStorage.setItem(LLAVE + '_pag', String(n)); } catch (e) {}
}

function abrirCajon(v){
  $('#cajon').dataset.abierto = v ? 'true' : 'false';
  $('#velo').dataset.abierto  = v ? 'true' : 'false';
  $('#btn-indice').setAttribute('aria-expanded', v ? 'true' : 'false');
}

/* -------------------------------------------------------------- Persistencia */
let tGuardar;
function guardar(){
  clearTimeout(tGuardar);
  tGuardar = setTimeout(() => {
    const d = {};
    $$('[data-campo]').forEach(el => { if (el.value !== '') d[el.dataset.campo] = el.value; });
    try { localStorage.setItem(LLAVE, JSON.stringify(d)); }
    catch (e){ aviso('No fue posible guardar: el almacenamiento del navegador está lleno o bloqueado.'); }
  }, 320);
}

function restaurar(){
  let d = {};
  try { d = JSON.parse(localStorage.getItem(LLAVE) || '{}'); } catch (e){ d = {}; }
  let n = 0;
  Object.entries(d).forEach(([id, v]) => {
    const el = document.getElementById(id);
    if (el){ el.value = v; n++; }
  });
  const p = parseInt(localStorage.getItem(LLAVE + '_pag') || '0', 10);
  return { campos: n, pagina: isNaN(p) ? 0 : p };
}

/* ------------------------------------------- Autocompletar, verificar, limpiar */
function hoy(){
  const f = new Date();
  return `${String(f.getDate()).padStart(2,'0')} / ${String(f.getMonth()+1).padStart(2,'0')} / ${f.getFullYear()}`;
}

function rellenar(id){
  const k = CLAVES[id], el = document.getElementById(id);
  if (!k || !el) return false;
  if (id === 'fecha'){ el.value = hoy(); return true; }
  const v = (k.modo === 'libre') ? k.modelo : (k.resp[0] ?? '');
  if (v === '' || v == null) return false;
  el.value = v;
  el.removeAttribute('data-estado');
  const p = document.getElementById('pista-' + id);
  if (p){ p.textContent = ''; p.removeAttribute('data-estado'); }
  return true;
}

function verificarCampo(id){
  const k = CLAVES[id], el = document.getElementById(id);
  if (!k || !el) return null;
  const pista = document.getElementById('pista-' + id);
  const limpiaMarca = () => {
    el.removeAttribute('data-estado');
    if (pista){ pista.textContent = ''; pista.removeAttribute('data-estado'); }
  };
  if (k.modo === 'libre'){ limpiaMarca(); return null; }
  const val = String(el.value ?? '');
  if (val.trim() === ''){ limpiaMarca(); return null; }

  let ok;
  if (k.modo === 'numero'){
    const n = aNumero(val);
    const ref = aNumero(k.resp[0]);
    ok = (n !== null && ref !== null && Math.abs(n - ref) <= (k.tol ?? 0.01) + 1e-9);
  } else if (k.modo === 'simbolo'){
    ok = k.resp.some(r => String(r).trim() === val.trim());
  } else {
    ok = k.resp.some(r => normaliza(r) === normaliza(val));
  }

  el.dataset.estado = ok ? 'ok' : 'mal';
  if (pista && k.nota){ pista.textContent = k.nota; pista.dataset.estado = ok ? 'ok' : 'mal'; }
  return ok;
}

const idsDe = scope => $$('[data-campo]', scope).map(el => el.dataset.campo);

async function autocompletar(scope, etiqueta){
  const ok = await confirmar({
    titulo: 'Cargar los datos de referencia',
    texto: `Se van a sobrescribir <b>${etiqueta}</b> con el conjunto de datos y las respuestas ` +
           `de referencia. Lo que hayas escrito en esos campos se perderá.<br><br>` +
           `Úsalo para revisar después de haber intentado resolver, o si eres el docente ` +
           `proyectando la solución en clase.`,
    ok: 'Sí, autocompletar'
  });
  if (!ok) return;
  let n = 0;
  idsDe(scope).forEach(id => { if (rellenar(id)) n++; });
  /* La rapidez inicial, la gravedad, la altura máxima y el error se calculan a
     partir de la Tabla 1: se recalculan los modelos y se da una segunda pasada. */
  Analisis.refrescar();
  idsDe(scope).forEach(id => {
    const el = document.getElementById(id);
    if (el && el.value === '' && rellenar(id)) n++;
  });
  guardar();
  Analisis.refrescar();
  ajustarAreas();
  aviso(n ? `${n} campos completados con los datos de referencia.`
          : 'No hay campos autocompletables en esta sección.');
}

function verificar(scope){
  let bien = 0, total = 0;
  idsDe(scope).forEach(id => {
    const r = verificarCampo(id);
    if (r !== null){ total++; if (r) bien++; }
  });
  if (!total){
    aviso('Aquí no hay respuestas verificables: son datos tuyos o campos vacíos.');
    return;
  }
  aviso(`${bien} de ${total} respuestas coinciden con la referencia. Revisa las notas bajo cada campo.`);
}

function limpiar(scope){
  $$('[data-campo]', scope).forEach(el => {
    if (el.tagName === 'SELECT'){ el.selectedIndex = 0; }
    else { el.value = ''; }
    el.removeAttribute('data-estado');
    const p = document.getElementById('pista-' + el.dataset.campo);
    if (p){ p.textContent = ''; p.removeAttribute('data-estado'); }
  });
  guardar();
  Analisis.refrescar();
  ajustarAreas();
}

/* ------------------------------------------------------------------ Eventos */
function conectarEventos(){
  $('#btn-ant').addEventListener('click', () => irA(actual - 1));
  $('#btn-sig').addEventListener('click', () => irA(actual + 1));
  $('#btn-indice').addEventListener('click', () => abrirCajon($('#cajon').dataset.abierto !== 'true'));
  $('#btn-cerrar-cajon').addEventListener('click', () => abrirCajon(false));
  $('#velo').addEventListener('click', () => abrirCajon(false));
  $('#btn-inicio').addEventListener('click', () => irA(0));
  $('#btn-imprimir').addEventListener('click', () => {
    Analisis.refrescar(); ajustarAreas(); window.print();
  });
  /* También cuando se imprime con Ctrl+P, para que el PDF no recorte los textos */
  window.addEventListener('beforeprint', ajustarAreas);

  document.addEventListener('click', ev => {
    const ir = ev.target.closest('[data-ir]');
    if (ir){ irA(parseInt(ir.dataset.ir, 10)); abrirCajon(false); return; }

    const acc = ev.target.closest('[data-accion]');
    if (acc){
      const pag = acc.closest('.pagina');
      const nombre = SECCIONES[$$('.pagina').indexOf(pag)]?.t || 'esta sección';
      if (acc.dataset.accion === 'autopag')      autocompletar(pag, 'los campos de «' + nombre + '»');
      if (acc.dataset.accion === 'verificarpag') verificar(pag);
      if (acc.dataset.accion === 'limpiarpag')   limpiar(pag);
      return;
    }

    const glos = ev.target.closest('[data-glos]');
    if (glos){
      const def = document.getElementById('glos-' + glos.dataset.glos);
      const abierto = glos.getAttribute('aria-expanded') === 'true';
      glos.setAttribute('aria-expanded', String(!abierto));
      def.hidden = abierto;
    }
  });

  $('#btn-auto').addEventListener('click', () =>
    autocompletar(document, 'todos los campos de todas las tablas del cuaderno'));

  $('#btn-verificar').addEventListener('click', () => {
    verificar(document);
    const fallo = $('[data-estado="mal"]');
    if (fallo){
      const i = $$('.pagina').indexOf(fallo.closest('.pagina'));
      if (i >= 0 && i !== actual) irA(i);
      fallo.scrollIntoView({ block: 'center', behavior: 'smooth' });
    }
  });

  $('#btn-reiniciar').addEventListener('click', async () => {
    const ok = await confirmar({
      titulo: 'Reiniciar el cuaderno',
      texto: 'Se borrará <b>todo lo que has escrito</b> en este navegador y no se puede deshacer.',
      ok: 'Sí, borrar todo'
    });
    if (!ok) return;
    limpiar(document);
    try { localStorage.removeItem(LLAVE); localStorage.removeItem(LLAVE + '_pag'); } catch (e) {}
    sembrarReferencias();
    irA(0);
    aviso('Cuaderno reiniciado. Puedes empezar de nuevo.');
  });

  document.addEventListener('input', ev => {
    if (ev.target.matches('[data-campo]')){
      ev.target.removeAttribute('data-estado');
      const p = document.getElementById('pista-' + ev.target.dataset.campo);
      if (p){ p.textContent = ''; p.removeAttribute('data-estado'); }
      if (ev.target.tagName === 'TEXTAREA'){ crecer(ev.target); espejar(ev.target); }
      if (/^(y0-|x-\d|tv-|g-ref)/.test(ev.target.dataset.campo)) Analisis.refrescar();
      guardar();
    }
  });
  document.addEventListener('change', ev => {
    if (ev.target.matches('select[data-campo]')){ Analisis.refrescar(); guardar(); }
  });

  document.addEventListener('keydown', ev => {
    if (ev.target.matches('input, textarea, select, svg')) return;
    if (!$('#modal').hidden) return;
    if (ev.key === 'ArrowRight') irA(actual + 1);
    if (ev.key === 'ArrowLeft')  irA(actual - 1);
    if (ev.key === 'Escape')     abrirCajon(false);
  });
}

/* El valor de referencia de g arranca con el del curso si está vacío */
function sembrarReferencias(){
  const g = document.getElementById('g-ref');
  if (g && g.value.trim() === '') g.value = String(G_REF.toFixed(2)).replace('.', ',');
}

/* Las áreas de texto crecen con lo escrito: en pantalla se lee todo sin
   desplazar, y al imprimir no se recorta ningún párrafo. */
function crecer(ta){
  if (!ta || ta.tagName !== 'TEXTAREA') return;
  ta.style.height = 'auto';
  const alto = Math.max(ta.scrollHeight, ta.rows * 22);
  ta.style.height = (alto + 4) + 'px';
}
/* Copia el contenido de cada área de texto a su «eco», que es lo que se imprime. */
function espejar(ta){
  const eco = document.getElementById('eco-' + ta.dataset.campo);
  if (eco) eco.textContent = ta.value;
}

function ajustarAreas(){
  /* Las páginas que no se están viendo tienen display:none y no reportan altura,
     así que se descubren un instante para medirlas y se vuelven a ocultar. */
  const ocultas = $$('.pagina[hidden]');
  ocultas.forEach(p => { p.hidden = false; });
  $$('textarea.campo').forEach(ta => { crecer(ta); espejar(ta); });
  ocultas.forEach(p => { p.hidden = true; });
}

/* ---------------------------------------------------------------- Arranque */
function iniciar(){
  construirLibro();
  construirCajon();
  construirRegla();
  conectarEventos();

  Trayectoria.montar('trayectoria-host');
  Montaje.montar('montaje-host');
  Simulador.montar('simulador-host');

  const est = restaurar();
  sembrarReferencias();
  Analisis.refrescar();
  ajustarAreas();
  irA(est.pagina, false);
  if (est.campos) aviso(`Se recuperaron ${est.campos} respuestas guardadas en este navegador.`);
}

document.addEventListener('DOMContentLoaded', iniciar);
