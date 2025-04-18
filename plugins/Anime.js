import fetch from 'node-fetch'

// Función para traducir texto usando Google Translate (API no oficial)
async function translateText(text, targetLang = 'es') {
  try {
    const response = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`)
    const data = await response.json()
    return data[0][0][0]
  } catch (e) {
    console.error('Error en traducción:', e)
    return text // Devuelve el texto original si falla la traducción
  }
}

var handler = async (m, { conn, usedPrefix, command, text }) => {
  if (!text) return conn.reply(m.chat, `💣 *Ingrese el nombre de algún anime o manga*\n\nEjemplo: ${usedPrefix + command} Tokyo Revengers`, m, rcanal)
  
  try {
    // Buscar el manga/anime
    let res = await fetch('https://api.jikan.moe/v4/manga?q=' + encodeURIComponent(text))
    if (!res.ok) return conn.reply(m.chat, `❌ *Ocurrió un error al buscar el anime/manga*`, m, rcanal)

    let json = await res.json()
    if (!json.data || json.data.length === 0) return conn.reply(m.chat, `❌ *No se encontraron resultados*`, m, rcanal)

    let { 
      chapters, 
      title, 
      title_japanese, 
      title_english, 
      url, 
      type, 
      score, 
      members, 
      background, 
      status, 
      volumes, 
      synopsis, 
      favorites 
    } = json.data[0]
    
    let author = json.data[0].authors[0]?.name || 'Desconocido'
    
    // Traducir campos importantes
    const [translatedSynopsis, translatedBackground, translatedType, translatedStatus] = await Promise.all([
      synopsis ? translateText(synopsis) : 'No disponible',
      background ? translateText(background) : 'No disponible',
      translateText(type || 'Unknown'),
      translateText(status || 'Unknown')
    ])

    // Usar el título en inglés si está disponible, si no usar el japonés
    const displayTitle = title_english || title_japanese || title
    
    let animeInfo = `💣 *INFORMACIÓN DEL ANIME/MANGA* 💣

🎌 *Título:* ${displayTitle}
🇯🇵 *Título japonés:* ${title_japanese || 'Desconocido'}

📖 *Capítulos:* ${chapters || 'Desconocido'}
📚 *Tipo:* ${translatedType}
🗓 *Estado:* ${translatedStatus}
📦 *Volúmenes:* ${volumes || 'Desconocido'}

⭐ *Favoritos:* ${favorites || 'Desconocido'}
💯 *Puntuación:* ${score || 'Sin puntuación'}
👥 *Miembros:* ${members || 'Desconocido'}

✍️ *Autor:* ${author}
🔗 *URL:* ${url}

📜 *Sinopsis:* 
${translatedSynopsis}

${background ? `\n📌 *Contexto:*\n${translatedBackground}` : ''}
` 

    // Enviar la imagen con la información
    await conn.sendFile(m.chat, json.data[0].images.jpg.image_url, 'anime.jpg', animeInfo, fkontak, m)
    
  } catch (error) {
    console.error('Error en handler:', error)
    conn.reply(m.chat, `❌ *Ocurrió un error al procesar tu solicitud*`, m, rcanal)
  }
} 

handler.help = ['infoanime <nombre>'] 
handler.tags = ['anime'] 
handler.register = true
handler.command = ['infoanime','animeinfo'] 

export default handler
