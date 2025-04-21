// This file contains the JavaScript code that utilizes the Geolocation API to monitor the user's speed.
// It handles obtaining the user's location, calculating speed, and updating the HTML elements accordingly.

if ("geolocation" in navigator) {
  navigator.geolocation.watchPosition(
    (position) => {
      const velocidadeEmMetrosPorSegundo = position.coords.speed;
      const velocidadeEmKmPorHora = velocidadeEmMetrosPorSegundo !== null
        ? (velocidadeEmMetrosPorSegundo * 3.6).toFixed(2)
        : 0;

      document.getElementById("status").textContent = "Localização obtida!";
      document.getElementById("velocidade").textContent = `Velocidade: ${velocidadeEmKmPorHora} km/h`;

      if (velocidadeEmKmPorHora > 40) {
        alert("⚠️ Você está acima do limite de velocidade!");
      }
    },
    (error) => {
      document.getElementById("status").textContent = "Erro ao obter localização.";
      console.error(error);
    },
    {
      enableHighAccuracy: true,
      maximumAge: 0,
      timeout: 5000,
    }
  );
} else {
  document.getElementById("status").textContent = "Geolocalização não suportada neste dispositivo.";
}