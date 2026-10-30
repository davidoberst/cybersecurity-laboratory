# Metodología de análisis de bundles JavaScript
 
Análisis estático del JavaScript que un sitio entrega al navegador: reconstrucción del código, librerías vulnerables, secretos expuestos, endpoints y patrones de código peligroso.
 
---
 
## Fase 1. Buscar un source map expuesto
 
Revisa si hay un source map disponible; a veces lo dejan accesible públicamente por error. Si existe, puedes reconstruir el proyecto casi completo, con nombres de variables y funciones originales.
 
```bash
curl -I https://sitio.com/bundle.js.map
```
 
### Si no hay source map
 
Descarga el bundle de forma reproducible y guárdalo con su hash, para que el análisis quede trazable a una versión concreta del archivo:
 
```bash
curl -s -o bundle.js https://sitio.com/bundle.js
sha256sum bundle.js > bundle.js.sha256
```
 
---
 
## Fase 2. Hacer el código legible (si no hay source map)
 
Sin el mapa, al menos puedes "desenredar" el formato. Una herramienta como **js-beautify** no adivina los nombres originales de las variables (eso es imposible sin el mapa), pero sí devuelve la indentación y los saltos de línea normales. En lugar de una sola línea gigante, tienes código estructurado que puedes navegar con un editor.
 
```bash
js-beautify bundle.js > bundle.pretty.js
```
 
> Sigue siendo críptico (`a`, `b`, `c` en vez de nombres reales), pero al menos es legible estructuralmente.
 
---
 
## Fase 3. Herramientas automáticas que buscan por ti
 
### 3.1 Librerías viejas y vulnerables (Retire.js)
 
Los sitios web no escriben todo su código desde cero: usan librerías de terceros (jQuery, Angular, Lodash, etc.) que vienen incluidas dentro del bundle. Si el sitio usa una versión vieja de una librería, y esa versión tiene un bug de seguridad documentado públicamente (con un identificador CVE), es una vulnerabilidad real y conocida.
 
**Retire.js** tiene una base de datos de "huellas digitales" de miles de versiones de librerías. Escanea el bundle, reconoce qué librería y versión hay adentro, y te dice si tiene vulnerabilidades conocidas.
 
```bash
npm install -g retire
retire --path . --outputformat json --outputpath retire.json
```
 
### 3.2 Contraseñas o claves olvidadas en el código (Gitleaks)
 
A veces, por error, un desarrollador deja una clave de API, una contraseña o un token de acceso escrito directamente en el código (en vez de guardarlo de forma segura en el servidor). **Gitleaks** busca patrones de texto que coinciden con el formato típico de esas claves (por ejemplo, las claves de AWS empiezan con `AKIA` seguido de 16 caracteres, las de Stripe con `sk_live_`, etc.).
 
```bash
gitleaks detect --source . --no-git
gitleaks detect --source . --no-git -r leaks.json
```
 
### 3.3 Encontrar endpoints que el sitio usa
 
El bundle, al ser el código que corre en el navegador, necesita saber a qué direcciones de servidor (API) pedir datos. Esas direcciones suelen estar escritas como texto dentro del archivo y se pueden extraer con `grep`:
 
```bash
grep -Eo 'https?://[a-zA-Z0-9./_?=&%-]+' bundle.pretty.js | sort -u
```
 
Esto devuelve una lista de URLs. Es valioso porque muestra la **superficie de ataque**: a qué servidores habla el sitio y qué rutas de API internas existen, que tal vez no estaban documentadas.
 
### 3.4 Patrones de código peligroso (Semgrep / js-x-ray)
 
Hay ciertas formas de escribir código que son intrínsecamente riesgosas. **Semgrep** tiene reglas predefinidas escritas por expertos en seguridad que detectan automáticamente estos patrones y explican por qué son riesgosos:
 
```bash
pip install semgrep
semgrep --config p/javascript bundle.pretty.js
semgrep --config p/javascript --config p/security-audit bundle.pretty.js --timeout 0
```
 
