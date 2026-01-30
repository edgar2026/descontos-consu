
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ClerkProvider } from '@clerk/clerk-react';

const CLERK_PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!CLERK_PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key");
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ClerkProvider
      publishableKey={CLERK_PUBLISHABLE_KEY}
      localization={{
        signIn: {
          start: {
            title: "Acessar o Sistema",
            subtitle: "Digite seu e-mail para continuar",
            actionText: "Entrar",
            label: "Endereço de e-mail",
            placeholder: "exemplo@uninassau.edu.br"
          }
        },
        userButton: {
          action__signOut: "Sair"
        }
      }}
    >
      <App />
    </ClerkProvider>
  </React.StrictMode>
);
