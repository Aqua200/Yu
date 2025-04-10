let handler = async (m, { conn, args, participants, usedPrefix, command }) => {
    // Configuración del sistema de teibol
    const nombreSistema = '🏮 Teibol VIP';
    const moneda = 'Yenes';
    const emoji = '💴';
    const cooldownTrabajo = 2 * 60 * 60 * 1000; // 2 horas de cooldown

    // Rangos y sus beneficios
    const rangos = {
        0: { nombre: 'Mesera', requerido: 0, pago: [100, 300], clientes: 1 },
        1: { nombre: 'Bailarina', requerido: 5000, pago: [300, 600], clientes: 2 },
        2: { nombre: 'Streaper', requerido: 15000, pago: [600, 1200], clientes: 3 },
        3: { nombre: 'Vip', requerido: 35000, pago: [1200, 2500], clientes: 4 },
        4: { nombre: 'Diosa', requerido: 75000, pago: [2500, 5000], clientes: 5 },
        5: { nombre: 'Reina', requerido: 150000, pago: [5000, 10000], clientes: 6 }
    };

    // Obtener usuario
    let user = global.db.data.users[m.sender] || (global.db.data.users[m.sender] = {});
    
    // Inicializar propiedades
    if (!user.yenes) user.yenes = 0;
    if (!user.rango) user.rango = 0;
    if (!user.vecesTrabajado) user.vecesTrabajado = 0;
    if (!user.ultimoTrabajo) user.ultimoTrabajo = 0;
    
    // Verificar cooldown
    let tiempoRestante = cooldownTrabajo - (new Date() - user.ultimoTrabajo);
    if (tiempoRestante > 0 && command === 'trabajar') {
        let horas = Math.floor(tiempoRestante / (1000 * 60 * 60));
        let minutos = Math.floor((tiempoRestante % (1000 * 60 * 60)) / (1000 * 60));
        return conn.reply(m.chat, 
            `⏳ *Espera un poco!* No puedes trabajar ahora.\n` +
            `Podrás trabajar de nuevo en *${horas}h ${minutos}m*.\n\n` +
            `Usa *${usedPrefix}teibol* para ver tu estado.`, 
            m);
    }
    
    // Comando para trabajar
    if (command === 'trabajar' || command === 'trabajart') {
        // Calcular ganancias basadas en rango
        const rangoActual = rangos[user.rango];
        const [min, max] = rangoActual.pago;
        const ganancia = Math.floor(Math.random() * (max - min + 1)) + min;
        
        // Bonificación por clientes atendidos
        const clientes = rangoActual.clientes;
        const bonificacionClientes = Math.floor(ganancia * 0.2 * clientes);
        const totalGanado = ganancia + bonificacionClientes;
        
        // Actualizar datos del usuario
        user.yenes += totalGanado;
        user.vecesTrabajado += 1;
        user.ultimoTrabajo = new Date() * 1;
        
        // Verificar ascenso de rango
        let subioRango = false;
        while (user.rango + 1 in rangos && user.yenes >= rangos[user.rango + 1].requerido) {
            user.rango++;
            subioRango = true;
        }
        
        // Mensaje de trabajo completado
        let texto = `*${nombreSistema} - Turno completado*\n\n`;
        texto += `💃 *Trabajaste como ${rangoActual.nombre}*\n`;
        texto += `👥 Atendiste a *${clientes} clientes*\n\n`;
        texto += `💰 *Ganancias:*\n`;
        texto += `▸ Base: ¥${ganancia}\n`;
        texto += `▸ Bonificación: ¥${bonificacionClientes}\n`;
        texto += `▸ Total: ¥${totalGanado}\n\n`;
        texto += `🏦 Yenes totales: ¥${user.yenes}\n`;
        
        if (subioRango) {
            texto += `\n🎉 *¡Felicidades!* Ahora eres *${rangos[user.rango].nombre}* 🎉\n`;
        }
        
        texto += `\n⏳ *Próximo turno disponible en 2 horas*`;
        
        return conn.reply(m.chat, texto, m);
    }
    
    // Comando para ver el teibol (estado y top)
    // Obtener todos los usuarios
    let users = Object.entries(global.db.data.users)
        .filter(([_, u]) => u.yenes > 0)
        .map(([key, value]) => {
            return { 
                ...value, 
                jid: key,
                total: value.yenes || 0
            };
        });
    
    // Ordenar por yenes
    let sortedUsers = users.sort((a, b) => b.total - a.total);
    let len = Math.min(10, sortedUsers.length);
    
    // Construir mensaje de estado
    let text = `「 ${emoji} 」 *${nombreSistema}* 「 ${emoji} 」\n\n`;
    
    // Información personal
    const rangoActual = rangos[user.rango];
    text += `*❖ Usuario:* @${m.sender.split`@`[0]}\n`;
    text += `*❖ Rango:* ${rangoActual.nombre}\n`;
    text += `*❖ Yenes:* ¥${user.yenes}\n`;
    text += `*❖ Turnos trabajados:* ${user.vecesTrabajado || 0}\n`;
    text += `*❖ Clientes por turno:* ${rangoActual.clientes}\n`;
    text += `*❖ Ganancias por turno:* ¥${rangoActual.pago[0]}-${rangoActual.pago[1]}\n\n`;
    
    // Mostrar tiempo restante si está en cooldown
    if (user.ultimoTrabajo && (new Date() - user.ultimoTrabajo) < cooldownTrabajo) {
        let tiempoRest = cooldownTrabajo - (new Date() - user.ultimoTrabajo);
        let horas = Math.floor(tiempoRest / (1000 * 60 * 60));
        let minutos = Math.floor((tiempoRest % (1000 * 60 * 60)) / (1000 * 60));
        text += `⏳ *Tiempo para trabajar:* ${horas}h ${minutos}m\n\n`;
    } else {
        text += `✅ *Puedes trabajar ahora!*\nUsa *${usedPrefix}trabajar*\n\n`;
    }
    
    // Tabla de líderes
    text += `「 🏆 」 *TOP 10 DEL TEIBOL* 「 🏆 」\n\n`;
    text += sortedUsers.slice(0, len).map(({ jid, total, rango = 0 }, i) => {
        let rangoUser = rangos[rango] || rangos[0];
        return `${i + 1}. @${jid.split`@`[0]} » *${rangoUser.nombre}* (¥${total})`;
    }).join('\n');
    
    // Mostrar requisitos de rangos
    text += `\n\n「 📈 」 *ASCENSO DE RANGO* 「 📈 」\n\n`;
    text += Object.entries(rangos).slice(1).map(([nivel, {nombre, requerido}]) => {
        return `▢ ${nombre}: ¥${requerido.toLocaleString()}`;
    }).join('\n');
    
    // Enviar mensaje
    await conn.reply(m.chat, text, m, { 
        mentions: [...conn.parseMention(text), m.sender] 
    });
}

handler.help = ['teibol', 'trabajar'];
handler.tags = ['economy', 'rpg', 'game'];
handler.command = ['teibol', 'trabajar', 'trabajart'];
handler.group = true;
handler.register = true;

export default handler;
