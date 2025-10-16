/* ========================= SCROLL CONTROLADO ========================= */
const sections = Array.from(document.querySelectorAll(".section"));
let currentIndex = 0;
let isScrolling = false;
const TRANSITION_DURATION = 1000;

function initSections() {
  sections.forEach((sec, i) => {
    sec.style.transition = `opacity ${TRANSITION_DURATION}ms ease, transform ${TRANSITION_DURATION}ms ease`;

    if (i === 0) {
      sec.style.opacity = "1";
      sec.style.transform = "translateY(0)";
      sec.style.visibility = "visible";
      sec.style.pointerEvents = "auto";
    } else {
      sec.style.opacity = "0";
      sec.style.transform = "translateY(100px)";
      sec.style.visibility = "hidden";
      sec.style.pointerEvents = "none";
    }
  });
}
initSections();

function updateNavbar() {
  const navbar = document.querySelector(".navbar");
  if (!navbar) return;

  if (currentIndex > 0) navbar.classList.add("compact");
  else navbar.classList.remove("compact");
}

function showSection(index) {
  if (isScrolling || index < 0 || index >= sections.length || index === currentIndex) return;

  isScrolling = true;
  const prevSec = sections[currentIndex];
  const nextSec = sections[index];

  nextSec.style.visibility = "visible";
  nextSec.style.pointerEvents = "auto";
  nextSec.style.opacity = "1";
  nextSec.style.transform = "translateY(0)";

  prevSec.style.opacity = "0";
  prevSec.style.transform = "translateY(100px)";
  prevSec.style.pointerEvents = "none";

  history.replaceState(null, "", `#${nextSec.id}`);
  currentIndex = index;
  updateNavbar();

  setTimeout(() => {
    prevSec.style.visibility = "hidden";
    isScrolling = false;
  }, TRANSITION_DURATION + 20);
}

/* ===== Navegación ===== */
window.addEventListener(
  "wheel",
  (e) => {
    if (isScrolling) {
      e.preventDefault();
      return;
    }
    e.preventDefault();

    if (e.deltaY > 0) showSection(currentIndex + 1);
    else if (e.deltaY < 0) showSection(currentIndex - 1);
  },
  { passive: false }
);

window.addEventListener("keydown", (e) => {
  if (isScrolling) return;
  if (e.key === "ArrowDown") showSection(currentIndex + 1);
  else if (e.key === "ArrowUp") showSection(currentIndex - 1);
});

document.querySelectorAll(".nav-links a").forEach((link) => {
  link.addEventListener("click", (ev) => {
    ev.preventDefault();
    const href = link.getAttribute("href");
    if (!href || !href.startsWith("#")) return;

    const id = href.slice(1);
    const idx = sections.findIndex((s) => s.id === id);
    if (idx !== -1) showSection(idx);
  });
});

/* ===== Touch (móvil) ===== */
let touchStartY = 0;
window.addEventListener("touchstart", (e) => {
  touchStartY = e.touches[0].clientY;
}, { passive: true });

window.addEventListener("touchend", (e) => {
  const delta = touchStartY - e.changedTouches[0].clientY;
  if (Math.abs(delta) < 40) return;
  if (delta > 0) showSection(currentIndex + 1);
  else showSection(currentIndex - 1);
}, { passive: true });

/* ========================= BACKGROUND (canvas) ========================= */
const canvas = document.getElementById("bg-canvas");
if (canvas) {
  const ctx = canvas.getContext("2d");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  canvas.style.position = "fixed";
  canvas.style.top = "0";
  canvas.style.left = "0";
  canvas.style.zIndex = "0";

  let stars = [];
  let shootingStars = [];

  class Star {
    constructor() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.size = Math.random() * 2.5;
      this.alpha = Math.random();
      this.speed = Math.random() * 0.2;
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${this.alpha})`;
      ctx.fill();
    }
    update() {
      this.alpha += this.speed * (Math.random() > 0.5 ? -1 : 1);
      this.alpha = Math.max(0, Math.min(1, this.alpha));
      this.draw();
    }
  }

  class ShootingStar {
    constructor() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * (canvas.height / 2);
      this.length = Math.random() * 80 + 50;
      this.speed = Math.random() * 4 + 6;
    }
    draw() {
      ctx.beginPath();
      ctx.moveTo(this.x, this.y);
      ctx.lineTo(this.x - this.length, this.y + this.length);
      ctx.strokeStyle = "rgba(255,255,255,0.8)";
      ctx.lineWidth = 2;
      ctx.stroke();
    }
    update() {
      this.x -= this.speed;
      this.y += this.speed;
      this.draw();
    }
  }

  function initStars() {
    stars = [];
    for (let i = 0; i < 350; i++) stars.push(new Star());
  }
  initStars();

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    stars.forEach((s) => s.update());
    shootingStars.forEach((s, i) => {
      s.update();
      if (s.x < -s.length || s.y > canvas.height + s.length) shootingStars.splice(i, 1);
    });
    if (Math.random() < 0.003) shootingStars.push(new ShootingStar());
    requestAnimationFrame(animate);
  }
  animate();

  window.addEventListener("resize", () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    initStars();
  });
}

/* ========================= TEXTO ESCALONADO Y BOTÓN ========================= */
document.addEventListener("DOMContentLoaded", () => {
  const title = document.querySelector(".stair-title");
  const button = document.querySelector(".btn-primary");

  if (title) {
    const text = title.textContent;
    title.innerHTML = "";
    text.split("").forEach((char, i) => {
      if (char === "\n") title.appendChild(document.createElement("br"));
      else {
        const span = document.createElement("span");
        span.innerHTML = char === " " ? "&nbsp;" : char;
        span.style.animationDelay = `${i * 0.05}s`;
        title.appendChild(span);
      }
    });
    if (button) button.style.animationDelay = `${text.length * 0.05 + 0.5}s`;
  }
});

/* ========================= MENU MÓVIL ========================= */
const navToggle = document.querySelector(".nav-toggle");
const navbar = document.querySelector(".navbar");
if (navToggle && navbar) {
  navToggle.addEventListener("click", () => navbar.classList.toggle("open"));
  document.querySelectorAll(".nav-links a").forEach(a => {
    a.addEventListener("click", () => navbar.classList.remove("open"));
  });
  window.addEventListener("click", (e) => {
    if (!navbar.classList.contains("open")) return;
    if (!navbar.contains(e.target)) navbar.classList.remove("open");
  });
}

/* ========================= CARRUSEL CLIENTES ========================= */
const clientesTrack = document.querySelector('.clientes-track');
if (clientesTrack) {
  clientesTrack.innerHTML += clientesTrack.innerHTML;
  let clientesPos = 0;
  const clientesSpeed = 1;
  let clientesWidth = 0;

  const updateClientesWidth = () => {
    clientesWidth = Array.from(clientesTrack.children).reduce((acc, el) => acc + el.offsetWidth + 60, 0);
  };
  updateClientesWidth();
  window.addEventListener('resize', updateClientesWidth);

  let clientesAnim;
  const animateClientes = () => {
    clientesPos -= clientesSpeed;
    if (Math.abs(clientesPos) >= clientesWidth / 2) clientesPos = 0;
    clientesTrack.style.transform = `translateX(${clientesPos}px)`;
    clientesAnim = requestAnimationFrame(animateClientes);
  };
  animateClientes();

  clientesTrack.parentElement.addEventListener('mouseenter', () => cancelAnimationFrame(clientesAnim));
  clientesTrack.parentElement.addEventListener('mouseleave', animateClientes);
}

/* ========================= CARRUSEL SERVICIOS ========================= */
const serviciosTrack = document.querySelector('.section.servicios .track');
if (serviciosTrack) {
  serviciosTrack.innerHTML += serviciosTrack.innerHTML;
  let serviciosPos = 0;
  const serviciosSpeed = 0.8;
  let serviciosWidth = 0;

  const updateServiciosWidth = () => {
    serviciosWidth = Array.from(serviciosTrack.children).reduce((acc, el) => acc + el.offsetWidth + 30, 0);
  };
  updateServiciosWidth();
  window.addEventListener('resize', updateServiciosWidth);

  let serviciosAnim;
  const animateServicios = () => {
    serviciosPos -= serviciosSpeed;
    if (Math.abs(serviciosPos) >= serviciosWidth / 2) serviciosPos = 0;
    serviciosTrack.style.transform = `translateX(${serviciosPos}px)`;
    serviciosAnim = requestAnimationFrame(animateServicios);
  };
  animateServicios();

  serviciosTrack.parentElement.addEventListener('mouseenter', () => cancelAnimationFrame(serviciosAnim));
  serviciosTrack.parentElement.addEventListener('mouseleave', animateServicios);
}



/* ========================= SECCIÓN NUESTRO EQUIPO ========================= */
document.addEventListener("DOMContentLoaded", () => {
  const orbit = document.getElementById("orbit");
  const personas = orbit.querySelectorAll(".persona");
  const infoCard = document.querySelector(".info-card");
  const closeBtn = infoCard.querySelector(".close");
  const infoNombre = document.getElementById("info-nombre");
  const infoRol = document.getElementById("info-rol");

  // === POSICIONAR PERSONAS EN CÍRCULO ===
  function posicionarPersonas() {
    const orbitRect = orbit.getBoundingClientRect();
    const centerX = orbitRect.width / 2;
    const centerY = orbitRect.height / 2;
    const radius = orbitRect.width / 2 - 120; // margen del centro

    personas.forEach((persona, i) => {
      const angle = (i / personas.length) * (2 * Math.PI);
      const x = centerX + Math.cos(angle) * radius - persona.offsetWidth / 2;
      const y = centerY + Math.sin(angle) * radius - persona.offsetHeight / 2;
      persona.style.left = `${x}px`;
      persona.style.top = `${y}px`;
    });
  }

  // Llamar cuando carga y al redimensionar
  posicionarPersonas();
  window.addEventListener("resize", posicionarPersonas);

  // === MOSTRAR INFO CARD AL CLIC ===
  personas.forEach(persona => {
    persona.addEventListener("click", () => {
      const nombre = persona.querySelector(".nombre").textContent;
      const rol = persona.getAttribute("data-role");

      infoNombre.textContent = nombre;
      infoRol.textContent = rol;

      infoCard.classList.add("active");
    });
  });

  // === CERRAR INFO CARD ===
  closeBtn.addEventListener("click", () => {
    infoCard.classList.remove("active");
  });

  // Cerrar al hacer click fuera
  window.addEventListener("click", (e) => {
    if (e.target === infoCard) {
      infoCard.classList.remove("active");
    }
  });
});

/* ========================= FONDO ANIMADO (ONDAS EQUIPO) ========================= */
const equipoCanvas = document.getElementById("waves");
if (equipoCanvas) {
  const ctx = equipoCanvas.getContext("2d");
  let w, h, t = 0, mouseX = 0, mouseY = 0;

  function resize() {
    w = equipoCanvas.width = window.innerWidth;
    h = equipoCanvas.height = window.innerHeight;
  }
  window.addEventListener("resize", resize);
  resize();

  window.addEventListener("mousemove", e => {
    mouseX = e.clientX / w - 0.5;
    mouseY = e.clientY / h - 0.5;
  });

  function draw() {
    ctx.clearRect(0, 0, w, h);
    t += 0.002;

    const gradients = [
      ctx.createLinearGradient(0, 0, w, h),
      ctx.createLinearGradient(w, 0, 0, h)
    ];

    gradients[0].addColorStop(0, "rgba(194,157,133,0.5)");
    gradients[0].addColorStop(1, "rgba(143,108,89,0.35)");
    gradients[1].addColorStop(0, "rgba(173,137,116,0.45)");
    gradients[1].addColorStop(1, "rgba(101,69,54,0.25)");

    [gradients[0], gradients[1]].forEach((grad, i) => {
      ctx.beginPath();
      for (let x = 0; x <= w; x++) {
        const y =
          h / 2 +
          Math.sin(x * 0.004 + t * (2 + i)) * 50 +
          Math.cos(x * 0.002 - t * 3) * 25;
        ctx.lineTo(x, y + (i * 80 - 40));
      }
      ctx.strokeStyle = grad;
      ctx.lineWidth = 160;
      ctx.globalAlpha = 0.8;
      ctx.stroke();
    });

    const lightX = w * (0.5 + mouseX * 0.3);
    const lightY = h * (0.5 + mouseY * 0.3);
    const lightGrad = ctx.createRadialGradient(lightX, lightY, 100, lightX, lightY, 600);
    lightGrad.addColorStop(0, "rgba(255,255,255,0.1)");
    lightGrad.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = lightGrad;
    ctx.fillRect(0, 0, w, h);

    requestAnimationFrame(draw);
  }
  draw();
}




