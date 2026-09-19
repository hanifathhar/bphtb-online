"use client";

import { useState, useEffect } from "react";
import DashboardShell from "@/components/DashboardShell";
import Pagination from "@/components/Pagination";
import {
  Users,
  PlusCircle,
  Edit2,
  Trash2,
  Shield,
  Lock,
  UserCheck,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";

export default function MasterPenggunaPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const limit = 10;
  const [modalOpen, setModalOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState({
    username: "",
    nmPengguna: "",
    email: "",
    password: "",
    level: 2,
    status: 1,
    baned: "N",
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/master/pengguna");
      if (res.ok) {
        const json = await res.json();
        setData(json.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenAdd = () => {
    setIsEdit(false);
    setEditId(null);
    setForm({
      username: "",
      nmPengguna: "",
      email: "",
      password: "",
      level: 2,
      status: 1,
      baned: "N",
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (item: any) => {
    setIsEdit(true);
    setEditId(item.id);
    setForm({
      username: item.username,
      nmPengguna: item.nmPengguna || "",
      email: item.email || "",
      password: "",
      level: item.level || 1,
      status: item.status !== undefined ? item.status : 1,
      baned: item.baned || "N",
    });
    setModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Apakah Anda yakin ingin menghapus pengguna ini?")) return;
    try {
      const res = await fetch(`/api/master/pengguna/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Pengguna berhasil dihapus");
        fetchData();
      }
    } catch (e) {
      toast.error("Gagal menghapus pengguna");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const url = isEdit ? `/api/master/pengguna/${editId}` : "/api/master/pengguna";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error || "Gagal menyimpan pengguna");
        setSubmitting(false);
        return;
      }

      toast.success(isEdit ? "Pengguna diperbarui" : "Pengguna baru berhasil dibuat");
      setModalOpen(false);
      fetchData();
    } catch (e) {
      toast.error("Terjadi kesalahan server");
    } finally {
      setSubmitting(false);
    }
  };

  const rolesList = [
    { level: 1, name: "Administrator Sistem" },
    { level: 2, name: "Petugas Loket / Pendaftaran" },
    { level: 3, name: "Verifikator 1 (Pemeriksa Lapangan)" },
    { level: 4, name: "Verifikator 2 (Kasie Teknis)" },
    { level: 5, name: "Verifikator 3 (Kabid Penetapan)" },
    { level: 6, name: "Petugas Kasir / Bank" },
    { level: 7, name: "PPAT / Notaris" },
  ];

  return (
    <DashboardShell active="master">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-red-700 border border-red-200/80 text-red-600 text-xs font-semibold mb-2">
            <Users size={14} /> Manajemen Akses
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Pengguna & Role Hak Akses
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Pengelolaan akun staf, verifikator berjenjang, kasir bank, dan notaris/PPAT pada sistem BPHTB Online.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold  text-slate-950 font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-teal-500/20 active:scale-95 transition"
        >
          <PlusCircle size={16} />
          <span>Tambah Pengguna</span>
        </button>
      </div>

      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 rounded-l-xl">Nama & Username</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Role / Tingkat Akses</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-center rounded-r-xl">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-slate-500">
                    Memuat data pengguna...
                  </td>
                </tr>
              ) : (
                (() => {
                  const totalPages = Math.ceil(data.length / limit) || 1;
                  const paginatedData = data.slice((page - 1) * limit, page * limit);
                  return paginatedData.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-100 transition">
                      <td className="px-4 py-3.5">
                        <p className="font-bold text-slate-900 text-sm">{item.nmPengguna || item.username}</p>
                        <p className="text-[11px] text-red-600">@{item.username}</p>
                      </td>
                      <td className="px-4 py-3.5 text-slate-500 font-mono">
                        {item.email || "-"}
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-red-50 text-red-700 border border-red-200/80 text-red-700 border border-red-200">
                          {item.roleLabel}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        {item.status === 1 && item.baned !== "Y" ? (
                          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-700 border border-emerald-200 text-emerald-600">
                            Aktif
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200 text-rose-600">
                            Nonaktif
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(item)}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="p-1.5 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-50 text-rose-700 border border-rose-200 text-rose-600"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ));
                })()
              )}
            </tbody>
          </table>
        </div>

        <Pagination
          currentPage={page}
          totalPages={Math.ceil(data.length / limit) || 1}
          totalItems={data.length}
          limit={limit}
          onPageChange={(p) => setPage(p)}
        />
      </div>

      {/* Modal Add / Edit */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-50 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Users size={20} className="text-red-600" />
              {isEdit ? "Edit Pengguna & Role" : "Tambah Pengguna Baru"}
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Username *</label>
                <input
                  type="text"
                  required
                  disabled={isEdit}
                  placeholder="Contoh: verifikator1"
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nama Lengkap & Gelar *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Ahmad Fauzi, S.E."
                  value={form.nmPengguna}
                  onChange={(e) => setForm({ ...form, nmPengguna: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Email</label>
                <input
                  type="email"
                  placeholder="email@daerah.go.id"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {isEdit ? "Password Baru (Kosongkan jika tidak diubah)" : "Password *"}
                </label>
                <input
                  type="password"
                  required={!isEdit}
                  placeholder={isEdit ? "••••••••" : "Masukkan password"}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Role / Hak Akses *</label>
                <select
                  value={form.level}
                  onChange={(e) => setForm({ ...form, level: parseInt(e.target.value) })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  {rolesList.map((r) => (
                    <option key={r.level} value={r.level}>
                      Level {r.level}: {r.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-semibold text-xs"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2 rounded-xl bg-teal-400 hover:bg-teal-300 text-slate-950 font-bold text-xs disabled:opacity-50"
              >
                {submitting ? "Menyimpan..." : "Simpan Pengguna"}
              </button>
            </div>
          </form>
        </div>
      )}
    </DashboardShell>
  );
}
