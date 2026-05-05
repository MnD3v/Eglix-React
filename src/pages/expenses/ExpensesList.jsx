import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useChurch } from '../../context/ChurchContext';
import { expenseService } from '../../services/expenseService';

export default function ExpensesList() {
    const { currentChurch } = useChurch();
    const navigate = useNavigate();
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [totalAmount, setTotalAmount] = useState(0);
    const [filters, setFilters] = useState({ startDate: '', endDate: '', search: '' });
    const [deleteId, setDeleteId] = useState(null);
    const [monthlyChart, setMonthlyChart] = useState({ labels: [], data: [] });

    const fetchExpenses = async () => {
        if (!currentChurch) return;
        setLoading(true);
        try {
            const { data } = await expenseService.getAll(currentChurch.id, filters);
            setExpenses(data || []);
            const total = await expenseService.getTotalAmount(currentChurch.id, filters);
            setTotalAmount(total);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (currentChurch) expenseService.getMonthlyChart(currentChurch.id).then(setMonthlyChart);
    }, [currentChurch]);

    useEffect(() => { fetchExpenses(); }, [currentChurch, filters]);

    const handleDelete = async (id) => {
        if (!window.confirm('Supprimer cette dépense ?')) return;
        try {
            await expenseService.delete(id);
            fetchExpenses();
        } catch (err) {
            console.error(err);
        }
    };

    const formatAmount = (amount) =>
        new Intl.NumberFormat('fr-FR').format(Math.round(amount || 0)) + ' FCFA';

    const formatDate = (dateStr) => {
        if (!dateStr) return '—';
        return new Date(dateStr).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };

    return (
        <div className="space-y-6 pb-12">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Dépenses</h1>
                    <p className="text-gray-500 mt-1">Gérez les dépenses de votre église</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="text-right">
                        <div className="text-lg font-bold text-gray-900">{formatAmount(totalAmount)}</div>
                        <div className="text-xs text-gray-500">Total des dépenses</div>
                    </div>
                    <Link
                        to="/expenses/new"
                        className="flex items-center gap-2 bg-primary text-black px-4 py-2.5 rounded-xl font-medium hover:bg-primary-dark shadow-sm transition-all"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        <span className="hidden sm:inline">Nouvelle dépense</span>
                        <span className="sm:hidden">Nouveau</span>
                    </Link>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
                <div className="flex flex-wrap gap-3 items-end">
                    <div className="flex-1 min-w-[160px]">
                        <label className="block text-xs font-medium text-gray-500 mb-1">Du</label>
                        <input
                            type="date"
                            value={filters.startDate}
                            onChange={e => setFilters(f => ({ ...f, startDate: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        />
                    </div>
                    <div className="flex-1 min-w-[160px]">
                        <label className="block text-xs font-medium text-gray-500 mb-1">Au</label>
                        <input
                            type="date"
                            value={filters.endDate}
                            onChange={e => setFilters(f => ({ ...f, endDate: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        />
                    </div>
                    <div className="flex-1 min-w-[200px]">
                        <label className="block text-xs font-medium text-gray-500 mb-1">Recherche</label>
                        <input
                            type="text"
                            placeholder="Description..."
                            value={filters.search}
                            onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        />
                    </div>
                    {(filters.startDate || filters.endDate || filters.search) && (
                        <button
                            onClick={() => setFilters({ startDate: '', endDate: '', search: '' })}
                            className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                        >
                            Réinitialiser
                        </button>
                    )}
                </div>
            </div>

            {/* List */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center py-16">
                        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : expenses.length === 0 ? (
                    <div className="text-center py-16 px-6">
                        <div className="w-16 h-16 bg-orange-50 rounded-xl flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">Aucune dépense</h3>
                        <p className="text-gray-500 text-sm mb-4">Commencez par enregistrer votre première dépense.</p>
                        <Link to="/expenses/new" className="inline-flex items-center gap-2 bg-primary text-black px-5 py-2.5 rounded-xl font-medium hover:bg-primary-dark transition-all shadow-sm">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Nouvelle dépense
                        </Link>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-50">
                        {expenses.map((expense) => (
                            <div key={expense.id} className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50/80 transition-colors">
                                {/* Date badge */}
                                <div className="flex-shrink-0">
                                    <span className="inline-flex items-center px-2.5 py-1 rounded-xl bg-orange-50 text-orange-700 text-xs font-medium">
                                        {formatDate(expense.paid_at)}
                                    </span>
                                </div>
                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-gray-900 truncate">
                                        {expense.projects?.name || 'Dépense générale'}
                                    </p>
                                    <p className="text-sm text-gray-500 truncate mt-0.5">
                                        {expense.description || 'Aucune description'}
                                    </p>
                                </div>
                                {/* Amount */}
                                <div className="flex-shrink-0 text-right">
                                    <p className="font-bold text-gray-900">{formatAmount(expense.amount)}</p>
                                </div>
                                {/* Actions */}
                                <div className="flex items-center gap-2 flex-shrink-0">
                                    <button
                                        onClick={() => navigate(`/expenses/${expense.id}/edit`)}
                                        className="p-2 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-xl transition-all"
                                        title="Modifier"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                        </svg>
                                    </button>
                                    <button
                                        onClick={() => handleDelete(expense.id)}
                                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                        title="Supprimer"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
