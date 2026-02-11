
import { Message, ChatSession } from '../types';

/**
 * Export Service - Handle chat history exports in multiple formats
 */

// Export as JSON
export const exportAsJSON = (session: ChatSession): void => {
    const dataStr = JSON.stringify(session, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    downloadFile(blob, `ashama-${session.title}-${Date.now()}.json`);
};

// Export as TXT
export const exportAsTXT = (session: ChatSession): void => {
    let content = `ASHAMA AI - Seenaa Marii\n`;
    content += `Mata-duree: ${session.title}\n`;
    content += `Guyyaa: ${new Date(session.lastTimestamp).toLocaleString('om-ET')}\n`;
    content += `\n${'='.repeat(60)}\n\n`;

    session.messages.forEach((msg) => {
        const role = msg.role === 'user' ? 'ATIITU' : 'ASHAMA';
        const timestamp = new Date(msg.timestamp).toLocaleTimeString('om-ET');
        content += `[${timestamp}] ${role}:\n${msg.content}\n\n`;

        if (msg.sources && msg.sources.length > 0) {
            content += `  Maddoota:\n`;
            msg.sources.forEach(s => content += `    - ${s.title}: ${s.uri}\n`);
            content += `\n`;
        }
    });

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    downloadFile(blob, `ashama-${session.title}-${Date.now()}.txt`);
};

// Export as PDF (using simple HTML to PDF approach)
export const exportAsPDF = async (session: ChatSession): Promise<void> => {
    // Create HTML content
    let html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Ashama AI - ${session.title}</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      max-width: 800px;
      margin: 40px auto;
      padding: 20px;
      line-height: 1.6;
    }
    .header {
      text-align: center;
      border-bottom: 3px solid #da291c;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    .header h1 {
      color: #da291c;
      margin: 0;
    }
    .message {
      margin-bottom: 25px;
      padding: 15px;
      border-radius: 10px;
    }
    .user {
      background: #f5f5f5;
      text-align: right;
    }
    .assistant {
      background: #fff5f5;
      border-left: 4px solid #da291c;
    }
    .role {
      font-weight: bold;
      font-size: 12px;
      text-transform: uppercase;
      color: #666;
    }
    .content {
      margin-top: 8px;
      white-space: pre-wrap;
    }
    .sources {
      margin-top: 10px;
      font-size: 11px;
      color: #666;
    }
    .footer {
      text-align: center;
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #ddd;
      font-size: 11px;
      color: #999;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>ASHAMA AI</h1>
    <p>${session.title}</p>
    <p style="font-size: 12px; color: #666;">${new Date(session.lastTimestamp).toLocaleString('om-ET')}</p>
  </div>
`;

    session.messages.forEach((msg) => {
        const roleClass = msg.role === 'user' ? 'user' : 'assistant';
        const roleName = msg.role === 'user' ? 'ATIITU' : 'ASHAMA';

        html += `
  <div class="message ${roleClass}">
    <div class="role">${roleName}</div>
    <div class="content">${escapeHtml(msg.content)}</div>`;

        if (msg.sources && msg.sources.length > 0) {
            html += `<div class="sources">Maddoota: `;
            html += msg.sources.map(s => `<a href="${s.uri}">${s.title}</a>`).join(', ');
            html += `</div>`;
        }

        html += `\n  </div>`;
    });

    html += `
  <div class="footer">
    <p>Ashama AI - Gargaaraa AI Newaz Nezif</p>
    <p>Jimma AI Lab • Saqqaa Coqorsaa</p>
  </div>
</body>
</html>`;

    // Create blob and download
    const blob = new Blob([html], { type: 'text/html' });
    downloadFile(blob, `ashama-${session.title}-${Date.now()}.html`);

    // Note: For true PDF, would need a library like jsPDF or html2pdf
    // This HTML can be opened in browser and printed to PDF
};

// Export as Audio (TTS entire conversation)
export const exportAsAudio = async (session: ChatSession, onProgress: (msg: string) => void): Promise<void> => {
    try {
        onProgress("Sagalee qopheessaa jira...");

        // Combine all messages into one text
        let fullText = `Seenaa marii ${session.title}. `;
        session.messages.forEach((msg) => {
            const speaker = msg.role === 'user' ? 'Fayyadamaan' : 'Ashama';
            fullText += `${speaker} jedhe: ${msg.content}. `;
        });

        // Use Web Speech API for TTS
        const utterance = new SpeechSynthesisUtterance(fullText);
        utterance.lang = 'om-ET'; // Oromo language code
        utterance.rate = 0.9;
        utterance.pitch = 1.0;

        // Try to find an appropriate voice
        const voices = speechSynthesis.getVoices();
        const oromoVoice = voices.find(v => v.lang.startsWith('om')) || voices[0];
        if (oromoVoice) utterance.voice = oromoVoice;

        onProgress("Sagalee taphachaa jira...");
        speechSynthesis.speak(utterance);

        utterance.onend = () => {
            onProgress("Xumurame!");
        };

        utterance.onerror = () => {
            throw new Error("Sagalee uumuu hin dandeenye.");
        };

    } catch (error) {
        console.error("Audio export error:", error);
        throw new Error("Dogoggora: Sagalee uumuu hin dandeenye.");
    }
};

// Helper functions
const downloadFile = (blob: Blob, filename: string): void => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};

const escapeHtml = (text: string): string => {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
};
