"use client";

import { useState, useEffect } from "react";
import DashboardShell from "@/components/DashboardShell";
import Pagination from "@/components/Pagination";
import { FileCheck2 } from "lucide-react";

export default function MasterKeperluanPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const limit = 10;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/master/keperluan");
        if (res.ok) {
          const json = await res.json();
          setData(json.data || []);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <DashboardShell active="master">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-red-700 border border-red-200/80 text-red-600 text-xs font-semibold mb-2">
            <FileCheck2 size={14} /> Master Perpajakan
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Master Keperluan BPHTB
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Daftar jenis keperluan permohonan sertifikat pertanahan (SHM, HGB, PTSL, Girik, dll).
          </p>
        </div>
      </div>

      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 rounded-l-xl">Kode</th>
                <th className="px-4 py-3">Nama Keperluan Pertanahan</th>
                <th className="px-4 py-3 text-center rounded-r-xl">Kategori</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {loading ? (
                <tr>
                  <td colSpan={3} className="px-4 py-12 text-center text-slate-500">
                    Memuat data keperluan...
                  </td>
                </tr>
              ) : (
                (() => {
                  const totalPages = Math.ceil(data.length / limit) || 1;
                  const paginatedData = data.slice((page - 1) * limit, page * limit);
                  return paginatedData.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-100 transition">
                      <td className="px-4 py-3.5 font-bold font-mono text-red-600">
                        {item.kode}
                      </td>
                      <td className="px-4 py-3.5 text-slate-900 font-bold">
                        {item.keterangan}
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <span className="px-2.5 py-1 rounded-full bg-slate-100 text-red-700 text-[11px] font-semibold">
                          Layanan Pertanahan / BPN
                        </span>
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
    </DashboardShell>
  );
}
