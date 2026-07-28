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

  function createGear3D(gearPoints, width, bore) {

    if (gearMesh) {

      scene.remove(gearMesh);

      gearMesh.geometry.dispose();

      gearMesh.material.dispose();
    }

    if (!gearPoints || gearPoints.length === 0) {

      console.error("No llegaron puntos del engranaje");

      return;

    }

    const shape = new THREE.Shape();

    shape.moveTo(gearPoints[0].x, gearPoints[0].y);

    for (let i = 1; i < gearPoints.length; i++) {shape.lineTo(gearPoints[i].x,gearPoints[i].y);}

    shape.closePath();

    if (bore > 0) {const hole = new THREE.Path(); hole.absarc(0, 0, bore / 2, 0, Math.PI * 2, true  );

      shape.holes.push(hole);

    }

    const geometry = new THREE.ExtrudeGeometry(

    shape,

      {

          depth: width,

          steps: 1,

          bevelEnabled: false,

          curveSegments: 40

      }

    );

    const material =
    new THREE.MeshStandardMaterial({

        color:0x3a86ff,

        metalness:0.5,

        roughness:0.3,

        side:THREE.DoubleSide

    });

    gearMesh = new THREE.Mesh(

        geometry,

        material

    );

    const box = new THREE.Box3().setFromObject(gearMesh);

    const size = box.getSize(new THREE.Vector3());

    const maxDimension = Math.max(

        size.x,

        size.y,

        size.z

    );

    const scale = 40 / maxDimension;

    gearMesh.scale.set(scale, scale, scale);

    geometry.computeBoundingBox();

    geometry.center();

    geometry.computeVertexNormals();

    scene.add(gearMesh);

    camera.lookAt(0,0,0);

    controls.update();

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

  async function updateAll() {

    const payload = {

        module: parseFloat(moduleInput.value),

        teeth: parseInt(teethInput.value),

        width: parseFloat(widthInput.value),

        bore: parseFloat(boreInput.value)

    };

    try{

        const response =
            await fetch("/api/preview",{

                method:"POST",

                headers:{
                    "Content-Type":"application/json"
                },

                body:JSON.stringify(payload)

            });

        const gear =
            await response.json();

        calcPitch.textContent =
            gear.dimensions.pitchDiameter.toFixed(1) + " mm";

        calcOuter.textContent =
            gear.dimensions.outsideDiameter.toFixed(1) + " mm";

        createGear3D(

            gear.gearPoints,

            payload.width,

            payload.bore

        );

    }

    catch(error){

        console.error(error);

    }

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