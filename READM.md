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