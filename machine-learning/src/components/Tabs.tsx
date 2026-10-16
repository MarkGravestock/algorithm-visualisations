export type TabType = '1d' | '2d' | 'nn';

interface TabsProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

const TAB_LABELS: Record<TabType, string> = {
  '1d': '1 Variable (Temperature)',
  '2d': '2 Variables (Temperature + Unemployment)',
  nn: 'Neural Network (Heatwave)',
};

export function Tabs({ activeTab, onTabChange }: TabsProps) {
  return (
    <div className="tabs">
      {(Object.keys(TAB_LABELS) as TabType[]).map((tab) => (
        <button key={tab} className={`tab ${activeTab === tab ? 'active' : ''}`} onClick={() => onTabChange(tab)}>
          {TAB_LABELS[tab]}
        </button>
      ))}
    </div>
  );
}
