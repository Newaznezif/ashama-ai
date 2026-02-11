/**
 * Theme Service - Dynamic Oromo Cultural Themes
 * Provides seasonal themes based on Oromo culture with smooth transitions
 */

export type ThemeName = 'birraa' | 'ganna' | 'arfaasaa' | 'bona' | 'dark' | 'custom';

export interface Theme {
    name: ThemeName;
    displayName: string;
    description: string;
    colors: {
        primary: string;
        secondary: string;
        accent: string;
        background: string;
        surface: string;
        text: string;
        textSecondary: string;
        border: string;
        success: string;
        warning: string;
        error: string;
    };
    gradients: {
        hero: string;
        card: string;
        button: string;
    };
}

export const themes: Record<ThemeName, Theme> = {
    birraa: {
        name: 'birraa',
        displayName: 'Birraa (Spring)',
        description: 'Vibrant greens and fresh yellows of spring renewal',
        colors: {
            primary: '#2D5016',      // Deep forest green
            secondary: '#4A7C2C',    // Fresh grass green
            accent: '#F4D03F',       // Golden yellow
            background: '#F8FFF4',   // Very light green
            surface: '#FFFFFF',
            text: '#1A3409',
            textSecondary: '#4A7C2C',
            border: '#C8E6C9',
            success: '#4CAF50',
            warning: '#FFC107',
            error: '#E53935',
        },
        gradients: {
            hero: 'linear-gradient(135deg, #4A7C2C 0%, #F4D03F 100%)',
            card: 'linear-gradient(to bottom right, #FFFFFF, #F0F8E8)',
            button: 'linear-gradient(135deg, #4A7C2C, #2D5016)',
        },
    },

    ganna: {
        name: 'ganna',
        displayName: 'Ganna (Summer)',
        description: 'Warm oranges and vibrant reds of summer heat',
        colors: {
            primary: '#D84315',      // Deep orange-red
            secondary: '#FF6F00',    // Bright orange
            accent: '#FFD54F',       // Golden
            background: '#FFF8F0',   // Warm white
            surface: '#FFFFFF',
            text: '#3E2723',
            textSecondary: '#D84315',
            border: '#FFE0B2',
            success: '#4CAF50',
            warning: '#FF9800',
            error: '#D32F2F',
        },
        gradients: {
            hero: 'linear-gradient(135deg, #FF6F00 0%, #D84315 100%)',
            card: 'linear-gradient(to bottom right, #FFFFFF, #FFF3E0)',
            button: 'linear-gradient(135deg, #FF6F00, #D84315)',
        },
    },

    arfaasaa: {
        name: 'arfaasaa',
        displayName: 'Arfaasaa (Autumn)',
        description: 'Earth tones and warm browns of harvest season',
        colors: {
            primary: '#5D4037',      // Deep brown
            secondary: '#8D6E63',    // Warm brown
            accent: '#FFA726',       // Autumn orange
            background: '#FFF9F5',   // Cream
            surface: '#FFFFFF',
            text: '#3E2723',
            textSecondary: '#6D4C41',
            border: '#D7CCC8',
            success: '#689F38',
            warning: '#F57C00',
            error: '#C62828',
        },
        gradients: {
            hero: 'linear-gradient(135deg, #8D6E63 0%, #FFA726 100%)',
            card: 'linear-gradient(to bottom right, #FFFFFF, #EFEBE9)',
            button: 'linear-gradient(135deg, #8D6E63, #5D4037)',
        },
    },

    bona: {
        name: 'bona',
        displayName: 'Bona (Winter)',
        description: 'Cool blues and serene purples of winter calm',
        colors: {
            primary: '#1565C0',      // Deep blue
            secondary: '#42A5F5',    // Sky blue
            accent: '#7E57C2',       // Purple
            background: '#F5F9FF',   // Very light blue
            surface: '#FFFFFF',
            text: '#0D47A1',
            textSecondary: '#1976D2',
            border: '#BBDEFB',
            success: '#4CAF50',
            warning: '#FFC107',
            error: '#D32F2F',
        },
        gradients: {
            hero: 'linear-gradient(135deg, #42A5F5 0%, #7E57C2 100%)',
            card: 'linear-gradient(to bottom right, #FFFFFF, #E3F2FD)',
            button: 'linear-gradient(135deg, #42A5F5, #1565C0)',
        },
    },

    dark: {
        name: 'dark',
        displayName: 'Halkan (Dark)',
        description: 'Sleek dark mode for night usage',
        colors: {
            primary: '#DA291C',      // Oromo red
            secondary: '#FF5252',    // Bright red
            accent: '#FFD54F',       // Gold
            background: '#0A0A0A',   // Almost black
            surface: '#1A1A1A',
            text: '#FFFFFF',
            textSecondary: '#B0B0B0',
            border: '#2A2A2A',
            success: '#4CAF50',
            warning: '#FFC107',
            error: '#EF5350',
        },
        gradients: {
            hero: 'linear-gradient(135deg, #DA291C 0%, #FF5252 100%)',
            card: 'linear-gradient(to bottom right, #1A1A1A, #0F0F0F)',
            button: 'linear-gradient(135deg, #DA291C, #B71C1C)',
        },
    },

    custom: {
        name: 'custom',
        displayName: 'Dhuunfaa (Custom)',
        description: 'Your personalized color scheme',
        colors: {
            primary: '#DA291C',
            secondary: '#FF5252',
            accent: '#FFD54F',
            background: '#FDFDFD',
            surface: '#FFFFFF',
            text: '#1A1A1A',
            textSecondary: '#666666',
            border: '#E0E0E0',
            success: '#4CAF50',
            warning: '#FFC107',
            error: '#EF5350',
        },
        gradients: {
            hero: 'linear-gradient(135deg, #DA291C 0%, #FF5252 100%)',
            card: 'linear-gradient(to bottom right, #FFFFFF, #F5F5F5)',
            button: 'linear-gradient(135deg, #DA291C, #B71C1C)',
        },
    },
};

class ThemeService {
    private currentTheme: ThemeName = 'dark';
    private storageKey = 'ashama_theme';
    private autoThemeEnabled = false;

    constructor() {
        this.loadTheme();
    }

    /**
     * Get current theme
     */
    getCurrentTheme(): Theme {
        return themes[this.currentTheme];
    }

    /**
     * Get current theme name
     */
    getCurrentThemeName(): ThemeName {
        return this.currentTheme;
    }

    /**
     * Set theme
     */
    setTheme(themeName: ThemeName): void {
        this.currentTheme = themeName;
        this.saveTheme();
        this.applyTheme();
    }

    /**
     * Apply theme to document
     */
    private applyTheme(): void {
        const theme = this.getCurrentTheme();
        const root = document.documentElement;

        // Apply CSS variables
        Object.entries(theme.colors).forEach(([key, value]) => {
            root.style.setProperty(`--color-${this.camelToKebab(key)}`, value);
        });

        Object.entries(theme.gradients).forEach(([key, value]) => {
            root.style.setProperty(`--gradient-${key}`, value);
        });

        // Add theme class to body
        document.body.className = document.body.className.replace(/theme-\w+/g, '');
        document.body.classList.add(`theme-${theme.name}`);

        // Smooth transition
        document.body.style.transition = 'background-color 0.5s ease, color 0.5s ease';
    }

    /**
     * Save theme preference
     */
    private saveTheme(): void {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify({
                theme: this.currentTheme,
                autoTheme: this.autoThemeEnabled,
            }));
        } catch (error) {
            console.warn('Failed to save theme:', error);
        }
    }

    /**
     * Load theme preference
     */
    private loadTheme(): void {
        try {
            const saved = localStorage.getItem(this.storageKey);
            if (saved) {
                const { theme, autoTheme } = JSON.parse(saved);
                this.currentTheme = theme || 'dark';
                this.autoThemeEnabled = autoTheme || false;
            }
        } catch (error) {
            console.warn('Failed to load theme:', error);
        }
    }

    /**
     * Enable auto theme based on time/season
     */
    enableAutoTheme(): void {
        this.autoThemeEnabled = true;
        this.updateAutoTheme();
        this.saveTheme();
    }

    /**
     * Disable auto theme
     */
    disableAutoTheme(): void {
        this.autoThemeEnabled = false;
        this.saveTheme();
    }

    /**
     * Update theme based on time/season
     */
    private updateAutoTheme(): void {
        if (!this.autoThemeEnabled) return;

        const month = new Date().getMonth() + 1; // 1-12
        const hour = new Date().getHours();

        // Dark mode at night
        if (hour >= 20 || hour < 6) {
            this.setTheme('dark');
            return;
        }

        // Seasonal themes based on Ethiopian/Oromo calendar approximation
        if (month >= 3 && month <= 5) {
            this.setTheme('birraa'); // Spring (March-May)
        } else if (month >= 6 && month <= 8) {
            this.setTheme('ganna'); // Summer (June-August)
        } else if (month >= 9 && month <= 11) {
            this.setTheme('arfaasaa'); // Autumn (September-November)
        } else {
            this.setTheme('bona'); // Winter (December-February)
        }
    }

    /**
     * Get all available themes
     */
    getAllThemes(): Theme[] {
        return Object.values(themes);
    }

    /**
     * Check if auto theme is enabled
     */
    isAutoThemeEnabled(): boolean {
        return this.autoThemeEnabled;
    }

    /**
     * Convert camelCase to kebab-case
     */
    private camelToKebab(str: string): string {
        return str.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
    }

    /**
     * Initialize theme on app start
     */
    initialize(): void {
        this.applyTheme();
        if (this.autoThemeEnabled) {
            this.updateAutoTheme();
            // Update every hour
            setInterval(() => this.updateAutoTheme(), 3600000);
        }
    }
}

// Export singleton instance
export const themeService = new ThemeService();
