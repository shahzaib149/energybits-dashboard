import { AppChrome } from "@/components/AppChrome";
import { getServerUser } from "@/lib/auth/getServerUser";

export async function AppChromeWithAuth({ children }: { children: React.ReactNode }) {
  const user = await getServerUser();
  return <AppChrome userRole={user?.role ?? null}>{children}</AppChrome>;
}
