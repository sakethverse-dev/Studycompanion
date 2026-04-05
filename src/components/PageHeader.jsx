import { motion } from 'framer-motion';

const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

export default function PageHeader({ title, subtitle, icon, actions }) {
    return (
        <motion.div className="page-header" variants={fadeUp}>
            <div className="header-main">
                <h1>{icon && <span style={{ marginRight: 12 }}>{icon}</span>}{title}</h1>
                {subtitle && <p>{subtitle}</p>}
            </div>
            {actions && <div className="header-actions">{actions}</div>}
        </motion.div>
    );
}
