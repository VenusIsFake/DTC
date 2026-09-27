import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { DtcWhatsAppAgent, cleanPhoneToJid } from './engine.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CLASSIFIED_PATH = path.resolve(__dirname, '../candidates_classified.json');
const TARGET_GROUP_JID = '120363430121946139@g.us'; // "Dentalk Club 🦷" (8 bureau admins, DTC is superadmin)
const GROUP_INVITE_URL = 'https://chat.whatsapp.com/Ewr17jiqmON1eD5QDWxXUN';

function printStatus() {
  if (!fs.existsSync(CLASSIFIED_PATH)) {
    console.log('No candidates_classified.json found.');
    return;
  }
  const data = JSON.parse(fs.readFileSync(CLASSIFIED_PATH, 'utf8'));
  console.log('\n=== DTC WHATSAPP CANDIDATES ROSTER STATUS ===');
  console.log(`Total Candidates: ${data.total}`);
  console.log(`🟢 Confirmed / Interested: ${data.summary.confirmed}`);
  console.log(`❓ Has Question: ${data.summary.has_question}`);
  console.log(`🔴 Declined: ${data.summary.declined}`);
  console.log(`👀 Seen (No reply, deleted): ${data.summary.seen_no_reply}`);
  console.log(`📦 Unseen (No site account): ${data.summary.unseen}`);

  if (data.has_question && data.has_question.length > 0) {
    console.log('\n--- PENDING QUESTIONS ---');
    data.has_question.forEach(q => {
      console.log(`Candidate: ${q.name} (${q.phone})`);
      console.log(`Question: "${q.reply}"`);
    });
  }
}

async function main() {
  const [,, command, ...args] = process.argv;

  if (!command || command === 'help' || command === '--help') {
    console.log(`
🦸 DTC WhatsApp Superpower CLI
Usage: node whatsapp/cli.js <command> [options]

Core Operations:
  status                                      - View roster breakdown & pending questions
  add-confirmed                               - Add all 23 confirmed candidates to Dentalkclub group
  reply <phone> "<msg>"                       - Reply to a candidate & auto-update classification
  send-text <phone> "<msg>"                   - Send text message with human typing presence
  send-media <phone> <filePath> ["<caption>"] - Send image, video, audio, or document
  send-contact <phone> "<name>" <cardPhone>   - Send vCard contact card
  react <phone> <msgId> <emoji>               - React to a message with emoji

Group Management:
  group-add <groupId> <phone...>              - Add one or multiple numbers to a group
  group-remove <groupId> <phone...>           - Remove members from a group
  group-invite <groupId>                      - Fetch group invite link
  group-info <groupId>                        - Get group name, participants, description

Chat & Utility:
  chat-archive <phone> [lid]                  - Archive chat (JID + LID)
  chat-delete <phone> [lid]                   - Delete chat from WhatsApp (JID + LID)
  check-number <phone...>                     - Check if phone numbers are on WhatsApp
  info <phone>                                - Fetch profile picture and about/bio
`);
    process.exit(0);
  }

  if (command === 'status') {
    printStatus();
    process.exit(0);
  }

  // Commands requiring live WhatsApp socket connection
  console.log('Connecting to DTC WhatsApp instance...');
  const agent = await DtcWhatsAppAgent.init();
  console.log('Connected!\n');

  try {
    switch (command) {
      case 'reply': {
        const [phone, text] = args;
        if (!phone || !text) throw new Error('Usage: reply <phone> "<text>"');
        console.log(`Sending reply to ${phone}...`);
        const res = await agent.sendText(phone, text);
        console.log(`✅ Sent! Message ID: ${res.key.id}`);

        // Update classification if candidate was in has_question
        if (fs.existsSync(CLASSIFIED_PATH)) {
          const data = JSON.parse(fs.readFileSync(CLASSIFIED_PATH, 'utf8'));
          const qIndex = data.has_question?.findIndex(q => q.phone.replace(/\D/g, '').endsWith(phone.replace(/\D/g, '').slice(-9)));
          if (qIndex !== -1 && qIndex !== undefined) {
            const item = data.has_question.splice(qIndex, 1)[0];
            item.status = `Replied via CLI: "${text}"`;
            item.repliedAt = new Date().toISOString();
            data.confirmed.push(item);
            data.summary.has_question = data.has_question.length;
            data.summary.confirmed = data.confirmed.length;
            fs.writeFileSync(CLASSIFIED_PATH, JSON.stringify(data, null, 2), 'utf8');
            console.log(`✨ Moved ${item.name} from has_question to Confirmed.`);
          }
        }
        break;
      }

      case 'send-text': {
        const [phone, text] = args;
        if (!phone || !text) throw new Error('Usage: send-text <phone> "<text>"');
        const res = await agent.sendText(phone, text);
        console.log(`✅ Sent to ${phone}! Message ID: ${res.key.id}`);
        break;
      }

      case 'send-media': {
        const [phone, filePath, caption = ''] = args;
        if (!phone || !filePath) throw new Error('Usage: send-media <phone> <filePath> ["<caption>"]');
        const res = await agent.sendMedia(phone, filePath, caption);
        console.log(`✅ Media sent to ${phone}! Message ID: ${res.key.id}`);
        break;
      }

      case 'send-contact': {
        const [phone, name, cardPhone] = args;
        if (!phone || !name || !cardPhone) throw new Error('Usage: send-contact <phone> "<name>" <cardPhone>');
        const res = await agent.sendContact(phone, { name, phone: cardPhone });
        console.log(`✅ Contact card for ${name} sent to ${phone}! Message ID: ${res.key.id}`);
        break;
      }

      case 'react': {
        const [phone, msgId, emoji] = args;
        if (!phone || !msgId || !emoji) throw new Error('Usage: react <phone> <msgId> <emoji>');
        const jid = cleanPhoneToJid(phone);
        await agent.react(jid, { remoteJid: jid, id: msgId, fromMe: false }, emoji);
        console.log(`✅ Reacted with ${emoji} to ${msgId}`);
        break;
      }

      case 'add-confirmed': {
        if (!fs.existsSync(CLASSIFIED_PATH)) throw new Error('candidates_classified.json not found');
        const data = JSON.parse(fs.readFileSync(CLASSIFIED_PATH, 'utf8'));
        const phones = data.confirmed.map(c => c.phone);
        console.log(`Processing ${phones.length} confirmed candidates for group ${TARGET_GROUP_JID}...`);
        const results = await agent.addGroupParticipants(TARGET_GROUP_JID, phones, GROUP_INVITE_URL);
        console.log('Results summary:');
        results.forEach(r => console.log(`  - ${r.phone}: ${r.status}`));
        const outPath = path.resolve(__dirname, '../add_confirmed_results.json');
        fs.writeFileSync(outPath, JSON.stringify(results, null, 2), 'utf8');
        console.log(`\n🎉 Results saved to ${outPath}`);
        break;
      }

      case 'group-add': {
        const [groupId, ...phones] = args;
        if (!groupId || phones.length === 0) throw new Error('Usage: group-add <groupId> <phone...>');
        const res = await agent.addGroupParticipants(groupId, phones);
        console.log('Add results:', res);
        break;
      }

      case 'group-remove': {
        const [groupId, ...phones] = args;
        if (!groupId || phones.length === 0) throw new Error('Usage: group-remove <groupId> <phone...>');
        const res = await agent.removeGroupParticipants(groupId, phones);
        console.log('Remove results:', res);
        break;
      }

      case 'group-invite': {
        const [groupId] = args;
        if (!groupId) throw new Error('Usage: group-invite <groupId>');
        const link = await agent.getGroupInviteLink(groupId);
        console.log(`🔗 Group Invite Link: ${link}`);
        break;
      }

      case 'group-info': {
        const [groupId] = args;
        if (!groupId) throw new Error('Usage: group-info <groupId>');
        const info = await agent.getGroupInfo(groupId);
        console.log(`Group Subject: ${info.subject}`);
        console.log(`Group Owner: ${info.owner}`);
        console.log(`Members Count: ${info.participants?.length}`);
        console.log(`Description: ${info.desc || 'None'}`);
        break;
      }

      case 'chat-archive': {
        const [phone, lid] = args;
        if (!phone) throw new Error('Usage: chat-archive <phone> [lid]');
        const res = await agent.archiveChat(phone, lid);
        console.log('Archive results:', res);
        break;
      }

      case 'chat-delete': {
        const [phone, lid] = args;
        if (!phone) throw new Error('Usage: chat-delete <phone> [lid]');
        const res = await agent.deleteChat(phone, lid);
        console.log('Delete results:', res);
        break;
      }

      case 'check-number': {
        if (args.length === 0) throw new Error('Usage: check-number <phone...>');
        const res = await agent.checkOnWhatsApp(args);
        console.log('WhatsApp registered status:');
        res.forEach(r => console.log(`  - ${r.jid}: exists=${r.exists}`));
        break;
      }

      case 'info': {
        const [phone] = args;
        if (!phone) throw new Error('Usage: info <phone>');
        const pic = await agent.getProfilePictureUrl(phone);
        const status = await agent.getContactStatus(phone);
        console.log(`Profile Info for ${phone}:`);
        console.log(`  Avatar: ${pic || 'None'}`);
        console.log(`  Bio/Status: ${status?.status || 'None'} (set at ${status?.setAt || 'N/A'})`);
        break;
      }

      default:
        console.error(`Unknown command: ${command}. Run 'node whatsapp/cli.js help' for list.`);
    }
  } catch (err) {
    console.error(`❌ Command failed: ${err.message}`);
  } finally {
    agent.destroy();
    process.exit(0);
  }
}

main().catch(console.error);
