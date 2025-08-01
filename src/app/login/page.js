import { SignIn } from '@clerk/nextjs'

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-black flex">
      {/* Left Side - Content */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-center px-12 xl:px-16">
        <div className="max-w-lg">
          <div className="mb-8">
            <h1 className="text-5xl font-bold text-white mb-4 leading-tight">
              Master Your
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
                JEE Journey
              </span>
            </h1>
            <p className="text-xl text-gray-300 leading-relaxed">
              Transform your preparation with AI-powered personalized learning and adaptive assessments
            </p>
          </div>

          <div className="space-y-6">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-1">AI-Powered Analytics</h3>
                <p className="text-gray-400">Get detailed insights into your performance and identify areas for improvement</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-1">Adaptive Learning</h3>
                <p className="text-gray-400">Personalized study plans that adapt to your learning pace and style</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-1">Performance Tracking</h3>
                <p className="text-gray-400">Monitor your progress with comprehensive dashboards and detailed reports</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-1">Smart Practice Tests</h3>
                <p className="text-gray-400">Take AI-generated practice tests tailored to your current skill level</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-8 lg:hidden">
            <h1 className="text-3xl font-bold text-white mb-2">Welcome to BodhAI</h1>
            <p className="text-gray-400">Master your JEE journey with AI-powered learning</p>
          </div>

          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 shadow-2xl">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-white mb-2">Welcome Back</h2>
              <p className="text-gray-400">Sign in to continue your preparation</p>
            </div>
            
            <SignIn 
              routing="hash"
              appearance={{
                elements: {
                  formButtonPrimary: 'bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl',
                  card: 'bg-transparent shadow-none border-none',
                  headerTitle: 'hidden',
                  headerSubtitle: 'hidden',
                  socialButtonsBlockButton: 'bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20 transition-all duration-200 rounded-lg font-medium',
                  socialButtonsBlockButtonText: 'text-white font-medium',
                  formFieldInput: 'bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-gray-400 rounded-lg focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all duration-200',
                  formFieldLabel: 'text-gray-300 font-medium',
                  footerActionLink: 'text-blue-400 hover:text-blue-300 font-medium transition-colors duration-200',
                  identityPreviewText: 'text-gray-300',
                  identityPreviewEditButton: 'text-blue-400 hover:text-blue-300',
                  formFieldAction: 'text-blue-400 hover:text-blue-300',
                  otpCodeFieldInput: 'bg-white/10 backdrop-blur-sm border border-white/20 text-white rounded-lg focus:border-blue-400',
                  formResendCodeLink: 'text-blue-400 hover:text-blue-300',
                  dividerLine: 'bg-white/20',
                  dividerText: 'text-gray-400',
                  formFieldSuccessText: 'text-emerald-400',
                  formFieldErrorText: 'text-red-400',
                  alertText: 'text-red-400',
                  formFieldHintText: 'text-gray-400'
                },
                layout: {
                  socialButtonsPlacement: 'top'
                }
              }}
              signUpUrl="/sign-up"
              forceRedirectUrl="/dashboard"
            />
          </div>

          <div className="text-center mt-6">
            <p className="text-gray-400 text-sm">
              Don't have an account?{' '}
              <a href="/sign-up" className="text-blue-400 hover:text-blue-300 font-medium transition-colors duration-200">
                Sign up for free
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}