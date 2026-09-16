import { AlertCircle, X } from 'lucide-react';

const ErrorMessage = ({ message, onDismiss }) => {
    return (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 animate-fade-in">
            <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                    <div className="shrink-0">
                        <AlertCircle className="w-5 h-5 text-red-500" />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-sm font-medium text-red-800">
                            Error
                        </h3>
                        <p className="text-sm text-red-700 mt-1">
                            {message}
                        </p>
                    </div>
                </div>
                {onDismiss && (
                    <button
                        onClick={onDismiss}
                        className="shrink-0 p-1 text-red-400 hover:text-red-600 transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                )}
            </div>

            {/* Error details */}
            <div className="mt-3 text-xs text-red-600 bg-red-100/50 p-2 rounded">
                <div className="flex items-center gap-4">
                    <span>Status: 400</span>
                    <span>•</span>
                    <span>Client-side validation</span>
                </div>
            </div>
        </div>
    );
};

export default ErrorMessage;