const fs = require("fs");

const recipients = [
  { name: "Al Batoul El Rhassir", phone: "0693035863", firstName: "Al Batoul" },
  { name: "Amina Nejjarou", phone: "0718348865", firstName: "Amina" },
  { name: "Amrabt Ziad (Mrabet Zyad)", phone: "0628120962", firstName: "Zyad" },
  { name: "Anas Belhaiba", phone: "0626675017", firstName: "Anas" },
  { name: "Aya Hammouich", phone: "0763487555", firstName: "Aya" },
  { name: "Btissam Aït Taleb", phone: "0782106994", firstName: "Btissam" },
  { name: "Chaimae Chakmaoui", phone: "0777679310", firstName: "Chaimae" },
  { name: "Chaimae Saadi", phone: "0693995935", firstName: "Chaimae" },
  { name: "Eddahabi Mamoun", phone: "0658923991", firstName: "Mamoun" },
  { name: "Fadoua Moutayannice", phone: "0774125509", firstName: "Fadoua" },
  { name: "Hiba Boutaqqa", phone: "0604705975", firstName: "Hiba" },
  { name: "Houda Rhiboul", phone: "0714172253", firstName: "Houda" },
  { name: "Imane Ait Bella", phone: "0679993251", firstName: "Imane" },
  { name: "Ismail El Mhadi", phone: "0780811806", firstName: "Ismail" },
  { name: "Jalil Yasmine", phone: "0619894323", firstName: "Yasmine" },
  { name: "Kawtar Ait Hamou", phone: "0774857903", firstName: "Kawtar" },
  { name: "Khadija Boussafar", phone: "0689563344", firstName: "Khadija" },
  { name: "Khaoula Nidbella", phone: "0605445733", firstName: "Khaoula" },
  { name: "Khouloud Sabour", phone: "0724004003", firstName: "Khouloud" },
  { name: "Lamkaidam Salma", phone: "0619201668", firstName: "Salma" },
  { name: "Luna Elkanouani", phone: "0673714576", firstName: "Luna" },
  { name: "Malak Ettorky", phone: "0680119150", firstName: "Malak" },
  { name: "Manal Aboutir", phone: "0688614188", firstName: "Manal" },
  { name: "Marwa Laanaya", phone: "0658888473", firstName: "Marwa" },
  { name: "Meryem Tarlamani", phone: "0716661118", firstName: "Meryem" },
  { name: "Nassima Elhor", phone: "0620101960", firstName: "Nassima" },
  { name: "Othman Essaadi", phone: "0620505972", firstName: "Othman" },
  { name: "Oudouhou Ranya", phone: "0676631847", firstName: "Ranya" },
  { name: "Said Salma", phone: "0628347122", firstName: "Salma" },
  { name: "Samia El Hiri", phone: "0679472079", firstName: "Samia" },
  { name: "Sara Ammar", phone: "0770417655", firstName: "Sara" },
  { name: "Sara Elharradi", phone: "0713578447", firstName: "Sara" },
  { name: "Sara Iguimer", phone: "0656655636", firstName: "Sara" },
  { name: "Taoui Aya", phone: "0612768096", firstName: "Aya" },
  { name: "Wijdane Aouzaï", phone: "0698918431", firstName: "Wijdane" },
  { name: "Wissal Zakaria", phone: "0710258956", firstName: "Wissal" },
  { name: "Yasser Essabar", phone: "0671649491", firstName: "Yasser" },
  { name: "Yassine El Kamal", phone: "0778833913", firstName: "Yassine" },
  { name: "Zineb Saadi (Essaady)", phone: "0714513193", firstName: "Zineb" },
  { name: "Zoumar Sara", phone: "0619620602", firstName: "Sara" }
];

function buildText(firstName) {
  return `Bonjour ${firstName} ! 👋

Ici le bureau du Dentalk Club (DTC) — FMDC. 🦷

On a bien reçu tes coordonnées lors des inscriptions. On voulait vérifier avec toi : es-tu toujours intéressé(e) pour rejoindre le club cette année ?

Réponds simplement par un petit message pour nous confirmer.

Merci et bonne journée ! ✨`;
}

async function runBroadcast() {
  console.log(`Starting broadcast to ${recipients.length} members...`);
  const results = [];

  for (let i = 0; i < recipients.length; i++) {
    const r = recipients[i];
    const text = buildText(r.firstName);
    console.log(`[${i + 1}/${recipients.length}] Sending to ${r.name} (${r.phone})...`);

    try {
      const response = await fetch("http://localhost:3000/api/send-message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: r.phone, text })
      });
      const data = await response.json();
      if (data.success) {
        console.log(`  ✅ Sent to ${r.name}`);
        results.push({ name: r.name, phone: r.phone, status: "SENT", id: data.result?.key?.id });
      } else {
        console.error(`  ❌ Failed for ${r.name}:`, data.error);
        results.push({ name: r.name, phone: r.phone, status: "FAILED", error: data.error });
      }
    } catch (err) {
      console.error(`  ❌ Network error for ${r.name}:`, err.message);
      results.push({ name: r.name, phone: r.phone, status: "ERROR", error: err.message });
    }

    // Safety pause of 2.2 seconds between messages
    if (i + 1 < recipients.length) {
      await new Promise(res => setTimeout(res, 2200));
    }
  }

  const successCount = results.filter(r => r.status === "SENT").length;
  console.log(`\nBroadcast complete! ${successCount}/${recipients.length} successfully delivered.`);
  fs.writeFileSync("/home/venus/Projects/DTC/broadcast_results.json", JSON.stringify(results, null, 2));
}

runBroadcast();
