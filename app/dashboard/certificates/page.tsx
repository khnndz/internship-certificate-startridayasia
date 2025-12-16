import { getSession } from '@/lib/auth';
import { getUserById } from '@/lib/data';

export default async function CertificatesPage() {
  const session = await getSession();
  const user = session ? getUserById(session.id) : null;

  if (!user) {
    return <div>Loading...</div>;
  }

  const certificates = user.certificates || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Sertifikat Saya</h1>
          <p className="text-gray-500">Download sertifikat magang Anda</p>
        </div>
        <div className="bg-primary-100 text-primary-700 px-4 py-2 rounded-lg font-medium">
          Total: {certificates.length} sertifikat
        </div>
      </div>

      {/* Certificates Grid */}
      {certificates.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {certificates.map((cert) => (
            <div key={cert.id} className="card hover:shadow-xl transition-shadow">
              <div className="text-center mb-4">
                <div className="inline-block p-4 bg-primary-100 rounded-full mb-3">
                  <span className="text-4xl">📜</span>
                </div>
                <h3 className="font-bold text-gray-800 text-lg">{cert.title}</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Diterbitkan: {cert.issuedAt}
                </p>
              </div>

              <div className="border-t border-gray-100 pt-4">
                <p className="text-xs text-gray-400 mb-3">File: {cert.file}</p>
                <a
                  href={`/certificates/${cert.file}`}
                  download
                  className="btn-primary w-full text-center block"
                >
                  ⬇️ Download PDF
                </a>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card text-center py-12">
          <div className="text-6xl mb-4">📭</div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">
            Belum Ada Sertifikat
          </h3>
          <p className="text-gray-500">
            Anda belum memiliki sertifikat. Hubungi admin jika Anda sudah menyelesaikan program magang.
          </p>
        </div>
      )}

      {/* Info Card */}
      <div className="card bg-blue-50 border border-blue-200">
        <div className="flex items-start space-x-3">
          <span className="text-2xl">ℹ️</span>
          <div>
            <h4 className="font-bold text-blue-800">Informasi</h4>
            <p className="text-blue-700 text-sm">
              Sertifikat dalam format PDF. Pastikan Anda memiliki PDF reader untuk membuka file.
              Jika ada masalah dengan download, silakan hubungi admin.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
