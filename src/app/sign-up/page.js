import { SignUp } from '@clerk/nextjs'

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-black flex">
      {/* Left Side - Content */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-center px-12 xl:px-16">
        <div className="max-w-lg">
          <div className="mb-8">
            <h1 className="text-5xl font-bold text-white mb-4 leading-tight">
              Start Your
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
                Success Story
              </span>
            </h1>
            <p className="text-xl text-gray-300 leading-relaxed">
              Join thousands of students who are mastering JEE with our AI-powered learning platform
            </p>
          </div>

          <div className="space-y-6">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-1">Personalized Learning Path</h3>
                <p className="text-gray-400">Get a customized study plan based on your strengths and weaknesses</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-1">Instant Progress Tracking</h3>
                <p className="text-gray-400">Monitor your improvement with detailed analytics and performance insights</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-1">24/7 AI Support</h3>
                <p className="text-gray-400">Get instant help and explanations whenever you need them</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-1">Proven Results</h3>
                <p className="text-gray-400">Join students who have improved their scores by an average of 40%</p>
              </div>
            </div>
          </div>

          <div className="mt-8 p-6 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl">
            <div className="flex items-center space-x-3 mb-3">
              <div className="flex -space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full border-2 border-white/20"></div>
                <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-full border-2 border-white/20"></div>
                <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-full border-2 border-white/20"></div>
              </div>
              <div className="text-sm text-gray-300">
                <span className="text-white font-semibold">2,500+</span> students already joined
              </div>
            </div>
            <p className="text-sm text-gray-400">
              "BodhAI helped me identify my weak areas and improve my JEE rank by 2000 positions!"
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Sign Up Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-8 lg:hidden">
            <h1 className="text-3xl font-bold text-white mb-2">Join BodhAI</h1>
            <p className="text-gray-400">Start your success story with AI-powered learning</p>
          </div>

          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 shadow-2xl">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-white mb-2">Create Account</h2>
              <p className="text-gray-400">Join thousands of successful JEE aspirants</p>
            </div>
            
            <SignUp 
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
                  formFieldHintText: 'text-gray-400',
                  formFieldInputShowPasswordButton: 'text-gray-400 hover:text-white',
                  formFieldInputShowPasswordIcon: 'text-gray-400 hover:text-white'
                },
                layout: {
                  socialButtonsPlacement: 'top'
                }
              }}
              signInUrl="/login"
              forceRedirectUrl="/dashboard"
            />
          </div>

          <div className="text-center mt-6">
            <p className="text-gray-400 text-sm">
              Already have an account?{' '}
              <a href="/login" className="text-blue-400 hover:text-blue-300 font-medium transition-colors duration-200">
                Sign in here
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}