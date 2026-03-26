import { motion } from 'framer-motion';
import { MdCheck, MdDelete } from 'react-icons/md';
import { formatDate } from '../utils/helpers';
import './RevisionList.css';

export default function RevisionList({ revisions, subjects, onComplete, onDelete }) {
    if (!revisions.length) return (
        <div className="empty-state">
            <p>No upcoming revisions</p>
        </div>
    );

    return (
        <div className="revision-list">
            {revisions.map(r => {
                const subject = subjects.find(s => s.id === r.subjectId);
                return (
                    <motion.div
                        key={r.id}
                        className={`revision-item ${r.completed ? 'revision-done' : ''}`}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                    >
                        <div className="revision-dot" style={{ background: subject?.color || 'var(--accent-primary)' }} />
                        <div className="revision-info">
                            <p className="revision-topic">{r.topicName}</p>
                            <p className="revision-date">📅 {formatDate(r.revisionDate)}</p>
                        </div>
                        <div className="revision-actions">
                            {!r.completed && (
                                <button className="btn btn-icon btn-secondary btn-sm" title="Mark done" onClick={() => onComplete?.(r.id)}>
                                    <MdCheck size={14} />
                                </button>
                            )}
                            <button className="btn btn-icon btn-danger btn-sm" title="Delete" onClick={() => onDelete?.(r.id)}>
                                <MdDelete size={14} />
                            </button>
                        </div>
                    </motion.div>
                );
            })}
        </div>
    );
}
