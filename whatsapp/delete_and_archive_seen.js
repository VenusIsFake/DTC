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

const seenCandidates = [
  {
    name: "Al Batoul El Rhassir",
    phone: "0693035863",
    jid: "212693035863@s.whatsapp.net",
    lid: "87475649298454@lid",
    email: "elrhassiralbatoul@gmail.com",
    notes: "Broadcast received & seen. No reply."
  },
  {
    name: "Fadoua Moutayannice",
    phone: "0774125509",
    jid: "212774125509@s.whatsapp.net",
    lid: "209470269468830@lid",
    notes: "Broadcast received & seen. No reply."
  },
  {
    name: "Jalil Yasmine",
    phone: "0619894323",
    jid: "212619894323@s.whatsapp.net",
    lid: "88433443745856@lid",
    notes: "Broadcast received & seen. No reply."
  },
  {
    name: "Khaoula Nidbella",
    phone: "0605445733",
    jid: "212605445733@s.whatsapp.net",
    lid: "246042117287972@lid",
    notes: "Broadcast received & seen. No reply."
  },
  {
    name: "Lamkaidam Salma",
    phone: "0619201668",
    jid: "212619201668@s.whatsapp.net",
    lid: "25482108133487@lid",
    email: "salmasulli9@gmail.com",
    notes: "Broadcast received & seen. No reply."
  },
  {
    name: "Meryem Tarlamani",
    phone: "0716661118",
    jid: "212716661118@s.whatsapp.net",
    lid: "21071730311320@lid",
    notes: "Broadcast received & seen. No reply."
  },
  {
    name: "Nassima Elhor",
    phone: "0620101960",
    jid: "212620101960@s.whatsapp.net",
    lid: "158291221061847@lid",
    notes: "Broadcast received & seen. Blank reaction only."
  },
  {
    name: "Wissal Zakaria",
    phone: "0710258956",
    jid: "212710258956@s.whatsapp.net",
    lid: "143164581101707@lid",
    notes: "Broadcast received & seen. No reply."
  }
];

// Step 1: Save local permanent archive
const archivePayload = {
  archivedAt: new Date().toISOString(),
  count: seenCandidates.length,
  reason: "Seen broadcast message without reply. Conversations deleted from WhatsApp per President instruction. Kept in project archive.",
  candidates: seenCandidates
};
const archivePath = path.join(DATA_DIR, 'archived_seen_no_replies.json');
fs.writeFileSync(archivePath, JSON.stringify(archivePayload, null, 2), 'utf8');
console.log(`📁 Saved permanent project archive to: ${archivePath}`);

// Step 2: Connect to DTC WhatsApp socket and delete conversations
async function executeWhatsAppDeletion() {
  console.log("Connecting to DTC WhatsApp instance...");
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

  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect } = update;

    if (connection === 'open') {
      console.log(`✅ [DTC WhatsApp] Connected as ${sock.user?.id} (${sock.user?.name || 'DTC'})`);
      console.log(`Starting deletion of ${seenCandidates.length} chats from WhatsApp...`);

      const executionResults = [];

      for (const c of seenCandidates) {
        console.log(`\nProcessing: ${c.name} (${c.phone})...`);
        const itemResult = { name: c.name, phone: c.phone, actions: {} };

        // Delete JID chat
        try {
          await sock.chatModify({ delete: true, lastMessages: [] }, c.jid);
          itemResult.actions[c.jid] = "deleted";
          console.log(`  -> Deleted chat for JID: ${c.jid}`);
        } catch (e) {
          console.warn(`  -> Delete JID error: ${e.message}`);
          itemResult.actions[c.jid] = `error: ${e.message}`;
        }

        // Delete LID chat if available
        if (c.lid) {
          try {
            await sock.chatModify({ delete: true, lastMessages: [] }, c.lid);
            itemResult.actions[c.lid] = "deleted";
            console.log(`  -> Deleted chat for LID: ${c.lid}`);
          } catch (e) {
            console.warn(`  -> Delete LID error: ${e.message}`);
            itemResult.actions[c.lid] = `error: ${e.message}`;
          }
        }

        executionResults.push(itemResult);
        await new Promise(r => setTimeout(r, 600));
      }

      fs.writeFileSync(
        path.resolve(__dirname, '../deleted_seen_chats_results.json'),
        JSON.stringify(executionResults, null, 2)
      );

      console.log("\n🎉 All 8 seen candidate conversations deleted from WhatsApp!");
      console.log("Closing connection.");
      setTimeout(() => {
        sock.end();
        process.exit(0);
      }, 2000);
    }

    if (connection === 'close') {
      const code = lastDisconnect?.error?.output?.statusCode;
      if (code === DisconnectReason.loggedOut) {
        console.error("❌ Logged out of WhatsApp.");
        process.exit(1);
      }
    }
  });
}

executeWhatsAppDeletion().catch(console.error);
