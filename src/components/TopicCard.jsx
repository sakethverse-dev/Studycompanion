import { motion } from 'framer-motion';
import { MdEdit, MdDelete } from 'react-icons/md';
import { difficultyColor, statusColor } from '../utils/helpers';
import './TopicCard.css';

export default function TopicCard({ topic, onEdit, onDelete }) {
    return (
        <motion.div
            className="topic-card"
            initial={{ opacity: 0, scale: .96 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ y: -2 }}
        >
            <div className="topic-card-header">
                <div className="topic-badges">
                    <span className={`badge badge-${difficultyColor(topic.difficulty)}`}>{topic.difficulty}</span>
                    <span className={`badge badge-${statusColor(topic.status)}`}>{topic.status}</span>
                </div>
                <div className="topic-actions">
                    <button className="btn btn-icon btn-secondary btn-sm" onClick={() => onEdit?.()} title="Edit"><MdEdit size={13} /></button>
                    <button className="btn btn-icon btn-danger btn-sm" onClick={() => onDelete?.()} title="Delete"><MdDelete size={13} /></button>
                </div>
            </div>
            <h4 className="topic-name">{topic.name}</h4>
            {topic.notes && <p className="topic-notes">{topic.notes}</p>}
        </motion.div>
    );
}
