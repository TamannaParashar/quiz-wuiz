import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ClerkProvider } from '@clerk/clerk-react'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if (!PUBLISHABLE_KEY) {
  throw new Error('Missing Publishable Key')
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ClerkProvider
      publishableKey={PUBLISHABLE_KEY}
      appearance={{
        layout: {
          socialButtonsPlacement: 'bottom',
          socialButtonsVariant: 'iconButton',
        },
        variables: {
          colorPrimary: '#10b981',
          colorBackground: '#020617',
          colorInputBackground: '#0f172a',
          colorInputText: '#f8fafc',
          colorText: '#f8fafc',
          colorTextSecondary: '#94a3b8',
        },
        elements: {
          logoBox: 'hidden',
          footer: 'hidden',
          card: 'bg-slate-950 border border-slate-800 shadow-xl',
          headerTitle: 'text-2xl font-bold text-white',
          headerSubtitle: 'text-slate-400',
          dividerText: 'text-slate-500',
          formFieldLabel: 'text-slate-300',
          formButtonPrimary: 'bg-emerald-500 hover:bg-emerald-600 text-white font-medium',
          socialButtonsBlockButton: 'border-slate-700 bg-slate-900 hover:bg-slate-800',
          identityPreviewText: 'text-slate-300',
        }
      }}
      localization={{
        signIn: {
          start: {
            title: 'Welcome Back',
            subtitle: 'Sign in to Quiz-Wuiz',
            actionText: 'New to Quiz-Wuiz?',
            actionLink: 'Sign up'
          }
        },
        signUp: {
          start: {
            title: 'Create an Account',
            subtitle: 'Sign up to Quiz-Wuiz',
            actionText: 'Already have an account?',
            actionLink: 'Sign in'
          }
        }
      }}
    >
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ClerkProvider>
  </StrictMode>,
)
