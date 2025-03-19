import { readdirSync, unlinkSync, existsSync, promises as fs, rmSync } from 'fs';
import path from 'path';

var handler = async (m, { conn, usedPrefix }) => {
    const emoji = '✅';  // Definir los emojis
    const emoji2 = '⚙️';
    const msm = '⚠️';

    // Verificar que el comando se ejecute en el número principal del Bot
    if (global.conn.user.jid !== conn.user.jid) {
        return conn.reply(m.chat, `${emoji} Utiliza este comando directamente en el número principal del Bot.`, m);
    }

    // Informar al usuario sobre el inicio del proceso
    await conn.reply(m.chat, `${emoji2} Iniciando proceso de eliminación de todos los archivos de sesión, excepto el archivo creds.json...`, m);
    m.react('⏳');  // Indicador de proceso en espera

    // Obtener la ruta de la carpeta de sesiones
    let sessionPath = path.join(process.cwd(), 'sessions');  // Usar la ruta absoluta del directorio de trabajo

    try {
        // Verificar si la carpeta de sesiones existe
        if (!existsSync(sessionPath)) {
            return await conn.reply(m.chat, `${emoji} La carpeta está vacía o no existe.`, m);
        }

        // Leer los archivos de la carpeta de sesiones
        let files = await fs.readdir(sessionPath);
        let filesDeleted = 0;

        // Eliminar archivos que no sean 'creds.json'
        for (const file of files) {
            if (file !== 'creds.json') {
                try {
                    await fs.unlink(path.join(sessionPath, file));  // Eliminar archivo
                    filesDeleted++;
                } catch (err) {
                    console.error('Error al eliminar el archivo:', err);
                    await conn.reply(m.chat, `${msm} No se pudo eliminar el archivo: ${file}`, m);
                }
            }
        }

        // Informar si se eliminaron archivos
        if (filesDeleted === 0) {
            await conn.reply(m.chat, `${emoji2} No se encontraron archivos para eliminar, o la carpeta está vacía.`, m);
        } else {
            m.react('✅');  // Indicador de proceso completado
            await conn.reply(m.chat, `${emoji} Se eliminaron ${filesDeleted} archivos de sesión, excepto el archivo creds.json.`, m);
            conn.reply(m.chat, `${emoji} *¡Hola! ¿logras verme?*`, m);
        }
    } catch (err) {
        // Manejar errores generales
        console.error('Error al leer la carpeta o los archivos de sesión:', err);
        await conn.reply(m.chat, `${msm} Ocurrió un fallo durante el proceso.`, m);
    }
};

handler.help = ['dsowner'];
handler.tags = ['owner'];
handler.command = ['delai', 'dsowner', 'clearallsession'];
handler.rowner = true;

export default handler;
