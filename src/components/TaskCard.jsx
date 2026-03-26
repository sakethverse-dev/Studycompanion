import { motion } from 'framer-motion';
import { MdEdit, MdDelete } from 'react-icons/md';
import { formatDate, isOverdue, priorityColor, statusColor } from '../utils/helpers';
import './TaskCard.css';

export default function TaskCard({ task, subjectName, topicName, onEdit, onDelete, onStatusChange }) {
    const overdue = task.status !== 'Completed' && isOverdue(task.deadline);
    const pColor = priorityColor(task.priority);
    const sColor = statusColor(overdue ? 'Overdue' : task.status);

    return (
        <motion.div
            className={`task-card ${overdue ? 'task-overdue' : ''}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            whileHover={{ y: -2 }}
        >
            <div className="task-card-header">
                <div className="task-status-group">
                    <span className={`badge badge-${pColor}`}>{task.priority}</span>
                    <span className={`badge badge-${sColor}`}>{overdue ? 'Overdue' : task.status}</span>
                </div>
                <div className="task-actions">
                    <button className="btn btn-icon btn-secondary btn-sm" onClick={() => onEdit?.()} title="Edit"><MdEdit size={14} /></button>
                    <button className="btn btn-icon btn-danger btn-sm" onClick={() => onDelete?.()} title="Delete"><MdDelete size={14} /></button>
                </div>
            </div>

            <h4 className="task-title">{task.title}</h4>

            <div className="task-meta">
                {subjectName && <span className="task-meta-item">📚 {subjectName}</span>}
                {topicName && <span className="task-meta-item">📌 {topicName}</span>}
                {task.deadline && <span className={`task-meta-item ${overdue ? 'text-red' : ''}`}>📅 {formatDate(task.deadline)}</span>}
            </div>

            <div className="task-card-footer">
                <select
                    className="select task-status-select"
                    value={task.status}
                    onChange={e => onStatusChange?.(e.target.value)}
                    onClick={e => e.stopPropagation()}
                >
                    {['Pending', 'In Progress', 'Completed', 'Revision'].map(s => (
                        <option key={s} value={s}>{s}</option>
                    ))}
                </select>
            </div>
        </motion.div>
    );
}
