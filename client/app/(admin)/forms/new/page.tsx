"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createFormSchema, type CreateFormInput } from "@/lib/validators";
import { FORM_MODES } from "@/lib/constants";
import { FormMode, FormStatus } from "@/types";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import api from "@/config/axios";
import { API_CONTS } from "@/lib/api";
import { firebaseService } from "@/lib/firebaseService";

export default function NewFormPage() {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch
  } = useForm({
    resolver: zodResolver(createFormSchema),
    defaultValues: {
      description: "",
      mode: FormMode.NORMAL_FORM,
      status: FormStatus.DRAFT
    }
  });

  const onSubmit = async (data: CreateFormInput) => {
    setIsCreating(true);

    try {
      const token = await firebaseService.getUserAccessToken();

      // Send only title and description as requested, server handles defaults
      const payload = {
        title: data.title,
        description: data.description?.trim() || "",
      };

      // Ensure trailing slash for Django backend if it's sensitive
      const url = API_CONTS.FORMS.CREATE.endsWith('/')
        ? API_CONTS.FORMS.CREATE
        : `${API_CONTS.FORMS.CREATE}/`;

      const response = await api.post(url, payload, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      toast.success("Form created successfully!");
      // Redirect to the newly created form's detail page or edit page
      // Assuming the API returns the created form with an id
      const createdFormId = response.data.id;
      router.push(`/forms`);
    } catch (error: any) {
      console.error("Error creating form:", error);
      const errorMessage = error.response?.data?.detail || "Failed to create form. Please try again.";
      toast.error(errorMessage);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/forms">
          <Button variant="ghost" size="icon" disabled={isCreating}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create New Form</h1>
          <p className="text-muted-foreground">
            Start by entering basic information about your form
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="mx-auto w-full max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Form Details</CardTitle>
            <CardDescription>
              You can customize advanced settings after creating the form
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  placeholder="e.g., Semester 3 Internal Test"
                  {...register("title")}
                  disabled={isCreating}
                />
                {errors.title && (
                  <p className="text-sm text-red-500">{errors.title.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Provide a brief description of this form..."
                  rows={4}
                  {...register("description")}
                  disabled={isCreating}
                />
                {errors.description && (
                  <p className="text-sm text-red-500">{errors.description.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="mode">Form Type *</Label>
                <Select
                  defaultValue={watch("mode")}
                  onValueChange={(value) => setValue("mode", value as FormMode)}
                  disabled={isCreating}
                >
                  <SelectTrigger id="mode">
                    <SelectValue placeholder="Select form type" />
                  </SelectTrigger>
                  <SelectContent>
                    {FORM_MODES.map((mode) => (
                      <SelectItem key={mode.value} value={mode.value}>
                        {mode.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.mode && (
                  <p className="text-sm text-red-500">{errors.mode.message}</p>
                )}
                <p className="text-sm text-muted-foreground">
                  Choose "Quiz/Test" for timed assessments with scoring
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/forms")}
                  disabled={isCreating}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isCreating} className="flex-1">
                  {isCreating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Form"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
