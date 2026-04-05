export default function TaskTabs({ tabs, activeTab, onTabChange, getCount }) {
    return (
        <div className="tabs" style={{ flexWrap: 'wrap' }}>
            {tabs.map(tab => (
                <button 
                    key={tab} 
                    className={`tab ${activeTab === tab ? 'active' : ''}`} 
                    onClick={() => onTabChange(tab)}
                >
                    {tab} <span className="tab-count">{getCount(tab)}</span>
                </button>
            ))}
        </div>
    );
}
