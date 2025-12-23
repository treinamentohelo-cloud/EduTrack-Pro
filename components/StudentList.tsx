
import React, { useState, useRef } from 'react';
import { Student, User, UserRole, ReadingLevel, Class } from '../types';
import { Search, Plus, Trash2, UserCheck, X, Camera, ChevronDown, Upload, Loader2, Edit2, Image as ImageIcon } from 'lucide-react';

interface StudentListProps {
  user: User;
  students: Student[];
  classes: Class[];
  onSelectStudent: (id: string) => void;
  onAddStudent: (studentData: any) => Promise<boolean>;
  onUpdateStudent: (id: string, studentData: any) => Promise<boolean>;
  onDeleteStudent: (id: string) => void;
}

const StudentList: React.FC<StudentListProps> = ({ user, students, classes, onSelectStudent, onAddStudent, onUpdateStudent, onDeleteStudent }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    photoUrl: '',
    classId: '',
    readingLevel: ReadingLevel.PRE_SYLLABIC
  });

  const availableClasses = classes.filter(c => 
    user.role === UserRole.MANAGER || user.role === UserRole.COORDINATOR || c.teacherId === user.id
  );

  const openAddModal = () => {
    setEditingStudent(null);
    setFormData({
      name: '',
      photoUrl: '',
      classId: availableClasses.length > 0 ? availableClasses[0].id : '',
      readingLevel: ReadingLevel.PRE_SYLLABIC
    });
    setIsModalOpen(true);
  };

  const openEditModal = (student: Student) => {
    setEditingStudent(student);
    setFormData({
      name: student.name || '',
      photoUrl: student.photoUrl || '',
      classId: student.classId || '',
      readingLevel: student.currentReadingLevel || ReadingLevel.PRE_SYLLABIC
    });
    setIsModalOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 300 * 1024) {
        alert("A imagem deve ter no máximo 300KB para garantir a performance do banco.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, photoUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const filteredStudents = students.filter(student => {
    const classInfo = classes.find(c => c.id === student.classId);
    if (user.role === UserRole.TEACHER && classInfo?.teacherId !== user.id) return false;
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClass = selectedClass === 'all' || student.classId === selectedClass;
    return matchesSearch && matchesClass;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.classId) {
      alert("Preencha o nome e a turma do aluno.");
      return;
    }

    setIsSubmitting(true);
    try {
      const success = editingStudent 
        ? await onUpdateStudent(editingStudent.id, formData) 
        : await onAddStudent(formData);
      
      if (success) {
        setIsModalOpen(false);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight uppercase">Base de Alunos</h2>
          <p className="text-slate-500 font-medium text-sm">Registro e acompanhamento institucional.</p>
        </div>
        <button 
          onClick={openAddModal}
          className="bg-indigo-600 text-white px-8 py-3.5 rounded-2xl font-black hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 flex items-center gap-2 active:scale-95"
        >
          <Plus className="w-5 h-5" /> CADASTRAR ALUNO
        </button>
      </div>

      <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Pesquisar por nome do aluno..."
            className="w-full pl-12 pr-4 py-4 border border-slate-100 rounded-2xl bg-slate-50/50 font-bold outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="relative">
          <select 
            className="bg-slate-50/50 border border-slate-100 pl-6 pr-10 py-4 rounded-2xl text-sm font-black text-slate-600 outline-none appearance-none cursor-pointer"
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
          >
            <option value="all">Todas as Turmas</option>
            {availableClasses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Estudante</th>
                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Turma</th>
                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.map((student) => (
                <tr key={student.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-10 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl overflow-hidden border-2 border-white shadow-sm bg-slate-100 flex items-center justify-center">
                        {student.photoUrl ? (
                          <img src={student.photoUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="text-indigo-500 font-black">{student.name.charAt(0)}</div>
                        )}
                      </div>
                      <span className="font-bold text-slate-700">{student.name}</span>
                    </div>
                  </td>
                  <td className="px-10 py-5">
                    <span className="text-sm font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-lg">
                      {classes.find(c => c.id === student.classId)?.name || 'Sem vínculo'}
                    </span>
                  </td>
                  <td className="px-10 py-5">
                    <div className="flex justify-center gap-2">
                      <button onClick={() => onSelectStudent(student.id)} className="p-3 text-indigo-600 hover:bg-indigo-50 rounded-2xl transition-all" title="Avaliar"><UserCheck className="w-5 h-5" /></button>
                      <button onClick={() => openEditModal(student)} className="p-3 text-amber-600 hover:bg-amber-50 rounded-2xl transition-all" title="Editar"><Edit2 className="w-5 h-5" /></button>
                      <button onClick={() => onDeleteStudent(student.id)} className="p-3 text-rose-500 hover:bg-rose-50 rounded-2xl transition-all" title="Excluir"><Trash2 className="w-5 h-5" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredStudents.length === 0 && (
            <div className="p-20 text-center">
               <ImageIcon className="w-16 h-16 text-slate-200 mx-auto mb-4" />
               <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Nenhum aluno encontrado.</p>
            </div>
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-300 overflow-hidden">
            <div className="bg-slate-900 p-8 text-white flex justify-between items-center">
               <h3 className="text-2xl font-black uppercase tracking-tight">{editingStudent ? 'Atualizar Aluno' : 'Novo Aluno'}</h3>
               <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X className="w-8 h-8" /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="flex flex-col items-center gap-4">
                <div className="relative">
                  <div className="w-28 h-28 rounded-[2rem] bg-slate-100 border-4 border-slate-50 overflow-hidden flex items-center justify-center shadow-inner">
                    {formData.photoUrl ? (
                      <img src={formData.photoUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <Camera className="w-10 h-10 text-slate-300" />
                    )}
                  </div>
                  <button 
                    type="button" 
                    disabled={isSubmitting}
                    onClick={() => fileInputRef.current?.click()} 
                    className="absolute -bottom-2 -right-2 bg-indigo-600 text-white p-2.5 rounded-xl shadow-xl hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-50"
                  >
                    <Upload className="w-4 h-4" />
                  </button>
                  <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                </div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Foto do Aluno (Max 300KB)</p>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nome Completo</label>
                <input 
                  required 
                  type="text" 
                  value={formData.name} 
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))} 
                  className="w-full px-6 py-4 bg-slate-50 rounded-2xl border border-slate-200 font-bold text-slate-700 outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all" 
                  placeholder="Nome completo do aluno"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Turma Vinculada</label>
                <select 
                  required 
                  value={formData.classId} 
                  onChange={(e) => setFormData(prev => ({ ...prev, classId: e.target.value }))} 
                  className="w-full px-6 py-4 bg-slate-50 rounded-2xl border border-slate-200 font-bold text-slate-700 outline-none appearance-none cursor-pointer"
                >
                  <option value="">Selecione uma turma...</option>
                  {availableClasses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>

              <div className="pt-6 flex gap-4">
                <button 
                  type="button" 
                  disabled={isSubmitting}
                  onClick={() => setIsModalOpen(false)} 
                  className="flex-1 py-4 text-slate-400 font-black uppercase text-[10px] tracking-widest hover:bg-slate-50 rounded-2xl transition-all disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button 
                  disabled={isSubmitting} 
                  type="submit" 
                  className="flex-1 bg-indigo-600 text-white font-black py-4 rounded-2xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <><ImageIcon className="w-5 h-5" /> SALVAR</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentList;
