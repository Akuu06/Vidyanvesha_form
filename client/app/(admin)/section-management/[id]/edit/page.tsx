"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { z } from "zod";
import api from "@/config/axios";
import { API_CONTS } from "@/lib/api";
import { firebaseService } from "@/lib/firebaseService";
import { formSectionsService } from "@/service/FormSectionsService";
import { Form, FormSection } from "@/types/form.types";

const editSectionSchema = z.object({
    form: z.number().min(1, "Please select a form"),
    title: z.string().min(3, "Title must be at least 3 characters").max(300, "Title must not exceed 300 characters"),
    description: z.string().max(5000, "Description must not exceed 5000 characters").optional(),
    order: z.number().min(1, "Order must be at least 1"),
});

type EditSectionInput = z.infer<typeof editSectionSchema>;

export default function EditSectionPage() {
    const router = useRouter();
    const { id } = useParams();
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [forms, setForms] = useState<Form[]>([]);
    const [isLoadingForms, setIsLoadingForms] = useState(true);

    const {
        register,
        handleSubmit,
        formState: { errors, isDirty },
        setValue,
        reset,
        watch
    } = useForm<EditSectionInput>({
        resolver: zodResolver(editSectionSchema),
    });

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const token = await firebaseService.getUserAccessToken();

                // Fetch forms for dropdown
                const formsResponse = await api.get(API_CONTS.FORMS.LIST, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setForms(formsResponse.data.results || []);
                setIsLoadingForms(false);

                // Fetch section details
                const section = await formSectionsService.getFormSectionById(Number(id));
                reset({
                    form: section.form,
                    title: section.title,
                    description: section.description || "",
                    order: section.order
                });
            } catch (error) {
                console.error("Error fetching data:", error);
                toast.error("Failed to load section details");
            } finally {
                setIsLoading(false);
            }
        };

        if (id) fetchData();
    }, [id, reset]);

    const onSubmit = async (data: EditSectionInput) => {
        setIsSaving(true);
        try {
            await formSectionsService.updateFormSection(Number(id), data);
            toast.success("Section updated successfully!");
            router.push("/section-management");
        } catch (error: any) {
            console.error("Error updating section:", error);
            const errorMessage = error.response?.data?.detail || "Failed to update section. Please try again.";
            toast.error(errorMessage);
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex h-[400px] w-full flex-col items-center justify-center gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-muted-foreground">Loading section details...</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6 p-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link href="/section-management">
                    <Button variant="ghost" size="icon" disabled={isSaving}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Edit Section</h1>
                    <p className="text-muted-foreground">
                        Update the title, description or order of this section
                    </p>
                </div>
            </div>

            {/* Form */}
            <div className="mx-auto w-full max-w-2xl">
                <Card>
                    <CardHeader>
                        <CardTitle>Section Details</CardTitle>
                        <CardDescription>
                            Modify the details for this section
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="form">Select Form *</Label>
                                <Select
                                    value={watch("form")?.toString()}
                                    onValueChange={(value) => setValue("form", Number(value), { shouldDirty: true })}
                                    disabled={isSaving || isLoadingForms}
                                >
                                    <SelectTrigger id="form">
                                        <SelectValue placeholder={isLoadingForms ? "Loading forms..." : "Select a form"} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {forms.map((form) => (
                                            <SelectItem key={form.id} value={form.id.toString()}>
                                                {form.title}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.form && (
                                    <p className="text-sm text-red-500">{errors.form.message}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="title">Section Title *</Label>
                                <Input
                                    id="title"
                                    placeholder="e.g., Part A - Multiple Choice Questions"
                                    {...register("title")}
                                    disabled={isSaving}
                                />
                                {errors.title && (
                                    <p className="text-sm text-red-500">{errors.title.message}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    placeholder="Provide a brief description of this section..."
                                    rows={4}
                                    {...register("description")}
                                    disabled={isSaving}
                                />
                                {errors.description && (
                                    <p className="text-sm text-red-500">{errors.description.message}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="order">Display Order *</Label>
                                <Input
                                    id="order"
                                    type="number"
                                    min="1"
                                    {...register("order", { valueAsNumber: true })}
                                    disabled={isSaving}
                                />
                                {errors.order && (
                                    <p className="text-sm text-red-500">{errors.order.message}</p>
                                )}
                            </div>

                            <div className="flex gap-3 pt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => router.push("/section-management")}
                                    disabled={isSaving}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={isSaving || !isDirty} className="flex-1">
                                    {isSaving ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="mr-2 h-4 w-4" />
                                            Save Changes
                                        </>
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
