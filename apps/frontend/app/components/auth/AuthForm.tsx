import { motion } from "framer-motion";
import { Mail, Lock, User, ArrowRight, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import React, { useState } from "react";

export function AuthForm({
  isSignin,
  handle,
  loading,
}: {
  isSignin: boolean;
  handle: (e: React.FormEvent<HTMLFormElement>) => void;
  loading: boolean;
}) {
  const [showPassword, setShowPassword] = useState(false);

  return (
      <div className="w-full lg:w-[52%] flex items-center justify-center px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="w-full max-w-[420px]"
        >
          {/* Tab switcher */}
          <div className="flex border-b border-card-border mb-6">
            <Link
              href="/signin"
              className={`pb-2.5 px-5 text-sm font-semibold border-b-2 transition-colors ${
                isSignin ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className={`pb-2.5 px-5 text-sm font-semibold border-b-2 transition-colors ${
                !isSignin ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              Sign up
            </Link>
          </div>

          {/* Heading */}
          <div className="mb-5">
            <h2 className="text-xl font-extrabold text-foreground">
              {isSignin ? 'Welcome back 👋' : 'Create your account 🚀'}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {isSignin
                ? 'Log in to access your boards and collaborate with your team.'
                : 'Sign up to start drawing and collaborating in real time.'}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handle} className="space-y-4">
            {/* Email */}
            <div className="space-y-1">
              <label htmlFor="email" className="block text-sm font-medium text-foreground">Email address</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                  <Mail size={15} className="text-muted-foreground" />
                </span>
                <input
                  type="email" id="email" name="email" placeholder="you@exemple.com" required
                  className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl outline-none bg-white border border-card-border text-foreground placeholder:text-muted-foreground/60 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1">
              <label htmlFor="password" className="block text-sm font-medium text-foreground">Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                  <Lock size={15} className="text-muted-foreground" />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'} id="password" name="password"
                  placeholder="Enter your password" required
                  className="w-full pl-9 pr-10 py-2.5 text-sm rounded-xl outline-none bg-white border border-card-border text-foreground placeholder:text-muted-foreground/60 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-3 flex items-center text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Toggle password visibility">
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Signup extra fields */}
            {!isSignin && (
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label htmlFor="firstName" className="block text-sm font-medium text-foreground">First Name</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                      <User size={15} className="text-muted-foreground" />
                    </span>
                    <input type="text" id="firstName" name="firstName" placeholder="First name" required
                      className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl outline-none bg-white border border-card-border text-foreground placeholder:text-muted-foreground/60 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm" />
                  </div>
                </div>
                <div className="space-y-1">
                  <label htmlFor="lastName" className="block text-sm font-medium text-foreground">Last Name</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                      <User size={15} className="text-muted-foreground" />
                    </span>
                    <input type="text" id="lastName" name="lastName" placeholder="Last name" required
                      className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl outline-none bg-white border border-card-border text-foreground placeholder:text-muted-foreground/60 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm" />
                  </div>
                </div>
              </div>
            )}

            {/* Submit */}
            <button type="submit" disabled={loading}
              className="w-full flex justify-center items-center gap-2 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm shadow-glow-sm hover:shadow-glow-md hover:bg-primary-dark transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>{isSignin ? 'Log in' : 'Create Account'} <ArrowRight size={15} /></>
              )}
            </button>
          </form>

          {/* Bottom link */}
          <p className="text-center text-sm text-muted-foreground mt-5">
            {isSignin ? (
              <>Don&apos;t have an account?{' '}
                <Link href="/signup" className="text-primary font-semibold hover:text-primary-dark transition-colors">Sign up</Link>
              </>
            ) : (
              <>Already have an account?{' '}
                <Link href="/signin" className="text-primary font-semibold hover:text-primary-dark transition-colors">Log in</Link>
              </>
            )}
          </p>
        </motion.div>
      </div>
  );
}
