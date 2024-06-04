import { AuthProvider } from "@/app/helper/authContext";
import { LockTableItem } from "../../layouts/dataTable";
import AdminComponent from "@/app/layouts/adminComponent";


export default function LocksPage() {
    return (
        <AuthProvider>
            <AdminComponent>
                <LockTableItem />
            </AdminComponent>
        </AuthProvider>
    );
}
