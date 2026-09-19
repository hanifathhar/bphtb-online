"use client";

import { useState, useEffect } from "react";
import DashboardShell from "@/components/DashboardShell";
import Pagination from "@/components/Pagination";
import {
  Layers,
  PlusCircle,
  Edit2,
  Trash2,
  Percent,
} from "lucide-react";
import { toast } from "sonner";

export default function MasterJenisTransaksiPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const limit = 10;
  const [modalOpen, setModalOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState({
    jnsTransaksi: "",
    keterangan: "",
    nopptkp: 80000000,
    tarif: 5.0,
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/master/jenis-transaksi");
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
      jnsTransaksi: String((data.length + 1) || 1),
      keterangan: "",
      nopptkp: 80000000,
      tarif: 5.0,
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (item: any) => {
    setIsEdit(true);
    setEditId(item.id);
    setForm({
      jnsTransaksi: String(item.jnsTransaksi),
      keterangan: item.keterangan,
      nopptkp: Number(item.nopptkp || 0),
      tarif: Number(item.tarif || 5.0),
    });
    setModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Hapus data jenis transaksi ini?")) return;
    try {
      const res = await fetch(`/api/master/jenis-transaksi/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Jenis transaksi berhasil dihapus");
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
      const url = isEdit ? `/api/master/jenis-transaksi/${editId}` : "/api/master/jenis-transaksi";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error || "Gagal menyimpan data");
        setSubmitting(false);
        return;
      }

      toast.success(isEdit ? "Data diperbarui" : "Jenis transaksi ditambahkan");
      setModalOpen(false);
      fetchData();
    } catch (e) {
      toast.error("Terjadi kesalahan server");
    } finally {
      setSubmitting(false);
    }
  };

  const formatRupiah = (val: number | string) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(Number(val) || 0);
  };

  return (
    <DashboardShell active="master">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-red-700 border border-red-200/80 text-red-600 text-xs font-semibold mb-2">
            <Layers size={14} /> Master Perpajakan
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Master Jenis Transaksi & NOPPTKP
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Pengaturan perolehan hak (Jual Beli, Hibah, Waris, Lelang, dll), nilai ambang batas NPOPTKP, dan tarif BPHTB.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold  text-slate-950 font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-teal-500/20 active:scale-95 transition"
        >
          <PlusCircle size={16} />
          <span>Tambah Jenis Transaksi</span>
        </button>
      </div>

      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 rounded-l-xl">Kode</th>
                <th className="px-4 py-3">Nama Jenis Perolehan Hak</th>
                <th className="px-4 py-3 text-right">Nilai NPOPTKP (Bebas Pajak)</th>
                <th className="px-4 py-3 text-center">Tarif</th>
                <th className="px-4 py-3 text-center rounded-r-xl">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-slate-500">
                    Memuat data jenis transaksi...
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-slate-500">
                    Belum ada data jenis transaksi.
                  </td>
                </tr>
              ) : (
                (() => {
                  const totalPages = Math.ceil(data.length / limit) || 1;
                  const paginatedData = data.slice((page - 1) * limit, page * limit);
                  return paginatedData.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-100 transition">
                      <td className="px-4 py-3.5 font-bold font-mono text-red-600">
                        {item.jnsTransaksi}
                      </td>
                      <td className="px-4 py-3.5 text-slate-900 font-bold">
                        {item.keterangan}
                      </td>
                      <td className="px-4 py-3.5 text-right font-bold text-emerald-600 font-mono">
                        {formatRupiah(item.nopptkp)}
                      </td>
                      <td className="px-4 py-3.5 text-center font-bold text-slate-800">
                        {Number(item.tarif || 5)}%
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
              <Layers size={20} className="text-red-600" />
              {isEdit ? "Edit Jenis Transaksi" : "Tambah Jenis Transaksi"}
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Kode Transaksi (Angka) *</label>
                <input
                  type="number"
                  required
                  disabled={isEdit}
                  placeholder="Contoh: 1"
                  value={form.jnsTransaksi}
                  onChange={(e) => setForm({ ...form, jnsTransaksi: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Keterangan / Nama Transaksi *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Jual Beli / Hibah / Waris"
                  value={form.keterangan}
                  onChange={(e) => setForm({ ...form, keterangan: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nilai NPOPTKP (Rp) *</label>
                <input
                  type="number"
                  required
                  placeholder="Contoh: 80000000 atau 300000000"
                  value={form.nopptkp}
                  onChange={(e) => setForm({ ...form, nopptkp: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tarif BPHTB (%)</label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="5.0"
                  value={form.tarif}
                  onChange={(e) => setForm({ ...form, tarif: parseFloat(e.target.value) || 5.0 })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-red-500"
                />
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
                {submitting ? "Menyimpan..." : "Simpan Data"}
              </button>
            </div>
          </form>
        </div>
      )}
    </DashboardShell>
  );
}
