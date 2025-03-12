let handler = async (m, { conn }) => {
    let changelog = `
*✦ 𝐂𝐇𝐀𝐍𝐆𝐄𝐋𝐎𝐆 ✦*

[ ✅ ] Comando agregado para cerrar la conexión de los subbots (*close*)
[ 🔄 ] Se nerfeó el dinero que se gana al ganar (-80%) (*ppt*)
[ 🔄 ] Ahora puedes revisar el perfil de cualquier usuario junto a su inventario RPG (*profile*)
[ 🔄 ] Ahora puedes renombrar tus objetos (*rename*)
[ 🔄 ] Ahora puedes reparar tus objetos (*repair*)
[ ✅ ] Comando funcional nuevamente (*serbot*)
[ ✅ ] Ahora puedes mejorar tu armamento (*upgrade*)
[ 🔄 ] Ahora el trabajo de minero da menos dinero y más materiales (+20%) (*work*)
    `.trim();

    conn.reply(m.chat, changelog, m);
}

handler.help = ['changelog'];
handler.tags = ['info'];
handler.command = ['changelog'];

export default handler;
