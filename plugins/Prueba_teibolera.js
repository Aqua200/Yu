import rangosTeibol from '../lib/rangos-teibol.js';
import { obtenerTopTeibol } from '../lib/top-teibol.js';

const cooldownTrabajo = 2 * 60 * 60 * 1000; // 2 horas en milisegundos

const handler = async (m, { conn, usedPrefix, command }) => {
    try {
        // Verificar si es grupo (si lo requieres)
        // if (!m.isGroup) return m.reply('*⚠️ Este comando solo funciona en grupos*');
        
        // Inicializar usuario
        const user = global.db.data.users[m.sender] || (global.db.data.users[m.sender] = {
            yenes: 0,
            vecesTrabajado: 0,
            ultimoTrabajo: 0
        });

        if (command === 'trabajar') {
            // Lógica para trabajar
            const tiempoRestante = cooldownTrabajo - (Date.now() - user.ultimoTrabajo);
            
            if (tiempoRestante > 0) {
                const horas = Math.floor(tiempoRestante / (1000 * 60 * 60));
                const minutos = Math.floor((tiempoRestante % (1000 * 60 * 60)) / (1000 * 60));
                return await m.reply(
                    `⏳ Espera ${horas}h ${minutos}m para trabajar otra vez.\n` +
                    `Usa *${usedPrefix}teibol* para ver tu estado.`
                );
            }

            const rangoActual = Object.keys(rangosTeibol)
                .reverse()
                .find(r => user.yenes >= rangosTeibol[r].requerido) || '0';

            const { pago, clientes, nombre } = rangosTeibol[rangoActual];
            const gananciaBase = Math.floor(Math.random() * (pago[1] - pago[0] + 1)) + pago[0];
            const bonificacion = Math.floor(gananciaBase * 0.2 * clientes);
            const totalGanado = gananciaBase + bonificacion;

            // Actualizar datos
            user.yenes += totalGanado;
            user.vecesTrabajado++;
            user.ultimoTrabajo = Date.now();

            // Verificar nuevo rango
            const nuevoRango = Object.keys(rangosTeibol)
                .reverse()
                .find(r => user.yenes >= rangosTeibol[r].requerido) || '0';

            let respuesta = `*🏮 TRABAJO COMPLETADO 🏮*\n\n` +
                          `▸ Rango: *${nombre}*\n` +
                          `▸ Clientes: *${clientes}*\n\n` +
                          `💰 Ganancias:\n` +
                          `• Base: ¥${gananciaBase}\n` +
                          `• Bonificación: ¥${bonificacion}\n` +
                          `• Total: ¥${totalGanado}\n\n` +
                          `🏦 Yenes totales: ¥${user.yenes}\n`;

            if (nuevoRango !== rangoActual) {
                respuesta += `\n🎉 ¡Nuevo rango! (*${rangosTeibol[nuevoRango].nombre}*) 🎉\n`;
            }

            respuesta += `\n⏳ Próximo turno en 2 horas`;

            await m.reply(respuesta);
            return;
        }

        if (command === 'teibol') {
            // Lógica para mostrar información
            const top10 = await obtenerTopTeibol(global.db.data.users);
            const rangoUsuario = Object.keys(rangosTeibol)
                .reverse()
                .find(r => user.yenes >= rangosTeibol[r].requerido) || '0';
            
            const posicionUsuario = top10.findIndex(u => u.jid === m.sender);
            const tiempoRest = cooldownTrabajo - (Date.now() - user.ultimoTrabajo);

            let texto = `*💎 CLUB TEIBOL VIP 💎*\n\n` +
                       `▸ Usuario: @${m.sender.split('@')[0]}\n` +
                       `▸ Rango: *${rangosTeibol[rangoUsuario].nombre}*\n` +
                       `▸ Yenes: ¥${user.yenes}\n` +
                       `▸ Turnos: ${user.vecesTrabajado}\n\n`;

            if (posicionUsuario >= 0) {
                texto += `🏅 Top: *${posicionUsuario + 1}°*\n\n`;
            }

            texto += tiempoRest > 0 
                ? `⏳ Trabajar en: *${Math.floor(tiempoRest / (1000 * 60 * 60))}h ${Math.floor((tiempoRest % (1000 * 60 * 60)) / (1000 * 60))}m*\n\n`
                : `✅ *¡Puedes trabajar ahora!*\nUsa *${usedPrefix}trabajar*\n\n`;

            texto += `🌟 *TOP 5 TEIBOL* 🌟\n\n` +
                     top10.slice(0, 5).map((u, i) => 
                         `${i + 1}. @${u.jid.split('@')[0]} » ${rangosTeibol[Object.keys(rangosTeibol)
                             .reverse()
                             .find(r => u.yenes >= rangosTeibol[r].requerido) || '0'].nombre} (¥${u.yenes})`
                     ).join('\n');

            await conn.sendMessage(m.chat, {
                text: texto,
                mentions: texto.match(/@\d+/g)?.map(m => m + '@s.whatsapp.net') || []
            }, { quoted: m });
            return;
        }

    } catch (error) {
        console.error('Error en comando teibol:', error);
        await m.reply('*⚠️ Ocurrió un error al procesar el comando*');
    }
};

// Configuración del handler
handler.help = ['teibol', 'trabajar'];
handler.tags = ['economy', 'rpg'];
handler.command = ['teibol', 'trabajar'];
handler.group = true; // Cambia a false si quieres que funcione en privado
handler.register = true; // Asegura que se registre el comando

export default handler;
