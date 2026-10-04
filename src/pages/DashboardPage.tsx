import React, { useState, useEffect } from 'react';
import { expensesService, Expense } from '../services/expenses.service';
import { categoriesService, Category } from '../services/categories.service';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  PieChart,
  Calendar,
  AlertCircle,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPie,
  Pie,
  Cell,
} from 'recharts';

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4', '#f97316', '#ef4444'];

const DashboardPage: React.FC = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [totalGeneral, setTotalGeneral] = useState<number>(0);
  const [totalByCategory, setTotalByCategory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [expensesData, categoriesData, totalData, categoryTotals] = await Promise.allSettled([
        expensesService.findAll(),
        categoriesService.findAll(),
        expensesService.getTotal(),
        expensesService.getTotalByCategory(),
      ]);

      if (expensesData.status === 'fulfilled') setExpenses(expensesData.value);
      if (categoriesData.status === 'fulfilled') setCategories(categoriesData.value);
      if (totalData.status === 'fulfilled') setTotalGeneral(totalData.value?.total || 0);
      if (categoryTotals.status === 'fulfilled') setTotalByCategory(categoryTotals.value || []);
    } catch (err: any) {
      setError('Error al cargar los datos del dashboard');
    } finally {
      setLoading(false);
    }
  };

  const recentExpenses = expenses.slice(0, 5);

  const pieData = totalByCategory.map((item, index) => ({
    name: item.category?.name || item.categoryName || `Categoría ${item.categoryId}`,
    value: item.total || item._sum?.amount || 0,
    color: COLORS[index % COLORS.length],
  }));

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-white">Dashboard</h1>
        <p className="text-gray-400 mt-1">Resumen de tus gastos del hogar</p>
      </div>

      {error && (
        <div className="p-4 bg-yellow-500/20 border border-yellow-500/50 rounded-lg flex items-center gap-2 text-yellow-200">
          <AlertCircle className="w-5 h-5" />
          <span>{error} - Asegúrate de que la API esté corriendo en localhost:3000</span>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Gastado"
          value={`$${totalGeneral.toLocaleString('es-ES', { minimumFractionDigits: 2 })}`}
          icon={<DollarSign className="w-6 h-6" />}
          color="indigo"
        />
        <StatCard
          title="Gastos Registrados"
          value={expenses.length.toString()}
          icon={<TrendingUp className="w-6 h-6" />}
          color="green"
        />
        <StatCard
          title="Categorías"
          value={categories.length.toString()}
          icon={<PieChart className="w-6 h-6" />}
          color="purple"
        />
        <StatCard
          title="Promedio por Gasto"
          value={`$${expenses.length > 0 ? (totalGeneral / expenses.length).toFixed(2) : '0.00'}`}
          icon={<TrendingDown className="w-6 h-6" />}
          color="amber"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Gastos por Categoría</h3>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <RechartsPie>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#fff',
                  }}
                />
              </RechartsPie>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[250px] text-gray-500">
              No hay datos de categorías
            </div>
          )}
          <div className="mt-4 flex flex-wrap gap-2">
            {pieData.map((item, index) => (
              <span key={index} className="flex items-center gap-1 text-xs text-gray-400">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                {item.name}
              </span>
            ))}
          </div>
        </div>

        {/* Recent Expenses */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Gastos Recientes</h3>
          {recentExpenses.length > 0 ? (
            <div className="space-y-3">
              {recentExpenses.map((expense) => (
                <div
                  key={expense.id}
                  className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{
                        backgroundColor: expense.category?.color
                          ? `${expense.category.color}20`
                          : '#6366f120',
                      }}
                    >
                      <Receipt className="w-5 h-5" style={{ color: expense.category?.color || '#6366f1' }} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{expense.description}</p>
                      <p className="text-xs text-gray-400">
                        {expense.category?.name || 'Sin categoría'} •{' '}
                        {new Date(expense.date).toLocaleDateString('es-ES')}
                      </p>
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-white">
                    ${expense.amount?.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-[250px] text-gray-500">
              <Calendar className="w-12 h-12 mb-2 opacity-50" />
              <p>No hay gastos registrados</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Stat Card Component
interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  color: 'indigo' | 'green' | 'purple' | 'amber';
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color }) => {
  const colorClasses = {
    indigo: 'bg-indigo-500/20 text-indigo-400',
    green: 'bg-green-500/20 text-green-400',
    purple: 'bg-purple-500/20 text-purple-400',
    amber: 'bg-amber-500/20 text-amber-400',
  };

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-gray-700 transition">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-400">{title}</p>
          <p className="text-2xl font-bold text-white mt-1">{value}</p>
        </div>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colorClasses[color]}`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

const Receipt = ({ className, style }: { className?: string; style?: React.CSSProperties }) => (
  <svg className={className} style={style} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z" />
    <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8" />
    <path d="M12 17.5v-11" />
  </svg>
);

export default DashboardPage;
