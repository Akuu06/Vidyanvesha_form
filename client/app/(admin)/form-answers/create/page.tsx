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
import { ArrowLeft, Loader2, Save, FileText, ClipboardCheck, HelpCircle, Hash, Timer, Calculator } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { z } from "zod";
import { formAnswerService } from "@/service/FormAnswerService";
import { formResponseService } from "@/service/FormResponseService";
import { formQuestionService } from "@/service/FormQuestionService";
import { FormResponse, FormQuestion } from "@/types/form.types";

const createFormAnswerSchema = z.object({
    response: z.number().min(1, "Please select a response"),
    question_id: z.number().min(1, "Please select a question"),
    answer_text: z.string().nullable().optional(),
    selected_option_ids: z.array(z.string()).optional(),
    displayed_option_order: z.array(z.string()).optional(),
    time_spent_seconds: z.number().min(0, "Time spent cannot be negative"),
    is_correct: z.boolean(),
    marks_awarded: z.number().min(0, "Marks cannot be negative"),
});

type CreateFormAnswerInput = z.infer<typeof createFormAnswerSchema>;

export default function CreateFormAnswerPage() {
    const router = useRouter();
    const [isCreating, setIsCreating] = useState(false);
    const [responses, setResponses] = useState<FormResponse[]>([]);
    const [formQuestions, setFormQuestions] = useState<FormQuestion[]>([]);
    const [isLoadingResponses, setIsLoadingResponses] = useState(true);
    const [isLoadingQuestions, setIsLoadingQuestions] = useState(true);

    const {
        handleSubmit,
        formState: { errors },
        setValue,
        watch,
        register
    } = useForm<CreateFormAnswerInput>({
        resolver: zodResolver(createFormAnswerSchema),
        defaultValues: {
            answer_text: "",
            selected_option_ids: [],
            displayed_option_order: [],
            time_spent_seconds: 0,
            is_correct: false,
            marks_awarded: 0,
        }
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [responsesData, questionsData] = await Promise.all([
                    formResponseService.getAllFormResponses(),
                    formQuestionService.getAllFormQuestions()
                ]);
                setResponses(responsesData || []);
                setFormQuestions(questionsData || []);
            } catch (error) {
                console.error("Error fetching dependencies:", error);
                toast.error("Failed to load required data");
            } finally {
                setIsLoadingResponses(false);
                setIsLoadingQuestions(false);
            }
        };

        fetchData();
    }, []);

    const onSubmit = async (data: CreateFormAnswerInput) => {
        setIsCreating(true);
        try {
            await formAnswerService.createFormAnswer(data as any);
            toast.success("Form answer created successfully!");
            router.push("/form-answers");
        } catch (error: any) {
            console.error("Error creating form answer:", error);
            const errorMessage = error.response?.data?.detail || "Failed to create form answer.";
            toast.error(errorMessage);
        } finally {
            setIsCreating(false);
        }
    };

    return (
        <div className="flex flex-col gap-6 p-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link href="/form-answers">
                    <Button variant="ghost" size="icon" disabled={isCreating}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Create Form Answer</h1>
                    <p className="text-muted-foreground">
                        Manually record a user response to a question
                    </p>
                </div>
            </div>

            <div className="mx-auto w-full max-w-3xl">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid gap-6 md:grid-cols-2">

                        {/* Association Card */}
                        <Card className="md:col-span-2 border-t-4 border-t-primary">
                            <CardHeader>
                                <div className="flex items-center gap-2 mb-2">
                                    <ClipboardCheck className="h-5 w-5 text-primary" />
                                    <CardTitle>Response Association</CardTitle>
                                </div>
                                <CardDescription>Link this answer to a specific response and question</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="response">Target Response *</Label>
                                        <Select
                                            onValueChange={(value) => setValue("response", Number(value), { shouldDirty: true })}
                                            disabled={isCreating || isLoadingResponses}
                                        >
                                            <SelectTrigger id="response">
                                                <SelectValue placeholder={isLoadingResponses ? "Loading..." : "Select response"} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {responses.map((r) => (
                                                    <SelectItem key={r.id} value={r.id.toString()}>
                                                        ID: {r.id} (User: {r.user_name || r.user_id || 'Unknown'})
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.response && <p className="text-xs text-red-500">{errors.response.message}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="question_id">Form Question *</Label>
                                        <Select
                                            onValueChange={(value) => setValue("question_id", Number(value), { shouldDirty: true })}
                                            disabled={isCreating || isLoadingQuestions}
                                        >
                                            <SelectTrigger id="question">
                                                <SelectValue placeholder={isLoadingQuestions ? "Loading..." : "Select question"} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {formQuestions.map((q) => (
                                                    <SelectItem key={q.id} value={q.question_id.toString()}>
                                                        ID: {q.question_id} (Form: {q.form_title || q.form})
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.question_id && <p className="text-xs text-red-500">{errors.question_id.message}</p>}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Answer Details Card */}
                        <Card className="md:col-span-2 border-t-4 border-t-blue-500">
                            <CardHeader>
                                <div className="flex items-center gap-2 mb-2">
                                    <FileText className="h-5 w-5 text-blue-500" />
                                    <CardTitle>Answer Content</CardTitle>
                                </div>
                                <CardDescription>The actual text or IDs provided by the user</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="answer_text">Answer Text</Label>
                                    <Input id="answer_text" {...register("answer_text")} placeholder="Enter text response..." disabled={isCreating} />
                                </div>

                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="time_spent">Time Spent (Seconds)</Label>
                                        <div className="relative">
                                            <Timer className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="time_spent"
                                                type="number"
                                                {...register("time_spent_seconds", { valueAsNumber: true })}
                                                className="pl-10"
                                                disabled={isCreating}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="marks">Marks Awarded</Label>
                                        <div className="relative">
                                            <Calculator className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="marks"
                                                type="number"
                                                step="0.1"
                                                {...register("marks_awarded", { valueAsNumber: true })}
                                                className="pl-10"
                                                disabled={isCreating}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between rounded-lg border p-4 bg-muted/30">
                                    <div className="space-y-0.5">
                                        <Label>Is Correct Answer?</Label>
                                        <p className="text-[12px] text-muted-foreground italic">Marks and analytics will be updated based on this</p>
                                    </div>
                                    <Switch
                                        checked={watch("is_correct")}
                                        onCheckedChange={(val) => setValue("is_correct", val, { shouldDirty: true })}
                                        disabled={isCreating}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => router.push("/form-answers")}
                            disabled={isCreating}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isCreating} className="flex-1">
                            {isCreating ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Creating Answer...
                                </>
                            ) : (
                                <>
                                    <Save className="mr-2 h-4 w-4" />
                                    Save Form Answer
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
