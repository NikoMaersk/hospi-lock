import { AuthProvider } from "@/app/helper/authContext";
import { UserTableItem } from "../../layouts/dataTable";
import AdminComponent from "@/app/layouts/adminComponent";


export default function UsersPage() {
    return (
        <AuthProvider>
            <AdminComponent>
                <UserTableItem />
            </AdminComponent>
        </AuthProvider>
    );
}
