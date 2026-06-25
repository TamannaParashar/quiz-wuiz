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
          card: 'bg-slate-950 border border-slate-800 shadow-2xl shadow-black/60 w-full !max-w-lg !rounded-2xl !p-10',
          rootBox: 'w-full flex justify-center items-center',
          headerTitle: 'text-3xl font-bold text-white',
          headerSubtitle: 'text-slate-400 text-base',
          dividerText: 'text-slate-500',
          formFieldLabel: 'text-slate-300 text-sm font-medium',
          formFieldInput: '!text-base !py-3',
          formButtonPrimary: 'bg-emerald-500 hover:bg-emerald-600 text-white font-semibold !text-base !py-3 !rounded-xl',
          socialButtonsBlockButton: 'border-slate-700 bg-slate-900 hover:bg-slate-800 !py-3',
          identityPreviewText: 'text-slate-300',
          modalContent: 'flex items-center justify-center min-h-screen',
          modalCloseButton: 'text-slate-400 hover:text-white',
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
