import { Play, Loader2, Sparkles } from 'lucide-react';

const GenerateButton = ({ onClick, isLoading, disabled }) => {
    return (
        <div className="pt-2">
            <button
                onClick={onClick}
                disabled={disabled || isLoading}
                className={`
          w-full py-4 px-6 rounded-xl font-semibold text-white
          transition-all duration-300 transform
          flex items-center justify-center gap-3
          ${disabled || isLoading
                        ? 'bg-slate-400 cursor-not-allowed scale-100'
                        : 'bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl'
                    }
        `}
            >
                {isLoading ? (
                    <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Generating Speech...</span>
                        <div className="flex space-x-1 ml-2">
                            <div className="w-1 h-1 bg-white rounded-full animate-bounce"></div>
                            <div className="w-1 h-1 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-1 h-1 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                    </>
                ) : (
                    <>
                        <Sparkles className="w-5 h-5" />
                        <span>Generate Speech</span>
                        <Play className="w-4 h-4" />
                    </>
                )}
            </button>

            {/* Helper text */}
            <div className="mt-3 text-center">
                <p className="text-xs text-slate-400">
                    {disabled
                        ? "Enter text above to enable"
                        : "Ready to convert your text to speech"}
                </p>
            </div>

            {/* Feature highlights */}
            <div className="mt-6 grid grid-cols-3 gap-4 pt-4 border-t border-slate-100">
                <div className="text-center">
                    <div className="text-xs font-medium text-slate-600">Fast</div>
                    <div className="text-xs text-slate-400">Real-time</div>
                </div>
                <div className="text-center">
                    <div className="text-xs font-medium text-slate-600">Free</div>
                    <div className="text-xs text-slate-400">No API key</div>
                </div>
                <div className="text-center">
                    <div className="text-xs font-medium text-slate-600">Private</div>
                    <div className="text-xs text-slate-400">Client-side</div>
                </div>
            </div>
        </div>
    );
};

export default GenerateButton;