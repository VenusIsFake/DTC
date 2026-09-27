// Script to add all 41 verified WhatsApp members to Dentalk Club group
// Run with: node whatsapp/add-members.js

const GROUP_ID = "120363430121946139@g.us";

const VERIFIED_PHONES = [
  "0693035863", // Al Batoul El Rhassir
  "0718348865", // Amina Nejjarou
  "0628120962", // Amrabt Ziad (Mrabet Zyad)
  "0626675017", // Anas Belhaiba
  "0763487555", // Aya Hammouich
  "0782106994", // Btissam Aït Taleb
  "0777679310", // Chaimae Chakmaoui
  "0693995935", // Chaimae Saadi
  "0716130254", // Dannoune Adam
  "0658923991", // Eddahabi Mamoun
  "0774125509", // Fadoua Moutayannice
  "0604705975", // Hiba Boutaqqa
  "0714172253", // Houda Rhiboul
  "0679993251", // Imane Ait Bella
  "0780811806", // Ismail El Mhadi
  "0619894323", // Jalil Yasmine
  "0774857903", // Kawtar Ait Hamou
  "0689563344", // Khadija Boussafar
  "0605445733", // Khaoula Nidbella
  "0724004003", // Khouloud Sabour
  "0619201668", // Lamkaidam Salma
  "0673714576", // Luna Elkanouani
  "0680119150", // Malak Ettorky
  "0688614188", // Manal Aboutir
  "0658888473", // Marwa Laanaya
  "0716661118", // Meryem Tarlamani
  "0620101960", // Nassima Elhor
  "0620505972", // Othman Essaadi
  "0676631847", // Oudouhou Ranya
  "0628347122", // Said Salma
  "0679472079", // Samia El Hiri
  "0770417655", // Sara Ammar
  "0713578447", // Sara Elharradi
  "0656655636", // Sara Iguimer
  "0612768096", // Taoui Aya
  "0698918431", // Wijdane Aouzaï
  "0710258956", // Wissal Zakaria
  "0671649491", // Yasser Essabar
  "0778833913", // Yassine El Kamal
  "0714513193", // Zineb Saadi (Essaady)
  "0619620602"  // Zoumar Sara
];

async function addAll() {
  console.log(`Adding ${VERIFIED_PHONES.length} verified members to group ${GROUP_ID}...`);
  const res = await fetch("http://localhost:3000/api/add-group-participants", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      groupId: GROUP_ID,
      phones: VERIFIED_PHONES
    })
  });
  const data = await res.json();
  console.log("Result:", JSON.stringify(data, null, 2));
}

if (process.argv.includes("--run")) {
  addAll();
} else {
  console.log(`Ready! To execute batch add, run:\nnode whatsapp/add-members.js --run`);
}
