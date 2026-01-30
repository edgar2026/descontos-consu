
import React, { useState } from 'react';
import { UserRole } from '../types';
import { supabase } from '../supabase';

interface LayoutProps {
  children: React.ReactNode;
  activeRole: UserRole;
  onNavigate: (page: string) => void;
  currentPage: string;
  userName?: string;
  hideSearch?: boolean;
}

import { useClerk } from '@clerk/clerk-react';

const Layout: React.FC<LayoutProps> = ({ children, activeRole, onNavigate, currentPage, userName, hideSearch }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { signOut } = useClerk();

  const menuItems = {
    [UserRole.CONSULTOR]: [
      { id: 'dashboard_consultor', label: 'Dashboard', icon: 'dashboard' },
      { id: 'solicitacoes', label: 'Minhas Solicitações', icon: 'description' },
    ],
    [UserRole.COORDENADOR]: [
      { id: 'dashboard_coordenador', label: 'Análise de Pedidos', icon: 'fact_check' },
      { id: 'historico', label: 'Histórico', icon: 'history' },
    ],
    [UserRole.ADMIN]: [
      { id: 'admin_master', label: 'Gerenciamento Master', icon: 'settings_suggest' },
      { id: 'dashboard_admin', label: 'Visão Geral', icon: 'analytics' },
    ],
  };

  const handleLogout = async () => {
    await signOut();
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <aside className={`${isSidebarOpen ? 'w-64' : 'w-20'} bg-white border-r border-gray-200 transition-all duration-300 flex flex-col z-20 no-print`}>
        <div className="p-6 flex items-center gap-3 border-b border-gray-100">
          <div className="bg-primary-500 rounded-lg p-2 text-white shrink-0">
            <span className="material-symbols-outlined">school</span>
          </div>
          {isSidebarOpen && (
            <div className="overflow-hidden">
              <h1 className="font-bold text-gray-900 truncate">EduPortal</h1>
              <p className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">Gestão de Descontos</p>
            </div>
          )}
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {menuItems[activeRole]?.map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${currentPage === item.id
                ? 'bg-primary-50 text-primary-600 font-semibold'
                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                }`}
            >
              <span className="material-symbols-outlined">{item.icon}</span>
              {isSidebarOpen && <span className="text-sm">{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-100">
          <div className={`flex items-center gap-3 p-2 rounded-xl bg-gray-50 overflow-hidden`}>
            <div className="size-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold shrink-0">
              {userName ? userName[0].toUpperCase() : activeRole[0]}
            </div>
            {isSidebarOpen && (
              <div className="flex flex-col min-w-0">

                <p className="text-xs font-bold text-gray-900 truncate">
                  {userName ? (userName.includes('@') ? userName.split('@')[0] : userName) : 'Usuário'}
                </p>
                <p className="text-[10px] text-gray-500 uppercase font-black">{activeRole}</p>
              </div>
            )}
          </div>
          <button
            onClick={handleLogout}
            className="w-full mt-4 flex items-center gap-3 px-3 py-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
          >
            <span className="material-symbols-outlined">logout</span>
            {isSidebarOpen && <span className="text-sm font-semibold">Sair</span>}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 sticky top-0 z-10 no-print">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-1 hover:bg-gray-100 rounded-md text-gray-500 lg:hidden"
            >
              <span className="material-symbols-outlined">menu</span>
            </button>
            {!hideSearch && (
              <div className="relative max-w-md hidden sm:block">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xl">search</span>
                <input
                  type="text"
                  placeholder="Pesquisar..."
                  className="w-full pl-10 pr-4 py-1.5 bg-gray-100 border-none rounded-lg text-sm focus:ring-2 focus:ring-primary-500/50"
                />
              </div>
            )}
          </div>

          <div className="flex items-center gap-6">
            <button className="relative text-gray-500 hover:text-gray-900">
              <span className="material-symbols-outlined">notifications</span>
              <span className="absolute top-0 right-0 size-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="flex items-center gap-2">
              <div className="size-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                <span className="material-symbols-outlined text-xl">account_circle</span>
              </div>
              <span className="text-sm font-bold text-gray-700 hidden sm:block">
                {userName ? (userName.includes('@') ? userName.split('@')[0] : userName) : ''}
              </span>
            </div>
          </div>
        </header>

        {/* Content Viewport */}
        <main className="flex-1 overflow-y-auto p-8">
          {children}

          <footer className="mt-12 py-8 border-t border-gray-100 text-center no-print">
            <p className="text-sm text-gray-400">
              © 2025 UNINASSAU. Todos os direitos reservados.
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Desenvolvido por <span className="font-bold text-gray-500">Edgar Tavares</span>.
            </p>
          </footer>
        </main>
      </div>
    </div>
  );
};


export default Layout;
