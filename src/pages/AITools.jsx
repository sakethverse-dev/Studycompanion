import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MdSmartToy, MdCopyAll, MdCheck, MdAutoAwesome } from 'react-icons/md';
import { toast } from 'react-toastify';
import { generateAIContent } from '../services/aiService';
import { useStudy } from '../context/StudyContext';
import './AITools.css';

const TYPES = [
    { id: 'summary', label: '📝 Summary', desc: 'Get a concise summary of any topic' },
    { id: 'questions', label: '❓ Questions', desc: 'Generate practice exam questions' },
    { id: 'flashcards', label: '🃏 Flashcards', desc: 'Create study flashcards' },
];

export default function AITools() {
    const { topics, subjects } = useStudy();
    const [inputTopic, setInputTopic] = useState('');
    const [selectedType, setSelectedType] = useState('summary');
    const [output, setOutput] = useState('');
    const [loading, setLoading] = useState(false);
    const [copied, setCopied] = useState(false);
    const [history, setHistory] = useState([]);
    const outputRef = useRef(null);

    const handleGenerate = async () => {
        if (!inputTopic.trim()) { toast.error('Please enter a topic'); return; }
        setLoading(true);
        setOutput('');
        let result = '';
        try {
            await generateAIContent(inputTopic.trim(), selectedType, (chunk) => {
                result += chunk;
                setOutput(result);
                if (outputRef.current) outputRef.current.scrollTop = outputRef.current.scrollHeight;
            });
            setHistory(prev => [{ topic: inputTopic, type: selectedType, output: result, time: new Date() }, ...prev.slice(0, 4)]);
        } catch (err) {
            toast.error('AI generation failed. Check your API key.');
            setOutput('⚠️ Error generating content. Please check your API configuration.');
        } finally {
            setLoading(false);
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(output);
        setCopied(true);
        toast.success('Copied to clipboard!');
        setTimeout(() => setCopied(false), 2000);
    };

    const quickTopics = [...new Set(topics.map(t => t.name))].slice(0, 6);

    return (
        <div className="page-wrapper">
            <div className="page-header">
                <h1>🤖 AI Study Assistant</h1>
                <p>Generate summaries, practice questions, and flashcards instantly</p>
            </div>

            <div className="aitools-layout">
                {/* Main panel */}
                <div className="aitools-main">
                    {/* Type selector */}
                    <div className="type-selector card">
                        <p className="type-label">What do you want to generate?</p>
                        <div className="type-cards">
                            {TYPES.map(t => (
                                <button
                                    key={t.id}
                                    className={`type-card ${selectedType === t.id ? 'type-selected' : ''}`}
                                    onClick={() => setSelectedType(t.id)}
                                >
                                    <span className="type-title">{t.label}</span>
                                    <span className="type-desc">{t.desc}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Input */}
                    <div className="card ai-input-card">
                        <label className="ai-input-label">Enter Topic</label>
                        <div className="ai-input-row">
                            <input
                                className="input"
                                placeholder="e.g. Binary Search Trees, Dynamic Programming, Quicksort..."
                                value={inputTopic}
                                onChange={e => setInputTopic(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && !loading && handleGenerate()}
                            />
                            <motion.button
                                className="btn btn-primary ai-gen-btn"
                                onClick={handleGenerate}
                                disabled={loading}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: .98 }}
                            >
                                {loading ? (
                                    <><span className="spinner" /><span>Generating…</span></>
                                ) : (
                                    <><MdAutoAwesome /><span>Generate</span></>
                                )}
                            </motion.button>
                        </div>

                        {/* Quick topics */}
                        {quickTopics.length > 0 && (
                            <div className="quick-topics">
                                <span className="quick-label">Quick pick:</span>
                                {quickTopics.map(t => (
                                    <button key={t} className="quick-chip" onClick={() => setInputTopic(t)}>{t}</button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Output */}
                    <AnimatePresence>
                        {(output || loading) && (
                            <motion.div className="card ai-output-card" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                                <div className="output-header">
                                    <div className="output-title">
                                        <MdSmartToy className="output-icon" />
                                        <span>AI Response</span>
                                        {loading && <span className="badge badge-indigo">Generating…</span>}
                                    </div>
                                    {output && !loading && (
                                        <button className="btn btn-secondary btn-sm" onClick={handleCopy}>
                                            {copied ? <MdCheck /> : <MdCopyAll />}
                                            {copied ? 'Copied!' : 'Copy'}
                                        </button>
                                    )}
                                </div>
                                <div className="output-body" ref={outputRef}>
                                    {loading && !output && (
                                        <div className="skeleton-lines">
                                            {[100, 80, 90, 70, 60].map((w, i) => (
                                                <div key={i} className="skeleton skeleton-line" style={{ width: `${w}%` }} />
                                            ))}
                                        </div>
                                    )}
                                    {output && (
                                        <pre className="output-text">{output}{loading && <span className="cursor-blink">▍</span>}</pre>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Sidebar History */}
                <div className="aitools-sidebar">
                    <div className="card">
                        <h3 className="history-title">Recent Generations</h3>
                        {history.length === 0 ? (
                            <p className="history-empty">Your AI generations will appear here</p>
                        ) : (
                            <div className="history-list">
                                {history.map((h, i) => (
                                    <motion.div
                                        key={i}
                                        className="history-item"
                                        initial={{ opacity: 0, x: 10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        onClick={() => { setInputTopic(h.topic); setSelectedType(h.type); setOutput(h.output); }}
                                    >
                                        <span className="history-type">{TYPES.find(t => t.id === h.type)?.label}</span>
                                        <span className="history-topic">{h.topic}</span>
                                        <span className="history-time">{h.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="card ai-tip-card">
                        <h4>💡 Tips</h4>
                        <ul className="tips-list">
                            <li>Be specific: "Binary Trees in Java" works better than just "trees"</li>
                            <li>Use flashcards for memorization-heavy topics</li>
                            <li>Copy output and paste into your notes</li>
                            <li>Add <code>VITE_OPENAI_API_KEY</code> in <code>.env</code> for real AI</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
