# ASHAMA AI

<div align="center">
  <h3>🇪🇹 Gargaaraa AI Afaan Oromoo | Oromo Language AI Assistant</h3>
  <p><strong>Created by Newaz Nezif</strong></p>
  <p>AI Engineer & Cyber Analyst | Jimma Zone, Seka Chekorsa Woreda</p>
</div>

---

## 📖 Waa'ee | About

**Ashama AI** is a fully localized Afaan Oromo conversational AI assistant powered by Google's Gemini AI (Vertex AI). Ashama speaks only in Afaan Oromo and provides intelligent assistance on topics including science, history, technology, health, education, and nature.

### ✨ Key Features

- 🗣️ **Live Voice Conversation**: Real-time voice chat with TTS/STT
- 💬 **Text Chat**: Full conversational AI in Afaan Oromo
- 📚 **Search Grounding**: Verified information via Google Search
- 🗺️ **Location Awareness**: Google Maps integration for local information
- 🎨 **Image Generation**: Create images from Afaan Oromo descriptions
- 📥 **Export Options**: Save conversations as JSON, TXT, HTML, or Audio
- 💾 **Chat History**: Persistent conversation storage like ChatGPT
- 🌐 **Offline Mode**: Cached responses for low-bandwidth scenarios
- 🎭 **Adaptive Personality**: Time-based greetings and mood detection
- 📱 **Fully Responsive**: Works seamlessly on mobile and desktop

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** (v16 or higher)
- **Gemini API Key** from [Google AI Studio](https://aistudio.google.com/apikey)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ashama-ai
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure API Key**
   
   Copy `.env.example` to `.env.local`:
   ```bash
   copy .env.example .env.local
   ```
   
   Edit `.env.local` and add your API key:
   ```
   VITE_GEMINI_API_KEY=your_actual_api_key_here
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open in browser**
   ```
   http://localhost:5173
   ```

---

## 🎯 Usage Guide

### Text Chat
1. Click "Marii Jalqabi" (Start Chat) to create a new conversation
2. Type your question in Afaan Oromo in the input box
3. Press Enter or click the send button
4. Ashama will respond with relevant information

### Voice Chat
1. Click the microphone icon (🎙️) in the chat interface
2. Allow microphone permissions when prompted
3. Speak your question in Afaan Oromo
4. Ashama will respond with voice and text
5. Click the X button to end voice mode

### Export Conversations
- **JSON**: Full conversation data with metadata
- **TXT**: Plain text format for easy reading
- **HTML**: Formatted document (can be printed to PDF)
- **Audio**: Text-to-speech of entire conversation

### Image Generation
Ask Ashama to create images using keywords like:
- "Fakkii uumi..." (Create an image...)
- "Kaasi..." (Show...)
- "Suuraa..." (Picture...)

---

## 🛠️ Technical Stack

- **Frontend**: React 19 + TypeScript + Vite
- **Styling**: TailwindCSS (via CDN)
- **AI Backend**: Google Gemini 2.5 Flash
- **Voice**: Gemini Native Audio (Live API)
- **Image**: Gemini 2.5 Flash Image
- **Video**: Veo 3.1 (requires paid billing)
- **Storage**: LocalStorage for chat history and preferences

---

## 📁 Project Structure

```
ashama-ai/
├── components/           # React components
│   ├── ChatInterface.tsx    # Main chat UI
│   ├── LiveVoiceOverlay.tsx # Voice chat overlay
│   ├── Sidebar.tsx          # Chat history sidebar
│   ├── VideoGen.tsx         # Video generation
│   ├── StoryTeller.tsx      # Multi-voice storytelling
│   └── QuizView.tsx         # Interactive quizzes
├── services/            # Business logic
│   ├── geminiService.ts     # Gemini API integration
│   ├── exportService.ts     # Export functionality
│   ├── cacheService.ts      # Offline/caching
│   └── personaService.ts    # Adaptive personality
├── types.ts             # TypeScript definitions
├── constants.ts         # System instructions & config
├── App.tsx              # Main app component
├── index.html           # HTML entry point
├── vite.config.ts       # Vite configuration
└── .env.local           # Environment variables (not in git)
```

---

## ⚙️ Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_GEMINI_API_KEY` | Your Gemini API key | Yes |

### System Instructions

Ashama's personality and behavior are defined in `constants.ts`:
- Identity: Ashama, created by Newaz Nezif
- Language: Afaan Oromo only
- Tone: Professional, respectful, knowledgeable
- Topics: Science, history, technology, health, education, nature

---

## 🎨 Features in Detail

### 1. Chat History
- Automatic saving to localStorage
- Session-based organization
- Search and filter (coming soon)
- Delete individual sessions

### 2. Offline Mode
- Automatic caching of responses
- TTL-based cache expiration (30 minutes default)
- Offline detection with fallback messages
- Network status indicator

### 3. Adaptive Personality
- **Time-based greetings**: Morning, afternoon, evening, night
- **Mood detection**: Happy, sad, excited, frustrated, neutral
- **User preferences**: Remembers topics and conversation style
- **Returning user recognition**: Welcome back messages

### 4. Error Handling
All errors are displayed in Afaan Oromo:
- API key issues: "API key sirrii miti..."
- Network errors: "Walitti dhufeenya interneetii hin jiru..."
- Rate limits: "Gaaffii baay'ee ergameera..."
- Microphone issues: "Mic-ni hin argamne..."

---

## 🚧 Known Limitations

1. **Veo Video Generation**: Requires a paid Google Cloud billing project
2. **TTS Voices**: Limited Afaan Oromo voice options
3. **Offline Mode**: Only caches recent conversations
4. **Google Maps**: May not work with all Gemini models

---

## 🔧 Troubleshooting

### "API key sirrii miti" Error
- Verify your API key in `.env.local`
- Ensure the key starts with `VITE_`
- Restart the dev server after changing `.env.local`

### Voice Chat Not Working
- Check microphone permissions in browser settings
- Ensure HTTPS or localhost (required for mic access)
- Try a different browser (Chrome/Edge recommended)

### Video Generation Fails
- Veo requires a paid billing project
- Check [Google AI Pricing](https://ai.google.dev/pricing)
- Use the error message to select the correct API key

### Build Errors
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

---

## 📦 Building for Production

```bash
# Create production build
npm run build

# Preview production build
npm run preview
```

The build output will be in the `dist/` folder, ready for deployment to:
- Firebase Hosting
- Vercel
- Netlify
- Any static hosting service

---

## 🌐 Deployment

### Firebase Hosting (Recommended)

1. Install Firebase CLI:
   ```bash
   npm install -g firebase-tools
   ```

2. Login and initialize:
   ```bash
   firebase login
   firebase init hosting
   ```

3. Build and deploy:
   ```bash
   npm run build
   firebase deploy
   ```

### Environment Variables in Production
- Set `VITE_GEMINI_API_KEY` in your hosting platform's environment settings
- Never commit `.env.local` to version control

---

## 🤝 Contributing

This is a personal project by Newaz Nezif. For suggestions or issues, please contact the developer.

---

## 📄 License

Copyright © 2026 Newaz Nezif. All rights reserved.

---

## 👨‍💻 Developer

**Newaz Nezif**  
AI Engineer & Cyber Analyst  
Born in Jimma Zone, Seka Chekorsa Woreda  
Jimma AI Lab

---

## 🙏 Acknowledgments

- Google Gemini AI for the powerful language models
- The Afaan Oromo community for cultural context
- Jimma AI Lab for support and resources

---

<div align="center">
  <p><strong>Ashama AI - Gargaaraa AI Afaan Oromoo</strong></p>
  <p>Made with ❤️ in Ethiopia</p>
</div>
