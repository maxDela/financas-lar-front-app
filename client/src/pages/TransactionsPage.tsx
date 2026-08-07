import { useState, useEffect } from 'react';
import { fetchCategories, fetchTransactions, addTransaction, deleteTransaction, formatMoney, Category, Transaction } from '@/lib/financeService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Receipt, Plus, Trash2, Calendar, Filter } from 'lucide-react';
import { toast } from 'sonner';

export default function TransactionsPage() {
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [filterType, setFilterType] = useState<string>('all');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'expense' | 'revenue'>('expense');
  const [categoryId, setCategoryId] = useState<string>('');
  const [transactionDate, setTransactionDate] = useState(new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState('');

  async function loadData() {
    setLoading(true);
    const cats = await fetchCategories();
    const txs = await fetchTransactions(selectedMonth);
    setCategories(cats);
    setTransactions(txs);
    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, [selectedMonth]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!description || !amount || !categoryId || !transactionDate) {
      toast.error('Preencha todos os campos obrigatórios.');
      return;
    }

    try {
      await addTransaction({
        description,
        amount: parseFloat(amount.replace(',', '.')),
        type,
        category_id: parseInt(categoryId),
        transaction_date: transactionDate,
        notes
      });
      toast.success('Lançamento cadastrado com sucesso!');
      setDescription('');
      setAmount('');
      setNotes('');
      loadData();
    } catch (err) {
      toast.error('Erro ao salvar lançamento.');
    }
  }

  async function handleDelete(id: number) {
    if (confirm('Deseja realmente excluir este lançamento?')) {
      await deleteTransaction(id);
      toast.success('Lançamento excluído!');
      loadData();
    }
  }

  const filteredTransactions = transactions.filter(t => {
    if (filterType === 'all') return true;
    return t.type === filterType;
  });

  const filteredCategories = categories.filter(c => c.type === type);

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Lançamentos Financeiros</h1>
          <p className="text-slate-500 text-sm">Registre receitas e despesas para atualizar automaticamente os tetos de gastos.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-xl border border-slate-200">
            <Calendar className="w-4 h-4 text-slate-500 ml-1" />
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-transparent text-sm font-bold text-slate-800 focus:outline-none cursor-pointer"
            />
          </div>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-[140px] bg-white">
              <Filter className="w-3.5 h-3.5 mr-2 text-slate-500" />
              <SelectValue placeholder="Filtrar Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="expense">Despesas</SelectItem>
              <SelectItem value="revenue">Receitas</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Formulário Novo Lançamento */}
        <Card className="lg:col-span-4 shadow-sm border border-slate-100 h-fit">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Plus className="w-5 h-5 text-blue-600" />
              <span>Novo Lançamento</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-600">Tipo de Lançamento</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    type="button"
                    variant={type === 'expense' ? 'default' : 'outline'}
                    className={type === 'expense' ? 'bg-rose-600 hover:bg-rose-700 text-white' : ''}
                    onClick={() => { setType('expense'); setCategoryId(''); }}
                  >
                    Despesa
                  </Button>
                  <Button
                    type="button"
                    variant={type === 'revenue' ? 'default' : 'outline'}
                    className={type === 'revenue' ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : ''}
                    onClick={() => { setType('revenue'); setCategoryId(''); }}
                  >
                    Receita
                  </Button>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-600">Descrição</Label>
                <Input
                  placeholder="Ex: Supermercado, Salário, Gasolina..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-600">Valor (R$)</Label>
                <Input
                  placeholder="Ex: 250.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-600">Categoria</Label>
                <Select value={categoryId} onValueChange={setCategoryId}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecione a categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredCategories.map((c) => (
                      <SelectItem key={c.id} value={c.id.toString()}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-600">Data</Label>
                <Input
                  type="date"
                  value={transactionDate}
                  onChange={(e) => setTransactionDate(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-600">Observações (Opcional)</Label>
                <Input
                  placeholder="Detalhes adicionais..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                Salvar Lançamento
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Tabela de Lançamentos */}
        <Card className="lg:col-span-8 shadow-sm border border-slate-100">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Receipt className="w-5 h-5 text-blue-600" />
              <span>Lançamentos de {selectedMonth}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredTransactions.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-sm">
                Nenhum lançamento encontrado para este período com o filtro selecionado.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-slate-500 uppercase text-xs">
                    <tr>
                      <th className="py-3 px-4 rounded-l-lg">Data</th>
                      <th className="py-3 px-4">Descrição</th>
                      <th className="py-3 px-4">Categoria</th>
                      <th className="py-3 px-4 text-right">Valor</th>
                      <th className="py-3 px-4 text-center rounded-r-lg">Ação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredTransactions.map((t) => (
                      <tr key={t.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-3 px-4 text-slate-500 font-medium">{t.transaction_date}</td>
                        <td className="py-3 px-4">
                          <div className="font-semibold text-slate-800">{t.description}</div>
                          {t.notes && <div className="text-xs text-slate-400">{t.notes}</div>}
                        </td>
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: t.category?.color || '#3b82f6' }}></span>
                            {t.category?.name || 'Geral'}
                          </span>
                        </td>
                        <td className={`py-3 px-4 text-right font-bold ${t.type === 'expense' ? 'text-rose-600' : 'text-emerald-600'}`}>
                          {t.type === 'expense' ? '- ' : '+ '}{formatMoney(Number(t.amount))}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                            onClick={() => handleDelete(t.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
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
    </div>
  );
}
