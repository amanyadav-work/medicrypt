'use client';

import { useState, useRef, useCallback, useEffect, createContext, useContext } from 'react';
import { GenerateAiDataGroq } from '@/actions/groq';

const IND_ENG = 'https://ccoreilly.github.io/vosk-browser/models/vosk-model-small-en-us-0.15.tar.gz';

const VoiceAssistantContext = createContext(null);
export function VoiceAssistantProvider({ children, preferredVoiceName = 'Google हिन्दी', language = 'en-US' }) {

    const [status, setStatus] = useState('idle');
    const [response, setResponse] = useState('');
    const [structuredResponse, setStructuredResponse] = useState(null);
    const [conversation, setConversation] = useState([]);
    const [error, setError] = useState(null);
    const [voices, setVoices] = useState([]);
    const [selectedVoice, setSelectedVoice] = useState(null);
    const [imgUrl, setImgUrl] = useState([]);
    const [progress, setprogress] = useState({
        text: '',
        percent: 0
    });
    const [engine, setEngine] = useState(null);

    const recognitionRef = useRef(null);
    const imgUrlRef = useRef([]);
    const speakQueue = useRef([]);
    const isSpeaking = useRef(false);
    const bottomRef = useRef(null);

    // ---------------------------------------------
    // Speech Synthesis
    // ---------------------------------------------
    const processSpeakQueue = useCallback(async () => {
        if (isSpeaking.current || speakQueue.current.length === 0) return;
        isSpeaking.current = true;

        while (speakQueue.current.length) {
            const text = speakQueue.current.shift();
            await new Promise((resolve) => {
                const utterance = new SpeechSynthesisUtterance(text);
                utterance.voice = selectedVoice || null;
                utterance.lang = selectedVoice?.lang || language;
                utterance.onend = resolve;
                utterance.onerror = resolve;
                window.speechSynthesis.speak(utterance);
            });
        }

        isSpeaking.current = false;
    }, [selectedVoice, language]);


    useEffect(() => {
        const synth = window.speechSynthesis;
        const loadVoices = () => {
            const availableVoices = synth.getVoices();

            // Try preferred voice first
            let voice =
                preferredVoiceName
                    ? availableVoices.find((v) => v.name === preferredVoiceName)
                    : null;

            // Fallback 1: first voice with matching language
            if (!voice) {
                voice = availableVoices.find((v) => v.lang.startsWith(language));
            }

            // Fallback 2: fallback to a common US female voice if language is 'en-US'
            if (!voice && language === 'en-US') {
                voice = availableVoices.find((v) => v.name === 'Microsoft Ava Online (Natural) - English (United States)');
            }

            // Final fallback: just use the first available voice
            if (!voice && availableVoices.length > 0) {
                voice = availableVoices[0];
            }

            setVoices(availableVoices);
            setSelectedVoice(voice);
            console.log('Selected voice:', voice, 'Available voices:', availableVoices);
        };

        loadVoices();
        synth.onvoiceschanged = loadVoices;

        return () => {
            synth.onvoiceschanged = null;
        };
    }, [preferredVoiceName, language]);


    useEffect(() => {
        imgUrlRef.current = imgUrl;
    }, [imgUrl]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [conversation]);

   
    // ---------------------------------------------
    // Online Speech Recognition
    // ---------------------------------------------
    const startListening = useCallback(() => {
        if (status === 'listening') return;
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            alert('Speech Recognition not supported.');
            setError('Speech Recognition not supported.');
            return;
        }

        const recognition = new SpeechRecognition();
        recognitionRef.current = recognition;
        recognition.lang = language;
        recognition.continuous = false;
        recognition.interimResults = false;

        recognition.onstart = () => {
            setStatus('listening');
            setResponse('');
            setError(null);
        };

        recognition.onend = () => { if (status === 'listening') setStatus('idle'); };

        recognition.onerror = (e) => {
            console.error('Speech Recognition Error:', e);
            setStatus('idle');
            setError('Speech recognition error.');
        };

        recognition.onresult = async (event) => {
            const transcript = event.results[0][0].transcript;
            const updatedConversation = [...conversation, { role: 'user', content: transcript }];
            setStatus('loading');
            setError(null);

            try {
                const result = await GenerateAiDataGroq(updatedConversation, undefined, imgUrlRef.current);
                const reply = result?.text || 'Sorry, I didn’t understand that.';
                const summary = result?.json?.summary || reply;

                setConversation([...updatedConversation, { role: 'assistant', content: summary }]);
                speakQueue.current.push(summary);
                if (!isSpeaking.current) {
                    processSpeakQueue();
                }


                setResponse(reply);
                setStructuredResponse(summary);
            } catch (err) {
                console.error('AI Error:', err);
                setResponse('An error occurred. Please try again.');
                setError('AI error occurred.');
            } finally {
                setStatus('idle');
            }
        };

        recognition.start();
    }, [status, language, conversation, engine, processSpeakQueue]);

    const stopListening = useCallback(() => {
        recognitionRef.current?.stop();
        setStatus('idle');
    }, []);

    const stopVoice = useCallback(() => {
        window.speechSynthesis?.speaking && window.speechSynthesis.cancel();
        stopListening();
    }, [stopListening]);


    return (
        <VoiceAssistantContext.Provider
            value={{
                listening: status === 'listening',
                loading: status === 'loading',
                speaking: isSpeaking.current,
                error,
                response,
                structuredResponse,
                conversation,
                startListening,
                stopListening,
                stopVoice,
                bottomRef,
                scrollToBottom: () => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }),
                voices,
                selectedVoice,
                setSelectedVoice,
                imgUrl,
                setImgUrl,
                progress,
            }}
        >
            {children}
        </VoiceAssistantContext.Provider>
    );
};

// Hook to access the context
export const useVoiceAssistant = () => {
    const context = useContext(VoiceAssistantContext);
    if (!context) throw new Error('useVoiceAssistant must be used within a VoiceAssistantProvider');
    return context;
};