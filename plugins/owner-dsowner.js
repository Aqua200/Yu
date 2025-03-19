import { readdir, unlink, stat, rmdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

const handler = async (m, { conn }) => {
    const emojiOk = '✅';
    const emojiGear = '⚙️';
    const emojiWarn = '⚠️';
    const emojiWait = '⏳';

    if (global.conn.user.jid !== conn.user.jid) {
        return conn.reply(m.chat, `${emojiOk} Usa este comando directamente desde el número principal del bot.`, m);
    }

    await conn.reply(m.chat, `${emojiGear} Iniciando limpieza de sesiones, excepto *creds.json*...`, m);
    m.react(emojiWait);

    const sessionPath = path.resolve(process.cwd(), 'sessions');

    if (!existsSync(sessionPath)) {
        return await conn.reply(m.chat, `${emojiOk} La carpeta *sessions* no existe o ya está vacía.`, m);
    }

    let filesDeleted = 0;

    try {
        const files = await readdir(sessionPath);

        if (files.length === 0) {
            return conn.reply(m.chat, `${emojiOk} La carpeta *sessions* está vacía.`, m);
        }

        for (const file of files) {
            if (file !== 'creds.json') {
                const fullPath = path.join(sessionPath, file);
                try {
                    const stats = await stat(fullPath);
                    if (stats.isDirectory()) {
                        await deleteFolderRecursive(fullPath);
                    } else {
                        await unlink(fullPath);
                    }
                    filesDeleted++;
                } catch (err) {
                    console.error(`Error al eliminar ${file}:`, err);
                    await conn.reply(m.chat, `${emojiWarn} No se pudo eliminar: ${file}`, m);
                }
            }
        }

        if (filesDeleted > 0) {
            m.react(emojiOk);
            await conn.reply(m.chat, `${emojiOk} Se eliminaron *${filesDeleted}* archivos de sesión (excepto *creds.json*).`, m);
            await conn.reply(m.chat, `${emojiOk} *¡Hola! ¿logras verme?*`, m);
        } else {
            await conn.reply(m.chat, `${emojiOk} No se encontraron archivos para eliminar.`, m);
        }

    } catch (err) {
        console.error('Error en el proceso de limpieza:', err);
        await conn.reply(m.chat, `${emojiWarn} Ocurrió un error inesperado.`, m);
    }
};

// Función para eliminar carpetas recursivamente
async function deleteFolderRecursive(folderPath) {
    const entries = await readdir(folderPath, { withFileTypes: true });
    for (const entry of entries) {
        const fullPath = path.join(folderPath, entry.name);
        if (entry.isDirectory()) {
            await deleteFolderRecursive(fullPath);
        } else {
            await unlink(fullPath);
        }
    }
    await rmdir(folderPath);
}

handler.help = ['dsowner'];
handler.tags = ['owner'];
handler.command = ['delai', 'dsowner', 'clearallsession'];
handler.rowner = true;

export default handler;
