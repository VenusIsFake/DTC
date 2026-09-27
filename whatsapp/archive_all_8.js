import fs from "fs";

const allAccepted = [
  { name: "Sara Iguimer", phone: "0656655636", firstName: "Sara", lid: "104664259387591@lid", needSend: true },
  { name: "Othman Essaadi", phone: "0620505972", firstName: "Othman", lid: "167315215761632@lid", needSend: false },
  { name: "Zoumar Sara", phone: "0619620602", firstName: "Sara", lid: "91160697663704@lid", needSend: false },
  { name: "Malak Ettorky", phone: "0680119150", firstName: "Malak", lid: "108564509139054@lid", needSend: false },
  { name: "Chaimae Saadi", phone: "0693995935", firstName: "Chaimae", lid: "90667078426711@lid", needSend: false },
  { name: "Zineb Saadi (Essaady)", phone: "0714513193", firstName: "Zineb", lid: "259669780131885@lid", needSend: false },
  { name: "Amrabt Ziad (Mrabet Zyad)", phone: "0628120962", firstName: "Zyad", lid: "130111923822758@lid", needSend: false },
  { name: "Btissam Aït Taleb", phone: "0782106994", firstName: "Btissam", lid: "22192767140095@lid", needSend: false }
];

async function run() {
  console.log("Starting confirm & robust archive for all 8 candidates...");

  for (const item of allAccepted) {
    if (item.needSend) {
      console.log(`Sending confirmation to ${item.name} (${item.phone})...`);
      const text = `Super ${item.firstName}, c'est bien noté ! 🎉 Ton adhésion est confirmée, on t'ajoute au groupe officiel très bientôt pour démarrer les activités du club. Bienvenue dans la team DTC ! 🦷✨`;
      try {
        const res = await fetch("http://localhost:3000/api/send-message", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ to: item.phone, text })
        });
        const d = await res.json();
        console.log(`  -> Message status:`, d.success ? "SENT" : d.error);
      } catch (e) {
        console.error(`  -> Message error:`, e.message);
      }
      await new Promise((r) => setTimeout(r, 1000));
    }

    console.log(`Archiving chat for ${item.name} (phone: ${item.phone}, lid: ${item.lid})...`);
    try {
      const res = await fetch("http://localhost:3000/api/archive-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: item.phone, lid: item.lid })
      });
      const d = await res.json();
      console.log(`  -> Archive result:`, d.results);
    } catch (e) {
      console.error(`  -> Archive error:`, e.message);
    }

    await new Promise((r) => setTimeout(r, 600));
  }

  console.log("\nAll 8 candidates processed and archived!");
}

run().catch(console.error);
