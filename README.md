# Say-it-correctly.org — distribución estática

Once páginas, cinco idiomas y frontend existente, sin compilación, frameworks ni backend añadido. `index.html` abre Inicio conservando idioma y fragmento. La actividad está en `practice/parts-of-body/index.html`; se accede desde Juegos y práctica. No existe carpeta pública `body/`.

## Instalación y comprobación

Descomprimir el ZIP y servir esta carpeta como raíz con un servidor HTTP estático existente, por ejemplo Live Server. Abrir `/index.html`; conservar las carpetas hermanas y sus nombres. No es necesario instalar dependencias para ejecutar el sitio. Se admite alojamiento bajo subcarpeta; verificar todas las URLs después de configurar la ruta base del alojamiento.

Los idiomas de interfaz son `en`, `zh-CN`, `fr`, `pt`, `es`; se mantiene el código existente de chino simplificado. Las traducciones están incluidas en JS para funcionar sin descargar archivos de idioma por separado. El JSON de edición, las 75 pruebas y sus fixtures están en el paquete **privado** `Say-it-correctly-Control`, fuera de esta raíz pública.

Funciones actuales: navegación, vocabulario, práctica, seis preguntas del test, Parts of the Body, voz del navegador y efecto local de error. El formulario no guarda ni envía mensajes; compras, pagos y cuentas no están habilitados. El test no certifica un nivel oficial. Los videos y juegos/capítulos históricos dependen de sus servicios de origen. No introducir claves o credenciales en estos archivos.

## A. Hosting estático independiente

1. Elegir un host que sirva HTML/CSS/JS, imágenes y MP3 mediante HTTPS, sin reescribir todas las rutas a una SPA. Publicar **solo el contenido de esta carpeta**, nunca el paquete privado.
2. Probar primero una URL de ensayo: entrada, once páginas, idiomas, navegación, imágenes, audio, formularios inactivos, 13 capítulos y 11 tarjetas House Items. Revisar reproducción externa y dispositivos reales.
3. Antes del cambio de dominio, exportar y conservar la zona DNS completa del proveedor actual: A/AAAA, CNAME, MX, TXT de SPF/DKIM/DMARC, verificaciones, CAA y TTL. No asumir que registrar dominio, alojar web y gestionar correo son el mismo servicio.
4. Mantener la URL canónica **`https://www.sayitcorrectly.org/`**. Obtener del host los valores DNS exactos; configurar HTTPS para `www` y el dominio raíz, renovación de certificados y redirección HTTPS/raíz→canónica en el alojamiento. No se suministran IP ni valores DNS ficticios.
5. Si el DNS sigue administrado en Wix, puede apuntarse el dominio al host externo mediante los registros proporcionados por ese host. Cambiar nameservers solo con un plan que preserve todos los servicios existentes. [Conectar un dominio Wix a un sitio externo](https://support.wix.com/en/article/can-i-connect-my-wix-domain-to).
6. Preparar redirecciones HTTP permanentes de la antigua actividad `/body/parts-of-body.html` a `/practice/parts-of-body/index.html`, conservando consultas. Verificar también `/body/` y sus recursos si existen enlaces externos históricos; no añadir una carpeta duplicada `body/` para simular redirecciones de servidor.

**Condición previa al cambio de DNS:** los 13 capítulos enlazan a rutas históricas del mismo dominio. Este paquete no contiene esas lecciones. Apuntar el dominio únicamente a estos archivos sin conservar dichas rutas produciría errores. Mantener esas páginas en su origen o disponer de una estrategia de proxy/redirecciones hacia un origen histórico **real y verificado**, acordado con el cliente. La tabla completa de destinos y las decisiones pendientes están en el control privado. No se ha inventado un origen alternativo ni cambiado los enlaces.

El cambio de DNS, las reglas de redirección y la emisión de certificados no se ejecutaron. Validar el host antes de activar una política CSP restrictiva: hay scripts/estilos existentes y reproductores externos que deben seguir funcionando.

## B. Integración con Wix

Wix no admite importar directamente un sitio externo completo como proyecto editable de su editor. Abrir una cuenta o elegir Editor/Studio no convierte este paquete multipágina en componentes Wix. [Limitación oficial de importación](https://support.wix.com/en/article/request-importing-a-site-created-outside-of-wix).

Editor y Studio permiten incrustar una URL HTTPS o HTML en un iframe. Para máxima fidelidad, alojar primero este paquete estático y evaluar el iframe como integración aislada. Su contenedor, sandbox, scroll, foco, permisos, popups y altura pueden afectar responsive, navegación y voz/audio; no equivale a una migración nativa. Studio documenta expresamente estas restricciones. [Iframe en Studio](https://support.wix.com/en/article/studio-editor-adding-an-html-iframe-element), [embeds en Editor](https://support.wix.com/en/article/wix-editor-embedding-a-site-or-a-widget%20).

Velo aporta código y servicios backend dentro de Wix; no sustituye automáticamente el DOM, las rutas ni los scripts de este paquete. El código personalizado insertado en páginas existentes tampoco importa el sitio. Una integración nativa necesitaría un alcance separado y pruebas de fidelidad antes de adaptar nada. [Backend de Velo](https://dev.wix.com/docs/develop-websites/articles/coding-with-velo/backend-code/about-the-site-backend), [servicios externos](https://dev.wix.com/docs/velo/articles/getting-started/integration-with-third-party-services).

## Backend futuro

No hay endpoints, claves, autenticación, base de datos ni llamadas ficticias incorporadas. El punto de contacto actual es `#question-form` en `contact/index.html`; su envío permanece deshabilitado. Los contratos propuestos para contacto, autenticación opcional y persistencia opcional se documentan en `Say-it-correctly-Control/INTEGRACIONES_BACKEND.md`, fuera del paquete público. Solo activar esas funciones después de aprobar e implementar sus servicios reales.

## Publicación pendiente

Antes de publicar: resolver los destinos históricos, comprobar permisos de imágenes/logo y contenido, vigencia de contactos, reproducción de videos/voz y comportamiento en dispositivos físicos. No se efectuaron cambios en GitHub, Wix, DNS o alojamiento.
