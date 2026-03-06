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
import { ArrowLeft, Loader2, Save, BarChart3, HelpCircle } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { z } from "zod";
import api from "@/config/axios";
import { API_CONTS } from "@/lib/api";
import { firebaseService } from "@/lib/firebaseService";
import { questionAnalyticService } from "@/service/QuestionAnalyticService";
import { formQuestionService } from "@/service/FormQuestionService";
import { Form, FormQuestion, UpdateQuestionAnalyticPayload } from "@/types/form.types";

const editAnalyticSchema = z.object({
    form: z.number().min(1, "Please select a form"),
    question_id: z.number().min(1, "Please select a question"),
    total_attempts: z.number().min(0, "Total attempts must be 0 or more"),
    correct_attempts: z.number().min(0, "Correct attempts must be 0 or more"),
}).refine(data => data.correct_attempts <= data.total_attempts, {
    message: "Correct attempts cannot exceed total attempts",
    path: ["correct_attempts"]
});

type EditAnalyticInput = z.infer<typeof editAnalyticSchema>;

export default function EditQuestionAnalyticPage() {
    const router = useRouter();
    const { id } = useParams();
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [forms, setForms] = useState<Form[]>([]);
    const [questions, setQuestions] = useState<FormQuestion[]>([]);
    const [isLoadingForms, setIsLoadingForms] = useState(true);
    const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors, isDirty },
        setValue,
        reset,
        watch
    } = useForm<EditAnalyticInput>({
        resolver: zodResolver(editAnalyticSchema),
    });

    const selectedFormId = watch("form");

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

                // Fetch analytics details
                const data = await questionAnalyticService.getQuestionAnalyticById(Number(id));

                // Fetch all questions to find matching ones for the form
                const allQuestions = await formQuestionService.getAllFormQuestions();
                const filteredQuestions = allQuestions.filter(q => q.form === data.form);
                setQuestions(filteredQuestions);

                reset({
                    form: data.form,
                    question_id: data.question_id,
                    total_attempts: data.total_attempts,
                    correct_attempts: data.correct_attempts,
                });
            } catch (error) {
                console.error("Error fetching data:", error);
                toast.error("Failed to load analytic details");
            } finally {
                setIsLoading(false);
            }
        };

        if (id) fetchData();
    }, [id, reset]);

    // Update questions when form changes manually (if user changes form in edit)
    useEffect(() => {
        const updateQuestions = async () => {
            if (!selectedFormId || isLoading) return; // Skip during initial load

            setIsLoadingQuestions(true);
            try {
                const allQuestions = await formQuestionService.getAllFormQuestions();
                const filteredQuestions = allQuestions.filter(q => q.form === selectedFormId);
                setQuestions(filteredQuestions);
            } catch (error) {
                console.error("Error fetching questions:", error);
            } finally {
                setIsLoadingQuestions(false);
            }
        };

        updateQuestions();
    }, [selectedFormId, isLoading]);

    const onSubmit = async (data: EditAnalyticInput) => {
        setIsSaving(true);
        try {
            await questionAnalyticService.updateQuestionAnalytic(Number(id), {
                id: Number(id),
                ...data
            });
            toast.success("Question analytic updated successfully!");
            router.push("/question-analytics");
        } catch (error: any) {
            console.error("Error updating analytic:", error);
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
                <p className="text-muted-foreground">Loading analytic details...</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6 p-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link href="/question-analytics">
                    <Button variant="ghost" size="icon" disabled={isSaving}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Edit Question Analytic</h1>
                    <p className="text-muted-foreground">
                        Update metric records for this question
                    </p>
                </div>
            </div>

            {/* Form */}
            <div className="mx-auto w-full max-w-2xl">
                <Card className="border-t-4 border-t-primary">
                    <CardHeader>
                        <div className="flex items-center gap-2 mb-2">
                            <BarChart3 className="h-5 w-5 text-primary" />
                            <CardTitle>Metadata Update</CardTitle>
                        </div>
                        <CardDescription>
                            Modify the performance metrics for this specific question
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="form">Target Form *</Label>
                                    <Select
                                        value={selectedFormId?.toString()}
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
                                    <Label htmlFor="question">Question *</Label>
                                    <Select
                                        value={watch("question_id")?.toString()}
                                        onValueChange={(value) => setValue("question_id", Number(value), { shouldDirty: true })}
                                        disabled={isSaving || isLoadingQuestions || !selectedFormId}
                                    >
                                        <SelectTrigger id="question">
                                            <SelectValue placeholder={isLoadingQuestions ? "Loading..." : !selectedFormId ? "Select form first" : "Select question"} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {questions.map((q) => (
                                                <SelectItem key={q.id} value={q.question_id.toString()}>
                                                    Question ID: {q.question_id}
                                                </SelectItem>
                                            ))}
                                            {selectedFormId && questions.length === 0 && !isLoadingQuestions && (
                                                <SelectItem value="0" disabled>No questions found in this form</SelectItem>
                                            )}
                                        </SelectContent>
                                    </Select>
                                    {errors.question_id && (
                                        <p className="text-sm text-red-500">{errors.question_id.message}</p>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="total_attempts">Total Attempts *</Label>
                                    <Input
                                        id="total_attempts"
                                        type="number"
                                        {...register("total_attempts", { valueAsNumber: true })}
                                        disabled={isSaving}
                                    />
                                    {errors.total_attempts && (
                                        <p className="text-sm text-red-500">{errors.total_attempts.message}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="correct_attempts">Correct Attempts *</Label>
                                    <Input
                                        id="correct_attempts"
                                        type="number"
                                        {...register("correct_attempts", { valueAsNumber: true })}
                                        disabled={isSaving}
                                    />
                                    {errors.correct_attempts && (
                                        <p className="text-sm text-red-500">{errors.correct_attempts.message}</p>
                                    )}
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => router.push("/question-analytics")}
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
