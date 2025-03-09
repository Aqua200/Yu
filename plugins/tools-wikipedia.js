import axios from 'axios'
import cheerio from 'cheerio'

let handler = async (m, { text }) => {
    if (!text) return m.reply('⚠️ Ingresa lo que quieres buscar en Wikipedia.')

    try {
        // Reemplazar espacios con guiones bajos para que sea compatible con URLs de Wikipedia
        let query = encodeURIComponent(text.replace(/\s+/g, '_'))
        let { data } = await axios.get(`https://es.wikipedia.org/wiki/${query}`)

        let $ = cheerio.load(data)
        let wik = $('#firstHeading').text().trim()
        let resulw = $('#mw-content-text > div.mw-parser-output').find('p').first().text().trim()

        if (!resulw) throw new Error('No se encontraron resultados relevantes.')

        m.reply(`▢ *Wikipedia*\n\n‣ Buscado: ${wik}\n\n${resulw}`)
    } catch (e) {
        m.reply('❌ No se encontraron resultados o hubo un error.')
    }
}

handler.help = ['wikipedia']
handler.tags = ['tools']
handler.command = ['wiki', 'wikipedia']

export default handler
