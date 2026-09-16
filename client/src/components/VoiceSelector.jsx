import { Users, Globe, ChevronDown } from 'lucide-react';

const VoiceSelector = ({ voices, selectedVoice, onChange }) => {
    // Group voices by language
    const voicesByLanguage = voices.reduce((acc, voice) => {
        const lang = voice.lang.split('-')[0]; // Get language code
        if (!acc[lang]) {
            acc[lang] = [];
        }
        acc[lang].push(voice);
        return acc;
    }, {});

    const languages = Object.keys(voicesByLanguage).sort();

    return (
        <div className="space-y-2">
            <label htmlFor="voice-select" className="block text-sm font-medium text-slate-700">
                <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-slate-500" />
                    Select Voice
                </div>
            </label>

            <div className="relative">
                <select
                    id="voice-select"
                    value={selectedVoice ? selectedVoice.name : ''}
                    onChange={(e) => {
                        const voice = voices.find(v => v.name === e.target.value);
                        onChange(voice);
                    }}
                    className="w-full px-4 py-3 pr-10 border border-slate-300 rounded-xl bg-white
            focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent
            appearance-none cursor-pointer transition-colors duration-200 hover:border-slate-400"
                >
                    {languages.length > 0 ? (
                        languages.map(language => (
                            <optgroup key={language} label={language.toUpperCase()}>
                                {voicesByLanguage[language].map(voice => (
                                    <option key={voice.name} value={voice.name}>
                                        {voice.name} ({voice.lang})
                                    </option>
                                ))}
                            </optgroup>
                        ))
                    ) : (
                        <option value="">Loading voices...</option>
                    )}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
            </div>

            {selectedVoice && (
                <div className="flex items-center gap-4 text-xs text-slate-500 bg-slate-50 p-3 rounded-lg">
                    <div className="flex items-center gap-1">
                        <Globe className="w-3 h-3" />
                        <span>Language: {selectedVoice.lang}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                        <span>Available</span>
                    </div>
                </div>
            )}

            {/* Voice count info */}
            {voices.length > 0 && (
                <div className="text-xs text-slate-400 flex items-center justify-between">
                    <span>{voices.length} voices available</span>
                    <span>{languages.length} languages</span>
                </div>
            )}
        </div>
    );
};

export default VoiceSelector;