const inputText = document.getElementById("inputText");
const outputText = document.getElementById("outputText");
const transformBtn = document.getElementById("transformBtn");
const clearBtn = document.getElementById("clearBtn");
const copyBtn = document.getElementById("copyBtn");
const modeSelect = document.getElementById("mode");
const intensitySelect = document.getElementById("intensity");
const replacementsCount = document.getElementById("replacementsCount");
const makeupLevel = document.getElementById("makeupLevel");
const changesLog = document.getElementById("changesLog");

function escapeHtml(str = "") {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

const dictionary = {
  frases: [
    {
      pattern: /\bpersona(s)? sin hogar\b/gi,
      replacements: {
        serio: {
          suave: ["persona$1 en exclusión residencial"],
          media: ["habitante$1 de la calle"],
          salvaje: ["desterrado$1 del sistema"]
        },
        gamberro: {
          suave: ["habitante$1 de la calle"],
          media: ["expulsado$1 del escaparate urbano"],
          salvaje: ["náufrago$1 del sistema"]
        }
      }
    },
    {
      pattern: /\bdaños colaterales\b/gi,
      replacements: {
        serio: {
          suave: ["víctimas no reconocidas"],
          media: ["muertes silenciadas"],
          salvaje: ["muertes que no quieren nombrar"]
        },
        gamberro: {
          suave: ["destrozos maquillados"],
          media: ["muertes con nombre borrado"],
          salvaje: ["cadáveres envueltos en tecnicismo"]
        }
      }
    },
    {
      pattern: /\bcrecimiento negativo\b/gi,
      replacements: {
        serio: {
          suave: ["descenso económico"],
          media: ["retroceso económico"],
          salvaje: ["caída económica"]
        },
        gamberro: {
          suave: ["bajada vendida con corbata"],
          media: ["hostia económica elegante"],
          salvaje: ["batacazo con nota de prensa"]
        }
      }
    },
    {
      pattern: /\bflexibilización laboral\b/gi,
      replacements: {
        serio: {
          suave: ["ajuste laboral"],
          media: ["precarización laboral"],
          salvaje: ["debilitamiento de derechos laborales"]
        },
        gamberro: {
          suave: ["apretón laboral"],
          media: ["precarización vendida como modernidad"],
          salvaje: ["dar otra vuelta de tuerca al curro"]
        }
      }
    },
    {
      pattern: /\bagentes sociales\b/gi,
      replacements: {
        serio: {
          suave: ["actores institucionales"],
          media: ["interlocutores habituales"],
          salvaje: ["los actores de siempre"]
        },
        gamberro: {
          suave: ["los de siempre"],
          media: ["la mesa de los sospechosos habituales"],
          salvaje: ["el reparto fijo del teatrillo"]
        }
      }
    },
    {
      pattern: /\bpuesta en valor\b/gi,
      replacements: {
        serio: {
          suave: ["revalorización"],
          media: ["promoción estratégica"],
          salvaje: ["operación de venta discursiva"]
        },
        gamberro: {
          suave: ["vender mejor"],
          media: ["barnizar para colocar"],
          salvaje: ["poner purpurina para colarlo"]
        }
      }
    },
    {
      pattern: /\bhoja de ruta\b/gi,
      replacements: {
        serio: {
          suave: ["plan previsto"],
          media: ["itinerario político"],
          salvaje: ["plan estratégico declarado"]
        },
        gamberro: {
          suave: ["guion"],
          media: ["mapa del teatrillo"],
          salvaje: ["papelito para fingir que saben a dónde van"]
        }
      }
    },
    {
      pattern: /\bmarco de diálogo\b/gi,
      replacements: {
        serio: {
          suave: ["espacio de negociación"],
          media: ["proceso de interlocución"],
          salvaje: ["escenario institucional de negociación"]
        },
        gamberro: {
          suave: ["mesa de palique"],
          media: ["reunión de mareo"],
          salvaje: ["charla larga con pocas ganas de arreglar nada"]
        }
      }
    },
    {
      pattern: /\bcolectivo(s)? vulnerable(s)?\b/gi,
      replacements: {
        serio: {
          suave: ["grupo$1 en situación de vulnerabilidad$2"],
          media: ["persona$1 expuesta$2 a exclusión"],
          salvaje: ["gente golpeada por la desigualdad"]
        },
        gamberro: {
          suave: ["gente jodida por el sistema"],
          media: ["los que siempre pagan la factura"],
          salvaje: ["los machacados de siempre"]
        }
      }
    },
    {
      pattern: /\btensión territorial\b/gi,
      replacements: {
        serio: {
          suave: ["conflicto territorial"],
          media: ["disputa político-territorial"],
          salvaje: ["choque territorial explícito"]
        },
        gamberro: {
          suave: ["lío territorial"],
          media: ["bronca territorial"],
          salvaje: ["follón político con mapa de fondo"]
        }
      }
    }
  ],

  palabras: [
    {
      pattern: /\bpolítico(s)?\b/gi,
      replacements: {
        serio: {
          suave: ["cargo$1 público$1"],
          media: ["representante$1 político$1"],
          salvaje: ["operador$1 del poder"]
        },
        gamberro: {
          suave: ["presunto$1"],
          media: ["profesional$1 del titular"],
          salvaje: ["equilibrista$1 del cargo"]
        }
      }
    },
    {
      pattern: /\bincidencia(s)?\b/gi,
      replacements: {
        serio: {
          suave: ["alteración$1"],
          media: ["problema$1"],
          salvaje: ["fallo$1 relevante$1"]
        },
        gamberro: {
          suave: ["problema$1"],
          media: ["liada$1"],
          salvaje: ["cristo$1"]
        }
      }
    },
    {
      pattern: /\breajuste(s)?\b/gi,
      replacements: {
        serio: {
          suave: ["corrección$1"],
          media: ["recorte$1"],
          salvaje: ["reducción$1 impuesta$1"]
        },
        gamberro: {
          suave: ["recorte$1"],
          media: ["hachazo$1"],
          salvaje: ["tijeretazo$1"]
        }
      }
    },
    {
      pattern: /\boptimización\b/gi,
      replacements: {
        serio: {
          suave: ["mejora operativa"],
          media: ["reducción de costes"],
          salvaje: ["reorganización orientada al ahorro"]
        },
        gamberro: {
          suave: ["apretón de tornillos"],
          media: ["hacer más con menos"],
          salvaje: ["exprimir más por menos dinero"]
        }
      }
    },
    {
      pattern: /\bdesaceleración\b/gi,
      replacements: {
        serio: {
          suave: ["ralentización"],
          media: ["empeoramiento"],
          salvaje: ["retroceso"]
        },
        gamberro: {
          suave: ["frenazo"],
          media: ["pintan bastos"],
          salvaje: ["se viene curva"]
        }
      }
    },
    {
      pattern: /\bresiliencia\b/gi,
      replacements: {
        serio: {
          suave: ["capacidad de adaptación"],
          media: ["resistencia social"],
          salvaje: ["aguante ante el deterioro"]
        },
        gamberro: {
          suave: ["aguante"],
          media: ["tragar y seguir"],
          salvaje: ["comerse el golpe sin romperse del todo"]
        }
      }
    },
    {
      pattern: /\bmoderación\b/gi,
      replacements: {
        serio: {
          suave: ["contención"],
          media: ["prudencia discursiva"],
          salvaje: ["limitación calculada del discurso"]
        },
        gamberro: {
          suave: ["medirse"],
          media: ["bajar el tono por interés"],
          salvaje: ["hacerse el templado cuando conviene"]
        }
      }
    },
    {
      pattern: /\bcolaboración público-privada\b/gi,
      replacements: {
        serio: {
          suave: ["cooperación institucional y empresarial"],
          media: ["externalización compartida"],
          salvaje: ["traslado parcial al sector privado"]
        },
        gamberro: {
          suave: ["mezcla de dinero público y negocio privado"],
          media: ["privatización con buenos modales"],
          salvaje: ["poner lo público a currar para la caja privada"]
        }
      }
    }
  ],

  verbos: [
    {
      pattern: /\bimpulsa\b/gi,
      replacements: {
        serio: {
          suave: ["promueve"],
          media: ["trata de promover"],
          salvaje: ["empuja políticamente"]
        },
        gamberro: {
          suave: ["vende"],
          media: ["intenta colar"],
          salvaje: ["mete con calzador"]
        }
      }
    },
    {
      pattern: /\bimpulsó\b/gi,
      replacements: {
        serio: {
          suave: ["promovió"],
          media: ["trató de promover"],
          salvaje: ["empujó políticamente"]
        },
        gamberro: {
          suave: ["vendió"],
          media: ["intentó colar"],
          salvaje: ["metió con calzador"]
        }
      }
    },
    {
      pattern: /\bimpulsará\b/gi,
      replacements: {
        serio: {
          suave: ["promoverá"],
          media: ["tratará de promover"],
          salvaje: ["empujará políticamente"]
        },
        gamberro: {
          suave: ["venderá"],
          media: ["intentará colar"],
          salvaje: ["meterá con calzador"]
        }
      }
    },
    {
      pattern: /\bgarantiza\b/gi,
      replacements: {
        serio: {
          suave: ["asegura"],
          media: ["afirma asegurar"],
          salvaje: ["presenta como garantizado"]
        },
        gamberro: {
          suave: ["promete"],
          media: ["vende como seguro"],
          salvaje: ["jura que va a salir bien"]
        }
      }
    },
    {
      pattern: /\bgarantizó\b/gi,
      replacements: {
        serio: {
          suave: ["aseguró"],
          media: ["afirmó asegurar"],
          salvaje: ["presentó como garantizado"]
        },
        gamberro: {
          suave: ["prometió"],
          media: ["vendió como seguro"],
          salvaje: ["juró que iba a salir bien"]
        }
      }
    },
    {
      pattern: /\bdefiende\b/gi,
      replacements: {
        serio: {
          suave: ["sostiene"],
          media: ["justifica"],
          salvaje: ["argumenta en favor de"]
        },
        gamberro: {
          suave: ["justifica"],
          media: ["sale a vender"],
          salvaje: ["se marca un alegato para taparlo"]
        }
      }
    },
    {
      pattern: /\bdefendió\b/gi,
      replacements: {
        serio: {
          suave: ["sostuvo"],
          media: ["justificó"],
          salvaje: ["argumentó en favor de"]
        },
        gamberro: {
          suave: ["justificó"],
          media: ["salió a vender"],
          salvaje: ["se marcó un alegato para taparlo"]
        }
      }
    },
    {
      pattern: /\bseñala\b/gi,
      replacements: {
        serio: {
          suave: ["indica"],
          media: ["afirma"],
          salvaje: ["declara expresamente"]
        },
        gamberro: {
          suave: ["dice"],
          media: ["suelta"],
          salvaje: ["te suelta con solemnidad"]
        }
      }
    },
    {
      pattern: /\bseñaló\b/gi,
      replacements: {
        serio: {
          suave: ["indicó"],
          media: ["afirmó"],
          salvaje: ["declaró expresamente"]
        },
        gamberro: {
          suave: ["dijo"],
          media: ["soltó"],
          salvaje: ["te soltó con solemnidad"]
        }
      }
    },
    {
      pattern: /\bsubraya\b/gi,
      replacements: {
        serio: {
          suave: ["destaca"],
          media: ["remarca"],
          salvaje: ["enfatiza explícitamente"]
        },
        gamberro: {
          suave: ["repite"],
          media: ["insiste en vender"],
          salvaje: ["te recalca para que tragues"]
        }
      }
    },
    {
      pattern: /\bsubrayó\b/gi,
      replacements: {
        serio: {
          suave: ["destacó"],
          media: ["remarcó"],
          salvaje: ["enfatizó explícitamente"]
        },
        gamberro: {
          suave: ["repitió"],
          media: ["insistió en vender"],
          salvaje: ["te recalcó para que tragaras"]
        }
      }
    }
  ]
};

function getReplacement(entry, mode, intensity) {
  const options = entry.replacements?.[mode]?.[intensity] || [];
  if (!options.length) return null;
  return pick(options);
}

function applyEntries(text, entries, mode, intensity, log) {
  let result = text;
  let count = 0;

  entries.forEach((entry) => {
    const replacement = getReplacement(entry, mode, intensity);
    if (!replacement) return;

    result = result.replace(entry.pattern, (match) => {
      count++;
      log.push({
        from: match,
        to: replacement
      });
      return replacement;
    });
  });

  return { result, count };
}

function calculateMakeupLevel(count) {
  if (count === 0) return "NULO";
  if (count <= 3) return "BAJO";
  if (count <= 7) return "MEDIO";
  if (count <= 12) return "ALTO";
  return "EXTREMO";
}

function transformText() {
  const original = inputText.value.trim();
  const mode = modeSelect.value;
  const intensity = intensitySelect.value;

  if (!original) {
    outputText.textContent = "Pega antes un texto para traducir.";
    replacementsCount.textContent = "0";
    makeupLevel.textContent = "NULO";
    changesLog.textContent = "Sin cambios todavía.";
    return;
  }

  const log = [];

  const frasesPass = applyEntries(original, dictionary.frases, mode, intensity, log);
  const palabrasPass = applyEntries(frasesPass.result, dictionary.palabras, mode, intensity, log);
  const verbosPass = applyEntries(palabrasPass.result, dictionary.verbos, mode, intensity, log);

  const finalText = verbosPass.result;
  const totalCount = frasesPass.count + palabrasPass.count + verbosPass.count;

  outputText.textContent = finalText;
  replacementsCount.textContent = String(totalCount);
  makeupLevel.textContent = calculateMakeupLevel(totalCount);

  if (!log.length) {
    changesLog.textContent = "No se detectaron expresiones del diccionario en este texto.";
    return;
  }

  changesLog.innerHTML = log
    .map(item => {
      return `
        <div class="change-item">
          <span class="original">${escapeHtml(item.from)}</span>
          &nbsp;→&nbsp;
          <span class="new">${escapeHtml(item.to)}</span>
        </div>
      `;
    })
    .join("");
}

function clearAll() {
  inputText.value = "";
  outputText.textContent = "Aquí aparecerá la versión reinterpretada.";
  replacementsCount.textContent = "0";
  makeupLevel.textContent = "NULO";
  changesLog.textContent = "Sin cambios todavía.";
}

async function copyOutput() {
  const text = outputText.textContent.trim();

  if (!text || text === "Aquí aparecerá la versión reinterpretada.") {
    return;
  }

  try {
    await navigator.clipboard.writeText(text);
    copyBtn.textContent = "COPIADO";
    setTimeout(() => {
      copyBtn.textContent = "COPIAR";
    }, 1200);
  } catch (error) {
    copyBtn.textContent = "ERROR";
    setTimeout(() => {
      copyBtn.textContent = "COPIAR";
    }, 1200);
  }
}

transformBtn.addEventListener("click", transformText);
clearBtn.addEventListener("click", clearAll);
copyBtn.addEventListener("click", copyOutput);

inputText.addEventListener("keydown", (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
    transformText();
  }
});
