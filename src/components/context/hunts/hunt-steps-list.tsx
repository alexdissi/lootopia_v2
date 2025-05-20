import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MapPin } from "lucide-react";
import Image from "next/image";

interface LocationType {
  latitude: number;
  longitude: number;
  address?: string;
}

interface HuntStepType {
  id: string;
  title?: string;
  description?: string;
  imageUrl?: string;
  stepOrder: number;
  location?: LocationType;
  createdAt?: string;
}

interface HuntStepsListProps {
  steps: HuntStepType[];
}

export function HuntStepsList({ steps }: HuntStepsListProps) {
  if (!steps || steps.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">
          Aucune étape n'a été définie pour cette chasse au trésor.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Parcours de la chasse</h2>
      <div className="space-y-4">
        {steps.map((step, index) => (
          <Card key={step.id} className="overflow-hidden">
            <div className="flex flex-col md:flex-row">
              {step.imageUrl && (
                <div className="relative w-full md:w-48 h-40 flex-shrink-0">
                  <Image
                    src={step.imageUrl}
                    alt={step.title || `Étape ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              <div className="flex-grow">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="inline-block bg-primary/10 text-primary rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </span>
                      {step.title || `Étape ${index + 1}`}
                    </div>
                  </CardTitle>
                  {step.description && (
                    <CardDescription>{step.description}</CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  {step.location && (
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5" />
                      <span>
                        {step.location.address ||
                          `${step.location.latitude}, ${step.location.longitude}`}
                      </span>
                    </div>
                  )}
                </CardContent>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
