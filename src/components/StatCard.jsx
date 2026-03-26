import { motion } from 'framer-motion';
import './StatCard.css';

export default function StatCard({ icon, label, value, color = 'indigo', subtitle }) {
    return (
        <motion.div
            className={`stat-card stat-${color}`}
            whileHover={{ y: -4 }}
            transition={{ duration: .2 }}
        >
            <div className="stat-icon">{icon}</div>
            <div className="stat-body">
                <div className="stat-value">{value}</div>
                <div className="stat-label">{label}</div>
                {subtitle && <div className="stat-sub">{subtitle}</div>}
            </div>
        </motion.div>
    );
}
