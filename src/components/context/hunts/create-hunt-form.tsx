"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {useMutation, useQueryClient} from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";

import { Form } from "@/components/ui/form";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { formSchema, FormValues } from "@/schemas/hunt-schema";
import { GeneralInfoSection } from "@/components/context/hunts/form/general-info-section";
import { StepsSection } from "@/components/context/hunts/form/steps-section";

export function CreateHuntForm() {
  const router = useRouter();
  const queryClient = useQueryClient()
  const [steps, setSteps] = useState<
    { description: string; stepOrder: number }[]
  >([{ description: "", stepOrder: 1 }]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      mode: "PUBLIC",
      fee: 0,
      location: "",
      mapStyle: "",
      steps: [{ description: "", stepOrder: 1 }],
    },
  });

  const createHuntMutation = useMutation({
    mutationFn: async (data: FormValues) => {
      const response = await fetch("/api/hunt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create hunt");
      }

      return response.json();
    },
  });

  const addStep = () => {
    const newSteps = [
      ...steps,
      { description: "", stepOrder: steps.length + 1 },
    ];
    setSteps(newSteps);
    form.setValue("steps", newSteps);
  };

  const removeStep = (index: number) => {
    if (steps.length === 1) {
      return; // Keep at least one step
    }

    const newSteps = steps
      .filter((_, i) => i !== index)
      .map((step, i) => ({ ...step, stepOrder: i + 1 }));

    setSteps(newSteps);
    form.setValue("steps", newSteps);
  };

  const onSubmit = (data: FormValues) => {
    createHuntMutation.mutate(data, {
      onSuccess: async () => {
        await queryClient.invalidateQueries({ queryKey: ['hunts'] });
        toast.success("Chasse au trésor créée avec succès !");
        router.push("/dashboard/hunts");
      },
      onError: (error: any) => {
        toast.error(
            error.message || "Une erreur s'est produite lors de la création.",
        );
      },
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="grid gap-8">
          <GeneralInfoSection control={form.control} />
          <StepsSection
            control={form.control}
            register={form.register}
            steps={steps}
            addStep={addStep}
            removeStep={removeStep}
          />

          <Button
            type="submit"
            className="ml-auto"
            disabled={createHuntMutation.isPending}
          >
            {createHuntMutation.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Créer la chasse au trésor
          </Button>
        </div>
      </form>
    </Form>
  );
}
