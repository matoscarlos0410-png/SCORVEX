const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

canvas.width = 900;
canvas.height = 550;

const vidaTexto = document.getElementById("vida");
const puntosTexto = document.getElementById("puntos");
const restart = document.getElementById("restart");

let teclas = {};
let puntos = 0;
let gameOver = false;

const jugador = {
    x: 450,
    y: 275,
    tamaño: 25,
    velocidad: 5,
    vida: 100,
    atacando: false,
    ataqueTiempo: 0
};

let enemigos = [];

document.addEventListener("keydown", (e) => {
    teclas[e.key.toLowerCase()] = true;

    if (e.code === "Space" && !gameOver) {
        atacar();
    }
});

document.addEventListener("keyup", (e) => {
    teclas[e.key.toLowerCase()] = false;
});

function crearEnemigo() {
    const lado = Math.floor(Math.random() * 4);

    let x, y;

    if (lado === 0) {
        x = 20;
        y = Math.random() * canvas.height;
    } else if (lado === 1) {
        x = canvas.width - 20;
        y = Math.random() * canvas.height;
    } else if (lado === 2) {
        x = Math.random() * canvas.width;
        y = 20;
    } else {
        x = Math.random() * canvas.width;
        y = canvas.height - 20;
    }

    enemigos.push({
        x: x,
        y: y,
        tamaño: 22,
        velocidad: 1.5 + Math.random() * 1.5,
        vida: 30
    });
}

function moverJugador() {

    if (teclas["w"]) jugador.y -= jugador.velocidad;
    if (teclas["s"]) jugador.y += jugador.velocidad;
    if (teclas["a"]) jugador.x -= jugador.velocidad;
    if (teclas["d"]) jugador.x += jugador.velocidad;

    jugador.x = Math.max(25, Math.min(canvas.width - 25, jugador.x));
    jugador.y = Math.max(25, Math.min(canvas.height - 25, jugador.y));
}

function atacar() {

    jugador.atacando = true;
    jugador.ataqueTiempo = 12;

    enemigos.forEach((enemigo, index) => {

        const dx = enemigo.x - jugador.x;
        const dy = enemigo.y - jugador.y;
        const distancia = Math.sqrt(dx * dx + dy * dy);

        if (distancia < 80) {
            enemigo.vida -= 30;

            if (enemigo.vida <= 0) {
                enemigos.splice(index, 1);
                puntos += 100;
            }
        }
    });
}

function moverEnemigos() {

    enemigos.forEach((enemigo) => {

        const dx = jugador.x - enemigo.x;
        const dy = jugador.y - enemigo.y;

        const distancia = Math.sqrt(dx * dx + dy * dy);

        enemigo.x += (dx / distancia) * enemigo.velocidad;
        enemigo.y += (dy / distancia) * enemigo.velocidad;

        if (distancia < 35) {
            jugador.vida -= 0.3;
        }
    });
}

function dibujarJugador() {

    ctx.save();

    ctx.translate(jugador.x, jugador.y);

    // Cuerpo
    ctx.fillStyle = "#00eaff";
    ctx.beginPath();
    ctx.arc(0, 0, jugador.tamaño, 0, Math.PI * 2);
    ctx.fill();

    // Núcleo
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(0, 0, 8, 0, Math.PI * 2);
    ctx.fill();

    // Ataque
    if (jugador.atacando) {

        ctx.strokeStyle = "#ffff00";
        ctx.lineWidth = 7;

        ctx.beginPath();
        ctx.arc(0, 0, 65, 0, Math.PI * 2);
        ctx.stroke();
    }

    ctx.restore();
}

function dibujarEnemigos() {

    enemigos.forEach((enemigo) => {

        ctx.fillStyle = "#ff3158";

        ctx.beginPath();
        ctx.arc(
            enemigo.x,
            enemigo.y,
            enemigo.tamaño,
            0,
            Math.PI * 2
        );

        ctx.fill();

        // Barra de vida
        ctx.fillStyle = "#222";

        ctx.fillRect(
            enemigo.x - 20,
            enemigo.y - 32,
            40,
            5
        );

        ctx.fillStyle = "#00ff66";

        ctx.fillRect(
            enemigo.x - 20,
            enemigo.y - 32,
            40 * (enemigo.vida / 30),
            5
        );
    });
}

function dibujarFondo() {

    ctx.fillStyle = "#101827";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Cuadrícula
    ctx.strokeStyle = "#1d2a3d";
    ctx.lineWidth = 1;

    for (let x = 0; x < canvas.width; x += 50) {

        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }

    for (let y = 0; y < canvas.height; y += 50) {

        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }
}

function actualizar() {

    if (gameOver) return;

    moverJugador();
    moverEnemigos();

    if (jugador.atacando) {
        jugador.ataqueTiempo--;

        if (jugador.ataqueTiempo <= 0) {
            jugador.atacando = false;
        }
    }

    vidaTexto.textContent = Math.max(0, Math.floor(jugador.vida));
    puntosTexto.textContent = puntos;

    if (jugador.vida <= 0) {
        gameOver = true;
    }
}

function dibujar() {

    dibujarFondo();
    dibujarJugador();
    dibujarEnemigos();

    if (gameOver) {

        ctx.fillStyle = "rgba(0,0,0,0.75)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = "#00eaff";
        ctx.font = "bold 55px Arial";
        ctx.textAlign = "center";

        ctx.fillText(
            "GAME OVER",
            canvas.width / 2,
            canvas.height / 2
        );

        ctx.font = "25px Arial";

        ctx.fillText(
            "Puntos: " + puntos,
            canvas.width / 2,
            canvas.height / 2 + 50
        );
    }
}

function juego() {

    actualizar();
    dibujar();

    requestAnimationFrame(juego);
}

setInterval(() => {

    if (!gameOver) {
        crearEnemigo();
    }

}, 1200);

restart.addEventListener("click", () => {

    jugador.x = 450;
    jugador.y = 275;
    jugador.vida = 100;

    puntos = 0;
    enemigos = [];
    gameOver = false;
});

juego();
