"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type RecurringRow = {
  id: string;
  vendor: string;
  category: string | null;
  description: string | null;
  amount: number | null;
  hst: number | null;
  total: number | null;
  frequency: string | null;
  next_due_date: string | null;
  status: string | null;
};

export default function RecurringPage() {
  const [rows, setRows] = useState<RecurringRow[]>([]);
  const [form, setForm] = useState({
    vendor: "",
    category: "",
    description: "",
    amount: "",
    hst: "",
    total: "",
    frequency: "monthly",
    next_due_date: "",
    status: "active",
  });

  const loadRows = async () => {
    const { data, error } = await supabase
      .from("recurring_bills")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error loading recurring bills:", error);
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
    if (!form.vendor || !form.amount) return;

    const { error } = await supabase.from("recurring_bills").insert([
      {
        vendor: form.vendor,
        category: form.category || null,
        description: form.description || null,
        amount: Number(form.amount || 0),
        hst: Number(form.hst || 0),
        total: Number(form.total || 0),
        frequency: form.frequency,
        next_due_date: form.next_due_date || null,
        status: form.status,
      },
    ]);

    if (error) {
      console.error("Error adding recurring bill:", error);
      alert(`Error adding recurring bill: ${error.message}`);
      return;
    }

    setForm({
      vendor: "",
      category: "",
      description: "",
      amount: "",
      hst: "",
      total: "",
      frequency: "monthly",
      next_due_date: "",
      status: "active",
    });

    loadRows();
  };

  const deleteRow = async (id: string) => {
    const { error } = await supabase
      .from("recurring_bills")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting recurring bill:", error);
      alert(`Error deleting recurring bill: ${error.message}`);
      return;
    }

    loadRows();
  };

  const postToExpenses = async (row: RecurringRow) => {
    const { error } = await supabase.from("expenses").insert([
      {
        date: new Date().toISOString().split("T")[0],
        category: row.category || "Recurring",
        vendor: row.vendor,
        project: null,
        description: row.description || "Recurring expense",
        amount: Number(row.amount || 0),
        hst: Number(row.hst || 0),
        total: Number(row.total || 0),
        payment_method: "Recurring",
        comments: `Posted from recurring bill (${row.frequency || "recurring"})`,
      },
    ]);

    if (error) {
      console.error("Error posting to expenses:", error);
      alert(`Error posting to expenses: ${error.message}`);
      return;
    }

    alert("Posted to expenses successfully.");
  };

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Recurring Expenses</h1>
            <p className="text-gray-600">
              Templates for repeating costs that can be posted to Expenses
            </p>
          </div>
          <Link href="/" className="rounded-lg bg-black px-4 py-2 text-white">
            Back to Dashboard
          </Link>
        </div>

        <div className="mb-6 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-200">
          <h2 className="mb-4 text-lg font-semibold">Add Recurring Expense</h2>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <input
              className="rounded border p-2"
              placeholder="Vendor"
              value={form.vendor}
              onChange={(e) => setForm({ ...form, vendor: e.target.value })}
            />
            <input
              className="rounded border p-2"
              placeholder="Category"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
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
              value={form.frequency}
              onChange={(e) => setForm({ ...form, frequency: e.target.value })}
            >
              <option value="monthly">Monthly</option>
              <option value="weekly">Weekly</option>
              <option value="quarterly">Quarterly</option>
              <option value="yearly">Yearly</option>
            </select>
            <input
              className="rounded border p-2"
              type="date"
              value={form.next_due_date}
              onChange={(e) =>
                setForm({ ...form, next_due_date: e.target.value })
              }
            />
          </div>

          <button
            onClick={addRow}
            className="mt-4 rounded-lg bg-black px-4 py-2 text-white"
          >
            Add Recurring Expense
          </button>
        </div>

        <div className="overflow-x-auto rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-200">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b text-left">
                <th className="py-3">Vendor</th>
                <th>Category</th>
                <th>Description</th>
                <th>Amount</th>
                <th>HST</th>
                <th>Total</th>
                <th>Frequency</th>
                <th>Next Due</th>
                <th>Status</th>
                <th>Post</th>
                <th>Delete</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-b">
                  <td className="py-3">{row.vendor}</td>
                  <td>{row.category}</td>
                  <td>{row.description}</td>
                  <td>${Number(row.amount || 0).toFixed(2)}</td>
                  <td>${Number(row.hst || 0).toFixed(2)}</td>
                  <td>${Number(row.total || 0).toFixed(2)}</td>
                  <td>{row.frequency}</td>
                  <td>{row.next_due_date}</td>
                  <td>{row.status}</td>
                  <td>
                    <button
                      onClick={() => postToExpenses(row)}
                      className="rounded bg-green-600 px-3 py-1 text-white"
                    >
                      Post
                    </button>
                  </td>
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
            <p className="py-4 text-gray-500">No recurring bills yet.</p>
          )}
        </div>
      </div>
    </main>
  );
}