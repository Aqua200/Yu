export async function handler(m) {
  const changelog = `*✦ 𝐂𝐇𝐀𝐍𝐆𝐄𝐋𝐎𝐆 ✦*\n
[ ✅ ] Comando agregado para cerrar la conexión de los subbots (*close*)
[ 🔄 ] Se nerfeó el dinero que se gana al ganar (-80%) (*ppt*)
[ 🔄 ] Ahora puedes revisar el perfil de cualquier usuario junto a su inventario RPG (*profile*)
[ 🔄 ] Ahora puedes renombrar tus objetos (*rename*)
[ 🔄 ] Ahora puedes reparar tus objetos (*repair*)
[ ✅ ] Comando funcional nuevamente (*serbot*)
[ ✅ ] Ahora puedes mejorar tu armamento (*upgrade*)
[ 🔄 ] Ahora el trabajo de minero da menos dinero y más materiales (+20%) (*work*)`;

  m.reply(changelog);
}

handler.command = /^changelog$/i;

export default handler;
