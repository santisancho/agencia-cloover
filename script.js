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

function showSection(index) {
  if (isScrolling || index < 0 || index >= sections.length || index === currentIndex) return;

  isScrolling = true;
  const prevSec = sections[currentIndex];
  const nextSec = sections[index];

  // Mostrar la nueva sección
  nextSec.style.visibility = "visible";
  nextSec.style.pointerEvents = "auto";
  nextSec.style.opacity = "1";
  nextSec.style.transform = "translateY(0)";

  // Ocultar la anterior
  prevSec.style.opacity = "0";
  prevSec.style.transform = "translateY(100px)";
  prevSec.style.pointerEvents = "none";

  // Actualizar hash y estado
  history.replaceState(null, "", `#${nextSec.id}`);
  currentIndex = index;

  // Esperar transición y ocultar realmente la anterior
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
window.addEventListener(
  "touchstart",
  (e) => {
    touchStartY = e.touches[0].clientY;
  },
  { passive: true }
);

window.addEventListener(
  "touchend",
  (e) => {
    const delta = touchStartY - e.changedTouches[0].clientY;
    if (Math.abs(delta) < 40) return;

    if (delta > 0) showSection(currentIndex + 1);
    else showSection(currentIndex - 1);
  },
  { passive: true }
);

/* ========================= BACKGROUND (canvas) ========================= */
const canvas = document.getElementById("bg-canvas");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// 🔑 fondo
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
    this.size = Math.random() * 2.5; // un poquito más grandes
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
  for (let i = 0; i < 350; i++) { // ⭐ más estrellas
    stars.push(new Star());
  }
}
initStars();

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  stars.forEach((s) => s.update());
  shootingStars.forEach((s, i) => {
    s.update();
    if (s.x < -s.length || s.y > canvas.height + s.length) {
      shootingStars.splice(i, 1);
    }
  });

  if (Math.random() < 0.003) { // un poquito más frecuente
    shootingStars.push(new ShootingStar());
  }

  requestAnimationFrame(animate);
}
animate();

window.addEventListener("resize", () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  initStars();
});

/* ========================= TEXTO ESCALONADO Y BOTÓN ========================= */
document.addEventListener("DOMContentLoaded", () => {
  const title = document.querySelector(".stair-title");
  const button = document.querySelector(".btn-primary");

  if (title) {
    const text = title.textContent;
    title.innerHTML = "";

    text.split("").forEach((char, i) => {
      if (char === "\n") {
        title.appendChild(document.createElement("br"));
      } else {
        const span = document.createElement("span");
        span.innerHTML = char === " " ? "&nbsp;" : char;
        span.style.animationDelay = `${i * 0.05}s`;
        title.appendChild(span);
      }
    });

    if (button) {
      button.style.animationDelay = `${text.length * 0.05 + 0.5}s`;
    }
  }
});







// MENU MOVIL: toggle simple
const navToggle = document.querySelector(".nav-toggle");
const navbar = document.querySelector(".navbar");
if (navToggle && navbar) {
  navToggle.addEventListener("click", () => {
    navbar.classList.toggle("open");
  });

  // Cerrar cuando clickeás un link del menu
  document.querySelectorAll(".nav-links a").forEach(a => {
    a.addEventListener("click", () => {
      navbar.classList.remove("open");
    });
  });

  // cerrar tocando fuera (en mobile)
  window.addEventListener("click", (e) => {
    if (!navbar.classList.contains("open")) return;
    const inside = navbar.contains(e.target);
    if (!inside) navbar.classList.remove("open");
  });
}








function updateNavbar() {
  const navbar = document.querySelector(".navbar");
  if (!navbar) return;

  if (currentIndex > 0) {
    navbar.classList.add("compact"); // 🔽 ya no está en la primera sección
  } else {
    navbar.classList.remove("compact"); // 🔼 en la primera sección
  }
}

// Llamar cada vez que cambie de sección
function showSection(index) {
  if (isScrolling || index < 0 || index >= sections.length || index === currentIndex) return;

  isScrolling = true;
  const prevSec = sections[currentIndex];
  const nextSec = sections[index];

  // Mostrar la nueva sección
  nextSec.style.visibility = "visible";
  nextSec.style.pointerEvents = "auto";
  nextSec.style.opacity = "1";
  nextSec.style.transform = "translateY(0)";

  // Ocultar la anterior
  prevSec.style.opacity = "0";
  prevSec.style.transform = "translateY(100px)";
  prevSec.style.pointerEvents = "none";

  // Actualizar hash y estado
  history.replaceState(null, "", `#${nextSec.id}`);
  currentIndex = index;

  // 👉 actualizar navbar
  updateNavbar();

  // Esperar transición
  setTimeout(() => {
    prevSec.style.visibility = "hidden";
    isScrolling = false;
  }, TRANSITION_DURATION + 20);
}







// ------------------------- CARRUSEL CLIENTES -------------------------
const clientesTrack = document.querySelector('.clientes-track');
clientesTrack.innerHTML += clientesTrack.innerHTML; // duplicar logos

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

// ------------------------- CARRUSEL SERVICIOS -------------------------
const serviciosTrack = document.querySelector('.section.servicios .track');
serviciosTrack.innerHTML += serviciosTrack.innerHTML; // duplicar cards

let serviciosPos = 0;
const serviciosSpeed = 0.8; // más lento que clientes

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









// ==== SECCIÓN EQUIPO ====
const personas = document.querySelectorAll('.persona');
const infoCard = document.querySelector('.info-card');
const nombreEl = document.getElementById('info-nombre');
const rolEl = document.getElementById('info-rol');
const instaEl = document.getElementById('info-instagram');
const closeBtn = document.querySelector('.info-card .close');

personas.forEach(p => {
  p.addEventListener('click', () => {
    nombreEl.textContent = p.querySelector('.nombre').textContent;
    rolEl.textContent = p.dataset.role;
    instaEl.href = p.dataset.instagram;
    infoCard.classList.add('active');
  });
});

closeBtn.addEventListener('click', () => {
  infoCard.classList.remove('active');
});




