

import React, { useState, useEffect } from 'react';
import { UserRole, UserProfile } from './types';
import Layout from './components/Layout';
import Login from './pages/Login';
import ConsultorDashboard from './pages/ConsultorDashboard';
import NovaSolicitacao from './pages/NovaSolicitacao';
import VisualizarSolicitacao from './pages/VisualizarSolicitacao';
import CoordenadorDashboard from './pages/CoordenadorDashboard';
import AnaliseCoordenador from './pages/AnaliseCoordenador';
import AnaliseDiretor from './pages/AnaliseDiretor';
import AdminDashboard from './pages/AdminDashboard';
import AdminCoringa from './pages/AdminCoringa';
import GerenciarCursos from './pages/GerenciarCursos';
import GerenciarUsuarios from './pages/GerenciarUsuarios';
import HistoricoCoordenador from './pages/HistoricoCoordenador';
import { supabase } from './supabase';


const App: React.FC = () => {
  const [session, setSession] = useState<any>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState<string>('dashboard');
  const [navigationParams, setNavigationParams] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchProfile(session.user.id);
      else setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) fetchProfile(session.user.id);
      else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleNavigate = (page: string, params?: any) => {
    setCurrentPage(page);
    setNavigationParams(params);
  };

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('users_profile')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      setProfile(data);

      // Navigate to correct dashboard based on role
      if (data.perfil === UserRole.CONSULTOR) handleNavigate('dashboard_consultor');
      else if (data.perfil === UserRole.COORDENADOR) handleNavigate('dashboard_coordenador');
      else if (data.perfil === UserRole.ADMIN) handleNavigate('admin_master');

    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderContent = () => {
    if (!profile) return <div className="p-20 text-center">Carregando perfil...</div>;

    switch (currentPage) {
      // Consultor Screens
      case 'dashboard_consultor':
        return <ConsultorDashboard onNavigate={handleNavigate} view="dashboard" />;
      case 'solicitacoes':
        return <ConsultorDashboard onNavigate={handleNavigate} view="list" />;
      case 'nova_solicitacao':
        return <NovaSolicitacao onBack={() => handleNavigate('dashboard_consultor')} />;
      case 'visualizar_solicitacao':
        return <VisualizarSolicitacao onBack={() => handleNavigate('dashboard_consultor')} solicitationId={navigationParams?.solicitacaoId} />;

      // Coordenador Screens
      case 'dashboard_coordenador':
        return <CoordenadorDashboard onNavigate={handleNavigate} />;
      case 'analise_coordenador':
        return <AnaliseCoordenador onBack={() => handleNavigate('dashboard_coordenador')} solicitationId={navigationParams?.solicitacaoId} />;
      case 'historico':
        return <HistoricoCoordenador onNavigate={handleNavigate} />;

      // Admin Screens
      case 'dashboard_admin':
        return <AdminDashboard onNavigate={handleNavigate} />;
      case 'analise_diretor':
        return <AnaliseDiretor onBack={() => handleNavigate('dashboard_admin')} solicitationId={navigationParams?.solicitacaoId} />;
      case 'admin_master':
        return <AdminCoringa onNavigate={handleNavigate} />;
      case 'gerenciar_cursos':
        return <GerenciarCursos />;
      case 'gerenciar_usuarios':
        return <GerenciarUsuarios />;

      default:
        return <div className="p-20 text-center font-bold text-gray-400">Módulo em Desenvolvimento</div>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!session) {
    return <Login />;
  }

  return (
    <Layout
      activeRole={profile?.perfil || UserRole.CONSULTOR}
      onNavigate={handleNavigate}
      currentPage={currentPage}
      userName={profile?.nome}
      hideSearch={['analise_coordenador', 'analise_diretor', 'visualizar_solicitacao'].includes(currentPage)}
    >
      {renderContent()}
    </Layout>
  );
};



export default App;

