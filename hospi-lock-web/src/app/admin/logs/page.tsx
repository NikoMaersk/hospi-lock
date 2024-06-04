import { AuthProvider } from "@/app/helper/authContext";
import { LogTableItem } from "../../layouts/dataTable";
import AdminComponent from "@/app/layouts/adminComponent";

export default function LogsPage() {
    return (
        <AuthProvider>
            <AdminComponent>
                <LogTableItem />
            </AdminComponent>
        </AuthProvider>
    );
}