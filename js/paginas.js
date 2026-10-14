/* ============================================================================
   PAGINAS.JS — Construcción del contenido de cada página del cuaderno
   ========================================================================== */

const CLAVES = {};

function esc(s){
  return String(s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
}

function campo(o){
  CLAVES[o.id] = { resp:o.resp || [], modo:o.modo || 'texto', nota:o.nota || '',
                   modelo:o.modelo || '', tol:o.tol };
  const cls = 'campo' + (o.modo === 'simbolo' || o.modo === 'numero' ? '' : ' campo--texto')
            + (o.clase ? ' ' + o.clase : '');
  return `<input type="text" class="${cls}" id="${o.id}" data-campo="${o.id}"
            inputmode="${o.modo === 'numero' ? 'decimal' : 'text'}"
            placeholder="${esc(o.ph || '')}" autocomplete="off" spellcheck="false"
            aria-label="${esc(o.et || o.ph || o.id)}">
          <span class="pista" id="pista-${o.id}"></span>`;
}

function area(o){
  CLAVES[o.id] = { resp:[], modo:'libre', nota:o.guia || '', modelo:o.modelo || '' };
  /* El «eco» es una copia del texto que solo aparece al imprimir: un textarea
     conserva su altura en papel y recortaría las respuestas largas. */
  return `<textarea class="campo" id="${o.id}" data-campo="${o.id}" rows="${o.filas || 5}"
            placeholder="${esc(o.ph || 'Escribe aquí tu respuesta…')}"
            aria-label="${esc(o.et || o.id)}"></textarea>
          <div class="eco" id="eco-${o.id}" aria-hidden="true"></div>`;
}

function num(o){
  o.modo = 'numero'; o.clase = (o.clase || '') + ' campo--num'; o.ph = o.ph || '0,00';
  return campo(o);
}

/* Dato del estudiante: no se verifica, pero el autocompletado lo rellena con el
   valor del conjunto de datos de referencia. */
function dato(o){
  CLAVES[o.id] = { resp:[], modo:'libre', nota:'', modelo:o.modelo || '' };
  return `<input type="text" class="campo campo--num${o.clase ? ' ' + o.clase : ''}"
            id="${o.id}" data-campo="${o.id}" inputmode="decimal"
            placeholder="${esc(o.ph || '0,000')}" autocomplete="off" spellcheck="false"
            aria-label="${esc(o.et || o.id)}">`;
}

function accionesPagina(){
  return `<div class="acciones-pag">
      <button class="btn-papel btn-papel--clave" data-accion="autopag">Autocompletar esta página</button>
      <button class="btn-papel" data-accion="verificarpag">Verificar</button>
      <button class="btn-papel btn-papel--fantasma" data-accion="limpiarpag">Limpiar</button>
    </div>`;
}

function enunciado(n, texto){
  return `<div class="punto">
      <div class="punto__num" aria-hidden="true">${n}</div>
      <div class="punto__texto"><p>${texto}</p></div>
    </div>`;
}

/* ==========================================================================
   PÁGINAS
   ========================================================================== */
const PAGINAS = [];

/* --- 0 · Portada -------------------------------------------------------- */
PAGINAS.push(() => `
  <div class="portada">
    <img class="portada__img" src="imagenesUTP/portada.png"
         alt="Portada del cuaderno interactivo: Práctica 7, Lanzamiento Parabólico. Universidad Tecnológica de Pereira, Facultad de Ciencias Básicas.">
    <div>
      <span class="portada__sello">${esc(META.universidad)}</span>
      <h1>Cuaderno<br>interactivo<em>${esc(META.asignatura)}</em></h1>
      <p class="portada__practica">${esc(META.practica)} · ${esc(META.titulo)}</p>
      <div class="si-fila" aria-label="Magnitudes de la práctica">
        <span class="si-chip">v₀</span><span class="si-chip">θ</span><span class="si-chip">x</span>
        <span class="si-chip">t</span><span class="si-chip">g</span>
      </div>
      <ul class="portada__meta">
        <li><b>Facultad</b><span>Ciencias Básicas · ${esc(META.departamento)}</span></li>
        <li><b>Asignatura</b><span>${esc(META.asignatura)}</span></li>
        <li><b>Docente</b><span>${campo({id:'docente', modo:'libre', ph:'Escribe el nombre de tu docente', et:'Docente', clase:'campo--ancho'})}</span></li>
        <li><b>Grupo</b><span>${campo({id:'grupo', modo:'libre', ph:'Número o código del grupo', et:'Grupo', clase:'campo--ancho'})}</span></li>
        <li><b>Fecha</b><span>${campo({id:'fecha', modo:'libre', ph:'dd / mm / aaaa', et:'Fecha', clase:'campo--ancho'})}</span></li>
      </ul>
      <button class="btn-grande" data-ir="1">Abrir el cuaderno →</button>
    </div>
  </div>
`);

/* --- 1 · Índice --------------------------------------------------------- */
PAGINAS.push(() => `
  <span class="eyebrow">Navegación</span>
  <h1 class="titulo">Índice del cuaderno</h1>
  <p class="plomo">Veinte secciones: el fundamento y el procedimiento, el preinforme, el registro
  de los quince lanzamientos, el análisis completo, la gráfica del alcance frente al ángulo, la
  rapidez inicial y la gravedad, el simulador, las preguntas y los anexos. Tu trabajo se guarda
  solo en este navegador cada vez que escribes.</p>
  <ol class="indice">
    ${SECCIONES.map((s,i) => `
      <li><button class="indice__btn" data-ir="${i}">
        <span class="indice__n">${String(i).padStart(2,'0')}</span>
        <span class="indice__t">${esc(s.t)}<br><span class="indice__d">${esc(s.d)}</span></span>
        <span class="indice__p">pág. ${i+1}</span>
      </button></li>`).join('')}
  </ol>
`);

/* --- 2 · Presentación --------------------------------------------------- */
PAGINAS.push(() => `
  <span class="eyebrow">Informe de laboratorio</span>
  <h1 class="titulo">Presentación de la práctica</h1>
  <p class="plomo">Galileo descubrió que un proyectil hace dos cosas a la vez sin que una estorbe
  a la otra: avanza y cae. De esa idea sale todo lo que vas a medir hoy.</p>

  <p>Vas a lanzar una bola con un <b>cañón de resorte</b> montado sobre un transportador, y a
  medir dos cosas en cada disparo: <b>cuánto tarda en llegar</b> al sensor de impacto y
  <b>a qué distancia</b> cae. Con esos dos datos, y el ángulo con el que salió, se puede
  reconstruir todo lo demás.</p>

  <p>El procedimiento se repite para <b>cinco ángulos</b> —15°, 20°, 25°, 30° y 35°— y
  <b>tres veces</b> en cada uno: quince lanzamientos. El rango del resorte no se toca en toda la
  práctica, de modo que la rapidez de salida debería ser siempre la misma. Comprobarlo es uno de
  los resultados.</p>

  <p>Lo que se obtiene al final son tres cosas distintas, cada una de un sitio. La <b>rapidez
  inicial</b> sale del movimiento <b>horizontal</b>, donde nada acelera a la bola:
  <span class="dato">v₀ = x̄ / (cos θ · t̄<sub>V</sub>)</span>. La <b>gravedad</b> sale del
  movimiento <b>vertical</b>, donde la bola cae mientras avanza. Y la <b>altura máxima</b> sale de
  combinar ambas. Esa separación limpia entre lo horizontal y lo vertical es, en el fondo, el tema
  de la práctica.</p>

  <div class="tarjetas">
    <div class="tarjeta">
      <h3 class="tarjeta__tit">Lo que necesitas</h3>
      <p>El sistema lanzador con su transportador, la compuerta óptica, el sensor de impacto, el
      cronómetro de dos canales, cinta métrica y papel carbón.</p>
    </div>
    <div class="tarjeta tarjeta--azul">
      <h3 class="tarjeta__tit">Lo que entregas</h3>
      <p>El informe completo: resumen, marco teórico, Tablas 1 y 2, la gráfica del alcance frente
      al ángulo, la rapidez inicial, la gravedad, las cuatro preguntas y tres conclusiones.</p>
    </div>
    <div class="tarjeta">
      <h3 class="tarjeta__tit">Cómo se evalúa</h3>
      <p>Coherencia de los datos, correcta aplicación de las ecuaciones del movimiento parabólico
      y justificación física de cada respuesta.</p>
    </div>
  </div>

  <div class="nota">
    <strong>Toda la cadena de cálculo va incluida.</strong> El informe pide promediar, despejar la
    rapidez inicial y calcular la altura máxima para cinco ángulos. Este cuaderno hace esa cadena
    entera a partir de lo que escribas en la Tabla 1: la Tabla 2 se llena sola, la gráfica se traza
    sola y el cuaderno añade el cálculo de la gravedad, que el tercer objetivo pide pero la Tabla 2
    del formato no recoge.
  </div>
`);

/* --- 3 · Objetivos ------------------------------------------------------ */
PAGINAS.push(() => `
  <span class="eyebrow">Sección 2</span>
  <h1 class="titulo">Objetivos</h1>

  <div class="tarjetas">
    <div class="tarjeta tarjeta--azul">
      <h3 class="tarjeta__tit">Objetivo 1 · La rapidez inicial</h3>
      <p>Determinar experimentalmente la rapidez inicial del lanzamiento de una bola actuando como
      proyectil, a partir de las medidas del alcance máximo horizontal, el ángulo inicial de
      disparo y el tiempo de vuelo.</p>
    </div>
    <div class="tarjeta tarjeta--azul">
      <h3 class="tarjeta__tit">Objetivo 2 · El efecto del ángulo</h3>
      <p>Estudiar el efecto del ángulo de disparo de un proyectil en el alcance máximo
      horizontal.</p>
    </div>
    <div class="tarjeta tarjeta--azul">
      <h3 class="tarjeta__tit">Objetivo 3 · La gravedad</h3>
      <p>Calcular el valor de la gravedad a partir del estudio del movimiento parabólico.</p>
    </div>
  </div>

  <h2 class="sub">Lo que hay que conseguir por el camino</h2>
  <div class="tarjetas">
    <div class="tarjeta">
      <h3 class="tarjeta__tit">Medir</h3>
      <p>Registrar la altura inicial, el alcance horizontal y el tiempo de vuelo para cinco
      ángulos, repitiendo tres veces cada lanzamiento.</p>
    </div>
    <div class="tarjeta">
      <h3 class="tarjeta__tit">Separar</h3>
      <p>Tratar por separado el movimiento horizontal y el vertical, y reconocer qué magnitud sale
      de cada uno.</p>
    </div>
    <div class="tarjeta">
      <h3 class="tarjeta__tit">Graficar</h3>
      <p>Representar el alcance frente al ángulo y localizar en la curva el ángulo que lo hace
      máximo.</p>
    </div>
    <div class="tarjeta">
      <h3 class="tarjeta__tit">Comparar</h3>
      <p>Contrastar la gravedad obtenida con el valor conocido y comprobar que la rapidez inicial
      no depende del ángulo.</p>
    </div>
  </div>

  <div class="nota">
    <strong>Al terminar deberías poder responder sin dudar:</strong> ¿cómo depende el alcance del
    ángulo?, ¿con cuál se llegó más lejos y cambiaría eso lanzando desde la mesa?, ¿qué determina
    la altura máxima? y ¿qué pasaría con una bola más pesada?
  </div>
`);

/* --- 4 · Materiales ----------------------------------------------------- */
PAGINAS.push(() => `
  <span class="eyebrow">Sección 3</span>
  <h1 class="titulo">Materiales e instrumentos</h1>
  <p class="plomo">Un cañón que fija las condiciones iniciales, dos sensores que marcan el
  principio y el final del vuelo, y una cinta métrica. Nada más hace falta para medir la gravedad.</p>

  <div class="tarjetas">
    ${MATERIALES.map((m,i) => `
      <div class="tarjeta${i < 3 ? ' tarjeta--azul' : ''}">
        <h3 class="tarjeta__tit">${esc(m.n)}</h3>
        <p>${esc(m.f)}</p>
      </div>`).join('')}
  </div>

  <h2 class="sub">Qué se mide directamente y qué no</h2>
  <div class="tabla-caja">
    <table class="tabla" style="min-width:620px">
      <thead><tr><th style="width:26%">Magnitud</th><th style="width:19%">¿Se mide?</th><th>De dónde sale</th></tr></thead>
      <tbody>
        <tr><td class="col-fija">Ángulo θ</td><td class="td-centro"><span class="dato">directa</span></td>
            <td>Se lee en el transportador del lanzador. Es una condición inicial, no un resultado.</td></tr>
        <tr><td class="col-fija">Altura y₀</td><td class="td-centro"><span class="dato">directa</span></td>
            <td>Con la cinta métrica, de la mesa a la compuerta óptica. Cambia con el ángulo.</td></tr>
        <tr><td class="col-fija">Alcance x</td><td class="td-centro"><span class="dato">directa</span></td>
            <td>De la vertical de la compuerta a la marca del papel carbón.</td></tr>
        <tr><td class="col-fija">Tiempo de vuelo t<sub>V</sub></td><td class="td-centro"><span class="dato">directa</span></td>
            <td>Lo entrega el cronómetro entre la compuerta y el sensor de impacto.</td></tr>
        <tr><td class="col-fija">Rapidez inicial v₀</td><td class="td-centro"><span class="dato">indirecta</span></td>
            <td>Del movimiento horizontal: v₀ = x̄ / (cos θ · t̄<sub>V</sub>).</td></tr>
        <tr><td class="col-fija">Altura máxima y</td><td class="td-centro"><span class="dato">calculada</span></td>
            <td>De la componente vertical de la velocidad inicial.</td></tr>
        <tr><td class="col-fija">Gravedad g</td><td class="td-centro"><span class="dato">indirecta</span></td>
            <td>Del movimiento vertical, una vez conocida v₀.</td></tr>
      </tbody>
    </table>
    <caption>Tabla de apoyo. Cuatro medidas directas sostienen tres resultados que ningún instrumento lee.</caption>
  </div>

  <div class="nota nota--aviso">
    <strong>No cambies el rango de disparo a mitad de la práctica.</strong> El rango fija la
    rapidez de salida, y toda la comparación entre ángulos se apoya en que esa rapidez sea la
    misma en los quince lanzamientos. Si en algún disparo el resorte no quedó bien enganchado —no
    sonó el <i>click</i>—, descarta esa medida y repítela.
  </div>
`);

/* --- 5 · Fundamento físico ---------------------------------------------- */
PAGINAS.push(() => `
  <span class="eyebrow">Sección 4</span>
  <h1 class="titulo">Fundamento físico</h1>
  <p class="plomo">Dos movimientos simultáneos que no se estorban. Entender eso es entender toda
  la práctica, y es también la razón de que se puedan despejar v₀ y g por separado.</p>

  <h2 class="sub">La idea de Galileo</h2>
  <p>Una vez que la bola sale del cañón, la única fuerza que actúa sobre ella es su peso —si se
  desprecia la resistencia del aire—, y el peso es vertical. En la dirección horizontal
  <b>no actúa nada</b>. La consecuencia es que el movimiento puede separarse en dos, simultáneos e
  independientes:</p>

  <div class="formulario">
    <div class="f-carta">
      <div class="f-carta__n">Horizontal · uniforme</div>
      <div class="f-carta__ec">x = v₀·cos θ · t</div>
      <div class="f-carta__p">La velocidad no cambia: nada la empuja ni la frena.</div>
    </div>
    <div class="f-carta">
      <div class="f-carta__n">Vertical · acelerado</div>
      <div class="f-carta__ec">y = v₀·sen θ·t − ½·g·t²</div>
      <div class="f-carta__p">La gravedad actúa solo aquí, hacia abajo.</div>
    </div>
    <div class="f-carta">
      <div class="f-carta__n">Combinando ambos</div>
      <div class="f-carta__ec">parábola</div>
      <div class="f-carta__p">Al eliminar el tiempo entre las dos, la trayectoria es una parábola.</div>
    </div>
  </div>

  <div class="nota">
    <strong>La independencia no es un truco de cálculo.</strong> Es un hecho comprobable: una bola
    lanzada horizontalmente y otra que se deja caer desde la misma altura <b>llegan al suelo en el
    mismo instante</b>, por mucho que la primera haya recorrido metros de distancia. Caer no
    estorba a avanzar.
  </div>

  <div class="instr">
    <h3 class="instr__tit">La trayectoria y sus componentes <span>esquema</span></h3>
    <div class="montaje" id="trayectoria-host"></div>
  </div>

  <h2 class="sub">Por qué el lanzamiento no termina a la misma altura</h2>
  <p>La bola sale de la compuerta a una altura <b>y₀</b> sobre la mesa y cae sobre el sensor, que
  está en la mesa. No es un lanzamiento a nivel: dispone de un recorrido vertical de más. Imponer
  que al cabo del tiempo de vuelo la posición vertical valga <b>−y₀</b> da la ecuación que lo
  gobierna todo:</p>

  <div class="formula">
    <div class="formula__ec">½·g·t<sub>V</sub>² − v₀·sen θ·t<sub>V</sub> − y₀ = 0</div>
    <div class="formula__pie">De ella puede despejarse el tiempo de vuelo, o la gravedad.</div>
  </div>

  <h2 class="sub">Cómo se obtiene cada resultado</h2>
  <div class="formulario formulario--apretado">
    <div class="f-carta">
      <div class="f-carta__n">1 · Rapidez inicial</div>
      <div class="f-carta__ec">v₀ = x̄ / (cos θ · t̄<sub>V</sub>)</div>
      <div class="f-carta__p">Solo del movimiento horizontal. No interviene g.</div>
    </div>
    <div class="f-carta">
      <div class="f-carta__n">2 · Gravedad</div>
      <div class="f-carta__ec">g = 2(v₀·sen θ·t̄<sub>V</sub> + y₀) / t̄<sub>V</sub>²</div>
      <div class="f-carta__p">Despejada de la ecuación vertical.</div>
    </div>
    <div class="f-carta">
      <div class="f-carta__n">3 · Altura máxima</div>
      <div class="f-carta__ec">y = y₀ + (v₀·sen θ)² / 2g</div>
      <div class="f-carta__p">Medida sobre la mesa. El punto más alto de la parábola.</div>
    </div>
  </div>

  <p>Nótese el orden: la rapidez inicial se obtiene <b>sin usar la gravedad</b>, a partir
  únicamente del movimiento horizontal. Solo después, con v₀ ya conocida, el movimiento vertical
  entrega g. Si se hiciera al revés —suponer g para hallar v₀— el tercer objetivo de la práctica
  perdería todo sentido.</p>

  <h2 class="sub">El alcance y el ángulo</h2>
  <p>Para un lanzamiento <b>al mismo nivel</b> el alcance vale
  <span class="dato">R = v₀²·sen(2θ)/g</span>, que es máximo a <b>45°</b> y da el mismo valor para
  ángulos complementarios: 30° y 60° llegan igual de lejos. Si se lanza desde cierta altura, esa
  simetría se rompe y el <b>ángulo óptimo baja de 45°</b>: como la bola dispone de una caída extra,
  le conviene salir más tendida y aprovechar ese tiempo avanzando.</p>

  <div class="nota nota--aviso">
    <strong>La masa no aparece en ninguna parte.</strong> Ni en el tiempo de vuelo, ni en el
    alcance, ni en la altura. Cambiar la bola por otra más pesada no alteraría la trayectoria
    <i>si saliera con la misma rapidez</i>; lo que sí cambiaría es la rapidez de salida, porque el
    resorte entrega una energía fija y ½·m·v₀² se reparte de otro modo.
  </div>

  <div class="nota">
    <strong>g no es una constante universal.</strong> Depende de la latitud y disminuye con la
    altitud. En Pereira, a unos 4,8° de latitud norte y 1411 m sobre el nivel del mar, el valor
    local estimado es de <span class="dato">${f3(G_PEREIRA)} m/s²</span>, algo menor que los
    <span class="dato">${f2(G_REF)} m/s²</span> que se usan como referencia en el curso.
  </div>
`);

/* --- 6 · Montaje experimental -------------------------------------------- */
PAGINAS.push(() => `
  <span class="eyebrow">Sección 5</span>
  <h1 class="titulo">Montaje experimental</h1>
  <p class="plomo">Primero el equipo real, tal como aparece en la guía; después un esquema con
  puntos sensibles para repasar qué papel cumple cada pieza.</p>

  <h2 class="sub">El montaje de la guía</h2>
  <div class="fotos fotos--una">
    <figure class="foto">
      <img src="imagenesUTP/montaje_lanzador.jpg"
           alt="Sistema lanzador de proyectiles con transportador, compuerta óptica, cronómetro de dos canales y sensor de impacto, con la trayectoria parabólica trazada">
      <figcaption><b>Figura 1.</b> Componentes del montaje experimental: el sistema lanzador con
      su palanca de disparo, el transportador y los tres rangos; la compuerta óptica a la salida
      del cañón, conectada a la entrada 1; y el sensor de impacto, conectado a la entrada 2. La
      curva azul es la trayectoria que recorre el proyectil.</figcaption>
    </figure>
  </div>

  <h2 class="sub">Esquema interactivo</h2>
  <p>Toca o haz clic sobre cada punto naranja para leer qué función cumple esa parte y por qué
  importa.</p>

  <div class="instr">
    <h3 class="instr__tit">Lanzador, compuerta y sensor <span>interactivo</span></h3>
    <div class="montaje" id="montaje-host"></div>
  </div>

  <div class="nota">
    <strong>Dónde empieza a contar todo.</strong> El origen del movimiento no es la boca del cañón
    sino el punto donde la bola <b>cruza la compuerta óptica</b>: ahí arranca el cronómetro, ahí se
    mide la altura y₀ y desde la vertical que pasa por ahí se mide el alcance x. Medir el alcance
    desde el cañón, o desde el borde de la mesa, es el error más fácil de cometer y desplaza todos
    los resultados en el mismo sentido.
  </div>
`);

/* --- 7 · Procedimiento --------------------------------------------------- */
PAGINAS.push(() => `
  <span class="eyebrow">Sección 6</span>
  <h1 class="titulo">Procedimiento</h1>
  <p class="plomo">Los dieciocho pasos de la guía, agrupados en doce bloques para que se sigan sin
  perder el hilo. Los marcados en naranja son aquellos en los que debes registrar datos.</p>

  <div class="pasos">
    ${PASOS.map((p,i) => `
      <div class="paso${p.clave ? ' paso--clave' : ''}">
        <div class="paso__n" aria-hidden="true">${i+1}</div>
        <div class="paso__t">
          <h3 class="sub3" style="margin:0 0 4px">${esc(p.t)}</h3>
          <p>${p.d}</p>
        </div>
      </div>`).join('')}
  </div>

  <div class="nota nota--aviso">
    <strong>Quince lanzamientos en total.</strong> Tres por ángulo y cinco ángulos. Conviene
    completar un ángulo entero —con su altura y₀ y sus tres disparos— antes de tocar el tornillo de
    inclinación, y revisar el promedio sobre la marcha: si uno de los tres alcances se aparta
    varios centímetros de los otros dos, lo más probable es que el resorte no quedara bien
    enganchado.
  </div>

  <div class="nota">
    <strong>Vuelve a medir y₀ cada vez que cambies el ángulo.</strong> El cañón pivota, de modo que
    al inclinarlo más la boca sube y la compuerta queda más alta. Usar la misma y₀ para los cinco
    ángulos es un error silencioso: no se nota en los datos, pero sesga la gravedad obtenida.
  </div>
`);

/* --- 8 · Encabezado del informe ------------------------------------------ */
PAGINAS.push(() => `
  <div class="cab-informe">
    <div class="cab-informe__txt">
      <span class="eyebrow">Informe · Encabezado</span>
      <h1 class="titulo" style="margin-bottom:0">Resumen y grupo de trabajo</h1>
    </div>
    <div class="casilla-nota">
      <span class="casilla-nota__et">Nota</span>
      ${campo({id:'nota', modo:'libre', ph:'—', et:'Nota asignada por el docente', clase:'campo--num'})}
      <span class="casilla-nota__pie">Espacio reservado para el docente</span>
    </div>
  </div>

  <h2 class="sub">Resumen</h2>
  <p style="font-size:.86rem;color:var(--tinta-3);margin:0 0 7px">
    Un párrafo que diga qué se hizo, cómo se hizo y qué se obtuvo. Se escribe al final, cuando ya
    conoces los resultados, aunque aparezca al principio del informe.</p>
  ${area({id:'resumen', filas:9, modelo:RESUMEN_MODELO, et:'Resumen del informe'})}

  <h2 class="sub">Estudiantes</h2>
  <div class="tabla-caja">
    <table class="tabla">
      <thead><tr><th class="col-num">#</th><th style="width:58%">Nombre completo</th><th style="width:34%">Código</th></tr></thead>
      <tbody>
        ${[0,1,2].map(i => `
          <tr>
            <td class="col-num">${i+1}</td>
            <td>${campo({id:'est'+i, modo:'libre', ph:'nombre y apellidos', et:'Estudiante '+(i+1)})}</td>
            <td>${campo({id:'cod'+i, modo:'libre', ph:'código', et:'Código '+(i+1), clase:'campo--num'})}</td>
          </tr>`).join('')}
      </tbody>
    </table>
    <caption>Integrantes del grupo de laboratorio.</caption>
  </div>

  <div class="nota">
    <strong>Estos campos son tuyos.</strong> El autocompletado no inventa nombres, códigos ni
    calificaciones: la casilla de nota, la tabla de estudiantes y el docente quedan siempre en
    blanco. El resumen sí trae un modelo de redacción.
  </div>
  ${accionesPagina()}
`);

/* --- 9 · Marco teórico --------------------------------------------------- */
PAGINAS.push(() => `
  <span class="eyebrow">Informe · Punto 1</span>
  <h1 class="titulo">Marco teórico</h1>
  ${enunciado(1, 'Redacte el marco teórico de la práctica.')}

  <p>Debe cubrir, con tus propias palabras y citando las fuentes que consultes: qué es el
  movimiento parabólico y bajo qué condiciones se da; en qué consiste la independencia de los
  movimientos horizontal y vertical y por qué es la clave del análisis; las ecuaciones de ambas
  componentes; cómo cambia el problema cuando el lanzamiento se hace desde cierta altura; de qué
  depende el alcance y por qué el ángulo óptimo no siempre es 45°; y por qué la masa del proyectil
  no aparece en ninguna ecuación.</p>

  ${area({id:'marco', filas:17, modelo:MARCO_MODELO, et:'Marco teórico',
          ph:'Desarrolla aquí el marco teórico…'})}

  <div class="nota">
    <strong>El autocompletado carga un texto de referencia.</strong> Sirve para que veas la
    profundidad y la estructura esperadas, no para copiarlo: el marco teórico se califica por la
    comprensión que demuestra, y esa tiene que ser tuya.
  </div>
  ${accionesPagina()}
`);

/* --- 10 · Preinforme ----------------------------------------------------- */
PAGINAS.push(() => {
  const th = rad(30), v0 = 2.35, y0 = 0.220;
  const vx = v0 * Math.cos(th), vy = v0 * Math.sin(th);
  const tv = (vy + Math.sqrt(vy*vy + 2*G_REF*y0)) / G_REF;
  const alc = vx * tv;
  const sube = vy*vy / (2*G_REF);
  return `
  <span class="eyebrow">Preinforme</span>
  <h1 class="titulo">Predicciones antes de disparar</h1>
  <p class="plomo">Cinco cálculos que puedes hacer con la teoría, antes de cargar el cañón.
  Recorren la cadena entera: de las componentes de la velocidad al alcance. Estos sí tienen
  respuesta correcta: el botón <em>Verificar</em> la contrasta.</p>

  <div class="datos-ejer">
    <span>v₀ = 2,35 m/s</span><span>θ = 30°</span><span>y₀ = 0,220 m</span>
    <span>g = ${f2(G_REF)} m/s²</span>
  </div>

  <div class="ejer">
    <p class="ejer__q"><b>1.</b> ¿Cuál es la <b>componente horizontal</b> de la velocidad
    inicial?</p>
    <div class="ejer__r">
      <label for="pre-vx">v₀·cos θ</label>
      ${num({id:'pre-vx', resp:[f3(vx)], tol:0.02, ph:'0,000',
             et:'Componente horizontal de la velocidad inicial',
             nota:`v₀·cos θ = 2,35 × cos 30° = 2,35 × 0,8660 = ${f3(vx)} m/s. Esta componente no cambia en todo el vuelo.`})}
      <span class="ejer__u">m/s</span>
    </div>
  </div>

  <div class="ejer">
    <p class="ejer__q"><b>2.</b> ¿Y la <b>componente vertical</b>?</p>
    <div class="ejer__r">
      <label for="pre-vy">v₀·sen θ</label>
      ${num({id:'pre-vy', resp:[f3(vy)], tol:0.02, ph:'0,000',
             et:'Componente vertical de la velocidad inicial',
             nota:`v₀·sen θ = 2,35 × sen 30° = 2,35 × 0,5 = ${f3(vy)} m/s. Esta sí cambia: disminuye, se anula arriba y después crece hacia abajo.`})}
      <span class="ejer__u">m/s</span>
    </div>
  </div>

  <div class="ejer">
    <p class="ejer__q"><b>3.</b> ¿Cuánto dura el <b>vuelo</b> hasta impactar en la mesa, 0,220 m
    más abajo?</p>
    <div class="ejer__r">
      <label for="pre-tv">tiempo de vuelo</label>
      ${num({id:'pre-tv', resp:[f4(tv)], tol:0.006, ph:'0,0000',
             et:'Tiempo de vuelo',
             nota:`De ½·g·t² − v₀·senθ·t − y₀ = 0 con la fórmula cuadrática: t = [${f3(vy)} + √(${f3(vy)}² + 2 × ${f2(G_REF)} × 0,220)] / ${f2(G_REF)} = ${f4(tv)} s. Se toma la raíz positiva.`})}
      <span class="ejer__u">s</span>
    </div>
  </div>

  <div class="ejer">
    <p class="ejer__q"><b>4.</b> ¿Cuál es el <b>alcance horizontal</b>?</p>
    <div class="ejer__r">
      <label for="pre-x">alcance x</label>
      ${num({id:'pre-x', resp:[f4(alc)], tol:0.012, ph:'0,0000',
             et:'Alcance horizontal',
             nota:`x = v₀·cosθ · t_V = ${f3(vx)} × ${f4(tv)} = ${f4(alc)} m. Solo interviene el movimiento horizontal, que es uniforme.`})}
      <span class="ejer__u">m</span>
    </div>
  </div>

  <div class="ejer">
    <p class="ejer__q"><b>5.</b> ¿Cuánto <b>sube</b> el proyectil por encima del punto de
    lanzamiento?</p>
    <div class="ejer__r">
      <label for="pre-sube">altura que sube</label>
      ${num({id:'pre-sube', resp:[f4(sube)], tol:0.003, ph:'0,0000',
             et:'Altura que sube sobre el punto de lanzamiento',
             nota:`h = (v₀·senθ)²/(2g) = ${f3(vy)}²/(2 × ${f2(G_REF)}) = ${f4(sube)} m. Medida sobre la mesa serían ${f4(sube + y0)} m, sumando y₀.`})}
      <span class="ejer__u">m</span>
    </div>
  </div>

  <div class="nota">
    <strong>Fíjate en el orden de magnitud.</strong> El proyectil sube apenas unos siete
    centímetros y recorre casi tres cuartos de metro: la parábola es mucho más ancha que alta. Por
    eso la altura inicial y₀, de unos veinte centímetros, pesa tanto en el resultado y no puede
    despreciarse.
  </div>
  ${accionesPagina()}
`;
});

/* --- 11 · Tabla 1 · Registro de lanzamientos ----------------------------- */
function tablaAngulo(i){
  const filas = [0,1,2].map(j => `
    <tr>
      <td class="col-mag">${j+1}</td>
      <td class="td-centro">${dato({ id:`x-${i+1}-${j}`, modelo:f3(xModelo(i,j)), ph:'0,000',
            et:`Alcance horizontal, ${ANGULOS[i]} grados, lanzamiento ${j+1}` })}</td>
      <td class="td-centro">${dato({ id:`tv-${i+1}-${j}`, modelo:f4(tvModelo(i,j)), ph:'0,0000',
            et:`Tiempo de vuelo, ${ANGULOS[i]} grados, lanzamiento ${j+1}` })}</td>
    </tr>`).join('');

  return `
    <div class="tabla-mini">
      <h3 class="tabla-mini__tit">θ = ${ANGULOS[i]}°</h3>
      <p class="tabla-mini__m">
        <label for="y0-${i+1}">y₀ =</label>
        ${dato({ id:`y0-${i+1}`, modelo:f3(y0Modelo(i)), ph:'0,000',
                 et:`Altura inicial para ${ANGULOS[i]} grados` })}
        <span class="ejer__u">m</span>
      </p>
      <div class="tabla-caja">
        <table class="tabla">
          <thead>
            <tr><th style="width:16%">No.</th>
                <th class="th-sub">x <span class="ud">(m)</span></th>
                <th class="th-sub">t<sub>V</sub> <span class="ud">(s)</span></th></tr>
          </thead>
          <tbody>${filas}</tbody>
        </table>
      </div>
      <div class="tabla-mini__prom" id="prom-${i+1}">—</div>
    </div>`;
}

PAGINAS.push(() => `
  <span class="eyebrow">Informe · Datos experimentales</span>
  <h1 class="titulo">Tabla 1 · Registro de lanzamientos</h1>
  ${enunciado(1, 'Registre, para cada ángulo de disparo, la altura inicial y₀ y los tres pares de alcance horizontal y tiempo de vuelo.')}

  <div class="datos-ejer">
    <span>${N_ANG} ángulos</span>
    <span>${N_MED} lanzamientos por ángulo</span>
    <span>rango de disparo: corto</span>
    <span>x desde la vertical de la compuerta</span>
  </div>

  <p>Los promedios, la rapidez inicial y la gravedad los calcula el cuaderno bajo cada tabla: tú
  solo escribes la altura y las seis lecturas de cada ángulo.</p>

  <div class="rejilla-tablas">
    ${[0,1,2,3,4].map(i => tablaAngulo(i)).join('')}
  </div>

  <div class="nota nota--aviso">
    <strong>Cada magnitud con su precisión.</strong> El alcance se mide con cinta métrica: tres
    decimales en metros, es decir, al milímetro. El tiempo lo da el cronómetro con cuatro
    decimales. Y la altura y₀ cambia de un ángulo a otro, así que hay que medirla cinco veces.
  </div>

  <div class="nota">
    <strong>Qué debe pasar al aumentar el ángulo.</strong> El tiempo de vuelo crece siempre,
    porque la bola sale más hacia arriba y tarda más en bajar. El alcance también crece en este
    intervalo, pero cada vez menos: esa desaceleración del crecimiento es justamente lo que
    responde a la primera pregunta del informe.
  </div>
  ${accionesPagina()}
`);

/* --- 12 · Tabla 2 · Análisis --------------------------------------------- */
PAGINAS.push(() => `
  <span class="eyebrow">Informe · Análisis · Puntos 1, 2 y 3</span>
  <h1 class="titulo">Tabla 2 · Análisis</h1>
  ${enunciado(1, 'Calcule el promedio del alcance horizontal y del tiempo de vuelo, la rapidez inicial v₀ con la que fue lanzado el proyectil y la altura máxima y alcanzada, y complete la Tabla 2.')}

  <p class="plomo">Esta tabla se completa <b>sola</b> con lo que escribiste en la Tabla 1. Si
  corriges un dato y vuelves aquí, toda la cadena se recalcula.</p>

  <div class="formulario formulario--apretado">
    <div class="f-carta">
      <div class="f-carta__n">Rapidez inicial</div>
      <div class="f-carta__ec">v₀ = x̄ / (cos θ · t̄<sub>V</sub>)</div>
      <div class="f-carta__p">Del movimiento horizontal, sin usar g.</div>
    </div>
    <div class="f-carta">
      <div class="f-carta__n">Gravedad</div>
      <div class="f-carta__ec">g = 2(v₀·sen&nbsp;θ·t̄<sub>V</sub>&nbsp;+ y₀)/t̄<sub>V</sub>²</div>
      <div class="f-carta__p">Del movimiento vertical, ya con v₀ conocida.</div>
    </div>
    <div class="f-carta">
      <div class="f-carta__n">Altura máxima</div>
      <div class="f-carta__ec">y = y₀ + (v₀·sen θ)²/2g</div>
      <div class="f-carta__p">Sobre la mesa: lo que sube más la altura de salida.</div>
    </div>
  </div>

  <div id="tabla-2"></div>

  <h2 class="sub">Lo que hay que mirar en esta tabla</h2>
  <div id="lectura-analisis"></div>

  <div class="nota">
    <strong>Sobre la columna de la gravedad.</strong> El formato impreso de la Tabla 2 no la
    incluye, pero el tercer objetivo de la práctica pide calcular g, así que el cuaderno la añade.
    Si tu docente prefiere la tabla tal cual aparece en el informe, basta con no transcribir esa
    columna: las demás son exactamente las que pide el formato.
  </div>

  <div class="nota nota--aviso">
    <strong>Qué significa «altura máxima».</strong> Aquí se mide <b>desde la mesa</b>, es decir,
    sumando y₀ a lo que el proyectil sube por encima del punto de lanzamiento. El detalle bajo cada
    ángulo de la Tabla 1 muestra las dos cifras por separado, por si tu docente prefiere la otra
    convención.
  </div>

  <div class="acciones-pag">
    <button class="btn-papel btn-papel--clave" data-ir="11">← Volver a la Tabla 1</button>
  </div>
`);

/* --- 13 · El alcance frente al ángulo ------------------------------------ */
PAGINAS.push(() => `
  <span class="eyebrow">Informe · Análisis · Objetivo 2</span>
  <h1 class="titulo">El alcance frente al ángulo</h1>
  ${enunciado(2, 'Estudie el efecto del ángulo de disparo sobre el alcance horizontal máximo.')}

  <p class="plomo">Los cinco alcances promedio, representados frente al ángulo. La curva continua
  es lo que predice la teoría con tu rapidez inicial y tu altura de lanzamiento; los puntos son lo
  que mediste.</p>

  <div class="grafica" id="graf-alcance"></div>

  <div id="resumen-alcance"></div>

  <h2 class="sub">Transcribe los resultados para tu informe</h2>
  <div class="tabla-caja">
    <table class="tabla" style="min-width:560px">
      <thead><tr>
        <th style="width:34%">Resultado</th>
        <th style="width:33%">Valor</th>
        <th style="width:33%">Ángulo con el que se obtuvo</th>
      </tr></thead>
      <tbody>
        <tr>
          <td class="col-fija">Mayor alcance horizontal</td>
          <td class="td-centro">${campo({id:'alc-max', modo:'libre', clase:'campo--num', ph:'0,000', et:'Mayor alcance horizontal'})}</td>
          <td class="td-centro">${campo({id:'ang-max', modo:'libre', clase:'campo--num', ph:'0', et:'Ángulo del mayor alcance'})}</td>
        </tr>
        <tr>
          <td class="col-fija">Mayor altura alcanzada</td>
          <td class="td-centro">${campo({id:'y-max', modo:'libre', clase:'campo--num', ph:'0,000', et:'Mayor altura alcanzada'})}</td>
          <td class="td-centro">${campo({id:'ang-ymax', modo:'libre', clase:'campo--num', ph:'0', et:'Ángulo de la mayor altura'})}</td>
        </tr>
      </tbody>
    </table>
    <caption>Las casillas se autocompletan con lo que el cuaderno acaba de calcular. Las unidades son metros y grados.</caption>
  </div>

  <div class="nota">
    <strong>Cuidado al responder la pregunta 2.</strong> El ángulo de mayor alcance <b>de tu
    tabla</b> no tiene por qué ser el óptimo: solo probaste cinco, y el máximo real puede quedar
    entre dos de ellos o más allá del último. La curva teórica de la gráfica te dice dónde está
    ese óptimo, y conviene mencionar la diferencia en la respuesta.
  </div>
  ${accionesPagina()}
`);

/* --- 14 · La rapidez inicial y la gravedad ------------------------------- */
PAGINAS.push(() => `
  <span class="eyebrow">Informe · Análisis · Objetivos 1 y 3</span>
  <h1 class="titulo">La rapidez inicial y la gravedad</h1>
  ${enunciado(3, 'Determine la rapidez inicial del lanzamiento y el valor de la gravedad, y compárelos con lo esperado.')}

  <p class="plomo">Los dos resultados centrales de la práctica, promediados sobre los cinco
  ángulos. Que la rapidez inicial salga igual en los cinco es la comprobación de que el método
  funciona.</p>

  <div class="ejer">
    <p class="ejer__q"><b>Valor de referencia.</b> El que se usa en el curso es
    ${f2(G_REF)} m/s². Puedes cambiarlo por el valor local estimado para Pereira,
    ${f3(G_PEREIRA)} m/s², y ver cómo varía el error.</p>
    <div class="ejer__r">
      <label for="g-ref">g de referencia</label>
      ${campo({id:'g-ref', modo:'libre', clase:'campo--num', ph:f2(G_REF),
               modelo:f2(G_REF), et:'Valor de referencia de la gravedad'})}
      <span class="ejer__u">m/s²</span>
    </div>
  </div>

  <div id="resultados-host"></div>

  <div class="formula">
    <div class="formula__ec">E<sub>r</sub> (%) = |g<sub>exp</sub> − g| / g × 100</div>
    <div class="formula__pie">Error relativo del valor experimental respecto al de referencia.</div>
  </div>

  <h2 class="sub">Transcribe los resultados para tu informe</h2>
  <div class="tabla-caja">
    <table class="tabla" style="min-width:560px">
      <thead><tr>
        <th style="width:40%">Resultado</th>
        <th style="width:30%">Valor</th>
        <th style="width:30%">Observación</th>
      </tr></thead>
      <tbody>
        <tr>
          <td class="col-fija">Rapidez inicial v₀ (m/s)</td>
          <td class="td-centro">${campo({id:'v0-exp', modo:'libre', clase:'campo--num', ph:'0,000', et:'Rapidez inicial promedio'})}</td>
          <td>Promedio de los cinco ángulos.</td>
        </tr>
        <tr>
          <td class="col-fija">Gravedad g (m/s²)</td>
          <td class="td-centro">${campo({id:'g-exp', modo:'libre', clase:'campo--num', ph:'0,000', et:'Gravedad experimental promedio'})}</td>
          <td>Promedio de los cinco ángulos.</td>
        </tr>
        <tr>
          <td class="col-fija">Error relativo de g (%)</td>
          <td class="td-centro">${campo({id:'err-g', modo:'libre', clase:'campo--num', ph:'0,00', et:'Error relativo de la gravedad'})}</td>
          <td>Frente al valor de referencia.</td>
        </tr>
      </tbody>
    </table>
    <caption>Resultados finales de la práctica. Las casillas se autocompletan con lo que el cuaderno calculó.</caption>
  </div>

  <div class="nota">
    <strong>Las dos cifras vienen de sitios distintos.</strong> La rapidez inicial sale solo del
    movimiento horizontal y la gravedad solo del vertical. Por eso no es circular obtener ambas
    del mismo experimento: si se hubiera supuesto un valor de g para hallar v₀, calcular g después
    no demostraría nada.
  </div>
  ${accionesPagina()}
`);

/* --- 15 · Simulador ------------------------------------------------------ */
PAGINAS.push(() => `
  <span class="eyebrow">Sección 7</span>
  <h1 class="titulo">Simulador de lanzamiento</h1>
  <p class="plomo">El mismo cañón, dentro del cuaderno. Sirve para anticipar lo que vas a medir y
  para explorar qué pasa fuera del intervalo que la práctica te deja probar.</p>

  <div class="instr">
    <h3 class="instr__tit">Tiro parabólico <span>en vivo</span></h3>
    <p class="instr__ayuda">Mueve los deslizadores de <b>ángulo</b>, <b>rapidez inicial</b> y
    <b>altura y₀</b> y pulsa <b>Disparar</b>. La curva gris de fondo es el alcance en función del
    ángulo para esa rapidez y esa altura: el punto naranja muestra dónde estás y la línea vertical,
    dónde está el óptimo.</p>
    <div id="simulador-host"></div>
  </div>

  <div class="nota">
    <strong>Prueba esto.</strong> Pon la altura y₀ en <b>cero</b> y busca el ángulo de mayor
    alcance: saldrá exactamente <b>45°</b>, y comprobarás que 30° y 60° llegan igual de lejos.
    Ahora sube y₀ a 0,22 m, como en el montaje real: el óptimo baja por debajo de 40° y la simetría
    desaparece. Ahí tienes, en dos movimientos, la respuesta a la pregunta 2 del informe.
  </div>

  <div class="nota nota--aviso">
    <strong>El simulador no tiene aire.</strong> Aquí la trayectoria es una parábola perfecta. En
    el laboratorio la resistencia del aire acorta ligeramente el alcance y rompe la simetría de la
    curva, aunque con una bola de plástico y menos de un metro de vuelo el efecto es pequeño.
  </div>
`);

/* --- 16 · Preguntas ------------------------------------------------------ */
PAGINAS.push(() => `
  <span class="eyebrow">Informe · Preguntas</span>
  <h1 class="titulo">Preguntas</h1>
  ${enunciado(4, 'Responda y justifique cada pregunta con los datos, la gráfica y las ecuaciones que obtuvo.')}

  ${PREGUNTAS.map((q,i) => `
    <h3 class="sub3">${i+1}. ${esc(q.texto)}</h3>
    <p style="font-size:.86rem;color:var(--tinta-3);margin:0 0 7px">${esc(q.guia)}</p>
    ${area({id:q.id, guia:q.guia, modelo:q.modelo, et:'Respuesta '+(i+1), filas:7})}
  `).join('')}

  <div class="nota">
    <strong>Se califica la justificación, no la extensión.</strong> Una respuesta corta que cite un
    valor concreto de tu Tabla 2 y lo explique con las ecuaciones del movimiento parabólico vale
    más que un párrafo largo y genérico.
  </div>
  ${accionesPagina()}
`);

/* --- 17 · Conclusiones --------------------------------------------------- */
PAGINAS.push(() => `
  <span class="eyebrow">Informe · Conclusiones</span>
  <h1 class="titulo">Conclusiones</h1>
  ${enunciado(5, 'Escriba 3 conclusiones con respecto a la práctica.')}
  <p class="plomo">Cada conclusión debe apoyarse en algo que mediste: una fila de la Tabla 2, la
  forma de la gráfica o el valor de la gravedad obtenido.</p>

  <div class="datos-ejer">
    <span>rapidez inicial</span><span>alcance y ángulo</span>
    <span>gravedad obtenida</span><span>fuentes de error</span>
  </div>

  ${CONCLUSIONES.map((c,i) => `
    <h3 class="sub3">Conclusión ${i+1}</h3>
    <p style="font-size:.86rem;color:var(--tinta-3);margin:0 0 7px">${esc(c.guia)}</p>
    ${area({id:c.id, guia:c.guia, modelo:c.modelo, et:'Conclusión '+(i+1), filas:6})}
  `).join('')}
  ${accionesPagina()}
`);

/* --- 18 · Glosario ------------------------------------------------------- */
PAGINAS.push(() => `
  <span class="eyebrow">Anexo</span>
  <h1 class="titulo">Glosario</h1>
  <p class="plomo">Toca cada término para desplegar su definición.</p>

  <div class="glosario">
    ${GLOSARIO.map((g,i) => `
      <div class="glos-item">
        <button class="glos-btn" data-glos="${i}" aria-expanded="false" aria-controls="glos-${i}">
          <span class="glos-term">${esc(g.t)}</span>
          <span class="glos-mas" aria-hidden="true">+</span>
        </button>
        <div class="glos-def" id="glos-${i}" hidden>
          ${esc(g.d)} ${g.f ? `<em>(${esc(g.f)})</em>` : ''}
        </div>
      </div>`).join('')}
  </div>
`);

/* --- 19 · Referencias ---------------------------------------------------- */
PAGINAS.push(() => `
  <span class="eyebrow">Anexo</span>
  <h1 class="titulo">Referencias</h1>
  <p class="plomo">Fuentes que sustentan el marco teórico y el procedimiento. Formato APA,
  7.ª edición.</p>

  <div style="margin-top:18px">
    ${REFERENCIAS.map(r => `
      <p style="padding-left:2.2em;text-indent:-2.2em;margin-bottom:14px;font-size:.95rem">${r}</p>
    `).join('')}
  </div>

  <div class="nota">
    <strong>Cómo citar este cuaderno.</strong> Departamento de Física, Universidad Tecnológica de
    Pereira. <i>Cuaderno interactivo de Laboratorio de Física I: lanzamiento parabólico</i>
    [Recurso educativo digital].
  </div>

  <h2 class="sub">Tu trabajo</h2>
  <p>Todo lo que escribiste se guarda únicamente en este navegador y en este dispositivo. Usa
  <em>Imprimir</em> en la barra superior para generar el PDF de entrega con todas las páginas, o
  <em>Reiniciar</em> para vaciar el cuaderno y empezar de nuevo.</p>
`);
