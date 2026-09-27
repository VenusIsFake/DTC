import { getDtcSocket } from '../whatsapp/engine.js';
import fs from 'fs';

async function main() {
  console.log("Connecting to WhatsApp...");
  const sock = await getDtcSocket({ headless: true });
  
  // Wait a moment for connection
  await new Promise(r => setTimeout(r, 2500));
  
  console.log("Fetching participating groups...");
  const groups = await sock.groupFetchAllParticipating();
  const groupSummaries = [];
  
  for (const [jid, meta] of Object.entries(groups)) {
    console.log(`Group: "${meta.subject}" (${jid}) - ${meta.participants.length} participants`);
    groupSummaries.push({
      jid,
      subject: meta.subject,
      participantsCount: meta.participants.length,
      participants: meta.participants.map(p => ({
        id: p.id,
        admin: p.admin || null
      }))
    });
  }
  
  fs.writeFileSync('whatsapp_groups_live.json', JSON.stringify(groupSummaries, null, 2));
  console.log("Saved to whatsapp_groups_live.json");
  process.exit(0);
}

main().catch(err => {
  console.error("Error:", err);
  process.exit(1);
});
