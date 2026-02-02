// ===============================
// ENV (OPTIONAL)
// ===============================
// If you are using `node --env-file=.env`, you DO NOT need dotenv
import dotenv from "dotenv";
dotenv.config();

import express from "express";
import bodyParser from "body-parser";
import twilio from "twilio";
import { handleMessage } from "./intentRouter.js";

const app = express();
const port = process.env.PORT || 8000;
const { MessagingResponse } = twilio.twiml;

// ===============================
// MIDDLEWARE
// ===============================

// For normal REST testing (Postman / curl)
app.use(express.json());

// IMPORTANT for Twilio WhatsApp webhooks
// Twilio sends data as application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// ===============================
// REST API (LOCAL TESTING)
// ===============================
// This lets you test everything WITHOUT WhatsApp
// Keep this route – very useful
app.post("/api/message", async (req, res) => {
  const { phoneNumber, message } = req.body;

  if (!phoneNumber || !message) {
    return res.status(400).json({
      error: "phoneNumber and message are required"
    });
  }

  console.log("📨 Incoming API Message");
  console.log("Phone:", phoneNumber);
  console.log("Message:", message);

  try {
    const reply = await handleMessage(phoneNumber, message);

    return res.json({
      phoneNumber,
      reply
    });
  } catch (err) {
    console.error("API error:", err);
    return res.status(500).json({
      phoneNumber,
      reply: "Something went wrong processing your request"
    });
  }
});

// ===============================
// WHATSAPP WEBHOOK (TWILIO)
// ===============================
// This is what Twilio will call via ngrok
// DO NOT delete – enable when using WhatsApp

app.post("/whatsapp/webhook", async (req, res) => {
  const incomingMsg = req.body.Body;   // WhatsApp message text
  const from = req.body.From;           // "whatsapp:+919821063740"

  console.log("📲 WhatsApp message received");
  console.log("From:", from);
  console.log("Message:", incomingMsg);

  try {
    // Normalize phone number (important!)
    const phone = from.replace("whatsapp:", "");

    const replyText = await handleMessage(phone, incomingMsg);

    const twiml = new MessagingResponse();
    twiml.message(replyText);

    res.type("text/xml").send(twiml.toString());
  } catch (error) {
    console.error("WhatsApp error:", error);

    const twiml = new MessagingResponse();
    twiml.message("Sorry, something went wrong 😕");

    res.type("text/xml").send(twiml.toString());
  }
});

// ===============================
// SERVER START
// ===============================
app.listen(port, () => {
  console.log(`🚀 Server is running on port ${port}`);
  console.log(`➡️ Local API: http://localhost:${port}/api/message`);
  console.log(`➡️ WhatsApp webhook: /whatsapp/webhook (via ngrok)`);
});
