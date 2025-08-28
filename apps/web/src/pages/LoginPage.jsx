import { useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { useNavigate } from "react-router-dom";
import DoublePawLogo from "../components/DoublePawLogo";
import usePageTitle from "../hooks/usePageTitle";

export default function LoginPage() {
  const nav = useNavigate();
  const { login, loading } = useAuth();
  const [email, setEmail] = useState("admin@example.com");
  const [password, setPassword] = useState("Admin@123");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Set page title
  usePageTitle("Sign In");

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const { ok, error } = await login(email, password);
    if (ok) nav("/");
    else setError(error || "Invalid credentials");
  };

  const fillDemoCredentials = () => {
    setEmail("admin@example.com");
    setPassword("Admin@123");
    setError("");
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Brand Section */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-3/5 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-orange-300 rounded-full mix-blend-multiply filter blur-xl -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-red-300 rounded-full mix-blend-multiply filter blur-xl translate-x-1/2 translate-y-1/2"></div>
          <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl -translate-x-1/2 -translate-y-1/2"></div>
        </div>
        
        <div className="relative flex flex-col justify-between p-12 z-10 text-white">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-4">
            <DoublePawLogo 
              size="lg" 
              showText={false}
            />
            <div>
              <h1 className="text-2xl font-bold">StraySafe</h1>
              <p className="text-slate-300 text-sm">Reducing Human-Stray Dog Conflicts</p>
            </div>
          </div>

          {/* Main Content */}
          <div className="max-w-md">
            <h2 className="text-4xl font-bold mb-6 leading-tight">
              Welcome back to
              <span className="block bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">StraySafe</span>
            </h2>
            <p className="text-slate-200 text-lg leading-relaxed mb-8">
              Securely access your dashboard to manage stray dog populations, coordinate rescue and sterilization operations, and reduce human-animal conflicts in your community.
            </p>
            
            {/* Features */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-orange-400 bg-opacity-20 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-orange-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-slate-200">Stray dog population control</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-red-400 bg-opacity-20 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-red-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-slate-200">Conflict prevention & resolution</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-pink-400 bg-opacity-20 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-pink-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-slate-200">Community safety enhancement</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-slate-400 text-sm">
            © {new Date().getFullYear()} StraySafe. Promoting safer communities through responsible stray management.
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="w-full lg:w-1/2 xl:w-2/5 flex items-center justify-center p-8 bg-gradient-to-br from-orange-50 via-red-50 to-pink-50">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center mb-8">
            <DoublePawLogo 
              size="lg" 
              showText={true}
              textClassName="text-slate-900"
            />
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-2xl shadow-2xl shadow-orange-200/50 p-8 border border-orange-100">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-slate-900 mb-2">Sign in</h2>
              <p className="text-slate-600">
                Welcome back! Please enter your credentials to continue.
              </p>
            </div>

            <form onSubmit={onSubmit} className="space-y-6">
              {/* Email Field */}
              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-semibold text-slate-700">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                    </svg>
                  </div>
                  <input
                    id="email"
                    type="email"
                    required
                    className="w-full pl-12 pr-4 py-3 border border-orange-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 bg-orange-50 focus:bg-white"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <label htmlFor="password" className="block text-sm font-semibold text-slate-700">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    className="w-full pl-12 pr-12 py-3 border border-orange-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 bg-orange-50 focus:bg-white"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-4 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <svg className="h-5 w-5 text-slate-400 hover:text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                      </svg>
                    ) : (
                      <svg className="h-5 w-5 text-slate-400 hover:text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="flex items-center space-x-2 text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                  <svg className="h-5 w-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm font-medium">{error}</span>
                </div>
              )}

              {/* Sign In Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-orange-400 to-red-500 hover:from-orange-500 hover:to-red-600 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg"
              >
                {loading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Signing in...</span>
                  </div>
                ) : (
                  <span>Sign In</span>
                )}
              </button>
            </form>

            {/* Demo Credentials */}
            <div className="mt-6 p-4 bg-orange-50 border border-orange-200 rounded-xl">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-2 flex-1">
                  <svg className="h-5 w-5 text-orange-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-orange-800 mb-2">Demo Credentials</p>
                    <div className="space-y-1 text-xs text-orange-700">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">Email:</span>
                        <code className="bg-orange-100 px-2 py-1 rounded font-mono">admin@example.com</code>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">Password:</span>
                        <code className="bg-orange-100 px-2 py-1 rounded font-mono">Admin@123</code>
                      </div>
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={fillDemoCredentials}
                  className="ml-3 px-3 py-1.5 bg-gradient-to-r from-orange-400 to-red-500 hover:from-orange-500 hover:to-red-600 text-white text-xs font-medium rounded-lg transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-1 shadow-sm"
                >
                  Use Demo
                </button>
              </div>
            </div>
          </div>

          {/* Additional Links */}
          <div className="mt-6 text-center">
            <p className="text-sm text-slate-600">
              Need help? Contact{" "}
              <a href="mailto:support@straysafe.com" className="text-orange-600 hover:text-orange-700 font-medium">
                support@straysafe.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
