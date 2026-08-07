import { useState, useEffect } from 'react';
import { fetchCategories, fetchBudgets, saveBudget, formatMoney, Category } from '@/lib/financeService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sliders, CheckCircle2, Calendar } from 'lucide-react';
import { toast } from 'sonner';

export default function BudgetsPage() {
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [expenseCategories, setExpenseCategories] = useState<Category[]>([]);
  const [budgets, setBudgets] = useState<any[]>([]);

  // Form State
  const [categoryId, setCategoryId] = useState('');
  const [maxAmount, setMaxAmount] = useState('');

  async function loadData() {
    const cats = await fetchCategories();
    setExpenseCategories(cats.filter(c => c.type === 'expense'));
    const buds = await fetchBudgets(selectedMonth);
    setBudgets(buds);
  }

  useEffect(() => {
    loadData();
  }, [selectedMonth]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!categoryId || !maxAmount) {
      toast.error('Preencha todos os campos.');
      return;
    }

    try {
      await saveBudget(parseInt(categoryId), selectedMonth, parseFloat(maxAmount.replace(',', '.')));
      toast.success('Orçamento salvo com sucesso!');
      setCategoryId('');
      setMaxAmount('');
      loadData();
    } catch (err) {
      toast.error('Erro ao salvar orçamento.');
    }
  }

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Orçamentos & Limites de Gastos</h1>
          <p className="text-slate-500 text-sm">Defina o teto máximo que você pode gastar em cada categoria para o mês.</p>
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

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Formulário */}
        <Card className="lg:col-span-4 shadow-sm border border-slate-100 h-fit">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Sliders className="w-5 h-5 text-blue-600" />
              <span>Definir Limite de Gasto</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-600">Mês de Referência</Label>
                <Input
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-600">Categoria de Despesa</Label>
                <Select value={categoryId} onValueChange={setCategoryId}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecione a categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {expenseCategories.map((c) => (
                      <SelectItem key={c.id} value={c.id.toString()}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-600">Valor Máximo Permitido (R$)</Label>
                <Input
                  placeholder="Ex: 1500.00"
                  value={maxAmount}
                  onChange={(e) => setMaxAmount(e.target.value)}
                  required
                />
                <p className="text-xs text-slate-400">Teto máximo de gasto para o mês selecionado.</p>
              </div>

              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>Salvar Orçamento</span>
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Lista de Limites */}
        <Card className="lg:col-span-8 shadow-sm border border-slate-100">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-bold">Limites Definidos para {selectedMonth}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-500 uppercase text-xs">
                  <tr>
                    <th className="py-3 px-4 rounded-l-lg">Categoria</th>
                    <th className="py-3 px-4 text-right">Gasto Atual</th>
                    <th className="py-3 px-4 text-right">Teto Máximo</th>
                    <th className="py-3 px-4 text-right rounded-r-lg">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {budgets.map((b) => {
                    const isOver = b.remaining < 0;
                    return (
                      <tr key={b.category_id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-3 px-4 font-semibold text-slate-800 flex items-center gap-2">
                          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: b.color }}></span>
                          <span>{b.category_name}</span>
                        </td>
                        <td className="py-3 px-4 text-right font-medium text-slate-700">{formatMoney(b.spent_amount)}</td>
                        <td className="py-3 px-4 text-right font-bold text-slate-900">{formatMoney(b.max_amount)}</td>
                        <td className={`py-3 px-4 text-right font-semibold ${isOver ? 'text-rose-600' : 'text-emerald-600'}`}>
                          {b.max_amount === 0 ? 'Não definido' : isOver ? 'Estourado' : `Restam ${formatMoney(b.remaining)}`}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
