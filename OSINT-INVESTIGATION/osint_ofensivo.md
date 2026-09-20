
# OSINT OFENSIVO 

## ¿Qué es el OSINT Ofensivo?



el objetivo ya no es solo buscar información general, sino mapear superficies de ataque, encontrar credenciales expuestas, vulnerabilidades en la infraestructura, relaciones ocultas y vectores de ingeniería social contra un objetivo específico.
El OSINT ofensivo (Open Source Intelligence) es la recopilación, análisis y estructuración metódica de información disponible públicamente con un propósito adversarial. A diferencia del análisis defensivo, su meta central es descubrir brechas, activos expuestos, tecnologías obsoletas y vulnerabilidades humanas que puedan servir como vector de entrada inicial en una auditoría de Red Team o prueba de intrusión.


## 2. ¿Qué se necesita para aplicarlo? 
Mentalidad Adversarial: Aprender a ver los datos triviales (comentarios en código, publicaciones en redes sociales de empleados, metadatos) como puntos de apalancamiento.

Enfoque Dual (Técnico y Humano): Capacidad para investigar tanto la superficie de infraestructura digital como los patrones de comportamiento de las personas dentro de la organización.

Capacidad de Correlación: Unir fragmentos dispersos de información en diferentes plataformas para trazar un perfil de riesgo real antes de tocar los sistemas del objetivo.

## OSINT OFENSIVO TECNICO

# 1. Descubrimiento de Activos Raíz y Espacio IP

¿Qué se hace?: Se buscan las direcciones IP y bloques de red asignados (ASN) a la organización, así como los dominios principales (seed domains). También se realiza un análisis de los registros WHOIS para encontrar dominios registrados bajo el mismo correo electrónico o nombre de la organización (Reverse WHOIS).

¿Qué se puede encontrar?: Direcciones IP públicas, rangos CIDR corporativos, y dominios alternativos (ej. empresa.net, empresa-latam.com) que amplían drásticamente la superficie de ataque.

# 2. Enumeración de Subdominios (El núcleo del OSINT Web) :

Esta es la fase más crítica. El objetivo es encontrar todos los subdominios vinculados a los dominios raíz. Los entornos de desarrollo y pruebas suelen estar menos protegidos que el entorno de producción.

¿Qué se hace?:

    Enumeración Pasiva: Consultar bases de datos públicas, motores de búsqueda y repositorios de DNS histórico sin tocar los servidores del objetivo.

    Transparencia de Certificados (CT): Cada vez que se emite un certificado SSL/TLS, se registra en un log público. Se buscan esos logs para encontrar subdominios recién creados.

    Permutaciones: Generar alteraciones de subdominios conocidos (si existe dev.empresa.com, se intenta dev1.empresa.com, dev-api.empresa.com).

¿Qué se puede encontrar?: Subdominios de desarrollo (dev., staging.), paneles de administración (admin., cpanel.), portales de empleados (vpn., mail.), o servicios huérfanos apuntando a la nube (Subdomain Takeover).


# 3. Resolución y Filtro de Activos Vivos

Una vez que tienes una lista de miles de subdominios, la mayoría no resolverán o estarán caídos. Hay que filtrar el "ruido".

    ¿Qué se hace?: Se envían peticiones web masivas (HTTP/HTTPS) a todos los subdominios descubiertos para ver cuáles responden (devuelven un código de estado 200, 401, 403, etc.).

    ¿Qué se puede encontrar?: Se reduce una lista de 10,000 posibles subdominios a los 300 que realmente tienen servidores web activos, obteniendo sus títulos de página y códigos de respuesta.

# 4. Búsqueda Histórica y Descubrimiento de Endpoints

Las páginas web cambian, pero los rastros quedan en Internet. Analizar el código histórico puede revelar secretos.

    ¿Qué se hace?: Se consultan archivos históricos de Internet para descargar todas las URLs que alguna vez existieron bajo ese dominio. Además, se analizan los archivos JavaScript (JS) expuestos en la web actual para extraer rutas ocultas o endpoints de APIs.

    ¿Qué se puede encontrar?: Parámetros ocultos (ej. ?admin=true), tokens de API antiguos o endpoints de versiones previas de la API (/api/v1/users) que no requieren autenticación porque los desarrolladores los olvidaron.

    Herramientas:

        Wayback Machine (Archive.org) / waybackurls: Extrae todas las rutas históricas indexadas de un dominio.

        gau (GetAllUrls): Obtiene URLs conocidas de AlienVault, Wayback Machine y Common Crawl.

        LinkFinder: Analiza archivos JavaScript para extraer endpoints y parámetros.

# 5. Fingerprinting y Análisis de Superficie en Motores IoT

Antes de interactuar directamente, se averigua qué tecnología ejecuta cada servidor utilizando bases de datos OSINT.

    ¿Qué se hace?: Se buscan las IPs de la empresa en motores que escanean Internet 24/7. Se busca la huella digital (cabeceras HTTP, hashes de favicons) para identificar versiones exactas de software.

    ¿Qué se puede encontrar?: Bases de datos expuestas sin contraseña (Elasticsearch, MongoDB), interfaces de routers, servidores IIS o Apache desactualizados con vulnerabilidades conocidas (CVEs), y paneles de control críticos expuestos a Internet.

#6. Fugas en Repositorios y Nube (Cloud OSINT)

La infraestructura moderna se apoya en la nube y repositorios de código colaborativos. Aquí ocurren las brechas más críticas.
¿Qué se hace?: Búsqueda avanzada (Dorking) en GitHub, GitLab o Pastebin buscando el nombre de la empresa junto con palabras clave como password, API_KEY, secret, db_host. También se adivinan nombres de buckets de almacenamiento en la nube (AWS S3, Azure Blobs).