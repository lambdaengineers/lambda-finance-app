"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type IncomeHstRow = {
  id: string;
  date: string;
  invoice_number: string | null;
  project: string | null;
  description: string | null;
  hst: number | null;
  total: number | null;
  status: string | null;
};

type ExpenseHstRow = {
  id: string;
  date: string;
  category: string | null;
  vendor: string | null;
  project: string | null;
  description: string | null;
  hst: number | null;
  total: number | null;
  payment_method: string | null;
};

export default function HstPage() {
  const [incomeRows, setIncomeRows] = useState<IncomeHstRow[]>([]);
  const [expenseRows, setExpenseRows] = useState<ExpenseHstRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHstData = async () => {
      const [
        { data: incomeData, error: incomeError },
        { data: expenseData, error: expenseError },
      ] = await Promise.all([
        supabase
          .from("income")
          .select("id, date, invoice_number, project, description, hst, total, status")
          .order("date", { ascending: false }),
        supabase
          .from("expenses")
          .select("id, date, category, vendor, project, description, hst, total, payment_method")
          .order("date", { ascending: false }),
      ]);

      if (incomeError) {
        console.error("Income HST error:", incomeError);
      }

      if (expenseError) {
        console.error("Expense HST error:", expenseError);
      }

      setIncomeRows(incomeData || []);
      setExpenseRows(expenseData || []);
      setLoading(false);
    };

    loadHstData();
  }, []);

  const hstCollected = incomeRows.reduce(
    (sum, row) => sum + Number(row.hst || 0),
    0
  );

  const hstPaid = expenseRows.reduce(
    (sum, row) => sum + Number(row.hst || 0),
    0
  );

  const hstBalance = hstCollected - hstPaid;

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">HST Tracking</h1>
            <p className="text-gray-600">
              Summary plus source line items from income and expenses
            </p>
          </div>

          <Link href="/" className="rounded-lg bg-black px-4 py-2 text-white">
            Back to Dashboard
          </Link>
        </div>

        <div className="mb-8 grid gap-4 md:grid-cols-3">
          <Card title="HST Collected" value={hstCollected} loading={loading} />
          <Card title="HST Paid" value={hstPaid} loading={loading} />
          <BalanceCard value={hstBalance} loading={loading} />
        </div>

        <div className="mb-8 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-200 overflow-x-auto">
          <h2 className="mb-4 text-xl font-semibold">Income HST Line Items</h2>

          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b text-left">
                <th className="py-3">Date</th>
                <th>Invoice #</th>
                <th>Project</th>
                <th>Description</th>
                <th>HST</th>
                <th>Total</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {incomeRows.map((row) => (
                <tr key={row.id} className="border-b">
                  <td className="py-3">{row.date}</td>
                  <td>{row.invoice_number}</td>
                  <td>{row.project}</td>
                  <td>{row.description}</td>
                  <td>${Number(row.hst || 0).toFixed(2)}</td>
                  <td>${Number(row.total || 0).toFixed(2)}</td>
                  <td>{row.status}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {incomeRows.length === 0 && !loading && (
            <p className="py-4 text-gray-500">No income HST records yet.</p>
          )}
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-200 overflow-x-auto">
          <h2 className="mb-4 text-xl font-semibold">Expense HST Line Items</h2>

          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b text-left">
                <th className="py-3">Date</th>
                <th>Category</th>
                <th>Vendor</th>
                <th>Project</th>
                <th>Description</th>
                <th>HST</th>
                <th>Total</th>
                <th>Payment Method</th>
              </tr>
            </thead>
            <tbody>
              {expenseRows.map((row) => (
                <tr key={row.id} className="border-b">
                  <td className="py-3">{row.date}</td>
                  <td>{row.category}</td>
                  <td>{row.vendor}</td>
                  <td>{row.project}</td>
                  <td>{row.description}</td>
                  <td>${Number(row.hst || 0).toFixed(2)}</td>
                  <td>${Number(row.total || 0).toFixed(2)}</td>
                  <td>{row.payment_method}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {expenseRows.length === 0 && !loading && (
            <p className="py-4 text-gray-500">No expense HST records yet.</p>
          )}
        </div>
      </div>
    </main>
  );
}

function Card({
  title,
  value,
  loading,
}: {
  title: string;
  value: number;
  loading: boolean;
}) {
  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
      <p className="text-sm text-gray-500">{title}</p>
      <p className="mt-2 text-2xl font-semibold">
        {loading ? "Loading..." : `$${value.toFixed(2)}`}
      </p>
    </div>
  );
}

function BalanceCard({
  value,
  loading,
}: {
  value: number;
  loading: boolean;
}) {
  const label =
    value > 0 ? "HST Owing" : value < 0 ? "HST Credit" : "HST Balanced";

  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold">
        {loading ? "Loading..." : `$${Math.abs(value).toFixed(2)}`}
      </p>
    </div>
  );
}