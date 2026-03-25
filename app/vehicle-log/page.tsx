"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type VehicleRow = {
  id: string;
  date: string;
  project: string | null;
  purpose: string | null;
  start_km: number | null;
  end_km: number | null;
  business_km: number | null;
  notes: string | null;
};

export default function VehicleLogPage() {
  const [rows, setRows] = useState<VehicleRow[]>([]);
  const [form, setForm] = useState({
    date: new Date().toISOString().split("T")[0],
    project: "",
    purpose: "",
    start_km: "",
    end_km: "",
    business_km: "",
    notes: "",
  });

  const loadRows = async () => {
    const { data } = await supabase
      .from("vehicle_logs")
      .select("*")
      .order("date", { ascending: false });
    setRows(data || []);
  };

  useEffect(() => {
    loadRows();
  }, []);

  const calculateBusinessKm = (start: string, end: string) => {
    const startNum = Number(start || 0);
    const endNum = Number(end || 0);
    const distance = endNum - startNum;

    setForm((prev) => ({
      ...prev,
      start_km: start,
      end_km: end,
      business_km: distance > 0 ? distance.toString() : "",
    }));
  };

  const addRow = async () => {
    if (!form.date || !form.start_km || !form.end_km) return;

    await supabase.from("vehicle_logs").insert([
      {
        date: form.date,
        project: form.project || null,
        purpose: form.purpose || null,
        start_km: Number(form.start_km || 0),
        end_km: Number(form.end_km || 0),
        business_km: Number(form.business_km || 0),
        notes: form.notes || null,
      },
    ]);

    setForm({
      date: new Date().toISOString().split("T")[0],
      project: "",
      purpose: "",
      start_km: "",
      end_km: "",
      business_km: "",
      notes: "",
    });

    loadRows();
  };

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Vehicle Log</h1>
            <p className="text-gray-600">Track business mileage</p>
          </div>
          <Link href="/" className="rounded-lg bg-black px-4 py-2 text-white">
            Back to Dashboard
          </Link>
        </div>

        <div className="mb-6 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-200">
          <h2 className="mb-4 text-lg font-semibold">Add Vehicle Trip</h2>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <input className="rounded border p-2" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
            <input className="rounded border p-2" placeholder="Project" value={form.project} onChange={(e) => setForm({ ...form, project: e.target.value })} />
            <input className="rounded border p-2" placeholder="Purpose" value={form.purpose} onChange={(e) => setForm({ ...form, purpose: e.target.value })} />
            <input className="rounded border p-2" placeholder="Start KM" value={form.start_km} onChange={(e) => calculateBusinessKm(e.target.value, form.end_km)} />
            <input className="rounded border p-2" placeholder="End KM" value={form.end_km} onChange={(e) => calculateBusinessKm(form.start_km, e.target.value)} />
            <input className="rounded border bg-gray-100 p-2" placeholder="Business KM" value={form.business_km} readOnly />
            <input className="rounded border p-2 xl:col-span-2" placeholder="Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </div>

          <button onClick={addRow} className="mt-4 rounded-lg bg-black px-4 py-2 text-white">
            Add Trip
          </button>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-200 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b text-left">
                <th className="py-3">Date</th>
                <th>Project</th>
                <th>Purpose</th>
                <th>Start KM</th>
                <th>End KM</th>
                <th>Business KM</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-b">
                  <td className="py-3">{row.date}</td>
                  <td>{row.project}</td>
                  <td>{row.purpose}</td>
                  <td>{row.start_km}</td>
                  <td>{row.end_km}</td>
                  <td>{row.business_km}</td>
                  <td>{row.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {rows.length === 0 && <p className="py-4 text-gray-500">No vehicle logs yet.</p>}
        </div>
      </div>
    </main>
  );
}