import { NavLink, useNavigate } from 'react-router-dom'
import { getRole, clearToken } from '../../lib/auth'
import {
    LayoutDashboard,
    PawPrint,
    Stethoscope,
    CalendarCheck,
    UserCircle,
    Clock,
    CalendarOff,
    LogOut,
} from 'lucide-react'

const ownerLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/pets', label: 'My Pets', icon: PawPrint },
    { to: '/vets', label: 'Browse Vets', icon: Stethoscope },
    { to: '/bookings', label: 'My Bookings', icon: CalendarCheck },
]

const vetLinks = [
    { to: '/vet/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/vet/profile', label: 'My Profile', icon: UserCircle },
    { to: '/vet/schedule', label: 'Schedule', icon: Clock },
    { to: '/vet/time-off', label: 'Time Off', icon: CalendarOff },
]

const Sidebar = () => {
    const role = getRole()
    const navigate = useNavigate()
    const links = role === 'vet' ? vetLinks : ownerLinks

    const handleLogout = () => {
        clearToken()
        navigate('/login', { replace: true })
    }

    return (
        <aside className="sidebar group">
            {/* Logo */}
            <div className="flex items-center gap-2 px-5 py-6">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-500">
                    <PawPrint size={20} className="text-white" />
                </div>
                <span className="sidebar-label text-lg font-bold text-ink">
                    Petique
                </span>
            </div>

            {/* Nav */}
            <nav className="flex-1 space-y-1 px-3">
                {links.map((link) => (
                    <NavLink
                        key={link.to}
                        to={link.to}
                        className={({ isActive }) =>
                            isActive ? 'sidebar-link-active' : 'sidebar-link'
                        }
                        title={link.label}
                    >
                        <link.icon size={18} className="shrink-0" />
                        <span className="sidebar-label">{link.label}</span>
                    </NavLink>
                ))}
            </nav>

            {/* Logout */}
            <div className="border-t border-border px-3 py-4">
                <button onClick={handleLogout} className="sidebar-link w-full text-danger">
                    <LogOut size={18} className="shrink-0" />
                    <span className="sidebar-label">Sign out</span>
                </button>
            </div>
        </aside>
    )
}

export default Sidebar
