// Este arquivo contém o código JavaScript que utiliza a API de Geolocalização para monitorar a velocidade do usuário.
// Ele lida com a obtenção da localização do usuário, cálculo da velocidade e atualização dos elementos HTML correspondentes.

let limiteVelocidade = 40; // Limite padrão de velocidade em km/h
let ultimaPosicao = null; // Armazena a última posição para cálculo manual
let ultimaAtualizacao = null; // Armazena o timestamp da última posição

function calcularVelocidade(speed, position) {
  // Se a velocidade estiver disponível diretamente, use-a
  if (speed != null) {
    return (speed * 3.6).toFixed(2); // Converte de m/s para km/h
  }

  // Caso contrário, calcula a velocidade manualmente
  if (ultimaPosicao && ultimaAtualizacao) {
    const distancia = calcularDistancia(
      ultimaPosicao.latitude,
      ultimaPosicao.longitude,
      position.coords.latitude,
      position.coords.longitude
    ); // Distância em metros
    const tempo = (position.timestamp - ultimaAtualizacao) / 1000; // Tempo em segundos
    if (tempo > 0) {
      return ((distancia / tempo) * 3.6).toFixed(2); // Velocidade em km/h
    }
  }

  return "Indisponível"; // Retorna "Indisponível" se não for possível calcular
}

function calcularDistancia(lat1, lon1, lat2, lon2) {
  // Fórmula de Haversine para calcular a distância entre dois pontos geográficos
  const R = 6371e3; // Raio da Terra em metros
  const rad = Math.PI / 180;
  const dLat = (lat2 - lat1) * rad;
  const dLon = (lon2 - lon1) * rad;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * rad) * Math.cos(lat2 * rad) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distância em metros
}

function definirLimite() {
  const inputLimite = document.getElementById("limite").value;
  if (inputLimite && !isNaN(inputLimite) && inputLimite > 0) {
    limiteVelocidade = parseFloat(inputLimite);
    alert(`Limite de velocidade definido para ${limiteVelocidade} km/h.`);
  } else {
    alert("Por favor, insira um valor válido para o limite de velocidade.");
  }
}

function resetarLimite() {
  limiteVelocidade = 40; // Reseta para o padrão
  document.getElementById("limite").value = ""; // Limpa o campo de entrada
  alert("Limite de velocidade resetado para o padrão de 40 km/h.");
}

function exibirSugestoes() {
  // Exibe a caixa de sugestões para o usuário
  const sugestoesElement = document.getElementById("sugestoes");
  if (sugestoesElement) {
    sugestoesElement.style.display = "block";
  }
}

function exibirMensagemErro(error) {
  // Exibe mensagens de erro com base no código do erro
  const statusElement = document.getElementById("status");
  switch (error.code) {
    case error.PERMISSION_DENIED:
      statusElement.textContent = "Permissão negada para acessar a localização.";
      break;
    case error.POSITION_UNAVAILABLE:
      statusElement.textContent = "Localização indisponível.";
      break;
    case error.TIMEOUT:
      statusElement.textContent = "Tempo de solicitação esgotado. Tente novamente em uma área com melhor sinal.";
      break;
    default:
      statusElement.textContent = "Erro desconhecido ao obter localização.";
  }
  exibirSugestoes(); // Exibe a caixa de sugestões em caso de erro
}

function verificarDispositivo() {
  // Identifica se o dispositivo é um notebook ou um dispositivo móvel
  const userAgent = navigator.userAgent.toLowerCase();
  const isNotebook = userAgent.includes("windows") || userAgent.includes("macintosh");
  if (isNotebook) {
    document.getElementById("dispositivo").textContent = "Você está utilizando um notebook.";
  } else {
    document.getElementById("dispositivo").textContent = "Você está utilizando um dispositivo móvel.";
  }
}

function verificarPermissaoGeolocalizacao() {
  // Verifica se a permissão de geolocalização foi negada
  if (navigator.permissions) {
    navigator.permissions.query({ name: "geolocation" }).then((result) => {
      if (result.state === "denied") {
        document.getElementById("status").textContent = "Permissão de geolocalização negada. Verifique as configurações do navegador.";
      }
    });
  }
}

if ("geolocation" in navigator) {
  verificarPermissaoGeolocalizacao(); // Verifica permissões de geolocalização
  verificarDispositivo(); // Verifica o tipo de dispositivo
  navigator.geolocation.watchPosition(
    (position) => {
      // Verifica se as coordenadas são válidas
      if (!position.coords || position.coords.latitude == null || position.coords.longitude == null) {
        document.getElementById("status").textContent = "Não foi possível obter a localização. Tente novamente.";
        return;
      }

      // Calcula e exibe a velocidade
      const velocidadeEmKmPorHora = calcularVelocidade(position.coords.speed, position);
      document.getElementById("status").textContent = "Localização obtida!";
      document.getElementById("velocidade").textContent = `Velocidade: ${velocidadeEmKmPorHora} km/h`;

      // Atualiza a última posição e timestamp
      ultimaPosicao = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      };
      ultimaAtualizacao = position.timestamp;

      // Exibe alerta se a velocidade estiver acima do limite
      const alertaElement = document.getElementById("alerta");
      if (velocidadeEmKmPorHora !== "Indisponível" && velocidadeEmKmPorHora > limiteVelocidade) {
        alertaElement.textContent = `⚠️ Você está acima do limite de velocidade de ${limiteVelocidade} km/h!`;
      } else {
        alertaElement.textContent = "";
      }
    },
    (error) => {
      exibirMensagemErro(error); // Trata erros de localização
      console.error("Erro ao obter localização:", error);
    },
    {
      enableHighAccuracy: true, // Alta precisão para maior exatidão
      maximumAge: 0,
      timeout: 10000, // Tempo limite de 10 segundos
    }
  );
} else {
  document.getElementById("status").textContent = "Geolocalização não suportada neste dispositivo.";
}

// Adiciona eventos aos botões
document.getElementById("definirLimite").addEventListener("click", definirLimite);
document.getElementById("resetarLimite").addEventListener("click", resetarLimite);