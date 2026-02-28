# WhatsApp Health Agent 🏥💬

**WhatsApp Health Agent** is a Node.js-based conversational assistant designed to help users track and understand their daily health metrics via WhatsApp. 

> **Note:** This was a learning mini-project focused on **intent classification** and extracting **meaningful insights from raw data stored in a database**.

## 🚀 Features

- **Intent Classification**: Uses a Large Language Model (LLM) to accurately classify user messages into specific intents (e.g., `sleep_summary`, `steps_summary`, `heart_rate_summary`, `nutrition_summary`, `recommendation`).
- **Meaningful Insights**: Fetches raw data from the database (simulated via `data.js`) and transforms it into easy-to-understand, conversational WhatsApp summaries.
- **Personalized Recommendations**: Provides friendly, general lifestyle suggestions based on user profiles, goals, and daily activity.
- **WhatsApp Integration**: Designed to be connected as a webhook for WhatsApp message routing (using tools like Ngrok).

## 🛠️ Tech Stack

- **Node.js**: Backend server and logic execution.
- **LLM Integration**: Processes raw text for intent classification and generates natural, empathetic responses.
- **Simulated Database**: Uses a local JSON-like structure to store user profiles, goals, and daily health metrics.

## 📂 Project Structure

- `server.js`: Main entry point for the application.
- `intentRouter.js`: Routes incoming messages to the correct handler based on the user's classified intent.
- `controller.js`: Contains the core logic to calculate user progress (e.g., comparing actual steps or sleep against target goals).
- `llm.js` & `prompts.js`: Handles the AI interaction, containing system prompts for intent classification and response generation.
- `data.js`: The mock database containing user profiles, goals, and daily health data.
- `ngroktunnel.js`: Utility for exposing the local server to the internet for WhatsApp webhooks.

## 💡 How it Works

1. **Receive Message**: The user sends a WhatsApp message (e.g., "How was my sleep last night?").
2. **Classify Intent**: The LLM engine evaluates the text and categorizes it into a predefined intent (`sleep_summary`).
3. **Fetch & Analyze**: The system retrieves the user's raw health data and goals from the database.
4. **Generate Response**: The LLM reformats the raw metrics into a conversational, friendly WhatsApp reply, which is then sent back to the user.

## 🏃‍♂️ Getting Started

1. Clone this repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up your `.env` variables (e.g., LLM API keys, ports).
4. Start the server (usually running `node server.js` or `npm start`).
5. Expose your local port using Ngrok to receive webhooks from WhatsApp.

## 📝 License

This project is for educational purposes. Feel free to explore, modify, and learn!
