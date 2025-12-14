interface TabsProps {
  activeTab: '1d' | '2d';
  onTabChange: (tab: '1d' | '2d') => void;
}

export function Tabs({ activeTab, onTabChange }: TabsProps) {
  return (
    <div className="tabs">
      <button
        className={`tab ${activeTab === '1d' ? 'active' : ''}`}
        onClick={() => onTabChange('1d')}
      >
        1 Variable (Temperature)
      </button>
      <button
        className={`tab ${activeTab === '2d' ? 'active' : ''}`}
        onClick={() => onTabChange('2d')}
      >
        2 Variables (Temperature + Unemployment)
      </button>
    </div>
  );
}
