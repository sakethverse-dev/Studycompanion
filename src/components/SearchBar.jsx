import { MdSearch, MdClose } from 'react-icons/md';
import './SearchBar.css';

export default function SearchBar({ value, onChange, placeholder = 'Search...' }) {
    return (
        <div className="search-bar">
            <MdSearch className="search-icon" />
            <input
                className="search-input"
                type="text"
                placeholder={placeholder}
                value={value}
                onChange={e => onChange(e.target.value)}
            />
            {value && (
                <button className="search-clear" onClick={() => onChange('')}>
                    <MdClose />
                </button>
            )}
        </div>
    );
}
