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
const CLASSIFIED_PATH = path.resolve(__dirname, '../candidates_classified.json');

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
  const entry = { ...c, cleanPhone: clean, jid, lid: lidObj?.lid || null };
  candidateMap.set(jid, entry);
  if (lidObj?.lid) {
    candidateMap.set(lidObj.lid, entry);
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

function getStoredReplies() {
  const filePath = path.join(DATA_DIR, 'dtc_candidate_replies.json');
  if (fs.existsSync(filePath)) {
    try {
      return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch (e) {}
  }
  return {};
}

function saveReplies(data) {
  const filePath = path.join(DATA_DIR, 'dtc_candidate_replies.json');
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
}

async function start() {
  console.log('=== DTC WhatsApp Two-Way Live Monitor Initializing ===');
  console.log(`Auth Directory: ${AUTH_DIR}`);
  console.log(`Monitoring ${candidates.length} candidates (Incoming + President Phone Replies)`);

  const { state, saveCreds } = await useMultiFileAuthState(AUTH_DIR);
  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version,
    logger: pino({ level: 'silent' }),
    auth: state,
    browser: Browsers.ubuntu('Chrome'),
    syncFullHistory: false,
    markOnlineOnConnect: false
  });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect } = update;

    if (connection === 'open') {
      console.log(`\n🎉 [DTC Live Monitor] Connected as ${sock.user?.id} (${sock.user?.name || 'DTC'})`);
      console.log('👂 Actively listening for:');
      console.log('   1. Inbound messages from candidates');
      console.log('   2. Outbound replies sent directly from President\'s phone (fromMe)');
    }

    if (connection === 'close') {
      const code = lastDisconnect?.error?.output?.statusCode;
      const shouldReconnect = code !== DisconnectReason.loggedOut;
      console.log(`[DTC Live Monitor] Connection closed (code: ${code}). Reconnecting: ${shouldReconnect}`);
      if (shouldReconnect) {
        setTimeout(start, 3000);
      } else {
        console.error('[DTC Live Monitor] Logged out. Re-linking required.');
        process.exit(1);
      }
    }
  });

  // Handle live messages (both incoming & outgoing from president's phone)
  sock.ev.on('messages.upsert', ({ messages, type }) => {
    const repliesStore = getStoredReplies();
    let hasChanges = false;

    for (const msg of messages) {
      const jid = msg.key?.remoteJid;
      const fromMe = Boolean(msg.key?.fromMe);
      const text = extractText(msg);
      const timestamp = Number(msg.messageTimestamp) * 1000 || Date.now();
      const msgId = msg.key?.id;

      if (!jid || !text || jid.endsWith('@g.us')) continue;

      // Check if message is with a tracked candidate
      if (candidateMap.has(jid)) {
        const cand = candidateMap.get(jid);
        const phone = cand.cleanPhone;

        if (!repliesStore[phone]) {
          repliesStore[phone] = {
            candidate: cand.name,
            phone: cand.cleanPhone,
            jid: cand.jid,
            lid: cand.lid,
            replies: [],
            presidentReplies: [],
            conversationHistory: []
          };
        }

        if (!repliesStore[phone].presidentReplies) repliesStore[phone].presidentReplies = [];
        if (!repliesStore[phone].conversationHistory) repliesStore[phone].conversationHistory = [];

        // Check deduplication
        const alreadyLogged = repliesStore[phone].conversationHistory.some(m => m.id === msgId);
        if (alreadyLogged) continue;

        const record = {
          id: msgId,
          fromMe,
          sender: fromMe ? 'President (Phone)' : cand.name,
          text,
          timestamp,
          isoTime: new Date(timestamp).toISOString()
        };

        repliesStore[phone].conversationHistory.push(record);
        hasChanges = true;

        if (fromMe) {
          // Message sent from President's phone!
          console.log(`\n📱 [PRESIDENT REPLIED ON PHONE] to ${cand.name} (${phone}):`);
          console.log(`   "${text}"`);
          repliesStore[phone].presidentReplies.push({ id: msgId, text, timestamp });

          // If candidate had a pending question, resolve it automatically
          if (fs.existsSync(CLASSIFIED_PATH)) {
            try {
              const classified = JSON.parse(fs.readFileSync(CLASSIFIED_PATH, 'utf8'));
              const qIdx = classified.has_question?.findIndex(q => q.name === cand.name || q.phone.includes(phone.slice(-9)));
              if (qIdx !== -1) {
                const item = classified.has_question.splice(qIdx, 1)[0];
                item.status = `Addressed by President on phone: "${text.slice(0, 40)}..."`;
                item.presidentReply = text;
                item.resolvedAt = new Date().toISOString();
                classified.confirmed.push(item);
                classified.summary.has_question = classified.has_question.length;
                classified.summary.confirmed = classified.confirmed.length;
                fs.writeFileSync(CLASSIFIED_PATH, JSON.stringify(classified, null, 2), 'utf8');
                console.log(`   ✨ Automatically resolved question in candidates_classified.json -> Moved to Confirmed!`);
              }
            } catch (e) {}
          }
        } else {
          // Inbound message from candidate
          console.log(`\n📩 [CANDIDATE INCOMING] ${cand.name} (${phone}):`);
          console.log(`   "${text}"`);
          repliesStore[phone].replies.push({ id: msgId, text, pushName: msg.pushName || null, timestamp });
        }
      }
    }

    if (hasChanges) {
      saveReplies(repliesStore);
    }
  });
}

start().catch(console.error);
