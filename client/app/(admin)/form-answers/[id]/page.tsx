"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
    ArrowLeft,
    Edit,
    Trash2,
    Loader2,
    AlertCircle,
    Calendar,
    User,
    ClipboardCheck,
    HelpCircle,
    Hash,
    Timer,
    CheckCircle2,
    XCircle,
    Calculator,
    FileText,
    Clock
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { formAnswerService } from "@/service/FormAnswerService";
import { FormAnswer } from "@/types/form.types";
import { formatDateTime } from "@/lib/form-utils";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";

export default function FormAnswerDetailsPage() {
    const { id } = useParams();
    const router = useRouter();
    const [formAnswer, setFormAnswer] = useState<FormAnswer | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchDetails = async () => {
            if (!id) return;
            setIsLoading(true);
            try {
                const data = await formAnswerService.getFormAnswerById(Number(id));
                setFormAnswer(data);
            } catch (err) {
                console.error("Error fetching details:", err);
                setError("Failed to load answer details. It may have been deleted.");
                toast.error("Failed to load details");
            } finally {
                setIsLoading(false);
            }
        };

        fetchDetails();
    }, [id]);

    const handleDelete = async () => {
        if (!formAnswer || !confirm(`Are you sure you want to delete this form answer?`)) return;

        try {
            await formAnswerService.deleteFormAnswer(formAnswer.id);
            toast.success(`Form answer deleted successfully`);
            router.push("/form-answers");
        } catch (err) {
            console.error("Error deleting form answer:", err);
            toast.error("Failed to delete form answer");
        }
    };

    if (isLoading) {
        return (
            <div className="flex h-[400px] w-full flex-col items-center justify-center gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-muted-foreground">Loading answer details...</p>
            </div>
        );
    }

    if (error || !formAnswer) {
        return (
            <div className="flex h-[400px] w-full flex-col items-center justify-center gap-4 p-6 text-center">
                <AlertCircle className="h-12 w-12 text-destructive" />
                <div>
                    <h3 className="text-lg font-semibold">Error Loading Details</h3>
                    <p className="text-muted-foreground">{error || "Answer not found"}</p>
                </div>
                <Button onClick={() => router.push("/form-answers")} variant="outline">
                    Back to List
                </Button>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6 p-6">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/form-answers">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Answer Details</h1>
                        <p className="text-muted-foreground">
                            Viewing details for Answer #{formAnswer.id}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={() => router.push(`/form-answers/${formAnswer.id}/edit`)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Answer
                    </Button>
                    <Button variant="destructive" onClick={handleDelete}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                    </Button>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                {/* Main Info Card */}
                <Card className="md:col-span-2 shadow-sm">
                    <CardHeader className="bg-muted/30 border-b pb-4">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <CardTitle className="text-xl">Submission Content</CardTitle>
                                <CardDescription>Data provided by the user</CardDescription>
                            </div>
                            {formAnswer.is_correct ? (
                                <Badge className="bg-green-100 text-green-700 hover:bg-green-200 border-none px-3 py-1 text-sm font-semibold">
                                    <CheckCircle2 className="mr-1.5 h-4 w-4" />
                                    Correct
                                </Badge>
                            ) : (
                                <Badge variant="destructive" className="bg-red-100 text-red-700 hover:bg-red-200 border-none px-3 py-1 text-sm font-semibold">
                                    <XCircle className="mr-1.5 h-4 w-4" />
                                    Incorrect
                                </Badge>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-6">
                        <div className="space-y-2">
                            <Label className="text-xs uppercase tracking-wider text-muted-foreground">Answer Text</Label>
                            <div className="p-4 rounded-lg bg-muted/50 border min-h-[100px] whitespace-pre-wrap font-medium">
                                {formAnswer.answer_text || "No text answer provided"}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-1">
                                <Label className="text-xs uppercase tracking-wider text-muted-foreground">Time Spent</Label>
                                <div className="flex items-center gap-2 text-lg font-semibold">
                                    <Timer className="h-5 w-5 text-blue-500" />
                                    {formAnswer.time_spent_seconds} seconds
                                </div>
                                <p className="text-xs text-muted-foreground italic">Approx. {Math.round(formAnswer.time_spent_seconds / 60 * 10) / 10} minutes</p>
                            </div>
                            <div className="space-y-1">
                                <Label className="text-xs uppercase tracking-wider text-muted-foreground">Marks Awarded</Label>
                                <div className="flex items-center gap-2 text-lg font-semibold">
                                    <Calculator className="h-5 w-5 text-amber-500" />
                                    {formAnswer.marks_awarded} Points
                                </div>
                            </div>
                        </div>

                        {formAnswer.selected_option_ids && formAnswer.selected_option_ids.length > 0 && (
                            <div className="space-y-2 border-t pt-4">
                                <Label className="text-xs uppercase tracking-wider text-muted-foreground">Selected Options (IDs)</Label>
                                <div className="flex flex-wrap gap-2">
                                    {formAnswer.selected_option_ids.map(optId => (
                                        <Badge key={optId} variant="outline" className="font-mono text-xs px-2 py-0.5">
                                            {optId}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Metadata Card */}
                <Card className="shadow-sm border-t-4 border-t-primary">
                    <CardHeader>
                        <CardTitle className="text-lg">Metadata</CardTitle>
                        <CardDescription>System identifiers and timestamps</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-5">
                        <div className="space-y-1.5">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Hash className="h-4 w-4" />
                                Identifier
                            </div>
                            <div className="font-mono bg-muted p-2 rounded text-xs">
                                ANSWER_ID: {formAnswer.id}
                            </div>
                        </div>

                        <Separator />

                        <div className="space-y-1.5">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <ClipboardCheck className="h-4 w-4" />
                                Response Reference
                            </div>
                            <div className="font-medium text-sm">
                                Response ID: {formAnswer.response}
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <HelpCircle className="h-4 w-4" />
                                Question Reference
                            </div>
                            <div className="font-medium text-sm">
                                Question ID: {formAnswer.question_id}
                            </div>
                        </div>

                        <Separator />

                        <div className="space-y-3">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Clock className="h-4 w-4" />
                                Timestamps
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-xs">
                                    <div className="w-16 text-muted-foreground">Created:</div>
                                    <div className="font-medium">{formatDateTime(formAnswer.created_dt)}</div>
                                </div>
                                <div className="flex items-center gap-2 text-xs">
                                    <div className="w-16 text-muted-foreground">Updated:</div>
                                    <div className="font-medium">{formatDateTime(formAnswer.updated_dt)}</div>
                                </div>
                            </div>
                        </div>

                        <Separator />

                        <div className="space-y-1.5">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <User className="h-4 w-4" />
                                Performed By
                            </div>
                            <div className="flex flex-col gap-1">
                                <div className="text-xs font-medium">Author ID: {formAnswer.created_by}</div>
                                {formAnswer.updated_by !== formAnswer.created_by && (
                                    <div className="text-xs font-medium text-muted-foreground italic">Admin ID: {formAnswer.updated_by}</div>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
