import { AuthProvider } from '@/helper/authContext';
import AdminComponent from '../../layouts/adminComponent';
import Dashboard from '@/app/layouts/dashboard';

export default function AdminPage() {
    return (
        <AuthProvider>
            <AdminComponent>
                <Dashboard />
            </AdminComponent>
        </AuthProvider>
    );
}
