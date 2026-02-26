import React, { useState } from 'react';
import { SportsProvider, useSports } from './context/SportsContext';
import { Layout } from './components/Layout';
import { ScoreboardTab } from './components/tabs/ScoreboardTab';
import { AthletesTab } from './components/tabs/AthletesTab';
import { RankingTab } from './components/tabs/RankingTab';
import { ChampionsTab } from './components/tabs/ChampionsTab';
import { HopesTab } from './components/tabs/HopesTab';
import { ScheduleTab } from './components/tabs/ScheduleTab';
import { AdminTab } from './components/tabs/AdminTab';

function AppContent() {
  const [activeTab, setActiveTab] = useState('scoreboard');
  const { isAdmin } = useSports();

  // Redirect to scoreboard if admin logs out while on admin tab
  React.useEffect(() => {
    if (!isAdmin && activeTab === 'admin') {
      setActiveTab('scoreboard');
    }
  }, [isAdmin, activeTab]);

  const renderTab = () => {
    switch (activeTab) {
      case 'scoreboard': return <ScoreboardTab />;
      case 'athletes': return <AthletesTab />;
      case 'ranking': return <RankingTab />;
      case 'champions': return <ChampionsTab />;
      case 'hopes': return <HopesTab />;
      case 'schedule': return <ScheduleTab />;
      case 'admin': return <AdminTab />;
      default: return <ScoreboardTab />;
    }
  };

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      {renderTab()}
    </Layout>
  );
}

export default function App() {
  return (
    <SportsProvider>
      <AppContent />
    </SportsProvider>
  );
}
