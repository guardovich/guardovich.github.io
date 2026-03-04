// data/medios.es.js
// Base de datos ES (valores semilla 0–100). Ajustable.
// IMPORTANTE: este fichero define/inyecta DB global para infotexto.
window.MEDIA_DB = window.MEDIA_DB || {};
window.MEDIA_DB.ES = [
  {
    id: "elpais",
    nombre: "El País",
    pais: "ES",
    tipo: "Prensa",
    propietario: "PRISA",
    url: "https://elpais.com",
    variables: { independencia:62, reputacion:56, transparencia:50, rigor:70, sesgo:30 }
  },
  {
    id: "elmundo",
    nombre: "El Mundo",
    pais: "ES",
    tipo: "Prensa",
    propietario: "Unidad Editorial",
    url: "https://www.elmundo.es",
    variables: { independencia:60, reputacion:60, transparencia:50, rigor:70, sesgo:55 }
  },
  {
    id: "lavanguardia",
    nombre: "La Vanguardia",
    pais: "ES",
    tipo: "Prensa",
    propietario: "Grupo Godó",
    url: "https://www.lavanguardia.com",
    variables: { independencia:60, reputacion:70, transparencia:52, rigor:68, sesgo:58 }
  },
  {
    id: "rtve",
    nombre: "RTVE",
    pais: "ES",
    tipo: "TV/Radio",
    propietario: "Corporación RTVE (público)",
    url: "https://www.rtve.es",
    variables: { independencia:10, reputacion:30, transparencia:60, rigor:68, sesgo:25 }
  },
  {
    id: "eldiario",
    nombre: "elDiario.es",
    pais: "ES",
    tipo: "Digital",
    propietario: "Socios / Editorial",
    url: "https://www.eldiario.es",
    variables: { independencia:70, reputacion:55, transparencia:60, rigor:50, sesgo:30 }
  }
];
