import makeWASocket, {
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  DisconnectReason,
  Browsers
} from '@whiskeysockets/baileys';
import pino from 'pino';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Dedicated DTC WhatsApp credentials directory
const AUTH_DIR = process.env.WA_AUTH_DIR || path.resolve(__dirname, 'auth_info');

export class DTCWhatsApp {
  constructor() {
    this.sock = null;
    this.status = 'disconnected';
    this.user = null;
  }

  async connect() {
    if (this.sock && this.status === 'connected') return this.sock;

    const { state, saveCreds } = await useMultiFileAuthState(AUTH_DIR);
    const { version } = await fetchLatestBaileysVersion();

    this.sock = makeWASocket({
      version,
      logger: pino({ level: 'silent' }),
      auth: state,
      browser: Browsers.ubuntu('Chrome'),
      syncFullHistory: false,
      markOnlineOnConnect: false
    });

    this.sock.ev.on('creds.update', saveCreds);

    return new Promise((resolve, reject) => {
      this.sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect, qr } = update;
        if (connection === 'open') {
          this.status = 'connected';
          this.user = this.sock.user;
          console.log('[DTC WhatsApp] Connected as:', this.user?.id);
          resolve(this.sock);
        } else if (connection === 'close') {
          this.status = 'disconnected';
          const code = lastDisconnect?.error?.output?.statusCode;
          if (code === DisconnectReason.loggedOut) {
            reject(new Error('WhatsApp session logged out'));
          }
        }
      });
    });
  }

  // Format phone to WhatsApp international format (e.g. 212671642491)
  formatNumber(phone) {
    let d = String(phone).replace(/\D/g, '');
    if (d.startsWith('0')) d = '212' + d.slice(1);
    return d;
  }

  // Check which numbers are registered on WhatsApp
  async checkNumbers(phones) {
    if (!this.sock || this.status !== 'connected') {
      await this.connect();
    }
    const clean = phones.map(p => this.formatNumber(p)).filter(Boolean);
    const results = [];

    // Query in batches of 10 to respect rate limits
    for (let i = 0; i < clean.length; i += 10) {
      const batch = clean.slice(i, i + 10);
      try {
        const res = await this.sock.onWhatsApp(...batch);
        if (Array.isArray(res)) results.push(...res);
      } catch (err) {
        console.error('[DTC WhatsApp] Batch check error:', err.message);
      }
      if (i + 10 < clean.length) {
        await new Promise(r => setTimeout(r, 500));
      }
    }
    return results;
  }

  // Send a message
  async sendMessage(phone, text) {
    if (!this.sock || this.status !== 'connected') {
      await this.connect();
    }
    const jid = `${this.formatNumber(phone)}@s.whatsapp.net`;
    return await this.sock.sendMessage(jid, { text });
  }

  async close() {
    if (this.sock) {
      this.sock.end(new Error('Closed by client'));
      this.status = 'disconnected';
    }
  }
}

export default new DTCWhatsApp();
