import axios from 'axios';

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';
const API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

const PROMPTS = {
    summary: (topic) =>
        `You are a concise study helper. Provide a clear, well-structured summary of "${topic}" suitable for a student. Use bullet points where helpful. Keep it under 300 words.`,
    questions: (topic) =>
        `Generate 5 important practice questions about "${topic}" for a student preparing for exams. Include a mix of conceptual and problem-solving questions. Number them 1-5.`,
    flashcards: (topic) =>
        `Create 5 flashcards for "${topic}". Format each as:\nQ: [Question]\nA: [Answer]\n\nMake them concise and exam-ready.`,
};

export async function generateAIContent(topic, type, onChunk) {
    if (!API_KEY) {
        // Demo mode — simulate streaming
        const demoText = getDemoContent(topic, type);
        for (let i = 0; i < demoText.length; i++) {
            await new Promise(r => setTimeout(r, 12));
            onChunk(demoText[i]);
        }
        return;
    }

    const response = await axios.post(
        OPENAI_API_URL,
        {
            model: 'gpt-3.5-turbo',
            messages: [{ role: 'user', content: PROMPTS[type](topic) }],
            stream: true,
            max_tokens: 600,
        },
        {
            headers: {
                Authorization: `Bearer ${API_KEY}`,
                'Content-Type': 'application/json',
            },
            responseType: 'stream',
        }
    );

    const reader = response.data;
    reader.on('data', (chunk) => {
        const lines = chunk.toString().split('\n').filter(l => l.startsWith('data: ') && l !== 'data: [DONE]');
        for (const line of lines) {
            try {
                const json = JSON.parse(line.slice(6));
                const delta = json.choices?.[0]?.delta?.content;
                if (delta) onChunk(delta);
            } catch { }
        }
    });
}

function getDemoContent(topic, type) {
    const t = topic || 'this topic';
    if (type === 'summary') return `## Summary: ${t}\n\n• ${t} is a fundamental concept in computer science and mathematics.\n\n• Key areas include core theory, practical applications, and related algorithms.\n\n• Understanding ${t} requires a solid grasp of prerequisites such as basic data structures and algorithmic thinking.\n\n• Common interview questions focus on time/space complexity and edge cases.\n\n• Best studied through practice problems, visual diagrams, and implementation exercises.\n\n> 💡 Tip: Add your OpenAI API key in \`.env\` as \`VITE_OPENAI_API_KEY\` for real AI responses.`;
    if (type === 'questions') return `Practice Questions: ${t}\n\n1. What is the fundamental principle behind ${t} and how does it differ from similar concepts?\n\n2. What is the time complexity of the most common operations in ${t}? Why?\n\n3. Can you walk through a real-world example where ${t} is applied effectively?\n\n4. What are the common pitfalls or edge cases when implementing ${t}?\n\n5. Compare ${t} with an alternative approach. When would you choose one over the other?\n\n> 💡 Add your OpenAI API key for real, personalized questions.`;
    return `Flashcards: ${t}\n\nQ: What is ${t}?\nA: A fundamental concept involving structured data and algorithmic operations used to solve specific problem categories.\n\nQ: What is the typical time complexity?\nA: Depends on the operation — most are O(log n) to O(n), with some O(n²) in worst cases.\n\nQ: Name a real-world use case.\nA: Used in databases, search engines, compilers, and networking systems.\n\nQ: What is a common mistake when working with ${t}?\nA: Ignoring edge cases such as empty inputs, single-element structures, or circular references.\n\nQ: How do you optimize ${t}?\nA: By choosing the right data structure, caching intermediate results, and analyzing bottlenecks.\n\n> 💡 Add your OpenAI API key for real flashcards.`;
}
