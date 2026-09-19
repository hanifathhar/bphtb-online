"use client";

import { useState, useEffect } from "react";
import DashboardShell from "@/components/DashboardShell";
import Pagination from "@/components/Pagination";
import {
  Award,
  PlusCircle,
  Edit2,
  Trash2,
  Building2,
  FileCheck,
  CheckCircle2,
  XCircle,
  MapPin,
  UserCheck,
} from "lucide-react";
import { toast } from "sonner";

export default function MasterPejabatPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const limit = 10;
  const [modalOpen, setModalOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState({
    kode: "KEPALA_BADAN",
    nama: "",
    nip: "",
    jabatan: "",
    pangkat: "",
    kota: "Sipirok",
    status: 1,
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/master/pejabat");
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
      kode: "KEPALA_BADAN",
      nama: "",
      nip: "",
      jabatan: "KEPALA BADAN PENGELOLAAN KEUANGAN, PENDAPATAN DAN ASET DAERAH SELAKU PEJABAT PENGELOLA KEUANGAN DAERAH",
      pangkat: "Pembina Utama Muda (IV/c)",
      kota: "Sipirok",
      status: 1,
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (item: any) => {
    setIsEdit(true);
    setEditId(item.id);
    setForm({
      kode: item.kode,
      nama: item.nama || "",
      nip: item.nip || "",
      jabatan: item.jabatan || "",
      pangkat: item.pangkat || "",
      kota: item.kota || "Sipirok",
      status: item.status !== undefined ? item.status : 1,
    });
    setModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Apakah Anda yakin ingin menghapus data penandatangan ini?")) return;
    try {
      const res = await fetch(`/api/master/pejabat/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Pejabat penandatangan berhasil dihapus");
        fetchData();
      }
    } catch (e) {
      toast.error("Gagal menghapus data");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const url = isEdit ? `/api/master/pejabat/${editId}` : "/api/master/pejabat";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error || "Gagal menyimpan data penandatangan");
        setSubmitting(false);
        return;
      }

      toast.success(isEdit ? "Data penandatangan diperbarui" : "Penandatangan baru berhasil ditambahkan");
      setModalOpen(false);
      fetchData();
    } catch (e) {
      toast.error("Terjadi kesalahan server");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardShell active="master">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-red-700 border border-red-200/80 text-xs font-semibold mb-2">
            <Award size={14} /> Konfigurasi Dokumen & SKPD
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Pejabat Penandatangan Dokumen
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Pengaturan Kepala Badan Pengelolaan Keuangan, Pendapatan dan Aset Daerah (BPKPAD) serta pejabat penandatangan cetakan SKPD dan SSPD BPHTB.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-md shadow-red-600/30 active:scale-95 transition"
        >
          <PlusCircle size={16} />
          <span>Tambah Pejabat</span>
        </button>
      </div>

      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 rounded-l-xl">Kode Jabatan</th>
                <th className="px-4 py-3">Nama Pejabat & NIP</th>
                <th className="px-4 py-3">Jabatan Resmi</th>
                <th className="px-4 py-3">Kota / Domisili</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-center rounded-r-xl">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-slate-500">
                    Memuat data pejabat penandatangan...
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-slate-500">
                    Belum ada data penandatangan. Klik tombol Tambah untuk membuat baru.
                  </td>
                </tr>
              ) : (
                (() => {
                  const paginatedData = data.slice((page - 1) * limit, page * limit);
                  return paginatedData.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition">
                      <td className="px-4 py-3.5">
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-mono font-bold bg-slate-100 text-slate-800 border border-slate-200">
                          {item.kode}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <p className="font-bold text-slate-900 text-sm">{item.nama}</p>
                        <p className="text-[11px] text-slate-500 font-mono">NIP. {item.nip}</p>
                        {item.pangkat && (
                          <p className="text-[10px] text-slate-400 italic">{item.pangkat}</p>
                        )}
                      </td>
                      <td className="px-4 py-3.5 max-w-xs">
                        <p className="text-slate-800 font-semibold leading-relaxed">
                          {item.jabatan}
                        </p>
                      </td>
                      <td className="px-4 py-3.5 text-slate-600 font-medium">
                        {item.kota || "Sipirok"}
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        {item.status === 1 ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            <CheckCircle2 size={12} /> Aktif
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                            <XCircle size={12} /> Nonaktif
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(item)}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 transition"
                            title="Edit Pejabat"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition"
                            title="Hapus Pejabat"
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
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleSubmit}
            className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-xl animate-fadeIn"
          >
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Award size={20} className="text-red-600" />
              {isEdit ? "Edit Pejabat Penandatangan" : "Tambah Pejabat Penandatangan"}
            </h3>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Kode Identifikasi *</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: KEPALA_BADAN"
                    value={form.kode}
                    onChange={(e) => setForm({ ...form, kode: e.target.value.toUpperCase() })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono font-bold focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                  <p className="text-[10px] text-slate-400 mt-0.5">Gunakan KEPALA_BADAN untuk tanda tangan SKPD utama</p>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Status Penandatangan *</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: parseInt(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500 font-semibold"
                  >
                    <option value={1}>Aktif (Digunakan saat Cetak)</option>
                    <option value={0}>Nonaktif / Riwayat</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nama Lengkap & Gelar *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: M. FRANANDA, S.E, M.M"
                  value={form.nama}
                  onChange={(e) => setForm({ ...form, nama: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500 font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">NIP Pejabat *</label>
                  <input
                    type="text"
                    required
                    placeholder="19800723 200312 1 002"
                    value={form.nip}
                    onChange={(e) => setForm({ ...form, nip: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Pangkat / Golongan</label>
                  <input
                    type="text"
                    placeholder="Pembina Utama Muda (IV/c)"
                    value={form.pangkat}
                    onChange={(e) => setForm({ ...form, pangkat: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Jabatan Resmi (Teks Lengkap Tanda Tangan) *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="KEPALA BADAN PENGELOLAAN KEUANGAN, PENDAPATAN DAN ASET DAERAH SELAKU PEJABAT PENGELOLA KEUANGAN DAERAH"
                  value={form.jabatan}
                  onChange={(e) => setForm({ ...form, jabatan: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500 text-xs uppercase"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Kota Tempat Penetapan / Tanda Tangan</label>
                <input
                  type="text"
                  placeholder="Sipirok"
                  value={form.kota}
                  onChange={(e) => setForm({ ...form, kota: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500 font-semibold"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs disabled:opacity-50 transition shadow-md shadow-red-600/30 cursor-pointer"
              >
                {submitting ? "Menyimpan..." : "Simpan Pejabat"}
              </button>
            </div>
          </form>
        </div>
      )}
    </DashboardShell>
  );
}
