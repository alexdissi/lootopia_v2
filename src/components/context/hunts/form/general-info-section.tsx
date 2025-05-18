"use client";

import type { Control } from "react-hook-form";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
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
import { Button } from "@/components/ui/button";
import { FormValues } from "@/schemas/hunt-schema";
import { LocationSearch } from "@/components/ui/location-search";

interface GeneralInfoSectionProps {
  control: Control<FormValues>;
}

export function GeneralInfoSection({ control }: GeneralInfoSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Informations générales</CardTitle>
        <CardDescription>
          Détails de base de votre chasse au trésor
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <FormField
          control={control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Titre</FormLabel>
              <FormControl>
                <Input placeholder="Nom de votre chasse au trésor" {...field} />
              </FormControl>
              <FormDescription>
                Choisissez un titre accrocheur pour votre chasse.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Décrivez votre chasse au trésor"
                  className="min-h-[120px]"
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <DatePickerField
            control={control}
            name="startDate"
            label="Date de début"
          />

          <DatePickerField
            control={control}
            name="endDate"
            label="Date de fin"
          />
        </div>

        <FormField
          control={control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Lieu</FormLabel>
              <FormControl>
                <LocationSearch
                  value={field.value || ""}
                  onChange={field.onChange}
                  placeholder="Rechercher un lieu pour votre chasse"
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
          control={control}
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
          control={control}
          name="fee"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Frais de participation (en couronnes)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min="0"
                  placeholder="0"
                  value={field.value || 0}
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
  );
}

interface DatePickerFieldProps {
  control: Control<FormValues>;
  name: "startDate" | "endDate";
  label: string;
}

function DatePickerField({ control, name, label }: DatePickerFieldProps) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className="flex flex-col">
          <FormLabel>{label}</FormLabel>
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
  );
}
