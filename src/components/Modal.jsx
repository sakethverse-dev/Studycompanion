import { motion, AnimatePresence } from 'framer-motion';
import { MdClose } from 'react-icons/md';

export default function Modal({ show, onClose, title, children, footer }) {
    return (
        <AnimatePresence>
            {show && (
                <motion.div 
                    className="modal-overlay" 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    exit={{ opacity: 0 }} 
                    onClick={onClose}
                >
                    <motion.div 
                        className="modal" 
                        initial={{ scale: .9, opacity: 0 }} 
                        animate={{ scale: 1, opacity: 1 }} 
                        exit={{ scale: .9, opacity: 0 }} 
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="modal-header">
                            <h2>{title}</h2>
                            <button 
                                className="btn btn-icon btn-secondary" 
                                onClick={onClose}
                            >
                                <MdClose />
                            </button>
                        </div>
                        
                        <div className="modal-body">
                            {children}
                        </div>

                        {footer && (
                            <div className="modal-footer">
                                {footer}
                            </div>
                        )}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
