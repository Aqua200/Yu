import PhoneNumber from 'awesome-phonenumber';

const suittag = '5216631079388'; // Número del owner
const botname = '𝑁𝑖𝑒𝑅: 𝐴𝑢𝑡𝑜𝑚𝑎𝑡𝑎 𝟸𝐵'; // Nombre del bot
const packname = '𝑁𝑖𝑒𝑅: 𝐴𝑢𝑡𝑜𝑚𝑎𝑡𝑎 𝟸𝐵';
const dev = 'Desarrollador: Neykoor💜';
const correo = 'chiquepapa@gmail.com'; // Cambia esto por tu correo
const md = 'https://github.com/Yu'; // URL del proyecto
const channel = 'https://youtube.com/Yu'; // URL del canal

let handler = async (m, { conn }) => {
  m.react?.('🤍'); // Asegura que m.react exista antes de usarlo

  let who = m.mentionedJid && m.mentionedJid[0] 
    ? m.mentionedJid[0] 
    : m.fromMe 
      ? conn.user.jid 
      : m.sender;

  let pp = await conn.profilePictureUrl(who).catch(_ => 'https://qu.ax/PRgfc.jpg');
  
  let biografia = await conn.fetchStatus(`${suittag}@s.whatsapp.net`).catch(_ => ({ status: 'Sin Biografía' }));
  let biografiaBot = await conn.fetchStatus(`${conn.user.jid.split('@')[0]}@s.whatsapp.net`).catch(_ => ({ status: 'Sin Biografía' }));

  let bio = biografia?.status?.toString() || 'Sin Biografía';
  let biobot = biografiaBot?.status?.toString() || 'Sin Biografía';
  let name = await conn.getName(who);

  await sendContactArray(conn, m.chat, [
    [`${suittag}`, `ᰔᩚ Propietario`, botname, `❀ No Hacer Spam`, correo, `⊹˚• Mexico •˚⊹`, md, bio],
    [`${conn.user.jid.split('@')[0]}`, `✦ Es Un Bot`, packname, dev, correo, `Mexicana 🖤`, channel, biobot]
  ], m);
}

handler.help = ["creador", "owner"];
handler.tags = ["info"];
handler.command = ['owner', 'creator', 'creador', 'dueño'];

export default handler;

async function sendContactArray(conn, jid, data, quoted, options) {
  if (!Array.isArray(data[0]) && typeof data[0] === 'string') data = [data];
  let contacts = [];
  for (let [number, name, isi, isi1, isi2, isi3, isi4, isi5] of data) {
    number = number.replace(/[^0-9]/g, '');
    let njid = number + '@s.whatsapp.net';
    let vcard = `
BEGIN:VCARD
VERSION:3.0
N:;${name.replace(/\n/g, '\\n')};;;
FN:${name.replace(/\n/g, '\\n')}
item.ORG:${isi}
item1.TEL;waid=${number}:${new PhoneNumber('+' + number).getNumber('international')}
item1.X-ABLabel:${isi1}
item2.EMAIL;type=INTERNET:${isi2}
item2.X-ABLabel:Email
item3.ADR:;;${isi3};;;;
item3.X-ABADR:ac
item3.X-ABLabel:Region
item4.URL:${isi4}
item4.X-ABLabel:Website
item5.X-ABLabel:${isi5}
END:VCARD`.trim();
    contacts.push({ vcard, displayName: name });
  }
  return await conn.sendMessage(jid, {
    contacts: {
      displayName: contacts.length > 1 ? `Contactos` : contacts[0].displayName,
      contacts,
    }
  }, {
    quoted,
    ...options
  });
}
