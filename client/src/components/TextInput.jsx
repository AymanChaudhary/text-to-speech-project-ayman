import { FileText, AlertCircle } from 'lucide-react';

const TextInput = ({ value, onChange, charCount, maxLength }) => {
    const isNearLimit = charCount > maxLength * 0.9;

    return (
        <div className="space-y-2">
            <label htmlFor="text-input" className="block text-sm font-medium text-slate-700">
                <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-slate-500" />
                    Enter your text
                </div>
            </label>
            <div className="relative">
                <textarea
                    id="text-input"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    maxLength={maxLength}
                    placeholder="Type or paste your text here..."
                    rows={8}
                    className={`
            w-full px-4 py-3 border rounded-xl resize-none
            focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent
            transition-all duration-200
            ${isNearLimit
                            ? 'border-orange-300 bg-orange-50'
                            : 'border-slate-300 bg-white hover:border-slate-400'
                        }
          `}
                />
                {value && (
                    <div className="absolute top-3 right-3">
                        <div className="text-xs text-slate-400 bg-white/80 px-2 py-1 rounded">
                            {value.split(/\s+/).filter(word => word.length > 0).length} words
                        </div>
                    </div>
                )}
            </div>

            <div className="flex justify-between items-center text-xs">
                <div className={`flex items-center gap-1 ${isNearLimit ? 'text-orange-600' : 'text-slate-500'
                    }`}>
                    {isNearLimit && <AlertCircle className="w-3 h-3" />}
                    <span>Characters: {charCount}</span>
                </div>
                <span className="text-slate-400">Max: {maxLength}</span>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-slate-200 rounded-full h-1">
                <div
                    className={`h-1 rounded-full transition-all duration-300 ${isNearLimit ? 'bg-orange-500' : 'bg-indigo-500'
                        }`}
                    style={{ width: `${Math.min((charCount / maxLength) * 100, 100)}%` }}
                ></div>
            </div>
        </div>
    );
};

export default TextInput;