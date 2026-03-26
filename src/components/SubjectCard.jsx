import { motion } from 'framer-motion';
import { MdEdit, MdDelete } from 'react-icons/md';
import './SubjectCard.css';

export default function SubjectCard({ subject, topicCount = 0, onEdit, onDelete, onClick }) {
    return (
        <motion.div
            className="subject-card"
            style={{ '--card-color': subject.color }}
            whileHover={{ y: -4, boxShadow: `0 8px 32px ${subject.color}33` }}
            transition={{ duration: .2 }}
            onClick={onClick}
        >
            <div className="subject-card-top">
                <div className="subject-color-bar" style={{ background: subject.color }} />
                <div className="subject-card-actions">
                    <button className="btn btn-icon btn-secondary" onClick={e => { e.stopPropagation(); onEdit?.(); }} title="Edit">
                        <MdEdit />
                    </button>
                    <button className="btn btn-icon btn-danger" onClick={e => { e.stopPropagation(); onDelete?.(); }} title="Delete">
                        <MdDelete />
                    </button>
                </div>
            </div>
            <div className="subject-card-body">
                <h3 className="subject-name">{subject.name}</h3>
                <p className="subject-desc">{subject.description || 'No description'}</p>
                <div className="subject-meta">
                    <span className="badge badge-indigo">{topicCount} topic{topicCount !== 1 ? 's' : ''}</span>
                </div>
            </div>
        </motion.div>
    );
}
