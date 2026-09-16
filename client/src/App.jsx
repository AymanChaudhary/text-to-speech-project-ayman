import { useState, useEffect } from 'react';
import { Volume2, Mic, AudioLines } from 'lucide-react';
import TextInput from './components/TextInput';
import VoiceSelector from './components/VoiceSelector';
import GenerateButton from './components/GenerateButton';
import AudioPlayer from './components/AudioPlayer';
import ErrorMessage from './components/ErrorMessage';

function App() {
  const [text, setText] = useState('');
  const [selectedVoice, setSelectedVoice] = useState(null);
  const [voices, setVoices] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const [error, setError] = useState(null);
  const [charCount, setCharCount] = useState(0);

  // Load available voices when component mounts
  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      setVoices(availableVoices);

      // Set default voice (first English voice or first available)
      if (availableVoices.length > 0 && !selectedVoice) {
        const englishVoice = availableVoices.find(voice => voice.lang.startsWith('en'));
        setSelectedVoice(englishVoice || availableVoices[0]);
      }
    };

    loadVoices();

    // Chrome voices might load asynchronously
    if ('onvoiceschanged' in window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleTextChange = (newText) => {
    setText(newText);
    setCharCount(newText.length);
    setError(null); // Clear error when text changes
  };

  const handleGenerateSpeech = async () => {
    if (!text.trim()) {
      setError('Please enter some text to convert to speech.');
      return;
    }

    if (text.length > 5000) { // Basic limit
      setError('Text is too long. Please limit to 5000 characters.');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      // Using Web Speech API directly in browser
      const utterance = new SpeechSynthesisUtterance(text);

      if (selectedVoice) {
        utterance.voice = selectedVoice;
        utterance.lang = selectedVoice.lang;
      }

      // Optional: Set rate, pitch, volume
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      // Start speaking
      window.speechSynthesis.speak(utterance);

      // For Level 1, we simulate audio generation
      setTimeout(() => {
        setIsGenerating(false);
        setAudioUrl('generated-audio'); // Placeholder for audio reference
      }, 1000);

    } catch (err) {
      setError('Failed to generate speech. Please try again.');
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <header className="relative overflow-hidden bg-linear-to-r from-indigo-600 via-purple-600 to-blue-600 text-white">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-4xl mx-auto px-4 py-16 text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-white/20 rounded-full backdrop-blur-sm">
              <AudioLines className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold tracking-tight mb-2">
            Text to Speech Converter
          </h1>
          <p className="text-lg text-blue-100 max-w-2xl mx-auto">
            Convert your text to natural-sounding speech with multiple voices and languages
          </p>
          <div className="mt-6 flex items-center justify-center space-x-6 text-sm">
            <div className="flex items-center space-x-2">
              <Mic className="w-4 h-4" />
              <span>Multiple Languages</span>
            </div>
            <div className="flex items-center space-x-2">
              <Volume2 className="w-4 h-4" />
              <span>Natural Voices</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="grid gap-8">
          {/* Input Section */}
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="bg-linear-to-r from-slate-50 to-slate-100 px-6 py-4 border-b border-slate-200">
              <h2 className="text-xl font-semibold text-slate-800 flex items-center gap-2">
                <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                Enter Your Text
              </h2>
            </div>
            <div className="p-6 space-y-6">
              <TextInput
                value={text}
                onChange={handleTextChange}
                charCount={charCount}
                maxLength={5000}
              />

              <VoiceSelector
                voices={voices}
                selectedVoice={selectedVoice}
                onChange={setSelectedVoice}
              />

              <GenerateButton
                onClick={handleGenerateSpeech}
                isLoading={isGenerating}
                disabled={!text.trim()}
              />
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <ErrorMessage message={error} />
          )}

          {/* Audio Section */}
          {audioUrl && (
            <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden animate-slide-up">
              <div className="bg-linear-to-r from-emerald-50 to-green-50 px-6 py-4 border-b border-slate-200">
                <h2 className="text-xl font-semibold text-slate-800 flex items-center gap-2">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                  Generated Speech
                </h2>
              </div>
              <div className="p-6">
                <AudioPlayer
                  text={text}
                  voice={selectedVoice}
                  onDownload={() => { }}
                />
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-slate-800 text-white py-8 mt-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-slate-300">
            Level 1 Basic Version
          </p>
          <p className="text-sm text-slate-400 mt-2">
            Using Web Speech API • Free & No API Key Required
          </p>
          <div className="mt-4 flex items-center justify-center space-x-4 text-xs text-slate-500">
            <span>React.js</span>
            <span>•</span>
            <span>Node.js</span>
            <span>•</span>
            <span>Express.js</span>
            <span>•</span>
            <span>Tailwind CSS</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;