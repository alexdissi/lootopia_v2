import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function HuntsListSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array(6)
        .fill(0)
        .map((_, i) => (
          <Card key={i} className="overflow-hidden">
            <CardHeader className="pb-4">
              <Skeleton className="h-6 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-20 w-full mb-4" />
              <div className="flex justify-between">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-4 w-1/3" />
              </div>
            </CardContent>
          </Card>
        ))}
    </div>
  );
}

export function HuntsTabsSkeleton() {
  return (
    <>
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between mb-6">
        <Skeleton className="h-10 w-full md:max-w-sm" />
        <Skeleton className="h-10 w-full md:w-[180px]" />
      </div>

      <Tabs defaultValue="all">
        <TabsList className="mb-6">
          <TabsTrigger value="all">Toutes les chasses</TabsTrigger>
          <TabsTrigger value="mine">Mes chasses</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <HuntsListSkeleton />
        </TabsContent>
      </Tabs>
    </>
  );
}
