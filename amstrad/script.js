const content = document.getElementById("content");
const titleBar = document.querySelector(".window-title");
const clock = document.getElementById("clock");
const typedCommand = document.getElementById("typed-command");
const buttons = document.querySelectorAll(".menu-btn");

const sections = {
  news: {
    title: 'Módulo: Noticias',
    command: 'LOAD "NEWS"',
    html: `
      <p>Últimas entradas del sistema informativo retro.</p>
      <ul>
        <li>Puedes conectar aquí noticias, RSS o tus publicaciones.</li>
        <li>Ideal para mostrar titulares en estilo teletexto/CPC.</li>
        <li>También puedes rotar noticias automáticamente.</li>
      </ul>
    `
  },
  projects: {
    title: 'Módulo: Proyectos',
    command: 'CAT "PROJECTS"',
    html: `
      <p>Zona dedicada a tus desarrollos y experimentos.</p>
      <ul>
        <li>Apps retro para GitHub Pages.</li>
        <li>Herramientas periodísticas y educativas.</li>
        <li>Visualizaciones, juegos y paneles personales.</li>
      </ul>
    `
  },
  about: {
    title: 'Módulo: Acerca de',
    command: 'LIST "ABOUT"',
    html: `
      <p>David Guardo / Guardovich.</p>
      <p>Espacio experimental con estética 8-bit, comunicación, tecnología, docencia y cultura digital.</p>
      <p>Esta interfaz busca recrear la sensación de un microordenador clásico más que una simple web retro.</p>
    `
  },
  contact: {
    title: 'Módulo: Contacto',
    command: 'OPEN "CONTACT"',
    html: `
      <p>Puedes usar esta sección para enlazar:</p>
      <ul>
        <li>guardovich.github.io</li>
        <li>davidguardo.com</li>
        <li>GitHub, correo o redes profesionales</li>
      </ul>
      <p>También puedes convertir esta ventana en un formulario.</p>
    `
  }
};

function updateClock() {
  const now = new Date();
  const h = String(now.getHours()).padStart(2, "0");
  const m = String(now.getMinutes()).padStart(2, "0");
  const s = String(now.getSeconds()).padStart(2, "0");
  clock.textContent = `${h}:${m}:${s}`;
}

function beep(freq = 880, duration = 0.05, type = "square", volume = 0.03) {
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.type = type;
    oscillator.frequency.value = freq;
    gainNode.gain.value = volume;

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.start();

    setTimeout(() => {
      oscillator.stop();
      ctx.close();
    }, duration * 1000);
  } catch (error) {
    console.warn("Audio no disponible:", error);
  }
}

function loadSection(key) {
  const section = sections[key];
  if (!section) return;

  titleBar.textContent = section.title;
  content.innerHTML = section.html;
  typedCommand.textContent = section.command;

  beep(740, 0.04);
  setTimeout(() => beep(520, 0.05), 50);
}

buttons.forEach((button) => {
  button.addEventListener("click", () => {
    loadSection(button.dataset.section);
  });

  button.addEventListener("mouseenter", () => {
    beep(1200, 0.02, "square", 0.015);
  });
});

document.addEventListener("keydown", (event) => {
  if (event.key === "1") loadSection("news");
  if (event.key === "2") loadSection("projects");
  if (event.key === "3") loadSection("about");
  if (event.key === "4") loadSection("contact");
});

updateClock();
setInterval(updateClock, 1000);

// Carga inicial
setTimeout(() => {
  typedCommand.textContent = 'RUN "MENU"';
}, 500);
