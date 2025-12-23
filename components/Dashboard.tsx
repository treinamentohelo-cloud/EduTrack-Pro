
import React, { useState, useMemo } from 'react';
import { User, UserRole, ReadingLevel, Student, Class, PerformanceLevel } from '../types';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  Legend
} from 'recharts';
import { 
  TrendingUp,
  AlertCircle,
  GraduationCap,
  Search,
  Printer,
  Zap,
  Target,
  Award
} from 'lucide-react';

const PERFORMANCE_COLORS: Record<string, string> = {
  [PerformanceLevel.INSUFFICIENT]: '#f43f5e',
  [PerformanceLevel.BASIC]: '#f59e0b',
  [PerformanceLevel.ADEQUATE]: '#10b981',
  [PerformanceLevel.ADVANCED]: '#6366f1'
};

interface DashboardProps {
  user: User;
  students: Student[];
  classes: Class[];
  onNavigate: (tab: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, students, classes, onNavigate }) => {
  const [selectedClassId, setSelectedClassId] = useState<string>('all');

  const filteredStudents = useMemo(() => {
    if (selectedClassId === 'all') return students;
    return students.filter(s => s.classId === selectedClassId);
  }, [students, selectedClassId]);

  const performanceData = useMemo(() => {
    return Object.values(PerformanceLevel).map(level => ({
      name: level,
      count: filteredStudents.filter(s => s.readingPerformance === level || s.mathPerformance === level).length
    }));
  }, [filteredStudents]);

  const readingData = useMemo(() => 
    Object.values(ReadingLevel).map((level) => ({
      name: level,
      value: filteredStudents.filter(s => s.currentReadingLevel === level).length
    })), [filteredStudents]);

  const stats = [
    { label: 'Total Alunos', value: filteredStudents.length, icon: GraduationCap, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'Meta Atingida', value: filteredStudents.length > 0 ? `${((filteredStudents.filter(s => s.readingPerformance === PerformanceLevel.ADEQUATE || s.readingPerformance === PerformanceLevel.ADVANCED).length / filteredStudents.length) * 100).toFixed(0)}%` : '0%', icon: Award, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Zona Alerta', value: filteredStudents.filter(s => s.readingPerformance === PerformanceLevel.INSUFFICIENT).length, icon: AlertCircle, color: 'text-rose-600', bg: 'bg-rose-50' },
    { label: 'Média Geral', value: filteredStudents.length > 0 ? (filteredStudents.reduce((acc, s) => acc + (s.mathScore || 0), 0) / filteredStudents.length).toFixed(1) : '0', icon: Target, color: 'text-violet-600', bg: 'bg-violet-50' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm print:hidden">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Painel de Gestão</span>
          </div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">Status Pedagógico</h2>
          <p className="text-slate-500 font-medium">Indicadores consolidados da rede de ensino.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
          <select 
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            className="w-full px-8 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-black text-slate-700 outline-none"
          >
            <option value="all">Visão Geral</option>
            {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <button 
            onClick={() => window.print()}
            className="bg-slate-900 text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl flex items-center justify-center gap-3 active:scale-95"
          >
            <Printer className="w-4 h-4" /> Imprimir Panorama
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm flex items-center gap-6 group hover:border-indigo-200 transition-all">
            <div className={`${stat.bg} ${stat.color} p-5 rounded-2xl transition-transform`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
              <h3 className="text-3xl font-black text-slate-900">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
          <h3 className="font-black text-slate-800 uppercase text-xs tracking-widest mb-8">Saúde Pedagógica</h3>
          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={performanceData} cx="50%" cy="50%" innerRadius={70} outerRadius={100} paddingAngle={10} dataKey="count">
                  {performanceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PERFORMANCE_COLORS[entry.name as keyof typeof PERFORMANCE_COLORS]} stroke="none" />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
          <h3 className="font-black text-slate-800 uppercase text-xs tracking-widest mb-8">Níveis de Alfabetização</h3>
          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={readingData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 'bold' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 'bold' }} />
                <Tooltip cursor={{ fill: '#f8fafc' }} />
                <Bar dataKey="value" fill="#6366f1" radius={[12, 12, 0, 0]} barSize={50} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
