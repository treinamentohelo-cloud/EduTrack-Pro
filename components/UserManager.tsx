
import React, { useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { UserPlus, Shield, Mail, Trash2, X, CheckCircle2, Edit2, Lock, Loader2, ChevronDown, AlertTriangle } from 'lucide-react';

interface UserManagerProps {
  currentUserId: string;
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  onUpdateUser: (id: string, data: any) => Promise<boolean>;
  onDeleteUser: (id: string) => Promise<boolean>;
}

const UserManager: React.FC<UserManagerProps> = ({ currentUserId, users, setUsers, onUpdateUser, onDeleteUser }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>(UserRole.TEACHER);
  const [password, setPassword] = useState('');
  
  const [isEmailValid, setIsEmailValid] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    setIsEmailValid(emailRegex.test(email));
  }, [email]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isModalOpen]);

  useEffect(() => {
    if (editingUser) {
      setName(editingUser.name);
      setEmail(editingUser.email);
      setRole(editingUser.role);
      setPassword(''); 
    } else {
      setName('');
      setEmail('');
      setRole(UserRole.TEACHER);
      setPassword('');
    }
  }, [editingUser, isModalOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !isEmailValid) return;

    setLoading(true);
    const userData = { name, email, role, password };

    if (editingUser) {
      const success = await onUpdateUser(editingUser.id, userData);
      if (success) {
        if (password) {
           alert(`Perfil e senha de ${name} redefinidos com sucesso.`);
        }
        closeModal();
      }
    } else {
      // Nota: Em um sistema real, aqui chamaríamos auth.signUp
      alert("A funcionalidade de criação via interface administrativa requer integração com Edge Functions. Use o painel de registro principal por enquanto.");
      closeModal();
    }
    setLoading(false);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
  };

  const openEdit = (user: User) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };

  const handleDelete = async (user: User) => {
    if (user.id === currentUserId) {
      alert("Operação bloqueada: Você não pode remover seu próprio perfil administrador.");
      return;
    }
    
    setLoading(true);
    const success = await onDeleteUser(user.id);
    if (success) {
      // O App.tsx já cuida da atualização do estado 'users'
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight uppercase">Equipe Administrativa</h2>
          <p className="text-slate-500 font-medium text-sm">Gestão de acessos e redefinição de credenciais.</p>
        </div>
        <button 
          onClick={() => { setEditingUser(null); setIsModalOpen(true); }}
          className="w-full sm:w-auto bg-indigo-600 text-white px-8 py-3.5 rounded-2xl font-black hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 flex items-center justify-center gap-2 active:scale-95"
        >
          <UserPlus className="w-5 h-5" /> NOVO COLABORADOR
        </button>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Colaborador</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Perfil</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map(user => (
                <tr key={user.id} className="group hover:bg-slate-50 transition-all">
                  <td className="px-8 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-11 h-11 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-black uppercase shadow-sm group-hover:bg-indigo-600 group-hover:text-white transition-all">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-slate-800">{user.name}</p>
                          {user.id === currentUserId && (
                            <span className="text-[8px] bg-slate-100 text-slate-400 px-1.5 py-0.5 rounded-full font-black uppercase">Você</span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 font-medium">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-4">
                    <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider inline-flex items-center gap-2 ${
                      user.role === UserRole.MANAGER ? 'bg-indigo-100 text-indigo-700' :
                      user.role === UserRole.COORDINATOR ? 'bg-amber-100 text-amber-700' :
                      'bg-emerald-100 text-emerald-700'
                    }`}>
                      <Shield className="w-3 h-3" />
                      {user.role}
                    </span>
                  </td>
                  <td className="px-8 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => openEdit(user)}
                        className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                        title="Editar Perfil"
                      >
                        <Edit2 className="w-5 h-5" />
                      </button>
                      
                      {user.id !== currentUserId ? (
                        <button 
                          onClick={() => handleDelete(user)}
                          disabled={loading}
                          className="p-2.5 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all active:scale-90"
                          title="Remover Colaborador"
                        >
                          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5" />}
                        </button>
                      ) : (
                        <div className="p-2.5 text-slate-200 cursor-not-allowed" title="Não é possível excluir o próprio perfil">
                          <Trash2 className="w-5 h-5 opacity-20" />
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-300 overflow-hidden max-h-[calc(100vh-2rem)] flex flex-col">
            <div className="bg-slate-900 p-8 text-white flex justify-between items-center sticky top-0 z-10">
              <div>
                <h3 className="text-2xl font-black tracking-tight uppercase">
                  {editingUser ? 'Editar Colaborador' : 'Novo Colaborador'}
                </h3>
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1">Configurações de Acesso</p>
              </div>
              <button onClick={closeModal} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                <X className="w-8 h-8" />
              </button>
            </div>

            <div className="overflow-y-auto p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nome Completo</label>
                  <input 
                    autoFocus required type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold text-slate-700 focus:ring-4 focus:ring-indigo-500/10 transition-all"
                    placeholder="Ex: João Silva"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">E-mail de Acesso</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 w-5 h-5" />
                    <input 
                      required type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={`w-full pl-12 pr-6 py-4 border rounded-2xl outline-none transition-all font-bold text-slate-700 bg-slate-50 ${
                        email && !isEmailValid ? 'border-rose-200 focus:ring-rose-500/10' : 'border-slate-200 focus:ring-indigo-500/10'
                      }`}
                      placeholder="email@escola.com"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Perfil Funcional</label>
                  <div className="relative">
                    <select 
                      value={role}
                      onChange={(e) => setRole(e.target.value as UserRole)}
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold text-slate-700 appearance-none cursor-pointer focus:ring-4 focus:ring-indigo-500/10 transition-all"
                    >
                      <option value={UserRole.TEACHER}>Professor(a)</option>
                      <option value={UserRole.COORDINATOR}>Coordenador(a)</option>
                      <option value={UserRole.MANAGER}>Gestor(a)</option>
                    </select>
                    <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 pointer-events-none" />
                  </div>
                </div>

                <div className="p-5 bg-amber-50 rounded-2xl border border-amber-100 space-y-4">
                  <div className="flex items-center gap-2 text-amber-700">
                    <Lock className="w-4 h-4" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Segurança</span>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-amber-600 uppercase tracking-widest ml-1">
                      {editingUser ? 'Redefinir Senha (Opcional)' : 'Senha Inicial'}
                    </label>
                    <input 
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required={!editingUser}
                      className="w-full px-6 py-4 bg-white border border-amber-200 rounded-2xl outline-none font-bold text-slate-700 focus:ring-4 focus:ring-amber-500/10 transition-all"
                      placeholder={editingUser ? "Deixe em branco para manter" : "Mínimo 6 caracteres"}
                    />
                    {editingUser && (
                      <p className="text-[9px] text-amber-500 font-bold italic px-1">
                        * Ao preencher, a senha do usuário será redefinida imediatamente.
                      </p>
                    )}
                  </div>
                </div>

                <div className="pt-4 flex gap-4">
                  <button 
                    type="button"
                    onClick={closeModal}
                    className="flex-1 py-4 text-slate-400 font-black hover:bg-slate-50 rounded-2xl transition-all uppercase text-[10px] tracking-widest"
                  >
                    Descartar
                  </button>
                  <button 
                    disabled={loading || !name || !isEmailValid}
                    type="submit"
                    className="flex-1 bg-indigo-600 text-white font-black py-4 rounded-2xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 flex items-center justify-center gap-2 disabled:opacity-50 uppercase text-[10px] tracking-widest"
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><CheckCircle2 className="w-5 h-5" /> {editingUser ? 'Atualizar' : 'Salvar'}</>}
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

export default UserManager;
