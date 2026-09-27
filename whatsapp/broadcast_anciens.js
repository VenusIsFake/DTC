import fs from "fs";

const targets = JSON.parse(fs.readFileSync("/home/venus/Projects/DTC/anciens_recipients.json", "utf8"));

function buildMessage(name) {
  const greeting = name ? `Coucou ${name} ! 👋🦷` : "Coucou ! 👋🦷";
  return `${greeting}

C'est la rentrée au Dentalk Club ! On voulait prendre de tes nouvelles — tu es toujours chaud(e) pour continuer l'aventure avec la team cette année ?

Dis-nous juste par message pour qu'on te garde une place au chaud ! 🙌✨`;
}

async function run() {
  console.log(`Starting broadcast to ${targets.length} returning members...`);
  const results = [];

  for (let i = 0; i < targets.length; i++) {
    const item = targets[i];
    const text = buildMessage(item.name);
    console.log(`[${i + 1}/${targets.length}] Sending to ${item.phone} (${item.name || "Membre"})...`);

    try {
      const res = await fetch("http://localhost:3000/api/send-message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: item.phone, text })
      });
      const data = await res.json();
      if (data.success) {
        console.log(`  ✅ Delivered to ${item.phone}`);
        results.push({ phone: item.phone, status: "delivered", timestamp: new Date().toISOString() });
      } else {
        console.warn(`  ❌ Failed for ${item.phone}:`, data.error);
        results.push({ phone: item.phone, status: "failed", error: data.error, timestamp: new Date().toISOString() });
      }
    } catch (err) {
      console.error(`  ❌ Error for ${item.phone}:`, err.message);
      results.push({ phone: item.phone, status: "error", error: err.message, timestamp: new Date().toISOString() });
    }

    // Safety pause: 1.5s to 2.5s jitter
    const delay = Math.floor(1500 + Math.random() * 1000);
    await new Promise((r) => setTimeout(r, delay));
  }

  fs.writeFileSync("/home/venus/Projects/DTC/broadcast_anciens_results.json", JSON.stringify(results, null, 2));
  console.log("Broadcast complete! Results saved to broadcast_anciens_results.json");
}

run().catch(console.error);
