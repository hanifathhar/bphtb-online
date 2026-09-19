"use client";

import { useState, useEffect } from "react";
import DashboardShell from "@/components/DashboardShell";
import Pagination from "@/components/Pagination";
import {
  MapPin,
  PlusCircle,
  Edit2,
  Trash2,
  Search,
  Building2,
  Save,
  X,
} from "lucide-react";
import { toast } from "sonner";

export default function MasterKecamatanPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const limit = 10;
  const [modalOpen, setModalOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState({ idKecamatan: "", kecamatan: "", idKabKota: "3201" });
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/master/kecamatan");
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
    setForm({ idKecamatan: "", kecamatan: "", idKabKota: "3201" });
    setModalOpen(true);
  };

  const handleOpenEdit = (item: any) => {
    setIsEdit(true);
    setEditId(item.id);
    setForm({
      idKecamatan: item.idKecamatan,
      kecamatan: item.kecamatan,
      idKabKota: item.idKabKota || "3201",
    });
    setModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Apakah Anda yakin ingin menghapus data kecamatan ini?")) return;
    try {
      const res = await fetch(`/api/master/kecamatan/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Kecamatan berhasil dihapus");
        fetchData();
      } else {
        toast.error("Gagal menghapus kecamatan");
      }
    } catch (e) {
      toast.error("Terjadi kesalahan server");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const url = isEdit ? `/api/master/kecamatan/${editId}` : "/api/master/kecamatan";
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

      toast.success(isEdit ? "Kecamatan diperbarui" : "Kecamatan baru ditambahkan");
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
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-red-600 text-xs font-bold mb-2 border border-red-200/80">
            <MapPin size={14} /> Master Wilayah
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Master Kecamatan
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Daftar wilayah kecamatan untuk penetapan zona objek pajak dan tarif NJOP Kabupaten Tapanuli Selatan.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-md shadow-red-600/20 active:scale-95 transition"
        >
          <PlusCircle size={16} />
          <span>Tambah Kecamatan</span>
        </button>
      </div>

      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-600 uppercase tracking-wider font-bold border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 rounded-l-xl">Kode Wilayah</th>
                <th className="px-4 py-3">Nama Kecamatan</th>
                <th className="px-4 py-3">Kode Kab/Kota</th>
                <th className="px-4 py-3 text-center">Jumlah Desa/Kelurahan</th>
                <th className="px-4 py-3 text-center rounded-r-xl">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-slate-500">
                    Memuat data kecamatan...
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-slate-500">
                    Belum ada data kecamatan.
                  </td>
                </tr>
              ) : (
                (() => {
                  const totalPages = Math.ceil(data.length / limit) || 1;
                  const paginatedData = data.slice((page - 1) * limit, page * limit);
                  return paginatedData.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition">
                      <td className="px-4 py-3.5 font-mono text-red-600 font-bold">
                        {item.idKecamatan}
                      </td>
                      <td className="px-4 py-3.5 text-slate-900 font-bold">
                        {item.kecamatan}
                      </td>
                      <td className="px-4 py-3.5 font-mono text-slate-500">
                        {item.idKabKota || "1203"}
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <span className="px-2.5 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200 font-bold text-[11px]">
                          {item._count?.desas || 0} Desa
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(item)}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900"
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
              <MapPin size={20} className="text-red-600" />
              {isEdit ? "Edit Kecamatan" : "Tambah Kecamatan Baru"}
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Kode Kecamatan *</label>
                <input
                  type="text"
                  required
                  disabled={isEdit}
                  placeholder="Contoh: 320101"
                  value={form.idKecamatan}
                  onChange={(e) => setForm({ ...form, idKecamatan: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nama Kecamatan *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Kecamatan Cibinong"
                  value={form.kecamatan}
                  onChange={(e) => setForm({ ...form, kecamatan: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Kode Kab/Kota</label>
                <input
                  type="text"
                  placeholder="Contoh: 3201"
                  value={form.idKabKota}
                  onChange={(e) => setForm({ ...form, idKabKota: e.target.value })}
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
