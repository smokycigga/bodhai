import { Inter, JetBrains_Mono, Merriweather } from "next/font/google";
import { ClerkProvider } from '@clerk/nextjs';
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

const merriweather = Merriweather({
  variable: "--font-merriweather",
  subsets: ["latin"],
  weight: ["300", "400", "700", "900"],
  display: "swap",
});

export const metadata = {
  title: "BodhAI - AI-Powered Personalized Learning Platform",
  description: "Revolutionize your learning with BodhAI's intelligent education platform. Experience personalized AI-driven learning, adaptive assessments, and smart analytics.",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
      appearance={{
        baseTheme: 'dark',
        elements: {
          formButtonPrimary: 'bg-green-600 hover:bg-green-700 text-white',
          card: 'bg-gray-900 shadow-xl',
          headerTitle: 'text-white',
          headerSubtitle: 'text-gray-400',
          socialButtonsBlockButton: 'bg-white text-gray-900 hover:bg-gray-100',
          formFieldInput: 'bg-gray-800 border-gray-700 text-white',
          formFieldLabel: 'text-gray-300',
          footerActionLink: 'text-green-400 hover:text-green-300'
        }
      }}
    >
      <html lang="en" suppressHydrationWarning>
        <head>
          <script
            dangerouslySetInnerHTML={{
              __html: `
                try {
                  if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                    document.documentElement.classList.add('dark')
                  } else {
                    document.documentElement.classList.remove('dark')
                  }
                } catch (_) {}
              `,
            }}
          />
        </head>
        <body
          className={`${inter.variable} ${jetbrainsMono.variable} ${merriweather.variable} antialiased font-sans`}
          suppressHydrationWarning
        >
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}