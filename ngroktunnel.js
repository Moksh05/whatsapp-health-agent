// src/ngrokTunnel.js
import ngrok from "ngrok";

async function startNgrok() {
  try {
    // Ensure any existing tunnel is closed
    await ngrok.disconnect();
    await ngrok.kill();

    const url = await ngrok.connect({
      addr: 8000, // must match Express port
      proto: "http"
    });

    console.log("🌍 ngrok tunnel active");
    console.log("Public URL:", url);
    console.log("➡️ Twilio webhook:");
    console.log(`${url}/whatsapp/webhook`);
  } catch (err) {
    console.error("ngrok error:", err);
  }
}

startNgrok();
