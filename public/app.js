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

// Manejo del Token de autenticación
function getAuthToken() {
  return localStorage.getItem('token');
}

function saveAuthToken(token) {
  localStorage.setItem('token', token);
}

function removeAuthToken() {
  localStorage.removeItem('token');
}

// --- FUNCIONES DE SESIÓN Y TOKEN ---
function getToken() { return localStorage.getItem('token'); }
function setToken(token) { localStorage.setItem('token', token); }
function removeToken() { localStorage.removeItem('token'); }
function getUser() { return JSON.parse(localStorage.getItem('user')); }
function setUser(user) { localStorage.setItem('user', JSON.stringify(user)); }

function updateAuthUI() {
  const token = getToken();
  const user = getUser();
  const openBtn = document.getElementById('openAuthBtn');
  const userInfo = document.getElementById('userInfo');
  const logoutBtn = document.getElementById('logoutBtn');

  if (token && user) {
    openBtn.style.display = 'none';
    userInfo.style.display = 'inline';
    userInfo.textContent = `Hola, ${user.name}`;
    logoutBtn.style.display = 'inline';
  } else {
    openBtn.style.display = 'inline';
    userInfo.style.display = 'none';
    logoutBtn.style.display = 'none';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  updateAuthUI();

  // --- CONTROL DEL MODAL & PESTAÑAS ---
  const authModal = document.getElementById('authModal');
  const openAuthBtn = document.getElementById('openAuthBtn');
  const closeAuthModal = document.getElementById('closeAuthModal');
  const tabLoginBtn = document.getElementById('tabLoginBtn');
  const tabRegisterBtn = document.getElementById('tabRegisterBtn');
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');
  const logoutBtn = document.getElementById('logoutBtn');

  openAuthBtn.onclick = () => authModal.style.display = 'flex';
  closeAuthModal.onclick = () => authModal.style.display = 'none';

  tabLoginBtn.onclick = () => {
    tabLoginBtn.classList.add('active');
    tabRegisterBtn.classList.remove('active');
    loginForm.style.display = 'flex';
    registerForm.style.display = 'none';
  };

  tabRegisterBtn.onclick = () => {
    tabRegisterBtn.classList.add('active');
    tabLoginBtn.classList.remove('active');
    registerForm.style.display = 'flex';
    loginForm.style.display = 'none';
  };

  logoutBtn.onclick = () => {
    removeToken();
    localStorage.removeItem('user');
    updateAuthUI();
    alert('Sesión cerrada');
  };

  // --- PETICIÓN DE LOGIN ---
  loginForm.onsubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: document.getElementById('loginEmail').value,
          password: document.getElementById('loginPassword').value
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al iniciar sesión');

      setToken(data.token);
      setUser(data.user);
      updateAuthUI();
      authModal.style.display = 'none';
      alert(`¡Bienvenido de nuevo, ${data.user.name}!`);
    } catch (err) { alert(err.message); }
  };

  // --- PETICIÓN DE REGISTRO ---
  registerForm.onsubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: document.getElementById('regName').value,
          email: document.getElementById('regEmail').value,
          password: document.getElementById('regPassword').value
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al registrarse');

      alert('Registro exitoso. Ahora puedes iniciar sesión.');
      tabLoginBtn.click();
    } catch (err) { alert(err.message); }
  };

  // --- DESCARGA PROTEGIDA CON TOKEN (GEAR FORM) ---
  const form = document.getElementById('gearForm');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const token = getToken();
    if (!token) {
      alert('Debes iniciar sesión para poder descargar el script de Fusion 360.');
      authModal.style.display = 'flex';
      return;
    }

    const payload = {
      module: parseFloat(document.getElementById('module').value),
      teeth: parseInt(document.getElementById('teeth').value),
      width: parseFloat(document.getElementById('width').value),
      bore: parseFloat(document.getElementById('bore').value)
    };

    try {
      const response = await fetch('/api/generate-script', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error('Error al generar el archivo o sesión expirada');

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
});

// CONTROL DE NAVEGACIÓN ENTRE VISTAS
const navHomeBtn = document.getElementById('navHomeBtn');
const navGeneratorBtn = document.getElementById('navGeneratorBtn');
const homeSection = document.getElementById('homeSection');
const generatorSection = document.getElementById('generatorSection');
const startDesigningBtn = document.getElementById('startDesigningBtn');

function showSection(section) {
  if (section === 'home') {
    homeSection.style.display = 'block';
    generatorSection.style.display = 'none';
    navHomeBtn.classList.add('active');
    navGeneratorBtn.classList.remove('active');
  } else {
    homeSection.style.display = 'none';
    generatorSection.style.display = 'block';
    navHomeBtn.classList.remove('active');
    navGeneratorBtn.classList.add('active');

    // Forzar el ajuste del renderizador de Three.js al cambiar de vista si es necesario
    window.dispatchEvent(new Event('resize'));
  }
}

navHomeBtn.onclick = () => showSection('home');
navGeneratorBtn.onclick = () => showSection('generator');
startDesigningBtn.onclick = () => showSection('generator');