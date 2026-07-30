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