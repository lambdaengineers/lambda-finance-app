"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

type ExpenseRow = {
  id: string;
  date: string;
  category: string | null;
  vendor: string | null;
  project: string | null;
  description: string | null;
  amount: number | null;
  hst: number | null;
  total: number | null;
  payment_method: string | null;
  comments: string | null;
};

export default function ExpensePage() {
  const [rows, setRows] = useState<ExpenseRow[]>([]);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [form, setForm] = useState({
    date: new Date().toISOString().split("T")[0],
    category: "",
    vendor: "",
    project: "",
    description: "",
    amount: "",
    hst: "",
    total: "",
    payment_method: "",
    comments: "",
  });

  const loadRows = async () => {
    const { data, error } = await supabase
      .from("expenses")
      .select("*")
      .order("date", { ascending: false });

    if (error) {
      console.error("Error loading expenses:", error);
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

    const { error } = await supabase.from("expenses").insert([
      {
        date: form.date,
        category: form.category || null,
        vendor: form.vendor || null,
        project: form.project || null,
        description: form.description,
        amount: Number(form.amount || 0),
        hst: Number(form.hst || 0),
        total: Number(form.total || 0),
        payment_method: form.payment_method || null,
        comments: form.comments || null,
      },
    ]);

    if (error) {
      console.error("Error adding expense:", JSON.stringify(error, null, 2));
      alert(`Error adding expense: ${error.message}`);
      return;
    }

    setForm({
      date: new Date().toISOString().split("T")[0],
      category: "",
      vendor: "",
      project: "",
      description: "",
      amount: "",
      hst: "",
      total: "",
      payment_method: "",
      comments: "",
    });

    loadRows();
  };

  const deleteRow = async (id: string) => {
    const { error } = await supabase.from("expenses").delete().eq("id", id);

    if (error) {
      console.error("Error deleting expense row:", error);
      alert(`Error deleting expense: ${error.message}`);
      return;
    }

    loadRows();
  };

  const categories = useMemo(() => {
    const unique = Array.from(
      new Set(rows.map((row) => row.category).filter(Boolean))
    ) as string[];

    return unique.sort((a, b) => a.localeCompare(b));
  }, [rows]);

  const filteredRows = useMemo(() => {
    if (categoryFilter === "all") return rows;
    return rows.filter((row) => row.category === categoryFilter);
  }, [rows, categoryFilter]);

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Expenses</h1>
            <p className="text-gray-600">Expense ledger</p>
          </div>
          <Link href="/" className="rounded-lg bg-black px-4 py-2 text-white">
            Back to Dashboard
          </Link>
        </div>

        <div className="mb-6 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-200">
          <h2 className="mb-4 text-lg font-semibold">Add Expense</h2>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <input
              className="rounded border p-2"
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
            />

            <input
              className="rounded border p-2"
              placeholder="Category"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            />

            <input
              className="rounded border p-2"
              placeholder="Vendor"
              value={form.vendor}
              onChange={(e) => setForm({ ...form, vendor: e.target.value })}
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

            <input
              className="rounded border p-2"
              placeholder="Payment Method"
              value={form.payment_method}
              onChange={(e) =>
                setForm({ ...form, payment_method: e.target.value })
              }
            />
          </div>

          <textarea
            className="mt-3 w-full rounded border p-2"
            placeholder="Comments"
            rows={3}
            value={form.comments}
            onChange={(e) => setForm({ ...form, comments: e.target.value })}
          />

          <button
            onClick={addRow}
            className="mt-4 rounded-lg bg-black px-4 py-2 text-white"
          >
            Add Expense
          </button>
        </div>

        <div className="mb-4 flex items-center gap-3">
          <label className="text-sm font-medium">Filter by Category:</label>
          <select
            className="rounded border p-2"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="all">All Categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        <div className="overflow-x-auto rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-200">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b text-left">
                <th className="py-3">Date</th>
                <th>Category</th>
                <th>Vendor</th>
                <th>Project</th>
                <th>Description</th>
                <th>Amount</th>
                <th>HST</th>
                <th>Total</th>
                <th>Payment Method</th>
                <th>Comments</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {filteredRows.map((row) => (
                <tr key={row.id} className="border-b">
                  <td className="py-3">{row.date}</td>
                  <td>{row.category}</td>
                  <td>{row.vendor}</td>
                  <td>{row.project}</td>
                  <td>{row.description}</td>
                  <td>${Number(row.amount || 0).toFixed(2)}</td>
                  <td>${Number(row.hst || 0).toFixed(2)}</td>
                  <td>${Number(row.total || 0).toFixed(2)}</td>
                  <td>{row.payment_method}</td>
                  <td>{row.comments}</td>
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

          {filteredRows.length === 0 && (
            <p className="py-4 text-gray-500">No expense records found.</p>
          )}
        </div>
      </div>
    </main>
  );
}