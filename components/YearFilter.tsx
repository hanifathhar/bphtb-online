"use client";

import { useEffect, useState } from "react";
import { Calendar } from "lucide-react";

interface YearFilterProps {
  selectedYear: string;
  onChange: (year: string) => void;
  allowAll?: boolean;
  className?: string;
}

export default function YearFilter({
  selectedYear,
  onChange,
  allowAll = true,
  className = "",
}: YearFilterProps) {
  const currentYearStr = new Date().getFullYear().toString();
  const [years, setYears] = useState<string[]>([currentYearStr]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadYears = async () => {
      try {
        const res = await fetch("/api/bphtb/years");
        if (res.ok) {
          const json = await res.json();
          if (json.years && json.years.length > 0) {
            setYears(json.years);
            // If current selectedYear is empty and allowAll is false, select latest year
            if (!selectedYear && !allowAll && json.currentYear) {
              onChange(json.currentYear);
            }
          }
        }
      } catch (err) {
        console.error("Failed to load years:", err);
      } finally {
        setLoading(false);
      }
    };
    loadYears();
  }, []);

  return (
    <div className={`inline-flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 shadow-xs ${className}`}>
      <Calendar size={14} className="text-slate-400 shrink-0" />
      <span className="text-[11px] font-semibold text-slate-500 hidden sm:inline">Tahun:</span>
      <select
        value={selectedYear}
        onChange={(e) => onChange(e.target.value)}
        className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none cursor-pointer pr-1"
      >
        {allowAll && <option value="">Semua Tahun</option>}
        {years.map((y) => (
          <option key={y} value={y}>
            {y}
          </option>
        ))}
      </select>
    </div>
  );
}
