
import React, { useState } from 'react';
import { Student, ReadingLevel, PerformanceLevel } from '../types';
import { 
  ArrowLeft, 
  BookOpen, 
  Calculator, 
  Save, 
  CheckCircle2, 
  AlertCircle, 
  ChevronRight,
  TrendingUp,
  Sparkles,
  Target
} from 'lucide-react';

interface AssessmentFormProps {
  studentId: string | null;
  students: Student[];
  onSave: (updated: Student) => void;
  onBack: () => void;
}

const AssessmentForm: React.FC<AssessmentFormProps> = ({ studentId, students, onSave, onBack }) => {
  const student = students.find(s => s.id === studentId);
  const [activeTab, setActiveTab] = useState<'reading' | 'math'>('reading');
  
  const [readingLevel, setReadingLevel] = useState<ReadingLevel>(student?.currentReadingLevel || ReadingLevel.PRE_SYLLABIC);
  const [readingPerformance, setReadingPerformance] = useState<PerformanceLevel>(student?.readingPerformance || PerformanceLevel.BASIC);
  
  const [mathScore, setMathScore] = useState<number>(student?.mathScore || 0);
  const [mathPerformance, setMathPerformance] = useState<PerformanceLevel>(student?.mathPerformance || PerformanceLevel.BASIC);
  
  const [notes, setNotes] = useState('');

  if (!student) return <div className="p-8 text-center text-slate-500">Selecione um aluno para começar.</div>;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...student,
      currentReadingLevel: readingLevel,
      readingPerformance: readingPerformance,
      mathScore: mathScore,
      mathPerformance: mathPerformance
    });
  };

  const performanceOptions = [
    { 
      level: PerformanceLevel.INSUFFICIENT, 
      label: 'Insuficiente', 
      color: 'bg-rose-500', 
      lightColor: 'bg-rose-50', 
      textColor: 'text-rose-700',
      borderColor: 'border-rose-200',
      icon: AlertCircle,
      desc: 'Abaixo do esperado para a série.'
    },
    { 
      level: PerformanceLevel.BASIC, 
      label: 'Básico', 
      color: 'bg-amber-500', 
      lightColor: 'bg-amber-50', 
      textColor: 'text-amber-700',
      borderColor: 'border-amber-200',
      icon: TrendingUp,
      desc: 'Desenvolvendo habilidades mínimas.'
    },
    { 
      level: PerformanceLevel.ADEQUATE, 
      label: 'Adequado', 
      color: 'bg-emerald-500', 
      lightColor: 'bg-emerald-50', 
      textColor: 'text-emerald-700',
      borderColor: 'border-emerald-200',
      icon: Target,
      desc: 'Atende às expectativas da etapa.'
    },
    { 
      level: PerformanceLevel.ADVANCED, 
      label: 'Avançado', 
      color: 'bg-indigo-600', 
      lightColor: 'bg-indigo-50', 
      textColor: 'text-indigo-700',
      borderColor: 'border-indigo-200',
      icon: Sparkles,
      desc: 'Supera os objetivos propostos.'
    },
  ];

  const renderPerformanceMenu = (current: PerformanceLevel, setter: (val: PerformanceLevel) => void) => (
    <div className="space-y-4">
      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Conceito de Desempenho Global</label>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {performanceOptions.map((opt) => {
          const isSelected = current === opt.level;
          const Icon = opt.icon;
          return (
            <button
              key={opt.level}
              type="button"
              onClick={() => setter(opt.level)}
              className={`relative flex flex-col p-5 rounded-[2rem] border-2 text-left transition-all duration-300 group ${
                isSelected 
                  ? `${opt.borderColor} ${opt.lightColor} ring-4 ring-offset-2 ring-slate-100 shadow-xl` 
                  : 'bg-white border-slate-100 hover:border-slate-200'
              }`}
            >
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110 ${
                isSelected ? `${opt.color} text-white shadow-lg` : 'bg-slate-100 text-slate-400'
              }`}>
                <Icon className="w-5 h-5" />
              </div>
              <p className={`font-black uppercase text-[10px] tracking-widest mb-1 ${isSelected ? opt.textColor : 'text-slate-400'}`}>
                {opt.label}
              </p>
              <p className={`text-[11px] font-medium leading-tight ${isSelected ? 'text-slate-600' : 'text-slate-400'}`}>
                {opt.desc}
              </p>
              {isSelected && (
                <div className="absolute top-4 right-4">
                  <CheckCircle2 className={`w-5 h-5 ${opt.textColor}`} />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-all font-bold group"
      >
        <div className="p-1 group-hover:-translate-x-1 transition-transform">
          <ArrowLeft className="w-4 h-4" />
        </div>
        Cancelar e Voltar
      </button>

      <div className="bg-white rounded-[3rem] border border-slate-200 shadow-2xl overflow-hidden">
        <div className="bg-slate-900 px-10 py-12 text-white relative overflow-hidden">
          <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="w-24 h-24 bg-white/10 rounded-[2.5rem] backdrop-blur-md flex items-center justify-center text-white text-4xl font-black border border-white/20 shadow-2xl">
                  {student.name.charAt(0)}
                </div>
                <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center border-4 border-slate-900 shadow-lg">
                  <Target className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="text-center md:text-left">
                <h2 className="text-4xl font-black tracking-tight">{student.name}</h2>
                <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-3">
                  <span className="bg-white/10 px-4 py-1.5 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-white/10">Matrícula: {student.id.slice(0, 8)}</span>
                  <span className="bg-indigo-500/20 text-indigo-300 px-4 py-1.5 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-indigo-500/30">Avaliação Ativa</span>
                </div>
              </div>
            </div>
            
            <div className="flex bg-white/5 p-2 rounded-[2rem] backdrop-blur-md border border-white/10 shadow-inner">
              <button 
                onClick={() => setActiveTab('reading')}
                className={`flex items-center gap-3 px-8 py-3.5 rounded-[1.5rem] text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'reading' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/20' : 'text-slate-400 hover:text-white'}`}
              >
                <BookOpen className="w-4 h-4" /> Leitura
              </button>
              <button 
                onClick={() => setActiveTab('math')}
                className={`flex items-center gap-3 px-8 py-3.5 rounded-[1.5rem] text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'math' ? 'bg-emerald-600 text-white shadow-xl shadow-emerald-600/20' : 'text-slate-400 hover:text-white'}`}
              >
                <Calculator className="w-4 h-4" /> Matemática
              </button>
            </div>
          </div>
        </div>

        <form className="p-10 lg:p-14 space-y-12" onSubmit={handleSubmit}>
          {activeTab === 'reading' ? (
            <div className="space-y-12 animate-in fade-in duration-500">
              {renderPerformanceMenu(readingPerformance, setReadingPerformance)}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 pt-8 border-t border-slate-50">
                <div className="space-y-6">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nível de Alfabetização</label>
                  <div className="space-y-3">
                    {Object.values(ReadingLevel).map(level => (
                      <label 
                        key={level}
                        className={`flex items-center justify-between p-5 rounded-[1.5rem] border-2 transition-all cursor-pointer group ${
                          readingLevel === level ? 'bg-indigo-50 border-indigo-600' : 'bg-white border-slate-100 hover:border-slate-200'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-3 h-3 rounded-full border-4 transition-all ${readingLevel === level ? 'bg-indigo-600 border-white' : 'border-slate-200'}`} />
                          <input type="radio" className="hidden" checked={readingLevel === level} onChange={() => setReadingLevel(level)} />
                          <span className={`font-black text-sm uppercase tracking-tight ${readingLevel === level ? 'text-indigo-900' : 'text-slate-500 group-hover:text-slate-700'}`}>{level}</span>
                        </div>
                        {readingLevel === level && <ChevronRight className="w-5 h-5 text-indigo-600" />}
                      </label>
                    ))}
                  </div>
                </div>
                <div className="space-y-8">
                  <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100">
                    <h4 className="text-xs font-black text-slate-800 mb-8 flex items-center gap-3 uppercase tracking-widest">
                      <TrendingUp className="w-5 h-5 text-indigo-600" /> Indicadores
                    </h4>
                    <div className="space-y-8">
                      {['Decodificação', 'Velocidade', 'Prosódia'].map(skill => (
                        <div key={skill} className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-[11px] font-black text-slate-500 uppercase tracking-wider">{skill}</span>
                            <span className="text-xs font-black text-indigo-600">Média</span>
                          </div>
                          <div className="relative h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                             <div className="absolute h-full w-[65%] bg-indigo-600 rounded-full" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-12 animate-in fade-in duration-500">
              {renderPerformanceMenu(mathPerformance, setMathPerformance)}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 pt-8 border-t border-slate-50">
                <div className="space-y-8">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Eixos da Matemática</label>
                  <div className="space-y-4">
                    {[
                      { label: 'Números e Álgebra', desc: 'Sistemas de numeração' },
                      { label: 'Geometria', desc: 'Formas e relações' },
                      { label: 'Probabilidade', desc: 'Interpretação de dados' }
                    ].map(skill => (
                      <div key={skill.label} className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 flex justify-between items-center group hover:bg-emerald-50 transition-all">
                        <div>
                          <h5 className="font-black text-slate-800 text-xs uppercase tracking-tight">{skill.label}</h5>
                          <p className="text-[10px] text-slate-400 mt-1">{skill.desc}</p>
                        </div>
                        <input type="number" min="0" max="10" defaultValue="7" className="w-14 h-14 text-center font-black bg-white border border-slate-100 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 text-emerald-700 shadow-sm" />
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-emerald-50 p-10 rounded-[3rem] border border-emerald-100 flex flex-col items-center justify-center text-center space-y-6 shadow-inner">
                  <div className="w-24 h-24 bg-white rounded-[2rem] flex items-center justify-center text-emerald-600 shadow-2xl">
                    <Calculator className="w-12 h-12" />
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-2xl font-black text-emerald-900 uppercase tracking-tight">Nota Global</h4>
                    <div className="relative pt-6">
                      <input type="number" min="0" max="100" value={mathScore} onChange={(e) => setMathScore(Number(e.target.value))} className="text-7xl font-black text-emerald-700 bg-transparent border-b-8 border-emerald-200 focus:border-emerald-500 w-48 text-center focus:outline-none transition-all pb-4" />
                      <span className="absolute -right-8 bottom-8 text-4xl font-black text-emerald-300">%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="pt-12 border-t border-slate-100">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 ml-1">Observações Pedagógicas</label>
            <textarea rows={5} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Descreva as conquistas e necessidades do aluno..." className="w-full border-2 border-slate-100 rounded-[2.5rem] p-10 focus:outline-none focus:ring-8 focus:ring-slate-50 transition-all text-slate-700 font-bold placeholder:text-slate-300" />
          </div>

          <div className="flex justify-end gap-6 pt-6">
            <button type="button" onClick={onBack} className="px-10 py-5 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:bg-slate-50 transition-all">Voltar</button>
            <button type="submit" className="bg-slate-900 text-white font-black px-16 py-5 rounded-[2rem] hover:bg-indigo-600 transition-all flex items-center gap-4 shadow-2xl active:scale-95 group">
              <Save className="w-5 h-5 group-hover:scale-110 transition-transform" /> 
              <span className="text-[10px] uppercase tracking-widest">Salvar Avaliação</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AssessmentForm;
