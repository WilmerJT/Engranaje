document.addEventListener('DOMContentLoaded', () => {
  // -------------------------------------------------------------
  // 1. CONFIGURACIÓN INICIAL DE THREE.JS (Escena, Cámara, Luces)
  // -------------------------------------------------------------
  const container = document.getElementById('canvas-container');

  // Escena
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xf8f9fa); // Blanco / Gris muy claro

  // Cámara
  const camera = new THREE.PerspectiveCamera(
    45,
    container.clientWidth / container.clientHeight,
    0.1,
    1000
  );
  camera.position.set(60, 60, 80); // Posición diagonal (perspectiva 3D)

  // Renderizador
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  container.appendChild(renderer.domElement);

  // Controles de Ratón (Girar, Zoom, Pan)
  const controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true; // Rotación suave

  // Luces
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambientLight);

  const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
  dirLight.position.set(50, 100, 50);
  scene.add(dirLight);

  // Opcional: Ejes X (rojo), Y (verde), Z (azul)
  const axesHelper = new THREE.AxesHelper(30);
  scene.add(axesHelper);
  // -------------------------
  // ------------------------------------
  // 2. CREACIÓN DEL OBJETO ENGRANAJE (Cilindro Paramétrico)
  // -------------------------------------------------------------
  let gearMesh = null;

  function createGear3D(outerRadius, boreRadius, width) {
    // Si ya existe un objeto en la escena, lo borramos antes de crear el nuevo
    if (gearMesh) scene.remove(gearMesh);

    // Creamos la forma 2D (Círculo exterior con agujero para el eje)
    const shape = new THREE.Shape();
    shape.absarc(0, 0, outerRadius, 0, Math.PI * 2, false);

    if (boreRadius > 0) {
      const holePath = new THREE.Path();
      holePath.absarc(0, 0, boreRadius, 0, Math.PI * 2, true);
      shape.holes.push(holePath);
    }

    // Extrusión 3D (Ancho del engranaje)
    const extrudeSettings = {
      depth: width,
      bevelEnabled: true,
      bevelSegments: 2,
      steps: 1,
      bevelSize: 0.5,
      bevelThickness: 0.5
    };

    const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);

    // Material metálico tipo Fusion 360
    const material = new THREE.MeshStandardMaterial({
      color: 0x3a86ff, // Azul metálico
      metalness: 0.5,
      roughness: 0.3
    });

    gearMesh = new THREE.Mesh(geometry, material);

    // Centrar la extrusión en el origen
    geometry.center();
    scene.add(gearMesh);
  }

  // -------------------------------------------------------------
  // 3. BUCLE DE ANIMACIÓN (Renderizar continuamente)
  // -------------------------------------------------------------
  function animate() {
    requestAnimationFrame(animate);
    controls.update(); // Actualizar interacción del ratón

    // Opcional: hacer que gire lentamente solo para demostración
    if (gearMesh) gearMesh.rotation.z += 0.005;

    renderer.render(scene, camera);
  }
  animate();

  // Reajustar vista si la ventana cambia de tamaño
  window.addEventListener('resize', () => {
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
  });

  // -------------------------------------------------------------
  // 4. LÓGICA DE FORMULARIO Y ACTUALIZACIÓN EN TIEMPO REAL
  // -------------------------------------------------------------
  const form = document.getElementById('gearForm');
  const moduleInput = document.getElementById('module');
  const teethInput = document.getElementById('teeth');
  const widthInput = document.getElementById('width');
  const boreInput = document.getElementById('bore');

  const calcPitch = document.getElementById('calcPitch');
  const calcOuter = document.getElementById('calcOuter');

  function updateAll() {
    const m = parseFloat(moduleInput.value) || 1;
    const z = parseInt(teethInput.value) || 10;
    const width = parseFloat(widthInput.value) || 10;
    const bore = parseFloat(boreInput.value) || 0;

    const pitchDiameter = m * z;
    const outerDiameter = m * (z + 2);

    calcPitch.textContent = `${pitchDiameter.toFixed(1)} mm`;
    calcOuter.textContent = `${outerDiameter.toFixed(1)} mm`;

    // Re-dibujar el engranaje 3D dinámicamente según los inputs
    const outerRadius = outerDiameter / 2;
    const boreRadius = bore / 2;
    createGear3D(outerRadius, boreRadius, width);

  }

  // Eventos de entrada
  moduleInput.addEventListener('input', updateAll);
  teethInput.addEventListener('input', updateAll);
  widthInput.addEventListener('input', updateAll);
  boreInput.addEventListener('input', updateAll);

  // Envío del Formulario (Descargar .py)
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const payload = {
      module: parseFloat(moduleInput.value),
      teeth: parseInt(teethInput.value),
      width: parseFloat(widthInput.value),
      bore: parseFloat(boreInput.value)
    };

    try {
      const response = await fetch('/api/generate-script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error('Error al generar el archivo');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `engranaje_m${payload.module}_z${payload.teeth}.py`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert('Error: ' + err.message);
    }
  });

  // Render inicial
  updateAll();
});