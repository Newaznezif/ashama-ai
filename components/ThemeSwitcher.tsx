
import React, { useState, useEffect } from 'react';
import { themeService, ThemeName, Theme } from '../services/themeService';

interface ThemeSwitcherProps {
    className?: string;
}

const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({ className = '' }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [currentTheme, setCurrentTheme] = useState<ThemeName>(themeService.getCurrentThemeName());
    const [autoTheme, setAutoTheme] = useState(themeService.isAutoThemeEnabled());
    const themes = themeService.getAllThemes();

    useEffect(() => {
        // Initialize theme service on mount
        themeService.initialize();
        console.log('Theme service initialized with theme:', themeService.getCurrentThemeName());
    }, []);

    const handleThemeChange = (themeName: ThemeName) => {
        console.log('Changing theme to:', themeName);
        themeService.setTheme(themeName);
        setCurrentTheme(themeName);
        setIsOpen(false);

        // Force a small delay to ensure CSS variables are applied
        setTimeout(() => {
            console.log('Theme applied. Current theme:', themeService.getCurrentThemeName());
        }, 100);
    };

    const toggleAutoTheme = () => {
        if (autoTheme) {
            themeService.disableAutoTheme();
            setAutoTheme(false);
        } else {
            themeService.enableAutoTheme();
            setAutoTheme(true);
            setCurrentTheme(themeService.getCurrentThemeName());
        }
    };

    const currentThemeData = themeService.getCurrentTheme();

    return (
        <div className={`relative ${className}`}>
            {/* Theme Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-white/10 transition-all group"
                title="Mata-duree jijjiiri (Change theme)"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                </svg>
            </button>

            {/* Theme Dropdown */}
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsOpen(false)}
                    />

                    {/* Dropdown Panel */}
                    <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-[#1A1A1A] rounded-2xl shadow-2xl border border-gray-100 dark:border-white/10 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                        {/* Header */}
                        <div className="p-4 border-b border-gray-100 dark:border-white/10">
                            <h3 className="font-black text-sm uppercase tracking-wider">Mata-duree Filadhu</h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Choose your theme</p>
                        </div>

                        {/* Auto Theme Toggle */}
                        <div className="p-4 border-b border-gray-100 dark:border-white/10">
                            <label className="flex items-center justify-between cursor-pointer group">
                                <div>
                                    <p className="font-bold text-sm">Ofumaan Jijjiiru</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Auto theme by season/time</p>
                                </div>
                                <div className="relative">
                                    <input
                                        type="checkbox"
                                        checked={autoTheme}
                                        onChange={toggleAutoTheme}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 rounded-full peer peer-checked:bg-red-600 transition-colors"></div>
                                    <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-5"></div>
                                </div>
                            </label>
                        </div>

                        {/* Theme Grid */}
                        <div className="p-4 max-h-96 overflow-y-auto custom-scrollbar">
                            <div className="grid grid-cols-2 gap-3">
                                {themes.map((theme) => (
                                    <button
                                        key={theme.name}
                                        onClick={() => handleThemeChange(theme.name)}
                                        disabled={autoTheme}
                                        className={`relative p-4 rounded-xl border-2 transition-all text-left ${currentTheme === theme.name
                                            ? 'border-red-600 bg-red-50 dark:bg-red-900/20'
                                            : 'border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20'
                                            } ${autoTheme ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                                    >
                                        {/* Color Preview */}
                                        <div className="flex gap-1.5 mb-3">
                                            <div
                                                className="w-6 h-6 rounded-lg shadow-sm"
                                                style={{ background: theme.colors.primary }}
                                            />
                                            <div
                                                className="w-6 h-6 rounded-lg shadow-sm"
                                                style={{ background: theme.colors.secondary }}
                                            />
                                            <div
                                                className="w-6 h-6 rounded-lg shadow-sm"
                                                style={{ background: theme.colors.accent }}
                                            />
                                        </div>

                                        {/* Theme Info */}
                                        <h4 className="font-black text-sm mb-1">{theme.displayName}</h4>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                                            {theme.description}
                                        </p>

                                        {/* Active Indicator */}
                                        {currentTheme === theme.name && (
                                            <div className="absolute top-2 right-2">
                                                <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-3 bg-gray-50 dark:bg-black/20 border-t border-gray-100 dark:border-white/10">
                            <p className="text-xs text-center text-gray-500 dark:text-gray-400">
                                Mata-duree aadaa Oromoo irratti hundaa'e
                            </p>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default ThemeSwitcher;
