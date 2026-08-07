import { useState, useEffect } from 'react';
import { fetchTransactions, fetchBudgets, formatMoney, Transaction } from '@/lib/financeService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowUpCircle, ArrowDownCircle, Wallet, TrendingUp, PieChart as PieIcon, Sliders, Calendar, ArrowRight } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Link } from 'wouter';

export default function Dashboard() {
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadData() {
    setLoading(true);
    const txs = await fetchTransactions(selectedMonth);
    const buds = await fetchBudgets(selectedMonth);
    setTransactions(txs);
    setBudgets(buds);
    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, [selectedMonth]);

  const totalRevenue = transactions
    .filter(t => t.type === 'revenue')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const netBalance = totalRevenue - totalExpense;
  const investmentPotential = netBalance > 0 ? netBalance : 0;

  // Dados para o Gráfico de Rosca
  const expenseByCategory = budgets.map(b => ({
    name: b.category_name,
    value: b.spent_amount,
    color: b.color || '#3b82f6'
  })).filter(item => item.value > 0);

  return (
    <div className="space-y-6 pb-12">
      {/* Cabeçalho e Seletor de Mês */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Dashboard Financeiro</h1>
          <p className="text-slate-500 text-sm">Visão geral do orçamento, limites de gastos e potencial de investimento do lar.</p>
        </div>
        <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-xl border border-slate-200">
          <Calendar className="w-4 h-4 text-slate-500 ml-1" />
          <span className="text-xs font-semibold text-slate-600">Mês:</span>
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="bg-transparent text-sm font-bold text-slate-800 focus:outline-none cursor-pointer"
          />
        </div>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-emerald-500 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Total de Receitas</span>
              <ArrowUpCircle className="w-5 h-5 text-emerald-500" />
            </div>
            <div className="text-2xl font-extrabold text-slate-900">{formatMoney(totalRevenue)}</div>
            <p className="text-xs text-emerald-600 font-medium mt-2 flex items-center gap-1">
              <span>Entradas do período</span>
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-rose-500 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Total de Despesas</span>
              <ArrowDownCircle className="w-5 h-5 text-rose-500" />
            </div>
            <div className="text-2xl font-extrabold text-slate-900">{formatMoney(totalExpense)}</div>
            <p className="text-xs text-rose-600 font-medium mt-2 flex items-center gap-1">
              <span>Gastos do período</span>
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-600 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Saldo Líquido</span>
              <Wallet className="w-5 h-5 text-blue-600" />
            </div>
            <div className={`text-2xl font-extrabold ${netBalance >= 0 ? 'text-blue-600' : 'text-rose-600'}`}>
              {formatMoney(netBalance)}
            </div>
            <p className="text-xs text-slate-500 font-medium mt-2">
              Receitas menos despesas
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-indigo-500 shadow-sm hover:shadow-md transition-shadow bg-gradient-to-br from-indigo-900 to-blue-900 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between text-indigo-200 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Potencial p/ Investir</span>
              <TrendingUp className="w-5 h-5 text-emerald-400" />
            </div>
            <div className="text-2xl font-extrabold text-emerald-400">{formatMoney(investmentPotential)}</div>
            <p className="text-xs text-indigo-200 font-medium mt-2">
              Disponível para aplicações
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico e Controle de Limites */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Gráfico de Rosca */}
        <Card className="lg:col-span-5 shadow-sm border border-slate-100 flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <PieIcon className="w-5 h-5 text-blue-600" />
              <span>Despesas por Categoria</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex items-center justify-center min-h-[300px]">
            {expenseByCategory.length === 0 ? (
              <div className="text-center text-slate-400 py-8">
                <p className="text-sm">Nenhuma despesa registrada neste mês.</p>
              </div>
            ) : (
              <div className="w-full h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={expenseByCategory}
                      cx="50%"
                      cy="50%"
                      innerRadius={65}
                      outerRadius={95}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {expenseByCategory.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(val: any) => formatMoney(Number(val))} />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Orçamentos e Deduções */}
        <Card className="lg:col-span-7 shadow-sm border border-slate-100">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Sliders className="w-5 h-5 text-blue-600" />
              <span>Controle de Limites (Tetos de Gastos)</span>
            </CardTitle>
            <Link href="/budgets">
              <Button variant="outline" size="sm" className="text-xs gap-1">
                <span>Gerenciar Limites</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {budgets.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <p className="text-sm mb-3">Nenhum orçamento definido para este mês.</p>
                <Link href="/budgets">
                  <Button size="sm">Definir Orçamentos Agora</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {budgets.map((b) => {
                  const percent = b.percent;
                  const isOver = b.remaining < 0;
                  const progressColor = percent > 90 ? 'bg-rose-500' : percent > 75 ? 'bg-amber-500' : 'bg-emerald-500';

                  return (
                    <div key={b.category_id} className="bg-slate-50/70 p-3.5 rounded-xl border border-slate-100">
                      <div className="flex justify-between items-center text-sm font-semibold mb-2">
                        <div className="flex items-center gap-2">
                          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: b.color }}></span>
                          <span className="text-slate-800">{b.category_name}</span>
                        </div>
                        <div className="text-right text-xs">
                          <span className="text-slate-500">Gasto: </span>
                          <span className="font-bold text-slate-900">{formatMoney(b.spent_amount)}</span>
                          <span className="text-slate-400 mx-1">/</span>
                          <span className="text-slate-500">Teto: </span>
                          <span className="font-bold text-slate-700">{formatMoney(b.max_amount)}</span>
                        </div>
                      </div>
                      <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-500 ${progressColor}`}
                          style={{ width: `${Math.min(percent, 100)}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between items-center text-xs mt-1.5">
                        <span className="text-slate-500 font-medium">{percent}% utilizado</span>
                        <span className={`font-semibold ${isOver ? 'text-rose-600' : 'text-emerald-600'}`}>
                          {isOver ? `Estourado em ${formatMoney(Math.abs(b.remaining))}` : `Restante: ${formatMoney(b.remaining)}`}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Lançamentos Recentes */}
      <Card className="shadow-sm border border-slate-100">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <CardTitle className="text-base font-bold">Lançamentos Recentes do Período</CardTitle>
          <Link href="/transactions">
            <Button variant="outline" size="sm" className="text-xs">Ver Todos</Button>
          </Link>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-sm">Nenhum lançamento encontrado neste mês.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-500 uppercase text-xs">
                  <tr>
                    <th className="py-3 px-4 rounded-l-lg">Data</th>
                    <th className="py-3 px-4">Descrição</th>
                    <th className="py-3 px-4">Categoria</th>
                    <th className="py-3 px-4">Tipo</th>
                    <th className="py-3 px-4 text-right rounded-r-lg">Valor</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {transactions.slice(0, 5).map((t) => (
                    <tr key={t.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3 px-4 text-slate-500 font-medium">{t.transaction_date}</td>
                      <td className="py-3 px-4 font-semibold text-slate-800">{t.description}</td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: t.category?.color || '#3b82f6' }}></span>
                          {t.category?.name || 'Geral'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {t.type === 'expense' ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-rose-50 text-rose-700">Despesa</span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-emerald-50 text-emerald-700">Receita</span>
                        )}
                      </td>
                      <td className={`py-3 px-4 text-right font-bold ${t.type === 'expense' ? 'text-rose-600' : 'text-emerald-600'}`}>
                        {t.type === 'expense' ? '- ' : '+ '}{formatMoney(Number(t.amount))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
