import React, { useContext } from 'react';
import { ThemeContext } from '../context/ThemeContext';

function Header() {
  const { isDark, toggleTheme } = useContext(ThemeContext);

  return (
    <header className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <span className="text-3xl">🌳</span>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">KulaGraph</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">Intelligent Family Tree Tracker</p>
            </div>
          </div>
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 transition"
            title="Toggle dark mode"
          >
            {isDark ? '☀️' : '🌙'}
          </button>
        </div>
      </div>
    </header>
  );
}

export default Header;
