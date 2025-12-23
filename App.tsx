
import React, { useState, useEffect } from 'react';
import { User, UserRole, Student, Class, ReadingLevel, RemedialEnrollment, PerformanceLevel } from './types';
import { supabase } from './lib/supabase';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import StudentList from './components/StudentList';
import AssessmentForm from './components/AssessmentForm';
import Reports from './components/Reports';
import Login from './components/Login';
import ClassManager from './components/ClassManager';
import UserManager from './components/UserManager';
import RemedialManager from './components/RemedialManager';
import { LogOut, Loader2, GraduationCap } from 'lucide-react';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [remedialEnrollments, setRemedialEnrollments] = useState<RemedialEnrollment[]>([]);

  const fetchUserProfile = async (userId: string, email: string) => {
    try {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
      
      if (profileError) throw profileError;
      
      if (profile) {
        return {
          ...profile,
          role: profile.role || UserRole.TEACHER
        } as User;
      }

      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (authUser) {
        const nameFallback = authUser.user_metadata?.full_name || 'Usuário EduTrack';
        const roleFallback = (authUser.user_metadata?.role as UserRole) || UserRole.TEACHER;
        const fallbackProfile: User = { 
          id: authUser.id, 
          name: nameFallback, 
          email: authUser.email || email, 
          role: roleFallback 
        };
        await supabase.from('profiles').upsert([fallbackProfile]);
        return fallbackProfile;
      }
      return null;
    } catch (e) {
      console.error("Erro ao carregar perfil:", e);
      return null;
    }
  };

  const initializeAuth = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const profile = await fetchUserProfile(session.user.id, session.user.email || '');
        if (profile) setCurrentUser(profile);
      }
    } catch (e) {
      console.error("Falha na inicialização da autenticação.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    initializeAuth();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const profile = await fetchUserProfile(session.user.id, session.user.email || '');
        if (profile) setCurrentUser(profile);
      } else if (event === 'SIGNED_OUT') {
        setCurrentUser(null);
        setActiveTab('dashboard');
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (currentUser) fetchData();
  }, [currentUser]);

  const fetchData = async () => {
    try {
      const [stdRes, clsRes, usrRes, remRes] = await Promise.all([
        supabase.from('students').select('*').order('name'),
        supabase.from('classes').select('*').order('name'),
        supabase.from('profiles').select('*').order('name'),
        supabase.from('remedial_enrollments').select('*').order('start_date', { ascending: false })
      ]);

      if (stdRes.data) {
        setStudents(stdRes.data.map((s: any) => ({
          id: s.id,
          name: s.name,
          classId: s.class_id,
          currentReadingLevel: s.current_reading_level as ReadingLevel,
          mathScore: s.math_score || 0,
          readingPerformance: s.reading_performance as PerformanceLevel,
          mathPerformance: s.math_performance as PerformanceLevel,
          photoUrl: s.photo_url
        })));
      }
      if (clsRes.data) setClasses(clsRes.data.map((c: any) => ({ id: c.id, name: c.name, grade: c.grade, teacherId: c.teacher_id })));
      if (usrRes.data) setUsers(usrRes.data);
      if (remRes.data) setRemedialEnrollments(remRes.data.map((r: any) => ({ id: r.id, studentId: r.student_id, classId: r.class_id, startDate: r.start_date, endDate: r.end_date, notes: r.notes })));
    } catch (e) {
      console.error("Erro ao sincronizar dados:", e);
    }
  };

  const addStudent = async (studentData: any) => {
    try {
      const { error } = await supabase.from('students').insert([{
        name: studentData.name,
        class_id: studentData.classId,
        current_reading_level: studentData.readingLevel || ReadingLevel.PRE_SYLLABIC,
        reading_performance: PerformanceLevel.BASIC,
        math_performance: PerformanceLevel.BASIC,
        math_score: 0,
        photo_url: studentData.photoUrl 
      }]);
      if (error) throw error;
      await fetchData();
      return true;
    } catch (e: any) {
      alert("Falha ao salvar aluno no banco: " + e.message);
      return false;
    }
  };

  const updateStudent = async (id: string, studentData: any) => {
    try {
      const { error } = await supabase.from('students').update({
        name: studentData.name,
        class_id: studentData.classId,
        current_reading_level: studentData.readingLevel,
        photo_url: studentData.photoUrl
      }).eq('id', id);
      if (error) throw error;
      await fetchData();
      return true;
    } catch (e: any) {
      alert("Erro ao atualizar dados: " + e.message);
      return false;
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
    </div>
  );

  if (!currentUser) return <Login />;

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar role={currentUser?.role || UserRole.TEACHER} activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="flex-1 overflow-auto">
        <header className="bg-white border-b border-slate-200 px-8 py-4 flex justify-between items-center sticky top-0 z-10 shadow-sm print:hidden">
          <div className="flex items-center gap-4">
             <div className="lg:hidden w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
                <GraduationCap className="w-5 h-5" />
             </div>
             <div>
                <h1 className="text-xl font-bold text-slate-800">EduTrack Pro</h1>
                <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">
                  {currentUser?.role || 'Acesso Restrito'} — Portal Institucional
                </p>
             </div>
          </div>
          <button onClick={async () => { await supabase.auth.signOut(); setCurrentUser(null); }} className="p-2 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-xl transition-all group">
            <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform" />
          </button>
        </header>

        <div className="p-8 max-w-7xl mx-auto">
          {activeTab === 'dashboard' && <Dashboard user={currentUser!} students={students} classes={classes} onNavigate={setActiveTab} />}
          {activeTab === 'students' && (
            <StudentList 
              user={currentUser!} students={students} classes={classes}
              onSelectStudent={(id) => { setSelectedStudentId(id); setActiveTab('assessment'); }}
              onAddStudent={addStudent} 
              onUpdateStudent={updateStudent}
              onDeleteStudent={async (id) => {
                if (!confirm("Excluir permanentemente este aluno?")) return;
                const { error } = await supabase.from('students').delete().eq('id', id);
                if (!error) fetchData();
              }}
            />
          )}
          {activeTab === 'remedial' && <RemedialManager user={currentUser!} students={students} classes={classes} enrollments={remedialEnrollments} setEnrollments={setRemedialEnrollments} />}
          {activeTab === 'classes' && <ClassManager classes={classes} users={users} setClasses={setClasses} onUpdateClass={async (id, data) => {
            const { error } = await supabase.from('classes').update({ name: data.name, grade: data.grade, teacher_id: data.teacherId || null }).eq('id', id);
            if (!error) { await fetchData(); return true; } return false;
          }} onDeleteClass={async (id) => {
            const { error } = await supabase.from('classes').delete().eq('id', id);
            if (!error) await fetchData();
          }} />}
          {activeTab === 'users' && <UserManager currentUserId={currentUser!.id} users={users} setUsers={setUsers} onUpdateUser={async (id, data) => {
             const { error } = await supabase.from('profiles').update({ name: data.name, role: data.role, email: data.email }).eq('id', id);
             if (!error) { await fetchData(); return true; } return false;
          }} onDeleteUser={async (id) => {
             if (!confirm("Remover este colaborador?")) return false;
             const { error } = await supabase.from('profiles').delete().eq('id', id);
             if (!error) { await fetchData(); return true; } return false;
          }} />}
          {activeTab === 'assessment' && (
            <AssessmentForm 
              studentId={selectedStudentId} students={students}
              onSave={async (updated) => { 
                const { error } = await supabase.from('students').update({
                  current_reading_level: updated.currentReadingLevel,
                  math_score: updated.mathScore,
                  reading_performance: updated.readingPerformance,
                  math_performance: updated.mathPerformance
                }).eq('id', updated.id);
                if (!error) { await fetchData(); alert('Avaliação salva!'); setActiveTab('students'); }
              }}
              onBack={() => setActiveTab('students')} 
            />
          )}
          {activeTab === 'reports' && <Reports user={currentUser!} />}
        </div>
      </main>
    </div>
  );
};

export default App;
