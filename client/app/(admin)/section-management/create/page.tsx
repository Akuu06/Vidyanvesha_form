"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { z } from "zod";
import api from "@/config/axios";
import { API_CONTS } from "@/lib/api";
import { firebaseService } from "@/lib/firebaseService";
import { formSectionsService } from "@/service/FormSectionsService";
import { Form } from "@/types/form.types";

const createSectionSchema = z.object({
    form: z.number().min(1, "Please select a form"),
    title: z.string().min(3, "Title must be at least 3 characters").max(300, "Title must not exceed 300 characters"),
    description: z.string().max(5000, "Description must not exceed 5000 characters").optional(),
    order: z.number().min(1, "Order must be at least 1"),
});

type CreateSectionInput = z.infer<typeof createSectionSchema>;

export default function CreateSectionPage() {
    const router = useRouter();
    const [isCreating, setIsCreating] = useState(false);
    const [forms, setForms] = useState<Form[]>([]);
    const [isLoadingForms, setIsLoadingForms] = useState(true);

    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
        watch
    } = useForm<CreateSectionInput>({
        resolver: zodResolver(createSectionSchema),
        defaultValues: {
            description: "",
            order: 1
        }
    });

    useEffect(() => {
        const fetchForms = async () => {
            setIsLoadingForms(true);
            try {
                const token = await firebaseService.getUserAccessToken();
                const response = await api.get(API_CONTS.FORMS.LIST, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setForms(response.data.results || []);
            } catch (error) {
                console.error("Error fetching forms:", error);
                toast.error("Failed to load forms");
            } finally {
                setIsLoadingForms(false);
            }
        };

        fetchForms();
    }, []);

    const onSubmit = async (data: CreateSectionInput) => {
        setIsCreating(true);
        try {
            await formSectionsService.createFormSection(data);
            toast.success("Section created successfully!");
            router.push("/section-management");
        } catch (error: any) {
            console.error("Error creating section:", error);
            const errorMessage = error.response?.data?.detail || "Failed to create section. Please try again.";
            toast.error(errorMessage);
        } finally {
            setIsCreating(false);
        }
    };

    return (
        <div className="flex flex-col gap-6 p-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link href="/section-management">
                    <Button variant="ghost" size="icon" disabled={isCreating}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Create New Section</h1>
                    <p className="text-muted-foreground">
                        Add a new section to an existing form
                    </p>
                </div>
            </div>

            {/* Form */}
            <div className="mx-auto w-full max-w-2xl">
                <Card>
                    <CardHeader>
                        <CardTitle>Section Details</CardTitle>
                        <CardDescription>
                            Define the title, description and display order for this section
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="form">Select Form *</Label>
                                <Select
                                    onValueChange={(value) => setValue("form", Number(value))}
                                    disabled={isCreating || isLoadingForms}
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
                                    placeholder="Provide a brief description of this section..."
                                    rows={4}
                                    {...register("description")}
                                    disabled={isCreating}
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
                                    disabled={isCreating}
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
                                        "Create Section"
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
