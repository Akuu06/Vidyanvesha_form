"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Loader2, Save, FileText, Layers, HelpCircle, Hash, Timer, Database } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { z } from "zod";
import api from "@/config/axios";
import { API_CONTS } from "@/lib/api";
import { firebaseService } from "@/lib/firebaseService";
import { formQuestionService } from "@/service/FormQuestionService";
import { Form, FormSection } from "@/types/form.types";

const createFormQuestionSchema = z.object({
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

type CreateFormQuestionInput = z.infer<typeof createFormQuestionSchema>;

export default function CreateFormQuestionPage() {
    const router = useRouter();
    const [isCreating, setIsCreating] = useState(false);

    const [forms, setForms] = useState<Form[]>([]);
    const [sections, setSections] = useState<FormSection[]>([]);
    const [externalQuestions, setExternalQuestions] = useState<any[]>([]);

    const [isLoadingForms, setIsLoadingForms] = useState(true);
    const [isLoadingSections, setIsLoadingSections] = useState(false);
    const [isLoadingQuestions, setIsLoadingQuestions] = useState(true);

    const {
        handleSubmit,
        formState: { errors },
        setValue,
        watch,
        register
    } = useForm<CreateFormQuestionInput>({
        resolver: zodResolver(createFormQuestionSchema),
        defaultValues: {
            consider_for_analytics: true,
            is_required: true,
            order: 1,
            marks: 1,
            negative_marks: 0,
            section: null,
            shuffle_options_override: null,
            time_limit_seconds: 0
        }
    });

    const selectedForm = watch("form");

    // Fetch Forms and External Questions
    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const token = await firebaseService.getUserAccessToken();

                // Fetch Forms
                const formsRes = await api.get(API_CONTS.FORMS.LIST, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setForms(formsRes.data.results || []);
                setIsLoadingForms(false);

                // Fetch External Questions
                const questions = await formQuestionService.fetchExternalQuestions();
                setExternalQuestions(questions);
                setIsLoadingQuestions(false);
            } catch (error) {
                console.error("Error fetching initial data:", error);
                toast.error("Failed to load dependency data");
            }
        };

        fetchInitialData();
    }, []);

    // Fetch sections when form changes
    useEffect(() => {
        const fetchSections = async () => {
            if (!selectedForm) {
                setSections([]);
                return;
            }

            setIsLoadingSections(true);
            try {
                const token = await firebaseService.getUserAccessToken();
                // Assuming there's a way to filter sections by form, usually via query param or specific endpoint
                const sectionsRes = await api.get(`${API_CONTS.FORM_SECTIONS.LIST}?form=${selectedForm}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setSections(sectionsRes.data.results || []);
            } catch (error) {
                console.error("Error fetching sections:", error);
            } finally {
                setIsLoadingSections(false);
            }
        };

        fetchSections();
    }, [selectedForm]);

    const onSubmit = async (data: CreateFormQuestionInput) => {
        setIsCreating(true);
        try {
            await formQuestionService.createFormQuestion(data as any);
            toast.success("Question associated with form successfully!");
            router.push("/form-questions");
        } catch (error: any) {
            console.error("Error creating mapping:", error);
            const errorMessage = error.response?.data?.detail || "Failed to create association. Please check constraints.";
            toast.error(errorMessage);
        } finally {
            setIsCreating(false);
        }
    };

    return (
        <div className="flex flex-col gap-6 p-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link href="/form-questions">
                    <Button variant="ghost" size="icon" disabled={isCreating}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Add Form Question</h1>
                    <p className="text-muted-foreground">
                        Link a bank question to a specific form and section
                    </p>
                </div>
            </div>

            {/* Form */}
            <div className="mx-auto w-full max-w-3xl">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid gap-6 md:grid-cols-2">

                        {/* Primary Details Card */}
                        <Card className="md:col-span-2 border-t-4 border-t-primary">
                            <CardHeader>
                                <div className="flex items-center gap-2 mb-2">
                                    <Database className="h-5 w-5 text-primary" />
                                    <CardTitle>Association Details</CardTitle>
                                </div>
                                <CardDescription>Select the form, section, and bank question</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="form">Target Form *</Label>
                                    <Select
                                        onValueChange={(value) => setValue("form", Number(value), { shouldDirty: true })}
                                        disabled={isCreating || isLoadingForms}
                                    >
                                        <SelectTrigger id="form">
                                            <SelectValue placeholder={isLoadingForms ? "Loading forms..." : "Select form"} />
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
                                    <Label htmlFor="section">Section (Optional)</Label>
                                    <Select
                                        onValueChange={(value) => setValue("section", value === "none" ? null : Number(value), { shouldDirty: true })}
                                        disabled={isCreating || isLoadingSections || !selectedForm}
                                    >
                                        <SelectTrigger id="section">
                                            <SelectValue placeholder={isLoadingSections ? "Loading sections..." : (!selectedForm ? "Select form first" : "Select section")} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">No Section</SelectItem>
                                            {sections.map((s) => (
                                                <SelectItem key={s.id} value={s.id.toString()}>{s.title}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="question_id">Bank Question *</Label>
                                    <Select
                                        onValueChange={(value) => setValue("question_id", Number(value), { shouldDirty: true })}
                                        disabled={isCreating || isLoadingQuestions}
                                    >
                                        <SelectTrigger id="question">
                                            <SelectValue placeholder={isLoadingQuestions ? "Loading bank questions..." : "Select question from bank"} />
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
                                    <CardTitle>Ordering & Scoring</CardTitle>
                                </div>
                                <CardDescription>Define how the question behaves</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="order">Display Order</Label>
                                        <Input id="order" type="number" {...register("order", { valueAsNumber: true })} disabled={isCreating} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="marks">Marks</Label>
                                        <Input id="marks" type="number" step="0.5" {...register("marks", { valueAsNumber: true })} disabled={isCreating} />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="negative_marks">Negative Marks</Label>
                                    <Input id="negative_marks" type="number" step="0.5" {...register("negative_marks", { valueAsNumber: true })} disabled={isCreating} />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Settings Card */}
                        <Card className="border-t-4 border-t-blue-500">
                            <CardHeader>
                                <div className="flex items-center gap-2 mb-2">
                                    <Timer className="h-5 w-5 text-blue-500" />
                                    <CardTitle>Behavior & Analytics</CardTitle>
                                </div>
                                <CardDescription>Custom settings for this form</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between rounded-lg border p-3">
                                    <div className="space-y-0.5">
                                        <Label>Required</Label>
                                        <p className="text-[10px] text-muted-foreground italic">User must answer</p>
                                    </div>
                                    <Switch
                                        checked={watch("is_required")}
                                        onCheckedChange={(val) => setValue("is_required", val, { shouldDirty: true })}
                                        disabled={isCreating}
                                    />
                                </div>
                                <div className="flex items-center justify-between rounded-lg border p-3">
                                    <div className="space-y-0.5">
                                        <Label>Analytics</Label>
                                        <p className="text-[10px] text-muted-foreground italic">Track performance</p>
                                    </div>
                                    <Switch
                                        checked={watch("consider_for_analytics")}
                                        onCheckedChange={(val) => setValue("consider_for_analytics", val, { shouldDirty: true })}
                                        disabled={isCreating}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="time_limit">Time Limit (Seconds)</Label>
                                    <Input id="time_limit" type="number" {...register("time_limit_seconds", { valueAsNumber: true })} placeholder="0 for unlimited" disabled={isCreating} />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => router.push("/form-questions")}
                            disabled={isCreating}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isCreating} className="flex-1">
                            {isCreating ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Creating Association...
                                </>
                            ) : (
                                <>
                                    <Save className="mr-2 h-4 w-4" />
                                    Link Question to Form
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
