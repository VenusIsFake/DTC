import makeWASocket, {
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  Browsers,
  DisconnectReason
} from '@whiskeysockets/baileys';
import pino from 'pino';
import fs from 'fs';
import path from 'path';
import http from 'http';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const AUTH_DIR = path.resolve(__dirname, 'auth_info');
const DATA_DIR = path.resolve(__dirname, 'data');
const CLASSIFIED_PATH = path.resolve(__dirname, '../candidates_classified.json');
const TARGET_GROUP_JID = '120363430121946139@g.us';
const PORT = 4545;

if (!fs.existsSync(AUTH_DIR)) fs.mkdirSync(AUTH_DIR, { recursive: true });
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

let sock = null;
let isConnected = false;
let reconnectAttempts = 0;

function cleanPhoneToJid(phone) {
  if (!phone) return null;
  let clean = phone.replace(/\D/g, '');
  if (clean.startsWith('0')) clean = '212' + clean.slice(1);
  if (!clean.startsWith('212')) clean = '212' + clean;
  return `${clean}@s.whatsapp.net`;
}

async function startWhatsApp() {
  console.log('=== DTC Permanent Daemon Starting ===');
  console.log(`Auth Directory: ${AUTH_DIR}`);

  const { state, saveCreds } = await useMultiFileAuthState(AUTH_DIR);
  const { version } = await fetchLatestBaileysVersion();

  sock = makeWASocket({
    version,
    logger: pino({ level: 'silent' }),
    auth: state,
    browser: Browsers.ubuntu('Chrome'),
    syncFullHistory: false,
    markOnlineOnConnect: false,
    keepAliveIntervalMs: 25000,
    connectTimeoutMs: 60000
  });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      console.log('📱 [DTC Daemon] QR Code generated:');
      try {
        const qrcode = (await import('qrcode')).default;
        await qrcode.toFile(path.resolve(__dirname, '../public/dtc_whatsapp_qr.png'), qr);
        qrcode.toString(qr, { type: 'terminal', small: true }, (err, str) => {
          if (!err) console.log(str);
        });
      } catch (e) {}
    }

    if (connection === 'open') {
      isConnected = true;
      reconnectAttempts = 0;
      console.log(`\n🎉 [DTC DAEMON] SESSION FULLY CONNECTED & ACTIVE!`);
      console.log(`Account: ${sock.user?.id} (${sock.user?.name || 'Dentalk Club'})`);
      console.log(`Listening on local control port ${PORT}...`);
    }

    if (connection === 'close') {
      isConnected = false;
      const statusCode = lastDisconnect?.error?.output?.statusCode;
      const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
      console.log(`[DTC Daemon] Connection closed (code: ${statusCode}). Reconnecting: ${shouldReconnect}`);

      if (shouldReconnect) {
        reconnectAttempts++;
        const delay = Math.min(3000 * reconnectAttempts, 15000);
        console.log(`Reconnecting in ${delay / 1000}s...`);
        setTimeout(startWhatsApp, delay);
      } else {
        console.log('🔄 [DTC Daemon] Invalid session (401). Resetting auth_info for fresh pairing QR...');
        fs.rmSync(AUTH_DIR, { recursive: true, force: true });
        fs.mkdirSync(AUTH_DIR, { recursive: true });
        setTimeout(startWhatsApp, 1500);
      }
    }
  });

  // Track messages (both incoming candidates & President phone replies)
  sock.ev.on('messages.upsert', ({ messages }) => {
    for (const msg of messages) {
      const fromMe = Boolean(msg.key?.fromMe);
      const text = msg.message?.conversation || msg.message?.extendedTextMessage?.text || '';
      const jid = msg.key?.remoteJid;
      if (text && jid && !jid.endsWith('@g.us')) {
        const sender = fromMe ? 'President (Phone)' : jid;
        console.log(`💬 [MSG] ${sender}: "${text.slice(0, 50)}"`);
      }
    }
  });
}

// Local HTTP Control Server (Zero Socket Collisions!)
const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  res.setHeader('Content-Type', 'application/json');

  if (url.pathname === '/status') {
    res.end(JSON.stringify({
      connected: isConnected,
      account: sock?.user || null
    }));
    return;
  }

  if (!isConnected || !sock) {
    res.statusCode = 503;
    res.end(JSON.stringify({ error: 'WhatsApp not connected' }));
    return;
  }

  try {
    if (url.pathname === '/group-info') {
      const groupId = url.searchParams.get('id') || TARGET_GROUP_JID;
      const meta = await sock.groupMetadata(groupId);
      res.end(JSON.stringify(meta));
      return;
    }

    if (url.pathname === '/check-group') {
      const groupId = url.searchParams.get('id') || TARGET_GROUP_JID;
      const meta = await sock.groupMetadata(groupId);
      const classified = JSON.parse(fs.readFileSync(CLASSIFIED_PATH, 'utf8'));
      
      const participants = meta.participants || [];
      const participantJids = new Set(participants.map(p => p.id));
      
      const inGroup = [];
      const notInGroup = [];

      for (const c of classified.confirmed) {
        const jid = cleanPhoneToJid(c.phone);
        // Also check if LID matches
        const mapFile = `whatsapp/auth_info/lid-mapping-${cleanPhoneToJid(c.phone).split('@')[0]}.json`;
        let lid = null;
        if (fs.existsSync(mapFile)) {
          try { lid = JSON.parse(fs.readFileSync(mapFile, 'utf8')); } catch (e) {}
        }
        
        const exists = participantJids.has(jid) || (lid && participantJids.has(lid));
        if (exists) {
          inGroup.push(c);
        } else {
          notInGroup.push(c);
        }
      }

      res.end(JSON.stringify({
        subject: meta.subject,
        totalParticipants: participants.length,
        totalConfirmed: classified.confirmed.length,
        inGroupCount: inGroup.length,
        notInGroupCount: notInGroup.length,
        inGroup: inGroup.map(c => ({ name: c.name, phone: c.phone })),
        notInGroup: notInGroup.map(c => ({ name: c.name, phone: c.phone }))
      }));
      return;
    }

    res.statusCode = 404;
    res.end(JSON.stringify({ error: 'Not found' }));
  } catch (err) {
    res.statusCode = 500;
    res.end(JSON.stringify({ error: err.message }));
  }
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`Control server listening on 127.0.0.1:${PORT}`);
  startWhatsApp().catch(console.error);
});
