import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-500 to-primary-700">
      <div className="text-center text-white p-8">
        <h1 className="text-5xl font-bold mb-4">
          🎓 Portal Sertifikat Magang
        </h1>
        <p className="text-xl mb-8 opacity-90">
          StartFridayAsia - Download sertifikat magang Anda dengan mudah
        </p>
        <Link 
          href="/login" 
          className="inline-block bg-white text-primary-600 font-bold py-3 px-8 rounded-lg hover:bg-gray-100 transition-colors text-lg"
        >
          Login untuk Masuk
        </Link>
      </div>
    </div>
  );
}
