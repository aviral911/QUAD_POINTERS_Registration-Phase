'use client'

import { FormEvent, useState } from 'react'
import { ArrowLeft, ArrowRight, Check, Eye, EyeOff, LockKeyhole, Mail, Sparkles } from 'lucide-react'
import { supabase } from '@/lib/supabase-browser'

export default function AuthPage() {
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null)

  function switchMode(nextMode: 'login' | 'signup') {
    setMode(nextMode)
    setMessage(null)
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setMessage(null)
    setLoading(true)

    if (mode === 'signup') {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          data: { full_name: fullName.trim() },
          emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || window.location.origin,
        },
      })

      if (error) {
        setMessage({ type: 'error', text: error.message })
      } else if (data.session) {
        window.location.href = '/'
      } else {
        setMessage({ type: 'success', text: 'Account created. Check your email to confirm your address.' })
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      })

      if (error) {
        setMessage({ type: 'error', text: 'That email and password combination was not recognized.' })
      } else {
        window.location.href = '/'
      }
    }

    setLoading(false)
  }

  return (
    <main className="min-h-screen bg-[#f7f8fc] text-slate-950">
      <div className="mx-auto grid min-h-screen max-w-7xl lg:grid-cols-[1.05fr_.95fr]">
        <section className="relative hidden overflow-hidden bg-slate-950 px-10 py-12 text-white lg:flex lg:flex-col lg:justify-between lg:px-16">
          <div className="absolute -left-24 top-20 size-80 rounded-full bg-indigo-600/40 blur-3xl" />
          <div className="absolute -right-24 bottom-20 size-96 rounded-full bg-cyan-400/20 blur-3xl" />
          <a href="/" className="relative flex items-center gap-2.5 text-lg font-semibold tracking-tight"><span className="grid size-9 place-items-center rounded-xl bg-white text-slate-950"><Sparkles className="size-4" /></span>forge<span className="text-cyan-300">/</span>events</a>
          <div className="relative max-w-lg">
            <p className="mb-5 text-sm font-semibold uppercase tracking-[.18em] text-cyan-300">Build what comes next</p>
            <h1 className="text-5xl font-semibold leading-[1.04] tracking-[-.055em]">Your next great build starts here.</h1>
            <p className="mt-6 max-w-md text-lg leading-8 text-slate-400">Join a community of curious builders shipping ideas that matter.</p>
            <div className="mt-10 flex items-center gap-3 text-sm text-slate-300"><span className="grid size-8 place-items-center rounded-full bg-white/10 text-cyan-300"><Check className="size-4" /></span>Access your applications and updates</div>
          </div>
          <p className="relative text-xs text-slate-500">The room is better with you in it.</p>
        </section>

        <section className="flex flex-col px-5 py-6 sm:px-10 lg:px-16 lg:py-12">
          <div className="flex items-center justify-between"><a href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-slate-950"><ArrowLeft className="size-4" />Back to home</a><span className="text-xs font-semibold uppercase tracking-[.16em] text-indigo-600">forge/events</span></div>
          <div className="m-auto w-full max-w-md py-12">
            <div className="mb-8"><p className="text-sm font-semibold uppercase tracking-[.16em] text-indigo-600">Member access</p><h2 className="mt-3 text-4xl font-semibold tracking-tight">{mode === 'login' ? 'Welcome back.' : 'Create your account.'}</h2><p className="mt-3 text-sm leading-6 text-slate-500">{mode === 'login' ? 'Sign in to keep building where you left off.' : 'Save your profile and keep track of every application.'}</p></div>
            <div className="mb-7 grid grid-cols-2 rounded-xl bg-slate-100 p-1"><button type="button" onClick={() => switchMode('login')} className={`rounded-lg px-4 py-2.5 text-sm font-semibold transition ${mode === 'login' ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-500'}`}>Sign in</button><button type="button" onClick={() => switchMode('signup')} className={`rounded-lg px-4 py-2.5 text-sm font-semibold transition ${mode === 'signup' ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-500'}`}>Create account</button></div>
            <form onSubmit={handleSubmit} className="space-y-5">
              {mode === 'signup' && <label className="block text-sm font-medium text-slate-700">Full name<input required minLength={2} value={fullName} onChange={event => setFullName(event.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100" placeholder="Alex Morgan" /></label>}
              <label className="block text-sm font-medium text-slate-700"><span className="flex items-center gap-2"><Mail className="size-4 text-slate-400" />Email address</span><input required type="email" value={email} onChange={event => setEmail(event.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100" placeholder="you@example.com" /></label>
              <label className="block text-sm font-medium text-slate-700"><span className="flex items-center gap-2"><LockKeyhole className="size-4 text-slate-400" />Password</span><span className="relative mt-2 block"><input required minLength={6} type={showPassword ? 'text' : 'password'} value={password} onChange={event => setPassword(event.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 pr-12 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100" placeholder="At least 6 characters" /><button type="button" aria-label={showPassword ? 'Hide password' : 'Show password'} onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700">{showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}</button></span></label>
              {message && <div role={message.type === 'error' ? 'alert' : 'status'} className={`rounded-xl px-4 py-3 text-sm ${message.type === 'error' ? 'bg-rose-50 text-rose-700' : 'bg-emerald-50 text-emerald-700'}`}>{message.text}</div>}
              <button disabled={loading} className="w-full rounded-xl bg-slate-950 px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-slate-200 transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60">{loading ? 'Please wait...' : mode === 'login' ? 'Sign in' : 'Create account'}<ArrowRight className="ml-2 inline size-4" /></button>
            </form>
            <p className="mt-8 text-center text-xs leading-5 text-slate-400">By continuing, you agree to use forge/events responsibly and keep your account secure.</p>
          </div>
        </section>
      </div>
    </main>
  )
}
