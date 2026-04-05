import SearchBar from './SearchBar';
import { MdFilterList } from 'react-icons/md';

export default function TaskToolbar({
    query,
    onQueryChange,
    showFilters,
    onToggleFilters,
    sortBy,
    onSortChange
}) {
    return (
        <div className="tasks-toolbar">
            <SearchBar
                value={query}
                onChange={onQueryChange}
                placeholder="Search tasks..."
            />
            <button
                className={`btn btn-secondary ${showFilters ? 'active-btn' : ''}`}
                onClick={onToggleFilters}
            >
                <MdFilterList /> Filters
            </button>
            <select
                className="select"
                style={{ maxWidth: 160 }}
                value={sortBy}
                onChange={e => onSortChange(e.target.value)}
            >
                <option value="deadline">Sort: Due Date</option>
                <option value="priority">Sort: Priority</option>
                <option value="subject">Sort: Subject</option>
            </select>
        </div>
    );
}
