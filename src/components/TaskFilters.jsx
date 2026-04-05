import { motion } from 'framer-motion';

export default function TaskFilters({ 
    subjects, 
    filterSubj, 
    setFilterSubj, 
    filterPriority, 
    setFilterPriority, 
    priorities,
    onClear
}) {
    return (
        <motion.div 
            className="filter-panel" 
            initial={{ opacity: 0, height: 0 }} 
            animate={{ opacity: 1, height: 'auto' }} 
            exit={{ opacity: 0, height: 0 }}
        >
            <select 
                className="select" 
                style={{ maxWidth: 200 }} 
                value={filterSubj} 
                onChange={e => setFilterSubj(e.target.value)}
            >
                <option value="">All Subjects</option>
                {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>

            <select 
                className="select" 
                style={{ maxWidth: 180 }} 
                value={filterPriority} 
                onChange={e => setFilterPriority(e.target.value)}
            >
                <option value="">All Priorities</option>
                {priorities.map(p => <option key={p}>{p}</option>)}
            </select>

            <button 
                className="btn btn-secondary btn-sm" 
                onClick={onClear}
            >
                Clear
            </button>
        </motion.div>
    );
}
