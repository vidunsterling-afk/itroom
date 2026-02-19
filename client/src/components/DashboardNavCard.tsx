import { Link } from "react-router-dom";

type Props = {
  to: string;
  title: string;
  description: string;
};

export function DashboardNavCard({ to, title, description }: Props) {
  return (
    <Link
      to={to}
      className="rounded-2xl border border-slate-800 bg-slate-900/30 p-4 hover:bg-slate-900/50 transition"
    >
      <div className="font-medium">{title}</div>
      <div className="text-sm text-slate-400">{description}</div>
    </Link>
  );
}

export function DashboardNavCardDenied({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-red-800 bg-red-900/20 p-4">
      <div className="font-medium text-red-300">{title}</div>
      <div className="text-sm text-red-400">{description}</div>
    </div>
  );
}
