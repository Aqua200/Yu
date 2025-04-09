import { promises as fs } from 'fs';
import path from 'path';

const charactersFilePath = path.resolve('./src/database/characters.json');
const haremFilePath = path.resolve('./src/database/harem.json');

async function loadJsonFile(filePath, defaultReturn = []) {
    try {
        await fs.access(filePath);
        const data = await fs.readFile(filePath, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        console.error(`Error loading ${path.basename(filePath)}:`, error);
        return defaultReturn;
    }
}

function normalizeId(userId) {
    if (!userId || typeof userId !== 'string') return null;
    return userId.split('@')[0].trim();
}

function validateAndFormatCharacters(characters) {
    if (!Array.isArray(characters)) return [];
    
    return characters.map(character => ({
        name: character.name || 'Desconocido',
        value: character.value || 0,
        user: normalizeId(character.user) || '',
        isGifted: character.isGifted || false,
        originalUser: normalizeId(character.originalUser) || null,
        ...character
    }));
}

let handler = async (m, { conn, args }) => {
    try {
        const allCharacters = validateAndFormatCharacters(await loadJsonFile(charactersFilePath, []));
        const harem = await loadJsonFile(haremFilePath, []);
        
        const userId = normalizeId(
            m.quoted?.sender || 
            (args[0]?.startsWith('@') ? args[0].slice(1) : m.sender)
        );

        if (!userId) {
            return await conn.reply(m.chat, '❀ No se pudo identificar al usuario.', m);
        }

        // CORRECCIÓN PRINCIPAL: Filtrado correcto de todos los personajes
        const userCharacters = allCharacters.filter(c => {
            // Personajes reclamados directamente
            if (c.user === userId && !c.isGifted) return true;
            // Personajes regalados (recibidos)
            if (c.isGifted && c.user === userId) return true;
            // Personajes regalados (enviados - si quieres mostrarlos)
            // if (c.isGifted && c.originalUser === userId) return true;
            return false;
        });

        // Estadísticas precisas
        const totalClaimed = allCharacters.filter(c => c.user === userId && !c.isGifted).length;
        const totalGiftedReceived = allCharacters.filter(c => c.isGifted && c.user === userId).length;
        const totalInHarem = userCharacters.length;

        // Verificación de consistencia
        if (totalClaimed + totalGiftedReceived !== totalInHarem) {
            console.warn('Advertencia: El total no coincide con la suma de reclamados y regalados');
        }

        if (totalInHarem === 0) {
            return await conn.reply(m.chat, '❀ No tienes personajes en tu harem.', m);
        }

        const page = Math.max(1, parseInt(args[1]) || 1);
        const charactersPerPage = 50;
        const totalPages = Math.ceil(totalInHarem / charactersPerPage);
        
        if (page > totalPages && totalPages > 0) {
            return await conn.reply(m.chat, 
                `❀ Página no válida. Hay un total de ${totalPages} página(s).`, m);
        }

        const startIndex = (page - 1) * charactersPerPage;
        const endIndex = Math.min(startIndex + charactersPerPage, totalInHarem);

        let message = `✿ ESTADÍSTICAS DEL HAREM ✿\n`;
        message += `⌦ Usuario: @${userId}\n`;
        message += `♡ Reclamados: ${totalClaimed} | Regalados recibidos: ${totalGiftedReceived}\n`;
        message += `♡ Total en harem: ${totalInHarem}\n\n`;
        message += `✿ LISTA DE PERSONAJES ✿\n\n`;

        userCharacters.slice(startIndex, endIndex).forEach((character, index) => {
            const position = startIndex + index + 1;
            const giftTag = character.isGifted ? ' (Regalado)' : '';
            message += `» ${position}. ${character.name} (${character.value})${giftTag}\n`;
        });

        if (totalPages > 1) {
            message += `\n⌦ Página ${page} de ${totalPages}`;
        }

        await conn.reply(m.chat, message, m, {
            mentions: [userId + '@s.whatsapp.net']
        });

    } catch (error) {
        console.error('Error en handler harem:', error);
        await conn.reply(m.chat, 
            `✘ Error al cargar el harem: ${error.message || 'Error desconocido'}`, 
            m
        );
    }
};

handler.help = ['harem [@usuario] [página]'];
handler.tags = ['anime'];
handler.command = ['harem', 'claims', 'waifus'];
handler.group = true;
handler.register = true;

export default handler;
