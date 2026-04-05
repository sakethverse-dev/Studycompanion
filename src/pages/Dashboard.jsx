import { motion } from 'framer-motion';
import { MdCheckCircle, MdPending, MdRefresh, MdWarning, MdAutoGraph } from 'react-icons/md';
import StatCard from '../components/StatCard';
import { SubjectProgressChart, WeeklyChart } from '../components/ProgressChart';
import RevisionList from '../components/RevisionList';
import PageHeader from '../components/PageHeader';
import QuoteCard from '../components/QuoteCard';
import { useProgress } from '../hooks/useProgress';
import { useStudy } from '../context/StudyContext';
import { useEffect, useState } from 'react';
import './Dashboard.css';

const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };
const container = { hidden: {}, show: { transition: { staggerChildren: .08 } } };

export default function Dashboard() {
    const { total, completed, pending, revision, overdue, pct, subjectStats, weekly } = useProgress();
    const { revisions, subjects, updateRevision, deleteRevision } = useStudy();
    const [quote, setQuote] = useState({ 
        content: 'The capacity to learn is a gift; the ability to learn is a skill; the willingness to learn is a choice.', 
        author: 'Brian Herbert' 
    });

    useEffect(() => {
        fetch('https://api.quotable.io/random?tags=education,inspirational')
            .then(r => r.json())
            .then(d => { if (d.content) setQuote({ content: d.content, author: d.author }); })
            .catch(() => { });
    }, []);

    const upcoming = revisions.filter(r => !r.completed).slice(0, 5);

    return (
        <motion.div className="page-wrapper" variants={container} initial="hidden" animate="show">
            <PageHeader 
                title="Dashboard" 
                subtitle="Track your study progress and stay on top of your goals"
                icon="📊"
            />

            <QuoteCard content={quote.content} author={quote.author} />

            {/* Stats */}
            <motion.div className="grid-4 dashboard-stats" variants={fadeUp}>
                <StatCard icon={<MdAutoGraph />} label="Total Tasks" value={total} color="indigo" />
                <StatCard icon={<MdCheckCircle />} label="Completed" value={completed} color="green" />
                <StatCard icon={<MdPending />} label="Pending" value={pending} color="yellow" />
                <StatCard icon={<MdRefresh />} label="Needs Revision" value={revision} color="cyan" />
            </motion.div>

            {/* Overall Progress */}
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

            {/* Charts Row */}
            <motion.div className="grid-2 dashboard-charts" variants={fadeUp}>
                <ChartSection title="Subject Progress">
                    <SubjectProgressChart data={subjectStats} />
                </ChartSection>
                <ChartSection title="Weekly Productivity">
                    <WeeklyChart data={weekly} />
                </ChartSection>
            </motion.div>

            {/* BreakdownRow */}
            <motion.div className="grid-2" variants={fadeUp}>
                <SubjectBreakdown subjects={subjectStats} />
                <UpcomingRevisions 
                    revisions={upcoming} 
                    subjects={subjects} 
                    onUpdate={updateRevision} 
                    onDelete={deleteRevision} 
                />
            </motion.div>
        </motion.div>
    );
}

// Sub-components for better readability
function ChartSection({ title, children }) {
    return (
        <div className="card">
            <h3 className="chart-title">{title}</h3>
            {children}
        </div>
    );
}

function SubjectBreakdown({ subjects }) {
    return (
        <div className="card">
            <h3 className="chart-title" style={{ marginBottom: 16 }}>Subject Breakdown</h3>
            <div className="subject-bars">
                {subjects.map(s => (
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
    );
}

function UpcomingRevisions({ revisions, subjects, onUpdate, onDelete }) {
    return (
        <div className="card">
            <h3 className="chart-title" style={{ marginBottom: 16 }}>Upcoming Revisions</h3>
            <RevisionList
                revisions={revisions}
                subjects={subjects}
                onComplete={id => onUpdate(id, { completed: true })}
                onDelete={id => onDelete(id)}
            />
        </div>
    );
}

