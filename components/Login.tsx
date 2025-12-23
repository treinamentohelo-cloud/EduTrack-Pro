
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { GraduationCap, ShieldCheck, Mail, Lock, Loader2, UserPlus, CheckCircle2, ArrowLeft, AlertCircle, Circle, XCircle, Check } from 'lucide-react';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('Professor');
  const [isRegistering, setIsRegistering] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Estados de validação em tempo real
  const [isEmailValid, setIsEmailValid] = useState(false);
  const [passwordCriteria, setPasswordCriteria] = useState({
    length: false,
    number: false,
    uppercase: false
  });

  // Efeito para validar e-mail
  useEffect(() => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    setIsEmailValid(emailRegex.test(email));
  }, [email]);

  // Efeito para validar senha
  useEffect(() => {
    setPasswordCriteria({
      length: password.length >= 6,
      number: /\d/.test(password),
      uppercase: /[A-Z]/.test(password)
    });
  }, [password]);

  const isFormValid = !isRegistering || (
    isEmailValid && 
    passwordCriteria.length && 
    passwordCriteria.number && 
    passwordCriteria.uppercase && 
    name.trim().length > 0
  );

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isRegistering && !isFormValid) return;
    
    setLoading(true);
    setErrorMsg(null);

    try {
      if (isRegistering) {
        // Enviamos nome e cargo nos metadados. O App.tsx cuidará da tabela profiles.
        const { data, error } = await supabase.auth.signUp({ 
          email, 
          password,
          options: {
            data: {
              full_name: name,
              role: role
            }
          }
        });
        
        if (error) throw error;
        
        if (data.user) {
          setShowConfirmation(true);
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          if (error.message.includes("Email not confirmed")) {
            throw new Error("Seu e-mail ainda não foi confirmado. Verifique sua caixa de entrada.");
          }
          if (error.message.includes("Invalid login credentials")) {
            throw new Error("E-mail ou senha incorretos. Tente novamente.");
          }
          throw error;
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Ocorreu um erro inesperado.");
    } finally {
      setLoading(false);
    }
  };

  if (showConfirmation) {
    return (
      <div className="min-h-screen bg-indigo-600 flex items-center justify-center p-6">
        <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden p-10 text-center animate-in fade-in zoom-in duration-300">
          <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-12 h-12" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-4">Verifique seu E-mail</h2>
          <p className="text-slate-600 mb-8">
            Enviamos um link de confirmação para <span className="font-bold text-indigo-600">{email}</span>. 
            Por favor, valide sua conta para começar a usar o EduTrack Pro.
          </p>
          <button 
            onClick={() => {
              setShowConfirmation(false);
              setIsRegistering(false);
            }}
            className="w-full bg-slate-100 text-slate-600 font-bold py-4 rounded-xl hover:bg-slate-200 transition-all flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" /> Voltar para o Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-indigo-600 flex items-center justify-center p-6">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
        <div className="p-10">
          <div className="w-16 h-16 bg-indigo-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-6">
            <GraduationCap className="w-10 h-10" />
          </div>
          <h1 className="text-2xl font-bold text-center text-slate-800 mb-2">
            {isRegistering ? 'Criar Conta' : 'EduTrack Pro'}
          </h1>
          <p className="text-center text-slate-500 mb-8 text-sm">
            {isRegistering ? 'Cadastre-se para gerenciar sua escola' : 'Plataforma de Monitoramento Pedagógico'}
          </p>

          {errorMsg && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm flex items-start gap-3 animate-in slide-in-from-top-2">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <p className="font-medium">{errorMsg}</p>
            </div>
          )}

          <form onSubmit={handleAuth} className="space-y-4">
            {isRegistering && (
              <>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Nome Completo</label>
                  <div className="relative">
                    <UserPlus className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                      required
                      type="text" 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all bg-slate-50"
                      placeholder="Seu nome"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Cargo</label>
                  <select 
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-slate-50 font-medium"
                  >
                    <option value="Professor">Professor</option>
                    <option value="Coordenador">Coordenador</option>
                    <option value="Gestor">Gestor</option>
                  </select>
                </div>
              </>
            )}

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">E-mail Corporativo</label>
              <div className="relative">
                <Mail className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${email && !isEmailValid ? 'text-rose-500' : 'text-slate-400'}`} />
                <input 
                  required
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full pl-10 pr-10 py-3 border rounded-xl focus:ring-2 outline-none transition-all bg-slate-50 ${
                    email ? (isEmailValid ? 'border-emerald-200 focus:ring-emerald-500' : 'border-rose-200 focus:ring-rose-500') : 'border-slate-200 focus:ring-indigo-500'
                  }`}
                  placeholder="email@escola.com"
                />
                {email && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {isEmailValid ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <XCircle className="w-4 h-4 text-rose-500" />
                    )}
                  </div>
                )}
              </div>
              {email && !isEmailValid && (
                <p className="text-[10px] text-rose-500 font-bold mt-1 ml-1 animate-in fade-in slide-in-from-top-1">
                  Favor inserir um formato de e-mail válido (ex: nome@escola.com)
                </p>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Senha</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  required
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all bg-slate-50"
                  placeholder="••••••••"
                />
              </div>
              
              {isRegistering && password.length > 0 && (
                <div className="mt-2 space-y-1.5 p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Segurança da Senha:</p>
                  <div className="flex items-center gap-2">
                    {passwordCriteria.length ? <Check className="w-3 h-3 text-emerald-500" /> : <Circle className="w-3 h-3 text-slate-300" />}
                    <span className={`text-[11px] ${passwordCriteria.length ? 'text-emerald-600' : 'text-slate-500'}`}>Mínimo de 6 caracteres</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {passwordCriteria.number ? <Check className="w-3 h-3 text-emerald-500" /> : <Circle className="w-3 h-3 text-slate-300" />}
                    <span className={`text-[11px] ${passwordCriteria.number ? 'text-emerald-600' : 'text-slate-500'}`}>Pelo menos um número</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {passwordCriteria.uppercase ? <Check className="w-3 h-3 text-emerald-500" /> : <Circle className="w-3 h-3 text-slate-300" />}
                    <span className={`text-[11px] ${passwordCriteria.uppercase ? 'text-emerald-600' : 'text-slate-500'}`}>Pelo menos uma letra maiúscula</span>
                  </div>
                </div>
              )}
            </div>

            <button 
              disabled={loading || (isRegistering && !isFormValid)}
              type="submit"
              className={`w-full text-white font-bold py-4 rounded-xl transition-all shadow-xl flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed ${
                isRegistering ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200' : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200'
              }`}
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  {isRegistering ? 'Criar Conta' : 'Acessar Plataforma'}
                  <ShieldCheck className="w-5 h-5 group-hover:scale-110 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center border-t border-slate-100 pt-6">
            <button 
              onClick={() => {
                setIsRegistering(!isRegistering);
                setShowConfirmation(false);
                setErrorMsg(null);
                setPassword('');
                setEmail('');
              }}
              className="text-sm text-indigo-600 font-bold hover:text-indigo-800 transition-colors"
            >
              {isRegistering ? 'Já possui conta? Faça o Login' : 'Ainda não é cadastrado? Comece aqui'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
