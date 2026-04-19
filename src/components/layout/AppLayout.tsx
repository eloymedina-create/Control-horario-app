import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { BottomNav } from './BottomNav';

export function AppLayout() {
    return (
        <div className="app-layout">
            <Sidebar />
            <div className="app-main">
                <Header />
                <main className="app-content has-bottom-nav">
                    <Outlet />
                </main>
                <BottomNav />
            </div>
        </div>
    );
}
