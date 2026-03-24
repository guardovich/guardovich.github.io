const input = document.getElementById("commandInput");
const output = document.getElementById("output");

/* PRINT */
function print(text) {
  const p = document.createElement("p");
  p.textContent = text;
  output.appendChild(p);
  output.scrollTop = output.scrollHeight;
}

/* SPLIT TEXTO */
function splitText(text, maxLength = 60) {
  const words = text.split(" ");
  let lines = [];
  let current = "";

  words.forEach(word => {
    if ((current + word).length > maxLength) {
      lines.push(current);
      current = word + " ";
    } else {
      current += word + " ";
    }
  });

  lines.push(current);
  return lines;
}

/* SONIDO */
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

/* WIKIPEDIA */
async function searchWikipedia(query) {
  print("Consultando base de datos...");

  try {
    const url = `https://es.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`;
    const res = await fetch(url);
    const data = await res.json();

    if (data.extract) {
      print("-----");
      print(data.title.toUpperCase());
      print("-----");

      if (data.thumbnail && data.thumbnail.source) {
        const img = document.createElement("img");
        img.src = data.thumbnail.source;
        img.style.width = "120px";
        img.style.margin = "10px 0";
        output.appendChild(img);
      }

      const lines = splitText(data.extract);
      lines.forEach(line => print(line));
    } else {
      print("No encontrado.");
    }

  } catch {
    print("Error de conexión.");
  }
}

/* COMANDOS */
function runCommand(cmd) {
  const command = cmd.trim().toUpperCase();

  print("> " + cmd);

  if (command === "HELP") {
    print("COMANDOS:");
    print("WIKI [tema]");
    print("CLEAR");
    print("ABOUT");
    return;
  }

  if (command === "CLEAR") {
    output.innerHTML = "";
    return;
  }

  if (command === "ABOUT") {
    print("GUARDOVICH CPC SYSTEM");
    print("Proyecto retro + web + IA light");
    return;
  }

  if (command.startsWith("WIKI ")) {
    const query = cmd.slice(5);
    searchWikipedia(query);
    return;
  }

  print("Syntax Error");
  beep(200, 100);
}

/* INPUT */
input.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    runCommand(input.value);
    input.value = "";
  }
});
