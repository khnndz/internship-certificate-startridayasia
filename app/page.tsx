import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-primary-900 to-slate-900 relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 min-h-screen flex flex-col">
        <header className="container mx-auto px-4 py-6 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">SF</span>
            </div>
            <span className="text-white font-bold text-lg hidden sm:block">StartFridayAsia</span>
          </div>
          <Link href="/login">
            <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 backdrop-blur-sm">
              Masuk
            </Button>
          </Link>
        </header>

        <main className="flex-1 flex items-center justify-center px-4">
          <div className="text-center max-w-5xl mx-auto">
            <div className="mb-8 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm text-white/90 font-medium">Platform Digital Certificate</span>
            </div>
            
            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold mb-6 text-white leading-tight">
              Portal Sertifikat
              <span className="block bg-gradient-to-r from-primary-400 via-blue-400 to-purple-400 bg-clip-text text-transparent mt-2">
                Magang Digital
              </span>
            </h1>
            
            <p className="text-lg sm:text-xl md:text-2xl mb-12 text-slate-300 font-light max-w-3xl mx-auto leading-relaxed">
              Akses, kelola, dan unduh sertifikat magang Anda dengan mudah. 
              Platform modern untuk generasi digital.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
              <Link href="/login">
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-primary-500 to-blue-500 hover:from-primary-600 hover:to-blue-600 text-white border-0 text-lg px-10 py-7 h-auto shadow-2xl hover:shadow-primary-500/50 transition-all duration-300 hover:scale-105"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                  Masuk ke Portal
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {[
                { icon: '⚡', title: 'Cepat & Aman', desc: 'Akses sertifikat kapan saja' },
                { icon: '🎯', title: 'Mudah Digunakan', desc: 'Interface modern & intuitif' },
                { icon: '📱', title: 'Responsive', desc: 'Akses dari device apapun' },
              ].map((feature, idx) => (
                <div key={idx} className="p-6 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10 transition-all duration-300 hover:scale-105">
                  <div className="text-4xl mb-3">{feature.icon}</div>
                  <h3 className="text-white font-bold mb-2">{feature.title}</h3>
                  <p className="text-slate-400 text-sm">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </main>

        <footer className="container mx-auto px-4 py-8 text-center text-slate-400 text-sm border-t border-white/10">
          <p>&copy; {new Date().getFullYear()} StartFridayAsia. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
}
