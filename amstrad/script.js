const input = document.getElementById("commandInput");
const output = document.getElementById("output");

function print(text) {
  const p = document.createElement("p");
  p.textContent = text;
  output.appendChild(p);
  output.scrollTop = output.scrollHeight;
}

function beep(freq = 600, duration = 50) {
  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.frequency.value = freq;
  osc.type = "square";

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start();

  setTimeout(() => {
    osc.stop();
    ctx.close();
  }, duration);
}

function fakeLoad(callback) {
  print("Loading...");
  let dots = 0;

  const interval = setInterval(() => {
    dots++;
    print(".");

    if (dots >= 5) {
      clearInterval(interval);
      callback();
    }
  }, 200);
}

function runCommand(cmd) {
  const command = cmd.toUpperCase();

  print("> " + cmd);

  if (command === "HELP") {
    print("Commands:");
    print("RUN MENU");
    print("LOAD NEWS");
    print("ABOUT");
    print("CLEAR");
  }

  else if (command === "RUN MENU") {
    print("1. NEWS");
    print("2. PROJECTS");
    print("3. ABOUT");
  }

  else if (command === "LOAD NEWS") {
    fakeLoad(() => {
      print("Noticias cargadas...");
      print("- Proyecto Teletexto Santander");
      print("- Apps retro en GitHub");
    });
  }

  else if (command === "ABOUT") {
    print("David Guardo / Guardovich");
    print("Profesor, comunicación y tecnología");
    print("Experimentos retro + IA + periodismo");
  }

  else if (command === "CLEAR") {
    output.innerHTML = "";
  }

  else {
    print("Syntax Error");
    beep(200, 100);
  }
}

input.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    runCommand(input.value);
    input.value = "";
  }
});
