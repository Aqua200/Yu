import { promises as fs } from 'fs';
import path from 'path';

const charactersFilePath = path.resolve('./src/database/characters.json');
const haremFilePath = path.resolve('./src/database/harem.json');

// Función genérica para cargar archivos JSON
async function loadJsonFile(filePath, defaultReturn = []) {
    try {
        await fs.access(filePath); // Verifica que el archivo existe
        const data = await fs.readFile(filePath, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        if (defaultReturn !== undefined) return defaultReturn;
        throw new Error(`No se pudo cargar el archivo ${path.basename(filePath)}: ${error.message}`);
    }
}

// Función mejorada para normalizar el ID
function normalizeId(userId) {
    if (!userId || typeof userId !== 'string') return null;
    return userId.split('@')[0].trim(); // Extrae solo la parte antes del @ y elimina espacios
}

// Valida y formatea los personajes
function validateAndFormatCharacters(characters) {
    if (!Array.isArray(characters)) return [];
    
    return characters.map(character => {
        // Asegura que cada personaje tenga al menos estos campos con valores por defecto
        return {
            name: character.name || 'Desconocido',
            value: character.value || 0,
            user: normalizeId(character.user) || '',
            ...character // Spread operator para mantener otras propiedades
        };
    }).filter(character => character.user); // Filtra personajes sin usuario válido
}

let handler = async (m, { conn, args }) => {
    try {
        // Carga los datos con manejo de errores incorporado
        const characters = validateAndFormatCharacters(await loadJsonFile(charactersFilePath, []));
        const harem = await loadJsonFile(haremFilePath, []);

        // Determina el usuario objetivo
        let userId;
        if (m.quoted?.sender) {
            userId = normalizeId(m.quoted.sender);
        } else if (args[0]?.startsWith('@')) {
            userId = normalizeId(args[0].slice(1)); // Elimina el @ directamente
        } else {
            userId = normalizeId(m.sender);
        }

        // Verificación robusta del userId
        if (!userId || typeof userId !== 'string' || userId.length > 20) {
            return await conn.reply(m.chat, '❀ No se pudo identificar al usuario correctamente.', m);
        }

        // Filtra personajes del usuario
        const userCharacters = characters.filter(character => character.user === userId);

        if (!userCharacters.length) {
            return await conn.reply(m.chat, '❀ No tienes personajes reclamados en tu harem.', m);
        }

        // Manejo de paginación con validaciones
        const page = Math.max(1, parseInt(args[1]) || 1);
        const charactersPerPage = 50;
        const totalCharacters = userCharacters.length;
        const totalPages = Math.ceil(totalCharacters / charactersPerPage);
        
        if (page > totalPages) {
            return await conn.reply(m.chat, 
                `❀ Página no válida. Hay un total de ${totalPages} página(s).`, m);
        }

        const startIndex = (page - 1) * charactersPerPage;
        const endIndex = Math.min(startIndex + charactersPerPage, totalCharacters);

        // Construcción del mensaje
        let message = `✿ Personajes reclamados ✿\n`;
        message += `⌦ Usuario: @${userId}\n`;
        message += `♡ Total: ${totalCharacters}\n\n`;

        // Agrega personajes paginados
        userCharacters.slice(startIndex, endIndex).forEach(character => {
            message += `» ${character.name} (${character.value})\n`;
        });

        message += `\n⌦ Página ${page} de ${totalPages}`;

        // Envía el mensaje con mención
        await conn.reply(m.chat, message, m, { 
            mentions: [userId + '@s.whatsapp.net'] 
        });

    } catch (error) {
        console.error('Error en handler harem:', error);
        await conn.reply(m.chat, 
            `✘ Ocurrió un error: ${error.message || 'Error desconocido'}\nPor favor intenta más tarde.`, 
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
