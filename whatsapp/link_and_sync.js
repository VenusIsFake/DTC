import makeWASocket, {
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  Browsers,
  DisconnectReason
} from '@whiskeysockets/baileys';
import pino from 'pino';
import qrcode from 'qrcode';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const AUTH_DIR = path.resolve(__dirname, 'auth_info');
const DATA_DIR = path.resolve(__dirname, 'data');
const QR_PATH = path.resolve(__dirname, '../public/dtc_whatsapp_qr.png');

if (!fs.existsSync(AUTH_DIR)) fs.mkdirSync(AUTH_DIR, { recursive: true });
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

// Load candidates to monitor
let candidates = [];
try {
  candidates = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../broadcast_results.json'), 'utf8'));
} catch (e) {}

let candidateLids = [];
try {
  candidateLids = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../candidate_lids.json'), 'utf8'));
} catch (e) {}

const candidateMap = new Map();
for (const c of candidates) {
  let clean = c.phone.replace(/\D/g, '');
  if (clean.startsWith('0')) clean = '212' + clean.slice(1);
  const jid = `${clean}@s.whatsapp.net`;
  const lidObj = candidateLids.find(l => l.jid === jid);
  candidateMap.set(jid, { ...c, cleanPhone: clean, jid, lid: lidObj?.lid || null });
  if (lidObj?.lid) {
    candidateMap.set(lidObj.lid, { ...c, cleanPhone: clean, jid, lid: lidObj.lid });
  }
}

function extractText(msg) {
  if (!msg) return '';
  const m = msg.message?.ephemeralMessage?.message || 
            msg.message?.viewOnceMessage?.message || 
            msg.message?.viewOnceMessageV2?.message || 
            msg.message?.documentWithCaptionMessage?.message ||
            msg.message;
  if (!m) return msg.messageStubType ? `[Stub: ${msg.messageStubType}]` : '';
  if (m.conversation) return m.conversation;
  if (m.extendedTextMessage?.text) return m.extendedTextMessage.text;
  if (m.imageMessage?.caption) return `[Photo: ${m.imageMessage.caption}]`;
  if (m.imageMessage) return '[Photo]';
  if (m.videoMessage?.caption) return `[Video: ${m.videoMessage.caption}]`;
  if (m.videoMessage) return '[Video]';
  if (m.audioMessage) return '[Audio / Voice Note]';
  if (m.documentMessage) return `[Document: ${m.documentMessage.fileName || ''}]`;
  if (m.reactionMessage) return `[Reaction: ${m.reactionMessage.text || ''}]`;
  return `[${Object.keys(m)[0] || 'Unknown'}]`;
}

const recordedMessages = [];
const matchedCandidateReplies = {};

async function start() {
  console.log('=== DTC WhatsApp Isolated Session Initializing ===');
  console.log(`Auth directory: ${AUTH_DIR}`);
  console.log(`Tracking ${candidates.length} broadcast candidates`);

  const { state, saveCreds } = await useMultiFileAuthState(AUTH_DIR);
  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version,
    logger: pino({ level: 'silent' }),
    auth: state,
    browser: Browsers.ubuntu('Chrome'),
    syncFullHistory: false, // History already dumped, live monitoring mode
    markOnlineOnConnect: false
  });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      console.log('\n======================================================');
      console.log('📱 SCAN THIS DTC QR CODE WITH YOUR WHATSAPP:');
      console.log('======================================================\n');
      qrcode.toString(qr, { type: 'terminal', small: true }, (err, str) => {
        if (!err) console.log(str);
      });
      try {
        const dataUrl = await qrcode.toDataURL(qr);
        const base64Data = dataUrl.replace(/^data:image\/png;base64,/, '');
        fs.writeFileSync(QR_PATH, base64Data, 'base64');
        console.log(`\nQR code image also saved to: ${QR_PATH}`);
      } catch (e) {}
    }

    if (connection === 'open') {
      console.log('\n🎉 [DTC WhatsApp] CONNECTED SUCCESSFULLY!');
      console.log(`Connected account: ${sock.user?.id} (${sock.user?.name || 'DTC'})`);
      console.log('Waiting for phone to push full history stream...');
    }

    if (connection === 'close') {
      const code = lastDisconnect?.error?.output?.statusCode;
      const shouldReconnect = code !== DisconnectReason.loggedOut;
      console.log(`[DTC WhatsApp] Connection closed (status: ${code}). Reconnecting: ${shouldReconnect}`);
      if (shouldReconnect) {
        setTimeout(start, 3000);
      } else {
        console.log('[DTC WhatsApp] Session logged out. Exiting.');
        process.exit(1);
      }
    }
  });

  // Handle Full Historical Sync Push
  sock.ev.on('messaging-history.set', (history) => {
    console.log(`\n📥 [HISTORY SYNC RECEIVED] Chats: ${history.chats?.length || 0}, Messages: ${history.messages?.length || 0}`);
    
    if (history.messages) {
      for (const msg of history.messages) {
        const jid = msg.key?.remoteJid;
        const text = extractText(msg);
        const fromMe = Boolean(msg.key?.fromMe);
        const timestamp = Number(msg.messageTimestamp) * 1000 || Date.now();

        recordedMessages.push({
          id: msg.key?.id,
          jid,
          fromMe,
          pushName: msg.pushName || null,
          text,
          timestamp
        });

        // Check if message belongs to a candidate
        if (candidateMap.has(jid)) {
          const cand = candidateMap.get(jid);
          if (!fromMe && text) {
            if (!matchedCandidateReplies[cand.cleanPhone]) {
              matchedCandidateReplies[cand.cleanPhone] = {
                candidate: cand.name,
                phone: cand.cleanPhone,
                jid: cand.jid,
                lid: cand.lid,
                replies: []
              };
            }
            matchedCandidateReplies[cand.cleanPhone].replies.push({
              id: msg.key?.id,
              text,
              pushName: msg.pushName,
              timestamp
            });
            console.log(`⭐ [CANDIDATE REPLY FOUND] ${cand.name} (${cand.cleanPhone}): "${text}"`);
          }
        }
      }

      // Save snapshots
      fs.writeFileSync(path.join(DATA_DIR, 'dtc_history_dump.json'), JSON.stringify(recordedMessages, null, 2));
      fs.writeFileSync(path.join(DATA_DIR, 'dtc_candidate_replies.json'), JSON.stringify(matchedCandidateReplies, null, 2));
      console.log(`💾 Saved ${recordedMessages.length} total messages, ${Object.keys(matchedCandidateReplies).length} candidate replies recorded!`);
    }
  });

  // Handle live incoming messages
  sock.ev.on('messages.upsert', ({ messages, type }) => {
    for (const msg of messages) {
      const jid = msg.key?.remoteJid;
      const text = extractText(msg);
      const fromMe = Boolean(msg.key?.fromMe);
      const timestamp = Number(msg.messageTimestamp) * 1000 || Date.now();

      if (candidateMap.has(jid) && !fromMe && text) {
        const cand = candidateMap.get(jid);
        if (!matchedCandidateReplies[cand.cleanPhone]) {
          matchedCandidateReplies[cand.cleanPhone] = {
            candidate: cand.name,
            phone: cand.cleanPhone,
            jid: cand.jid,
            lid: cand.lid,
            replies: []
          };
        }
        matchedCandidateReplies[cand.cleanPhone].replies.push({
          id: msg.key?.id,
          text,
          pushName: msg.pushName,
          timestamp
        });
        console.log(`⭐ [LIVE CANDIDATE REPLY] ${cand.name} (${cand.cleanPhone}): "${text}"`);
        fs.writeFileSync(path.join(DATA_DIR, 'dtc_candidate_replies.json'), JSON.stringify(matchedCandidateReplies, null, 2));
      }
    }
  });
}

start().catch(console.error);
