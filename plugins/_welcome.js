import { WAMessageStubType } from '@whiskeysockets/baileys';
import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';

// Configuration settings
const HOME_DIR = process.env.HOME || '/data/data/com.termux/files/home';
const BOT_DIR = path.join(HOME_DIR, 'whatsapp-bot');
const DEFAULT_PROFILE_PICTURE = 'https://files.catbox.moe/xr2m6u.jpg';
const DEFAULT_WELCOME_MESSAGE = '👋 ¡Bienvenido/a al grupo!';
const DEFAULT_LEAVE_MESSAGE = '👋 ¡Hasta pronto!';

// Ensure directories and files exist
ensureDirectoriesExist();
ensureDefaultMessages();
ensureDatabaseExists();

// Function to verify if the chat exists in the database
function ensureChatExists(chatId) {
  if (!global.db.data.chats[chatId]) {
    global.db.data.chats[chatId] = { welcome: true }; // Enabled by default
  }
  return global.db.data.chats[chatId];
}

// Function to get profile picture with improved error handling and retries
async function getProfilePicture(jid) {
  let retries = 0;
  while (retries < 3) {
    try {
      return await conn.profilePictureUrl(jid, 'image');
    } catch (error) {
      console.log(`Error al obtener foto de perfil (intentos: ${retries + 1}): ${error.message}`);
      retries++;
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second before retrying
    }
  }
  console.log("No se pudo obtener la foto de perfil después de varios intentos.");
  return DEFAULT_PROFILE_PICTURE;
}

// Function to ensure directories exist
function ensureDirectoriesExist() {
  if (!fs.existsSync(BOT_DIR)) {
    fs.mkdirSync(BOT_DIR, { recursive: true });
  }
}

// Function to ensure default messages are set
function ensureDefaultMessages() {
  if (!global.welcom1) global.welcom1 = DEFAULT_WELCOME_MESSAGE;
  if (!global.welcom2) global.welcom2 = DEFAULT_LEAVE_MESSAGE;
}

// Function to ensure the database exists
function ensureDatabaseExists() {
  if (!global.db) {
    global.db = { data: { chats: {} } };
  }
}

export async function before(m, { conn, participants, groupMetadata }) {
  try {
    // Log all message stub types for debugging
    if (m.messageStubType) {
      fs.appendFileSync(
        path.join(BOT_DIR, 'events.log'),
        `[${new Date().toISOString()}] Evento tipo: ${m.messageStubType}, Grupo: ${m.isGroup ? 'Sí' : 'No'}, Chat ID: ${m.chat}\n`
      );
    }

    // Check if the message is a group event
    if (!m.messageStubType || !m.isGroup) return true;

    let who = m.messageStubParameters[0];
    let taguser = `@${who.split('@')[0]}`;
    let chat = ensureChatExists(m.chat);

    // Get profile picture with retries
    let pp = await getProfilePicture(who);

    // Download the profile picture if available
    let img = await downloadImage(pp);

    // Handle different message stub types
    switch (m.messageStubType) {
      case WAMessageStubType.GROUP_PARTICIPANT_ADD:
        await handleWelcomeMessage(conn, m.chat, groupMetadata, taguser, img);
        break;
      case WAMessageStubType.GROUP_PARTICIPANT_LEAVE:
      case WAMessageStubType.GROUP_PARTICIPANT_REMOVE:
        await handleLeaveMessage(conn, m.chat, groupMetadata, taguser, img);
        break;
      default:
        console.log(`Tipo de evento no manejado: ${m.messageStubType}`);
    }
  } catch (error) {
    console.log(`Error en función before: ${error.message}`);
    // Log the error for debugging
    fs.appendFileSync(
      path.join(BOT_DIR, 'error.log'),
      `[${new Date().toISOString()}] ${error.message}\n${error.stack}\n\n`
    );
  }
  return true;
}

// Function to handle welcome messages
async function handleWelcomeMessage(conn, chatId, groupMetadata, taguser, img) {
  if (chat.welcome) {
    let groupName = groupMetadata?.subject || 'este grupo';
    let welcomeMessage = `❀ *Bienvenido* a ${groupName}\n ✰ ${taguser}\n${global.welcom1}\n •(=^●ω●^=)• Disfruta tu estadía en el grupo!\n> ✐ Puedes usar *#help* para ver la lista de comandos.`;
    await sendMessage(conn, chatId, welcomeMessage, taguser, img);
    console.log("Mensaje de bienvenida enviado con éxito");
  }
}

// Function to handle leave messages
async function handleLeaveMessage(conn, chatId, groupMetadata, taguser, img) {
  if (chat.welcome) {
    let groupName = groupMetadata?.subject || 'este grupo';
    let leaveMessage = `❀ *Adiós* de ${groupName}\n ✰ ${taguser}\n${global.welcom2}\n •(=^●ω●^=)• Te esperamos pronto!\n> ✐ Puedes usar *#help* para ver la lista de comandos.`;
    await sendMessage(conn, chatId, leaveMessage, taguser, img);
    console.log("Mensaje de despedida enviado con éxito");
  }
}

// Function to send a message with an image or text
async function sendMessage(conn, chatId, message, taguser, img) {
  try {
    if (img) {
      await conn.sendMessage(chatId, { image: img, caption: message, mentions: [taguser] });
    } else {
      await conn.sendMessage(chatId, { text: message, mentions: [taguser] });
    }
  } catch (error) {
    console.log(`Error al enviar mensaje: ${error.message}`);
  }
}

// Function to download an image with error handling
async function downloadImage(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
    return await response.buffer();
  } catch (error) {
    console.log(`Error al descargar imagen: ${error.message}`);
    // Use a local backup image if available
    const backupImagePath = path.join(BOT_DIR, 'default_profile.jpg');
    if (fs.existsSync(backupImagePath)) {
      return fs.readFileSync(backupImagePath);
    }
    // If no local image, return null
    return null;
  }
}
