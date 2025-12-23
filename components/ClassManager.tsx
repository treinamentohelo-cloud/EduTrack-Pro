
import React, { useState, useEffect } from 'react';
import { Class, User, UserRole } from '../types';
import { supabase } from '../lib/supabase';
import { Plus, School, Trash2, X, CheckCircle2, Loader2, Edit2, ChevronDown, User as UserIcon, BookOpen } from 'lucide-react';

interface ClassManagerProps {
  classes: Class[];
  users: User[];
  setClasses: React.Dispatch<React.SetStateAction<Class[]>>;
  onUpdateClass: (id: string, classData: any) => Promise<boolean>;
  onDeleteClass: (id: string) => void;
}

const ClassManager: React.FC<ClassManagerProps> = ({ classes, users, setClasses, onUpdateClass, onDeleteClass }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<Class | null>(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    grade: 'Ensino Fundamental I',
    teacherId: ''
  });

  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isModalOpen]);

  useEffect(() => {
    if (editingClass) {
      setFormData({
        name: editingClass.name,
        grade: editingClass.grade,
        teacherId: editingClass.teacherId || ''
      });
    } else {
      setFormData({ name: '', grade: 'Ensino Fundamental I', teacherId: '' });
    }
  }, [editingClass, isModalOpen]);

  const teachers = users.filter(u => u.role === UserRole.TEACHER || u.role === UserRole.COORDINATOR);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;

    setLoading(true);
    try {
      if (editingClass) {
        const success = await onUpdateClass(editingClass.id, formData);
        if (success) setIsModalOpen(false);
      } else {
        const { data, error } = await supabase.from('classes').insert([{
          name: formData.name,
          grade: formData.grade,
          teacher_id: formData.teacherId || null
        }]).select();

        if (error) throw error;
        if (data) {
          const mappedClass: Class = { 
            id: data[0].id, 
            name: data[0].name, 
            grade: data[0].grade, 
            teacherId: data[0].teacher_id 
          };
          setClasses(prev => [...prev, mappedClass]);
          setIsModalOpen(false);
        }
      }
    } catch (err: any) {
      alert("Erro ao salvar turma: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight uppercase">Gestão de Turmas</h2>
          <p className="text-slate-500 font-medium text-sm">Organize as salas de aula e vincule professores regentes.</p>
        </div>
        <button 
          onClick={() => { setEditingClass(null); setIsModalOpen(true); }}
          className="w-full sm:w-auto bg-indigo-600 text-white px-8 py-3.5 rounded-2xl font-black hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 flex items-center justify-center gap-2 active:scale-95"
        >
          <Plus className="w-5 h-5" /> ADICIONAR TURMA
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {classes.map(cls => {
          const teacher = users.find(u => u.id === cls.teacherId);
          return (
            <div key={cls.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm hover:border-indigo-200 transition-all group relative overflow-hidden flex flex-col justify-between min-h-[260px]">
              <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full -mr-16 -mt-16 group-hover:bg-indigo-50/50 transition-colors duration-500"></div>
              
              <div>
                <div className="flex justify-between items-start mb-6 relative z-10">
                  <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-[1.5rem] flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                    <School className="w-8 h-8" />
                  </div>
                  <div className="flex gap-2 relative z-20">
                    <button onClick={() => { setEditingClass(cls); setIsModalOpen(true); }} className="p-2.5 text-slate-300 hover:text-amber-500 hover:bg-amber-50 rounded-xl transition-all"><Edit2 className="w-5 h-5" /></button>
                    <button onClick={() => onDeleteClass(cls.id)} className="p-2.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"><Trash2 className="w-5 h-5" /></button>
                  </div>
                </div>
                
                <h3 className="font-black text-2xl text-slate-800 mb-1 group-hover:text-indigo-600 transition-colors">{cls.name}</h3>
                <div className="flex items-center gap-2 text-indigo-500 font-black text-[10px] uppercase tracking-widest bg-indigo-50 w-fit px-3 py-1 rounded-full border border-indigo-100">
                  <BookOpen className="w-3 h-3" />
                  {cls.grade}
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <UserIcon className="w-3 h-3" /> Professor Regente
                </p>
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs ${teacher ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-400'}`}>
                    {teacher ? teacher.name.charAt(0) : '?'}
                  </div>
                  <p className={`text-sm font-bold truncate ${teacher ? 'text-slate-700' : 'text-slate-400 italic'}`}>
                    {teacher ? teacher.name : 'Nenhum professor alocado'}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
        {classes.length === 0 && (
          <div className="col-span-full py-20 bg-slate-50 rounded-[3rem] border-4 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-300">
            <School className="w-16 h-16 mb-4 opacity-20" />
            <p className="font-black uppercase tracking-widest text-sm">Nenhuma turma cadastrada</p>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-lg shadow-2xl animate-in fade-in zoom-in duration-300 overflow-hidden max-h-[calc(100vh-2rem)] flex flex-col">
            <div className="bg-slate-900 p-10 text-white flex justify-between items-center">
              <div>
                <h3 className="text-3xl font-black tracking-tight uppercase">{editingClass ? 'Editar Turma' : 'Nova Turma'}</h3>
                <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-1">Configuração da Estrutura Escolar</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X className="w-10 h-10" /></button>
            </div>
            
            <div className="p-10 overflow-y-auto">
              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Identificação da Turma</label>
                  <input 
                    autoFocus 
                    required 
                    type="text" 
                    value={formData.name} 
                    onChange={(e) => setFormData({...formData, name: e.target.value})} 
                    placeholder="Ex: 5º Ano B - Matutino"
                    className="w-full px-6 py-5 bg-slate-50 border border-slate-200 rounded-3xl outline-none font-bold text-slate-700 focus:ring-4 focus:ring-indigo-500/10 transition-all placeholder:text-slate-300" 
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Etapa de Ensino</label>
                  <div className="relative">
                    <select 
                      value={formData.grade} 
                      onChange={(e) => setFormData({...formData, grade: e.target.value})} 
                      className="w-full px-6 py-5 bg-slate-50 border border-slate-200 rounded-3xl outline-none font-bold text-slate-700 appearance-none cursor-pointer focus:ring-4 focus:ring-indigo-500/10 transition-all"
                    >
                      <option value="Educação Infantil">Educação Infantil</option>
                      <option value="Ensino Fundamental I">Ensino Fundamental I</option>
                      <option value="Ensino Fundamental II">Ensino Fundamental II</option>
                      <option value="Ensino Médio">Ensino Médio</option>
                    </select>
                    <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 w-6 h-6 pointer-events-none" />
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center ml-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Alocação de Professor</label>
                    <span className="text-[9px] font-black text-indigo-500 uppercase bg-indigo-50 px-2 py-0.5 rounded">Obrigatório para gestão</span>
                  </div>
                  <div className="relative">
                    <select 
                      required
                      value={formData.teacherId} 
                      onChange={(e) => setFormData({...formData, teacherId: e.target.value})} 
                      className="w-full px-6 py-5 bg-slate-50 border border-slate-200 rounded-3xl outline-none font-bold text-slate-700 appearance-none cursor-pointer focus:ring-4 focus:ring-indigo-500/10 transition-all"
                    >
                      <option value="">Selecione o professor regente...</option>
                      {teachers.map(t => <option key={t.id} value={t.id}>{t.name} ({t.role})</option>)}
                    </select>
                    <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 w-6 h-6 pointer-events-none" />
                  </div>
                </div>

                <div className="pt-6 flex gap-4">
                  <button 
                    type="button" 
                    onClick={() => setIsModalOpen(false)} 
                    className="flex-1 py-5 text-slate-400 font-black hover:bg-slate-50 rounded-3xl transition-all uppercase text-[10px] tracking-widest border border-transparent hover:border-slate-100"
                  >
                    Descartar
                  </button>
                  <button 
                    disabled={loading} 
                    type="submit" 
                    className="flex-1 bg-indigo-600 text-white font-black py-5 rounded-3xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 flex items-center justify-center gap-3 disabled:opacity-50 uppercase text-[10px] tracking-widest active:scale-95"
                  >
                    {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <><CheckCircle2 className="w-6 h-6" /> {editingClass ? 'ATUALIZAR' : 'CRIAR TURMA'}</>}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClassManager;
