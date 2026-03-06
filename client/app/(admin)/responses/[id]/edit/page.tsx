"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Loader2, Save, FileText, Calendar as CalendarIcon, ClipboardCheck } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import Link from "next/link";
import { z } from "zod";
import api from "@/config/axios";
import { API_CONTS } from "@/lib/api";
import { firebaseService } from "@/lib/firebaseService";
import { formResponseService } from "@/service/FormResponseService";
import { Form, FormResponse } from "@/types/form.types";
import { format } from "date-fns";

const editResponseSchema = z.object({
    form: z.number().min(1, "Please select a form"),
    score: z.number().min(0, "Score cannot be negative"),
    passed: z.boolean(),
    is_completed: z.boolean(),
    started_at: z.string().min(1, "Start date is required"),
    submitted_at: z.string().optional().nullable(),
});

type EditResponseInput = z.infer<typeof editResponseSchema>;

export default function EditResponsePage() {
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
    } = useForm<EditResponseInput>({
        resolver: zodResolver(editResponseSchema),
    });

    const isCompletedValue = watch("is_completed");
    const passedValue = watch("passed");
    const currentFormId = watch("form");

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

                // Fetch response details
                const response = await formResponseService.getFormResponseById(Number(id));
                reset({
                    form: response.form,
                    score: response.score,
                    passed: response.passed,
                    is_completed: response.is_completed,
                    started_at: response.started_at,
                    submitted_at: response.submitted_at
                });
            } catch (error) {
                console.error("Error fetching data:", error);
                toast.error("Failed to load response details");
            } finally {
                setIsLoading(false);
            }
        };

        if (id) fetchData();
    }, [id, reset]);

    const onSubmit = async (data: EditResponseInput) => {
        setIsSaving(true);
        try {
            await formResponseService.updateFormResponse(Number(id), data);
            toast.success("Form response updated successfully!");
            router.push("/responses");
        } catch (error: any) {
            console.error("Error updating response:", error);
            const errorMessage = error.response?.data?.detail || "Failed to update record. Please check all fields.";
            toast.error(errorMessage);
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex h-[400px] w-full flex-col items-center justify-center gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-muted-foreground">Loading response details...</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6 p-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link href="/responses">
                    <Button variant="ghost" size="icon" disabled={isSaving}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Edit Record</h1>
                    <p className="text-muted-foreground">
                        Update submission metadata and scoring
                    </p>
                </div>
            </div>

            {/* Form */}
            <div className="mx-auto w-full max-w-2xl">
                <Card className="border-t-4 border-t-blue-600">
                    <CardHeader>
                        <div className="flex items-center gap-2 mb-2">
                            <ClipboardCheck className="h-5 w-5 text-blue-600" />
                            <CardTitle>Metadata Update</CardTitle>
                        </div>
                        <CardDescription>
                            Modify the scoring and status of this attempt
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="form">Associated Form *</Label>
                                <Select
                                    value={currentFormId?.toString()}
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

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="score">Current Score</Label>
                                    <Input
                                        id="score"
                                        type="number"
                                        step="0.1"
                                        {...register("score", { valueAsNumber: true })}
                                        disabled={isSaving}
                                    />
                                    {errors.score && (
                                        <p className="text-sm text-red-500">{errors.score.message}</p>
                                    )}
                                </div>
                                <div className="flex items-end pb-2">
                                    <div className="flex items-center space-x-2">
                                        <Switch
                                            id="passed"
                                            checked={passedValue}
                                            onCheckedChange={(checked) => setValue("passed", checked, { shouldDirty: true })}
                                            disabled={isSaving}
                                        />
                                        <Label htmlFor="passed">Passed Status</Label>
                                    </div>
                                </div>
                            </div>

                            <Separator />

                            <div className="space-y-4">
                                <div className="flex items-center justify-between rounded-lg border p-4 bg-muted/30">
                                    <div className="space-y-0.5">
                                        <Label htmlFor="completed">Completion Status</Label>
                                        <p className="text-sm text-muted-foreground">
                                            Mark if the attempt is finalized
                                        </p>
                                    </div>
                                    <Switch
                                        id="completed"
                                        checked={isCompletedValue}
                                        onCheckedChange={(checked) => setValue("is_completed", checked, { shouldDirty: true })}
                                        disabled={isSaving}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="started_at">Started At</Label>
                                    <Input
                                        id="started_at"
                                        type="datetime-local"
                                        defaultValue={watch("started_at") ? format(new Date(watch("started_at")), "yyyy-MM-dd'T'HH:mm") : ""}
                                        onChange={(e) => setValue("started_at", new Date(e.target.value).toISOString(), { shouldDirty: true })}
                                        disabled={isSaving}
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => router.push("/responses")}
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