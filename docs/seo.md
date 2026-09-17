# SEO de Ciudad Cars

Dominio de producción confirmado: **https://ciudadcars.com**. La versión actual sigue siendo local; esta configuración no publica el sitio ni modifica DNS.

## Implementación

- Títulos y descripciones propios de cada página, emitidos en el `<head>` inicial. Se usan metadatos estáticos por ruta para evitar que el streaming los coloque en el cuerpo del documento.
- Canonical autorreferente, Open Graph y Twitter Cards con imagen existente de 1280 × 720. Un único dominio canónico; `www.ciudadcars.com` redirige al dominio sin `www`.
- Diez URLs estables: cinco páginas en español y sus equivalentes en inglés. La URL determina el idioma, independientemente de cookies o agente de usuario. `hreflang` es/en y x-default son recíprocos.
- El selector conserva el formulario y el recorrido al cambiar de idioma. Es un enlace real que también funciona sin JavaScript, y los enlaces internos mantienen el idioma.
- `/robots.txt` permite el rastreo y declara `/sitemap.xml`. El sitemap contiene las diez páginas, sin inventar fechas de modificación.
- JSON-LD con AutoRental, WebSite, WebPage/ContactPage/AboutPage/CollectionPage y BreadcrumbList en páginas interiores. Dirección, teléfono y horarios coinciden con el contenido visible. No se inventan reseñas, coordenadas, disponibilidad ni calificaciones.
- Redirecciones permanentes para `/about-us/`, `/contact-us/`, `/service/` y `/date-reservation/`; los destinos inexistentes devuelven 404.

| Español | Inglés |
|---|---|
| `/` | `/en` |
| `/vehiculos` | `/en/vehicles` |
| `/servicios` | `/en/services` |
| `/quienes-somos` | `/en/about-us` |
| `/contacto` | `/en/contact` |

## Repetir las comprobaciones

```sh
npm run build:local
npm start -- --hostname 127.0.0.1 --port 3002
```

En otra terminal:

```sh
npm run seo:check
npm run seo:audit
```

Ambos comandos aceptan una URL base como argumento. `seo:check` comprueba el HTML servido, idiomas, metadatos, enlaces, JSON-LD, redirecciones, sitemap, robots y 404. `seo:audit` ejecuta la categoría SEO de Lighthouse en las diez páginas con perfiles móvil y escritorio. Usa Chrome en modo headless, con perfiles temporales separados del navegador del usuario. Si Chrome no se detecta, configurar `CHROME_PATH` con su ejecutable.

Los informes completos se guardan en `outputs/seo/`, junto a `summary.json` y una tabla `README.md`. El comando falla si alguna medición no alcanza 100. En Windows, Lighthouse puede producir un error EPERM al limpiar el perfil de Chrome después de completar la auditoría; se acepta únicamente ese error de limpieza cuando existe un informe nuevo, completo y sin errores de ejecución.

## Resultado y publicación

La medición inicial del catálogo obtuvo 91/100 en SEO con Lighthouse 13.4.1: la descripción se emitía fuera del `<head>`. La auditoría final del **17 de septiembre de 2026** obtuvo **100/100 en las 20 mediciones**: las diez URLs de la tabla anterior, cada una en móvil y escritorio, sobre la compilación de producción local en `http://127.0.0.1:3002`. Ninguna medición presentó controles automáticos fallidos. Los informes completos están en `outputs/seo/`, y `outputs/seo/summary.json` registra fecha, versión, URL y dispositivo de cada medición.

Un 100 en la categoría SEO cubre los controles automáticos de Lighthouse. No mide posiciones en Google, no incluye la revisión manual de datos estructurados y no equivale a 100 en rendimiento, accesibilidad o buenas prácticas.

Al publicar, conservar HTTPS y el dominio canónico, volver a ejecutar estas comprobaciones contra el dominio público, verificar la propiedad en Google Search Console y enviar `https://ciudadcars.com/sitemap.xml`. La indexación, las métricas de usuarios reales y los resultados de búsqueda se comprueban después de la publicación.

Referencias: [metadescripciones de Lighthouse](https://developer.chrome.com/docs/lighthouse/seo/meta-description/), [sitios multilingües de Google](https://developers.google.com/search/docs/specialty/international/managing-multi-regional-sites), [datos estructurados de negocios locales](https://developers.google.com/search/docs/appearance/structured-data/local-business).
