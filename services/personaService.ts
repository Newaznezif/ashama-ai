
/**
 * Persona Service - Adaptive personality and user preference memory
 * Provides time-based greetings, mood detection, and session memory
 */

interface UserPreferences {
    name?: string;
    preferredTopics: string[];
    conversationStyle?: 'formal' | 'casual';
    lastInteraction: number;
}

interface SessionMemory {
    userId: string;
    preferences: UserPreferences;
    conversationHistory: string[];
}

class PersonaService {
    private sessionKey = 'ashama_session_memory';

    /**
     * Get time-based greeting in Afaan Oromo
     */
    getTimeBasedGreeting(): string {
        const hour = new Date().getHours();

        if (hour >= 5 && hour < 12) {
            return "Akkam bulte? Ganama gaarii!"; // Good morning
        } else if (hour >= 12 && hour < 17) {
            return "Akkam jirta? Guyyaa gaarii!"; // Good afternoon
        } else if (hour >= 17 && hour < 21) {
            return "Akkam jirta? Galgala gaarii!"; // Good evening
        } else {
            return "Akkam bulte? Halkan gaarii!"; // Good night
        }
    }

    /**
     * Detect mood from user message
     */
    detectMood(message: string): 'happy' | 'sad' | 'neutral' | 'excited' | 'frustrated' {
        const lowerMsg = message.toLowerCase();

        // Happy indicators
        if (lowerMsg.includes('galatoomaa') || lowerMsg.includes('gammade') ||
            lowerMsg.includes('😊') || lowerMsg.includes('😄')) {
            return 'happy';
        }

        // Sad indicators
        if (lowerMsg.includes('gaddaa') || lowerMsg.includes('dhiphoo') ||
            lowerMsg.includes('😢') || lowerMsg.includes('😞')) {
            return 'sad';
        }

        // Excited indicators
        if (lowerMsg.includes('!!!') || lowerMsg.includes('🎉') ||
            lowerMsg.includes('ajaa\'iba')) {
            return 'excited';
        }

        // Frustrated indicators
        if (lowerMsg.includes('hin hubadhu') || lowerMsg.includes('rakkoo') ||
            lowerMsg.includes('😤') || lowerMsg.includes('😠')) {
            return 'frustrated';
        }

        return 'neutral';
    }

    /**
     * Get mood-appropriate response prefix
     */
    getMoodResponse(mood: 'happy' | 'sad' | 'neutral' | 'excited' | 'frustrated'): string {
        switch (mood) {
            case 'happy':
                return "Gammachuu kee argee gammadeera! ";
            case 'sad':
                return "Gaddaa kee hubadheera. Si gargaaruuf qophaa'adha. ";
            case 'excited':
                return "Gammachuu kee wajjiin qoodadha! ";
            case 'frustrated':
                return "Dhiifama, rakkoo kee hubadheera. Haaluma gaariin si gargaaruu yaala. ";
            default:
                return "";
        }
    }

    /**
     * Save user preferences
     */
    savePreferences(preferences: Partial<UserPreferences>): void {
        try {
            const existing = this.getPreferences();
            const updated: UserPreferences = {
                ...existing,
                ...preferences,
                lastInteraction: Date.now()
            };
            localStorage.setItem(this.sessionKey, JSON.stringify(updated));
        } catch (error) {
            console.warn('Failed to save preferences:', error);
        }
    }

    /**
     * Get user preferences
     */
    getPreferences(): UserPreferences {
        try {
            const stored = localStorage.getItem(this.sessionKey);
            if (stored) {
                return JSON.parse(stored);
            }
        } catch (error) {
            console.warn('Failed to load preferences:', error);
        }

        return {
            preferredTopics: [],
            lastInteraction: Date.now()
        };
    }

    /**
     * Get personalized greeting
     */
    getPersonalizedGreeting(): string {
        const prefs = this.getPreferences();
        const timeGreeting = this.getTimeBasedGreeting();

        if (prefs.name) {
            return `${timeGreeting} ${prefs.name}! Maal si gargaaruu danda'a?`;
        }

        return `${timeGreeting} Maal si gargaaruu danda'a?`;
    }

    /**
     * Check if returning user
     */
    isReturningUser(): boolean {
        const prefs = this.getPreferences();
        const daysSinceLastVisit = (Date.now() - prefs.lastInteraction) / (1000 * 60 * 60 * 24);
        return daysSinceLastVisit < 30 && prefs.lastInteraction > 0;
    }

    /**
     * Get welcome back message
     */
    getWelcomeBackMessage(): string {
        const prefs = this.getPreferences();
        const daysSince = Math.floor((Date.now() - prefs.lastInteraction) / (1000 * 60 * 60 * 24));

        if (daysSince === 0) {
            return "Baga deebitee! Har'as si gargaaruuf qophaa'adha.";
        } else if (daysSince === 1) {
            return "Baga deebitee! Kaleessa booda si arguu gammadeera.";
        } else if (daysSince < 7) {
            return `Baga deebitee! Guyyaa ${daysSince} booda si arguu gammadeera.`;
        } else {
            return "Baga deebitee! Yeroo dheeraa booda si arguu gammadeera!";
        }
    }

    /**
     * Extract topics from conversation
     */
    extractTopics(messages: string[]): string[] {
        const topics: Set<string> = new Set();
        const keywords = {
            'saayinsii': ['saayinsii', 'qorannoo', 'teknoolojii'],
            'seenaa': ['seenaa', 'bara', 'durii'],
            'fayyaa': ['fayyaa', 'qulqullina', 'dhukkuba'],
            'barnoota': ['barnoota', 'barachuun', 'beekumsa'],
            'aadaa': ['aadaa', 'dudhaa', 'seera'],
            'gadaa': ['gadaa', 'abbaa gadaa', 'sirna'],
        };

        messages.forEach(msg => {
            const lower = msg.toLowerCase();
            Object.entries(keywords).forEach(([topic, words]) => {
                if (words.some(word => lower.includes(word))) {
                    topics.add(topic);
                }
            });
        });

        return Array.from(topics);
    }

    /**
     * Update conversation topics
     */
    updateTopics(newMessages: string[]): void {
        const topics = this.extractTopics(newMessages);
        if (topics.length > 0) {
            const prefs = this.getPreferences();
            const updatedTopics = Array.from(new Set([...prefs.preferredTopics, ...topics]));
            this.savePreferences({ preferredTopics: updatedTopics });
        }
    }
}

// Export singleton instance
export const personaService = new PersonaService();
