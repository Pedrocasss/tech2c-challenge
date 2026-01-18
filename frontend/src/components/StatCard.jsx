export default function StatCard({ title, value, subtitle, color = "blue" }) {
  const colorClasses = {
    blue: "border-blue-500",
    green: "border-green-500",
    purple: "border-purple-500",
    orange: "border-orange-500",
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-all border-l-4 ${colorClasses[color]}`}>
      <div>
        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
          {title}
        </p>
        <p className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
          {value}
        </p>
        {subtitle && (
          <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">
            {subtitle}
          </div>
        )}
      </div>
    </div>
  );
}