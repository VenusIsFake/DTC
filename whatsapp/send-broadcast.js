import wa from './client.js';
import fs from 'fs';

// Group invite link
const GROUP_LINK = "https://chat.whatsapp.com/Ewr17jiqmON1eD5QDWxXUN";

// Load 41 verified WhatsApp members
const members = JSON.parse(fs.readFileSync('./whatsapp_verification.json', 'utf8'))
  .filter(m => m.on_whatsapp || m.name === 'Yasser Essabar')
  .map(m => {
    // Fix Yasser's active phone
    if (m.name === 'Yasser Essabar') return { ...m, phone: '0671649491' };
    return m;
  });

function buildMessage(fullName) {
  const firstName = fullName.split(' ')[0];
  return `Bonjour ${firstName} ! 👋

Ici le bureau du *Dentalk Club (DTC)* de la Faculté de Médecine Dentaire de Casablanca. 🦷

Nous avons bien reçu ton inscription pour rejoindre le club cette année ! 🎉

Pour finaliser ton adhésion et ne rien manquer des réunions, projets et événements à venir, rejoins directement le groupe officiel des membres :
👉 ${GROUP_LINK}

Réponds simplement à ce message pour nous confirmer ton intérêt ! 

Bienvenue dans l'équipe DTC ! ✨`;
}

async function broadcast() {
  console.log(`Starting broadcast to ${members.length} verified members...`);
  for (let i = 0; i < members.length; i++) {
    const member = members[i];
    const text = buildMessage(member.name);
    console.log(`[${i + 1}/${members.length}] Sending to ${member.name} (${member.phone})...`);
    try {
      await wa.sendMessage(member.phone, text);
      console.log(`✅ Sent to ${member.name}`);
    } catch (err) {
      console.error(`❌ Failed for ${member.name}:`, err.message);
    }
    // Safety delay between messages to avoid WhatsApp spam triggers
    await new Promise(r => setTimeout(r, 2000));
  }
  console.log("Broadcast complete!");
}

if (process.argv.includes('--send')) {
  broadcast();
} else {
  console.log(`Preview mode. Total recipients: ${members.length}.`);
  console.log("\nSample message preview:\n---");
  console.log(buildMessage("Salma"));
  console.log("---\nTo send to all 41 members, run:\nnode whatsapp/send-broadcast.js --send");
}
