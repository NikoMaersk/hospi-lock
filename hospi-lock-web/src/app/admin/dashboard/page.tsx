import { AuthProvider } from '@/helper/authContext';
import AdminComponent from '../../layouts/adminComponent';
import Welcome from '@/app/layouts/welcome';

export default function AdminPage() {
    return (
        <AuthProvider>
            <AdminComponent>
                <Welcome />
            </AdminComponent>
        </AuthProvider>
    );
}
