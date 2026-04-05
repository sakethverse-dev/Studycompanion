import { motion } from 'framer-motion';

const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

export default function QuoteCard({ content, author, icon }) {
    return (
        <motion.div className="quote-card" variants={fadeUp}>
            <div className="quote-mark">{icon || '"'}</div>
            <p className="quote-text">{content}</p>
            {author && <span className="quote-author">— {author}</span>}
        </motion.div>
    );
}
