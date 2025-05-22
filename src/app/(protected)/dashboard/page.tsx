import { Suspense } from "react";
import { LoaderPage } from "@/components/ui/loader";

export default function Page() {
  return (
    <Suspense fallback={<LoaderPage />}>
      <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p>Welcome to the dashboard!</p>
      </div>
    </Suspense>
  );
}
