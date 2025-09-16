import AuthGate from "@/components/auth/AuthGate";
import { prefetchMe } from "@/services/auth";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";

export default async function LoginPage() {
  //TODO: call api server directly
  const qc = new QueryClient();
  await prefetchMe(qc);
  //   const userData = await getMe();
  return (
    <HydrationBoundary state={dehydrate(qc)}>
      <AuthGate />
    </HydrationBoundary>
  );
}
