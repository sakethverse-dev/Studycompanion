import { NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    MdDashboard, MdMenuBook, MdAssignment, MdEventNote,
    MdSmartToy, MdMenu, MdClose
} from 'react-icons/md';
import { useState } from 'react';
import './Sidebar.css';

const links = [
    { to: '/dashboard', icon: <MdDashboard />, label: 'Dashboard' },
    { to: '/subjects', icon: <MdMenuBook />, label: 'Subjects' },
    { to: '/tasks', icon: <MdAssignment />, label: 'Tasks' },
    { to: '/revision', icon: <MdEventNote />, label: 'Revision' },
    { to: '/ai-tools', icon: <MdSmartToy />, label: 'AI Tools' },
];

export default function Sidebar() {
    const [open, setOpen] = useState(true);

    return (
        <>
            {/* Mobile toggle */}
            <button className="sidebar-toggle" onClick={() => setOpen(p => !p)}>
                {open ? <MdClose /> : <MdMenu />}
            </button>

            <motion.aside
                className={`sidebar ${open ? 'sidebar-open' : 'sidebar-closed'}`}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: .35 }}
            >
                {/* Brand */}
                <div className="sidebar-brand">
                    <div className="brand-icon">📚</div>
                    <div className="brand-text">
                        <span className="brand-name">StudyAI</span>
                        <span className="brand-tag">Companion</span>
                    </div>
                </div>

                <div className="sidebar-section-label">Navigation</div>

                <nav className="sidebar-nav">
                    {links.map(l => (
                        <NavLink
                            key={l.to}
                            to={l.to}
                            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                        >
                            <span className="link-icon">{l.icon}</span>
                            <span className="link-label">{l.label}</span>
                        </NavLink>
                    ))}
                </nav>

                <div className="sidebar-footer">
                    <div className="sidebar-footer-card">
                        <div className="footer-icon">✨</div>
                        <div>
                            <p className="footer-title">AI Powered</p>
                            <p className="footer-sub">Study smarter, not harder</p>
                        </div>
                    </div>
                </div>
            </motion.aside>
        </>
    );
}
