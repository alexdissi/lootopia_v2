"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { ArrowLeft, CalendarIcon, Loader2, PlusCircle, Trash2 } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { toast } from "@/components/ui/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

// Schéma de validation
const formSchema = z.object({
  title: z.string().min(3, "Le titre doit contenir au moins 3 caractères"),
  description: z.string().optional(),
  startDate: z.date().optional().nullable(),
  endDate: z.date().optional().nullable(),
  location: z.string().optional(),
  mode: z.enum(["PUBLIC", "PRIVATE"]),
  fee: z.coerce.number().min(0).optional(),
  mapStyle: z.string().optional(),
  status: z.enum(["PENDING", "IN_PROGRESS", "COMPLETED", "CANCELLED"]),
  steps: z.array(
    z.object({
      description: z.string().min(3, "La description doit contenir au moins 3 caractères"),
      stepOrder: z.number().int().min(1)
    })
  ).min(1, "Au moins une étape est requise")
});

type FormValues = z.infer<typeof formSchema>;

interface Step {
  id?: string;
  description: string;
  stepOrder: number;
}

interface HuntDetails {
  id: string;
  title: string;
  description: string | null;
  startDate: string | null;
  endDate: string | null;
  location: string | null;
  mode: "PUBLIC" | "PRIVATE";
  fee: number | null;
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  steps: Step[];
}

export default function EditHuntPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const huntId = params.id;
  const [steps, setSteps] = useState<Step[]>([]);

  // Définir le form avec des valeurs par défaut
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      startDate: null,
      endDate: null,
      location: "",
      mode: "PUBLIC",
      fee: 0,
      status: "PENDING",
      steps: [{ description: "", stepOrder: 1 }]
    }
  });
  
  // Récupérer les données de la chasse
  const { data: hunt, isLoading, error } = useQuery({
    queryKey: ["hunt", huntId],
    queryFn: async () => {
      const res = await fetch(`/api/hunt/${huntId}`);
      if (!res.ok) throw new Error("Failed to fetch hunt details");
      return res.json() as Promise<HuntDetails>;
    },
  });

  // Mise à jour du formulaire quand les données sont chargées
  useEffect(() => {
    if (hunt) {
      form.reset({
        title: hunt.title,
        description: hunt.description || "",
        startDate: hunt.startDate ? new Date(hunt.startDate) : null,
        endDate: hunt.endDate ? new Date(hunt.endDate) : null,
        location: hunt.location || "",
        mode: hunt.mode,
        fee: hunt.fee || 0,
        status: hunt.status,
        steps: hunt.steps.map(step => ({
          description: step.description,
          stepOrder: step.stepOrder
        }))
      });
      
      setSteps(hunt.steps.map(step => ({
        id: step.id,
        description: step.description,
        stepOrder: step.stepOrder
      })));
    }
  }, [hunt, form]);

  // Mutation pour mettre à jour la chasse
  const updateHuntMutation = useMutation({
    mutationFn: async (data: FormValues) => {
      const response = await fetch(`/api/hunt/${huntId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update hunt");
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Modifications enregistrées",
        description: "La chasse au trésor a été mise à jour avec succès.",
      });
      router.push(`/dashboard/hunts/${huntId}`);
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Une erreur s'est produite lors de la mise à jour.",
        variant: "destructive",
      });
    }
  });

  const addStep = () => {
    const newSteps = [
      ...steps,
      { description: "", stepOrder: steps.length + 1 }
    ];
    setSteps(newSteps);
    form.setValue("steps", newSteps);
  };

  const removeStep = (index: number) => {
    if (steps.length === 1) {
      return; // Keep at least one step
    }
    
    const newSteps = steps.filter((_, i) => i !== index)
      .map((step, i) => ({ ...step, stepOrder: i + 1 }));
    
    setSteps(newSteps);
    form.setValue("steps", newSteps);
  };

  const onSubmit = (data: FormValues) => {
    updateHuntMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="container py-10">
        <div className="flex items-center mb-8">
          <Skeleton className="h-8 w-8 mr-4" />
          <Skeleton className="h-8 w-48" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-3/4" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-40 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !hunt) {
    return (
      <div className="container py-10">
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold mb-2">Erreur</h2>
          <p className="text-muted-foreground">
            Impossible de charger les détails de cette chasse au trésor
          </p>
          <Button asChild className="mt-4">
            <Link href="/dashboard/hunts">Retour aux chasses</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-10">
      <div className="flex items-center mb-8">
        <Button variant="ghost" size="sm" asChild className="mr-4">
          <Link href={`/dashboard/hunts/${huntId}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">Modifier la chasse</h1>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="grid gap-8">
            <Card>
              <CardHeader>
                <CardTitle>Informations générales</CardTitle>
                <CardDescription>
                  Modifiez les détails de base de votre chasse au trésor
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
                        <Input placeholder="Nom de votre chasse au trésor" {...field} />
                      </FormControl>
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
                          {...field} 
                          value={field.value || ""}
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
                  "use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { ArrowLeft, CalendarIcon, Loader2, PlusCircle, Trash2 } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { toast } from "@/components/ui/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

// Schéma de validation
const formSchema = z.object({
  title: z.string().min(3, "Le titre doit contenir au moins 3 caractères"),
  description: z.string().optional(),
  startDate: z.date().optional().nullable(),
  endDate: z.date().optional().nullable(),
  location: z.string().optional(),
  mode: z.enum(["PUBLIC", "PRIVATE"]),
  fee: z.coerce.number().min(0).optional(),
  mapStyle: z.string().optional(),
  status: z.enum(["PENDING", "IN_PROGRESS", "COMPLETED", "CANCELLED"]),
  steps: z.array(
    z.object({
      description: z.string().min(3, "La description doit contenir au moins 3 caractères"),
      stepOrder: z.number().int().min(1)
    })
  ).min(1, "Au moins une étape est requise")
});

type FormValues = z.infer<typeof formSchema>;

interface Step {
  id?: string;
  description: string;
  stepOrder: number;
}

interface HuntDetails {
  id: string;
  title: string;
  description: string | null;
  startDate: string | null;
  endDate: string | null;
  location: string | null;
  mode: "PUBLIC" | "PRIVATE";
  fee: number | null;
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  steps: Step[];
}

export default function EditHuntPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const huntId = params.id;
  const [steps, setSteps] = useState<Step[]>([]);

  // Définir le form avec des valeurs par défaut
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      startDate: null,
      endDate: null,
      location: "",
      mode: "PUBLIC",
      fee: 0,
      status: "PENDING",
      steps: [{ description: "", stepOrder: 1 }]
    }
  });
  
  // Récupérer les données de la chasse
  const { data: hunt, isLoading, error } = useQuery({
    queryKey: ["hunt", huntId],
    queryFn: async () => {
      const res = await fetch(`/api/hunt/${huntId}`);
      if (!res.ok) throw new Error("Failed to fetch hunt details");
      return res.json() as Promise<HuntDetails>;
    },
  });

  // Mise à jour du formulaire quand les données sont chargées
  useEffect(() => {
    if (hunt) {
      form.reset({
        title: hunt.title,
        description: hunt.description || "",
        startDate: hunt.startDate ? new Date(hunt.startDate) : null,
        endDate: hunt.endDate ? new Date(hunt.endDate) : null,
        location: hunt.location || "",
        mode: hunt.mode,
        fee: hunt.fee || 0,
        status: hunt.status,
        steps: hunt.steps.map(step => ({
          description: step.description,
          stepOrder: step.stepOrder
        }))
      });
      
      setSteps(hunt.steps.map(step => ({
        id: step.id,
        description: step.description,
        stepOrder: step.stepOrder
      })));
    }
  }, [hunt, form]);

  // Mutation pour mettre à jour la chasse
  const updateHuntMutation = useMutation({
    mutationFn: async (data: FormValues) => {
      const response = await fetch(`/api/hunt/${huntId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update hunt");
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Modifications enregistrées",
        description: "La chasse au trésor a été mise à jour avec succès.",
      });
      router.push(`/dashboard/hunts/${huntId}`);
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Une erreur s'est produite lors de la mise à jour.",
        variant: "destructive",
      });
    }
  });

  const addStep = () => {
    const newSteps = [
      ...steps,
      { description: "", stepOrder: steps.length + 1 }
    ];
    setSteps(newSteps);
    form.setValue("steps", newSteps);
  };

  const removeStep = (index: number) => {
    if (steps.length === 1) {
      return; // Keep at least one step
    }
    
    const newSteps = steps.filter((_, i) => i !== index)
      .map((step, i) => ({ ...step, stepOrder: i + 1 }));
    
    setSteps(newSteps);
    form.setValue("steps", newSteps);
  };

  const onSubmit = (data: FormValues) => {
    updateHuntMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="container py-10">
        <div className="flex items-center mb-8">
          <Skeleton className="h-8 w-8 mr-4" />
          <Skeleton className="h-8 w-48" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-3/4" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-40 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !hunt) {
    return (
      <div className="container py-10">
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold mb-2">Erreur</h2>
          <p className="text-muted-foreground">
            Impossible de charger les détails de cette chasse au trésor
          </p>
          <Button asChild className="mt-4">
            <Link href="/dashboard/hunts">Retour aux chasses</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-10">
      <div className="flex items-center mb-8">
        <Button variant="ghost" size="sm" asChild className="mr-4">
          <Link href={`/dashboard/hunts/${huntId}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">Modifier la chasse</h1>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="grid gap-8">
            <Card>
              <CardHeader>
                <CardTitle>Informations générales</CardTitle>
                <CardDescription>
                  Modifiez les détails de base de votre chasse au trésor
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
                        <Input placeholder="Nom de votre chasse au trésor" {...field} />
                      </FormControl>
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
                          {...field} 
                          value={field.value || ""}
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
                  