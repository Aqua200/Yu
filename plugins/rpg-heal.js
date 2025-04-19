let handler = async (m, { conn }) => {
    let user = global.db.data.users[m.sender];
    if (!user) {
        return conn.reply(m.chat, `${emoji} El usuario no se encuentra en la base de Datos.`, m);
    }
    if (user.coin < 50) {
        return conn.reply(m.chat, `💔 Su saldó fue insuficiente para curarte. Necesitas al menos 20.`, m);
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
        await new Promise(resolve => setTimeout(resolve, 500)); // Espera medio segundo entre pasos
        
        const currentStepHealth = Math.min(initialHealth + (increment * i), user.health);
        let stepInfo = `*Curando... (${i}/${steps})*\n`;
        stepInfo += createHealthBar(currentStepHealth) + '\n\n';
        stepInfo += `💸 *${moneda} restantes:* ${user.coin}`;
        
        // Editamos el mensaje para mostrar el progreso
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
    let finalInfo = `❤️ *Te has curado ${healAmount} puntos de salud.*\n`;
    finalInfo += createHealthBar(user.health) + '\n\n';
    finalInfo += `💸 *${moneda} restantes:* ${user.coin}`;
    
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
handler.command = ['heal', 'curar']
handler.group = true;
handler.register = true;

export default handler;
