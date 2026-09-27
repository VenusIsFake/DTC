import fs from "fs";

const candidates = JSON.parse(fs.readFileSync("/home/venus/Projects/DTC/broadcast_results.json", "utf8"));

async function scrape() {
  console.log(`Triggering history fetch for ${candidates.length} candidates...`);

  for (let i = 0; i < candidates.length; i++) {
    const c = candidates[i];
    let d = c.phone.replace(/\D/g, "");
    if (d.startsWith("0")) d = "212" + d.slice(1);
    const jid = d + "@s.whatsapp.net";

    console.log(`[${i + 1}/${candidates.length}] Requesting history for ${c.name} (${c.phone})...`);
    try {
      const res = await fetch("http://localhost:3000/api/fetch-history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jid,
          id: c.id,
          count: 20
        })
      });
      const data = await res.json();
      if (data.success) {
        console.log(`  -> Requested successfully (reqId: ${data.result})`);
      } else {
        console.warn(`  -> Failed:`, data.error);
      }
    } catch (e) {
      console.error(`  -> Error:`, e.message);
    }

    // Wait 300ms between requests
    await new Promise((r) => setTimeout(r, 300));
  }

  console.log("All history sync requests dispatched. Waiting 5s for responses to process...");
  await new Promise((r) => setTimeout(r, 5000));

  if (fs.existsSync("/home/venus/Projects/DTC/dm_replies.json")) {
    const replies = JSON.parse(fs.readFileSync("/home/venus/Projects/DTC/dm_replies.json", "utf8"));
    console.log(`\n=== Total replies captured: ${replies.length} ===`);
    console.log(JSON.stringify(replies, null, 2));
  } else {
    console.log("\nNo dm_replies.json recorded yet.");
  }
}

scrape().catch(console.error);
