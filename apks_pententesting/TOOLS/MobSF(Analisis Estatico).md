# Herramientas para Pentesting de APKs

## MobSF Mobile Security Framework : 
Mobile Security Framework (MobSF) is an automated, all-in-one mobile application (Android/iOS/Windows) pen-testing, malware analysis and security assessment framework capable of performing static and dynamic analysis.

Permite el analisis Estatico ( : Examina el código fuente (en software) o la estructura (en ingeniería) de forma directa sin ponerlo en marcha.) 

y el analisis dinamico (Evalúa el comportamiento del sistema mientras se está ejecutando o interactuando con estímulos externos que cambian con el tiempo)


Instalacion de MObSF : https://www.google.com/url?sa=t&source=web&rct=j&opi=89978449&url=https://www.youtube.com/watch%3Fv%3DLD88v1ggX0E&ved=2ahUKEwjzivjEq8KXAxWdSjABHR9fEN0Q3aoNegQIFBAP&usg=AOvVaw2h31pEydAow1KuJVvFiUZ8 

Instalacion : 

1. Clonar repositorio 
https://github.com/mobsf/mobile-security-framework-mobsf

2. Instalar dependencias y ejecutar el script de setup

En Linux/macOS, el repo trae un script de instalación nativo:

```bash
chmod +x setup.sh run.sh
./setup.sh
```

**Nota importante — compatibilidad de versión de Python:**
El script `setup.sh` valida explícitamente la versión de Python instalada en el sistema. Al momento de esta instalación, MobSF exige **Python 3.12 o 3.13**. Si tu sistema tiene una versión más nueva (ej. Python 3.14, común en distros rolling-release como Arch Linux), el script falla con: [ERROR] MobSF dependencies require Python 3.12 - 3.13. You have Python 3.14.8. 



Esto ocurre aunque las dependencias internas del proyecto (Poetry/pyproject.toml) ya tengan soporte agregado para 3.14 — el chequeo del script de instalación todavía no se actualizó para reflejarlo.

### Alternativa: instalación vía Docker (recomendada si hay conflicto de versión de Python)

En vez de pelear con versiones de Python a nivel de sistema, Docker empaqueta MobSF junto con la versión exacta de Python que necesita, de forma aislada — sin tocar el Python del sistema operativo.

**2.1. Instalar Docker (si no está instalado)**

En Arch Linux:
```bash
sudo pacman -S docker docker-compose
```

**2.2. Activar e iniciar el servicio de Docker**
```bash
sudo systemctl enable --now docker
```

Verificar que esté corriendo:
```bash
sudo systemctl status docker
```
Debe mostrar `active (running)`.

**2.3. Agregar el usuario al grupo `docker`** (para no tener que usar `sudo` en cada comando)
```bash
sudo usermod -aG docker $USER
```
> Este cambio requiere cerrar sesión y volver a entrar (o reiniciar) para tomar efecto. Alternativa rápida sin reiniciar: `newgrp docker`.

Verificar que funcione sin `sudo`:
```bash
docker ps
```
Debe devolver una tabla vacía (headers sin filas), sin pedir contraseña ni dar error de permisos.

**2.4. Construir la imagen de MobSF**

Desde la carpeta raíz del repo clonado:
```bash
cd mobile-security-framework-mobsf
docker build -t mobsf .
```

- `docker build`: arma la imagen (plantilla con todo lo necesario para correr MobSF).
- `-t mobsf`: le pone el nombre/tag `mobsf` a la imagen, para referenciarla fácil después.
- `.`: usa la carpeta actual como contexto de build (ahí está el `Dockerfile` y el código).

Este paso tarda varios minutos (descarga la imagen base, instala dependencias del sistema y de Python dentro del contenedor). Al finalizar, debería mostrar:

Successfully built <hash>
Successfully tagged mobsf:latest


**2.5. Levantar el contenedor**
```bash
docker run -it --rm -p 8000:8000 mobsf
```

- `-it`: modo interactivo, muestra los logs en vivo en la terminal.
- `--rm`: borra el contenedor al cerrarlo (no deja basura acumulada; la imagen ya construida queda intacta).
- `-p 8000:8000`: mapea el puerto 8000 de la máquina local al puerto 8000 del contenedor, para poder acceder desde el navegador.

**2.6. Obtener credenciales de acceso**

La primera vez que arranca, MobSF genera un usuario y contraseña automáticamente. Aparecen en los logs de la terminal donde corriste `docker run` (buscar líneas tipo `Username:` / `Password:`).

Si no se ven en el scroll de la terminal, revisar los logs completos del contenedor desde otra terminal:
```bash
docker ps                      # obtener el CONTAINER ID
docker logs <CONTAINER_ID>     # buscar ahí las credenciales
```

**2.7. Acceder a la interfaz**

Una vez corriendo, abrir en el navegador: http://127.0.0.1:8000


Loguearse con las credenciales obtenidas, y ya se puede subir un APK para análisis (Static Analysis).

---

## 3. Interpretando el reporte — qué mirar primero

El reporte de MobSF se organiza por severidad: **High → Warning → Info → Secure**. Priorizar en ese orden.

Secciones clave del reporte:
- **App Security Score**: puntaje general (0-100). Punto de partida, no la conclusión — hay que revisar qué compone el número.
- **Manifest Analysis**: componentes exportados, permisos, configuración de backup.
- **Code Analysis**: patrones inseguros detectados en el código descompilado (criptografía débil, SQL raw, manejo de WebView, etc.), cada uno con severidad y archivo/línea.
- **Hardcoded Secrets**: strings de alta entropía que parecen credenciales/claves.
- **Network Security**: configuración de tráfico cifrado, certificate pinning.
- **Trackers / Domain Malware Check**: dominios de terceros contactados por la app.

### Importante: filtrar falsos positivos antes de reportar

El análisis estático automatizado es el **punto de partida**, no el reporte final. MobSF (como cualquier herramienta SAST) genera ruido que requiere criterio humano para descartar, entre otros:

- **Hashes/números largos marcados como "hardcoded secrets"**: muchas veces son constantes criptográficas públicas de librerías estándar (ej. el orden de la curva elíptica P-256 usada en ECDSA), no secretos reales.
- **Hallazgos sobre código de librerías de terceros** (ej. SQLCipher, Firebase SDK): la herramienta no distingue entre código propio y de dependencias — hay que revisar el path del archivo (`net/zetetic/...`, `com/google/...`) para descartar.
- **API keys de Firebase/Google**: estas keys están diseñadas para ir embebidas en el cliente (no son secretas por diseño) — la seguridad real depende de las reglas configuradas en la consola (Firebase rules, App Check, restricciones por paquete/SHA), no de ocultar la key.
- **Componentes exportados de SDKs conocidos** (ej. `GenericIdpActivity` de Firebase Auth): comportamiento esperado del SDK para que funcione el flujo de login, no un error de la app.

El criterio para distinguir señal de ruido: ¿es código propio o de un tercero?, ¿el dato/patrón detectado es explotable en el contexto real de uso, o solo coincide con el patrón que busca la regla?

---

## Próximos pasos (Análisis Dinámico)

Una vez confirmados los hallazgos relevantes del análisis estático, la siguiente fase es el análisis dinámico: ejecutar la app en un emulador/dispositivo, interceptar tráfico con Burp Suite, y validar en vivo los hallazgos que lo requieran (por ejemplo, confirmar si un cifrado "sospechoso" realmente viaja hacia un servidor que podría ser vulnerable a padding oracle).

Herramientas pendientes de instalar para esa fase: Android Studio (emulador + adb), Burp Suite, Frida + Objection (para bypass de SSL pinning / detección de root, si aplica).