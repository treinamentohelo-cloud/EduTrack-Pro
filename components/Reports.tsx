
import React, { useState, useEffect } from 'react';
import { User, UserRole, PerformanceLevel, Student, Class, ReadingLevel } from '../types';
import { 
  FileText, 
  Search, 
  AlertCircle, 
  CheckCircle2, 
  TrendingUp, 
  ArrowRight,
  Printer,
  X,
  FileBarChart
} from 'lucide-react';
import { supabase } from '../lib/supabase';

interface ReportsProps {
  user: User;
}

const Reports: React.FC<ReportsProps> = ({ user }) => {
  const [view, setView] = useState<'menu' | 'list' | 'consolidated'>('menu');
  const [selectedLevel, setSelectedLevel] = useState<PerformanceLevel | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterClassId, setFilterClassId] = useState<string>('all');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [stdRes, clsRes] = await Promise.all([
        supabase.from('students').select('*').order('name'),
        supabase.from('classes').select('*').order('name')
      ]);
      if (stdRes.data) {
        setStudents(stdRes.data.map((s: any) => ({
          id: s.id,
          name: s.name,
          classId: s.class_id,
          currentReadingLevel: s.current_reading_level as ReadingLevel,
          readingPerformance: s.reading_performance as PerformanceLevel,
          mathPerformance: s.math_performance as PerformanceLevel,
          mathScore: s.math_score
        })));
      }
      if (clsRes.data) setClasses(clsRes.data);
    } catch (e) {
      console.error("Erro ao carregar dados dos relatórios:", e);
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = students.filter(s => {
    const matchesClass = filterClassId === 'all' || s.classId === filterClassId;
    if (view === 'list' && selectedLevel) {
      if (selectedLevel === PerformanceLevel.ADEQUATE) {
        return matchesClass && (s.readingPerformance === PerformanceLevel.ADEQUATE || s.readingPerformance === PerformanceLevel.ADVANCED);
      }
      return matchesClass && (s.readingPerformance === selectedLevel || s.mathPerformance === selectedLevel);
    }
    return matchesClass;
  });

  const stats = {
    total: filteredStudents.length,
    insufficient: filteredStudents.filter(s => s.readingPerformance === PerformanceLevel.INSUFFICIENT).length,
    basic: filteredStudents.filter(s => s.readingPerformance === PerformanceLevel.BASIC).length,
    adequate: filteredStudents.filter(s => s.readingPerformance === PerformanceLevel.ADEQUATE || s.readingPerformance === PerformanceLevel.ADVANCED).length,
    avgMath: filteredStudents.length > 0 
      ? (filteredStudents.reduce((acc, s) => acc + (s.mathScore || 0), 0) / filteredStudents.length).toFixed(1) 
      : 0
  };

  const renderConsolidated = () => (
    <div className="space-y-8 animate-in fade-in duration-500 print:p-0">
      <div className="flex justify-between items-center print:hidden">
        <button onClick={() => setView('menu')} className="flex items-center gap-2 text-slate-500 font-bold hover:text-indigo-600 transition-colors">
          <X className="w-5 h-5" /> Fechar Relatório
        </button>
        <button onClick={() => window.print()} className="bg-slate-900 text-white px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2">
          <Printer className="w-4 h-4" /> Imprimir Documento
        </button>
      </div>

      <div className="bg-white rounded-[3rem] border border-slate-200 shadow-2xl overflow-hidden">
        <div className="bg-slate-900 p-12 text-white border-b-8 border-indigo-500">
          <h2 className="text-4xl font-black uppercase tracking-tight mb-2">Relatório Consolidado Trimestral</h2>
          <div className="flex gap-4 text-slate-400 text-xs font-bold uppercase tracking-widest">
            <span>Escola: EduTrack Central</span>
            <span className="text-indigo-400">•</span>
            <span>Período: 1º Trimestre / 2024</span>
            <span className="text-indigo-400">•</span>
            <span>Emissão: {new Date().toLocaleDateString()}</span>
          </div>
        </div>

        <div className="p-12 space-y-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="p-8 bg-slate-50 rounded-[2rem] text-center border border-slate-100">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Total Analisado</p>
              <p className="text-4xl font-black text-slate-900">{stats.total}</p>
            </div>
            <div className="p-8 bg-rose-50 rounded-[2rem] text-center border border-rose-100">
              <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest mb-2">Em Alerta</p>
              <p className="text-4xl font-black text-rose-600">{stats.insufficient}</p>
            </div>
            <div className="p-8 bg-emerald-50 rounded-[2rem] text-center border border-emerald-100">
              <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-2">Metas Atingidas</p>
              <p className="text-4xl font-black text-emerald-600">{stats.adequate}</p>
            </div>
            <div className="p-8 bg-indigo-50 rounded-[2rem] text-center border border-indigo-100">
              <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-2">Média Matemática</p>
              <p className="text-4xl font-black text-indigo-600">{stats.avgMath}%</p>
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight flex items-center gap-3">
              <FileBarChart className="w-6 h-6 text-indigo-600" /> Distribuição por Turma
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 border-y border-slate-100">
                  <tr>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase">Turma</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase text-center">Alunos</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase text-center">Aproveitamento</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase">Status Geral</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {classes.map(c => {
                    const classStudents = students.filter(s => s.classId === c.id);
                    const perf = classStudents.length > 0 
                      ? (classStudents.filter(s => s.readingPerformance === PerformanceLevel.ADEQUATE || s.readingPerformance === PerformanceLevel.ADVANCED).length / classStudents.length * 100).toFixed(0)
                      : 0;
                    return (
                      <tr key={c.id}>
                        <td className="px-6 py-4 font-bold text-slate-700">{c.name}</td>
                        <td className="px-6 py-4 text-center font-medium text-slate-500">{classStudents.length}</td>
                        <td className="px-6 py-4 text-center">
                          <span className="font-black text-indigo-600">{perf}%</span>
                        </td>
                        <td className="px-6 py-4">
                           <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                             <div className="bg-indigo-500 h-full" style={{ width: `${perf}%` }}></div>
                           </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-20">
      {view === 'menu' && (
        <>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <h2 className="text-3xl font-black text-slate-800 tracking-tight uppercase">Central de Relatórios</h2>
              <p className="text-slate-500 font-medium">Gere documentos oficiais e listas de acompanhamento.</p>
            </div>
            <button className="bg-indigo-600 text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3 hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 active:scale-95">
              <FileText className="w-5 h-5" /> Novo Relatório Customizado
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <ReportCard 
              title="Alunos em Alerta" 
              desc="Listagem de estudantes com conceito Insuficiente."
              icon={AlertCircle}
              color="rose"
              onClick={() => { setSelectedLevel(PerformanceLevel.INSUFFICIENT); setView('list'); }}
            />
            <ReportCard 
              title="Em Desenvolvimento" 
              desc="Alunos que atingiram o nível Básico."
              icon={TrendingUp}
              color="amber"
              onClick={() => { setSelectedLevel(PerformanceLevel.BASIC); setView('list'); }}
            />
            <ReportCard 
              title="Metas Atingidas" 
              desc="Estudantes nos níveis Adequado ou Avançado."
              icon={CheckCircle2}
              color="emerald"
              onClick={() => { setSelectedLevel(PerformanceLevel.ADEQUATE); setView('list'); }}
            />
          </div>

          <div className="bg-slate-900 rounded-[3rem] p-10 lg:p-14 text-white relative overflow-hidden shadow-2xl">
            <div className="absolute right-0 top-0 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[100px] -mr-40 -mt-40"></div>
            <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
              <div className="w-24 h-24 bg-white/10 rounded-[2rem] backdrop-blur-md flex items-center justify-center border border-white/20 shadow-2xl">
                <Printer className="w-10 h-10 text-indigo-400" />
              </div>
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-4xl font-black tracking-tight mb-4 uppercase">Relatório Consolidado Trimestral</h3>
                <p className="text-slate-400 font-medium text-lg leading-relaxed max-w-2xl mb-8">
                  Documento completo com estatísticas de evolução por turma, metas da BNCC atingidas e comparativo de desempenho. Ideal para conselhos de classe.
                </p>
                <button 
                  onClick={() => setView('consolidated')}
                  className="bg-white text-slate-900 px-12 py-5 rounded-[2rem] text-xs font-black uppercase tracking-widest hover:bg-indigo-400 hover:text-white transition-all shadow-2xl active:scale-95"
                >
                  Gerar Consolidado
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {view === 'list' && (
        <div className="bg-white rounded-[3rem] border border-slate-200 shadow-xl overflow-hidden animate-in zoom-in duration-300">
          <div className="p-10 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6 bg-slate-50/50">
            <div className="flex items-center gap-6">
              <button onClick={() => setView('menu')} className="p-3 hover:bg-white rounded-2xl transition-all shadow-sm border border-slate-100">
                <X className="w-6 h-6 text-slate-400" />
              </button>
              <div>
                <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Listagem de Filtro</h3>
                <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest mt-1">
                  Categoria: {selectedLevel} • {filteredStudents.length} Alunos Encontrados
                </p>
              </div>
            </div>
            <div className="flex gap-4">
               <select 
                value={filterClassId}
                onChange={(e) => setFilterClassId(e.target.value)}
                className="bg-white border border-slate-200 px-6 py-4 rounded-2xl text-xs font-black text-slate-600 outline-none shadow-sm"
              >
                <option value="all">Filtro: Todas as Turmas</option>
                {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <button onClick={() => window.print()} className="bg-slate-900 text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3">
                <Printer className="w-5 h-5" /> Imprimir
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                  <th className="px-10 py-6">Nome do Aluno</th>
                  <th className="px-10 py-6">Turma Atual</th>
                  <th className="px-10 py-6">Nível de Leitura</th>
                  <th className="px-10 py-6">Status Pedagógico</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredStudents.map(s => (
                  <tr key={s.id} className="hover:bg-indigo-50/30 transition-colors">
                    <td className="px-10 py-6 font-bold text-slate-700">{s.name}</td>
                    <td className="px-10 py-6 text-sm font-medium text-slate-500">
                      {classes.find(c => c.id === s.classId)?.name || 'N/A'}
                    </td>
                    <td className="px-10 py-6">
                      <span className="text-[10px] font-black uppercase tracking-tight text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-100">
                        {s.currentReadingLevel}
                      </span>
                    </td>
                    <td className="px-10 py-6">
                      <span className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-wider ${
                        s.readingPerformance === PerformanceLevel.INSUFFICIENT ? 'bg-rose-100 text-rose-700' :
                        s.readingPerformance === PerformanceLevel.BASIC ? 'bg-amber-100 text-amber-700' :
                        'bg-emerald-100 text-emerald-700'
                      }`}>
                        {s.readingPerformance}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {view === 'consolidated' && renderConsolidated()}
    </div>
  );
};

const ReportCard: React.FC<{ 
  title: string; 
  desc: string; 
  icon: any; 
  color: 'rose' | 'amber' | 'emerald';
  onClick: () => void;
}> = ({ title, desc, icon: Icon, color, onClick }) => {
  const colors = {
    rose: 'text-rose-600 bg-rose-50 border-rose-100 hover:border-rose-300',
    amber: 'text-amber-600 bg-amber-50 border-amber-100 hover:border-amber-300',
    emerald: 'text-emerald-600 bg-emerald-50 border-emerald-100 hover:border-emerald-300'
  };

  return (
    <div className={`bg-white p-10 rounded-[2.5rem] border-2 shadow-sm transition-all group flex flex-col justify-between ${colors[color]}`}>
      <div>
        <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center mb-8 shadow-inner transition-transform group-hover:scale-110 ${colors[color].split(' ')[1]}`}>
          <Icon className="w-8 h-8" />
        </div>
        <h4 className="text-xl font-black text-slate-800 mb-3 uppercase tracking-tight">{title}</h4>
        <p className="text-sm text-slate-500 font-medium leading-relaxed">{desc}</p>
      </div>
      <button 
        onClick={onClick}
        className="mt-10 w-full p-5 bg-slate-50 rounded-2xl flex items-center justify-between group-hover:bg-slate-900 group-hover:text-white transition-all shadow-sm"
      >
        <span className="text-[10px] font-black uppercase tracking-widest">Gerar Listagem</span>
        <ArrowRight className="w-5 h-5" />
      </button>
    </div>
  );
};

export default Reports;
