import makeWASocket, {
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  Browsers,
  DisconnectReason
} from '@whiskeysockets/baileys';
import pino from 'pino';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const AUTH_DIR = path.resolve(__dirname, 'auth_info');
const DATA_DIR = path.resolve(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

export function cleanPhoneToJid(phone) {
  if (!phone) return null;
  let clean = phone.replace(/\D/g, '');
  if (clean.startsWith('0')) clean = '212' + clean.slice(1);
  if (!clean.startsWith('212')) clean = '212' + clean;
  return `${clean}@s.whatsapp.net`;
}

export function randomJitter(minMs = 1500, maxMs = 3000) {
  return new Promise(res => setTimeout(res, Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs));
}

export function parseSpintax(text) {
  if (!text) return '';
  return text.replace(/\{([^{}]+)\}/g, (match, choices) => {
    const arr = choices.split('|');
    return arr[Math.floor(Math.random() * arr.length)];
  });
}

/**
 * Creates and returns an authenticated Baileys socket for DTC.
 */
export async function getDtcSocket(options = {}) {
  const { state, saveCreds } = await useMultiFileAuthState(AUTH_DIR);
  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version,
    logger: pino({ level: 'silent' }),
    auth: state,
    browser: Browsers.ubuntu('Chrome'),
    syncFullHistory: false,
    markOnlineOnConnect: false,
    ...options
  });

  sock.ev.on('creds.update', saveCreds);

  await new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error('Connection timeout (15s)')), 15000);
    sock.ev.on('connection.update', (update) => {
      const { connection, lastDisconnect } = update;
      if (connection === 'open') {
        clearTimeout(timeout);
        resolve(sock);
      }
      if (connection === 'close') {
        const code = lastDisconnect?.error?.output?.statusCode;
        if (code === DisconnectReason.loggedOut) {
          clearTimeout(timeout);
          reject(new Error('Logged out of WhatsApp. Re-scan required.'));
        }
      }
    });
  });

  return sock;
}

// ==========================================
// 🦸 DTC WHATSAPP SUPERPOWER SUITE
// ==========================================

export class DtcWhatsAppAgent {
  constructor(sock) {
    this.sock = sock;
  }

  static async init(options = {}) {
    const sock = await getDtcSocket(options);
    return new DtcWhatsAppAgent(sock);
  }

  // --- 1. MESSAGING POWERS ---

  /**
   * Human-simulated message dispatch (subscribes presence + sends typing indicator).
   */
  async sendText(to, text, { quoted = null, simulateTyping = true } = {}) {
    const jid = to.includes('@') ? to : cleanPhoneToJid(to);
    if (simulateTyping) {
      try {
        await this.sock.presenceSubscribe(jid);
        await this.sock.sendPresenceUpdate('composing', jid);
        await randomJitter(1800, 3200);
      } catch (e) {}
    }
    const finalMsg = parseSpintax(text);
    return await this.sock.sendMessage(jid, { text: finalMsg }, { quoted });
  }

  /**
   * Send media (Image, Video, Audio, Document).
   */
  async sendMedia(to, filePath, caption = '', mimeOverride = null) {
    const jid = to.includes('@') ? to : cleanPhoneToJid(to);
    if (!fs.existsSync(filePath)) throw new Error(`File not found: ${filePath}`);
    const buffer = fs.readFileSync(filePath);
    const ext = path.extname(filePath).toLowerCase();

    let msgPayload = {};
    if (['.jpg', '.jpeg', '.png', '.webp'].includes(ext)) {
      msgPayload = { image: buffer, caption: parseSpintax(caption) };
    } else if (['.mp4', '.mov'].includes(ext)) {
      msgPayload = { video: buffer, caption: parseSpintax(caption) };
    } else if (['.mp3', '.ogg', '.m4a'].includes(ext)) {
      msgPayload = { audio: buffer, mimetype: mimeOverride || 'audio/mp4', ptt: ext === '.ogg' };
    } else {
      const fileName = path.basename(filePath);
      msgPayload = { document: buffer, mimetype: mimeOverride || 'application/octet-stream', fileName, caption: parseSpintax(caption) };
    }

    try {
      await this.sock.presenceSubscribe(jid);
      await this.sock.sendPresenceUpdate('composing', jid);
      await randomJitter(2000, 3500);
    } catch (e) {}

    return await this.sock.sendMessage(jid, msgPayload);
  }

  /**
   * Send Contact vCard.
   */
  async sendContact(to, { name, phone, org = 'Dentalk Club FMDC' }) {
    const jid = to.includes('@') ? to : cleanPhoneToJid(to);
    const cleanNumber = phone.replace(/\D/g, '');
    const vcard = 
      'BEGIN:VCARD\n' +
      'VERSION:3.0\n' +
      `FN:${name}\n` +
      `ORG:${org};\n` +
      `TEL;type=CELL;type=VOICE;waid=${cleanNumber}:+${cleanNumber}\n` +
      'END:VCARD';

    return await this.sock.sendMessage(jid, {
      contacts: {
        displayName: name,
        contacts: [{ vcard }]
      }
    });
  }

  /**
   * React to a message.
   */
  async react(to, messageKey, emoji) {
    const jid = to.includes('@') ? to : cleanPhoneToJid(to);
    return await this.sock.sendMessage(jid, {
      react: {
        text: emoji,
        key: messageKey
      }
    });
  }

  // --- 2. CHAT & CONVERSATION POWERS ---

  /**
   * Archive a chat (dual JID + optional LID).
   */
  async archiveChat(to, lid = null) {
    const jid = to.includes('@') ? to : cleanPhoneToJid(to);
    const results = {};
    try {
      await this.sock.chatModify({ archive: true, lastMessages: [] }, jid);
      results[jid] = 'archived';
    } catch (e) {
      results[jid] = `error: ${e.message}`;
    }
    if (lid) {
      try {
        await this.sock.chatModify({ archive: true, lastMessages: [] }, lid);
        results[lid] = 'archived';
      } catch (e) {
        results[lid] = `error: ${e.message}`;
      }
    }
    return results;
  }

  /**
   * Delete a chat permanently from WhatsApp (dual JID + optional LID).
   */
  async deleteChat(to, lid = null) {
    const jid = to.includes('@') ? to : cleanPhoneToJid(to);
    const results = {};
    try {
      await this.sock.chatModify({ delete: true, lastMessages: [] }, jid);
      results[jid] = 'deleted';
    } catch (e) {
      results[jid] = `error: ${e.message}`;
    }
    if (lid) {
      try {
        await this.sock.chatModify({ delete: true, lastMessages: [] }, lid);
        results[lid] = 'deleted';
      } catch (e) {
        results[lid] = `error: ${e.message}`;
      }
    }
    return results;
  }

  /**
   * Mark chat as read.
   */
  async markChatAsRead(to) {
    const jid = to.includes('@') ? to : cleanPhoneToJid(to);
    return await this.sock.chatModify({ markRead: true, lastMessages: [] }, jid);
  }

  // --- 3. GROUP MANAGEMENT POWERS ---

  /**
   * Add participants with automatic 403 privacy detection and private DM invite link fallback.
   */
  async addGroupParticipants(groupId, phones, inviteFallbackUrl = 'https://chat.whatsapp.com/Ewr17jiqmON1eD5QDWxXUN') {
    const groupMeta = await this.sock.groupMetadata(groupId);
    const existing = new Set(groupMeta.participants.map(p => p.id));
    const results = [];

    for (let i = 0; i < phones.length; i++) {
      const phone = phones[i];
      const jid = cleanPhoneToJid(phone);

      if (existing.has(jid)) {
        results.push({ phone, jid, status: 'already_member' });
        continue;
      }

      try {
        const updateRes = await this.sock.groupParticipantsUpdate(groupId, [jid], 'add');
        const status = updateRes[0]?.status;

        if (status === '403') {
          // Privacy lock: send DM invite
          const firstName = phone;
          const msg = `Bonjour ! 👋\n\nOn a voulu t'ajouter au groupe officiel Dentalk Club (${groupMeta.subject}), mais tes paramètres de confidentialité restreignent l'ajout direct.\n\nVoici ton lien d'invitation personnel : 🦷✨\n${inviteFallbackUrl}\n\nÀ très vite au club !`;
          await this.sendText(jid, msg);
          results.push({ phone, jid, status: '403_invite_sent' });
        } else {
          results.push({ phone, jid, status: status || 'ok' });
        }
      } catch (e) {
        results.push({ phone, jid, status: `error: ${e.message}` });
      }

      if (i < phones.length - 1) {
        await randomJitter(2000, 3500);
      }
    }

    return results;
  }

  /**
   * Remove participant from group.
   */
  async removeGroupParticipants(groupId, phones) {
    const jids = phones.map(p => cleanPhoneToJid(p));
    return await this.sock.groupParticipantsUpdate(groupId, jids, 'remove');
  }

  /**
   * Promote members to admin.
   */
  async promoteAdmins(groupId, phones) {
    const jids = phones.map(p => cleanPhoneToJid(p));
    return await this.sock.groupParticipantsUpdate(groupId, jids, 'promote');
  }

  /**
   * Demote admins to regular members.
   */
  async demoteAdmins(groupId, phones) {
    const jids = phones.map(p => cleanPhoneToJid(p));
    return await this.sock.groupParticipantsUpdate(groupId, jids, 'demote');
  }

  /**
   * Get group invite link.
   */
  async getGroupInviteLink(groupId) {
    const code = await this.sock.groupInviteCode(groupId);
    return `https://chat.whatsapp.com/${code}`;
  }

  /**
   * Get group metadata (subject, description, participants list).
   */
  async getGroupInfo(groupId) {
    return await this.sock.groupMetadata(groupId);
  }

  // --- 4. CONTACT & UTILITY POWERS ---

  /**
   * Check if phone numbers are registered on WhatsApp.
   */
  async checkOnWhatsApp(phones) {
    const jids = phones.map(p => cleanPhoneToJid(p));
    return await this.sock.onWhatsApp(...jids);
  }

  /**
   * Fetch profile picture URL.
   */
  async getProfilePictureUrl(to) {
    const jid = to.includes('@') ? to : cleanPhoneToJid(to);
    try {
      return await this.sock.profilePictureUrl(jid, 'image');
    } catch (e) {
      return null;
    }
  }

  /**
   * Fetch contact status/about bio.
   */
  async getContactStatus(to) {
    const jid = to.includes('@') ? to : cleanPhoneToJid(to);
    try {
      return await this.sock.fetchStatus(jid);
    } catch (e) {
      return null;
    }
  }

  /**
   * Close socket cleanly.
   */
  destroy() {
    try {
      this.sock.end();
    } catch (e) {}
  }
}
