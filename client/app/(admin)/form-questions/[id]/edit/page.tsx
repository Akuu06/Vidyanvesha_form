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
import { ArrowLeft, Loader2, Save, FileText, Layers, Hash, Timer, Database } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import Link from "next/link";
import { z } from "zod";
import api from "@/config/axios";
import { API_CONTS } from "@/lib/api";
import { firebaseService } from "@/lib/firebaseService";
import { formQuestionService } from "@/service/FormQuestionService";
import { Form, FormSection, FormQuestion } from "@/types/form.types";

const editFormQuestionSchema = z.object({
    form: z.number().min(1, "Please select a form"),
    section: z.number().nullable().optional(),
    question_id: z.number().min(1, "Please select a question"),
    consider_for_analytics: z.boolean(),
    order: z.number().min(1, "Order must be at least 1"),
    is_required: z.boolean(),
    marks: z.number().min(0, "Marks cannot be negative"),
    negative_marks: z.number().min(0, "Negative marks cannot be negative"),
    shuffle_options_override: z.boolean().nullable().optional(),
    time_limit_seconds: z.number().min(0).nullable().optional(),
});

type EditFormQuestionInput = z.infer<typeof editFormQuestionSchema>;

export default function EditFormQuestionPage() {
    const router = useRouter();
    const { id } = useParams();
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    const [forms, setForms] = useState<Form[]>([]);
    const [sections, setSections] = useState<FormSection[]>([]);
    const [externalQuestions, setExternalQuestions] = useState<any[]>([]);

    const [isLoadingDependencies, setIsLoadingDependencies] = useState(true);

    const {
        register,
        handleSubmit,
        formState: { errors, isDirty },
        setValue,
        watch,
        reset
    } = useForm<EditFormQuestionInput>({
        resolver: zodResolver(editFormQuestionSchema),
    });

    const selectedForm = watch("form");

    // Fetch initial data
    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const token = await firebaseService.getUserAccessToken();

                // Fetch Forms
                const formsRes = await api.get(API_CONTS.FORMS.LIST, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setForms(formsRes.data.results || []);

                // Fetch External Questions
                const questions = await formQuestionService.fetchExternalQuestions();
                setExternalQuestions(questions);

                // Fetch the Form Question Mapping itself
                const mapping = await formQuestionService.getFormQuestionById(Number(id));
                reset({
                    form: mapping.form,
                    section: mapping.section,
                    question_id: mapping.question_id,
                    consider_for_analytics: mapping.consider_for_analytics,
                    order: mapping.order,
                    is_required: mapping.is_required,
                    marks: mapping.marks,
                    negative_marks: mapping.negative_marks,
                    shuffle_options_override: mapping.shuffle_options_override,
                    time_limit_seconds: mapping.time_limit_seconds
                });

                setIsLoadingDependencies(false);
            } catch (error) {
                console.error("Error fetching dependencies:", error);
                toast.error("Failed to load mapping data");
            } finally {
                setIsLoading(false);
            }
        };

        if (id) fetchData();
    }, [id, reset]);

    // Fetch sections when form changes
    useEffect(() => {
        const fetchSections = async () => {
            if (!selectedForm) {
                setSections([]);
                return;
            }

            try {
                const token = await firebaseService.getUserAccessToken();
                const sectionsRes = await api.get(`${API_CONTS.FORM_SECTIONS.LIST}?form=${selectedForm}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setSections(sectionsRes.data.results || []);
            } catch (error) {
                console.error("Error fetching sections:", error);
            }
        };

        if (!isLoading) fetchSections();
    }, [selectedForm, isLoading]);

    const onSubmit = async (data: EditFormQuestionInput) => {
        setIsSaving(true);
        try {
            await formQuestionService.updateFormQuestion(Number(id), data as any);
            toast.success("Question mapping updated successfully!");
            router.push("/form-questions");
        } catch (error: any) {
            console.error("Error updating mapping:", error);
            const errorMessage = error.response?.data?.detail || "Failed to update association.";
            toast.error(errorMessage);
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex h-[400px] w-full flex-col items-center justify-center gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-muted-foreground">Loading details...</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6 p-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link href="/form-questions">
                    <Button variant="ghost" size="icon" disabled={isSaving}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Edit Mapping</h1>
                    <p className="text-muted-foreground">Modify question behavior for this form</p>
                </div>
            </div>

            <div className="mx-auto w-full max-w-3xl">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid gap-6 md:grid-cols-2">

                        {/* Primary Details Card */}
                        <Card className="md:col-span-2 border-t-4 border-t-primary">
                            <CardHeader>
                                <div className="flex items-center gap-2 mb-2">
                                    <Database className="h-5 w-5 text-primary" />
                                    <CardTitle>Core Association</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="form">Target Form *</Label>
                                    <Select
                                        value={watch("form")?.toString()}
                                        onValueChange={(value) => setValue("form", Number(value), { shouldDirty: true })}
                                        disabled={isSaving}
                                    >
                                        <SelectTrigger id="form">
                                            <SelectValue placeholder="Select form" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {forms.map((f) => (
                                                <SelectItem key={f.id} value={f.id.toString()}>{f.title}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.form && <p className="text-xs text-red-500">{errors.form.message}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="section">Assigned Section</Label>
                                    <Select
                                        value={watch("section")?.toString() || "none"}
                                        onValueChange={(value) => setValue("section", value === "none" ? null : Number(value), { shouldDirty: true })}
                                        disabled={isSaving || !selectedForm}
                                    >
                                        <SelectTrigger id="section">
                                            <SelectValue placeholder="Select section" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">No Specific Section</SelectItem>
                                            {sections.map((s) => (
                                                <SelectItem key={s.id} value={s.id.toString()}>{s.title}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="question_id">Bank Question *</Label>
                                    <Select
                                        value={watch("question_id")?.toString()}
                                        onValueChange={(value) => setValue("question_id", Number(value), { shouldDirty: true })}
                                        disabled={isSaving}
                                    >
                                        <SelectTrigger id="question">
                                            <SelectValue placeholder="Select question" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {externalQuestions.map((q) => (
                                                <SelectItem key={q.id} value={q.id.toString()}>
                                                    [ID: {q.id}] {q.question_text?.substring(0, 60)}...
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.question_id && <p className="text-xs text-red-500">{errors.question_id.message}</p>}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Constraints Card */}
                        <Card className="border-t-4 border-t-amber-500">
                            <CardHeader>
                                <div className="flex items-center gap-2 mb-2">
                                    <Hash className="h-5 w-5 text-amber-500" />
                                    <CardTitle>Sequence & Marks</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="order">Order Index</Label>
                                        <Input id="order" type="number" {...register("order", { valueAsNumber: true })} disabled={isSaving} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="marks">Points</Label>
                                        <Input id="marks" type="number" step="0.5" {...register("marks", { valueAsNumber: true })} disabled={isSaving} />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="negative_marks">Negative Points</Label>
                                    <Input id="negative_marks" type="number" step="0.5" {...register("negative_marks", { valueAsNumber: true })} disabled={isSaving} />
                                </div>
                            </CardContent>
                        </Card>

                        {/* settings card */}
                        <Card className="border-t-4 border-t-blue-500">
                            <CardHeader>
                                <div className="flex items-center gap-2 mb-2">
                                    <Timer className="h-5 w-5 text-blue-500" />
                                    <CardTitle>Behavior</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between rounded-lg border p-3">
                                    <Label>Mandatory</Label>
                                    <Switch
                                        checked={watch("is_required")}
                                        onCheckedChange={(val) => setValue("is_required", val, { shouldDirty: true })}
                                        disabled={isSaving}
                                    />
                                </div>
                                <div className="flex items-center justify-between rounded-lg border p-3">
                                    <Label>Track Analytics</Label>
                                    <Switch
                                        checked={watch("consider_for_analytics")}
                                        onCheckedChange={(val) => setValue("consider_for_analytics", val, { shouldDirty: true })}
                                        disabled={isSaving}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="time_limit">Time Limit (s)</Label>
                                    <Input id="time_limit" type="number" {...register("time_limit_seconds", { valueAsNumber: true })} disabled={isSaving} />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => router.push("/form-questions")}
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
                                    Update Details
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
