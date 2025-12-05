import { LucideIcon } from "lucide-react";

interface StatsCardProps {
    title: string;
    value: string;
    subtitle: string;
    icon: LucideIcon;
    iconColorClass: string;
    borderColorClass: string;
}

export function StatsCard({
    title,
    value,
    subtitle,
    icon: Icon,
    iconColorClass,
    borderColorClass
}: StatsCardProps) {
    return (
        <div className={`glass rounded-2xl p-6 border border-white/10 hover:${borderColorClass} transition-all duration-300 group`}>
            <div className={`flex items-center gap-3 mb-2 ${iconColorClass}`}>
                <Icon className="w-5 h-5" />
                <h3 className="text-sm font-medium uppercase tracking-wider">{title}</h3>
            </div>
            <div className="text-3xl font-bold text-white group-hover:scale-105 transition-transform origin-left">
                {value}
            </div>
            <p className="text-sm text-gray-400 mt-1">
                {subtitle}
            </p>
        </div>
    );
}
