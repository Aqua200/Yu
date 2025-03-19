import { readdir, unlink, stat, rmdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

const handler = async (m, { conn }) => {
    const emojiOk = '✅';
    const emojiGear = '⚙️';
    const emojiWarn = '⚠️';
    const emojiWait = '⏳';
    const emojiDone = '🎉';

    if (global.conn.user.jid !== conn.user.jid) {
        return conn.reply(m.chat, `${emojiWarn} Este comando solo puede ejecutarlo el número principal del bot.`, m);
    }

    await conn.reply(m.chat, `${emojiGear} Iniciando limpieza de sesiones, excepto *creds.json*...`, m);
    m.react(emojiWait);

    const sessionPath = path.resolve(process.cwd(), 'sessions');

    if (!existsSync(sessionPath)) {
        await m.react(emojiWarn);
        return await conn.reply(m.chat, `${emojiWarn} La carpeta *sessions* no existe o ya está vacía.`, m);
    }

    let filesDeleted = 0;
    let foldersDeleted = 0;

    try {
        const files = await readdir(sessionPath);

        if (files.length === 0) {
            await m.react(emojiOk);
            return conn.reply(m.chat, `${emojiOk} La carpeta *sessions* ya estaba vacía.`, m);
        }

        for (const file of files) {
            if (file !== 'creds.json') {
                const fullPath = path.join(sessionPath, file);
                try {
                    const stats = await stat(fullPath);
                    if (stats.isDirectory()) {
                        await deleteFolderRecursive(fullPath);
                        foldersDeleted++;
                        console.log(`Carpeta eliminada: ${file}`);
                    } else {
                        await unlink(fullPath);
                        filesDeleted++;
                        console.log(`Archivo eliminado: ${file}`);
                    }
                } catch (err) {
                    console.error(`Error al eliminar ${file}:`, err);
                    await conn.reply(m.chat, `${emojiWarn} No se pudo eliminar: ${file}`, m);
                }
            }
        }

        const resultado = `*Resumen:*\n\n${emojiOk} Archivos eliminados: *${filesDeleted}*\n${emojiOk} Carpetas eliminadas: *${foldersDeleted}*\n\n${emojiDone} Limpieza finalizada correctamente.`;

        if (filesDeleted > 0 || foldersDeleted > 0) {
            await m.react(emojiOk);
            await conn.reply(m.chat, resultado, m);
            await conn.reply(m.chat, `*¡Hola! ¿logras verme?*\n${emojiDone} Sesiones limpias.`, m);
        } else {
            await conn.reply(m.chat, `${emojiOk} No se encontraron archivos o carpetas para eliminar.`, m);
        }

    } catch (err) {
        console.error('Error general durante la limpieza:', err);
        await conn.reply(m.chat, `${emojiWarn} Ocurrió un error inesperado durante el proceso.`, m);
    }
};

async function deleteFolderRecursive(folderPath) {
    try {
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
    } catch (error) {
        console.error(`Error eliminando la carpeta: ${folderPath}`, error);
        throw error;
    }
}

handler.help = ['dsowner'];
handler.tags = ['owner'];
handler.command = ['delai', 'dsowner', 'clearallsession'];
handler.rowner = true;

export default handler;
