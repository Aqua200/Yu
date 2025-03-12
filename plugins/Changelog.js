let handler = async (m, { conn }) => {
    let changelog = `
*✦ 𝐂𝐇𝐀𝐍𝐆𝐄𝐋𝐎𝐆 ✦*

[ ✅ ] Comando agregado para agregar más sub (*5*)
[ 🔄 ] próxima update en rpg (-80%) (*ppt*)
[ 🔄 ] pon .profile para ver tu perfil  (*.profile*)
[ 🔄 ] próxima update  (*soon*)
[ 🔄 ] Ahora puedes reparar tu pico (*.reparar*)
[ ✅ ] Comando funcional nuevamente (*serbot*)
[ ✅ ] Ahora puedes mejorar tu armamento (*soon*)
[ 🔄 ] Ahora el trabajo de minero da menos dinero y más materiales (+20%) (*work*)
    `.trim();

    conn.reply(m.chat, changelog, m);
}

handler.help = ['changelog'];
handler.tags = ['info'];
handler.command = ['changelog'];

export default handler;
