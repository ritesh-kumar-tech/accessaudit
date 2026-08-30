import React, { useState } from 'react';
import {
  ShieldCheck,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  Lock,
  Mail,
  Check,
  ChevronLeft,
  AlertCircle,
} from 'lucide-react';
import { PlanTier, UserAccount } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';

interface AuthPageProps {
  onSuccess: (user: Partial<UserAccount>) => void;
  onBackHome: () => void;
  initialPlan?: PlanTier;
}

export const AuthPage: React.FC<AuthPageProps> = ({
  onSuccess,
  onBackHome,
  initialPlan = 'free',
}) => {
  const [currentStep, setCurrentStep] = useState<'auth' | 'forgot'>('auth');
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('signup');
  const [interestedPlan, setInterestedPlan] = useState<PlanTier>(initialPlan);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [resetEmailSent, setResetEmailSent] = useState(false);

  const planLabels: Record<PlanTier, string> = {
    free: 'Free Evaluation',
    pro: 'Pro Compliance',
    agency: 'Agency White-Label',
  };

  const configWarning = !isSupabaseConfigured ? (
    <div className="mb-4 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 flex items-start gap-2 text-xs text-amber-800 dark:text-amber-300">
      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
      <span>Supabase isn't configured yet, so sign-in is disabled. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY (see .env.example) to enable real accounts.</span>
    </div>
  ) : null;

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!isSupabaseConfigured) {
      setErrorMessage('Sign-in is not configured on this deployment yet.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (authMode === 'login') {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        onSuccess({
          id: data.user?.id,
          email: data.user?.email,
          name: (data.user?.user_metadata?.full_name as string) || data.user?.email,
        });
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: fullName } },
        });
        if (error) throw error;

        if (!data.session) {
          // Email confirmation is required before a session exists.
          setErrorMessage(null);
          setResetEmailSent(false);
          setCurrentStep('auth');
          setErrorMessage('Check your inbox to confirm your email address, then sign in.');
          setAuthMode('login');
          return;
        }

        onSuccess({
          id: data.user?.id,
          email: data.user?.email,
          name: fullName,
          plan: 'free', // billing isn't live yet -- every new signup starts on Free regardless of interestedPlan
        });
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleAuth = async () => {
    setErrorMessage(null);
    if (!isSupabaseConfigured) {
      setErrorMessage('Sign-in is not configured on this deployment yet.');
      return;
    }
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    });
    if (error) setErrorMessage(error.message);
    // On success, Supabase redirects the browser to Google and back; App.tsx's
    // onAuthStateChange listener picks up the resulting session.
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    if (!isSupabaseConfigured) {
      setErrorMessage('Password reset is not configured on this deployment yet.');
      return;
    }
    setIsSubmitting(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin,
      });
      if (error) throw error;
      setResetEmailSent(true);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Could not send reset email.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B1120] flex items-center justify-center p-4 sm:p-6 lg:p-8 transition-colors duration-200">
      <div className="max-w-4xl w-full bg-white dark:bg-[#111827] rounded-3xl border border-slate-200 dark:border-[#1E293B] shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-12">

        {/* Left Column: Flow & Forms */}
        <div className="md:col-span-7 p-8 sm:p-10 flex flex-col justify-between">
          <div>

            {/* Header Brand */}
            <div className="flex items-center justify-between mb-6">
              <div onClick={onBackHome} className="flex items-center gap-2.5 cursor-pointer group">
                <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <span className="font-extrabold text-lg text-slate-900 dark:text-[#E2E8F0]">
                  Access<span className="text-blue-600 dark:text-blue-400">Audit</span>
                </span>
              </div>

              {currentStep !== 'auth' && (
                <button
                  onClick={() => {
                    setCurrentStep('auth');
                    setResetEmailSent(false);
                    setErrorMessage(null);
                  }}
                  className="text-xs font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center gap-1"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
              )}
            </div>

            {configWarning}

            {errorMessage && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 flex items-start gap-2 text-xs text-red-700 dark:text-red-300">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* STEP: AUTH (LOGIN / SIGNUP) */}
            {currentStep === 'auth' && (
              <div>
                <div className="mb-6">
                  <h2 className="text-2xl font-black text-slate-900 dark:text-[#E2E8F0] tracking-tight">
                    {authMode === 'signup' ? 'Create your account' : 'Welcome back'}
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {authMode === 'signup'
                      ? 'Start on the Free plan instantly. Upgrade anytime from your dashboard once billing is live.'
                      : 'Log into your accessibility command center and scan history.'}
                  </p>
                </div>

                {/* Plan interest pills (signup only) - informational only, billing isn't live yet */}
                {authMode === 'signup' && (
                  <div className="mb-5 p-1.5 bg-slate-100 dark:bg-slate-800/80 rounded-2xl flex items-center gap-1 border border-slate-200 dark:border-slate-700">
                    {(['free', 'pro', 'agency'] as PlanTier[]).map((tier) => (
                      <button
                        key={tier}
                        type="button"
                        onClick={() => setInterestedPlan(tier)}
                        className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-bold transition-all ${
                          interestedPlan === tier
                            ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                        }`}
                      >
                        {planLabels[tier]}
                      </button>
                    ))}
                  </div>
                )}
                {authMode === 'signup' && interestedPlan !== 'free' && (
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-4 -mt-3">
                    Billing isn't available yet — your account will start on the Free plan and you can upgrade once Pro/Agency checkout launches.
                  </p>
                )}

                {/* Google Auth Button */}
                <button
                  type="button"
                  onClick={handleGoogleAuth}
                  disabled={!isSupabaseConfigured}
                  className="w-full py-2.5 px-4 bg-white dark:bg-[#0B1120] hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-[#1E293B] rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center justify-center gap-2 shadow-xs transition-colors mb-4 min-h-[44px] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  <span>Continue with Google</span>
                </button>

                <div className="flex items-center gap-3 my-4">
                  <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800"></div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 dark:text-slate-500">or with email</span>
                  <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800"></div>
                </div>

                <form onSubmit={handleAuthSubmit} className="space-y-3.5">
                  {authMode === 'signup' && (
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Alex Rivera"
                        required
                        className="w-full py-2.5 px-3 rounded-xl border border-slate-200 dark:border-[#1E293B] bg-slate-50 dark:bg-[#0B1120] text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Work Email</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-3" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="alex@company.com"
                        required
                        className="w-full py-2.5 pl-9 pr-3 rounded-xl border border-slate-200 dark:border-[#1E293B] bg-slate-50 dark:bg-[#0B1120] text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Password</label>
                      {authMode === 'login' && (
                        <button
                          type="button"
                          onClick={() => setCurrentStep('forgot')}
                          className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          Forgot password?
                        </button>
                      )}
                    </div>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-3" />
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="At least 8 characters"
                        minLength={8}
                        required
                        className="w-full py-2.5 pl-9 pr-3 rounded-xl border border-slate-200 dark:border-[#1E293B] bg-slate-50 dark:bg-[#0B1120] text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting || !isSupabaseConfigured}
                    className="w-full py-3 px-4 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 active:scale-98 shadow-md transition-all flex items-center justify-center gap-2 min-h-[44px] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span>{isSubmitting ? 'Please wait...' : (authMode === 'signup' ? 'Create Free Account' : 'Sign In')}</span>
                    {!isSubmitting && <ArrowRight className="w-4 h-4" />}
                  </button>
                </form>
              </div>
            )}

            {/* STEP: FORGOT PASSWORD */}
            {currentStep === 'forgot' && (
              <div>
                <div className="mb-6">
                  <h2 className="text-2xl font-black text-slate-900 dark:text-[#E2E8F0] tracking-tight">
                    Reset your password
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Enter your email address and we'll send you a secure reset link.
                  </p>
                </div>

                {resetEmailSent ? (
                  <div className="p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-center space-y-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto">
                      <Check className="w-5 h-5" />
                    </div>
                    <h4 className="font-extrabold text-sm text-emerald-900 dark:text-emerald-300">
                      Reset Link Dispatched
                    </h4>
                    <p className="text-xs text-emerald-700 dark:text-emerald-400">
                      We sent password instructions to <strong>{email}</strong>. Check your inbox and follow the steps.
                    </p>
                    <button
                      onClick={() => {
                        setCurrentStep('auth');
                        setAuthMode('login');
                      }}
                      className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700"
                    >
                      Return to Sign In
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleForgotPassword} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Account Email</label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full py-2.5 px-3 rounded-xl border border-slate-200 dark:border-[#1E293B] bg-slate-50 dark:bg-[#0B1120] text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting || !isSupabaseConfigured}
                      className="w-full py-3 px-4 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? 'Sending...' : 'Send Password Reset Link'}
                    </button>
                  </form>
                )}
              </div>
            )}

          </div>

          {/* Toggle between Login & Signup */}
          <div className="mt-8 pt-4 border-t border-slate-100 dark:border-[#1E293B] text-center">
            {authMode === 'signup' ? (
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('login');
                    setCurrentStep('auth');
                    setErrorMessage(null);
                  }}
                  className="font-bold text-blue-600 dark:text-blue-400 hover:underline ml-1"
                >
                  Sign In
                </button>
              </p>
            ) : (
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Don't have an account yet?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('signup');
                    setCurrentStep('auth');
                    setErrorMessage(null);
                  }}
                  className="font-bold text-blue-600 dark:text-blue-400 hover:underline ml-1"
                >
                  Create one now
                </button>
              </p>
            )}
          </div>
        </div>

        {/* Right Feature Column */}
        <div className="md:col-span-5 bg-gradient-to-br from-blue-600 to-indigo-700 p-8 sm:p-10 text-white flex flex-col justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-white text-[11px] font-bold mb-6">
              <Sparkles className="w-3.5 h-3.5" />
              <span>WCAG 2.2-Aligned Scan Engine</span>
            </div>

            <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight mb-3">
              Automated Accessibility Testing for Your Whole Portfolio
            </h3>

            <p className="text-xs text-blue-100 leading-relaxed mb-6">
              Sign in to save your scan history, track sites over time, and pick up where you left off.
            </p>

            <div className="space-y-3.5">
              {[
                'Instant WCAG 2.2 issue breakdown with plain-language summaries',
                'Copyable code fixes with HTML & ARIA patches',
                'Persistent scan history tied to your account',
                'Higher daily scan limits than anonymous scanning',
              ].map((feat, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-xs text-blue-50">
                  <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0 mt-0.5" />
                  <span>{feat}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
