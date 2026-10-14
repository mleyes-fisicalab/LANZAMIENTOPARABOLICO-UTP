/* ============================================================================
   DATOS.JS — Contenido académico de la práctica
   Universidad Tecnológica de Pereira · Facultad de Ciencias Básicas
   Departamento de Física · Laboratorio de Física I
   Práctica 7 · Lanzamiento parabólico
   Fuente: «Informe. Movimiento parabólico»
   ========================================================================== */

const META = {
  universidad:  "Universidad Tecnológica de Pereira",
  facultad:     "Facultad de Ciencias Básicas",
  departamento: "Departamento de Física",
  asignatura:   "Laboratorio de Física I",
  practica:     "Práctica 7",
  titulo:       "Lanzamiento parabólico"
};

/* ------------------------------------------------------- Constantes físicas */
const G_REF     = 9.80;      // valor de referencia del curso, m/s²
const G_PEREIRA = 9.776;     // valor local estimado para Pereira
const N_ANG     = 5;         // cinco ángulos de disparo
const N_MED     = 3;         // tres lanzamientos por ángulo
const ANGULOS   = [15, 20, 25, 30, 35];   // grados, tal como los fija la Tabla 1

/* --------------------------------------------------------------------------
   CONJUNTO DE DATOS DE REFERENCIA

   El grupo mide su propio lanzador, de modo que las casillas de la Tabla 1 no
   tienen una «respuesta correcta»: son datos suyos. Lo que sí tiene el cuaderno
   es un conjunto de datos de referencia, coherente y reproducible, que carga el
   botón «Autocompletar».

   Se construye con un lanzador en el rango corto, que entrega una rapidez
   inicial de 2,35 m/s, y con g = 9,776 m/s², el valor local estimado para
   Pereira. La altura y₀ de la compuerta óptica sobre la mesa no es la misma
   para todos los ángulos: el cañón pivota, de modo que al inclinarlo más la
   boca sube. Se modela como y₀ = 0,165 + 0,110·sen θ, que reproduce lo que se
   mide en el lanzador real. Con eso se obtiene el tiempo de vuelo resolviendo
   la ecuación del movimiento vertical y, de ahí, el alcance horizontal. A cada
   lectura se le aplica una desviación fija de alrededor del medio por ciento,
   escrita una a una para que el cuaderno entregue siempre el mismo ejemplo.
   -------------------------------------------------------------------------- */
const G_MODELO  = 9.776;     // gravedad con la que se generan los datos
const V0_MODELO = 2.35;      // rapidez inicial del lanzador, m/s
const Y_PIVOTE  = 0.165;     // altura del pivote del cañón sobre la mesa, m
const BRAZO     = 0.110;     // del pivote a la compuerta óptica, m

/* Desviación relativa de cada lectura */
const DESV_X = [
  [1.006, 0.995, 0.999], [0.997, 1.004, 1.000], [1.002, 0.998, 1.005],
  [0.999, 1.003, 0.996], [1.004, 0.999, 1.001]
];
const DESV_T = [
  [0.998, 1.003, 1.000], [1.002, 0.997, 1.001], [0.999, 1.002, 0.998],
  [1.001, 0.998, 1.003], [0.997, 1.001, 1.000]
];

const rad = a => a * Math.PI / 180;

/* Altura de la compuerta óptica sobre la mesa, para el ángulo i */
function y0Modelo(i){
  return Math.round((Y_PIVOTE + BRAZO * Math.sin(rad(ANGULOS[i]))) * 1000) / 1000;
}
/* Tiempo de vuelo teórico, resolviendo ½gt² − v₀·senθ·t − y₀ = 0 */
function tvTeorico(i){
  const s = V0_MODELO * Math.sin(rad(ANGULOS[i])), y0 = y0Modelo(i);
  return (s + Math.sqrt(s * s + 2 * G_MODELO * y0)) / G_MODELO;
}
function tvModelo(i, j){ return tvTeorico(i) * DESV_T[i][j]; }
function xModelo(i, j){
  return V0_MODELO * Math.cos(rad(ANGULOS[i])) * tvTeorico(i) * DESV_X[i][j];
}

/* Formato español: coma decimal */
function f1(x){ return Number(x).toFixed(1).replace('.', ','); }
function f2(x){ return Number(x).toFixed(2).replace('.', ','); }
function f3(x){ return Number(x).toFixed(3).replace('.', ','); }
function f4(x){ return Number(x).toFixed(4).replace('.', ','); }
function f5(x){ return Number(x).toFixed(5).replace('.', ','); }

/* ------------------------------------------------------- Índice de secciones */
const SECCIONES = [
  { t: "Portada",                         d: "Identificación del cuaderno" },
  { t: "Índice",                          d: "Navegación por secciones" },
  { t: "Presentación de la práctica",     d: "Qué se mide y para qué" },
  { t: "Objetivos",                       d: "Metas de la sesión" },
  { t: "Materiales e instrumentos",       d: "Lanzador, compuerta y sensor" },
  { t: "Fundamento físico",               d: "Dos movimientos independientes" },
  { t: "Montaje experimental",            d: "Figura del informe y esquema interactivo" },
  { t: "Procedimiento",                   d: "Los dieciocho pasos de la guía" },
  { t: "Encabezado del informe",          d: "Resumen, nota y grupo de trabajo" },
  { t: "Marco teórico",                   d: "Redacción propia del grupo" },
  { t: "Preinforme · Predicciones",       d: "Cinco cálculos previos" },
  { t: "Tabla 1 · Registro de lanzamientos", d: "Cinco ángulos y tres disparos" },
  { t: "Tabla 2 · Análisis",              d: "Promedios, rapidez inicial y altura" },
  { t: "El alcance frente al ángulo",     d: "Gráfica y ángulo óptimo" },
  { t: "La rapidez inicial y la gravedad",d: "Resultados y comparación" },
  { t: "Simulador de lanzamiento",        d: "La parábola en vivo" },
  { t: "Preguntas",                       d: "Cuatro preguntas para justificar" },
  { t: "Conclusiones",                    d: "Tres cierres propios" },
  { t: "Glosario",                        d: "Términos clave de la práctica" },
  { t: "Referencias",                     d: "Fuentes consultadas" }
];

/* ----------------------------------------- Materiales e instrumentos */
const MATERIALES = [
  { n:"Sistema lanzador de proyectiles", f:"Cañón de resorte montado sobre un transportador graduado. El resorte se comprime en uno de tres rangos —corto, medio o largo— que fijan la rapidez de salida, y el tornillo de inclinación permite elegir el ángulo. Es el instrumento que define las dos condiciones iniciales del problema: con qué rapidez y en qué dirección sale la bola." },
  { n:"Compuerta óptica", f:"Sensor que detecta el paso de la bola justo a la salida del cañón y arranca el cronómetro. Marca el origen del movimiento: el instante cero y el punto desde el que se miden tanto la altura y₀ como el alcance x." },
  { n:"Sensor de impacto", f:"Placa que detecta la llegada de la bola y detiene el cronómetro. Entre los dos sensores se mide el tiempo de vuelo, que es el dato más valioso de la práctica porque enlaza el movimiento horizontal con el vertical." },
  { n:"Cronómetro de dos canales", f:"Módulo que recibe la compuerta en la entrada 1 y el sensor de impacto en la entrada 2. Configurado en modo «Time» y «Two Gates», entrega directamente el intervalo entre ambas señales." },
  { n:"Cinta métrica o regla", f:"Para medir la altura y₀ de la compuerta sobre la mesa y la distancia horizontal x desde la vertical de la compuerta hasta la marca de impacto. Son las dos longitudes que sostienen todo el análisis." },
  { n:"Bola de plástico", f:"El proyectil. Su masa no interviene en ninguna de las ecuaciones del movimiento parabólico, cosa que la cuarta pregunta del informe invita a comprobar." },
  { n:"Papel blanco y papel carbón", f:"Colocados sobre el sensor de impacto, registran la marca exacta del punto de llegada. Sin ellos habría que estimar a ojo dónde cayó la bola, que es justamente la medida más difícil de hacer bien." }
];

/* ------------------------------------------------- Procedimiento (guía) */
const PASOS = [
  { t:"Conecta los sensores al cronómetro",
    d:"Conecta la <b>compuerta óptica al canal 1</b> y el <b>sensor de impacto al canal 2</b> del módulo del cronómetro, tal como aparece en la Figura 1." },
  { t:"Configura el cronómetro",
    d:"Enciéndelo, pulsa el botón <b>1 (Select Measurement)</b> para elegir el modo <b>«Time»</b> y el botón <b>2 (Select Mode)</b> para elegir <b>«Two Gates»</b>. Así medirá el intervalo entre las dos señales." },
  { t:"Comprueba la palanca de disparo",
    d:"Verifica que la palanca esté en la posición adecuada para ejecutar el lanzamiento, y que nada obstruya la trayectoria." },
  { t:"Fija el ángulo de disparo",
    d:"Con el <b>transportador</b> del lanzador, ajusta el tornillo de inclinación hasta el ángulo que toque: se empieza en <b>15°</b>.", clave:true },
  { t:"Mide la altura y₀",
    d:"Con la cinta métrica, mide la distancia vertical desde la mesa hasta el punto donde el proyectil atraviesa la compuerta óptica. <b>Regístrala</b> en la columna y₀ de la Tabla 1. Cambia con el ángulo, así que hay que medirla cada vez.", clave:true },
  { t:"Carga la bola en el rango corto",
    d:"Introduce la bola en el cañón en el modo <b>«SHORT RANGE»</b>. Comprueba la posición con el indicador de rango y con el <i>click</i> característico: el rango debe ser el mismo en todos los lanzamientos de la práctica." },
  { t:"Haz un disparo preliminar",
    d:"Lanza una vez sin medir, solo para localizar dónde cae la bola, y coloca el <b>sensor de impacto</b> de modo que el proyectil golpee en el centro del área de detección." },
  { t:"Prepara el papel carbón",
    d:"Coloca sobre el sensor una hoja de papel blanco y encima el papel carbón, para que la bola deje marcada la posición exacta del impacto." },
  { t:"Arma el cronómetro",
    d:"Vuelve a cargar la bola con el mismo rango y pulsa el botón <b>3 (Start/Stop)</b>. Comprueba que aparezca un <b>asterisco</b> en la segunda línea del display: es la señal de que está listo. No vuelvas a pulsarlo antes de que pase el proyectil, y cuida que nada interrumpa la compuerta antes del disparo." },
  { t:"Dispara y anota el tiempo de vuelo",
    d:"Tira de la palanca y deja que el proyectil impacte sobre el sensor. <b>Anota el tiempo</b> en la columna t<sub>V</sub> de la Tabla 1.", clave:true },
  { t:"Mide el alcance horizontal",
    d:"Con la cinta métrica, mide la distancia horizontal desde la <b>proyección vertical</b> del punto de paso por la compuerta hasta la marca de impacto. <b>Anótala</b> en la columna x de la Tabla 1.", clave:true },
  { t:"Repite y cambia de ángulo",
    d:"Repite el lanzamiento hasta tener <b>tres medidas</b> con el mismo ángulo, y después modifica el ángulo según indica la Tabla 1 —20°, 25°, 30° y 35°— repitiendo todo el procedimiento para cada uno.", clave:true }
];

/* ---------------------------- Partes del montaje (esquema interactivo) */
const PARTES = [
  { id:"lan", n:"Lanzador de proyectiles",
    d:"Cañón con resorte montado sobre un transportador. El resorte comprimido almacena la energía que después se convierte en energía cinética de la bola, de modo que el rango elegido —corto, medio o largo— fija la rapidez de salida. Mientras no se cambie de rango, esa rapidez es la misma en todos los lanzamientos, y comprobarlo es uno de los resultados de la práctica." },
  { id:"ang", n:"Transportador y ángulo θ",
    d:"Escala graduada con la que se fija la inclinación del cañón. El ángulo es la segunda condición inicial del problema: junto con la rapidez determina por completo la trayectoria. Hay que ajustarlo con cuidado, porque el alcance depende de él a través del producto sen θ·cos θ y un par de grados se notan." },
  { id:"com", n:"Compuerta óptica",
    d:"Detecta el paso de la bola a la salida del cañón y arranca el cronómetro. Define el origen del movimiento: el instante t = 0 y el punto respecto al cual se miden tanto la altura y₀ como el alcance x. Por eso la distancia horizontal no se mide desde el cañón sino desde la vertical que pasa por la compuerta." },
  { id:"y0",  n:"Altura inicial y₀",
    d:"Distancia vertical entre la mesa y el punto donde la bola cruza la compuerta. No es la misma para todos los ángulos: el cañón pivota, de modo que al inclinarlo más la boca sube y y₀ aumenta. Hay que medirla de nuevo cada vez que se cambia el ángulo, y es la razón de que la bola caiga más abajo de donde salió." },
  { id:"tra", n:"Trayectoria parabólica",
    d:"La bola describe una parábola porque su movimiento se compone de dos independientes: uno horizontal con rapidez constante, ya que nada la empuja ni la frena en esa dirección, y uno vertical uniformemente acelerado por la gravedad. Eliminando el tiempo entre las dos ecuaciones resulta una parábola." },
  { id:"alc", n:"Alcance horizontal x",
    d:"Distancia horizontal entre la vertical de la compuerta y la marca de impacto. Junto con el tiempo de vuelo da directamente la componente horizontal de la velocidad, v₀·cos θ = x/t_V, y de ahí la rapidez inicial. El papel carbón es lo que permite medirla con precisión en lugar de estimarla a ojo." },
  { id:"sen", n:"Sensor de impacto",
    d:"Placa que detecta la llegada de la bola y detiene el cronómetro. Entre su señal y la de la compuerta queda definido el tiempo de vuelo, que es el dato que enlaza el movimiento horizontal con el vertical y permite obtener la gravedad." },
  { id:"cro", n:"Cronómetro de dos canales",
    d:"Configurado en modo «Time» y «Two Gates», mide el intervalo entre la señal de la entrada 1 y la de la entrada 2. Su resolución, de milésimas de segundo, es la que fija con cuántas cifras tiene sentido anotar el tiempo de vuelo." }
];

/* ----------------------------------------------- Resumen y marco teórico */
const RESUMEN_MODELO =
  "En esta práctica se estudió el movimiento parabólico de un proyectil y se determinaron a " +
  "partir de él la rapidez inicial del lanzamiento y el valor de la aceleración de la gravedad. " +
  "Se empleó un sistema lanzador de proyectiles con transportador graduado, una compuerta óptica " +
  "que marca la salida de la bola y un sensor de impacto que registra su llegada, ambos " +
  "conectados a un cronómetro de dos canales. Manteniendo fijo el rango de disparo, se lanzó la " +
  "bola con cinco ángulos distintos, de 15° a 35°, repitiendo tres veces cada lanzamiento y " +
  "midiendo en cada caso la altura inicial de la compuerta sobre la mesa, el alcance horizontal " +
  "hasta la marca dejada en el papel carbón y el tiempo de vuelo. A partir de los promedios se " +
  "obtuvo la rapidez inicial mediante v₀ = x̄/(cos θ·t̄_V), que resultó prácticamente igual en los " +
  "cinco ángulos, del orden de 2,35 m/s, lo que confirma que el rango de disparo fija esa rapidez " +
  "con independencia de la inclinación. De la ecuación del movimiento vertical se dedujo después " +
  "la gravedad, con un valor medio próximo a 9,78 m/s² y un error inferior al uno por ciento. " +
  "Finalmente se calculó la altura máxima alcanzada en cada lanzamiento y se comprobó que, dentro " +
  "del intervalo ensayado, tanto el alcance como la altura crecen con el ángulo de disparo.";

const MARCO_MODELO =
  "El movimiento parabólico es el de un cuerpo lanzado con una velocidad inicial oblicua sobre el " +
  "que, una vez en el aire, solo actúa su peso. Su estudio se apoya en una idea que Galileo fue " +
  "el primero en formular con claridad: el movimiento puede descomponerse en dos movimientos " +
  "simples que ocurren a la vez y que son independientes entre sí.\n\n" +
  "En la dirección horizontal no actúa ninguna fuerza, si se desprecia la resistencia del aire, de " +
  "modo que la componente horizontal de la velocidad permanece constante durante todo el vuelo y " +
  "el movimiento es uniforme: x = v₀·cos θ·t. En la dirección vertical actúa el peso, constante, " +
  "de manera que el movimiento es uniformemente acelerado hacia abajo: la altura respecto del " +
  "punto de lanzamiento vale v₀·sen θ·t − ½·g·t². La trayectoria que resulta de combinar ambos, " +
  "eliminando el tiempo entre las dos ecuaciones, es una parábola.\n\n" +
  "La independencia de las dos componentes no es una simplificación de cálculo sino un hecho " +
  "físico comprobable: una bola lanzada horizontalmente y otra que se deja caer desde la misma " +
  "altura llegan al suelo en el mismo instante, por mucho que la primera haya recorrido metros " +
  "de distancia. Es esa independencia la que permite despejar la rapidez inicial de la práctica " +
  "usando únicamente el movimiento horizontal, y la gravedad usando únicamente el vertical.\n\n" +
  "Si el lanzamiento se hace desde una altura y₀ por encima del punto de llegada, el cuerpo " +
  "dispone de un recorrido vertical adicional y el tiempo de vuelo es mayor que el que " +
  "correspondería a un lanzamiento al mismo nivel. Imponiendo que al cabo del tiempo de vuelo la " +
  "posición vertical sea −y₀, se obtiene la ecuación ½·g·t_V² − v₀·sen θ·t_V − y₀ = 0, de la que " +
  "puede despejarse cualquiera de las magnitudes que intervienen. En particular, conocidos el " +
  "tiempo de vuelo, el ángulo, la rapidez inicial y la altura, se obtiene g = 2(v₀·sen θ·t_V + " +
  "y₀)/t_V².\n\n" +
  "El alcance horizontal depende del ángulo de una forma que conviene entender bien. Para un " +
  "lanzamiento al mismo nivel, el alcance es proporcional a sen(2θ) y resulta máximo a 45°, con " +
  "la particularidad de que dos ángulos complementarios —por ejemplo 30° y 60°— dan el mismo " +
  "alcance. Si el lanzamiento se hace desde cierta altura, en cambio, el ángulo óptimo es menor " +
  "que 45°, y tanto menor cuanto mayor sea esa altura: conviene inclinar menos el cañón y " +
  "aprovechar el tiempo extra que regala la caída.\n\n" +
  "Un rasgo que distingue a este movimiento de otros es que ninguna de sus ecuaciones contiene la " +
  "masa del proyectil. Cambiar la bola por otra más pesada no altera la trayectoria, siempre que " +
  "la rapidez de salida sea la misma y la resistencia del aire siga siendo despreciable. Es la " +
  "misma razón por la que todos los cuerpos caen con la misma aceleración.";

/* ---------------------------------------------------------- Preguntas */
const PREGUNTAS = [
  { id:"q1",
    texto:"¿Qué relación se observa entre el alcance horizontal máximo del proyectil y el ángulo de disparo utilizado?",
    guia:"Ordena los cinco alcances promedio y mira si crecen, decrecen o pasan por un máximo.",
    modelo:"Dentro del intervalo ensayado, de 15° a 35°, el alcance horizontal aumenta de forma continua con el ángulo de disparo: pasó de unos 0,61 m a 15° hasta unos 0,76 m a 35°. La relación no es lineal, sin embargo, y basta comparar los incrementos para notarlo: entre 15° y 20° el alcance creció unos 5 cm, mientras que entre 30° y 35° creció apenas 2 cm. Eso indica que la curva se está aplanando y que el máximo queda poco más allá del último ángulo ensayado. La razón es que el alcance depende del producto de dos factores que tiran en sentidos contrarios: al aumentar el ángulo, la componente vertical de la velocidad crece y el proyectil permanece más tiempo en el aire, pero la componente horizontal disminuye y avanza más despacio. El alcance máximo se da donde ambos efectos se equilibran, y a partir de ahí empieza a disminuir." },
  { id:"q2",
    texto:"¿Cuál fue el ángulo de disparo que permitió alcanzar el mayor alcance horizontal? ¿Este resultado cambiaría si el proyectil se lanzara desde la superficie de la mesa, es decir, con una altura inicial y₀ = 0 m?",
    guia:"Fíjate en que el máximo de la tabla es el último ángulo probado, y piensa qué papel juega la altura inicial.",
    modelo:"De los cinco ángulos ensayados, el mayor alcance se obtuvo con el de 35°, que fue el más inclinado de la serie. Conviene matizar la respuesta: 35° es el máximo de la tabla, pero no necesariamente el máximo absoluto, porque el alcance todavía venía creciendo al llegar a él. Con la rapidez y la altura de este montaje, el óptimo real está algo por encima, alrededor de 38°, y habría que ensayar ángulos mayores para verlo. Y sí, el resultado cambiaría si se lanzara desde la mesa con y₀ = 0: en ese caso el alcance es proporcional a sen(2θ) y el máximo se da exactamente a 45°, con la propiedad adicional de que ángulos complementarios como 30° y 60° producen el mismo alcance. La altura inicial rompe esa simetría: como el proyectil dispone de una caída extra, le conviene salir más tendido para aprovechar ese tiempo adicional avanzando horizontalmente, y por eso el ángulo óptimo baja de 45°. Cuanto mayor sea y₀ frente a la altura que el proyectil alcanza por sí mismo, más bajo resulta ese óptimo." },
  { id:"q3",
    texto:"De acuerdo con los resultados reportados en la Tabla 2, ¿cuál fue el valor máximo de altura alcanzada por el proyectil y con qué ángulo de disparo se obtuvo? ¿Qué factores influyen directamente en estos resultados?",
    guia:"Mira la columna de la altura máxima y recuerda de qué depende la componente vertical de la velocidad.",
    modelo:"La altura máxima mayor se obtuvo con el ángulo de 35°, el más inclinado de los ensayados, y fue del orden de 0,32 m medida sobre la mesa. A diferencia del alcance, la altura crece de forma continua con el ángulo en todo el intervalo y seguiría creciendo hasta los 90°, porque depende únicamente de la componente vertical de la velocidad inicial. Los factores que influyen directamente son tres. El primero es el ángulo: cuanto mayor sea, mayor es v₀·sen θ y más alto sube el proyectil. El segundo es la rapidez inicial, que entra al cuadrado, de modo que lanzar con un rango mayor subiría la altura mucho más deprisa de lo que subiría el ángulo. El tercero es la gravedad, que aparece dividiendo: en un lugar con menor gravedad el mismo lanzamiento alcanzaría más altura. A ellos se suma la altura inicial y₀ si, como aquí, la altura se mide desde la mesa y no desde el punto de lanzamiento. Lo que no influye es la masa del proyectil." },
  { id:"q4",
    texto:"Si se reemplaza el proyectil por un objeto de mayor masa, ¿cómo se vería afectado el desarrollo y los resultados del experimento?",
    guia:"Busca la masa en las ecuaciones del movimiento parabólico, y después piensa en el resorte del lanzador.",
    modelo:"Hay que distinguir entre el movimiento en el aire y el lanzamiento. Una vez que el proyectil ha salido del cañón, su masa no interviene en ninguna de las ecuaciones del movimiento parabólico: ni el tiempo de vuelo, ni el alcance, ni la altura máxima dependen de ella. Dos bolas de distinta masa lanzadas con la misma rapidez y el mismo ángulo describirían trayectorias idénticas, por la misma razón por la que todos los cuerpos caen con la misma aceleración. El experimento sí cambiaría, en cambio, en el momento del disparo. El resorte del lanzador entrega siempre la misma energía al comprimirlo en un rango dado, y esa energía se reparte según ½·m·v₀²: con una bola más pesada la rapidez de salida sería menor, y con ella disminuirían el alcance, la altura y, en menor medida, el tiempo de vuelo. Es decir, los resultados cambiarían, pero no porque la física del vuelo dependa de la masa, sino porque las condiciones iniciales serían otras. Un tercer efecto, de segundo orden, es que un cuerpo más denso resiste mejor el rozamiento del aire; en este montaje, con trayectorias de menos de un metro, es despreciable." }
];

/* -------------------------------------------------------- Conclusiones */
const CONCLUSIONES = [
  { id:"c1",
    guia:"Sobre la rapidez inicial: qué valor salió y qué significa que sea igual en los cinco ángulos.",
    modelo:"La rapidez inicial del proyectil se determinó a partir del movimiento horizontal, mediante v₀ = x̄/(cos θ·t̄_V), y resultó prácticamente la misma en los cinco ángulos ensayados, del orden de 2,35 m/s, con una dispersión inferior al medio por ciento. Ese resultado tiene una lectura física directa: la rapidez de salida la fija el resorte del lanzador a través del rango elegido, y no depende de la inclinación del cañón. Como el rango se mantuvo en «corto» durante toda la práctica, era de esperar que los cinco valores coincidieran, y su coincidencia sirve de comprobación interna de que las medidas de alcance y tiempo son consistentes entre sí." },
  { id:"c2",
    guia:"Sobre la relación entre el alcance, la altura y el ángulo de disparo.",
    modelo:"El alcance horizontal y la altura máxima se comportan de manera distinta frente al ángulo de disparo. La altura crece de forma continua con el ángulo, porque depende solo de la componente vertical de la velocidad inicial, y alcanzó su mayor valor en el lanzamiento de 35°. El alcance, en cambio, crece cada vez más despacio y tiende a un máximo: en el intervalo ensayado fue también el de 35° el que llegó más lejos, pero los incrementos entre ángulos sucesivos se fueron reduciendo, lo que indica que el óptimo queda poco más allá. La altura inicial del lanzamiento es la responsable de que ese óptimo no sea 45°, como ocurriría si el disparo se hiciera desde la mesa, sino un ángulo menor." },
  { id:"c3",
    guia:"Sobre el valor de la gravedad obtenido y las fuentes de error de la práctica.",
    modelo:"A partir de la ecuación del movimiento vertical se obtuvo el valor experimental de la gravedad, con un promedio del orden de 9,78 m/s² y un error inferior al uno por ciento frente al valor de referencia. El acuerdo es notable si se tiene en cuenta que la gravedad no se midió directamente, sino que se dedujo de longitudes y de tiempos de unas décimas de segundo. Las fuentes de error más probables son la medida del alcance horizontal, que exige localizar bien la marca del papel carbón y proyectar verticalmente el punto de paso por la compuerta, y la medida de la altura y₀, que cambia con cada ángulo y es fácil de arrastrar de un lanzamiento a otro. A ellas se suman el ajuste del ángulo en el transportador y una pequeña variabilidad del resorte entre disparos, que es la razón de repetir tres veces cada lanzamiento." }
];

/* ------------------------------------------------------------- Glosario */
const GLOSARIO = [
  { t:"Movimiento parabólico", d:"Movimiento de un cuerpo lanzado oblicuamente sobre el que solo actúa la gravedad. Su trayectoria es una parábola.", f:"" },
  { t:"Proyectil", d:"Cuerpo lanzado al aire que se mueve únicamente bajo la acción de su peso, sin propulsión propia.", f:"" },
  { t:"Independencia de los movimientos", d:"Principio según el cual las componentes horizontal y vertical de un movimiento ocurren a la vez sin influirse entre sí. Es la base de todo el análisis.", f:"" },
  { t:"Rapidez inicial (v₀)", d:"Módulo de la velocidad con la que el proyectil abandona el cañón. La fija el rango de disparo y no depende del ángulo.", f:"" },
  { t:"Ángulo de disparo (θ)", d:"Inclinación del cañón respecto de la horizontal, leída en el transportador del lanzador.", f:"" },
  { t:"Componente horizontal", d:"v₀·cos θ. Permanece constante durante todo el vuelo, porque en esa dirección no actúa ninguna fuerza.", f:"" },
  { t:"Componente vertical", d:"v₀·sen θ en el instante inicial. Disminuye, se anula en el punto más alto y después cambia de sentido.", f:"" },
  { t:"Altura inicial (y₀)", d:"Distancia vertical entre la mesa y el punto donde la bola cruza la compuerta óptica. Cambia con el ángulo porque el cañón pivota.", f:"" },
  { t:"Alcance horizontal (x)", d:"Distancia horizontal entre la vertical de la compuerta y la marca de impacto.", f:"" },
  { t:"Tiempo de vuelo (t_V)", d:"Intervalo entre el paso por la compuerta óptica y el impacto sobre el sensor. Es el dato que enlaza los movimientos horizontal y vertical.", f:"" },
  { t:"Altura máxima", d:"Punto más alto de la trayectoria, donde la componente vertical de la velocidad se anula. Vale (v₀·sen θ)²/(2g) por encima del punto de lanzamiento.", f:"" },
  { t:"Ángulo óptimo", d:"El que produce el mayor alcance. Vale 45° si el lanzamiento es al mismo nivel, y menos de 45° si se lanza desde cierta altura.", f:"" },
  { t:"Ángulos complementarios", d:"Dos ángulos que suman 90°. En un lanzamiento al mismo nivel producen el mismo alcance, propiedad que se pierde si y₀ no es nula.", f:"" },
  { t:"Compuerta óptica", d:"Sensor que detecta el paso del proyectil interrumpiendo un haz de luz, y arranca el cronómetro.", f:"" },
  { t:"Sensor de impacto", d:"Placa que detecta la llegada del proyectil y detiene el cronómetro.", f:"" },
  { t:"Rango de disparo", d:"Grado de compresión del resorte del lanzador: corto, medio o largo. Determina la rapidez de salida.", f:"" },
  { t:"Gravedad (g)", d:"Aceleración que la Tierra imprime a los cuerpos cercanos a su superficie. Vale unos 9,8 m/s², con variaciones según la latitud y la altitud.", f:"" },
  { t:"Resistencia del aire", d:"Fuerza que se opone al avance de un cuerpo en el aire. En trayectorias cortas y con proyectiles densos se considera despreciable.", f:"" },
  { t:"Promedio", d:"Media aritmética de las mediciones repetidas de una misma magnitud. Reduce el efecto de los errores aleatorios.", f:"" },
  { t:"Error relativo", d:"Diferencia entre el valor experimental y el de referencia, dividida por el de referencia y expresada en porcentaje.", f:"" },
  { t:"Resolución", d:"Menor variación de la magnitud medida que produce un cambio perceptible en la indicación del instrumento.", f:"VIM 4.14" }
];

/* ----------------------------------------------------------- Referencias */
const REFERENCIAS = [
  "Serway, R. A., & Jewett, J. W. (2019). <i>Física para ciencias e ingeniería con física moderna</i> (10.ª ed., Vol. 1). Cengage Learning. Capítulo 4: Movimiento en dos dimensiones — movimiento de proyectiles.",
  "Young, H. D., & Freedman, R. A. (2018). <i>Sears y Zemansky. Física universitaria con física moderna</i> (14.ª ed., Vol. 1). Pearson. Capítulo 3: Movimiento en dos o tres dimensiones.",
  "Tipler, P. A., & Mosca, G. (2010). <i>Física para la ciencia y la tecnología</i> (6.ª ed., Vol. 1). Reverté.",
  "Galilei, G. (1638). <i>Discorsi e dimostrazioni matematiche intorno a due nuove scienze</i>. Jornada cuarta: el movimiento de los proyectiles.",
  "Taylor, J. R. (2014). <i>Introducción al análisis de errores. El estudio de las incertidumbres en las mediciones físicas</i> (2.ª ed.). Reverté.",
  "Departamento de Física, Universidad Tecnológica de Pereira. <i>Informe. Movimiento parabólico</i>. Laboratorio de Física I, Facultad de Ciencias Básicas."
];
