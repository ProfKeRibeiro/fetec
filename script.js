let pontos = 0;
let player;
let trackName;
let erros = 0;
let jogos = {};
let playTimeout;
let tentativasOuvir = 0;
let musicaAnterior;
let connect_to_device;

function startGame() {
  if (trackName.includes("-")) {
    const partes = trackName.split("-");
    trackName = partes[0].trim();
  }
  trackName = trackName.trim();
  return trackName;
}

function atualizarPontuacao() {
  //a pontuação não pode ser menor que 0
  if (pontos < 0) {
    pontos = 0;
  }
  const pontuacaoElement = document.getElementById("score");
  pontuacaoElement.innerText = `Pontuação: ${pontos}`;
}

function mostrarMensagem(mensagem) {
  const mensagemContainer = document.getElementById("mensagem-container");
  const mensagemElement = document.getElementById("mensagem");

  mensagemContainer.classList.remove("hidden");

  mensagemElement.innerText = mensagem;
}

function reiniciarJogo() {
  mostrarMensagem("Você perdeu!");
  setTimeout(() => {
    window.location.href = "index.html";
  }, 1000);
}

function extrairNomeDaMusica() {
  if (trackName.includes("-")) {
    const partes = trackName.split("-");
    trackName = partes[0].trim();
  }
  trackName = trackName.trim();
  return trackName;
}

const tempoDaMusica = 15000;
let stopTimeout;

function playMusic() {
  if (player.getCurrentState().position === 0) {
    player.togglePlay();
    playTimeout = setTimeout(() => {
      if (player.getCurrentState().position === 0) {
        player.pause();
        if (trackName === musicaAnterior) {
          tentativasOuvir++;
          if (tentativasOuvir > 1) {
            pontos -= 2;
            atualizarPontuacao();
          }
        } else {
          tentativasOuvir = 0;
        }
        musicaAnterior = trackName;
      }
    }, tempoDaMusica);
    stopTimeout = setTimeout(() => {
      player.pause();
    }, tempoDaMusica);
  } else {
    player.togglePlay();
    clearTimeout(playTimeout);
    clearTimeout(stopTimeout);
    playTimeout = setTimeout(() => {
      if (player.getCurrentState().position !== 0) {
        player.pause();
      }
    }, tempoDaMusica);
    stopTimeout = setTimeout(() => {
      player.pause();
    }, tempoDaMusica);
  }
}

// function getToken() {
//     fetch("token.json")
//       .then((response) => response.json())
//       .then((data) => {
//         token = data.token;
//       });
//   }
//   getToken();

window.onSpotifyWebPlaybackSDKReady = () => {
  token =
    "BQBMEw4mM0RLtww18xpB2_ET8V4aHnF6Ts5g0tad45kxXOWiXh55_V-4TZS5HVsOdhY3pLLecOI0sdJIBltHa-sJ8cgPoGGcuQVHjAhaYqf3RKDJRG-zknXy2lYEwmO30lLzY06bURrKbWhMknht3h1l3WtyM0lI4zxYOlbdOJNLaYfVHlEWVTZP8Ff0XuN3PAMZKqSfOfmY6nOEqUR4vJhBwlHK";
  player = new Spotify.Player({
    name: "Web Playback SDK Quick Start Player",
    getOAuthToken: (cb) => {
      cb(token);
    },
    volume: 0.5,
  });

  const musicasEJogos = {
    "super mario bros. theme": "super mario",
    "tetris theme": "tetris",
    "donkey kong country theme": "donkey kong",
    "crash bandicoot theme": "crash",
    "san andreas theme song": "gta",
    "bomberman theme (area 1)": "bomberman",
    "god of war iii overture": "god of war",
    "among us theme": "among us",
    "genshin impact main theme": "genshin impact",
    "free fire lobby: original": "free fire",
  };

  //um array com os albuns que serão usados no jogo
  let album_uri = [
    "spotify:playlist:0rEetDb8PbNZcjJ30SS51d",
    "spotify:playlist:7ipjrgeonBt6MqTQeFT4TR",
    "spotify:playlist:3xZtCKskNZaYgX4AV8n8I8",
  ];
  //função para escolher um album aleatorio do array
  let randomAlbum = album_uri[Math.floor(Math.random() * album_uri.length)];
  album_uri = randomAlbum;

  player.addListener("ready", ({ device_id }) => {
    console.log("Ready with Device ID", device_id);
    connect_to_device = () => {
      fetch(
        `https://api.spotify.com/v1/me/player/play?device_id=${device_id}`,
        {
          method: "PUT",
          body: JSON.stringify({
            context_uri: album_uri,
            play: false,
          }),
          headers: new Headers({
            Authorization: "Bearer " + token,
          }),
        }
      )
        .then((response) => console.log(response))
        .then((data) => {
          player.addListener("player_state_changed", ({ track_window }) => {
            trackName = track_window.current_track.name.toLowerCase();
            console.log("Current Track:", trackName);

            if (musicasEJogos[trackName]) {
              jogos[trackName] = musicasEJogos[trackName];
            }
          });
        });
    };
  });
  let isConnected;
  let click = 0;
  let contador_musicas = 0;
  document.getElementById("play-music").addEventListener("click", (e) => {
    //previne que a pagina seja recarregada zerando a pontuação
    e.preventDefault();

    if (!isConnected) {
      connect_to_device();
      isConnected = true;
    }
    //verifica se o botão foi clicado mais de uma vez para perder pontos
    if (click === 2) {
        pontos -= 2;
        atualizarPontuacao();
        alert(
          "Você perderá 2 pontos por não ter acertado a música no tempo suficiente."
        );
    }
      if (click > 2) {
        pontos -= 2;
        atualizarPontuacao();
        alert(
          "Você perderá 2 pontos por não ter acertado a música no tempo suficiente."
        );
        player.pause();
        clearTimeout();
        setTimeout(() => {
            player.togglePlay();
        }, tempoDaMusica);
        //verificar se musica n terminou, se a musica terminar perder o jogo
        setTimeout(() => {
            if (player.getCurrentState().position !== 0) {
                player.pause();
                reiniciarJogo();
            }
        }, tempoDaMusica);
        }
    
    click++;
    playMusic();
  });

  document.getElementById("btn-resposta").addEventListener("click", (event) => {
    event.preventDefault();
    let resposta = document.getElementById("resposta").value;
    resposta = resposta.toLowerCase();

    if (jogos[trackName] && resposta === jogos[trackName]) {
      alert("Você Acertou, Parabéns!");
      pontos += 10;
      atualizarPontuacao();
      document.getElementById("resposta").value = "";
      player.nextTrack();
      setTimeout(() => {
        document.getElementById("mensagem-container").classList.add("hidden");
      }, 1300);

      if (contador_musicas === 6) {
        alert("PARABÉNS, Você finalizou o jogo!!!");
      }
      contador_musicas++;
    } else {
      alert("Você errou, tente novamente!");
      pontos -= 5;
      atualizarPontuacao();
      erros++;
      if (erros === 3) {
        reiniciarJogo();
      }
    }
  });

  player.connect();
};
