Revisa si hay un source map disponible, a veces lo dejan accesible públicamente por error. Si existe, puedes reconstruir el proyecto casi completo, con nombres de variables y funciones originales.
: 
curl -I https://sitio.com/bundle.js.map

Si no : 

Descarga el bundle de forma reproducible y guárdalo con hash:

Fase 2: Hacer el código legible (si no hay source map)

Si no hay mapa, al menos puedes “desenredar” el formato. Una herramienta como js-beautify no adivina los nombres originales de las variables (eso es imposible sin el mapa), pero sí le devuelve la indentación y los saltos de línea normales, para que en lugar de una sola línea gigante tengas código estructurado que puedas navegar con un editor.
js-beautify bundle.js > bundle.pretty.js
Sigue siendo críptico (a, b, c en vez de nombres reales), pero al menos es legible estructuralmente.


Fase 3: Herramientas automáticas que buscan cosas por ti
Los sitios web no escriben todo su código desde cero: usan librerías de terceros (jQuery, Angular, Lodash, etc.) que vienen incluidas dentro del bundle. Si el sitio usa una versión vieja de una librería, y esa versión tiene un bug de seguridad ya documentado públicamente (con un identificador llamado CVE), es una vulnerabilidad real y conocida.

Retire.js es una herramienta que tiene una base de datos de “huellas digitales” de miles de versiones de librerías. Escanea tu bundle, reconoce qué librería y versión hay adentro, y te dice si tiene vulnerabilidades conocidas.

  3.1 — Librerías viejas y vulnerables (Retire.js)

Los sitios web no escriben todo su código desde cero: usan librerías de terceros (jQuery, Angular, Lodash, etc.) que vienen incluidas dentro del bundle. Si el sitio usa una versión vieja de una librería, y esa versión tiene un bug de seguridad ya documentado públicamente (con un identificador llamado CVE), es una vulnerabilidad real y conocida.

Retire.js es una herramienta que tiene una base de datos de “huellas digitales” de miles de versiones de librerías. Escanea tu bundle, reconoce qué librería y versión hay adentro, y te dice si tiene vulnerabilidades conocidas.

bash
npm install -g retire
retire --path . --outputformat json --outputpath retire.json


3.2 — Contraseñas o claves olvidadas en el código (Gitleaks)

A veces, por error, un desarrollador deja una clave de API, una contraseña, o un token de acceso escrito directamente en el código (en vez de guardarlo de forma segura en el servidor). Gitleaks busca patrones de texto que coinciden con el formato típico de esas claves (por ejemplo, las claves de AWS siempre empiezan con AKIA seguido de 16 caracteres, las de Stripe empiezan con sk_live_, etc.).

bash
gitleaks detect --source . --no-git
gitleaks detect --source . --no-git -r leaks.json

3.3 — Encontrar direcciones (endpoints) que el sitio usa

El bundle, al ser el código que corre en tu navegador, necesita saber a qué direcciones de servidor (API) pedir datos. Esas direcciones suelen estar escritas como texto dentro del archivo. Puedes extraerlas con un comando simple (grep busca texto que coincide con un patrón):

bash
grep -Eo 'https?://[a-zA-Z0-9./_?=&%-]+' bundle.pretty.js | sort -u

Esto te da una lista de URLs. Es valioso porque te muestra “superficie de ataque”: a qué servidores habla este sitio, qué rutas de API internas existen, que tal vez ni sabías que existían.

  
  3.4 — Patrones de código peligroso (Semgrep / js-x-ray)

Hay ciertas formas de escribir código que son intrínsecamente riesgosas

Semgrep es una herramienta que ya tiene reglas predefinidas escritas por expertos en seguridad, que detectan automáticamente estos patrones y te explican por qué son riesgosos:

bash
pip install semgrep
semgrep --config p/javascript bundle.pretty.js
semgrep --config p/javascript --config p/security-audit bundle.pretty.js --timeout 0


