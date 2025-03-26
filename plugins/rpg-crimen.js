let cooldowns = {}

let handler = async (m, { conn, text, command, usedPrefix }) => {
let users = global.db.data.users
let senderId = m.sender
let senderName = conn.getName(senderId)

let tiempo = 5 * 60
if (cooldowns[m.sender] && Date.now() - cooldowns[m.sender] < tiempo * 1000) {
let tiempo2 = segundosAHMS(Math.ceil((cooldowns[m.sender] + tiempo * 1000 - Date.now()) / 1000))
m.reply(`🌸 Aún estás siendo observado entre los cerezos... espera ⏱️ *${tiempo2}* antes de volver a arriesgarte.`)
return
}
cooldowns[m.sender] = Date.now()
let senderCoin = users[senderId].coin || 0
let randomUserId = Object.keys(users)[Math.floor(Math.random() * Object.keys(users).length)]
while (randomUserId === senderId) {
randomUserId = Object.keys(users)[Math.floor(Math.random() * Object.keys(users).length)]}
let randomUserCoin = users[randomUserId].coin || 0
let minAmount = 15
let maxAmount = 50
let amountTaken = Math.floor(Math.random() * (maxAmount - minAmount + 1)) + minAmount
let randomOption = Math.floor(Math.random() * 3)
switch (randomOption) {
case 0:
users[senderId].coin += amountTaken
users[randomUserId].coin -= amountTaken
conn.sendMessage(m.chat, {
text: `🌸 En medio del festival de cerezos, lograste robar una billetera con *${amountTaken} ${moneda} 💴* de @${randomUserId.split("@")[0]}.\n\n*+${amountTaken} ${moneda} 💴* sumados a la bolsa de ${senderName}.`,
contextInfo: { 
mentionedJid: [randomUserId],
}}, { quoted: m })
break
case 1:
let amountSubtracted = Math.min(Math.floor(Math.random() * (senderCoin - minAmount + 1)) + minAmount, maxAmount)
users[senderId].coin -= amountSubtracted
conn.reply(m.chat, `🍂 Fuiste descubierto mientras intentabas abrir una bolsa durante el festival. Pierdes *-${amountSubtracted} ${moneda} 💴*, ${senderName}.`, m)
break
case 2:
let smallAmountTaken = Math.min(Math.floor(Math.random() * (randomUserCoin / 2 - minAmount + 1)) + minAmount, maxAmount)
users[senderId].coin += smallAmountTaken
users[randomUserId].coin -= smallAmountTaken
conn.sendMessage(m.chat, {
text: `🌸 Disimuladamente, tomaste un pequeño monedero con *${smallAmountTaken} ${moneda} 💴* de @${randomUserId.split("@")[0]} durante el desfile.\n\n*+${smallAmountTaken} ${moneda} 💴* añadidos a las manos de ${senderName}.`,
contextInfo: { 
mentionedJid: [randomUserId],
}}, { quoted: m })
break
}
global.db.write()}

handler.tags = ['economy']
handler.help = ['crimen']
handler.command = ['crimen', 'crime']
handler.register = true
handler.group = true

export default handler

function segundosAHMS(segundos) {
let horas = Math.floor(segundos / 3600)
let minutos = Math.floor((segundos % 3600) / 60)
let segundosRestantes = segundos % 60
return `${minutos} minutos y ${segundosRestantes} segundos`
}
