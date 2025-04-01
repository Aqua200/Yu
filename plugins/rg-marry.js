import fs from 'fs';

const dbPath = './database/matrimonios.json'; if (!fs.existsSync(dbPath)) fs.writeFileSync(dbPath, '{}'); let matrimonios = JSON.parse(fs.readFileSync(dbPath));

function guardarDB() { fs.writeFileSync(dbPath, JSON.stringify(matrimonios, null, 2)); }

export async function handleMarriage(m, { text, sender, mentionedJid }) { if (!text) return m.reply('Etiqueta a la persona con quien quieres casarte.');

const pareja = mentionedJid[0];
if (!pareja) return m.reply('Debes etiquetar a alguien.');
if (pareja === sender) return m.reply('No puedes casarte contigo mismo.');

if (matrimonios[sender]) return m.reply('Ya estás casado.');
if (matrimonios[pareja]) return m.reply('Esa persona ya está casada.');

matrimonios[sender] = pareja;
matrimonios[pareja] = sender;
guardarDB();
m.reply(`¡Felicidades! 💍 ${m.senderName} y ${text} ahora están casados.`);

}

export async function handleCheckMarriage(m, { sender }) { if (!matrimonios[sender]) return m.reply('No estás casado aún.'); m.reply(Tu pareja es @${matrimonios[sender].split('@')[0]}); }

export async function handleDivorce(m, { sender }) { if (!matrimonios[sender]) return m.reply('No estás casado.');

const exPareja = matrimonios[sender];
delete matrimonios[sender];
delete matrimonios[exPareja];
guardarDB();

m.reply('Te has divorciado con éxito. 😢');

}

