"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
    ArrowLeft,
    Loader2,
    Save,
    Plus,
    Trash2,
    FileImage
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import Link from "next/link";
import { questionSnapshotService } from "@/service/QuestionSnapshotService";
import { formQuestionService } from "@/service/FormQuestionService";
import { FormQuestion } from "@/types/form.types";

const snapshotOptionSchema = z.object({
    id: z.string().min(1, "Option ID is required"),
    text: z.string().min(1, "Option text is required"),
});

const createSnapshotSchema = z.object({
    form_question: z.number().min(1, "Please select a form question"),
    question_text: z.string().min(1, "Question text is required"),
    question_type: z.string().min(1, "Question type is required"),
    options: z.array(snapshotOptionSchema).min(1, "At least one option is required"),
});

type CreateSnapshotInput = z.infer<typeof createSnapshotSchema>;

const QUESTION_TYPES = [
    { value: "mcq_single", label: "Multiple Choice (Single Answer)" },
    { value: "mcq_multiple", label: "Multiple Choice (Multiple Answers)" },
    { value: "text_short", label: "Short Text" },
    { value: "text_long", label: "Long Text" },
    { value: "file_upload", label: "File Upload" },
    { value: "rating", label: "Rating" },
    { value: "date", label: "Date" },
    { value: "time", label: "Time" },
    { value: "mcq", label: "MCQ (Legacy)" }
];

export default function CreateQuestionSnapshotPage() {
    const router = useRouter();
    const [isSaving, setIsSaving] = useState(false);
    const [questions, setQuestions] = useState<FormQuestion[]>([]);
    const [isLoadingQuestions, setIsLoadingQuestions] = useState(true);

    const {
        register,
        control,
        handleSubmit,
        formState: { errors },
        setValue,
        watch,
    } = useForm<CreateSnapshotInput>({
        resolver: zodResolver(createSnapshotSchema),
        defaultValues: {
            question_type: "mcq",
            options: [
                { id: "opt_1", text: "" },
                { id: "opt_2", text: "" }
            ]
        }
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: "options"
    });

    useEffect(() => {
        const fetchQuestions = async () => {
            setIsLoadingQuestions(true);
            try {
                const data = await formQuestionService.getAllFormQuestions();
                setQuestions(data);
            } catch (error) {
                console.error("Error fetching questions:", error);
                toast.error("Failed to load form questions");
            } finally {
                setIsLoadingQuestions(false);
            }
        };

        fetchQuestions();
    }, []);

    const selectedQuestionId = watch("form_question");

    // Auto-fill question text if a question is selected
    useEffect(() => {
        if (selectedQuestionId && questions.length > 0) {
            const selectedQ = questions.find(q => q.id === selectedQuestionId);
            if (selectedQ && !watch("question_text")) {
                setValue("question_text", selectedQ.question_text || "", { shouldValidate: true });
                if (selectedQ.question_type) {
                    setValue("question_type", selectedQ.question_type, { shouldValidate: true });
                }
            }
        }
    }, [selectedQuestionId, questions, setValue, watch]);

    const onSubmit = async (data: CreateSnapshotInput) => {
        setIsSaving(true);
        try {
            const payload = {
                form_question: data.form_question,
                question_text: data.question_text,
                question_type: data.question_type,
                options_snapshot: {
                    options: data.options
                }
            };

            await questionSnapshotService.createQuestionSnapshot(payload);
            toast.success("Question snapshot created successfully");
            router.push("/question-snapshots");
        } catch (error: any) {
            console.error("Error creating snapshot:", error);
            const errMsg = error.response?.data?.detail || "Failed to create snapshot. Please check the inputs.";
            toast.error(errMsg);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="flex flex-col gap-6 p-6">
            <div className="flex items-center gap-4">
                <Link href="/question-snapshots">
                    <Button variant="ghost" size="icon" disabled={isSaving}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Create Snapshot</h1>
                    <p className="text-muted-foreground">
                        Capture a versioned state of a form question
                    </p>
                </div>
            </div>

            <div className="mx-auto w-full max-w-3xl">
                <Card className="border-t-4 border-t-primary shadow-md">
                    <CardHeader>
                        <div className="flex items-center gap-2 mb-2">
                            <FileImage className="h-5 w-5 text-primary" />
                            <CardTitle>Snapshot Details</CardTitle>
                        </div>
                        <CardDescription>
                            Define the question state and available options for this snapshot
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

                            {/* Question Selection */}
                            <div className="space-y-4 p-4 border rounded-lg bg-muted/20">
                                <h3 className="font-medium text-sm text-foreground">Source mapping</h3>
                                <div className="space-y-2">
                                    <Label htmlFor="form_question">Form Question Source *</Label>
                                    <Select
                                        onValueChange={(value) => setValue("form_question", Number(value), { shouldValidate: true })}
                                        disabled={isSaving || isLoadingQuestions}
                                    >
                                        <SelectTrigger id="form_question">
                                            <SelectValue placeholder={isLoadingQuestions ? "Loading questions..." : "Select the original question"} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {questions.map((q) => (
                                                <SelectItem key={q.id} value={q.id.toString()}>
                                                    [{q.id}] {q.question_text || "Untitled Question"}
                                                    {q.form_title && ` (Form: ${q.form_title})`}
                                                </SelectItem>
                                            ))}
                                            {questions.length === 0 && !isLoadingQuestions && (
                                                <SelectItem value="0" disabled>No form questions available</SelectItem>
                                            )}
                                        </SelectContent>
                                    </Select>
                                    {errors.form_question && (
                                        <p className="text-sm text-destructive">{errors.form_question.message}</p>
                                    )}
                                </div>
                            </div>

                            {/* Captured Metadata */}
                            <div className="space-y-4">
                                <h3 className="font-medium text-sm text-foreground">Captured Metadata</h3>

                                <div className="space-y-2">
                                    <Label htmlFor="question_text">Question Text *</Label>
                                    <Input
                                        id="question_text"
                                        placeholder="e.g., How would you rate the event content?"
                                        {...register("question_text")}
                                        disabled={isSaving}
                                    />
                                    {errors.question_text && (
                                        <p className="text-sm text-destructive">{errors.question_text.message}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="question_type">Question Type *</Label>
                                    <Select
                                        value={watch("question_type")}
                                        onValueChange={(value) => setValue("question_type", value, { shouldValidate: true })}
                                        disabled={isSaving}
                                    >
                                        <SelectTrigger id="question_type">
                                            <SelectValue placeholder="Select type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {QUESTION_TYPES.map((type) => (
                                                <SelectItem key={type.value} value={type.value}>
                                                    {type.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.question_type && (
                                        <p className="text-sm text-destructive">{errors.question_type.message}</p>
                                    )}
                                </div>
                            </div>

                            {/* Options Builder */}
                            <div className="space-y-4 p-4 border rounded-lg bg-card mt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="font-medium text-sm text-foreground">Options Snapshot</h3>
                                        <p className="text-xs text-muted-foreground">Define the choices available at this point in time.</p>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => append({ id: `opt_${fields.length + 1}`, text: "" })}
                                        disabled={isSaving}
                                    >
                                        <Plus className="mr-2 h-4 w-4" />
                                        Add Option
                                    </Button>
                                </div>

                                <div className="space-y-3 mt-4">
                                    {fields.map((field, index) => (
                                        <div key={field.id} className="flex items-start gap-4">
                                            <div className="flex-1 space-y-2">
                                                <div className="flex gap-2">
                                                    <Input
                                                        placeholder="Option ID (e.g., opt_1)"
                                                        className="w-1/3 bg-muted/50 font-mono text-sm"
                                                        {...register(`options.${index}.id`)}
                                                        disabled={isSaving}
                                                    />
                                                    <Input
                                                        placeholder="Option Text (e.g., Excellent)"
                                                        className="flex-1"
                                                        {...register(`options.${index}.text`)}
                                                        disabled={isSaving}
                                                    />
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        className="text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0"
                                                        onClick={() => remove(index)}
                                                        disabled={fields.length <= 1 || isSaving}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                                {errors.options?.[index]?.id && (
                                                    <p className="text-xs text-destructive">{errors.options[index]?.id?.message}</p>
                                                )}
                                                {errors.options?.[index]?.text && (
                                                    <p className="text-xs text-destructive">{errors.options[index]?.text?.message}</p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                    {errors.options?.message && typeof errors.options.message === 'string' && (
                                        <p className="text-sm text-destructive">{errors.options.message}</p>
                                    )}
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => router.push("/question-snapshots")}
                                    disabled={isSaving}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={isSaving} className="flex-1">
                                    {isSaving ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Creating Snapshot...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="mr-2 h-4 w-4" />
                                            Save Snapshot
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
