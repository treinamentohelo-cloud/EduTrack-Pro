
import React, { useState, useEffect } from 'react';
import { Student, Class, RemedialEnrollment, UserRole, User } from '../types';
import { supabase } from '../lib/supabase';
import { 
  Plus, 
  Search, 
  Trash2, 
  Calendar, 
  School, 
  X, 
  UserPlus, 
  Loader2, 
  Clock, 
  CheckCircle2, 
  ClipboardList,
  ChevronDown,
  Sparkles
} from 'lucide-react';

interface RemedialManagerProps {
  user: User; // Adicionado para controle de permissões
  students: Student[];
  classes: Class[];
  enrollments: RemedialEnrollment[];
  setEnrollments: React.Dispatch<React.SetStateAction<RemedialEnrollment[]>>;
}

const RemedialManager: React.FC<RemedialManagerProps> = ({ user, students, classes, enrollments, setEnrollments }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    studentId: '',
    classId: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    notes: ''
  });

  // Turmas que o usuário pode gerenciar
  const manageableClasses = classes.filter(c => 
    user.role === UserRole.MANAGER || user.role === UserRole.COORDINATOR || c.teacherId === user.id
  );

  // Alunos que o usuário pode matricular (pertencem às suas turmas)
  const availableStudents = students.filter(s => 
    manageableClasses.some(c => c.id === s.classId)
  );

  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isModalOpen]);

  useEffect(() => {
    if (showSuccess) {
      const timer = setTimeout(() => setShowSuccess(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [showSuccess]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.studentId || !formData.classId || !formData.startDate) return;

    setLoading(true);
    try {
      const payload = {
        student_id: formData.studentId,
        class_id: formData.classId,
        start_date: formData.startDate,
        end_date: formData.endDate || null,
        notes: formData.notes
      };

      const { data, error } = await supabase.from('remedial_enrollments').insert([payload]).select();

      if (error) throw error;

      if (data) {
        const newEnrollment: RemedialEnrollment = {
          id: data[0].id,
          studentId: data[0].student_id,
          classId: data[0].class_id,
          startDate: data[0].start_date,
          endDate: data[0].end_date,
          notes: data[0].notes
        };
        setEnrollments(prev => [newEnrollment, ...prev]);
        setIsModalOpen(false);
        setShowSuccess(true);
        setFormData({ studentId: '', classId: '', startDate: new Date().toISOString().split('T')[0], endDate: '', notes: '' });
      }
    } catch (err: any) {
      alert("Erro ao cadastrar reforço: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteEnrollment = async (id: string) => {
    if (!confirm("Deseja remover este aluno do reforço?")) return;
    const { error } = await supabase.from('remedial_enrollments').delete().eq('id', id);
    if (!error) {
      setEnrollments(prev => prev.filter(e => e.id !== id));
    }
  };

  const calculateDuration = (start: string, end?: string) => {
    const startDate = new Date(start);
    const endDate = end ? new Date(end) : new Date();
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 30) return `${diffDays} dia(s)`;
    const months = Math.floor(diffDays / 30);
    const remainingDays = diffDays % 30;
    return `${months} mês(es)${remainingDays > 0 ? ` e ${remainingDays} dia(s)` : ''}`;
  };

  const filteredEnrollments = enrollments.filter(enrollment => {
    const student = students.find(s => s.id === enrollment.studentId);
    if (!student) return false;
    // Professor só vê reforços de alunos das suas turmas
    const isAccessible = manageableClasses.some(c => c.id === enrollment.classId || c.id === student.classId);
    return isAccessible && student.name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Toast de Sucesso */}
      {showSuccess && (
        <div className="fixed top-24 right-8 z-[200] animate-in slide-in-from-right-10 duration-500">
          <div className="bg-emerald-600 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 border border-emerald-500">
            <div className="bg-white/20 p-2 rounded-xl">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <p className="font-black text-sm uppercase tracking-wider">Cadastro Confirmado!</p>
              <p className="text-xs text-emerald-100 font-bold">O aluno foi matriculado no reforço com sucesso.</p>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight uppercase">Módulo de Reforço</h2>
          <p className="text-slate-500 font-medium text-sm">Acompanhamento de permanência e apoio pedagógico.</p>
        </div>
        {/* Habilitado para todos os perfis autenticados */}
        <button 
          onClick={() => setIsModalOpen(true)}
          className="w-full md:w-auto bg-[#9D4EDD] text-white px-8 py-3.5 rounded-2xl font-black hover:bg-[#8B31D8] transition-all shadow-xl shadow-purple-100 flex items-center justify-center gap-2 active:scale-95"
        >
          <UserPlus className="w-5 h-5" /> MATRICULAR NO REFORÇO
        </button>
      </div>

      <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 group-focus-within:text-purple-500 transition-colors" />
          <input 
            type="text" 
            placeholder="Buscar aluno no reforço..."
            className="w-full pl-12 pr-4 py-4 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-purple-500/10 bg-slate-50/50 font-bold"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEnrollments.map((enrollment) => {
          const student = students.find(s => s.id === enrollment.studentId);
          const cls = classes.find(c => c.id === enrollment.classId);
          return (
            <div key={enrollment.id} className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden group hover:border-purple-200 transition-all">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <img 
                      src={student?.photoUrl || `https://ui-avatars.com/api/?name=${student?.name}&background=9D4EDD&color=fff`} 
                      className="w-12 h-12 rounded-2xl object-cover border-2 border-white shadow-sm"
                      alt=""
                    />
                    <div>
                      <h3 className="font-black text-slate-800 leading-tight">{student?.name || 'Carregando...'}</h3>
                      <div className="flex items-center gap-1.5 mt-1">
                         <School className="w-3 h-3 text-purple-500" />
                         <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">
                           Turma: {cls?.name || 'N/A'}
                         </span>
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={() => deleteEnrollment(enrollment.id)}
                    className="p-2 text-slate-200 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-3 mt-6">
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    <div className="text-[10px] uppercase font-black text-slate-400 tracking-wider">
                      Período de Apoio
                      <div className="text-xs text-slate-700 normal-case font-bold mt-0.5">
                        {new Date(enrollment.startDate).toLocaleDateString('pt-BR')} 
                        {enrollment.endDate ? ` — ${new Date(enrollment.endDate).toLocaleDateString('pt-BR')}` : ' (Ativo)'}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-xl border border-purple-100/50">
                    <Clock className="w-4 h-4 text-purple-500" />
                    <div className="text-[10px] uppercase font-black text-purple-400 tracking-wider">
                      Tempo na Turma de Reforço
                      <div className="text-sm text-purple-700 normal-case font-black mt-0.5">
                        {calculateDuration(enrollment.startDate, enrollment.endDate)}
                      </div>
                    </div>
                  </div>
                </div>

                {enrollment.notes && (
                  <div className="mt-4 p-3 bg-slate-50 rounded-xl border-l-4 border-purple-200">
                    <p className="text-[11px] text-slate-500 font-medium italic">
                      "{enrollment.notes}"
                    </p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filteredEnrollments.length === 0 && (
        <div className="text-center py-20 bg-white rounded-[2rem] border-2 border-dashed border-slate-100">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <ClipboardList className="w-10 h-10 text-slate-300" />
          </div>
          <h3 className="font-black text-slate-400 uppercase tracking-widest text-sm">Nenhum aluno no reforço no momento</h3>
        </div>
      )}

      {/* Modal de Cadastro Centralizado */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-lg shadow-2xl animate-in fade-in zoom-in duration-300 overflow-hidden max-h-[calc(100vh-2rem)] flex flex-col">
            <div className="bg-[#9D4EDD] p-8 text-white flex justify-between items-center sticky top-0 z-10">
              <div>
                <h3 className="text-2xl font-black tracking-tight uppercase">Cadastro de Reforço</h3>
                <p className="text-purple-100 text-xs font-bold uppercase tracking-widest mt-1">Defina o período e a turma de apoio</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X className="w-8 h-8" /></button>
            </div>

            <div className="overflow-y-auto p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Estudante</label>
                  <div className="relative">
                    <select 
                      required
                      value={formData.studentId}
                      onChange={(e) => setFormData({...formData, studentId: e.target.value})}
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold text-slate-700 appearance-none cursor-pointer focus:ring-4 focus:ring-purple-500/10 transition-all"
                    >
                      <option value="">Selecione um aluno...</option>
                      {availableStudents.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                    <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 pointer-events-none" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Turma de Apoio</label>
                  <div className="relative">
                    <select 
                      required
                      value={formData.classId}
                      onChange={(e) => setFormData({...formData, classId: e.target.value})}
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold text-slate-700 appearance-none cursor-pointer focus:ring-4 focus:ring-purple-500/10 transition-all"
                    >
                      <option value="">Selecione a turma...</option>
                      {manageableClasses.map(c => <option key={c.id} value={c.id}>{c.name} — {c.grade}</option>)}
                    </select>
                    <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 pointer-events-none" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Data de Início</label>
                    <input 
                      required
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold text-slate-700 focus:ring-4 focus:ring-purple-500/10 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Previsão de Saída</label>
                    <input 
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold text-slate-700 focus:ring-4 focus:ring-purple-500/10 transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Anotações Pedagógicas</label>
                  <textarea 
                    rows={3}
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    placeholder="Foco do apoio, dificuldades observadas..."
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold text-slate-700 focus:ring-4 focus:ring-purple-500/10 resize-none transition-all"
                  />
                </div>

                <div className="pt-4 flex gap-4">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 text-slate-400 font-black hover:bg-slate-50 rounded-2xl transition-all uppercase text-[10px] tracking-widest">Cancelar</button>
                  <button disabled={loading} type="submit" className="flex-1 bg-[#9D4EDD] text-white font-black py-4 rounded-2xl hover:bg-[#8B31D8] transition-all shadow-xl shadow-purple-100 flex items-center justify-center gap-2 disabled:opacity-50 uppercase text-[10px] tracking-widest">
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><CheckCircle2 className="w-5 h-5" /> Confirmar</>}
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

export default RemedialManager;
