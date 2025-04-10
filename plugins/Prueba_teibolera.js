import rangosTeibol from '../lib/rangos-teibol.js';

let cooldownTeibol = {};
const moneda = '¥';

let handler = async (m, { conn, usedPrefix, command }) => {
    let user = global.db.data.users[m.sender] || (global.db.data.users[m.sender] = {});
    
    // Inicialización de propiedades
    ['yenes', 'vecesTrabajado', 'nivelTeibol', 'expTeibol'].forEach(prop => {
        user[prop] = user[prop] || 0;
    });

    // Comando para trabajar
    if (command === 'trabajar') {
        const cooldownTime = 30 * 60 * 1000;
        
        if (cooldownTeibol[m.sender] && Date.now() - cooldownTeibol[m.sender] < cooldownTime) {
            const tiempoRestante = msAMinutos(cooldownTime - (Date.now() - cooldownTeibol[m.sender]));
            return conn.reply(m.chat, 
                `🎎 *Club Teibol VIP*\n\n⏳ Espera *${tiempoRestante}* para trabajar otra vez.\n` +
                `Usa *${usedPrefix}teibol* para ver tu estado.`, 
            m);
        }

        // Obtener rango actual
        let rangoKey = Object.keys(rangosTeibol)
            .reverse()
            .find(k => user.yenes >= rangosTeibol[k].requerido) || '1';
        
        let rango = rangosTeibol[rangoKey];
        
        // Calcular ganancias
        let gananciaBase = Math.floor(Math.random() * (rango.pago[1] - rango.pago[0] + 1)) + rango.pago[0];
        let bonificacion = Math.floor(gananciaBase * 0.2 * rango.clientes);
        
        // Evento especial (10% chance)
        if (Math.random() < 0.1) {
            bonificacion = Math.floor(gananciaBase * 0.5 * rango.clientes);
        }
        
        // Sistema de experiencia
        user.expTeibol += Math.floor(Math.random() * 20) + 10;
        let expNecesaria = 100 * user.nivelTeibol;
        
        if (user.expTeibol >= expNecesaria) {
            user.nivelTeibol++;
            user.expTeibol = 0;
            await conn.sendMessage(m.chat, { 
                text: `🎉 *¡Subiste a nivel ${user.nivelTeibol} en el Teibol!*`, 
                mentions: [m.sender] 
            });
        }
        
        // Actualizar datos
        user.yenes += gananciaBase + bonificacion;
        user.vecesTrabajado++;
        cooldownTeibol[m.sender] = Date.now();
        
        // Respuesta
        await conn.reply(m.chat, 
            `🎎 *Club Teibol VIP*\n\n` +
            `▸ Rango: *${rango.nombre}* (Nivel ${rangoKey})\n` +
            `▸ Clientes: *${rango.clientes}*\n\n` +
            `💰 Ganancias:\n` +
            `• Base: ${moneda}${gananciaBase}\n` +
            `• Bonificación: ${moneda}${bonificacion}\n` +
            `• Total: ${moneda}${gananciaBase + bonificacion}\n\n` +
            `🏦 Yenes totales: ${moneda}${user.yenes}\n` +
            `📈 Nivel Personal: ${user.nivelTeibol} (${user.expTeibol}/${expNecesaria} EXP)\n\n` +
            `⏳ Próximo turno en 30 minutos`,
        m);
        return;
    }
    
    // Comando para ver estado (teibol)
    if (command === 'teibol') {
        let rangoKey = Object.keys(rangosTeibol)
            .reverse()
            .find(k => user.yenes >= rangosTeibol[k].requerido) || '1';
        
        let rango = rangosTeibol[rangoKey];
        let tiempoRest = cooldownTeibol[m.sender] ? (30 * 60 * 1000) - (Date.now() - cooldownTeibol[m.sender]) : 0;
        
        let texto = `💎 *Club Teibol VIP*\n\n` +
                   `▸ Usuario: @${m.sender.split('@')[0]}\n` +
                   `▸ Rango: *${rango.nombre}* (Nivel ${rangoKey})\n` +
                   `▸ Yenes: ${moneda}${user.yenes}\n` +
                   `▸ Turnos: ${user.vecesTrabajado}\n` +
                   `▸ Nivel: ${user.nivelTeibol} (${user.expTeibol}/${100 * user.nivelTeibol} EXP)\n\n` +
                   (tiempoRest > 0 ? 
                       `⏳ Puedes trabajar en: *${msAMinutos(tiempoRest)}*\n` : 
                       `✅ *¡Puedes trabajar ahora!*\n`) +
                   `\n🌟 Usa *${usedPrefix}trabajar* para ganar más ${moneda}`;
        
        await conn.sendMessage(m.chat, { 
            text: texto, 
            mentions: [m.sender] 
        }, { quoted: m });
    }
};

// Funciones auxiliares
function msAMinutos(ms) {
    let minutos = Math.floor(ms / 60000);
    let segundos = Math.floor((ms % 60000) / 1000);
    return `${minutos}m ${segundos}s`;
}

handler.help = ['teibol', 'trabajar'];
handler.tags = ['economy', 'rpg'];
handler.command = ['teibol', 'trabajar'];
handler.group = true;
export default handler;
