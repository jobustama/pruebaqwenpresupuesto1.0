import React, { useState, useEffect } from 'react';
import { expensesService, Expense, CreateExpenseDto } from '../services/expenses.service';
import { categoriesService, Category } from '../services/categories.service';
import { Plus, Trash2, X, Check, AlertCircle, Filter, Calendar } from 'lucide-react';

const ExpensesPage: React.FC = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [filterData, setFilterData] = useState({ categoryId: '', startDate: '', endDate: '' });
  const [formData, setFormData] = useState<CreateExpenseDto>({
    description: '',
    amount: 0,
    date: new Date().toISOString().split('T')[0],
    categoryId: 0,
    homeId: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [expensesData, categoriesData] = await Promise.allSettled([
        expensesService.findAll(),
        categoriesService.findAll(),
      ]);

      if (expensesData.status === 'fulfilled') setExpenses(expensesData.value);
      if (categoriesData.status === 'fulfilled') setCategories(categoriesData.value);
    } catch (err: any) {
      setError('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await expensesService.create(formData);
      setShowModal(false);
      setFormData({
        description: '',
        amount: 0,
        date: new Date().toISOString().split('T')[0],
        categoryId: 0,
        homeId: '',
      });
      loadData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al crear el gasto');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este gasto?')) return;
    try {
      await expensesService.remove(id);
      loadData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al eliminar el gasto');
    }
  };

  const handleFilter = async () => {
    if (!filterData.categoryId || !filterData.startDate || !filterData.endDate) return;
    try {
      const data = await expensesService.findFiltered(filterData);
      setExpenses(data);
      setShowFilter(false);
    } catch (err: any) {
      setError('Error al filtrar los gastos');
    }
  };

  const resetFilter = async () => {
    setFilterData({ categoryId: '', startDate: '', endDate: '' });
    loadData();
    setShowFilter(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white">Gastos</h1>
          <p className="text-gray-400 mt-1">Administra tus gastos del hogar</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowFilter(!showFilter)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition border border-gray-700"
          >
            <Filter className="w-4 h-4" />
            <span className="hidden sm:inline">Filtrar</span>
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition"
          >
            <Plus className="w-5 h-5" />
            <span className="hidden sm:inline">Nuevo Gasto</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-lg flex items-center gap-2 text-red-200">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
        </div>
      )}

      {/* Filter Panel */}
      {showFilter && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Filter className="w-5 h-5 text-indigo-400" />
            Filtrar Gastos
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Categoría</label>
              <select
                value={filterData.categoryId}
                onChange={(e) => setFilterData({ ...filterData, categoryId: e.target.value })}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Seleccionar...</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Fecha Inicio</label>
              <input
                type="date"
                value={filterData.startDate}
                onChange={(e) => setFilterData({ ...filterData, startDate: e.target.value })}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Fecha Fin</label>
              <input
                type="date"
                value={filterData.endDate}
                onChange={(e) => setFilterData({ ...filterData, endDate: e.target.value })}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleFilter}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition text-sm"
            >
              Aplicar Filtro
            </button>
            <button
              onClick={resetFilter}
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition text-sm"
            >
              Limpiar
            </button>
          </div>
        </div>
      )}

      {/* Expenses Table */}
      {expenses.length > 0 ? (
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="text-left px-5 py-3 text-sm font-medium text-gray-400">Descripción</th>
                  <th className="text-left px-5 py-3 text-sm font-medium text-gray-400">Categoría</th>
                  <th className="text-left px-5 py-3 text-sm font-medium text-gray-400">Fecha</th>
                  <th className="text-right px-5 py-3 text-sm font-medium text-gray-400">Monto</th>
                  <th className="text-center px-5 py-3 text-sm font-medium text-gray-400">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((expense) => (
                  <tr key={expense.id} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition">
                    <td className="px-5 py-4">
                      <span className="text-sm font-medium text-white">{expense.description}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
                        style={{
                          backgroundColor: `${expense.category?.color || '#6366f1'}20`,
                          color: expense.category?.color || '#6366f1',
                        }}
                      >
                        {expense.category?.name || 'Sin categoría'}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-sm text-gray-400">
                        {new Date(expense.date).toLocaleDateString('es-ES')}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <span className="text-sm font-semibold text-white">
                        ${expense.amount?.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <button
                        onClick={() => handleDelete(expense.id)}
                        className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-900 border border-gray-800 rounded-xl">
          <Calendar className="w-12 h-12 mx-auto text-gray-600 mb-3" />
          <p className="text-gray-500 text-lg">No hay gastos registrados</p>
          <p className="text-gray-600 text-sm mt-1">Registra tu primer gasto para empezar</p>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Nuevo Gasto</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Descripción</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Ej: Compra del supermercado"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Monto ($)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.amount || ''}
                  onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                  className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="0.00"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Fecha</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Categoría</label>
                <select
                  value={formData.categoryId || ''}
                  onChange={(e) => setFormData({ ...formData, categoryId: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                >
                  <option value="">Seleccionar categoría...</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Home ID</label>
                <input
                  type="text"
                  value={formData.homeId}
                  onChange={(e) => setFormData({ ...formData, homeId: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="ID del hogar"
                  required
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2.5 bg-gray-800 text-gray-300 hover:text-white rounded-lg transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  Crear Gasto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpensesPage;
