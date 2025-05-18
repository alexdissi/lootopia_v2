"use client";

import type { Control, UseFormRegister } from "react-hook-form";
import { PlusCircle, Trash2 } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { FormValues } from "@/schemas/hunt-schema";

interface StepsSectionProps {
  control: Control<FormValues>;
  register: UseFormRegister<FormValues>;
  steps: { description: string; stepOrder: number }[];
  addStep: () => void;
  removeStep: (index: number) => void;
}

export function StepsSection({
  control,
  register,
  steps,
  addStep,
  removeStep,
}: StepsSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Étapes</CardTitle>
        <CardDescription>
          Définissez les étapes de votre chasse au trésor
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="space-y-6">
          {steps.map((step, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Étape {index + 1}</h3>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={steps.length === 1}
                  onClick={() => removeStep(index)}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Supprimer
                </Button>
              </div>

              <FormField
                control={control}
                name={`steps.${index}.description`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Décrivez cette étape..."
                        value={field.value || ""}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        name={field.name}
                        ref={field.ref}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <input
                type="hidden"
                {...register(`steps.${index}.stepOrder`)}
                value={index + 1}
              />
            </div>
          ))}

          <Button
            type="button"
            variant="outline"
            onClick={addStep}
            className="w-full"
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            Ajouter une étape
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
