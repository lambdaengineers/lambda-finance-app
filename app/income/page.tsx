"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type IncomeRow = {
  id: string;
  date: string;
  invoice_number: string | null;
  project: string | null;
  description: string | null;
  amount: number | null;
  hst: number | null;
  total: number | null;
  status: string | null;
};

export default function IncomePage() {
  const [rows, setRows] = useState<IncomeRow[]>([]);
  const [form, setForm] = useState({
    date: new Date().toISOString().split("T")[0],
    invoice_number: "",
    project: "",
    description: "",
    amount: "",
    hst: "",
    total: "",
    status: "unpaid",
  });

  const loadRows = async () => {
    const { data, error } = await supabase
      .from("income")
      .select("*")
      .order("date", { ascending: false });

    if (error) {
      console.error("Error loading income:", error);
      return;
    }

    setRows(data || []);
  };

  useEffect(() => {
    loadRows();
  }, []);

  const handleAmountChange = (value: string) => {
    const amount = Number(value || 0);
    const hst = amount * 0.13;
    const total = amount + hst;

    setForm((prev) => ({
      ...prev,
      amount: value,
      hst: hst ? hst.toFixed(2) : "",
      total: total ? total.toFixed(2) : "",
    }));
  };

  const addRow = async () => {
    if (!form.date || !form.description || !form.amount) return;

    const { error } = await supabase.from("income").insert([
      {
        date: form.date,
        invoice_number: form.invoice_number || null,
        project: form.project || null,
        description: form.description,
        amount: Number(form.amount || 0),
        hst: Number(form.hst || 0),
        total: Number(form.total || 0),
        status: form.status,
      },
    ]);

    if (error) {
      console.error("Error adding income:", error);
      return;
    }

    setForm({
      date: new Date().toISOString().split("T")[0],
      invoice_number: "",
      project: "",
      description: "",
      amount: "",
      hst: "",
      total: "",
      status: "unpaid",
    });

    loadRows();
  };

  const deleteRow = async (id: string) => {
    const { error } = await supabase.from("income").delete().eq("id", id);

    if (error) {
      console.error("Error deleting income row:", error);
      return;
    }

    loadRows();
  };

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Income</h1>
            <p className="text-gray-600">Revenue ledger</p>
          </div>
          <Link href="/" className="rounded-lg bg-black px-4 py-2 text-white">
            Back to Dashboard
          </Link>
        </div>

        <div className="mb-6 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-200">
          <h2 className="mb-4 text-lg font-semibold">Add Income</h2>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <input
              className="rounded border p-2"
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
            />

            <input
              className="rounded border p-2"
              placeholder="Invoice #"
              value={form.invoice_number}
              onChange={(e) =>
                setForm({ ...form, invoice_number: e.target.value })
              }
            />

            <input
              className="rounded border p-2"
              placeholder="Project"
              value={form.project}
              onChange={(e) => setForm({ ...form, project: e.target.value })}
            />

            <input
              className="rounded border p-2"
              placeholder="Description"
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
            />

            <input
              className="rounded border p-2"
              placeholder="Amount"
              value={form.amount}
              onChange={(e) => handleAmountChange(e.target.value)}
            />

            <input
              className="rounded border bg-gray-100 p-2"
              placeholder="HST"
              value={form.hst}
              readOnly
            />

            <input
              className="rounded border bg-gray-100 p-2"
              placeholder="Total"
              value={form.total}
              readOnly
            />

            <select
              className="rounded border p-2"
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
            >
              <option value="unpaid">Unpaid</option>
              <option value="paid">Paid</option>
              <option value="partial">Partial</option>
            </select>
          </div>

          <button
            onClick={addRow}
            className="mt-4 rounded-lg bg-black px-4 py-2 text-white"
          >
            Add Income
          </button>
        </div>

        <div className="overflow-x-auto rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-200">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b text-left">
                <th className="py-3">Date</th>
                <th>Invoice #</th>
                <th>Project</th>
                <th>Description</th>
                <th>Amount</th>
                <th>HST</th>
                <th>Total</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-b">
                  <td className="py-3">{row.date}</td>
                  <td>{row.invoice_number}</td>
                  <td>{row.project}</td>
                  <td>{row.description}</td>
                  <td>${Number(row.amount || 0).toFixed(2)}</td>
                  <td>${Number(row.hst || 0).toFixed(2)}</td>
                  <td>${Number(row.total || 0).toFixed(2)}</td>
                  <td>{row.status}</td>
                  <td>
                    <button
                      onClick={() => deleteRow(row.id)}
                      className="rounded bg-red-600 px-3 py-1 text-white"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {rows.length === 0 && (
            <p className="py-4 text-gray-500">No income records yet.</p>
          )}
        </div>
      </div>
    </main>
  );
}