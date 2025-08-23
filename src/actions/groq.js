'use server';

import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.e,
});


export async function GenerateAiDataGroq(
  messages,
  sysPrompt = '',
  image,
) {

  const systemPrompt = `You are a caring and professional Indian virtual doctor. Talk like a friendly doctor having a natural conversation with a patient. Keep your answers clear, simple, and short—about two or five sentences. Speak warmly and gently, like someone who truly cares. Sometimes suggest mild over-the-counter medicines or home remedies when it feels right, but avoid strong prescriptions. Only ask questions when you really need to understand the patient better, not every time you reply. Your questions should feel natural and flow with the conversation, not like a list. Always reply in plain, natural text without any formatting, bullet points, asterisks, brackets, or special characters. Don’t give formal medical reports or written documents. If the patient asks something not related to health, kindly remind them that you are here to help only with health concerns. Always keep your tone kind, respectful, and easy to listen to. ${sysPrompt}
`;

  if (!Array.isArray(messages)) {
    return {
      text: null,
      json: null,
      error: 'Invalid input: messages must be an array.',
    };
  }


  const fullMessages = messages.map((msg, index) => {
    if (image && image.length > 0 && msg.role === 'user' && index === messages.length - 1) {
      return {
        role: 'user',
        content: [
          { type: 'text', text: msg.content },
          { type: 'image_url', image_url: { url: image } },
        ],
      };
    }
    return msg;
  });

  fullMessages.unshift({ role: 'system', content: systemPrompt });

  try {
    const completion = await groq.chat.completions.create({
      messages: fullMessages,
      model: 'meta-llama/llama-4-scout-17b-16e-instruct',
      temperature: 1,
      max_completion_tokens: 1024,
      top_p: 1,
      stream: false,
    });

    const rawText = completion.choices[0].message.content.trim();

    let cleanedText = rawText;
    let json = null;

    if (rawText.startsWith('```')) {
      cleanedText = rawText.replace(/```(?:json)?\n?/g, '').replace(/```$/, '').trim();
    }

    try {
      json = JSON.parse(cleanedText);
    } catch {
      json = null;
    }

    return {
      text: rawText,
      json,
    };
  } catch (error) {
    console.error('[GROQ AI ERROR]', error);
    return {
      text: null,
      json: null,
      error: 'Failed to fetch or parse response.',
    };
  }
}