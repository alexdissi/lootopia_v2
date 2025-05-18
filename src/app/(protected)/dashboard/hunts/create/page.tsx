"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { CalendarIcon, Loader2, PlusCircle, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { toast } from "sonner";

// Schéma de validation
const formSchema = z.object({
  title: z.string().min(3, "Le titre doit contenir au moins 3 caractères"),
  description: z.string().optional().default(""), // Valeur par défaut vide
  startDate: z.date().optional().nullable(),
  endDate: z.date().optional().nullable(),
  location: z.string().optional().default(""), // Valeur par défaut vide
  mode: z.enum(["PUBLIC", "PRIVATE"]),
  fee: z.coerce.number().min(0).optional().default(0), // Valeur par défaut 0
  mapStyle: z.string().optional().default(""), // Valeur par défaut vide
  steps: z
    .array(
      z.object({
        description: z
          .string()
          .min(3, "La description doit contenir au moins 3 caractères"),
        stepOrder: z.number().int().min(1),
      })
    )
    .min(1, "Au moins une étape est requise"),
});

type FormValues = z.infer<typeof formSchema>;

export default function CreateHuntPage() {
  const router = useRouter();
  const [steps, setSteps] = useState<
    { description: string; stepOrder: number }[]
  >([{ description: "", stepOrder: 1 }]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "", // Initialiser avec une chaîne vide au lieu de undefined
      mode: "PUBLIC",
      fee: 0,
      location: "", // Initialiser avec une chaîne vide au lieu de undefined
      mapStyle: "", // Initialiser avec une chaîne vide au lieu de undefined
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
      onSuccess: () => {
        toast.success("Chasse au trésor créée avec succès !");
        router.push("/dashboard/hunts");
      },
      onError: (error: any) => {
        toast.error(
          error.message || "Une erreur s'est produite lors de la création."
        );
      },
    });
  };

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-8">Créer une chasse au trésor</h1>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="grid gap-8">
            <Card>
              <CardHeader>
                <CardTitle>Informations générales</CardTitle>
                <CardDescription>
                  Détails de base de votre chasse au trésor
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Titre</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Nom de votre chasse au trésor"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Choisissez un titre accrocheur pour votre chasse.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Décrivez votre chasse au trésor"
                          className="min-h-[120px]"
                          value={field.value || ""} // S'assurer que la valeur n'est jamais undefined
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="startDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Date de début</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className="w-full pl-3 text-left font-normal"
                              >
                                {field.value ? (
                                  format(field.value, "PPP", { locale: fr })
                                ) : (
                                  <span className="text-muted-foreground">
                                    Sélectionnez une date
                                  </span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={field.value || undefined}
                              onSelect={field.onChange}
                              locale={fr}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="endDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Date de fin</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className="w-full pl-3 text-left font-normal"
                              >
                                {field.value ? (
                                  format(field.value, "PPP", { locale: fr })
                                ) : (
                                  <span className="text-muted-foreground">
                                    Sélectionnez une date
                                  </span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={field.value || undefined}
                              onSelect={field.onChange}
                              locale={fr}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Lieu</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Localisation de la chasse"
                          value={field.value || ""} // S'assurer que la valeur n'est jamais undefined
                          onChange={field.onChange}
                          onBlur={field.onBlur}
                          name={field.name}
                          ref={field.ref}
                        />
                      </FormControl>
                      <FormDescription>
                        Précisez où se déroulera votre chasse au trésor.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="mode"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>Mode de la chasse</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex flex-col space-y-1"
                        >
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="PUBLIC" />
                            </FormControl>
                            <FormLabel className="font-normal">
                              Publique - Visible par tous les utilisateurs
                            </FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="PRIVATE" />
                            </FormControl>
                            <FormLabel className="font-normal">
                              Privée - Sur invitation seulement
                            </FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="fee"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Frais de participation (en couronnes)
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          placeholder="0"
                          value={field.value || 0} // S'assurer que la valeur n'est jamais undefined
                          onChange={field.onChange}
                          onBlur={field.onBlur}
                          name={field.name}
                          ref={field.ref}
                        />
                      </FormControl>
                      <FormDescription>
                        Frais prélevés aux participants (0 = gratuit)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

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
                        <h3 className="text-lg font-medium">
                          Étape {index + 1}
                        </h3>
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
                        control={form.control}
                        name={`steps.${index}.description`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Décrivez cette étape..."
                                value={field.value || ""} // S'assurer que la valeur n'est jamais undefined
                                onChange={(e) => {
                                  field.onChange(e);
                                  const newSteps = [...steps];
                                  newSteps[index].description = e.target.value;
                                  setSteps(newSteps);
                                }}
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
                        {...form.register(`steps.${index}.stepOrder`)}
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

            <Card>
              <CardFooter className="pt-6">
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
              </CardFooter>
            </Card>
          </div>
        </form>
      </Form>
    </div>
  );
}
