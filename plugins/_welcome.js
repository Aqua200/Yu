conn.ev.on('group-participants.update', async (update) => {
  const { id, participants, action } = update
  for (const user of participants) {
    let pp = await conn.profilePictureUrl(user, 'image').catch(() => 'https://files.catbox.moe/xr2m6u.jpg')
    const img = await (await fetch(pp)).buffer()
    const taguser = `@${user.split('@')[0]}`
    const metadata = await conn.groupMetadata(id)
    if (action === 'add') {
      const bienvenida = `❀ *Bienvenido* a ${metadata.subject}\n✰ ${taguser}\n${global.welcom1}\n •(=^●ω●^=)• ¡Disfruta tu estadía!\n> ✐ Usa *#help* para comandos.`
      await conn.sendMessage(id, { image: img, caption: bienvenida, mentions: [user] })
    } else if (action === 'remove') {
      const despedida = `❀ *Adiós* de ${metadata.subject}\n✰ ${taguser}\n${global.welcom2}\n •(=^●ω●^=)• ¡Te esperamos pronto!\n> ✐ Usa *#help* para comandos.`
      await conn.sendMessage(id, { image: img, caption: despedida, mentions: [user] })
    }
  }
})
