import fs from "fs";

const accepted = [
  { name: "Othman Essaadi", phone: "0620505972", firstName: "Othman" },
  { name: "Zoumar Sara", phone: "0619620602", firstName: "Sara" },
  { name: "Malak Ettorky", phone: "0680119150", firstName: "Malak" },
  { name: "Chaimae Saadi", phone: "0693995935", firstName: "Chaimae" },
  { name: "Zineb Saadi (Essaady)", phone: "0714513193", firstName: "Zineb" },
  { name: "Amrabt Ziad (Mrabet Zyad)", phone: "0628120962", firstName: "Zyad" },
  { name: "Btissam Aït Taleb", phone: "0782106994", firstName: "Btissam" }
];

function buildReply(firstName) {
  return `Super ${firstName}, c'est bien noté ! 🎉 Ton adhésion est confirmée, on t'ajoute au groupe officiel très bientôt pour démarrer les activités du club. Bienvenue dans la team DTC ! 🦷✨`;
}

async function run() {
  console.log(`Processing ${accepted.length} accepted candidates...`);
  const results = [];

  for (let i = 0; i < accepted.length; i++) {
    const item = accepted[i];
    const text = buildReply(item.firstName);

    console.log(`[${i + 1}/${accepted.length}] Sending confirmation to ${item.name} (${item.phone})...`);
    
    // 1. Send confirmation message
    let sendOk = false;
    try {
      const res = await fetch("http://localhost:3000/api/send-message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: item.phone, text })
      });
      const data = await res.json();
      if (data.success) {
        console.log(`  -> Sent successfully`);
        sendOk = true;
      } else {
        console.warn(`  -> Send failed:`, data.error);
      }
    } catch (e) {
      console.error(`  -> Send error:`, e.message);
    }

    // Short pause
    await new Promise((r) => setTimeout(r, 1200));

    // 2. Archive chat
    let archiveOk = false;
    try {
      const res = await fetch("http://localhost:3000/api/archive-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: item.phone })
      });
      const data = await res.json();
      if (data.success) {
        console.log(`  -> Archived successfully`);
        archiveOk = true;
      } else {
        console.warn(`  -> Archive failed:`, data.error);
      }
    } catch (e) {
      console.error(`  -> Archive error:`, e.message);
    }

    results.push({
      ...item,
      sent: sendOk,
      archived: archiveOk,
      timestamp: new Date().toISOString()
    });

    // Safety pause between contacts
    await new Promise((r) => setTimeout(r, 1500));
  }

  fs.writeFileSync("/home/venus/Projects/DTC/confirmed_accepted_results.json", JSON.stringify(results, null, 2));
  console.log("\nDone! All accepted candidates replied and archived.");
}

run().catch(console.error);
