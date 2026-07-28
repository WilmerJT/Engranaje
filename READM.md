# Gear Generator Web

Aplicación web desarrollada con **Node.js** y **Express** para generar engranajes cilíndricos rectos (Spur Gears), visualizar una vista previa 2D y generar un script de Python compatible con **Autodesk Fusion 360**.

---

# Objetivo del proyecto

Desarrollar una aplicación web que permita:

- Ingresar los parámetros de un engranaje.
- Calcular su geometría.
- Mostrar una vista previa en el navegador mediante SVG o Canvas.
- Generar un script en Python para crear el engranaje automáticamente en Fusion 360.

En esta primera versión (v1) únicamente se implementarán **engranajes rectos (Spur Gears)**.

---

# Tecnologías utilizadas

- Node.js
- Express
- JavaScript
- HTML5
- CSS3
- SVG / Canvas (Frontend)
- Python (Script para Fusion 360)

---

# Estructura del proyecto

```
gear-generator/
│
├── controllers/
│
├── routes/
│
├── services/
│
├── templates/
│
├── public/
│   ├── css/
│   ├── js/
│   └── index.html
│
├── package.json
├── package-lock.json
├── server.js
└── README.md
```

---

# Descripción de cada carpeta

## controllers/

Contiene los controladores del backend.

Aquí se recibe la información enviada por el frontend, se valida y se llama a los servicios correspondientes.

Ejemplo:

```
POST /api/preview
```

↓

```
gearController.preview()
```

↓

```
gearMath.buildGear()
```

El controlador únicamente coordina la lógica; no realiza cálculos.

---

## routes/

Define todas las rutas de la API.

Actualmente existen dos endpoints principales:

```
POST /api/preview
```

Genera la geometría del engranaje para mostrarla en la página.

```
POST /api/generate-script
```

Genera el archivo Python que podrá abrirse en Fusion 360.

---

## services/

Es el núcleo del proyecto.

Aquí se implementa toda la lógica matemática y la generación del script.

Contendrá principalmente dos archivos:

### gearMath.js

Responsable de:

- Calcular el diámetro primitivo.
- Calcular el diámetro exterior.
- Calcular el diámetro base.
- Calcular el diámetro de raíz.
- Generar la involuta.
- Construir un diente.
- Construir el engranaje completo.

Toda la geometría se implementará siguiendo las ecuaciones del libro utilizado como referencia para el proyecto.

---

### fusionGenerator.js

Se encargará de:

- Leer la plantilla del script de Fusion 360.
- Reemplazar los parámetros del engranaje.
- Generar el archivo Python listo para descargar.

---

## templates/

Contendrá la plantilla base del script de Fusion 360.

Ejemplo:

```python
MODULE={{MODULE}}

TEETH={{TEETH}}

PRESSURE={{PRESSURE}}

WIDTH={{WIDTH}}

BORE={{BORE}}
```

El backend reemplazará automáticamente esos valores.

---

## public/

Contiene todos los archivos visibles para el usuario.

Aquí irá el frontend.

### index.html

Página principal de la aplicación.

---

### css/

Hojas de estilo.

---

### js/

Código JavaScript del navegador.

Aquí se realizarán las peticiones al backend y se dibujará el engranaje utilizando SVG o Canvas.

---

# Estado actual del proyecto

## ✔ Finalizado

- Inicialización del proyecto con Node.js.
- Configuración de Express.
- Configuración de Nodemon.
- Organización de carpetas.
- Servidor funcionando correctamente.
- Creación de la API base.

---

# Endpoints disponibles

## POST

```
/api/preview
```

Actualmente devuelve una respuesta de prueba.

En futuras versiones devolverá la geometría del engranaje.

---

## POST

```
/api/generate-script
```

Actualmente devuelve una respuesta de prueba.

Posteriormente permitirá descargar el script para Fusion 360.

---

# Flujo del proyecto

```
Frontend
      │
      ▼
Formulario
      │
      ▼
POST /api/preview
      │
      ▼
gearController
      │
      ▼
gearMath
      │
      ▼
Geometría del engranaje
      │
      ▼
Respuesta JSON
      │
      ▼
Vista previa SVG
```

Cuando el usuario quiera exportar:

```
Frontend
      │
      ▼
POST /api/generate-script
      │
      ▼
gearController
      │
      ▼
fusionGenerator
      │
      ▼
fusionTemplate.py
      │
      ▼
Descarga gear.py
```

---

# Distribución del trabajo

## Backend

Responsable:

- Configuración del proyecto.
- API.
- Cálculos matemáticos.
- Generación del script de Fusion 360.

---

## Frontend

Responsable:

- Diseño de la interfaz.
- Formulario de parámetros.
- Vista previa SVG/Canvas.
- Integración con la API.

---

# Próximas tareas

## Backend

- Implementar los cálculos geométricos del engranaje.
- Generar el perfil de involuta.
- Construir la geometría completa.
- Integrar la plantilla de Fusion 360.

---

## Frontend

- Diseñar la interfaz.
- Crear el formulario de entrada.
- Dibujar el engranaje.
- Conectar los botones con la API.

---

# Ejecución del proyecto

Instalar dependencias

```bash
npm install
```

Ejecutar en desarrollo

```bash
npm run dev
```

Ejecutar en producción

```bash
npm start
```

Abrir en el navegador

```
http://localhost:3000
```

------------------------------ bebe -----------------------


## 🚀 Actualizaciones Recientes (Backend & Exportación CAD)

### 🛠️ Implementación del Generador de Scripts para Fusion 360

Se integró la arquitectura necesaria en Node.js para transformar las dimensiones paramétricas del engranaje en código ejecutable nativo de **Autodesk Fusion 360** en Python.

#### Módulos y Cambios Desarrollados:

1. **Plantilla Base en Python (`templates/fusionTemplate.py`):**
   - Creación del script ejecutable compatible con la API de Autodesk Fusion 360 (`adsk.core` y `adsk.fusion`).
   - Marcado de variables dinámicas (`{{MODULE}}`, `{{TEETH}}`, `{{FACE_WIDTH}}`, `{{BORE_DIAMETER}}`, `{{OUTER_DIAMETER}}`).
   - Implementación de conversión implícita de unidades (conversión de milímetros de taller a centímetros requeridos por la API interna de Fusion 360).
   - Generación automática del boceto 2D en el plano XY y operación de extrusión 3D de la pieza.

2. **Servicio de Compilación (`services/fusionGenerator.js`):**
   - Lectura asíncrona y procesamiento del archivo de plantilla en el servidor.
   - Algoritmo de inyección y reemplazo de parámetros calculados.
   - Generación en memoria del archivo Python final formateado.

3. **Integración en Controlador y API (`controllers/gearController.js`):**
   - Actualización del endpoint `POST /api/generate-script`.
   - Configuración de cabeceras HTTP (`Content-Type: text/x-python` y `Content-Disposition`) para forzar la descarga automática del archivo `.py` (`gear_generator.py`) desde la web.

   # ⚙️ Generador Paramétrico de Engranajes 3D (Node.js + Fusion 360)

Aplicación web basada en **Node.js** y **Express** para la configuración de engranajes rectos. El sistema calcula dimensiones geométricas paramétricas y genera scripts dinámicos en Python para importar el modelo 3D directamente en **Autodesk Fusion 360**.

---

## 🚀 Estado Actual del Proyecto

Actualmente el proyecto cuenta con un backend completamente funcional e integrado con el entorno de modelado 3D de Fusion 360.

### ✅ Funcionalidades Desarrolladas & Probadass:
- **API Backend (Express):** Endpoint `POST /api/generate-script` para procesar parámetros dinámicos y generar scripts Python en tiempo real.
- **Interfaz Web Interactiva (HTML/CSS/JS):** Formulario intuitivo con actualización de cálculos geométricos en tiempo real (Diámetro Primitivo y Diámetro Exterior).
- **Visor 3D Dinámico (Three.js):** Integración de entorno gráfico 3D interactivo que renderiza la vista previa del engranaje con rotación, zoom y adaptación proporcional a los inputs del usuario.
- **Inyección de Código para Fusion 360:** Generador automatizado de scripts `.py` para crear la geometría 3D directamente desde el menú *Scripts and Add-Ins* de Autodesk Fusion 360.
- **Validación Local:** Descarga directa desde el navegador del archivo `.py` listo para importar en el software CAD.

## 📐 Parámetros Manejados

| Parámetro | Variable | Descripción |
| :--- | :--- | :--- |
| **Módulo** | `module` | Define el tamaño de los dientes y escala general. |
| **Dientes** | `teeth` | Número de dientes del engranaje ($Z$). |
| **Ancho de Cara** | `width` | Espesor / Profundidad de la extrusión 3D (mm). |
| **Diámetro del Eje** | `bore` | Diámetro del barreno central (mm). |
| **Chavetero** | `keyway` | Dimensionado automático de la muesca de sujeción. |

---

## 🛠️ Pruebas de Funcionamiento Local

Para probar la generación del script `.py` desde la terminal sin interfaz visual:

```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/generate-script" `
  -Method Post `
  -ContentType "application/json" `
  -Body '{"module":2,"teeth":20,"width":12,"bore":10}' `
  -OutFile "gear_test.py"

  ----------------------------- señor del perfil  ----------------------

  ---

# 🔄 Refactorización de la Arquitectura del Proyecto

Con el avance del desarrollo se realizó una reorganización del backend para separar responsabilidades entre los diferentes módulos del sistema. El objetivo fue evitar duplicación de código, facilitar el mantenimiento y preparar la aplicación para la integración del frontend y la generación de modelos 3D en Fusion 360.

## ✅ Reorganización del motor matemático (`services/gearMath.js`)

El archivo `gearMath.js` quedó dedicado exclusivamente a la geometría y cálculos matemáticos del engranaje.

### Funcionalidades implementadas

- Cálculo de dimensiones principales del engranaje:
  - Diámetro primitivo.
  - Radio primitivo.
  - Diámetro exterior.
  - Radio exterior.
  - Diámetro de raíz.
  - Radio de raíz.
  - Diámetro base.
  - Radio base.
  - Paso circular.
  - Espesor del diente.
  - Addendum.
  - Dedendum.
  - Altura total.

- Implementación de la ecuación paramétrica de la involuta.
- Generación de la curva evolvente mediante discretización.
- Rotación de puntos y curvas.
- Construcción preliminar del perfil del diente.
- Construcción preliminar del engranaje completo mediante repetición circular.
- Cálculo de los ángulos característicos del engranaje.
- Posicionamiento de la involuta respecto al eje del diente.
- Implementación de funciones auxiliares para futuras operaciones geométricas.

---

## 🏗 Separación de la geometría mecánica (`services/geometry3D.js`)

Se creó un nuevo módulo independiente encargado únicamente de los elementos mecánicos adicionales utilizados durante la generación del modelo 3D.

Actualmente implementa:

- Cálculo del diámetro de la maza (Hub).
- Cálculo del ancho del chavetero.
- Cálculo de la profundidad del chavetero.

Esta separación permite mantener el motor matemático completamente independiente de la geometría utilizada por Fusion 360.

---

## 🔄 Reestructuración del controlador (`controllers/gearController.js`)

Se reorganizó completamente el flujo de generación del script.

El nuevo proceso es:

```text
Solicitud HTTP
        │
        ▼
Lectura de parámetros enviados por el usuario
        │
        ▼
Cálculo de dimensiones geométricas
        │
        ▼
Construcción del engranaje
        │
        ▼
Cálculo de maza y chavetero
        │
        ▼
Integración de toda la información
        │
        ▼
Generación dinámica del script Python
        │
        ▼
Descarga automática del archivo .py
```

El controlador ahora funciona únicamente como orquestador entre los distintos servicios.

---

## ⚙️ Mejoras en el generador para Fusion 360 (`services/fusionGenerator.js`)

Se actualizó el generador para trabajar con la nueva arquitectura modular.

Las principales mejoras fueron:

- Separación entre cálculos matemáticos y generación del script.
- Lectura de parámetros directamente desde el objeto `dimensions`.
- Integración de la información de maza y chavetero calculada por `geometry3D.js`.
- Generación dinámica del archivo Python utilizando una plantilla base.

---

## 🧹 Eliminación de código duplicado

Durante la refactorización se eliminaron varios problemas presentes en versiones anteriores:

- Eliminación de múltiples definiciones de `buildGear()`.
- Eliminación de múltiples `module.exports`.
- Eliminación de funciones duplicadas de rotación.
- Separación de responsabilidades entre módulos.
- Centralización de todos los cálculos geométricos en `gearMath.js`.

---

## 📁 Nueva organización de servicios

```text
services/
│
├── gearMath.js
│      Motor matemático del engranaje
│
├── geometry3D.js
│      Cálculos de maza y chavetero
│
└── fusionGenerator.js
       Generación del script Python para Fusion 360
```

---

## ✅ Beneficios obtenidos

Con esta reorganización se consiguió:

- Código más modular.
- Eliminación de duplicación de cálculos.
- Mayor facilidad para realizar mantenimiento.
- Mejor integración entre backend y Fusion 360.
- Base preparada para incorporar la vista previa 2D mediante SVG o Canvas.
- Arquitectura escalable para futuras versiones con engranajes helicoidales, cónicos u otros perfiles.

---

## 📌 Estado actual del desarrollo

| Módulo | Estado |
|---------|:------:|
| Setup del proyecto | ✅ Completado |
| Motor matemático del engranaje | ✅ Avanzado |
| Geometría 3D (Maza y Chavetero) | ✅ Completado |
| Backend/API | ✅ Integrado |
| Generador Fusion 360 | ✅ Integrado |
| Vista previa SVG/Canvas | 🚧 Pendiente |
| Perfil de involuta completo (arcos de cabeza y raíz) | 🚧 En desarrollo |


# 🚀 Actualización – Integración del Motor Matemático con la Vista Previa 3D

En esta actualización se integró el motor matemático de generación de engranajes con el visor 3D desarrollado en Three.js. La vista previa dejó de utilizar un cilindro extruido como representación simplificada y ahora genera el perfil del engranaje a partir de la geometría calculada por el backend.

---

## ⚙️ Mejoras Implementadas

### Integración del motor matemático

Se modificó el flujo entre el backend y el frontend para que el visor utilice directamente los puntos generados por el motor matemático (`gearMath.js`).

Nuevo flujo de trabajo:

Formulario Web
↓
API `/api/preview`
↓
`gearMath.js`
↓
Cálculo completo de la geometría
↓
Lista de puntos del perfil (`gearPoints`)
↓
Three.js
↓
Vista previa 3D

---

## 📐 Construcción del perfil del engranaje

Se implementó la generación completa del contorno del engranaje mediante elementos geométricos independientes:

- Involuta izquierda.
- Involuta derecha.
- Arco de cabeza del diente.
- Arco de raíz entre dientes.
- Perfil completo del diente.
- Contorno completo del engranaje.

Funciones incorporadas o modificadas:

- `generateInvolute()`
- `positionInvolute()`
- `buildOppositeInvolute()`
- `generateTipArc()`
- `generateRootArc()`
- `buildTooth()`
- `buildGearOutline()`

---

## 📊 Incremento en la resolución geométrica

Con el objetivo de obtener un perfil más suave y reducir la apariencia poligonal del modelo, se aumentó el número de puntos utilizados en la construcción de las curvas.

| Elemento | Antes | Ahora |
|----------|------:|------:|
| Involuta | 80 puntos | 120 puntos |
| Arco de cabeza | 12 puntos | 30 puntos |
| Arco de raíz | 12 puntos | 30 puntos |

Estas modificaciones permiten generar un perfil considerablemente más suave tanto en el visor 3D como en la exportación del modelo.

---

## 🖥️ Integración con Three.js

El visor fue actualizado para dejar de generar un cilindro extruido y comenzar a utilizar el perfil real calculado por el backend.

Principales cambios:

- Construcción dinámica de un `THREE.Shape` a partir del contorno calculado.
- Extrusión automática del perfil mediante `THREE.ExtrudeGeometry`.
- Generación del agujero central utilizando `THREE.Path`.
- Actualización automática del modelo al modificar cualquier parámetro del formulario.
- Conservación de controles interactivos mediante `OrbitControls`.

---

## 🔄 Comunicación Backend–Frontend

Se modificó el endpoint de vista previa para enviar la geometría completa al navegador.

El endpoint:

ahora devuelve:

- Dimensiones calculadas.
- Lista completa de puntos del contorno.
- Información necesaria para renderizar el engranaje en Three.js.

---

## 🧪 Proceso de validación

Durante esta actualización se realizaron pruebas para verificar:

- Simetría entre involuta izquierda y derecha.
- Correcta generación de los arcos de cabeza.
- Continuidad del arco de raíz.
- Cierre completo del perfil.
- Correcta creación del agujero del eje.
- Extrusión sin autointersecciones.
- Visualización correcta en Three.js.

También se creó el archivo de pruebas `testGear.js`, utilizado para inspeccionar los puntos generados por el motor matemático y validar la geometría antes de renderizarla.

---

## ✅ Resultado

La aplicación ahora es capaz de:

- Calcular la geometría completa de un engranaje recto de involuta.
- Construir el perfil completo mediante cálculos paramétricos.
- Generar una vista previa 3D basada en la geometría real.
- Actualizar dinámicamente el modelo al modificar los parámetros del formulario.
- Mantener compatibilidad con la generación del script para Autodesk Fusion 360.

Esta actualización representa la transición desde una visualización simplificada hacia un visor basado en la geometría matemática real del engranaje, proporcionando una representación mucho más cercana al modelo CAD final.