import { motion } from 'framer-motion';
import { MdCheckCircle, MdPending, MdRefresh, MdWarning, MdAutoGraph } from 'react-icons/md';
import StatCard from '../components/StatCard';
import { SubjectProgressChart, WeeklyChart } from '../components/ProgressChart';
import RevisionList from '../components/RevisionList';
import { useProgress } from '../hooks/useProgress';
import { useStudy } from '../context/StudyContext';
import { useEffect, useState } from 'react';
import './Dashboard.css';

const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };
const container = { hidden: {}, show: { transition: { staggerChildren: .08 } } };

export default function Dashboard() {
    const { total, completed, pending, revision, overdue, pct, subjectStats, weekly } = useProgress();
    const { revisions, subjects, updateRevision, deleteRevision } = useStudy();
    const [quote, setQuote] = useState({ content: 'The capacity to learn is a gift; the ability to learn is a skill; the willingness to learn is a choice.', author: 'Brian Herbert' });

    useEffect(() => {
        fetch('https://api.quotable.io/random?tags=education,inspirational')
            .then(r => r.json())
            .then(d => { if (d.content) setQuote({ content: d.content, author: d.author }); })
            .catch(() => { });
    }, []);

    const upcoming = revisions.filter(r => !r.completed).slice(0, 5);

    return (
        <motion.div className="page-wrapper" variants={container} initial="hidden" animate="show">
            {/* Header */}
            <motion.div className="page-header" variants={fadeUp}>
                <h1>📊 Dashboard</h1>
                <p>Track your study progress and stay on top of your goals</p>
            </motion.div>

            {/* Quote */}
            <motion.div className="quote-card" variants={fadeUp}>
                <div className="quote-mark">"</div>
                <p className="quote-text">{quote.content}</p>
                <span className="quote-author">— {quote.author}</span>
            </motion.div>

            {/* Stats */}
            <motion.div className="grid-4 dashboard-stats" variants={fadeUp}>
                <StatCard icon={<MdAutoGraph />} label="Total Tasks" value={total} color="indigo" />
                <StatCard icon={<MdCheckCircle />} label="Completed" value={completed} color="green" />
                <StatCard icon={<MdPending />} label="Pending" value={pending} color="yellow" />
                <StatCard icon={<MdRefresh />} label="Needs Revision" value={revision} color="cyan" />
            </motion.div>

            {/* Progress */}
            <motion.div className="dashboard-progress-row" variants={fadeUp}>
                <div className="overall-progress card">
                    <div className="progress-header">
                        <span>Overall Completion</span>
                        <span className="progress-pct">{pct}%</span>
                    </div>
                    <div className="progress-bar" style={{ marginTop: 10 }}>
                        <motion.div
                            className="progress-fill"
                            style={{ background: 'var(--accent-primary)' }}
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ duration: 1, ease: 'easeOut' }}
                        />
                    </div>
                    {overdue > 0 && (
                        <p className="overdue-warn"><MdWarning /> {overdue} task{overdue > 1 ? 's' : ''} overdue</p>
                    )}
                </div>
            </motion.div>

            {/* Charts row */}
            <motion.div className="grid-2 dashboard-charts" variants={fadeUp}>
                <div className="card">
                    <h3 className="chart-title">Subject Progress</h3>
                    <SubjectProgressChart data={subjectStats} />
                </div>
                <div className="card">
                    <h3 className="chart-title">Weekly Productivity</h3>
                    <WeeklyChart data={weekly} />
                </div>
            </motion.div>

            {/* Subject bars + Revisions */}
            <motion.div className="grid-2" variants={fadeUp}>
                <div className="card">
                    <h3 className="chart-title" style={{ marginBottom: 16 }}>Subject Breakdown</h3>
                    <div className="subject-bars">
                        {subjectStats.map(s => (
                            <div key={s.id} className="subject-bar-row">
                                <div className="subject-bar-label">
                                    <span className="color-dot" style={{ background: s.color }} />
                                    <span>{s.name}</span>
                                </div>
                                <div className="progress-bar" style={{ flex: 1 }}>
                                    <motion.div
                                        className="progress-fill"
                                        style={{ background: s.color }}
                                        initial={{ width: 0 }}
                                        animate={{ width: `${s.pct}%` }}
                                        transition={{ duration: .8, ease: 'easeOut' }}
                                    />
                                </div>
                                <span className="bar-pct">{s.pct}%</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="card">
                    <h3 className="chart-title" style={{ marginBottom: 16 }}>Upcoming Revisions</h3>
                    <RevisionList
                        revisions={upcoming}
                        subjects={subjects}
                        onComplete={id => updateRevision(id, { completed: true })}
                        onDelete={id => deleteRevision(id)}
                    />
                </div>
            </motion.div>
        </motion.div>
    );
}
