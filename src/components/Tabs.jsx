import clsx from 'clsx';

export default function Tabs({ activeTab, onTabChange, tabs }) {
  return (
    <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={clsx(
            'px-6 py-4 font-semibold text-sm transition-colors border-b-2 -mb-px',
            activeTab === tab.id
              ? 'text-primary-blue dark:text-blue-400 border-primary-blue dark:border-blue-400'
              : 'text-gray-600 dark:text-gray-400 border-transparent hover:text-gray-800 dark:hover:text-gray-200'
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
