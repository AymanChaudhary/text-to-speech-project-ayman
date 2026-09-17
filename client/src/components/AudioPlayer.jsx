import { useRef, useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Download, Volume2, VolumeX, Loader2, CheckCircle, AlertCircle, FileAudio } from 'lucide-react';

const AudioPlayer = ({ text, voice, onDownload }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [volume, setVolume] = useState(1);
    const [isMuted, setIsMuted] = useState(false);
    const [progress, setProgress] = useState(0);
    const [isDownloading, setIsDownloading] = useState(false);
    const [downloadSuccess, setDownloadSuccess] = useState(false);
    const [downloadError, setDownloadError] = useState(null);
    const [audioUrl, setAudioUrl] = useState(null);
    const [audioBlob, setAudioBlob] = useState(null);
    const audioRef = useRef(null);

    // Reset states when text changes
    useEffect(() => {
        setProgress(0);
        setIsPlaying(false);
        setDownloadSuccess(false);
        setDownloadError(null);
        setAudioUrl(null);
        setAudioBlob(null);
    }, [text]);

    const handlePlay = () => {
        // Stop any ongoing speech
        window.speechSynthesis.cancel();

        // Create new utterance
        const utterance = new SpeechSynthesisUtterance(text);
        if (voice) {
            utterance.voice = voice;
            utterance.lang = voice.lang;
        }

        // Apply volume settings
        utterance.volume = isMuted ? 0 : volume;

        // Start speaking
        window.speechSynthesis.speak(utterance);
        setIsPlaying(true);

        // Reset after speaking
        utterance.onend = () => {
            setIsPlaying(false);
            setProgress(0);
        };

        utterance.onerror = () => {
            setIsPlaying(false);
        };
    };

    const handlePause = () => {
        window.speechSynthesis.pause();
        setIsPlaying(false);
    };

    const handleResume = () => {
        window.speechSynthesis.resume();
        setIsPlaying(true);
    };

    const handleStop = () => {
        window.speechSynthesis.cancel();
        setIsPlaying(false);
        setProgress(0);
    };

    const handleVolumeChange = (newVolume) => {
        setVolume(newVolume);
        setIsMuted(newVolume === 0);
    };

    const toggleMute = () => {
        setIsMuted(!isMuted);
    };

    // Download functionality
    const handleDownload = async () => {
        setIsDownloading(true);
        setDownloadError(null);
        setDownloadSuccess(false);

        try {
            // Get language from selected voice or default
            const language = voice ? voice.lang.split('-')[0] : 'en';

            // Call backend API to generate audio
            const response = await fetch('https://text-to-speech-project-ayman.onrender.com/api/tts/download', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    text: text,
                    language: language,
                    speed: 1
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Download failed');
            }

            // Get audio blob from response
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);

            setAudioUrl(url);
            setAudioBlob(blob);

            // Create download link and trigger download
            const a = document.createElement('a');
            a.href = url;
            a.download = `speech-${Date.now()}.mp3`;
            document.body.appendChild(a);
            a.click();

            // Cleanup
            setTimeout(() => {
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);
            }, 100);

            setDownloadSuccess(true);
            setTimeout(() => setDownloadSuccess(false), 3000);

        } catch (error) {
            console.error('Download error:', error);
            setDownloadError(error.message || 'Failed to download audio. Please try again.');
        } finally {
            setIsDownloading(false);
        }
    };

    // Alternative download method using Web Speech API + recording
    const handleDownloadAlternative = async () => {
        setIsDownloading(true);
        setDownloadError(null);

        try {
            // Method 1: Try backend API first
            await handleDownload();

        } catch (backendError) {
            console.log('Backend failed, trying alternative method...');

            // Method 2: Direct Google Translate TTS (fallback)
            try {
                const language = voice ? voice.lang.split('-')[0] : 'en';
                const encodedText = encodeURIComponent(text.substring(0, 190)); // Limit for single request
                const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodedText}&tl=${language}&client=tw-ob`;

                const response = await fetch(url, {
                    method: 'GET',
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                        'Referer': 'https://translate.google.com/'
                    }
                });

                if (!response.ok) throw new Error('Failed to fetch audio');

                const blob = await response.blob();
                const audioUrl = window.URL.createObjectURL(blob);

                // Create download link
                const a = document.createElement('a');
                a.href = audioUrl;
                a.download = `speech-${Date.now()}.mp3`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                window.URL.revokeObjectURL(audioUrl);

                setDownloadSuccess(true);
                setTimeout(() => setDownloadSuccess(false), 3000);

            } catch (directError) {
                setDownloadError('Unable to download audio. Please check your connection and try again.');
            }
        } finally {
            setIsDownloading(false);
        }
    };

    // Get file size for display
    const getFileSize = () => {
        if (audioBlob) {
            const sizeInBytes = audioBlob.size;
            if (sizeInBytes < 1024) return `${sizeInBytes} B`;
            if (sizeInBytes < 1024 * 1024) return `${(sizeInBytes / 1024).toFixed(2)} KB`;
            return `${(sizeInBytes / (1024 * 1024)).toFixed(2)} MB`;
        }
        return null;
    };

    return (
        <div className="space-y-6">
            {/* Audio Controls */}
            <div className="flex items-center justify-center space-x-4">
                <button
                    onClick={isPlaying ? handlePause : handlePlay}
                    className="p-4 bg-linear-to-r from-emerald-500 to-green-600 text-white rounded-full
            hover:from-emerald-600 hover:to-green-700 transition-all duration-300
            shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
                >
                    {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
                </button>

                <button
                    onClick={handleResume}
                    disabled={!isPlaying}
                    className="p-3 bg-white border border-slate-300 text-slate-600 rounded-full
            hover:bg-slate-50 hover:border-slate-400 transition-all duration-300
            disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <RotateCcw className="w-4 h-4" />
                </button>

                <button
                    onClick={handleStop}
                    className="p-3 bg-white border border-slate-300 text-slate-600 rounded-full
            hover:bg-red-50 hover:border-red-300 hover:text-red-600 transition-all duration-300"
                >
                    <Pause className="w-4 h-4" />
                </button>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                <div
                    className="h-full bg-linear-to-r from-emerald-500 to-blue-500 transition-all duration-1000 ease-out"
                    style={{ width: `${progress}%` }}
                ></div>
            </div>

            {/* Volume Control */}
            <div className="flex items-center space-x-3">
                <button
                    onClick={toggleMute}
                    className="p-2 text-slate-600 hover:text-slate-800 transition-colors"
                >
                    {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
                <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={isMuted ? 0 : volume}
                    onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                    className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer
            accent-emerald-500 focus:outline-none"
                />
                <span className="text-sm text-slate-500 min-w-12 text-right">
                    {Math.round((isMuted ? 0 : volume) * 100)}%
                </span>
            </div>

            {/* Waveform Visualization */}
            <div className="flex items-center justify-center space-x-1 py-4">
                {Array.from({ length: 30 }).map((_, i) => (
                    <div
                        key={i}
                        className={`
              w-1 rounded-full transition-all duration-300
              ${isPlaying
                                ? 'bg-linear-to-t from-emerald-500 to-blue-500 animate-pulse'
                                : 'bg-slate-300'
                            }
            `}
                        style={{
                            height: `${20 + Math.sin(i * 0.5) * 15}px`,
                            animationDelay: `${i * 0.05}s`
                        }}
                    />
                ))}
            </div>

            {/* Download Section */}
            <div className="pt-4 border-t border-slate-200">
                {/* Main Download Button */}
                <button
                    onClick={handleDownload}
                    disabled={isDownloading || !text.trim()}
                    className={`
            w-full py-4 px-6 rounded-xl font-semibold text-white
            transition-all duration-300 transform
            flex items-center justify-center gap-3
            ${isDownloading || !text.trim()
                            ? 'bg-slate-400 cursor-not-allowed scale-100'
                            : 'bg-linear-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl'
                        }
          `}
                >
                    {isDownloading ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            <span>Generating Audio...</span>
                        </>
                    ) : (
                        <>
                            <Download className="w-5 h-5" />
                            <span>Download MP3 Audio</span>
                            <FileAudio className="w-4 h-4 opacity-70" />
                        </>
                    )}
                </button>

                {/* Alternative Download Method */}
                <div className="mt-3 text-center">
                    <button
                        onClick={handleDownloadAlternative}
                        disabled={isDownloading || !text.trim()}
                        className="text-sm text-slate-500 hover:text-blue-600 underline transition-colors disabled:opacity-50"
                    >
                        Having trouble? Try alternative download method
                    </button>
                </div>

                {/* Download Status Messages */}
                {downloadSuccess && (
                    <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-2 animate-fade-in">
                        <CheckCircle className="w-5 h-5 text-emerald-500" />
                        <div>
                            <p className="text-sm font-medium text-emerald-700">Audio downloaded successfully!</p>
                            {getFileSize() && (
                                <p className="text-xs text-emerald-600">File size: {getFileSize()}</p>
                            )}
                        </div>
                    </div>
                )}

                {downloadError && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2 animate-fade-in">
                        <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
                        <div className="flex-1">
                            <p className="text-sm font-medium text-red-700">Download failed</p>
                            <p className="text-xs text-red-600 mt-1">{downloadError}</p>
                        </div>
                    </div>
                )}

                {/* Audio Info */}
                {audioBlob && (
                    <div className="mt-4 p-3 bg-slate-50 rounded-lg">
                        <div className="flex items-center justify-between text-sm text-slate-600">
                            <div className="flex items-center gap-2">
                                <FileAudio className="w-4 h-4" />
                                <span>Audio generated</span>
                            </div>
                            <div className="flex items-center gap-4">
                                <span>{getFileSize()}</span>
                                <span className="text-slate-400">|</span>
                                <span>MP3 Format</span>
                            </div>
                        </div>

                        {/* Audio Preview */}
                        {audioUrl && (
                            <div className="mt-3">
                                <audio controls className="w-full h-10">
                                    <source src={audioUrl} type="audio/mpeg" />
                                    Your browser does not support the audio element.
                                </audio>
                            </div>
                        )}
                    </div>
                )}

                {/* Instructions */}
                <div className="mt-4 text-xs text-slate-400 text-center space-y-1">
                    <p>The downloaded audio is generated using Google Translate TTS (free service).</p>
                    <p>Audio quality may vary slightly from the browser playback.</p>
                    <p className="text-slate-500">Duration: ~{Math.ceil(text.length / 150)} seconds</p>
                </div>
            </div>
        </div>
    );
};

export default AudioPlayer;