import { useState, useEffect } from 'react';
import './index.css';
import StatCard from './components/StatCard';
import EmissionsChart from './components/EmissionsChart';
import TopCompaniesChart from './components/TopCompaniesChart';
import SectorChart from './components/SectorChart';
import FileUpload from './components/FileUpload';
import useDarkMode from './hooks/useDarkMode';
import DarkModeToggle from './components/DarkModeToggle';
function App() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDark, setIsDark] = useDarkMode();
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3000/api/data');
      if (!response.ok) {
        throw new Error('Erro ao carregar dados');
      }
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDataLoaded = (newData) => {
    setData(newData);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">A carregar dados...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-red-600 text-xl">❌ {error}</p>
          <button
            onClick={fetchData}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  const totalEmissions = data.totalEmissionsByYear.reduce(
    (sum, item) => sum + item.emissions,
    0
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Tech2C - Dashboard DGEG
              </h1>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                Análise de Emissões e Consumo Energético
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Dados de {data.rawDataCount} registos
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Anos: {data.years.join(', ')}
                </p>
              </div>
              <DarkModeToggle isDark={isDark} setIsDark={setIsDark} />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 transition-colors">
        {/* File Upload */}
        <FileUpload onDataLoaded={handleDataLoaded} />

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total de Emissões"
            value={totalEmissions.toLocaleString('pt-PT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            subtitle="toneladas de CO₂ (todos os anos)"
            color="blue"
            />
          <StatCard
            title="Consumo Médio"
            value={data.averageConsumption.overallAverage.toLocaleString('pt-PT', { maximumFractionDigits: 2 })}
            subtitle="MWh por empresa"
            color="green"
          />
          <StatCard
            title="Empresas Analisadas"
            value={data.averageConsumption.byCompany.length}
            subtitle={`${data.rawDataCount} registos totais`}
            color="purple"
          />
          <StatCard
            title="Setores"
            value={data.sectorAnalysis.length}
            subtitle="diferentes setores"
            color="orange"
          />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <EmissionsChart data={data.totalEmissionsByYear} />
          <TopCompaniesChart data={data.topCompanies} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <SectorChart data={data.sectorAnalysis} />
          
          {/* Sector Table */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 transition-colors">
            <h3 className="text-lg font-semibold mb-4 dark:text-white text-center">Análise por Setor</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-900">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                      Setor
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                      Emissões (ton)
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                      Empresas
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {data.sectorAnalysis.map((sector) => (
                    <tr key={sector.sector} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
                        {sector.sector}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300 text-right">
                        {sector.totalEmissions.toLocaleString('pt-PT')}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300 text-right">
                        {sector.companies}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-12 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>© 2026 Tech2C Challenge - Desenvolvido com React + Node.js</p>
        </footer>
      </main>
    </div>
  );
}

export default App;