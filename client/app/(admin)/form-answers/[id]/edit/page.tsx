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
import { ArrowLeft, Loader2, Save, FileText, ClipboardCheck, Hash, Timer, Calculator } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { z } from "zod";
import { formAnswerService } from "@/service/FormAnswerService";
import { formResponseService } from "@/service/FormResponseService";
import { formQuestionService } from "@/service/FormQuestionService";
import { FormAnswer, FormResponse, FormQuestion } from "@/types/form.types";

const editFormAnswerSchema = z.object({
    response: z.number().min(1, "Please select a response"),
    question_id: z.number().min(1, "Please select a question"),
    answer_text: z.string().nullable().optional(),
    selected_option_ids: z.array(z.string()).optional(),
    displayed_option_order: z.array(z.string()).optional(),
    time_spent_seconds: z.number().min(0, "Time spent cannot be negative"),
    is_correct: z.boolean(),
    marks_awarded: z.number().min(0, "Marks cannot be negative"),
});

type EditFormAnswerInput = z.infer<typeof editFormAnswerSchema>;

export default function EditFormAnswerPage() {
    const { id } = useParams();
    const router = useRouter();
    const [isSaving, setIsSaving] = useState(false);
    const [isLoadingInitial, setIsLoadingInitial] = useState(true);

    const [responses, setResponses] = useState<FormResponse[]>([]);
    const [formQuestions, setFormQuestions] = useState<FormQuestion[]>([]);
    const [isLoadingDeps, setIsLoadingDeps] = useState(true);

    const {
        handleSubmit,
        formState: { errors, isDirty },
        setValue,
        watch,
        register,
        reset
    } = useForm<EditFormAnswerInput>({
        resolver: zodResolver(editFormAnswerSchema)
    });

    // Fetch initial data and dependencies
    useEffect(() => {
        const fetchData = async () => {
            if (!id) return;
            setIsLoadingInitial(true);
            try {
                // Fetch form answer and deps in parallel
                const [answerData, responsesData, questionsData] = await Promise.all([
                    formAnswerService.getFormAnswerById(Number(id)),
                    formResponseService.getAllFormResponses(),
                    formQuestionService.getAllFormQuestions()
                ]);

                setResponses(responsesData || []);
                setFormQuestions(questionsData || []);
                setIsLoadingDeps(false);

                // Reset form with fetched data
                reset({
                    response: answerData.response,
                    question_id: answerData.question_id,
                    answer_text: answerData.answer_text || "",
                    selected_option_ids: answerData.selected_option_ids || [],
                    displayed_option_order: answerData.displayed_option_order || [],
                    time_spent_seconds: answerData.time_spent_seconds || 0,
                    is_correct: answerData.is_correct || false,
                    marks_awarded: answerData.marks_awarded || 0,
                });
            } catch (error) {
                console.error("Error fetching data:", error);
                toast.error("Failed to load answer or required data");
                router.push("/form-answers");
            } finally {
                setIsLoadingInitial(false);
            }
        };

        fetchData();
    }, [id, reset, router]);

    const onSubmit = async (data: EditFormAnswerInput) => {
        if (!id) return;
        setIsSaving(true);
        try {
            await formAnswerService.updateFormAnswer(Number(id), data as any);
            toast.success("Form answer updated successfully!");
            router.push(`/form-answers/${id}`);
        } catch (error: any) {
            console.error("Error updating form answer:", error);
            const errorMessage = error.response?.data?.detail || "Failed to update form answer.";
            toast.error(errorMessage);
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoadingInitial) {
        return (
            <div className="flex h-[400px] w-full flex-col items-center justify-center gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-muted-foreground">Loading form answer for editing...</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6 p-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link href={`/form-answers/${id}`}>
                    <Button variant="ghost" size="icon" disabled={isSaving}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Edit Form Answer</h1>
                    <p className="text-muted-foreground">
                        Modify user response for Answer #{id}
                    </p>
                </div>
            </div>

            <div className="mx-auto w-full max-w-3xl">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid gap-6 md:grid-cols-2">

                        {/* Association Card */}
                        <Card className="md:col-span-2 border-t-4 border-t-amber-500">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <ClipboardCheck className="h-5 w-5 text-amber-500" />
                                    Mapping Adjustment
                                </CardTitle>
                                <CardDescription>Move this answer to a different response or question</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="response">Target Response *</Label>
                                        <Select
                                            defaultValue={watch("response")?.toString()}
                                            onValueChange={(value) => setValue("response", Number(value), { shouldDirty: true })}
                                            disabled={isSaving || isLoadingDeps}
                                        >
                                            <SelectTrigger id="response">
                                                <SelectValue placeholder="Select response" />
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
                                            defaultValue={watch("question_id")?.toString()}
                                            onValueChange={(value) => setValue("question_id", Number(value), { shouldDirty: true })}
                                            disabled={isSaving || isLoadingDeps}
                                        >
                                            <SelectTrigger id="question">
                                                <SelectValue placeholder="Select question" />
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
                                <CardTitle className="flex items-center gap-2">
                                    <FileText className="h-5 w-5 text-blue-500" />
                                    Submission Details
                                </CardTitle>
                                <CardDescription>Record the updated answer data</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="answer_text">Answer Text</Label>
                                    <Input id="answer_text" {...register("answer_text")} disabled={isSaving} />
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
                                                disabled={isSaving}
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
                                                disabled={isSaving}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between rounded-lg border p-4 bg-muted/30">
                                    <div className="space-y-0.5">
                                        <Label>Is Correct Answer?</Label>
                                        <p className="text-[12px] text-muted-foreground italic">Update scoring and outcomes</p>
                                    </div>
                                    <Switch
                                        checked={watch("is_correct")}
                                        onCheckedChange={(val) => setValue("is_correct", val, { shouldDirty: true })}
                                        disabled={isSaving}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => router.push(`/form-answers/${id}`)}
                            disabled={isSaving}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSaving || !isDirty} className="flex-1">
                            {isSaving ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Saving Changes...
                                </>
                            ) : (
                                <>
                                    <Save className="mr-2 h-4 w-4" />
                                    {isDirty ? "Save Adjustments" : "No Changes Made"}
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
