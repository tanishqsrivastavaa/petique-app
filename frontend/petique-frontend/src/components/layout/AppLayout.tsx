import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'

const AppLayout = () => {
    return (
        <div className="flex min-h-screen">
            <Sidebar />
            <main className="ml-[72px] flex-1 p-8 transition-[margin] duration-300">
                <Outlet />
            </main>
        </div>
    )
}

export default AppLayout
