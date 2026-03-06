"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
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
import { Form, FormQuestion, CreateQuestionAnalyticPayload } from "@/types/form.types";

const createAnalyticSchema = z.object({
    form: z.number().min(1, "Please select a form"),
    question_id: z.number().min(1, "Please select a question"),
    total_attempts: z.number().min(0, "Total attempts must be 0 or more"),
    correct_attempts: z.number().min(0, "Correct attempts must be 0 or more"),
}).refine(data => data.correct_attempts <= data.total_attempts, {
    message: "Correct attempts cannot exceed total attempts",
    path: ["correct_attempts"]
});

type CreateAnalyticInput = z.infer<typeof createAnalyticSchema>;

export default function CreateQuestionAnalyticPage() {
    const router = useRouter();
    const [isCreating, setIsCreating] = useState(false);
    const [forms, setForms] = useState<Form[]>([]);
    const [questions, setQuestions] = useState<FormQuestion[]>([]);
    const [isLoadingForms, setIsLoadingForms] = useState(true);
    const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
        watch,
        resetField
    } = useForm<CreateAnalyticInput>({
        resolver: zodResolver(createAnalyticSchema),
        defaultValues: {
            total_attempts: 0,
            correct_attempts: 0,
        }
    });

    const selectedFormId = watch("form");

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

    useEffect(() => {
        const fetchQuestions = async () => {
            if (!selectedFormId) {
                setQuestions([]);
                return;
            }
            setIsLoadingQuestions(true);
            try {
                const allQuestions = await formQuestionService.getAllFormQuestions();
                const filteredQuestions = allQuestions.filter(q => q.form === selectedFormId);
                setQuestions(filteredQuestions);
                resetField("question_id");
            } catch (error) {
                console.error("Error fetching questions:", error);
                toast.error("Failed to load questions for the selected form");
            } finally {
                setIsLoadingQuestions(false);
            }
        };

        fetchQuestions();
    }, [selectedFormId, resetField]);

    const onSubmit = async (data: CreateAnalyticInput) => {
        setIsCreating(true);
        try {
            await questionAnalyticService.createQuestionAnalytic(data);
            toast.success("Question analytic record created successfully!");
            router.push("/question-analytics");
        } catch (error: any) {
            console.error("Error creating analytic:", error);
            const errorMessage = error.response?.data?.detail || "Failed to create analytic record. Please check all fields.";
            toast.error(errorMessage);
        } finally {
            setIsCreating(false);
        }
    };

    return (
        <div className="flex flex-col gap-6 p-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link href="/question-analytics">
                    <Button variant="ghost" size="icon" disabled={isCreating}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Add Question Analytic</h1>
                    <p className="text-muted-foreground">
                        Create a manual analytics record for a specific question
                    </p>
                </div>
            </div>

            {/* Form */}
            <div className="mx-auto w-full max-w-2xl">
                <Card className="border-t-4 border-t-primary">
                    <CardHeader>
                        <div className="flex items-center gap-2 mb-2">
                            <BarChart3 className="h-5 w-5 text-primary" />
                            <CardTitle>Metric Details</CardTitle>
                        </div>
                        <CardDescription>
                            Select the form and question to record performance metrics
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="form">Target Form *</Label>
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
                                    <Label htmlFor="question">Question *</Label>
                                    <Select
                                        onValueChange={(value) => setValue("question_id", Number(value))}
                                        disabled={isCreating || isLoadingQuestions || !selectedFormId}
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
                                        disabled={isCreating}
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
                                        disabled={isCreating}
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
                                    disabled={isCreating}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={isCreating} className="flex-1">
                                    {isCreating ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="mr-2 h-4 w-4" />
                                            Save Analytics
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
