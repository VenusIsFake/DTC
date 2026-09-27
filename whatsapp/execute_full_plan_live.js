import fs from "fs";

const acceptedCandidates = [
  { name: "Amrabt Ziad (Mrabet Zyad)", phone: "0628120962", firstName: "Zyad", lid: "130111923822758@lid" },
  { name: "Btissam Aït Taleb", phone: "0782106994", firstName: "Btissam", lid: "22192767140095@lid" },
  { name: "Chaimae Saadi", phone: "0693995935", firstName: "Chaimae", lid: "90667078426711@lid" },
  { name: "Malak Ettorky", phone: "0680119150", firstName: "Malak", lid: "108564509139054@lid" },
  { name: "Othman Essaadi", phone: "0620505972", firstName: "Othman", lid: "167315215761632@lid" },
  { name: "Sara Iguimer", phone: "0656655636", firstName: "Sara", lid: "104664259387591@lid" },
  { name: "Zineb Saadi (Essaady)", phone: "0714513193", firstName: "Zineb", lid: "259669780131885@lid" },
  { name: "Zoumar Sara", phone: "0619620602", firstName: "Sara", lid: "91160697663704@lid" }
];

const rejectedCandidate = {
  name: "Houda Rhiboul",
  phone: "0714172253",
  firstName: "Houda",
  lid: "263943490646160@lid"
};

const ignoredSeenCandidates = [
  { name: "Al Batoul El Rhassir", phone: "0693035863", lid: "87475649298454@lid" },
  { name: "Fadoua Moutayannice", phone: "0774125509", lid: "209470269468830@lid" },
  { name: "Jalil Yasmine", phone: "0619894323", lid: "88433443745856@lid" },
  { name: "Khaoula Nidbella", phone: "0605445733", lid: "246042117287972@lid" },
  { name: "Lamkaidam Salma", phone: "0619201668", lid: "25482108133487@lid" },
  { name: "Meryem Tarlamani", phone: "0716661118", lid: "21071730311320@lid" },
  { name: "Nassima Elhor", phone: "0620101960", lid: "158291221061847@lid" },
  { name: "Wissal Zakaria", phone: "0710258956", lid: "143164581101707@lid" }
];

function buildConfirmationText(firstName) {
  return `Super ${firstName}, c'est bien noté ! 🎉 Ton adhésion est confirmée, on t'ajoute au groupe officiel très bientôt pour démarrer les activités du club. Bienvenue dans la team DTC ! 🦷✨`;
}

function buildRejectionText(firstName) {
  return `Merci beaucoup pour ton retour ${firstName} ! Pas de souci du tout, on te souhaite une excellente rentrée et plein de succès pour cette année. À bientôt ! 🦷✨`;
}

async function sendMsg(to, text) {
  const res = await fetch("http://localhost:3000/api/send-message", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ to, text })
  });
  return await res.json();
}

async function archiveChat(to, lid) {
  const res = await fetch("http://localhost:3000/api/archive-chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ to, lid })
  });
  return await res.json();
}

async function execute() {
  console.log("=== STARTING FULL LIVE EXECUTION ===");
  const report = {
    startedAt: new Date().toISOString(),
    accepted: [],
    rejected: null,
    ignoredSeenArchived: []
  };

  // 1. Send confirmation messages & archive accepted
  console.log(`\n--- 1. Processing ${acceptedCandidates.length} Accepted Candidates ---`);
  for (let i = 0; i < acceptedCandidates.length; i++) {
    const c = acceptedCandidates[i];
    const text = buildConfirmationText(c.firstName);
    console.log(`[${i + 1}/${acceptedCandidates.length}] Sending confirmation to ${c.name} (${c.phone})...`);

    let sendRes = null;
    try {
      sendRes = await sendMsg(c.phone, text);
      console.log(`  -> Sent! ID: ${sendRes.result?.key?.id || "N/A"}`);
    } catch (e) {
      console.error(`  -> Send failed:`, e.message);
      sendRes = { success: false, error: e.message };
    }

    await new Promise(r => setTimeout(r, 1200));

    let archRes = null;
    try {
      archRes = await archiveChat(c.phone, c.lid);
      console.log(`  -> Archived!`);
    } catch (e) {
      console.error(`  -> Archive failed:`, e.message);
      archRes = { success: false, error: e.message };
    }

    report.accepted.push({
      ...c,
      messageSent: sendRes,
      archived: archRes
    });

    await new Promise(r => setTimeout(r, 1500));
  }

  // 2. Send rejection message & archive
  console.log(`\n--- 2. Processing Rejection for ${rejectedCandidate.name} ---`);
  const rejText = buildRejectionText(rejectedCandidate.firstName);
  let rejSendRes = null;
  try {
    rejSendRes = await sendMsg(rejectedCandidate.phone, rejText);
    console.log(`  -> Sent rejection to ${rejectedCandidate.name}! ID: ${rejSendRes.result?.key?.id || "N/A"}`);
  } catch (e) {
    console.error(`  -> Rejection send failed:`, e.message);
    rejSendRes = { success: false, error: e.message };
  }

  await new Promise(r => setTimeout(r, 1200));

  let rejArchRes = null;
  try {
    rejArchRes = await archiveChat(rejectedCandidate.phone, rejectedCandidate.lid);
    console.log(`  -> Archived rejection chat!`);
  } catch (e) {
    console.error(`  -> Rejection archive failed:`, e.message);
    rejArchRes = { success: false, error: e.message };
  }

  report.rejected = {
    ...rejectedCandidate,
    messageSent: rejSendRes,
    archived: rejArchRes
  };

  // 3. Archive Ignored and Seen chats so they leave the main inbox
  console.log(`\n--- 3. Archiving ${ignoredSeenCandidates.length} Ignored & Seen Chats ---`);
  for (let i = 0; i < ignoredSeenCandidates.length; i++) {
    const c = ignoredSeenCandidates[i];
    console.log(`[${i + 1}/${ignoredSeenCandidates.length}] Archiving ${c.name} (${c.phone})...`);
    let archRes = null;
    try {
      archRes = await archiveChat(c.phone, c.lid);
      console.log(`  -> Archived!`);
    } catch (e) {
      console.error(`  -> Archive failed:`, e.message);
      archRes = { success: false, error: e.message };
    }
    report.ignoredSeenArchived.push({
      ...c,
      archived: archRes
    });
    await new Promise(r => setTimeout(r, 800));
  }

  report.finishedAt = new Date().toISOString();
  fs.writeFileSync("/home/venus/Projects/DTC/execute_live_results.json", JSON.stringify(report, null, 2));
  console.log("\n=== FULL LIVE EXECUTION COMPLETE ===");
  console.log("Results saved to /home/venus/Projects/DTC/execute_live_results.json");
}

execute().catch(console.error);
