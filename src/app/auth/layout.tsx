import { Suspense } from "react";

import LiquidChrome from "@/components/ui/liquid";
import { LoaderPage } from "@/components/ui/loader";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<LoaderPage />}>
      <section>
        <div className="grid min-h-svh lg:grid-cols-2">
          <div className="bg-muted relative hidden lg:block">
            <LiquidChrome
              baseColor={[
                0.5058823529411764, 0.5450980392156862, 0.9764705882352941,
              ]}
              speed={0.1}
              amplitude={0.6}
            />
          </div>
          <div className="flex items-center justify-center min-h-screen px-4">
            {children}
          </div>
        </div>
      </section>
    </Suspense>
  );
}
