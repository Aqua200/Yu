let users = global.db.data.users; // Asegúrate de tener tu base de datos global

function obtenerRango(nivel) {
  if (nivel >= 30) return 'Leyenda del Teibol';
  if (nivel >= 20) return 'Reina del Teibol';
  if (nivel >= 10) return 'Teibolera Estrella';
  if (nivel >= 5) return 'Teibolera Junior';
  return 'Principiante';
}

// Comando .teibol
async function teibol(m, { conn }) {
  let user = users[m.sender];
  if (!user.teibol) {
    user.teibol = {
      nivel: 1,
      yenes: 0,
      exp: 0,
      lastWork: 0,
    };
  }

  let { nivel, yenes, exp } = user.teibol;
  let rango = obtenerRango(nivel);

  let perfil = `
「 *Perfil de Teibolera* 」
➤ Nivel: ${nivel}
➤ Rango: ${rango}
➤ Experiencia: ${exp}/100
➤ Yenes: ¥${yenes}
`.trim();
  
  await conn.reply(m.chat, perfil, m);
}

// Comando .trabajar
async function trabajar(m, { conn }) {
  let user = users[m.sender];
  if (!user.teibol) {
    user.teibol = {
      nivel: 1,
      yenes: 0,
      exp: 0,
      lastWork: 0,
    };
  }

  let now = Date.now();
  let cooldown = 60000; // 1 minuto en milisegundos
  if (now - user.teibol.lastWork < cooldown) {
    let tiempoRestante = Math.ceil((cooldown - (now - user.teibol.lastWork)) / 1000);
    return conn.reply(m.chat, `Debes esperar ${tiempoRestante} segundos para volver a trabajar.`, m);
  }

  let { nivel } = user.teibol;
  let yenesGanados = 100 * nivel; // A más nivel, más yenes
  user.teibol.yenes += yenesGanados;
  user.teibol.exp += 10; // Cada trabajo da 10 exp
  user.teibol.lastWork = now; // Actualiza el último trabajo

  // Subir de nivel
  if (user.teibol.exp >= 100) {
    user.teibol.exp = 0;
    user.teibol.nivel += 1;
    let nuevoRango = obtenerRango(user.teibol.nivel);
    await conn.reply(m.chat, `¡Felicidades! Subiste a *Nivel ${user.teibol.nivel}* y ahora eres *${nuevoRango}*!`, m);
  }

  await conn.reply(m.chat, `Trabajaste en el teibol y ganaste ¥${yenesGanados} yenes.`, m);
}

// Exportar comandos si usas handler
handler.command = /^teibol$/i;
handler.teibol = teibol;

handler2.command = /^trabajar$/i;
handler2.trabajar = trabajar;

export { teibol, trabajar };
