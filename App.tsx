

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


import { SignedIn, SignedOut, useUser, useAuth, useClerk } from '@clerk/clerk-react';

const App: React.FC = () => {
  const { isLoaded, isSignedIn, user } = useUser();
  const { signOut } = useClerk();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [currentPage, setCurrentPage] = useState<string>('dashboard');
  const [navigationParams, setNavigationParams] = useState<any>(null);

  useEffect(() => {
    if (isLoaded && isSignedIn && user) {
      fetchProfile(user.id, user.primaryEmailAddress?.emailAddress);
    } else if (isLoaded && !isSignedIn) {
      setLoadingProfile(false);
      setProfile(null);
    }
  }, [isLoaded, isSignedIn, user]);

  const handleNavigate = (page: string, params?: any) => {
    setCurrentPage(page);
    setNavigationParams(params);
  };

  const fetchProfile = async (clerkId: string, email?: string) => {
    try {
      setLoadingProfile(true);
      // Try to fetch by clerkId first, then fallback to email for migration
      let { data, error } = await supabase
        .from('users_profile')
        .select('*')
        .eq('id', clerkId)
        .single();

      if (error && email) {
        // Fallback: fetch by email if clerkId not found (first time login after migration)
        const { data: emailData, error: emailError } = await supabase
          .from('users_profile')
          .select('*')
          .eq('email', email)
          .single();

        if (!emailError && emailData) {
          data = emailData;
          // Optionally update the ID in the database to the Clerk ID
          await supabase.from('users_profile').update({ id: clerkId }).eq('id', emailData.id);
        }
      }

      if (data) {
        setProfile(data);
        // Navigate based on role
        if (data.perfil === UserRole.CONSULTOR) handleNavigate('dashboard_consultor');
        else if (data.perfil === UserRole.COORDENADOR) handleNavigate('dashboard_coordenador');
        else if (data.perfil === UserRole.ADMIN) handleNavigate('admin_master');
      }

    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoadingProfile(false);
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

  if (!isLoaded || (isSignedIn && loadingProfile)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <>
      <SignedOut>
        <Login />
      </SignedOut>
      <SignedIn>
        <Layout
          activeRole={profile?.perfil || UserRole.CONSULTOR}
          onNavigate={handleNavigate}
          currentPage={currentPage}
          userName={profile?.nome}
          hideSearch={['analise_coordenador', 'analise_diretor', 'visualizar_solicitacao'].includes(currentPage)}
        >
          {renderContent()}
        </Layout>
      </SignedIn>
    </>
  );
};



export default App;

