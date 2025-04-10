let cooldownTeibol = {};
const moneda = '¥'; // Símbolo de moneda (Yenes)

let handler = async (m, { conn, usedPrefix }) => {
    let user = global.db.data.users[m.sender] || (global.db.data.users[m.sender] = {});
    
    // Inicializar propiedades del usuario
    user.yenes = user.yenes || 0;
    user.vecesTrabajado = user.vecesTrabajado || 0;
    user.nivelTeibol = user.nivelTeibol || 1;
    user.expTeibol = user.expTeibol || 0;
    
    // ==================== [ SISTEMA DE COOLDOWN ] ====================
    const cooldownTime = 30 * 60 * 1000; // 30 minutos de cooldown
    
    if (cooldownTeibol[m.sender] && Date.now() - cooldownTeibol[m.sender] < cooldownTime) {
        const tiempoRestante = msAMinutos(cooldownTime - (Date.now() - cooldownTeibol[m.sender]));
        return conn.reply(m.chat, 
            `🎎 *Club Teibol VIP*\n\n` +
            `⚠️ Debes esperar *${tiempoRestante}* antes de trabajar nuevamente.\n` +
            `Usa *${usedPrefix}teibol* para ver tu estado.`, 
        m);
    }
    
    // ==================== [ RANGOS DEL TEIBOL ] ====================
    const rangos = [
        { nombre: 'Novato', requerido: 0, pago: [100, 200], clientes: 1 },
        { nombre: 'Aprendiz', requerido: 1000, pago: [200, 350], clientes: 2 },
        { nombre: 'Profesional', requerido: 5000, pago: [400, 600], clientes: 3 },
        { nombre: 'Estrella', requerido: 15000, pago: [700, 1000], clientes: 4 },
        { nombre: 'Élite', requerido: 30000, pago: [1200, 1800], clientes: 5 }
    ];
    
    // ==================== [ EVENTO ESPECIAL (10% de probabilidad) ] ====================
    let eventoEspecial = Math.random() < 0.1;
    
    // Determinar rango actual
    let rangoActual = rangos.slice().reverse().find(r => user.yenes >= r.requerido) || rangos[0];
    
    // Calcular ganancias
    let gananciaBase = Math.floor(Math.random() * (rangoActual.pago[1] - rangoActual.pago[0] + 1)) + rangoActual.pago[0];
    let bonificacion = Math.floor(gananciaBase * 0.2 * rangoActual.clientes);
    
    // Bonificación por evento especial
    if (eventoEspecial) {
        bonificacion = Math.floor(gananciaBase * 0.5 * rangoActual.clientes);
    }
    
    let totalGanado = gananciaBase + bonificacion;
    
    // ==================== [ SISTEMA DE EXPERIENCIA ] ====================
    user.expTeibol += Math.floor(Math.random() * 20) + 10;
    let expNecesaria = 100 * user.nivelTeibol;
    
    if (user.expTeibol >= expNecesaria) {
        user.nivelTeibol++;
        user.expTeibol = 0;
        conn.sendMessage(m.chat, { 
            text: `🎉 *¡Subiste de nivel en el Teibol!* (Nivel ${user.nivelTeibol})`, 
            contextInfo: { mentionedJid: [m.sender] } 
        });
    }
    
    // Actualizar datos del usuario
    user.yenes += totalGanado;
    user.vecesTrabajado++;
    cooldownTeibol[m.sender] = Date.now();
    
    // ==================== [ MENSAJE DE RESPUESTA ] ====================
    let mensajeTrabajo = `🎎 *Club Teibol VIP*\n\n` +
                         `▸ Rango: *${rangoActual.nombre}*\n` +
                         `▸ Clientes atendidos: *${rangoActual.clientes}*\n\n` +
                         `💰 *Ganancias*\n` +
                         `• Base: ${moneda}${gananciaBase}\n` +
                         `• Bonificación: ${moneda}${bonificacion}\n` +
                         (eventoEspecial ? `✨ *Bonificación especial por cliente VIP!*\n\n` : `\n`) +
                         `💵 *Total ganado:* ${moneda}${totalGanado}\n\n` +
                         `🏦 Yenes acumulados: ${moneda}${user.yenes}\n` +
                         `📈 Nivel: ${user.nivelTeibol} (EXP: ${user.expTeibol}/${expNecesaria})\n\n` +
                         `⏳ Próximo turno en 30 minutos`;
    
    await conn.reply(m.chat, mensajeTrabajo, m);
};

// Comando para ver el estado
handler.help = ['teibol'];
handler.tags = ['economy'];
handler.command = ['teibol', 'trabajar'];
handler.group = true;

// Función auxiliar para convertir milisegundos a minutos
function msAMinutos(ms) {
    let minutos = Math.floor(ms / 60000);
    let segundos = ((ms % 60000) / 1000).toFixed(0);
    return `${minutos} minutos y ${segundos} segundos`;
}

export default handler;
