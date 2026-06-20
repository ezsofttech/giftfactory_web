import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function ProductCardSkeleton() {
  return (
    <Card className="h-full overflow-hidden gap-0 py-0">
      <CardHeader className="p-0">
        <div className="aspect-square relative overflow-hidden">
          <Skeleton className="w-full h-full rounded-none" />

          {/* Placeholder for action buttons */}
          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 px-4 opacity-0">
            <Skeleton className="h-10 w-full rounded-full" />
            <Skeleton className="h-10 w-10 rounded-full" />
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <Skeleton className="h-5 w-3/4" />
          <div className="flex items-center ml-2">
            <Skeleton className="h-4 w-4 rounded-full mr-1" />
            <Skeleton className="h-4 w-6" />
          </div>
        </div>

        <div className="flex items-center gap-2 mb-2">
          <Skeleton className="h-5 w-12" />
          <Skeleton className="h-4 w-8" />
        </div>

        <div className="space-y-2 mb-3">
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-4/5" />
        </div>

        <div className="flex flex-wrap gap-1">
          <Skeleton className="h-6 w-12 rounded-full" />
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-6 w-10 rounded-full" />
        </div>
      </CardContent>
    </Card>
  );
}
