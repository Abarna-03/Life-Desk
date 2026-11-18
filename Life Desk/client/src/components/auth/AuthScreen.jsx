import React from 'react'
import { Layers, CheckCircle, AlertCircle, Sparkles, Mail } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

function FieldError({ message, onCreateAccount }) {
  return (
    <div className="flex flex-col items-start gap-1.5 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-destructive">
      <div className="flex items-center gap-1.5">
        <AlertCircle size={15} /> {message}
      </div>
      {message.toLowerCase().includes('no account') && (
        <button
          type="button"
          onClick={onCreateAccount}
          className="cursor-pointer p-0 text-[0.82rem] font-bold text-indigo-700 underline"
        >
          Click here to create an account with this email →
        </button>
      )}
    </div>
  )
}

function SuccessMessage({ message }) {
  return (
    <div className="flex items-center gap-1.5 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-sm leading-snug text-emerald-800">
      <CheckCircle size={15} /> {message}
    </div>
  )
}

export default function AuthScreen({
  authMode,
  setAuthMode,
  authForm,
  setAuthForm,
  resetForm,
  setResetForm,
  authError,
  setAuthError,
  authSuccess,
  setAuthSuccess,
  authPreviewUrl,
  authLoading,
  handleAuthSubmit,
  handleForgotPasswordSubmit,
  handleResetPasswordSubmit,
}) {
  const goCreateAccount = () => {
    setAuthMode('register')
    setAuthError('')
    setAuthForm((prev) => ({ ...prev, email: resetForm.email }))
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-50 via-background to-teal-50 p-6">
      <div className="w-full max-w-[420px] rounded-2xl border border-border bg-card p-9 shadow-lg">
        {/* Brand */}
        <div className="mb-7 flex items-center gap-3">
          <div className="flex items-center justify-center rounded-[0.625rem] bg-gradient-to-br from-brand-indigo to-brand-teal p-2.5 text-white shadow-md shadow-brand-indigo/25">
            <Layers size={24} />
          </div>
          <div>
            <div className="text-[1.35rem] font-extrabold tracking-tight text-foreground">
              LifeHub
            </div>
            <div className="text-xs font-medium text-muted-foreground">
              Your home &amp; belongings, all in one place
            </div>
          </div>
        </div>

        <h2 className="mb-1.5 text-2xl font-bold text-foreground">
          {authMode === 'register' && 'Create your account'}
          {authMode === 'login' && 'Welcome back'}
          {authMode === 'forgot' && 'Reset your password'}
          {authMode === 'reset' && 'Enter Verification Code'}
        </h2>
        <p className="mb-6 text-sm text-muted-foreground">
          {authMode === 'register' &&
            'Sign up to start keeping track of your things, warranties and subscriptions.'}
          {authMode === 'login' && 'Sign in to pick up where you left off.'}
          {authMode === 'forgot' &&
            "Enter your registered email address and we'll send you a 6-digit verification code."}
          {authMode === 'reset' &&
            `Check your inbox (${resetForm.email || 'your email'}) for the 6-digit verification code.`}
        </p>

        {/* LOGIN & REGISTER */}
        {(authMode === 'login' || authMode === 'register') && (
          <form onSubmit={handleAuthSubmit} className="flex flex-col gap-4">
            {authMode === 'register' && (
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  value={authForm.name}
                  onChange={(e) => setAuthForm({ ...authForm, name: e.target.value })}
                  placeholder="Alex Morgan"
                  required
                />
              </div>
            )}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={authForm.email}
                onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
                placeholder="you@example.com"
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                {authMode === 'login' && (
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('forgot')
                      setAuthError('')
                      setAuthSuccess('')
                      setResetForm((prev) => ({ ...prev, email: authForm.email }))
                    }}
                    className="cursor-pointer p-0 text-xs font-semibold text-primary hover:underline"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <Input
                id="password"
                type="password"
                value={authForm.password}
                onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
                placeholder="••••••••"
                required
              />
            </div>

            {authSuccess && <SuccessMessage message={authSuccess} />}
            {authError && (
              <FieldError message={authError} onCreateAccount={goCreateAccount} />
            )}

            <Button
              type="submit"
              variant="brand"
              className="mt-1 h-11"
              disabled={authLoading}
            >
              {authLoading
                ? 'Please wait…'
                : authMode === 'register'
                  ? 'Create Account'
                  : 'Sign In'}
            </Button>
          </form>
        )}

        {/* FORGOT PASSWORD */}
        {authMode === 'forgot' && (
          <form onSubmit={handleForgotPasswordSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="forgot-email">Registered Email</Label>
              <Input
                id="forgot-email"
                type="email"
                value={resetForm.email}
                onChange={(e) => setResetForm({ ...resetForm, email: e.target.value })}
                placeholder="you@example.com"
                required
              />
            </div>

            {authError && (
              <FieldError message={authError} onCreateAccount={goCreateAccount} />
            )}
            {authSuccess && <SuccessMessage message={authSuccess} />}

            <Button
              type="submit"
              variant="brand"
              className="mt-1 h-11"
              disabled={authLoading}
            >
              {authLoading ? 'Sending code…' : 'Send Verification Code'}
            </Button>
          </form>
        )}

        {/* RESET PASSWORD */}
        {authMode === 'reset' && (
          <form onSubmit={handleResetPasswordSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="reset-email">Email</Label>
              <Input
                id="reset-email"
                type="email"
                value={resetForm.email}
                onChange={(e) => setResetForm({ ...resetForm, email: e.target.value })}
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="reset-code">6-Digit Verification Code</Label>
              <Input
                id="reset-code"
                type="text"
                maxLength={6}
                value={resetForm.code}
                onChange={(e) => setResetForm({ ...resetForm, code: e.target.value })}
                placeholder="123456"
                className="text-lg font-bold tracking-[4px]"
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="new-password">New Password</Label>
              <Input
                id="new-password"
                type="password"
                value={resetForm.newPassword}
                onChange={(e) => setResetForm({ ...resetForm, newPassword: e.target.value })}
                placeholder="••••••••"
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="confirm-password">Confirm New Password</Label>
              <Input
                id="confirm-password"
                type="password"
                value={resetForm.confirmPassword}
                onChange={(e) =>
                  setResetForm({ ...resetForm, confirmPassword: e.target.value })
                }
                placeholder="••••••••"
                required
              />
            </div>

            {authError && (
              <div className="flex items-center gap-1.5 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-destructive">
                <AlertCircle size={15} /> {authError}
              </div>
            )}
            {authSuccess && <SuccessMessage message={authSuccess} />}

            {authPreviewUrl && (
              <div className="text-center">
                <a
                  href={authPreviewUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 underline"
                >
                  <Mail size={13} /> View test email preview (Ethereal) ↗
                </a>
              </div>
            )}

            <Button
              type="submit"
              variant="brand"
              className="mt-1 h-11"
              disabled={authLoading}
            >
              {authLoading ? 'Updating password…' : 'Update Password'}
            </Button>
          </form>
        )}

        {/* Mode switch */}
        <div className="mt-5 text-center text-sm text-muted-foreground">
          {authMode === 'register' && (
            <span>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setAuthMode('login')
                  setAuthError('')
                  setAuthSuccess('')
                }}
                className="cursor-pointer p-0 font-semibold text-primary hover:underline"
              >
                Sign in
              </button>
            </span>
          )}
          {authMode === 'login' && (
            <span>
              New to LifeHub?{' '}
              <button
                type="button"
                onClick={() => {
                  setAuthMode('register')
                  setAuthError('')
                  setAuthSuccess('')
                }}
                className="cursor-pointer p-0 font-semibold text-primary hover:underline"
              >
                Create an account
              </button>
            </span>
          )}
          {(authMode === 'forgot' || authMode === 'reset') && (
            <span>
              Remember your password?{' '}
              <button
                type="button"
                onClick={() => {
                  setAuthMode('login')
                  setAuthError('')
                  setAuthSuccess('')
                }}
                className="cursor-pointer p-0 font-semibold text-primary hover:underline"
              >
                Back to Sign In
              </button>
            </span>
          )}
        </div>

        {authMode === 'login' && (
          <div className="mt-5 flex items-center justify-center gap-1.5 rounded-md border border-dashed border-primary/40 bg-primary/5 p-2.5 text-xs text-muted-foreground">
            <Sparkles size={13} /> Demo: <strong>demo@lifedesk.com</strong> /{' '}
            <strong>password123</strong>
          </div>
        )}
      </div>
    </div>
  )
}
