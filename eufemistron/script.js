const inputText = document.getElementById("inputText");
const outputText = document.getElementById("outputText");
const transformBtn = document.getElementById("transformBtn");
const clearBtn = document.getElementById("clearBtn");
const copyBtn = document.getElementById("copyBtn");
const autoModeBtn = document.getElementById("autoModeBtn");
const modeSelect = document.getElementById("mode");
const intensitySelect = document.getElementById("intensity");
const presetExample = document.getElementById("presetExample");
const replacementsCount = document.getElementById("replacementsCount");
const makeupLevel = document.getElementById("makeupLevel");
const changesLog = document.getElementById("changesLog");

const loadFeedsBtn = document.getElementById("loadFeedsBtn");
const clearFeedsBtn = document.getElementById("clearFeedsBtn");
const rssFeedGrid = document.getElementById("rssFeedGrid");

let autoModeEnabled = false;

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

function isAllCaps(text) {
  const letters = text.match(/[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]/g);
  if (!letters || !letters.length) return false;
  return letters.every((ch) => ch === ch.toUpperCase());
}

function isCapitalized(text) {
  const first = text.charAt(0);
  return first && first === first.toUpperCase() && first !== first.toLowerCase();
}

function preserveCase(original, replacement) {
  if (!replacement) return replacement;

  if (isAllCaps(original)) {
    return replacement.toUpperCase();
  }

  if (isCapitalized(original)) {
    return replacement.charAt(0).toUpperCase() + replacement.slice(1);
  }

  return replacement;
}

function formatReplacement(template, match, groups = []) {
  let result = template;

  groups.forEach((groupValue, index) => {
    const value = groupValue ?? "";
    result = result.replaceAll(`$${index + 1}`, value);
  });

  return preserveCase(match, result);
}

const examples = {
  institucional: `El Gobierno anunció una hoja de ruta para impulsar medidas estructurales dentro del actual marco de diálogo. La propuesta busca reforzar la estabilidad institucional y avanzar en la colaboración público-privada mediante un ajuste presupuestario moderado.`,

  economia: `El ministerio señaló que la desaceleración responde a un contexto internacional complejo, aunque subrayó que el crecimiento negativo será temporal gracias a un estímulo económico orientado a la recuperación.`,

  politica: `Diversos agentes sociales defendieron la necesidad de una reforma que permita una mayor flexibilización laboral. El Ejecutivo garantiza que estas medidas mejorarán la competitividad y favorecen un consenso amplio.`,

  guerra: `Fuentes oficiales señalaron que la operación causó daños colaterales en una zona sensible. La intervención fue presentada como una medida de estabilización dentro de un proceso de transición ecológica y reordenación del territorio.`
};

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
    },
    {
      pattern: /\bajuste presupuestario\b/gi,
      replacements: {
        serio: {
          suave: ["corrección presupuestaria"],
          media: ["recorte presupuestario"],
          salvaje: ["reducción forzada del gasto"]
        },
        gamberro: {
          suave: ["recorte"],
          media: ["hachazo al presupuesto"],
          salvaje: ["tijeretazo en toda regla"]
        }
      }
    },
    {
      pattern: /\bestabilidad institucional\b/gi,
      replacements: {
        serio: {
          suave: ["continuidad institucional"],
          media: ["control político estable"],
          salvaje: ["mantenimiento del statu quo"]
        },
        gamberro: {
          suave: ["que no se mueva nada"],
          media: ["todo atado y bien atado"],
          salvaje: ["que siga el mismo chiringuito"]
        }
      }
    },
    {
      pattern: /\bmedidas estructurales\b/gi,
      replacements: {
        serio: {
          suave: ["reformas de base"],
          media: ["cambios estructurales"],
          salvaje: ["reconfiguración del sistema"]
        },
        gamberro: {
          suave: ["cambios gordos"],
          media: ["toqueteo del sistema"],
          salvaje: ["meter mano a lo grande"]
        }
      }
    },
    {
      pattern: /\bproceso de diálogo\b/gi,
      replacements: {
        serio: {
          suave: ["negociación"],
          media: ["interlocución política"],
          salvaje: ["proceso negociador prolongado"]
        },
        gamberro: {
          suave: ["charla"],
          media: ["reunión eterna"],
          salvaje: ["marear la perdiz en mesa redonda"]
        }
      }
    },
    {
      pattern: /\bconsenso amplio\b/gi,
      replacements: {
        serio: {
          suave: ["acuerdo mayoritario"],
          media: ["alineación política significativa"],
          salvaje: ["acuerdo con escasa oposición visible"]
        },
        gamberro: {
          suave: ["acuerdo"],
          media: ["todos más o menos de acuerdo"],
          salvaje: ["nadie quiere liarla aquí"]
        }
      }
    },
    {
      pattern: /\btransición ecológica\b/gi,
      replacements: {
        serio: {
          suave: ["adaptación ambiental"],
          media: ["cambio hacia sostenibilidad"],
          salvaje: ["reconfiguración ecológica del modelo"]
        },
        gamberro: {
          suave: ["cambio verde"],
          media: ["lavado verde"],
          salvaje: ["pintarlo todo de verde para quedar bien"]
        }
      }
    },
    {
      pattern: /\breordenación del territorio\b/gi,
      replacements: {
        serio: {
          suave: ["planificación territorial"],
          media: ["redistribución espacial"],
          salvaje: ["reconfiguración territorial"]
        },
        gamberro: {
          suave: ["cambiar cosas de sitio"],
          media: ["mover piezas en el mapa"],
          salvaje: ["redibujar el mapa a conveniencia"]
        }
      }
    },
    {
      pattern: /\bmarco normativo\b/gi,
      replacements: {
        serio: {
          suave: ["regulación vigente"],
          media: ["conjunto normativo"],
          salvaje: ["estructura legal establecida"]
        },
        gamberro: {
          suave: ["normas"],
          media: ["las reglas del juego"],
          salvaje: ["papeles que mandan más que la realidad"]
        }
      }
    },
    {
      pattern: /\bincremento moderado\b/gi,
      replacements: {
        serio: {
          suave: ["aumento leve"],
          media: ["subida controlada"],
          salvaje: ["incremento limitado"]
        },
        gamberro: {
          suave: ["subidita"],
          media: ["subida con cuidado"],
          salvaje: ["subida que quieren que no se note"]
        }
      }
    },
    {
      pattern: /\bestímulo económico\b/gi,
      replacements: {
        serio: {
          suave: ["impulso económico"],
          media: ["incentivo económico"],
          salvaje: ["inyección financiera"]
        },
        gamberro: {
          suave: ["meter dinero"],
          media: ["regar con pasta"],
          salvaje: ["inyectar dinero para aguantar el tinglado"]
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
    },
    {
      pattern: /\breforma(s)?\b/gi,
      replacements: {
        serio: {
          suave: ["cambio$1"],
          media: ["modificación$1"],
          salvaje: ["reconfiguración$1"]
        },
        gamberro: {
          suave: ["cambio$1"],
          media: ["parche$1"],
          salvaje: ["remiendo$1"]
        }
      }
    },
    {
      pattern: /\bmedida(s)?\b/gi,
      replacements: {
        serio: {
          suave: ["acción$1"],
          media: ["iniciativa$1"],
          salvaje: ["intervención$1"]
        },
        gamberro: {
          suave: ["cosa$1"],
          media: ["movida$1"],
          salvaje: ["apaño$1"]
        }
      }
    },
    {
      pattern: /\bgestión\b/gi,
      replacements: {
        serio: {
          suave: ["administración"],
          media: ["dirección operativa"],
          salvaje: ["control ejecutivo"]
        },
        gamberro: {
          suave: ["llevarlo"],
          media: ["manejarlo"],
          salvaje: ["llevar el chiringuito"]
        }
      }
    },
    {
      pattern: /\bcontexto\b/gi,
      replacements: {
        serio: {
          suave: ["entorno"],
          media: ["marco"],
          salvaje: ["escenario"]
        },
        gamberro: {
          suave: ["situación"],
          media: ["panorama"],
          salvaje: ["el percal"]
        }
      }
    },
    {
      pattern: /\biniciativa\b/gi,
      replacements: {
        serio: {
          suave: ["propuesta"],
          media: ["acción inicial"],
          salvaje: ["impulso estratégico"]
        },
        gamberro: {
          suave: ["idea"],
          media: ["movida"],
          salvaje: ["invento"]
        }
      }
    },
    {
      pattern: /\bsector(es)?\b/gi,
      replacements: {
        serio: {
          suave: ["ámbito$1"],
          media: ["segmento$1"],
          salvaje: ["área$1 económica$1"]
        },
        gamberro: {
          suave: ["campo$1"],
          media: ["parte$1"],
          salvaje: ["trozo$1 del negocio"]
        }
      }
    },
    {
      pattern: /\bpropuesta(s)?\b/gi,
      replacements: {
        serio: {
          suave: ["planteamiento$1"],
          media: ["iniciativa$1"],
          salvaje: ["propuesta$1 estratégica$1"]
        },
        gamberro: {
          suave: ["idea$1"],
          media: ["movida$1"],
          salvaje: ["plan$1 improvisado$1"]
        }
      }
    },
    {
      pattern: /\bobjetivo(s)?\b/gi,
      replacements: {
        serio: {
          suave: ["meta$1"],
          media: ["propósito$1"],
          salvaje: ["finalidad$1 estratégica$1"]
        },
        gamberro: {
          suave: ["meta$1"],
          media: ["lo que quieren"],
          salvaje: ["lo que buscan de verdad"]
        }
      }
    },
    {
      pattern: /\bimpacto\b/gi,
      replacements: {
        serio: {
          suave: ["efecto"],
          media: ["consecuencia"],
          salvaje: ["resultado medible"]
        },
        gamberro: {
          suave: ["efecto"],
          media: ["lo que pasa"],
          salvaje: ["la hostia que pega"]
        }
      }
    },
    {
      pattern: /\brecuperación\b/gi,
      replacements: {
        serio: {
          suave: ["mejora"],
          media: ["reactivación"],
          salvaje: ["restablecimiento"]
        },
        gamberro: {
          suave: ["mejoría"],
          media: ["volver a tirar"],
          salvaje: ["levantar el muerto"]
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
    },
    {
      pattern: /\banuncia\b/gi,
      replacements: {
        serio: {
          suave: ["comunica"],
          media: ["declara"],
          salvaje: ["presenta oficialmente"]
        },
        gamberro: {
          suave: ["dice"],
          media: ["suelta"],
          salvaje: ["lo vende en rueda de prensa"]
        }
      }
    },
    {
      pattern: /\banunció\b/gi,
      replacements: {
        serio: {
          suave: ["comunicó"],
          media: ["declaró"],
          salvaje: ["presentó oficialmente"]
        },
        gamberro: {
          suave: ["dijo"],
          media: ["soltó"],
          salvaje: ["lo vendió en rueda de prensa"]
        }
      }
    },
    {
      pattern: /\bpropone\b/gi,
      replacements: {
        serio: {
          suave: ["plantea"],
          media: ["sugiere"],
          salvaje: ["formula una propuesta"]
        },
        gamberro: {
          suave: ["dice"],
          media: ["plantea por encima"],
          salvaje: ["lanza a ver si cuela"]
        }
      }
    },
    {
      pattern: /\bpropuso\b/gi,
      replacements: {
        serio: {
          suave: ["planteó"],
          media: ["sugirió"],
          salvaje: ["formuló una propuesta"]
        },
        gamberro: {
          suave: ["dijo"],
          media: ["planteó por encima"],
          salvaje: ["lo lanzó a ver si colaba"]
        }
      }
    },
    {
      pattern: /\bmejora\b/gi,
      replacements: {
        serio: {
          suave: ["optimiza"],
          media: ["incrementa la calidad"],
          salvaje: ["eleva el rendimiento"]
        },
        gamberro: {
          suave: ["arregla"],
          media: ["lo deja mejor"],
          salvaje: ["lo maquilla para que parezca mejor"]
        }
      }
    },
    {
      pattern: /\baumenta\b/gi,
      replacements: {
        serio: {
          suave: ["incrementa"],
          media: ["eleva"],
          salvaje: ["intensifica"]
        },
        gamberro: {
          suave: ["sube"],
          media: ["lo sube"],
          salvaje: ["le mete subida"]
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
    result = result.replace(entry.pattern, (...args) => {
      const match = args[0];
      const groups = args.slice(1, -2);
      const replacementTemplate = getReplacement(entry, mode, intensity);

      if (!replacementTemplate) return match;

      const finalReplacement = formatReplacement(replacementTemplate, match, groups);

      count++;
      log.push({
        from: match,
        to: finalReplacement
      });

      return finalReplacement;
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

function transformWithMode(text, mode, intensity) {
  const log = [];

  const frasesPass = applyEntries(text, dictionary.frases, mode, intensity, log);
  const palabrasPass = applyEntries(frasesPass.result, dictionary.palabras, mode, intensity, log);
  const verbosPass = applyEntries(palabrasPass.result, dictionary.verbos, mode, intensity, log);

  return {
    finalText: verbosPass.result,
    totalCount: frasesPass.count + palabrasPass.count + verbosPass.count,
    log
  };
}

function buildHighlightedOutput(finalText, log) {
  if (!log.length) {
    return `<span class="output-placeholder">No se detectaron expresiones del diccionario en este texto.</span>`;
  }

  let html = escapeHtml(finalText);

  log
    .slice()
    .sort((a, b) => b.to.length - a.to.length)
    .forEach((item) => {
      const safeTo = escapeHtml(item.to);
      const marked = `<span class="mark mark-new">${safeTo}</span>`;
      html = html.replace(safeTo, marked);
    });

  return `
    <div class="block">${html}</div>
    <div class="legend">
      <span class="mark mark-new">Texto sustituido</span>
    </div>
  `;
}

function renderChangesLog(log) {
  if (!log.length) {
    changesLog.textContent = "No se detectaron expresiones del diccionario en este texto.";
    return;
  }

  changesLog.innerHTML = log
    .map((item) => {
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

function getCurrentMode() {
  if (autoModeEnabled) {
    return { mode: "gamberro", intensity: "salvaje" };
  }

  return {
    mode: modeSelect.value,
    intensity: intensitySelect.value
  };
}

function transformText() {
  const original = inputText.value.trim();
  const { mode, intensity } = getCurrentMode();

  if (!original) {
    outputText.innerHTML = `<span class="output-placeholder">Pega antes un texto para traducir.</span>`;
    replacementsCount.textContent = "0";
    makeupLevel.textContent = "NULO";
    changesLog.textContent = "Sin cambios todavía.";
    return;
  }

  const result = transformWithMode(original, mode, intensity);

  outputText.innerHTML = buildHighlightedOutput(result.finalText, result.log);
  replacementsCount.textContent = String(result.totalCount);
  makeupLevel.textContent = calculateMakeupLevel(result.totalCount);

  renderChangesLog(result.log);
}

function clearAll() {
  inputText.value = "";
  outputText.innerHTML = `<span class="output-placeholder">Aquí aparecerá la versión reinterpretada.</span>`;
  replacementsCount.textContent = "0";
  makeupLevel.textContent = "NULO";
  changesLog.textContent = "Sin cambios todavía.";
  presetExample.value = "";
}

async function copyOutput() {
  const text = outputText.innerText.trim();

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

function toggleAutoMode() {
  autoModeEnabled = !autoModeEnabled;
  autoModeBtn.classList.toggle("active-mode", autoModeEnabled);
  autoModeBtn.textContent = autoModeEnabled ? "CAÑERO: ON" : "MODO CAÑERO";
}

function loadExample() {
  const selected = presetExample.value;
  if (!selected || !examples[selected]) return;
  inputText.value = examples[selected];
}

/* =========================
   RSS MONITOR
========================= */

const RSS_FEEDS = [
  {
    source: "RTVE",
    url: "https://api.allorigins.win/raw?url=" + encodeURIComponent("https://www.rtve.es/rss/television/portada.xml")
  },
  {
    source: "RTVE Noticias",
    url: "https://api.allorigins.win/raw?url=" + encodeURIComponent("https://www.rtve.es/rss/noticias.xml")
  },
  {
    source: "EL PAÍS",
    url: "https://api.allorigins.win/raw?url=" + encodeURIComponent("https://feeds.elpais.com/mrss-s/pages/ep/site/elpais.com/portada")
  }
];

function stripHtml(html = "") {
  const tmp = document.createElement("div");
  tmp.innerHTML = html;
  return (tmp.textContent || tmp.innerText || "").replace(/\s+/g, " ").trim();
}

function truncateText(text = "", max = 240) {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  return clean.slice(0, max).trim() + "…";
}

function decodeCData(text = "") {
  return text
    .replace(/^<!\[CDATA\[/, "")
    .replace(/\]\]>$/, "")
    .trim();
}

function getNodeText(parent, selectors = []) {
  for (const selector of selectors) {
    const node = parent.querySelector(selector);
    const value = node?.textContent?.trim();
    if (value) return decodeCData(value);
  }
  return "";
}

function parseRSS(xmlText, sourceName) {
  const xml = new DOMParser().parseFromString(xmlText, "text/xml");

  const parserError = xml.querySelector("parsererror");
  if (parserError) {
    return [];
  }

  const items = [...xml.querySelectorAll("item, entry")];

  return items.slice(0, 6).map((item) => {
    const title = getNodeText(item, ["title"]) || "Sin titular";
    const descriptionRaw =
      getNodeText(item, ["description", "summary", "content", "content\\:encoded"]) || "";
    const description = truncateText(stripHtml(descriptionRaw), 260);

    let link = "#";

    const linkNode = item.querySelector("link");
    if (linkNode) {
      const href = linkNode.getAttribute("href");
      if (href) {
        link = href.trim();
      } else if (linkNode.textContent?.trim()) {
        link = linkNode.textContent.trim();
      }
    }

    return {
      source: sourceName,
      title,
      description,
      link
    };
  });
}

function transformSnippet(text) {
  const clean = (text || "").trim();

  if (!clean) {
    return {
      text: "Sin texto traducible.",
      count: 0,
      level: "NULO"
    };
  }

  const result = transformWithMode(clean, "gamberro", "salvaje");

  return {
    text: result.finalText,
    count: result.totalCount,
    level: calculateMakeupLevel(result.totalCount)
  };
}

function renderRSSItems(items) {
  if (!rssFeedGrid) return;

  if (!items.length) {
    rssFeedGrid.innerHTML = `<div class="rss-empty">No se pudo cargar ningún feed.</div>`;
    return;
  }

  rssFeedGrid.innerHTML = items
    .map((item) => {
      const translatedTitle = transformSnippet(item.title);
      const translatedDesc = transformSnippet(item.description);
      const combinedCount = translatedTitle.count + translatedDesc.count;
      const combinedLevel = calculateMakeupLevel(combinedCount);

      return `
        <article class="rss-card">
          <div class="rss-meta">
            <span class="rss-source">${escapeHtml(item.source)}</span>
            <span class="rss-makeup">Maquillaje: ${escapeHtml(combinedLevel)}</span>
          </div>

          <h3 class="rss-title">${escapeHtml(item.title)}</h3>
          <p class="rss-desc">${escapeHtml(item.description || "Sin entradilla disponible.")}</p>

          <div class="rss-translated">
            <div class="rss-translated-title">VERSIÓN EUFEMISTRÓN</div>
            <p class="rss-desc">${escapeHtml(translatedTitle.text)}</p>
            <p class="rss-desc">${escapeHtml(
              item.description ? translatedDesc.text : "Sin texto traducible en la entradilla."
            )}</p>
          </div>

          <a class="rss-link" href="${escapeHtml(item.link)}" target="_blank" rel="noopener noreferrer">
            Ver noticia original
          </a>
        </article>
      `;
    })
    .join("");
}

async function fetchSingleRSS(feed) {
  try {
    const response = await fetch(feed.url, { cache: "no-store" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const xmlText = await response.text();
    return parseRSS(xmlText, feed.source);
  } catch (error) {
    console.error(`Error cargando feed ${feed.source}:`, error);
    return [];
  }
}

async function loadRSSFeeds() {
  if (!rssFeedGrid) return;

  rssFeedGrid.innerHTML = `<div class="rss-empty">Cargando feeds…</div>`;

  const results = await Promise.all(RSS_FEEDS.map(fetchSingleRSS));
  const items = results.flat();

  renderRSSItems(items);
}

function clearRSSFeeds() {
  if (!rssFeedGrid) return;
  rssFeedGrid.innerHTML = `<div class="rss-empty">Pulsa “CARGAR RSS” para leer titulares y entradillas.</div>`;
}

/* =========================
   EVENTOS
========================= */

transformBtn?.addEventListener("click", transformText);
clearBtn?.addEventListener("click", clearAll);
copyBtn?.addEventListener("click", copyOutput);
autoModeBtn?.addEventListener("click", toggleAutoMode);
presetExample?.addEventListener("change", loadExample);

loadFeedsBtn?.addEventListener("click", loadRSSFeeds);
clearFeedsBtn?.addEventListener("click", clearRSSFeeds);

inputText?.addEventListener("keydown", (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
    transformText();
  }
});
