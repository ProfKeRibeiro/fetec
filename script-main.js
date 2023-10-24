let player;
let trackName;
let pontos = 0;
let ptsValendo = 15;
let chances = 3;
let primeiraVez = 1;
let connect_to_device;
let isConnected;
let contador_musicas = 0;

const alert1 = document.querySelector("#alert-play");
alert1.innerHTML = `<h2>Toque no play!</h2>`;

const alert2 = document.querySelector("#alert-pts");
const alert3 = document.querySelector("#alert-resposta-errada");
const alert4 = document.querySelector("#alert-ultima-chance");
const alert5 = document.querySelector("#alert-erro");
const alert6 = document.querySelector("#alert-acerto2");

function alerts(alert) {
  let teste = alert.classList;
  if (teste.contains("hidden")) {
    teste.remove("hidden");
  } else {
    teste.add("hidden");
  }
}

function proximaMusica() {
  player.nextTrack();
  ptsValendo = 15;
  clearTimeout();
  setTimeout(() => {
    player.pause();
  }, 15000);
  
}
function getToken() {
  fetch("token.json")
    .then((response) => response.json())
    .then((data) => {
      token = data.token;
    });
}
getToken();
window.onSpotifyWebPlaybackSDKReady = () => {
  //token = 'BQCfcBS3qvNL8b3JzkePYq3OZ46CkQeCmbqwn5y28Ltft8Gt5-ZFv8H5r3IMWiUOLpWuOEka0xsgyrNTyQBHCJxNYgHgM6lXtm1_0R6sVZblSiPu8bcbkT8z7fHKd6hrr1R45ypcYDtF7eosQ4cEsS-hCIuJPj5ecORhSOh2rAw66zRBQH5Mss2XNwei_-R84OAl8IjG145znk2XjvDxMgy4fI0N'
  player = new Spotify.Player({
    name: "Web Playback SDK Quick Start Player",
    getOAuthToken: (cb) => {
      cb(token);
    },
    volume: 0.5,
  });

  //um array com os albuns que serão usados no jogo
  let album_uri = [
    "spotify:playlist:1qIV4ZkHJcI2gx4EPam0xm",
    "spotify:playlist:5BA6GkzPiyJL8WMh2yFfzw",
    "spotify:playlist:2CYlK9Ou161M6fzXROgCg7",
  ];
  //função para escolher um album aleatorio do array
  let randomAlbum = album_uri[Math.floor(Math.random() * album_uri.length)];
  album_uri = randomAlbum;

  player.addListener("ready", ({ device_id }) => {
    console.log("Ready with Device ID", device_id);
    connect_to_device = () => {
      //espera o usuario selecionar o album para continuar
      if (!album_uri) {
        setTimeout(connect_to_device, 1000);
        return;
      }
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
          // Adicionar listener para o evento de mudança de estado de reprodução
          player.addListener("player_state_changed", ({ track_window }) => {
            trackName = track_window.current_track.album.name;
            trackName = trackName.toLowerCase();
            //tira acentos e caracteres especiais
            trackName = trackName
              .normalize("NFD")
              .replace(/[\u0300-\u036f]/g, "");
            //tira hifens
            trackName = trackName.replace(/-/g, "");
            //substitui dois espaços por um
            trackName = trackName.replace(/\s{2,}/g, " ");
            //if para verificar se o nome da musica é aqui no mar substituir por pequena sereia
            if (trackName == "disney adventures in samba (mexico version)") {
              trackName = "a pequena sereia";
            }
            console.log("Current Track:", trackName);
          });
        });
    };
  });
  player.connect();
  let click = 0;
  document.getElementById("play-music").addEventListener("click", (e) => {
    //previne que a pagina seja recarregada zerando a pontuação
    e.preventDefault();

    if (!isConnected) {
      connect_to_device();
      isConnected = true;
    }
    if(click>1){
      if (!player.getCurrentState().paused) {
        alert2.classList.add("hidden");
        ptsValendo = ptsValendo - 2;
      }
  }
    player.togglePlay();
    setTimeout(() => {
      player.pause();      
    }, 15000);

    alert1.classList.add("hidden");
    alert2.innerHTML = `<h2>Valendo ${ptsValendo} pontos!</h2>`;
    alerts(alert2);

    if (ptsValendo == 0) {
      proximaMusica();
    }
  });

  function verificarResposta(params) {
    let resposta = document.getElementById("answer").value;
    resposta = resposta.toLowerCase();
    //tira acentos e caracteres especiais e hifens
    resposta = resposta.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    if (resposta != "" && trackName.includes(resposta)) {
      contador_musicas++;
      alerts(alert6);
      document.querySelector(
        ".mais-pontos2"
      ).innerHTML = `<h1>+${ptsValendo} pontos</h1>`;
      document
        .querySelector(".next-song2")
        .addEventListener("click", function () {
          let teste = alert6.classList;
          teste.add("hidden");
          proximaMusica();
        });
      pontos = pontos + ptsValendo;
      
      //console.log('contador:'+contador_musicas);

      // nesse bloco é onde verifica-se o numero de musicas, exemplo: se 10 musicas, ele finaliza o jogo e insere a pontuação do jogador
      if (contador_musicas === 8) {
        alert("PARABÉNS, Você finalizou o jogo!!!");
        var v_pontuacao =
          JSON.parse(localStorage.getItem("pontos_jogador")) || [];
        v_pontuacao.push(pontos);
        localStorage.setItem("pontos_jogador", JSON.stringify(v_pontuacao));
        window.location.href = "./end.html";
      }
    } else {
      alerts(alert5);
      document
        .querySelector(".next-song")
        .addEventListener("click", function () {
          console.log("testeeeeee");
          let teste = alert5.classList;
          teste.add("hidden");
          proximaMusica();
        });
      pontos = pontos - 5;
      chances = chances - 1;
    }
    document.getElementById("answer").value = "";
    document.querySelector(".pontos").innerHTML = `<h2>${pontos}</h2>`;
  }

  //botão resposta para verificar se a resposta está correta apagar a resposta e mudar a musica do play-music para a proxima
  document.getElementById("btn-check").addEventListener("click", (event) => {
    event.preventDefault();
    player.pause();
    if (primeiraVez == 1) {
      primeiraVez = 0;
      alert3.innerHTML = `
    <h2>Cuidado, se sua resposta estiver errada você perderá 5 pontos!</h2>
    <button id="btn-continuar">Continuar</button>`;

      alerts(alert3);
      document
        .getElementById("btn-continuar")
        .addEventListener("click", function () {
          alerts(alert3);
          verificarResposta();
        });
    } else {
      verificarResposta();
    }

    if (chances == 0) {
      localStorage.setItem("total-pts", pontos);
      var v_pontuacao =
        JSON.parse(localStorage.getItem("pontos_jogador")) || [];
      v_pontuacao.push(pontos);
      localStorage.setItem("pontos_jogador", JSON.stringify(v_pontuacao));
      window.location.href = "./end.html";
    }

    if (chances == 1) {
      alerts(alert4);
      alert4.innerHTML = `
  <h2>Atenção, essa é sua útima chance!</h2>
  <button id="btn-continuar2">Continuar</button>`;

      document
        .getElementById("btn-continuar2")
        .addEventListener("click", function () {
          alerts(alert4);
        });
    }
  });
};
