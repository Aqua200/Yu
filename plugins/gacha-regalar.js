import { promises as fs } from 'fs';
import path from 'path';

const charactersFilePath = path.resolve('./src/database/characters.json');
const haremFilePath = path.resolve('./src/database/harem.json');

// Función mejorada para cargar personajes
async function loadCharacters() {
    try {
        const data = await fs.readFile(charactersFilePath, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        if (error.code === 'ENOENT') {
            // Si el archivo no existe, crea uno vacío
            await fs.writeFile(charactersFilePath, '[]', 'utf-8');
            return [];
        }
        console.error('Error loading characters:', error);
        throw new Error('No se pudo cargar el archivo characters.json.');
    }
}

// Función para guardar personajes con verificación de datos
async function saveCharacters(characters) {
    try {
        if (!Array.isArray(characters)) {
            throw new Error('Datos de personajes no válidos');
        }
        await fs.writeFile(charactersFilePath, JSON.stringify(characters, null, 2), 'utf-8');
    } catch (error) {
        console.error('Error saving characters:', error);
        throw new Error('❀ No se pudo guardar el archivo characters.json.');
    }
}

// Función mejorada para cargar harem
async function loadHarem() {
    try {
        const data = await fs.readFile(haremFilePath, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        if (error.code === 'ENOENT') {
            // Si el archivo no existe, crea uno vacío
            await fs.writeFile(haremFilePath, '[]', 'utf-8');
            return [];
        }
        console.error('Error loading harem:', error);
        return [];
    }
}

// Función para guardar harem con verificación de datos
async function saveHarem(harem) {
    try {
        if (!Array.isArray(harem)) {
            throw new Error('Datos de harem no válidos');
        }
        await fs.writeFile(haremFilePath, JSON.stringify(harem, null, 2), 'utf-8');
    } catch (error) {
        console.error('Error saving harem:', error);
        throw new Error('❀ No se pudo guardar el archivo harem.json.');
    }
}

let handler = async (m, { conn, args }) => {
    try {
        const userId = m.sender;

        if (args.length < 2) {
            return await conn.reply(m.chat, '《✧》Debes especificar el nombre del personaje y mencionar a quien quieras regalarlo.', m);
        }

        const characterName = args.slice(0, -1).join(' ').toLowerCase().trim();
        const mentionedUser = args[args.length - 1].trim();

        if (!mentionedUser.startsWith('@')) {
            return await conn.reply(m.chat, '《✧》Debes mencionar a un usuario válido (ejemplo: @usuario).', m);
        }

        const targetUserId = mentionedUser.replace('@', '');
        
        // Verificar que no sea auto-regalo
        if (targetUserId === userId) {
            return await conn.reply(m.chat, '《✧》No puedes regalarte un personaje a ti mismo.', m);
        }

        const characters = await loadCharacters();
        const characterIndex = characters.findIndex(c => 
            c.name.toLowerCase() === characterName && c.user === userId
        );

        if (characterIndex === -1) {
            return await conn.reply(m.chat, `《✧》No tienes un personaje llamado *${characterName}* o ya no está en tu posesión.`, m);
        }

        // Actualizar dueño del personaje
        characters[characterIndex].user = targetUserId;
        await saveCharacters(characters);

        // Actualizar harem
        const harem = await loadHarem();
        
        // Eliminar entrada anterior si existe
        const existingEntryIndex = harem.findIndex(entry => 
            entry.characterId === characters[characterIndex].id && entry.userId === userId
        );
        
        if (existingEntryIndex !== -1) {
            harem.splice(existingEntryIndex, 1);
        }

        // Añadir nueva entrada
        harem.push({
            userId: targetUserId,
            characterId: characters[characterIndex].id,
            lastClaimTime: Date.now()
        });

        await saveHarem(harem);

        await conn.reply(m.chat, `✰ *${characters[characterIndex].name}* ha sido regalado a ${mentionedUser} con éxito!`, m);
    } catch (error) {
        console.error('Error in handler:', error);
        await conn.reply(m.chat, `✘ Ocurrió un error inesperado: ${error.message}`, m);
    }
};

handler.help = ['regalar <nombre del personaje> @usuario'];
handler.tags = ['anime'];
handler.command = ['regalar', 'givewaifu', 'givechar'];
handler.group = true;
handler.register = true;

export default handler;
