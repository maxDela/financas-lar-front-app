import { supabase, isSupabaseConfigured } from './supabase';

export interface Category {
  id: number;
  name: string;
  type: 'expense' | 'revenue';
  color: string;
  created_at?: string;
}

export interface Budget {
  id: number;
  category_id: number;
  mes_ano: string;
  max_amount: number;
  category?: Category;
}

export interface Transaction {
  id: number;
  description: string;
  amount: number;
  type: 'expense' | 'revenue';
  category_id: number;
  transaction_date: string;
  notes?: string;
  category?: Category;
}

// Categorias padrão iniciais para localStorage caso Supabase não esteja conectado ainda
const DEFAULT_CATEGORIES: Category[] = [
  { id: 1, name: 'Despesas Fixas (Aluguel, Contas)', type: 'expense', color: '#dc3545' },
  { id: 2, name: 'Alimentação (Supermercado)', type: 'expense', color: '#fd7e14' },
  { id: 3, name: 'Combustível / Transporte', type: 'expense', color: '#ffc107' },
  { id: 4, name: 'Lazer / Entretenimento', type: 'expense', color: '#0dcaf0' },
  { id: 5, name: 'Reformas / Manutenção da Casa', type: 'expense', color: '#6f42c1' },
  { id: 6, name: 'Investimentos', type: 'expense', color: '#198754' },
  { id: 7, name: 'Saúde / Farmácia', type: 'expense', color: '#d63384' },
  { id: 8, name: 'Salário / Rendimentos', type: 'revenue', color: '#20c997' },
  { id: 9, name: 'Outras Receitas', type: 'revenue', color: '#0d6efd' },
];

function getLocalStorageData<T>(key: string, defaultValue: T): T {
  const data = localStorage.getItem(`financas_lar_${key}`);
  return data ? JSON.parse(data) : defaultValue;
}

function setLocalStorageData<T>(key: string, value: T): void {
  localStorage.setItem(`financas_lar_${key}`, JSON.stringify(value));
}

// Inicializar localStorage se vazio
if (!localStorage.getItem('financas_lar_categories')) {
  setLocalStorageData('categories', DEFAULT_CATEGORIES);
}
if (!localStorage.getItem('financas_lar_transactions')) {
  setLocalStorageData('transactions', [
    { id: 1, description: 'Salário Mensal', amount: 8500, type: 'revenue', category_id: 8, transaction_date: '2026-08-01', notes: 'Salário principal' },
    { id: 2, description: 'Supermercado Semanal', amount: 1200, type: 'expense', category_id: 2, transaction_date: '2026-08-02', notes: 'Compras do mês' },
    { id: 3, description: 'Posto de Combustível', amount: 350, type: 'expense', category_id: 3, transaction_date: '2026-08-03', notes: 'Gasolina' }
  ]);
}
if (!localStorage.getItem('financas_lar_budgets')) {
  setLocalStorageData('budgets', [
    { id: 1, category_id: 2, mes_ano: '2026-08', max_amount: 1500 },
    { id: 2, category_id: 3, mes_ano: '2026-08', max_amount: 500 },
    { id: 3, category_id: 4, mes_ano: '2026-08', max_amount: 800 },
    { id: 4, category_id: 5, mes_ano: '2026-08', max_amount: 1000 }
  ]);
}

// Funções de Serviço Unificadas (Supabase ou LocalStorage Fallback)
export async function fetchCategories(): Promise<Category[]> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.from('categories').select('*').order('name');
    if (!error && data) return data;
  }
  return getLocalStorageData<Category[]>('categories', DEFAULT_CATEGORIES);
}

export async function addCategory(category: Omit<Category, 'id'>): Promise<void> {
  if (isSupabaseConfigured && supabase) {
    await supabase.from('categories').insert([category]);
    return;
  }
  const cats = getLocalStorageData<Category[]>('categories', DEFAULT_CATEGORIES);
  const newId = cats.length > 0 ? Math.max(...cats.map(c => c.id)) + 1 : 1;
  cats.push({ ...category, id: newId });
  setLocalStorageData('categories', cats);
}

export async function deleteCategory(id: number): Promise<void> {
  if (isSupabaseConfigured && supabase) {
    await supabase.from('categories').delete().eq('id', id);
    return;
  }
  let cats = getLocalStorageData<Category[]>('categories', DEFAULT_CATEGORIES);
  cats = cats.filter(c => c.id !== id);
  setLocalStorageData('categories', cats);
}

export async function fetchTransactions(month: string): Promise<Transaction[]> {
  if (isSupabaseConfigured && supabase) {
    const startDate = `${month}-01`;
    // Calcular último dia do mês
    const [year, m] = month.split('-').map(Number);
    const lastDay = new Date(year, m, 0).getDate();
    const endDate = `${month}-${lastDay}`;

    const { data, error } = await supabase
      .from('transactions')
      .select('*, category:categories(*)')
      .gte('transaction_date', startDate)
      .lte('transaction_date', endDate)
      .order('transaction_date', { ascending: false });

    if (!error && data) {
      return data.map((t: any) => ({
        ...t,
        category: t.category || { id: t.category_id, name: 'Outros', type: 'expense', color: '#6c757d' }
      }));
    }
  }

  // Fallback LocalStorage
  const txs = getLocalStorageData<Transaction[]>('transactions', []);
  const cats = getLocalStorageData<Category[]>('categories', DEFAULT_CATEGORIES);
  return txs
    .filter(t => t.transaction_date.startsWith(month))
    .map(t => ({
      ...t,
      category: cats.find(c => c.id === t.category_id) || { id: t.category_id, name: 'Outros', type: 'expense', color: '#6c757d' }
    }))
    .sort((a, b) => new Date(b.transaction_date).getTime() - new Date(a.transaction_date).getTime());
}

export async function addTransaction(tx: Omit<Transaction, 'id' | 'category'>): Promise<void> {
  if (isSupabaseConfigured && supabase) {
    await supabase.from('transactions').insert([tx]);
    return;
  }
  const txs = getLocalStorageData<Transaction[]>('transactions', []);
  const newId = txs.length > 0 ? Math.max(...txs.map(t => t.id)) + 1 : 1;
  txs.push({ ...tx, id: newId });
  setLocalStorageData('transactions', txs);
}

export async function deleteTransaction(id: number): Promise<void> {
  if (isSupabaseConfigured && supabase) {
    await supabase.from('transactions').delete().eq('id', id);
    return;
  }
  let txs = getLocalStorageData<Transaction[]>('transactions', []);
  txs = txs.filter(t => t.id !== id);
  setLocalStorageData('transactions', txs);
}

export async function fetchBudgets(month: string): Promise<any[]> {
  const cats = await fetchCategories();
  const expenseCats = cats.filter(c => c.type === 'expense');
  const txs = await fetchTransactions(month);

  let storedBudgets: any[] = [];
  if (isSupabaseConfigured && supabase) {
    const { data } = await supabase.from('budgets').select('*, category:categories(*)').eq('mes_ano', month);
    if (data) storedBudgets = data;
  } else {
    const allBudgets = getLocalStorageData<any[]>('budgets', []);
    storedBudgets = allBudgets.filter(b => b.mes_ano === month);
  }

  return expenseCats.map(cat => {
    const budgetItem = storedBudgets.find(b => b.category_id === cat.id);
    const max_amount = budgetItem ? Number(budgetItem.max_amount) : 0;
    const spent_amount = txs
      .filter(t => t.category_id === cat.id && t.type === 'expense')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    return {
      category_id: cat.id,
      category_name: cat.name,
      color: cat.color,
      max_amount,
      spent_amount,
      remaining: max_amount - spent_amount,
      percent: max_amount > 0 ? Math.min(Math.round((spent_amount / max_amount) * 1000) / 10, 100) : 0
    };
  });
}

export async function saveBudget(category_id: number, mes_ano: string, max_amount: number): Promise<void> {
  if (isSupabaseConfigured && supabase) {
    // Verificar se já existe
    const { data } = await supabase.from('budgets').select('id').eq('category_id', category_id).eq('mes_ano', mes_ano).single();
    if (data) {
      await supabase.from('budgets').update({ max_amount }).eq('id', data.id);
    } else {
      await supabase.from('budgets').insert([{ category_id, mes_ano, max_amount }]);
    }
    return;
  }

  let budgets = getLocalStorageData<any[]>('budgets', []);
  const index = budgets.findIndex(b => b.category_id === category_id && b.mes_ano === mes_ano);
  if (index >= 0) {
    budgets[index].max_amount = max_amount;
  } else {
    const newId = budgets.length > 0 ? Math.max(...budgets.map(b => b.id || 0)) + 1 : 1;
    budgets.push({ id: newId, category_id, mes_ano, max_amount });
  }
  setLocalStorageData('budgets', budgets);
}

export function formatMoney(val: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
}
