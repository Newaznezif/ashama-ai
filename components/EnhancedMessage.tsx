
import React, { useState } from 'react';
import { Message } from '../types';

interface EnhancedMessageProps {
    message: Message;
    onReact?: (messageId: string, emoji: string) => void;
    onPin?: (messageId: string) => void;
    onCopy?: (content: string) => void;
    onRegenerate?: (messageId: string) => void;
    isPinned?: boolean;
}

const QUICK_REACTIONS = ['👍', '❤️', '😊', '🎉', '🤔', '👏'];

const EnhancedMessage: React.FC<EnhancedMessageProps> = ({
    message,
    onReact,
    onPin,
    onCopy,
    onRegenerate,
    isPinned = false,
}) => {
    const [showActions, setShowActions] = useState(false);
    const [showReactions, setShowReactions] = useState(false);
    const [reactions, setReactions] = useState<Record<string, number>>({});

    const isUser = message.role === 'user';

    const handleReaction = (emoji: string) => {
        setReactions(prev => ({
            ...prev,
            [emoji]: (prev[emoji] || 0) + 1
        }));
        onReact?.(message.timestamp.toString(), emoji);
        setShowReactions(false);
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(message.content);
        onCopy?.(message.content);
    };

    return (
        <div
            className={`group relative mb-4 ${isUser ? 'flex justify-end' : 'flex justify-start'}`}
            onMouseEnter={() => setShowActions(true)}
            onMouseLeave={() => setShowActions(false)}
        >
            {/* Pin Indicator */}
            {isPinned && (
                <div className="absolute -top-2 left-4 z-10">
                    <div className="bg-red-600 text-white text-xs px-2 py-0.5 rounded-full flex items-center gap-1 shadow-lg">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.616 1.738 5.42a1 1 0 01-.285 1.05A3.989 3.989 0 0115 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.738-5.42-1.233-.617a1 1 0 01.894-1.788l1.599.799L11 4.323V3a1 1 0 011-1zm-5 8.274l-.818 2.552c-.25.78-.03 1.632.57 2.14.599.508 1.434.558 2.068.165L9 14.25V16a1 1 0 102 0v-1.75l2.18.88c.634.393 1.469.343 2.068-.165.6-.508.82-1.36.57-2.14L15 10.274V6.327l-1-1.732V10a1 1 0 11-2 0V4.595L11 5.327V10a1 1 0 11-2 0V5.327L8 4.595V10a1 1 0 11-2 0V4.595L5 6.327v3.947z" />
                        </svg>
                        <span className="font-bold">Qabatame</span>
                    </div>
                </div>
            )}

            <div className={`max-w-[80%] ${isUser ? 'ml-auto' : 'mr-auto'}`}>
                {/* Message Bubble */}
                <div
                    className={`relative rounded-2xl px-4 py-3 shadow-md transition-all duration-200 ${isUser
                            ? 'bg-gradient-to-br from-red-600 to-red-700 text-white'
                            : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-100 dark:border-gray-700'
                        } ${showActions ? 'ring-2 ring-red-500/20' : ''}`}
                >
                    {/* Message Content */}
                    <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                        {message.content}
                    </p>

                    {/* Sources */}
                    {message.sources && message.sources.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-white/20 dark:border-gray-700">
                            <p className="text-xs font-bold mb-2 opacity-80">Maddoota:</p>
                            <div className="space-y-1">
                                {message.sources.map((source, idx) => (
                                    <a
                                        key={idx}
                                        href={source.uri}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="block text-xs hover:underline opacity-90 hover:opacity-100 transition-opacity"
                                    >
                                        🔗 {source.title}
                                    </a>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Timestamp */}
                    <p className={`text-[10px] mt-2 ${isUser ? 'text-white/70' : 'text-gray-500 dark:text-gray-400'}`}>
                        {new Date(message.timestamp).toLocaleTimeString('om-ET', {
                            hour: '2-digit',
                            minute: '2-digit'
                        })}
                    </p>
                </div>

                {/* Reactions Display */}
                {Object.keys(reactions).length > 0 && (
                    <div className="flex gap-1 mt-2 flex-wrap">
                        {Object.entries(reactions).map(([emoji, count]) => (
                            <button
                                key={emoji}
                                onClick={() => handleReaction(emoji)}
                                className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full text-xs flex items-center gap-1 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                            >
                                <span>{emoji}</span>
                                <span className="font-bold">{count}</span>
                            </button>
                        ))}
                    </div>
                )}

                {/* Quick Actions */}
                {showActions && (
                    <div
                        className={`absolute -bottom-10 ${isUser ? 'right-0' : 'left-0'} flex items-center gap-1 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-1 z-20 animate-in fade-in slide-in-from-bottom`}
                    >
                        {/* Reaction Button */}
                        <div className="relative">
                            <button
                                onClick={() => setShowReactions(!showReactions)}
                                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                title="Miira kee mul'isi (React)"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </button>

                            {/* Reaction Picker */}
                            {showReactions && (
                                <div className="absolute bottom-full mb-2 left-0 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-2 flex gap-1 animate-in fade-in scale-in">
                                    {QUICK_REACTIONS.map(emoji => (
                                        <button
                                            key={emoji}
                                            onClick={() => handleReaction(emoji)}
                                            className="text-xl hover:scale-125 transition-transform p-1"
                                        >
                                            {emoji}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Pin Button */}
                        <button
                            onClick={() => onPin?.(message.timestamp.toString())}
                            className={`p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors ${isPinned ? 'text-red-600' : ''
                                }`}
                            title={isPinned ? 'Qabannoo hiiki (Unpin)' : 'Qabadhu (Pin)'}
                        >
                            <svg className="w-4 h-4" fill={isPinned ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                            </svg>
                        </button>

                        {/* Copy Button */}
                        <button
                            onClick={handleCopy}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                            title="Garagalchi (Copy)"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                        </button>

                        {/* Regenerate (for assistant messages only) */}
                        {!isUser && onRegenerate && (
                            <button
                                onClick={() => onRegenerate(message.timestamp.toString())}
                                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                title="Irra deebi'ii uumi (Regenerate)"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default EnhancedMessage;
