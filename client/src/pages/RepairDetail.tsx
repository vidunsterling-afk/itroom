import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { apiFetch } from "../lib/api";
import { getAccessToken } from "../lib/auth";
import { useAuth } from "../context/useAuth";
import Layout from "../components/Layout";

type Repair = {
  _id: string;
  assetId: string;
  vendorName: string;
  cost: number;
  status: string;
  reportedAt: string;
  issue: string;
  resolution?: string;
  isWarrantyClaim: boolean;
  warrantyExpiry?: string;
  warrantyProvider?: string;
  notes?: string;
  createdAt: string;
};

export default function RepairDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const canWrite = user?.role === "admin";

  const [repair, setRepair] = useState<Repair | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function load() {
    setErr(null);
    try {
      const token = getAccessToken();
      if (!token) throw new Error("No access token");

      const data = await apiFetch<{ repair: Repair }>(`/api/repairs/${id}`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });

      setRepair(data.repair);
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Failed");
    }
  }

  useEffect(() => {
    load(); /* eslint-disable-next-line */
  }, [id]);

  if (err) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="rounded-2xl border border-red-900 bg-red-950/30 p-4 text-red-200">
            {err}
          </div>
          <Link
            to="/repairs"
            className="inline-block mt-4 text-slate-300 hover:underline"
          >
            ← Back to Repairs
          </Link>
        </div>
      </div>
    );
  }

  if (!repair)
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 p-6">
        Loading...
      </div>
    );

  return (
    <Layout>
      <div className="min-h-screen bg-slate-950 text-slate-100 p-6">
        <div className="max-w-5xl mx-auto">
          <Link to="/repairs" className="text-slate-300 hover:underline">
            ← Back to Repairs
          </Link>

          <div className="mt-4 rounded-2xl border border-slate-800 bg-slate-900/30 p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl font-semibold">
                    {repair.vendorName}
                  </h1>
                  <span className="text-xs rounded-lg border border-slate-800 px-2 py-1 text-slate-300">
                    {repair.status}
                  </span>
                  {repair.isWarrantyClaim && (
                    <span className="text-xs rounded-lg border border-emerald-900 px-2 py-1 text-emerald-200 bg-emerald-950/20">
                      warranty
                    </span>
                  )}
                </div>

                <div className="mt-2 text-sm text-slate-400">
                  Reported:{" "}
                  <span className="text-slate-200">
                    {new Date(repair.reportedAt).toLocaleString()}
                  </span>{" "}
                  • Cost:{" "}
                  <span className="text-slate-200">{repair.cost ?? 0}</span>
                </div>

                <div className="mt-2 text-sm text-slate-400">
                  Warranty expiry:{" "}
                  <span className="text-slate-200">
                    {repair.warrantyExpiry
                      ? new Date(repair.warrantyExpiry).toLocaleDateString()
                      : "—"}
                  </span>{" "}
                  • Provider:{" "}
                  <span className="text-slate-200">
                    {repair.warrantyProvider ?? "—"}
                  </span>
                </div>

                <div className="mt-4">
                  <div className="text-sm text-slate-300 font-medium">
                    Issue
                  </div>
                  <div className="mt-1 text-slate-200 whitespace-pre-wrap">
                    {repair.issue}
                  </div>
                </div>

                {repair.resolution && (
                  <div className="mt-4">
                    <div className="text-sm text-slate-300 font-medium">
                      Resolution
                    </div>
                    <div className="mt-1 text-slate-200 whitespace-pre-wrap">
                      {repair.resolution}
                    </div>
                  </div>
                )}

                {repair.notes && (
                  <div className="mt-4 text-sm text-slate-300">
                    {repair.notes}
                  </div>
                )}
              </div>

              {canWrite && (
                <Link
                  to={`/repairs/${repair._id}/edit`}
                  className="rounded-xl border border-slate-800 px-4 py-2 hover:bg-slate-900"
                >
                  Edit
                </Link>
              )}
            </div>

            <div className="mt-4 text-sm text-slate-500">
              AssetId: {repair.assetId}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
