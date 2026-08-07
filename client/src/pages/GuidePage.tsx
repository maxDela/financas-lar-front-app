import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, ShieldCheck, TrendingUp, Lightbulb, CheckCircle2 } from 'lucide-react';

export default function GuidePage() {
  return (
    <div className="space-y-6 pb-12 max-w-5xl mx-auto">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Guia de Melhores Práticas Financeiras</h1>
        <p className="text-slate-500 text-sm">Estratégias avançadas e orientações para dominar o orçamento do lar e alavancar seus investimentos.</p>
      </div>

      <Card className="shadow-sm border border-slate-100">
        <CardHeader>
          <CardTitle className="text-lg font-bold flex items-center gap-2 text-blue-600">
            <Lightbulb className="w-5 h-5" />
            <span>1. A Regra Orçamentária 50/30/20</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-slate-700 text-sm leading-relaxed">
          <p>
            A Regra 50/30/20 é um dos pilares mais respeitados do planejamento financeiro. Ela divide a renda líquida mensal familiar em três grandes blocos:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-4">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div className="font-bold text-rose-600 text-base mb-1">50% - Necessidades</div>
              <p className="text-xs text-slate-600">Aluguel, contas de consumo (água, luz, internet), supermercado essencial, saúde e transporte básico.</p>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div className="font-bold text-amber-600 text-base mb-1">30% - Desejos</div>
              <p className="text-xs text-slate-600">Lazer, restaurantes, viagens, streaming, reformas estéticas da casa e hobbies.</p>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div className="font-bold text-emerald-600 text-base mb-1">20% - Investimentos</div>
              <p className="text-xs text-slate-600">Formação de reserva de emergência, amortização de dívidas e aplicações de longo prazo.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm border border-slate-100">
        <CardHeader>
          <CardTitle className="text-lg font-bold flex items-center gap-2 text-blue-600">
            <ShieldCheck className="w-5 h-5" />
            <span>2. Reserva de Emergência</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-slate-700 text-sm leading-relaxed">
          <p>
            Antes de assumir riscos em investimentos de renda variável, o lar deve obrigatoriamente acumular de <strong>6 a 12 meses</strong> do custo de vida essencial em ativos de altíssima liquidez (como Tesouro Selic ou CDBs com liquidez diária).
          </p>
        </CardContent>
      </Card>

      <Card className="shadow-sm border border-slate-100">
        <CardHeader>
          <CardTitle className="text-lg font-bold flex items-center gap-2 text-blue-600">
            <TrendingUp className="w-5 h-5" />
            <span>3. Como Saber Exatamente Quanto Posso Investir?</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-slate-700 text-sm leading-relaxed">
          <p>
            O sistema calcula em tempo real o seu <strong>Saldo Líquido</strong> e o <strong>Potencial para Investimentos</strong> subtraindo todas as despesas das receitas. Ao impor tetos máximos em categorias como combustível e lazer, o que sobra ao final do mês representa o aporte livre e seguro para a sua carteira de investimentos.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
