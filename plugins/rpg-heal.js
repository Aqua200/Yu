let handler = async (m, { conn }) => {
    let user = global.db.data.users[m.sender];
    if (!user) {
        return conn.reply(m.chat, `${emoji} El usuario no se encuentra en la base de Datos.`, m);
    }

    // Verificar si ya tiene vida máxima
    if (user.health >= 100) {
        const healthBar = '❤️'.repeat(10) + ' 100/100';
        return conn.reply(m.chat, 
            `✨ *¡Vida al máximo!* ✨\n` +
            `${healthBar}\n\n` +
            `🏆 ¡Ya tienes toda tu salud al 100%!\n` +
            `No necesitas curarte ahora.`, 
        m);
    }

    if (user.coin < 50) {
        return conn.reply(m.chat, `💔 Su saldo es insuficiente para curarte. Necesitas al menos 50 ${moneda}.`, m);
    }
    
    let healAmount = 50;
    const initialHealth = user.health;
    user.health += healAmount;
    user.coin -= 50;
    
    if (user.health > 100) {
        user.health = 100;
    }
    
    user.lastHeal = new Date();
    
    // Función para crear la barra de vida
    const createHealthBar = (current, max = 100, size = 10) => {
        const percentage = current / max;
        const filled = Math.round(size * percentage);
        const empty = size - filled;
        return '❤️'.repeat(filled) + '♡'.repeat(empty) + ` ${current}/${max}`;
    };
    
    // Animación de curación
    let info = `*Curando...*\n`;
    info += createHealthBar(initialHealth) + '\n\n';
    info += `💸 *${moneda} restantes:* ${user.coin}`;
    
    // Enviamos el mensaje inicial
    const loadingMsg = await conn.sendMessage(m.chat, { text: info }, { quoted: m });
    
    // Simulamos la animación
    const steps = 5;
    const increment = (user.health - initialHealth) / steps;
    
    for (let i = 1; i <= steps; i++) {
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const currentStepHealth = Math.min(initialHealth + (increment * i), user.health);
        let stepInfo = `*Curando... (${i}/${steps})*\n`;
        stepInfo += createHealthBar(currentStepHealth) + '\n\n';
        stepInfo += `💸 *${moneda} restantes:* ${user.coin}`;
        
        await conn.relayMessage(m.chat, {
            protocolMessage: {
                key: loadingMsg.key,
                type: 14,
                editedMessage: {
                    conversation: stepInfo
                }
            }
        }, {});
    }
    
    // Mensaje final
    let finalInfo;
    if (user.health === 100) {
        finalInfo = `✨ *¡Vida al máximo alcanzada!* ✨\n` +
                   `❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️ 100/100\n\n` +
                   `🏆 ¡Felicidades! Tu salud está completamente restaurada.\n` +
                   `💸 *${moneda} restantes:* ${user.coin}`;
    } else {
        finalInfo = `❤️ *Te has curado ${healAmount} puntos de salud.*\n` +
                   `${createHealthBar(user.health)}\n\n` +
                   `💸 *${moneda} restantes:* ${user.coin}`;
    }
    
    await conn.relayMessage(m.chat, {
        protocolMessage: {
            key: loadingMsg.key,
            type: 14,
            editedMessage: {
                conversation: finalInfo
            }
        }
    }, {});
};

handler.help = ['heal'];
handler.tags = ['rpg'];
handler.command = ['heal', 'curar'];
handler.group = true;
handler.register = true;

export default handler;
