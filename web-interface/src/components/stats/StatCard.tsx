import type { ComponentType } from 'react';

interface StatCardProps {
  label: string;
  value: string;
  icon: ComponentType<{ size?: number; className?: string }>;
  accent?: 'default' | 'blocked' | 'good';
}

const ACCENT_CLASSES: Record<NonNullable<StatCardProps['accent']>, string> = {
  default: 'text-gray-100',
  blocked: 'text-rose-400',
  good: 'text-emerald-400',
};

export default function StatCard({ label, value, icon: Icon, accent = 'default' }: StatCardProps) {
  return (
    <div className="rounded-lg border border-gray-800 bg-gray-900 p-4 flex items-center gap-4">
      <div className="rounded-md bg-gray-800 p-2">
        <Icon size={20} className={ACCENT_CLASSES[accent]} />
      </div>
      <div>
        <div className="text-xs uppercase tracking-wide text-gray-500">{label}</div>
        <div className={`text-2xl font-semibold ${ACCENT_CLASSES[accent]}`}>{value}</div>
      </div>
    </div>
  );
}
