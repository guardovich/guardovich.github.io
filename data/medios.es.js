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
    variables: { independencia:62, reputacion:78, transparencia:55, rigor:74, sesgo:60 }
  },
  {
    id: "elmundo",
    nombre: "El Mundo",
    pais: "ES",
    tipo: "Prensa",
    propietario: "Unidad Editorial",
    url: "https://www.elmundo.es",
    variables: { independencia:58, reputacion:72, transparencia:50, rigor:70, sesgo:55 }
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
    variables: { independencia:55, reputacion:66, transparencia:58, rigor:62, sesgo:52 }
  },
  {
    id: "eldiario",
    nombre: "elDiario.es",
    pais: "ES",
    tipo: "Digital",
    propietario: "Socios / Editorial",
    url: "https://www.eldiario.es",
    variables: { independencia:64, reputacion:69, transparencia:62, rigor:67, sesgo:56 }
  }
];
