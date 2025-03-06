const linkRegex = /chat.whatsapp.com\/(?:invite\/)?([0-9A-Za-z]{20,24})/i

export async function before(m, { conn, isAdmin, isBotAdmin }) {
    if (m.isBaileys && m.fromMe) return !0
    if (!m.isGroup) return !1
    
    let chat = global.db?.data?.chats?.[m.chat] || {}
    let bot = global.db?.data?.settings?.[conn.user.jid] || {}
    const isGroupLink = linkRegex.exec(m.text)

    if (chat.antiLink && isGroupLink && !isAdmin) {
        if (isBotAdmin) {
            const linkThisGroup = `https://chat.whatsapp.com/${await conn.groupInviteCode(m.chat)}`
            if (m.text.includes(linkThisGroup)) return !0
        }
        
        await conn.reply(
            m.chat, 
            `𓂃 𓈒 𓏸✿ 𝑨𝒉... gomen~ 🫧 pero no se pueden compartir enlaces de otros grupos aquí, *${m.sender.split('@')[0]}-chan*... ( •́ㅿ•̀ ) 💔

            𝑬𝒉... tendrás que irte... ${isBotAdmin ? 'G-Gomenasai... 😖💞' : '\n\nUhm... demo... no soy admin, así que no puedo hacer nada... (｡>﹏<｡)'} `, 
            null, 
            { mentions: [m.sender] }
        )
        
        if (isBotAdmin && chat.antiLink) {
            await conn.sendMessage(m.chat, { delete: m.key })
            await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove')
        } else if (!chat.antiLink) return 
    }
    return !0
}
