import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight, 
  Lock, 
  Mail, 
  CreditCard,
  Building2,
  KeyRound,
  Check,
  ChevronLeft
} from 'lucide-react';
import { PlanTier, UserAccount } from '../types';

interface AuthPageProps {
  onSuccess: (user: Partial<UserAccount>) => void;
  onBackHome: () => void;
  initialPlan?: PlanTier;
  initialMode?: 'login' | 'signup' | 'checkout' | 'forgot' | 'verify';
}

export const AuthPage: React.FC<AuthPageProps> = ({ 
  onSuccess, 
  onBackHome,
  initialPlan = 'pro',
  initialMode = 'signup'
}) => {
  const [currentStep, setCurrentStep] = useState<'auth' | 'checkout' | 'forgot' | 'verify'>(
    initialMode === 'checkout' ? 'checkout' : (initialMode === 'forgot' ? 'forgot' : 'auth')
  );
  const [authMode, setAuthMode] = useState<'login' | 'signup'>(
    initialMode === 'login' ? 'login' : 'signup'
  );
  const [selectedPlan, setSelectedPlan] = useState<PlanTier>(initialPlan);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('annual');
  
  // Form fields
  const [fullName, setFullName] = useState('Alex Rivera');
  const [email, setEmail] = useState('alex.rivera@agency.io');
  const [password, setPassword] = useState('••••••••••••');
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvc, setCardCvc] = useState('888');
  const [isProcessing, setIsProcessing] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);

  const planPricing = {
    free: { name: 'Free Evaluation', monthly: 0, annual: 0 },
    pro: { name: 'Pro Compliance', monthly: 49, annual: 39 },
    agency: { name: 'Agency White-Label', monthly: 149, annual: 119 }
  };

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    if (authMode === 'login') {
      // Existing user logging in
      onSuccess({
        email,
        name: fullName || 'Valued User',
        plan: selectedPlan,
        role: email.includes('admin') ? 'admin' : 'user'
      });
    } else {
      // New signup -> directly step into Checkout if paid plan, or complete if free
      if (selectedPlan === 'free') {
        onSuccess({
          email,
          name: fullName,
          plan: 'free',
          role: 'user',
          status: 'Active'
        });
      } else {
        setCurrentStep('checkout');
      }
    }
  };

  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);
      onSuccess({
        email,
        name: fullName,
        plan: selectedPlan,
        billingCycle,
        role: email.includes('admin') ? 'admin' : 'user',
        status: 'Active',
        cardLast4: '4242',
        cardBrand: 'Visa',
        currentPeriodEnd: billingCycle === 'annual' ? 'Aug 24, 2027' : 'Sep 24, 2026'
      });
    }, 900);
  };

  const handleGoogleAuth = () => {
    if (selectedPlan === 'free') {
      onSuccess({
        email: email || 'google.user@company.com',
        name: 'Google User',
        plan: 'free',
        role: 'user'
      });
    } else {
      setCurrentStep('checkout');
    }
  };

  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setResetEmailSent(true);
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
                  }}
                  className="text-xs font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center gap-1"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
              )}
            </div>

            {/* STEP 1: AUTH (LOGIN / SIGNUP) */}
            {currentStep === 'auth' && (
              <div>
                <div className="mb-6">
                  <h2 className="text-2xl font-black text-slate-900 dark:text-[#E2E8F0] tracking-tight">
                    {authMode === 'signup' ? 'Create your account' : 'Welcome back'}
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {authMode === 'signup' 
                      ? `Continue to activate your ${planPricing[selectedPlan].name} plan.`
                      : 'Log into your accessibility command center and compliance reports.'}
                  </p>
                </div>

                {/* Plan Selection Mini-Pills (if signing up) */}
                {authMode === 'signup' && (
                  <div className="mb-5 p-1.5 bg-slate-100 dark:bg-slate-800/80 rounded-2xl flex items-center gap-1 border border-slate-200 dark:border-slate-700">
                    {(['free', 'pro', 'agency'] as PlanTier[]).map((tier) => (
                      <button
                        key={tier}
                        type="button"
                        onClick={() => setSelectedPlan(tier)}
                        className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-bold transition-all ${
                          selectedPlan === tier
                            ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                        }`}
                      >
                        {tier === 'free' ? 'Free ($0)' : (tier === 'pro' ? 'Pro ($39)' : 'Agency ($119)')}
                      </button>
                    ))}
                  </div>
                )}

                {/* Google Auth Button */}
                <button
                  type="button"
                  onClick={handleGoogleAuth}
                  className="w-full py-2.5 px-4 bg-white dark:bg-[#0B1120] hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-[#1E293B] rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center justify-center gap-2 shadow-xs transition-colors mb-4 min-h-[44px]"
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
                        placeholder="••••••••••••"
                        required
                        className="w-full py-2.5 pl-9 pr-3 rounded-xl border border-slate-200 dark:border-[#1E293B] bg-slate-50 dark:bg-[#0B1120] text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 px-4 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 active:scale-98 shadow-md transition-all flex items-center justify-center gap-2 min-h-[44px]"
                  >
                    <span>{authMode === 'signup' ? (selectedPlan === 'free' ? 'Create Free Account' : 'Continue to Checkout') : 'Sign In'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              </div>
            )}

            {/* STEP 2: CHECKOUT / PAYMENT */}
            {currentStep === 'checkout' && (
              <div>
                <div className="mb-6">
                  <span className="text-[10px] uppercase font-extrabold text-blue-600 tracking-wider">
                    Step 2 of 2 • Secure Checkout
                  </span>
                  <h2 className="text-2xl font-black text-slate-900 dark:text-[#E2E8F0] tracking-tight">
                    Complete Subscription
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Your account is created. Enter billing details to activate your plan.
                  </p>
                </div>

                {/* Plan Summary Box */}
                <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 mb-5 flex items-center justify-between">
                  <div>
                    <h4 className="font-extrabold text-sm text-blue-900 dark:text-blue-200">
                      {planPricing[selectedPlan].name}
                    </h4>
                    <p className="text-[11px] text-blue-700 dark:text-blue-300">
                      Billed {billingCycle} • Cancel anytime
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xl font-black text-blue-900 dark:text-white">
                      ${billingCycle === 'annual' ? planPricing[selectedPlan].annual : planPricing[selectedPlan].monthly}
                    </span>
                    <span className="text-xs text-blue-600 dark:text-blue-400">/mo</span>
                  </div>
                </div>

                <form onSubmit={handleCheckoutSubmit} className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Cardholder Name</label>
                    <input
                      type="text"
                      defaultValue={fullName}
                      required
                      className="w-full py-2.5 px-3 rounded-xl border border-slate-200 dark:border-[#1E293B] bg-slate-50 dark:bg-[#0B1120] text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Card Number</label>
                    <div className="relative">
                      <CreditCard className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-3" />
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        placeholder="4242 •••• •••• 4242"
                        required
                        className="w-full py-2.5 pl-9 pr-3 rounded-xl border border-slate-200 dark:border-[#1E293B] bg-slate-50 dark:bg-[#0B1120] text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Expires (MM/YY)</label>
                      <input
                        type="text"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        placeholder="MM/YY"
                        required
                        className="w-full py-2.5 px-3 rounded-xl border border-slate-200 dark:border-[#1E293B] bg-slate-50 dark:bg-[#0B1120] text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">CVC / CVV</label>
                      <input
                        type="text"
                        value={cardCvc}
                        onChange={(e) => setCardCvc(e.target.value)}
                        placeholder="CVC"
                        required
                        className="w-full py-2.5 px-3 rounded-xl border border-slate-200 dark:border-[#1E293B] bg-slate-50 dark:bg-[#0B1120] text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isProcessing}
                    className="w-full py-3 px-4 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-98 shadow-md transition-all flex items-center justify-center gap-2 min-h-[44px] disabled:opacity-50"
                  >
                    {isProcessing ? (
                      <span>Activating Your Plan...</span>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4" />
                        <span>Pay & Launch Dashboard</span>
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}

            {/* STEP 3: FORGOT PASSWORD */}
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
                      className="w-full py-3 px-4 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md transition-all"
                    >
                      Send Password Reset Link
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
              <span>WCAG 2.2 Level AA Engine</span>
            </div>

            <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight mb-3">
              Automated Digital Accessibility & Legal Peace of Mind
            </h3>
            
            <p className="text-xs text-blue-100 leading-relaxed mb-6">
              Join hundreds of high-growth agencies and product teams delivering accessible web experiences with automated daily monitoring.
            </p>

            <div className="space-y-3.5">
              {[
                'Instant Executive Summary & WCAG 2.2 scorecards',
                'Copyable code fixes with HTML & ARIA patches',
                'White-label PDF reports with agency branding',
                'Continuous regression email alerts'
              ].map((feat, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-xs text-blue-50">
                  <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0 mt-0.5" />
                  <span>{feat}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-white/20">
            <p className="text-[11px] text-blue-200">
              "AccessAudit cut our agency's accessibility auditing workflow from 14 hours down to under 5 minutes."
            </p>
            <p className="text-[10px] font-bold text-white mt-1">
              — Elena Rostov, VP of Digital Experience
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};
