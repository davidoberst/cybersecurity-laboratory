
## Análisis Dinámico con MobSF (Docker) — EN PROGRESO / INCOMPLETO

> **Estado:** documentado hasta el punto donde todo funcionó correctamente.
> Lo que sigue (conexión del contenedor Docker al emulador) está bloqueado
> y pendiente de retomar con otro enfoque.

### Requisito: emulador con API ≤ 28

El Dynamic Analyzer de MobSF requiere root e instrumentación, lo cual solo
funciona confiablemente en imágenes de emulador con **Android 9 (API 28)**
o inferior. Perfiles de dispositivo modernos (Pixel 6, Pixel 4) no ofrecen
esa versión de system image — hubo que usar el perfil genérico
**"Small Phone"**, que sí soporta API 24+.

Pasos en Android Studio:
1. Device Manager → crear nuevo dispositivo virtual.
2. Elegir perfil **"Small Phone"** (no un Pixel específico).
3. Seleccionar system image **API 28 "Pie" (Android 9.0)**.
4. Finalizar e iniciar el emulador.

Verificación de que el emulador quedó corriendo correctamente:

```bash
adb devices
# List of devices attached
# emulator-5554    device
```