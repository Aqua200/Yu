import rangosTeibol from '../lib/rangos-teibol.js';

let cooldownTeibol = {};
const moneda = '¥';
const tiempoEspera = 15; // Minutos

function calcularGanancia(user, rango) {
    let gananciaBase = Math.floor(Math.random() * (rango.pago[1] - rango.pago[0] + 1)) + rango.pago[0];
    let bonificacion = Math.floor(gananciaBase * 0.2 * rango.clientes);
    
    if (Math.random() < 0.1) { // Evento especial 10% de probabilidad
        const bonificacionExtra = Math.floor(gananciaBase * 0.5 * rango.clientes);
        bonificacion += bonificacionExtra;
        return {
            gananciaBase,
            bonificacion,
            total: gananciaBase + bonificacion,
            eventoEspecial: true,
            bonificacionExtra
        };
    }
    
    return {
        gananciaBase,
        bonificacion,
        total: gananciaBase + bonificacion,
        eventoEspecial: false
    };
}

function msAMinutos(ms) {
    let minutos = Math.floor(ms / 60000);
    let segundos = Math.floor((ms % 60000) / 1000);
    return `${minutos}m ${segundos}s`;
}

let handler = async (m, { conn, usedPrefix, command }) => {
    let user = global.db.data.users[m.sender] || (global.db.data.users[m.sender] = {});

    // Asegurar propiedades iniciales
    if (typeof user.yenes !== 'number') user.yenes = 0;
    if (typeof user.vecesTrabajado !== 'number') user.vecesTrabajado = 0;
    if (typeof user.nivelTeibol !== 'number') user.nivelTeibol = 1;
    if (typeof user.expTeibol !== 'number') user.expTeibol = 0;

    const cooldownTime = tiempoEspera * 60 * 1000; // 15 minutos en milisegundos
    
    if (command === 'trabajar') {
        if (cooldownTeibol[m.sender] && Date.now() - cooldownTeibol[m.sender] < cooldownTime) {
            const tiempoRestante = msAMinutos(cooldownTime - (Date.now() - cooldownTeibol[m.sender]));
            return conn.reply(m.chat, 
                `🎎 *Club Teibol VIP*\n\n⏳ Espera *${tiempoRestante}* para trabajar otra vez.\n` +
                `Usa *${usedPrefix}teibol* para ver tu estado.`, 
            m);
        }

        let rangoKey = Object.keys(rangosTeibol)
            .reverse()
            .find(k => user.yenes >= rangosTeibol[k].requerido) || '1';
        
        let rango = rangosTeibol[rangoKey];
        
        const { gananciaBase, bonificacion, total, eventoEspecial, bonificacionExtra } = calcularGanancia(user, rango);

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

        user.yenes += total; // Aquí se suman correctamente los yenes
        user.vecesTrabajado++;
        cooldownTeibol[m.sender] = Date.now();

        let mensaje = `🎎 *Club Teibol VIP*\n\n` +
            `▸ Rango: *${rango.nombre}* (Nivel ${rangoKey})\n` +
            `▸ Clientes: *${rango.clientes}*\n\n` +
            `💰 Ganancias:\n` +
            `• Base: ${moneda}${gananciaBase}\n` +
            `• Bonificación: ${moneda}${bonificacion}${eventoEspecial ? ` (Incluye extra: ${moneda}${bonificacionExtra})` : ''}\n` +
            `• Total: ${moneda}${total}\n\n` +
            `🏦 Yenes totales: ${moneda}${user.yenes}\n` +
            `📈 Nivel Personal: ${user.nivelTeibol} (${user.expTeibol}/${expNecesaria} EXP)\n\n` +
            `⏳ Próximo turno en ${tiempoEspera} minutos`;

        await conn.reply(m.chat, mensaje, m);
    }
    
    if (command === 'teibol') {
        let rangoKey = Object.keys(rangosTeibol)
            .reverse()
            .find(k => user.yenes >= rangosTeibol[k].requerido) || '1';
        
        let rango = rangosTeibol[rangoKey];
        let tiempoRest = cooldownTeibol[m.sender] ? (tiempoEspera * 60 * 1000) - (Date.now() - cooldownTeibol[m.sender]) : 0;

        let texto = `💎 *Club Teibol VIP*\n\n` +
            `▸ Usuario: @${m.sender.split('@')[0]}\n` +
            `▸ Rango: *${rango.nombre}* (Nivel ${rangoKey})\n` +
            `▸ Yenes: ${moneda}${user.yenes}\n` +
            `▸ Turnos trabajados: ${user.vecesTrabajado}\n` +
            `▸ Nivel Personal: ${user.nivelTeibol} (${user.expTeibol}/${100 * user.nivelTeibol} EXP)\n` +
            `▸ Tiempo para próximo turno: ${tiempoRest > 0 ? msAMinutos(tiempoRest) : 'Disponible'}`;

        await conn.reply(m.chat, texto, m, { mentions: [m.sender] });
    }
};

handler.command = ['trabajar', 'teibol'];
export default handler;
