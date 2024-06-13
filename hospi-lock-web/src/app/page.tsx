import { AuthProvider } from "./helper/authContext";
import HomePage from "./layouts/home";

export default function Home() {
  return (
    <main>
      <AuthProvider>
        <HomePage />
      </AuthProvider>
    </main>
  );
}
