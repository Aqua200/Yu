import rangosTeibol from '../lib/rangos-teibol.js';
import { obtenerTopTeibol } from '../lib/top-teibol.js';

const cooldownTrabajo = 2 * 60 * 60 * 1000; // 2 horas de cooldown

let handler = async (m, { conn, usedPrefix, command }) => {
    // Obtener usuario
    let user = global.db.data.users[m.sender] || (global.db.data.users[m.sender] = {});
    
    // Inicializar propiedades
    if (typeof user.yenes !== 'number') user.yenes = 0;
    if (typeof user.vecesTrabajado !== 'number') user.vecesTrabajado = 0;
    if (!user.ultimoTrabajo) user.ultimoTrabajo = 0;
    
    // Comando para trabajar
    if (command === 'trabajar') {
        // Verificar cooldown
        const tiempoRestante = cooldownTrabajo - (Date.now() - user.ultimoTrabajo);
        if (tiempoRestante > 0) {
            const horas = Math.floor(tiempoRestante / (1000 * 60 * 60));
            const minutos = Math.floor((tiempoRestante % (1000 * 60 * 60)) / (1000 * 60));
            return m.reply(
                `⏳ Espera ${horas}h ${minutos}m para trabajar otra vez.\n` +
                `Usa *${usedPrefix}teibol* para ver tu estado.`
            );
        }
        
        // Determinar rango actual
        let rangoActual = Object.keys(rangosTeibol)
            .reverse()
            .find(r => user.yenes >= rangosTeibol[r].requerido) || 0;
        
        // Calcular ganancias
        const { pago, clientes, nombre } = rangosTeibol[rangoActual];
        const gananciaBase = Math.floor(Math.random() * (pago[1] - pago[0] + 1)) + pago[0];
        const bonificacion = Math.floor(gananciaBase * 0.2 * clientes);
        const totalGanado = gananciaBase + bonificacion;
        
        // Actualizar datos
        user.yenes += totalGanado;
        user.vecesTrabajado++;
        user.ultimoTrabajo = Date.now();
        
        // Verificar si subió de rango
        const nuevoRango = Object.keys(rangosTeibol)
            .reverse()
            .find(r => user.yenes >= rangosTeibol[r].requerido) || 0;
        
        // Construir mensaje
        let texto = `*🏮 TRABAJO EN EL TEIBOL COMPLETADO 🏮*\n\n`;
        texto += `▸ Rango: *${nombre}*\n`;
        texto += `▸ Clientes: *${clientes}*\n\n`;
        texto += `💰 Ganancias:\n`;
        texto += `• Base: ¥${gananciaBase}\n`;
        texto += `• Bonificación: ¥${bonificacion}\n`;
        texto += `• Total: ¥${totalGanado}\n\n`;
        texto += `🏦 Yenes totales: ¥${user.yenes}\n`;
        
        if (nuevoRango > rangoActual) {
            texto += `\n🎉 ¡Nuevo rango alcanzado! (*${rangosTeibol[nuevoRango].nombre}*) 🎉\n`;
        }
        
        texto += `\n⏳ Próximo turno en 2 horas`;
        
        return m.reply(texto);
    }
    
    // Comando para ver el teibol
    // Obtener top 10
    const top10 = obtenerTopTeibol(global.db.data.users);
    
    // Determinar rango y posición del usuario
    const rangoUsuario = Object.keys(rangosTeibol)
        .reverse()
        .find(r => user.yenes >= rangosTeibol[r].requerido) || 0;
    
    const posicionUsuario = top10.findIndex(u => u.jid === m.sender);
    
    // Construir mensaje
    let text = `*💎 CLUB TEIBOL VIP 💎*\n\n`;
    text += `▸ Usuario: @${m.sender.split`@`[0]}\n`;
    text += `▸ Rango: *${rangosTeibol[rangoUsuario].nombre}*\n`;
    text += `▸ Yenes: ¥${user.yenes}\n`;
    text += `▸ Turnos trabajados: ${user.vecesTrabajado}\n\n`;
    
    if (posicionUsuario >= 0) {
        text += `🏅 Posición en el top: *${posicionUsuario + 1}°*\n\n`;
    }
    
    // Mostrar cooldown
    const tiempoRest = cooldownTrabajo - (Date.now() - user.ultimoTrabajo);
    if (tiempoRest > 0) {
        const horas = Math.floor(tiempoRest / (1000 * 60 * 60));
        const minutos = Math.floor((tiempoRest % (1000 * 60 * 60)) / (1000 * 60));
        text += `⏳ Puedes trabajar en: *${horas}h ${minutos}m*\n\n`;
    } else {
        text += `✅ *¡Puedes trabajar ahora!*\nUsa *${usedPrefix}trabajar*\n\n`;
    }
    
    // Mostrar top 5
    text += `🌟 *TOP 5 DEL TEIBOL* 🌟\n\n`;
    text += top10.slice(0, 5).map((user, i) => {
        return `${i + 1}. @${user.jid.split`@`[0]} » ${user.nombreRango} (¥${user.yenes})`;
    }).join('\n');
    
    await conn.sendMessage(m.chat, { 
        text, 
        mentions: [...text.matchAll(/@(\d+)/g)].map(m => m[1] + '@s.whatsapp.net') 
    }, { quoted: m });
}

handler.help = ['kurogane']
handler.tags = ['economy']
handler.command = ['kurogane']
handler.group = true
export default handler

export default handler;
