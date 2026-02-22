import { Link } from "react-router-dom";
import { ArrowRight, Award } from "lucide-react";

interface DashboardNavCardProps {
  to: string;
  title: string;
  description: string;
  icon?: React.ReactNode;
  badge?: string;
}

export function DashboardNavCard({
  to,
  title,
  description,
  icon,
  badge,
}: DashboardNavCardProps) {
  return (
    <Link
      to={to}
      className="group relative block p-6 bg-gradient-to-br from-slate-900/50 to-slate-950/50 border border-slate-800 rounded-xl hover:border-slate-700 hover:from-slate-900/80 hover:to-slate-950/80 transition-all duration-300 hover:shadow-lg hover:shadow-slate-900/50 overflow-hidden"
    >
      {/* Hover effect gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="relative">
        <div className="flex items-start justify-between mb-4">
          <div className="p-3 bg-slate-800/80 rounded-xl group-hover:bg-slate-800 transition-all duration-200 ring-1 ring-slate-700/50 group-hover:ring-slate-600/50">
            {icon}
          </div>
          {badge && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700">
              <Award className="w-3 h-3 mr-1" />
              {badge}
            </span>
          )}
        </div>

        <div className="space-y-1">
          <h3 className="text-lg font-semibold text-white group-hover:text-blue-400 transition-colors duration-200">
            {title}
          </h3>
          <p className="text-sm text-slate-400 group-hover:text-slate-300 transition-colors duration-200 leading-relaxed">
            {description}
          </p>
        </div>

        <div className="mt-4 flex items-center text-sm font-medium text-slate-500 group-hover:text-blue-400 transition-colors duration-200">
          <span>Access module</span>
          <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform duration-200" />
        </div>
      </div>
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
    <div className="relative overflow-hidden rounded-xl border border-red-800/50 bg-gradient-to-br from-red-900/10 to-red-950/10 p-6">
      <div className="absolute inset-0 bg-red-500/5" />
      <div className="relative flex items-start space-x-3">
        <div className="p-2 bg-red-900/20 rounded-lg">
          <Award className="w-5 h-5 text-red-400" />
        </div>
        <div>
          <div className="font-medium text-red-300">{title}</div>
          <div className="mt-1 text-sm text-red-400/80">{description}</div>
        </div>
      </div>
    </div>
  );
}
