"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type DashboardStats = {
  incomeTotal: number;
  expenseTotal: number;
  unpaidIncome: number;
  hstCollected: number;
  hstPaid: number;
};

export default function HomePage() {
  const [stats, setStats] = useState<DashboardStats>({
    incomeTotal: 0,
    expenseTotal: 0,
    unpaidIncome: 0,
    hstCollected: 0,
    hstPaid: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      const [{ data: income }, { data: expenses }] = await Promise.all([
        supabase.from("income").select("total, hst, status"),
        supabase.from("expenses").select("total, hst"),
      ]);

      const incomeTotal =
        income?.reduce((sum, row) => sum + Number(row.total || 0), 0) || 0;
      const expenseTotal =
        expenses?.reduce((sum, row) => sum + Number(row.total || 0), 0) || 0;
      const unpaidIncome =
        income?.reduce(
          (sum, row) =>
            row.status !== "paid" ? sum + Number(row.total || 0) : sum,
          0
        ) || 0;
      const hstCollected =
        income?.reduce((sum, row) => sum + Number(row.hst || 0), 0) || 0;
      const hstPaid =
        expenses?.reduce((sum, row) => sum + Number(row.hst || 0), 0) || 0;

      setStats({
        incomeTotal,
        expenseTotal,
        unpaidIncome,
        hstCollected,
        hstPaid,
      });
      setLoading(false);
    };

    loadDashboard();
  }, []);

  const netProfit = stats.incomeTotal - stats.expenseTotal;
  const hstOwing = stats.hstCollected - stats.hstPaid;

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-7xl">
        <h1 className="mb-2 text-3xl font-bold">Lambda Financial App</h1>
        <p className="mb-8 text-gray-600">Dashboard</p>

        <div className="mb-8 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <StatCard title="Total Income" value={stats.incomeTotal} loading={loading} />
          <StatCard title="Total Expenses" value={stats.expenseTotal} loading={loading} />
          <StatCard title="Net Profit" value={netProfit} loading={loading} />
          <StatCard title="Unpaid Invoices" value={stats.unpaidIncome} loading={loading} />
          <StatCard title="HST Owing" value={hstOwing} loading={loading} />
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <NavCard title="Income" href="/income" description="Track revenue and invoice receipts" />
          <NavCard title="Expenses" href="/expense" description="Track company and project expenses" />
          <NavCard title="HST Tracking" href="/hst" description="View HST collected, paid, and owing" />
          <NavCard title="Recurring Billing" href="/recurring" description="Track subscriptions and recurring costs" />
          <NavCard title="Vehicle Log" href="/vehicle-log" description="Track business mileage and trips" />
          <NavCard title="Projects" href="/projects" description="Manage project list to financials" />
        </div>
      </div>
    </main>
  );
}

function StatCard({
  title,
  value,
  loading,
}: {
  title: string;
  value: number;
  loading: boolean;
}) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-200">
      <p className="text-sm text-gray-500">{title}</p>
      <p className="mt-2 text-2xl font-semibold">
        {loading ? "Loading..." : `$${value.toLocaleString()}`}
      </p>
    </div>
  );
}

function NavCard({
  title,
  href,
  description,
}: {
  title: string;
  href: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-200 transition hover:shadow-md"
    >
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="mt-2 text-sm text-gray-600">{description}</p>
    </Link>
  );
}