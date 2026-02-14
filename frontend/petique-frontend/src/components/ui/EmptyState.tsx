import { type LucideIcon } from 'lucide-react'
import { type ReactNode } from 'react'

type EmptyStateProps = {
    icon: LucideIcon
    title: string
    description: string
    action?: ReactNode
}

const EmptyState = ({ icon: Icon, title, description, action }: EmptyStateProps) => {
    return (
        <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-4 rounded-2xl bg-brand-50 p-4">
                <Icon size={32} className="text-brand-500" />
            </div>
            <h3 className="text-lg font-semibold text-ink">{title}</h3>
            <p className="mt-1 max-w-sm text-sm text-ink/60">{description}</p>
            {action && <div className="mt-6">{action}</div>}
        </div>
    )
}

export default EmptyState
