"use client";

import { useState } from "react";
import { updateAdminProfileAction } from "@/app/actions/admin";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

interface ProfileFormClientProps {
  user: {
    name: string;
    email: string;
  };
}

export default function ProfileFormClient({ user }: ProfileFormClientProps) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setMessage(null);
    try {
      const result = await updateAdminProfileAction(formData);
      if (result?.error) {
        setMessage({ type: "error", text: result.error });
      } else {
        setMessage({ type: "success", text: result.message || "Profil berhasil diperbarui" });
      }
    } catch (error) {
      console.error("Update profile error:", error);
      setMessage({ type: "error", text: "Terjadi kesalahan saat update profil" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="border-slate-200 shadow-lg max-w-xl">
      <div className="p-6 border-b border-slate-100">
        <h1 className="text-2xl font-bold text-slate-900">My Profile</h1>
        <p className="text-sm text-slate-600 mt-1">Ubah data akun admin Anda.</p>
      </div>
      <div className="p-6 space-y-5">
        {message && (
          <div
            className={`p-3 rounded-xl text-sm border ${
              message.type === "success"
                ? "bg-green-50 text-green-700 border-green-200"
                : "bg-red-50 text-red-700 border-red-200"
            }`}
          >
            {message.text}
          </div>
        )}

        <form action={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Nama Lengkap</label>
            <input
              type="text"
              name="name"
              defaultValue={user.name}
              required
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 focus:bg-white outline-none transition-all duration-200"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Email</label>
            <input
              type="email"
              name="email"
              defaultValue={user.email}
              required
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 focus:bg-white outline-none transition-all duration-200"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Password Baru (opsional)</label>
            <input
              type="password"
              name="password"
              placeholder="Kosongkan jika tidak ingin mengganti"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 focus:bg-white outline-none transition-all duration-200"
            />
            <p className="text-xs text-slate-500 mt-1">Jika diisi, password akan diganti dengan nilai baru.</p>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-primary-500 to-blue-500 hover:from-primary-600 hover:to-blue-600 text-white shadow-lg"
          >
            {loading ? "Menyimpan..." : "Simpan Perubahan"}
          </Button>
        </form>
      </div>
    </Card>
  );
}
