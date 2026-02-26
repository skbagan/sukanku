import React from 'react';
import { useSports } from '../context/SportsContext';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Layout = ({ children, activeTab, setActiveTab }: LayoutProps) => {
  const { data, isAdmin, login, logout, loading } = useSports();
  const [showLoginModal, setShowLoginModal] = React.useState(false);
  const [password, setPassword] = React.useState('');

  const handleLogin = () => {
    if (login(password)) {
      setShowLoginModal(false);
      setPassword('');
      setActiveTab('admin');
    } else {
      alert('Kata laluan salah!');
    }
  };

  return (
    <div className="h-screen flex flex-col bg-slate-900 text-white font-sans overflow-hidden">
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700 flex-none z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center text-2xl shadow-lg transform rotate-3">
              🥇
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">
                {data.config.schoolName}
              </h1>
              <p className="text-slate-400 text-xs uppercase tracking-wider font-semibold">
                Sukan Tahunan {data.config.year}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${loading ? 'bg-slate-700 text-slate-300' : 'bg-slate-700 text-green-300'}`}>
              <span className={`w-2 h-2 rounded-full ${loading ? 'bg-slate-500 animate-pulse' : 'bg-green-500'}`}></span>
              {loading ? 'Loading...' : 'Online'}
            </div>
            {!isAdmin ? (
              <button
                onClick={() => setShowLoginModal(true)}
                className="bg-slate-700 hover:bg-slate-600 text-slate-200 px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2"
              >
                ⚙️ Admin
              </button>
            ) : (
              <button
                onClick={logout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2"
              >
                🚪 Logout
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-slate-800 border-b border-slate-700 flex-none overflow-x-auto">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-2 py-2 min-w-max">
            {[
              { id: 'scoreboard', label: '📊 Papan Markah' },
              { id: 'athletes', label: '🏃 Senarai Atlet' },
              { id: 'ranking', label: '🏅 Ranking' },
              { id: 'champions', label: '🏆 Olahragawan' },
              { id: 'hopes', label: '⭐ Harapan' },
              { id: 'schedule', label: '📅 Jadual' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  activeTab === tab.id
                    ? 'bg-white/10 text-white shadow-inner border-b-2 border-blue-400'
                    : 'text-slate-300 hover:bg-slate-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
            {isAdmin && (
              <button
                onClick={() => setActiveTab('admin')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition border border-blue-500/30 ${
                  activeTab === 'admin'
                    ? 'bg-white/10 text-blue-300 shadow-inner border-b-2 border-blue-400'
                    : 'text-blue-300 hover:bg-slate-700'
                }`}
              >
                ⚙️ Tetapan
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-slate-900 p-4 md:p-6 relative">
        <div className="max-w-7xl mx-auto h-full">
          {children}
        </div>
      </main>

      {/* Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 transition-opacity duration-300">
          <div className="bg-white rounded-2xl p-8 w-96 text-gray-800 shadow-2xl">
            <h2 className="text-2xl font-bold text-center mb-6">Admin Access</h2>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border rounded-xl mb-4 outline-none focus:border-blue-500"
              placeholder="Kata Laluan"
            />
            <div className="flex gap-2 mt-4">
              <button
                onClick={handleLogin}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold"
              >
                Masuk
              </button>
              <button
                onClick={() => setShowLoginModal(false)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-600 py-3 rounded-xl font-bold"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
