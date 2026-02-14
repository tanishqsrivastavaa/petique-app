import { type LucideIcon } from 'lucide-react'

type StatCardProps = {
    icon: LucideIcon
    label: string
    value: string | number
}

const StatCard = ({ icon: Icon, label, value }: StatCardProps) => {
    return (
        <div className="stat-card">
            <div className="rounded-xl bg-brand-50 p-3">
                <Icon size={22} className="text-brand-500" />
            </div>
            <div>
                <p className="text-2xl font-bold text-ink">{value}</p>
                <p className="text-sm text-ink/60">{label}</p>
            </div>
        </div>
    )
}

export default StatCard
