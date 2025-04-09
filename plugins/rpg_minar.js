let cooldowns = {}

let handler = async (m, { conn }) => {
    let user = global.db.data.users[m.sender];
    if (!user) return;

    if (!user.pickaxedurability || user.pickaxedurability <= 0) {
        return conn.reply(m.chat, '⚒️ Tu picota está rota. Repara o compra una nueva antes de seguir minando.', m);
    }

    let lugares = [
        { nombre: "⛏️ Cueva", img: "https://files.catbox.moe/mtsv8m.jpg", probabilidad: 25, minerales: { coin: [10, 50], iron: [5, 20], gold: [2, 10], coal: [10, 50], stone: [300, 800] } },
        { nombre: "🌋 Volcán", img: "https://qu.ax/CDdWW.jpeg", probabilidad: 25, minerales: { coin: [30, 90], iron: [15, 40], gold: [10, 50], coal: [30, 100], stone: [700, 4000] } },
        { nombre: "🏚️ Mina abandonada", img: "https://qu.ax/tZvvf.jpeg", probabilidad: 50, minerales: { coin: [50, 120], iron: [20, 50], gold: [15, 40], coal: [30, 100], stone: [600, 2000] } },
        { nombre: "🌲 Bosque subterráneo", img: "https://qu.ax/FzCtg.jpeg", probabilidad: 50, minerales: { coin: [40, 100], iron: [15, 40], gold: [10, 30], coal: [20, 80], stone: [500, 1500] } },
        { nombre: "🌀 Dimensión oscura", img: "https://qu.ax/OLKnB.jpeg", probabilidad: 50, minerales: { coin: [70, 200], iron: [30, 60], gold: [20, 60], coal: [50, 150], stone: [1000, 5000] } }
    ];

    let lugar = pickByProbability(lugares);

    let coin = pickRandomRange(lugar.minerales.coin);
    let iron = pickRandomRange(lugar.minerales.iron);
    let gold = pickRandomRange(lugar.minerales.gold);
    let coal = pickRandomRange(lugar.minerales.coal);
    let stone = pickRandomRange(lugar.minerales.stone);
    let emerald = pickRandom([1, 5, 7, 8]);
    let diamond = Math.random() < 0.05 ? pickRandom([1, 2, 3]) : 0;

    let time = user.lastmiming + 600000;

    if (new Date() - user.lastmiming < 600000) {
        return conn.reply(m.chat, `⏳ Debes esperar ${msToTime(time - new Date())} para volver a minar.`, m);
    }

    let hasil = Math.floor(Math.random() * 1000);

    let maxDurability = 100; // Durabilidad máxima de la picota
    let durabilityPercentage = (user.pickaxedurability / maxDurability) * 100;

    let info = `${lugar.nombre}\n\n` +
        `🔹 *Exp*: ${hasil}\n` +
        `💰 *Monedas*: ${coin}\n` +
        `💎 *Esmeralda*: ${emerald}\n` +
        `🔩 *Hierro*: ${iron}\n` +
        `🏅 *Oro*: ${gold}\n` +
        `🪵 *Carbón*: ${coal}\n` +
        `🪨 *Piedra*: ${stone}\n` +
        `${diamond ? `💎 *Diamante*: ${diamond}\n` : ''}\n` +
        `⚒️ *Durabilidad restante de la picota*: ${isNaN(durabilityPercentage) ? 'Desconocida' : `${durabilityPercentage.toFixed(0)}%`}`;

    // Se obtienen las situaciones buenas o malas
    const evento = obtenerSituacion();
    info += `\n\n🌟 ${evento.texto}`;

    // Aplicamos las recompensas o castigos
    user.health += evento.efecto.vida || 0;
    user.coin += evento.efecto.yenes || 0;
    user.exp += evento.efecto.exp || 0;

    await conn.sendFile(m.chat, lugar.img, 'mineria.jpg', info, fkontak);
    await m.react('⛏️');

    user.health -= 50;
    user.pickaxedurability -= 30;
    user.coin += coin;
    user.iron += iron;
    user.gold += gold;
    user.emerald += emerald;
    user.coal += coal;
    user.stone += stone;
    user.diamond += diamond;
    user.lastmiming = new Date() * 1;

    if (user.pickaxedurability <= 20 && user.pickaxedurability > 0) {
        conn.reply(m.chat, '⚠️ Tu picota está a punto de romperse. Repara o compra una nueva.', m);
        await m.react('⚠️');
    }

    if (user.pickaxedurability <= 0) {
        conn.reply(m.chat, '❌ Tu picota se ha roto. Usa el comando *reparar* para arreglarla.', m);
    }
}

// Función para seleccionar un número aleatorio dentro de un rango
function pickRandomRange(range) {
    return Math.floor(Math.random() * (range[1] - range[0] + 1)) + range[0];
}

// Función para seleccionar valores aleatorios
function pickRandom(list) {
    return list[Math.floor(Math.random() * list.length)];
}

// Función para seleccionar un lugar basado en su probabilidad
function pickByProbability(items) {
    let total = items.reduce((sum, item) => sum + item.probabilidad, 0);
    let random = Math.random() * total;
    let sum = 0;

    for (let item of items) {
        sum += item.probabilidad;
        if (random < sum) return item;
    }
}

// Función para convertir milisegundos a tiempo legible
function msToTime(duration) {
    var seconds = Math.floor((duration / 1000) % 60),
        minutes = Math.floor((duration / (1000 * 60)) % 60);

    minutes = (minutes < 10) ? '0' + minutes : minutes;
    seconds = (seconds < 10) ? '0' + seconds : seconds;

    return minutes + 'm y ' + seconds + 's';
}

// Función para obtener una situación buena o mala aleatoria
function obtenerSituacion() {
    const situacionesBuenas = [
        { texto: "🎉 ¡Has encontrado un montón de monedas!", efecto: { yenes: 100 } },
        { texto: "✨ ¡Una esmeralda extra!", efecto: { yenes: 50, exp: 10 } },
        { texto: "💪 ¡Te sientes más fuerte! Has ganado un poco de salud.", efecto: { vida: 20 } },
        { texto: "🛠️ ¡Has encontrado herramientas extra! Ganaste 30 de durabilidad en tu picota.", efecto: { exp: 20 } },
        { texto: "🌟 ¡Has encontrado un cofre del tesoro!", efecto: { yenes: 150, exp: 25 } }
    ];

    const situacionesMalas = [
        { texto: "💥 ¡Un derrumbe te ha hecho daño!", efecto: { vida: -20 } },
        { texto: "⚡ ¡Un rayo te golpeó y dañó tu salud!", efecto: { vida: -30 } },
        { texto: "🔥 ¡El calor del volcán te ha dejado exhausto!", efecto: { exp: -10 } },
        { texto: "⚠️ ¡Un monstruo te atacó! Has perdido algo de salud.", efecto: { vida: -40 } },
        { texto: "⛔ ¡Te has resbalado y caíste, perdiendo algo de tiempo!", efecto: { exp: -15 } }
    ];

    const esBuena = Math.random() < 0.5;
    const situaciones = esBuena ? situacionesBuenas : situacionesMalas;
    return situaciones[Math.floor(Math.random() * situaciones.length)];
}

handler.help = ['minar'];
handler.tags = ['economy'];
handler.command = ['minar', 'miming', 'mine'];
handler.register = true;
handler.group = true;

export default handler;
