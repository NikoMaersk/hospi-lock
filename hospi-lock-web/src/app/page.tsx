import { AuthProvider } from "./helper/authContext";
import AdminComponent from "./layouts/adminComponent";


export default function Home() {
  return (
    <main>
      <AuthProvider>
        <AdminComponent />
      </AuthProvider>
    </main>
  );
}
