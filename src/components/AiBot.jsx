'use client';

import { useVoiceAssistant } from '@/hooks/useVoiceAssitantOnline';
import { Mic, Square, Loader2, Volume2, AlertCircle } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import pdfToText from 'react-pdftotext';
import Loader from './ui/Loader';

const AiBot = ({ pdfUrl, imgUrl }) => {
    const [pdfText, setPdfText] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Voice assistant hook
    const voiceAssistant = useVoiceAssistant();

    useEffect(() => {
        if (pdfUrl) {
            const extractText = async () => {
                setLoading(true);
                setError(null);
                try {
                    const response = await fetch(pdfUrl);
                    const blob = await response.blob();
                    const text = await pdfToText(blob);
                    setPdfText(text);
                } catch (err) {
                    console.error('Failed to extract PDF text:', err);
                    setError('Failed to extract PDF text.');
                } finally {
                    setLoading(false);
                }
            };
            extractText();
        } else if (imgUrl) {
            // If no PDF, set image URL in assistant context
            voiceAssistant.setImgUrl(Array.isArray(imgUrl) ? imgUrl : [imgUrl]);
        }
    }, [pdfUrl, imgUrl, voiceAssistant]);

    // Compose system prompt/context for assistant
    const systemPrompt = pdfText
        ? `Here is the extracted text from the PDF report. Use this information to answer health-related questions, but you can also answer general queries if the text is not relevant or missing.\n\n${pdfText}`
        : imgUrl
            ? `No PDF text available. Here is an image URL you can use for context: ${Array.isArray(imgUrl) ? imgUrl.join(', ') : imgUrl}`
            : 'No PDF or image available. You can answer general health or assistant questions.';

    return (
        <div className="bg-card h-full border border-border rounded-xl shadow-md p-4 sm:p-6 flex flex-col gap-6 w-full flex-1">
            {loading ? (
                <Loader />
            ) : error ? (
                <p className="text-destructive">{error}</p>
            ) : (
                <>
                    {/* Voice Assistant UI */}
                    <div className="mt-2 flex  flex-col h-full">
                        <div className="mb-4 flex items-center gap-3">
                            <button
                                className="px-3 py-1 rounded-lg bg-primary text-primary-foreground shadow hover:bg-primary/90 transition flex items-center gap-2"
                                onClick={voiceAssistant.startListening}
                                disabled={voiceAssistant.listening || voiceAssistant.loading}
                                title="Start Voice Query"
                            >
                                <span className="inline-block">
                                    <Mic size={15} />
                                </span>
                                {voiceAssistant.listening ? 'Listening...' : 'Start Voice Query'}
                            </button>
                            <button
                                className="px-3 py-1 rounded-lg bg-muted text-muted-foreground shadow flex items-center gap-2"
                                onClick={voiceAssistant.stopVoice}
                                disabled={!voiceAssistant.listening && !voiceAssistant.speaking}
                                title="Stop Voice"
                            >
                                <span className="inline-block">
                                    <Square size={15} />
                                </span>
                                Stop
                            </button>
                        </div>
                        <div className="mb-2 flex flex-1 flex-col h-full">
                            <div className="flex-1 overflow-y-auto flex flex-col gap-2 bg-background/20 border rounded-lg p-3">
                                {voiceAssistant.conversation && voiceAssistant.conversation.length > 0 ? (
                                    voiceAssistant.conversation.map((msg, idx) => (
                                        <div
                                            key={idx}
                                            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                        >
                                            <div
                                                className={`inline-block px-4 py-2 rounded-2xl max-w-[80%] whitespace-pre-wrap text-sm shadow-sm ${msg.role === 'user'
                                                        ? 'bg-primary text-primary-foreground rounded-br-lg'
                                                        : 'bg-muted text-foreground rounded-bl-lg border border-border'
                                                    }`}
                                            >
                                                {msg.content}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <span className="text-muted-foreground">Start talking with your report with AI</span>
                                )}
                            </div>
                            {/* Status row at the end */}
                            <div className="mt-3 flex items-center gap-2 justify-end">
                                {voiceAssistant.listening && (
                                    <span className="px-2 py-1 rounded bg-primary text-primary-foreground text-xs font-semibold flex items-center gap-1">
                                        <Mic className="w-4 h-4 mr-1" /> Listening
                                    </span>
                                )}
                                {voiceAssistant.loading && (
                                    <span className="px-2 py-1 rounded bg-muted text-muted-foreground text-xs font-semibold flex items-center gap-1">
                                        <Loader2 className="w-4 h-4 mr-1 animate-spin" /> Processing
                                    </span>
                                )}
                                {voiceAssistant.speaking && (
                                    <span className="px-2 py-1 rounded bg-secondary text-secondary-foreground text-xs font-semibold flex items-center gap-1">
                                        <Volume2 className="w-4 h-4 mr-1" /> Speaking
                                    </span>
                                )}
                                {voiceAssistant.error && (
                                    <span className="px-2 py-1 rounded bg-destructive text-white text-xs font-semibold flex items-center gap-1">
                                        <AlertCircle className="w-4 h-4 mr-1" /> Error
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default AiBot;
