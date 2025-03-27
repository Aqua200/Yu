const fetch = require('node-fetch');

let handler = async (m, { conn, args }) => {
    let text = args.join(" ");
    if (!text) throw "⚠️ Ingresa un texto para buscar en Pinterest.";

    try {
        let response = await fetch(`https://api.lolhuman.xyz/api/pinterest?apikey=TuApiKey&query=${encodeURIComponent(text)}`);
        let data = await response.json();

        if (data.status !== 200) throw "⚠️ No se encontraron imágenes o hubo un problema con la API.";

        let imageUrl = data.result[Math.floor(Math.random() * data.result.length)]; // Selecciona una imagen aleatoria
        conn.sendFile(m.chat, imageUrl, 'pinterest.jpg', `🔎 Resultado de: ${text}`, m);
    } catch (error) {
        console.error(error);
        throw "⚠️ Error al obtener imágenes. Revisa tu API Key o intenta más tarde.";
    }
};

handler.command = ['pinterest'];
export default handler;
