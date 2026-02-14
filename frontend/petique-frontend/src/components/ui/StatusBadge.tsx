type StatusBadgeProps = {
    status: string
}

const StatusBadge = ({ status }: StatusBadgeProps) => {
    const label = status.replace('_', ' ')
    const badgeClass = `badge-${status}`
    return <span className={badgeClass}>{label}</span>
}

export default StatusBadge
