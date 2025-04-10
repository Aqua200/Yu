import { xpRange } from '../lib/levelling.js';
const cooldownTeibol = {};

const handler = async (m, { conn, usedPrefix }) => {
  const user = global.db.data.users[m.sender];
  const tiempoDeEspera = 600000; // 10 minutos
  const antes = cooldownTeibol[m.sender] || 0;
  const ahora = Date.now();

  if (ahora - antes < tiempoDeEspera) {
    const falta = ((tiempoDeEspera - (ahora - antes)) / 60000).toFixed(1);
    return m.reply(`Debes esperar ${falta} minutos para trabajar de nuevo.`);
  }

  // Random de yenes ganados
  const yenesGanados = Math.floor(Math.random() * 500) + 100; // entre 100 y 599 yenes

  // Mensaje de éxito
  m.reply(`¡Buen trabajo! Ganaste ¥${yenesGanados} en el teibol.`);

  // Suma yenes y aumenta contador de trabajos
  user.yenes += yenesGanados;
  user.vecesTrabajado++;

  // Actualiza cooldown
  cooldownTeibol[m.sender] = ahora;

  // Guarda cambios en la base de datos
  global.db.data.users[m.sender] = user;
  await global.db.write();
};

handler.command = ['trabajoteibol', 'teibol'];
export default handler;
