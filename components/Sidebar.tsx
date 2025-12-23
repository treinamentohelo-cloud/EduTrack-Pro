
import React from 'react';
import { UserRole } from '../types';
import { 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  Calculator, 
  BarChart3, 
  Settings,
  GraduationCap,
  School,
  Activity
} from 'lucide-react';

interface SidebarProps {
  role: UserRole;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ role, activeTab, onTabChange }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: [UserRole.MANAGER, UserRole.COORDINATOR, UserRole.TEACHER] },
    { id: 'students', label: 'Alunos', icon: GraduationCap, roles: [UserRole.MANAGER, UserRole.COORDINATOR, UserRole.TEACHER] },
    { id: 'remedial', label: 'Reforço', icon: Activity, roles: [UserRole.MANAGER, UserRole.COORDINATOR, UserRole.TEACHER] },
    { id: 'classes', label: 'Turmas', icon: School, roles: [UserRole.MANAGER, UserRole.COORDINATOR] },
    { id: 'users', label: 'Equipe', icon: Users, roles: [UserRole.MANAGER] },
    { id: 'reports', label: 'Relatórios', icon: BarChart3, roles: [UserRole.MANAGER, UserRole.COORDINATOR] },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col hidden lg:flex border-r border-slate-800 h-screen sticky top-0">
      <div className="p-8 flex items-center gap-3">
        <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
          <GraduationCap className="text-white w-6 h-6" />
        </div>
        <div>
          <span className="font-bold text-white text-xl tracking-tight">EduTrack</span>
          <span className="block text-[10px] text-indigo-400 font-bold uppercase tracking-tighter -mt-1">PRO EDITION</span>
        </div>
      </div>

      <nav className="flex-1 px-4 py-2 space-y-1">
        <p className="px-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Menu Principal</p>
        {menuItems
          .filter(item => item.roles.includes(role))
          .map((item) => (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                activeTab === item.id 
                  ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/20 translate-x-1' 
                  : 'hover:bg-slate-800/50 hover:text-white'
              }`}
            >
              <item.icon className={`w-5 h-5 ${activeTab === item.id ? 'text-white' : 'text-slate-500'}`} />
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
      </nav>

      <div className="p-6 border-t border-slate-800/50">
        <div className="bg-slate-800/40 rounded-2xl p-4 border border-slate-800">
          <p className="text-[10px] text-slate-500 uppercase font-bold mb-2">Suporte</p>
          <button className="w-full bg-slate-700 hover:bg-slate-600 py-2 rounded-lg text-xs font-bold transition-colors">
            Central de Ajuda
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
