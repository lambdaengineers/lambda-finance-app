"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type ProjectRow = {
  id: string;
  project_number: string | null;
  project_name: string;
  client_name: string | null;
  status: string | null;
  payment_status: string | null;
  start_date: string | null;
  end_date: string | null;
  comments: string | null;
};

export default function ProjectsPage() {
  const [rows, setRows] = useState<ProjectRow[]>([]);
  const [form, setForm] = useState({
    project_number: "",
    project_name: "",
    client_name: "",
    status: "active",
    payment_status: "no",
    start_date: "",
    end_date: "",
    comments: "",
  });

  const loadRows = async () => {
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      return;
    }

    setRows(data || []);
  };

  useEffect(() => {
    loadRows();
  }, []);

  const addRow = async () => {
    if (!form.project_name) return;

    const { error } = await supabase.from("projects").insert([
      {
        project_number: form.project_number || null,
        project_name: form.project_name,
        client_name: form.client_name || null,
        status: form.status,
        payment_status: form.payment_status,
        start_date: form.start_date || null,
        end_date: form.end_date || null,
        comments: form.comments || null,
      },
    ]);

    if (error) {
      alert(error.message);
      return;
    }

    setForm({
      project_number: "",
      project_name: "",
      client_name: "",
      status: "active",
      payment_status: "no",
      start_date: "",
      end_date: "",
      comments: "",
    });

    loadRows();
  };

  const deleteRow = async (id: string) => {
    await supabase.from("projects").delete().eq("id", id);
    loadRows();
  };

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex justify-between">
          <h1 className="text-3xl font-bold">Projects</h1>
          <Link href="/" className="bg-black text-white px-4 py-2 rounded">
            Dashboard
          </Link>
        </div>

        {/* FORM */}
        <div className="bg-white p-5 rounded-xl shadow mb-6">
          <div className="grid gap-3 md:grid-cols-3">
            <input
              className="border p-2 rounded"
              placeholder="Project #"
              value={form.project_number}
              onChange={(e) =>
                setForm({ ...form, project_number: e.target.value })
              }
            />

            <input
              className="border p-2 rounded"
              placeholder="Project Name"
              value={form.project_name}
              onChange={(e) =>
                setForm({ ...form, project_name: e.target.value })
              }
            />

            <input
              className="border p-2 rounded"
              placeholder="Client"
              value={form.client_name}
              onChange={(e) =>
                setForm({ ...form, client_name: e.target.value })
              }
            />

            {/* STATUS */}
            <select
              className="border p-2 rounded"
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
            >
              <option value="active">Active</option>
              <option value="completed">Completed</option>
            </select>

            {/* PAYMENT STATUS */}
            <select
              className="border p-2 rounded"
              value={form.payment_status}
              onChange={(e) =>
                setForm({ ...form, payment_status: e.target.value })
              }
            >
              <option value="no">Balance Not Paid</option>
              <option value="yes">All Paid</option>
            </select>

            <input
              type="date"
              className="border p-2 rounded"
              value={form.start_date}
              onChange={(e) =>
                setForm({ ...form, start_date: e.target.value })
              }
            />

            <input
              type="date"
              className="border p-2 rounded"
              value={form.end_date}
              onChange={(e) =>
                setForm({ ...form, end_date: e.target.value })
              }
            />
          </div>

          {/* COMMENTS */}
          <textarea
            className="w-full border p-2 rounded mt-3"
            placeholder="Comments"
            rows={3}
            value={form.comments}
            onChange={(e) => setForm({ ...form, comments: e.target.value })}
          />

          <button
            onClick={addRow}
            className="mt-4 bg-black text-white px-4 py-2 rounded"
          >
            Add Project
          </button>
        </div>

        {/* TABLE */}
        <div className="bg-white p-5 rounded-xl shadow">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left">
                <th>Project #</th>
                <th>Name</th>
                <th>Client</th>
                <th>Status</th>
                <th>Payment</th>
                <th>Comments</th>
                <th></th>
              </tr>
            </thead>

            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-b">
                  <td>{row.project_number}</td>
                  <td>{row.project_name}</td>
                  <td>{row.client_name}</td>
                  <td>{row.status}</td>
                  <td>{row.payment_status === "yes" ? "Paid" : "Pending"}</td>
                  <td>{row.comments}</td>
                  <td>
                    <button
                      onClick={() => deleteRow(row.id)}
                      className="bg-red-500 text-white px-2 py-1 rounded"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {rows.length === 0 && (
            <p className="mt-4 text-gray-500">No projects yet</p>
          )}
        </div>
      </div>
    </main>
  );
}