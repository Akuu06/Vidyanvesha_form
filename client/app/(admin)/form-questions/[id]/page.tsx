"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
    ArrowLeft,
    Edit,
    Trash2,
    Calendar,
    User,
    FileText,
    Clock,
    CheckCircle2,
    XCircle,
    Loader2,
    Hash,
    Layers,
    HelpCircle,
    Database,
    BarChart3,
    Timer
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { formatDateTime } from "@/lib/form-utils";
import { formQuestionService } from "@/service/FormQuestionService";
import { FormQuestion } from "@/types/form.types";

export default function FormQuestionDetailPage() {
    const router = useRouter();
    const { id } = useParams();
    const [formQuestion, setFormQuestion] = useState<FormQuestion | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchFormQuestion = async () => {
            setIsLoading(true);
            try {
                const data = await formQuestionService.getFormQuestionById(Number(id));
                setFormQuestion(data);
            } catch (error) {
                console.error("Error fetching form question:", error);
                toast.error("Failed to load question details");
            } finally {
                setIsLoading(false);
            }
        };

        if (id) fetchFormQuestion();
    }, [id]);

    const handleDelete = async () => {
        if (!formQuestion || !confirm(`Are you sure you want to remove this question from the form?`)) return;

        try {
            await formQuestionService.deleteFormQuestion(formQuestion.id);
            toast.success("Question removed from form successfully");
            router.push("/form-questions");
        } catch (err) {
            console.error("Error deleting form question:", err);
            toast.error("Failed to remove question");
        }
    };

    if (isLoading) {
        return (
            <div className="flex h-[400px] w-full flex-col items-center justify-center gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-muted-foreground">Loading association details...</p>
            </div>
        );
    }

    if (!formQuestion) {
        return (
            <div className="flex flex-col items-center justify-center gap-4 p-12 text-center">
                <HelpCircle className="h-12 w-12 text-muted-foreground" />
                <h2 className="text-xl font-semibold">Association Not Found</h2>
                <p className="text-muted-foreground">The question mapping you are looking for does not exist.</p>
                <Link href="/form-questions">
                    <Button variant="outline">Back to Form Questions</Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6 p-6">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/form-questions">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Question Assignment</h1>
                        <p className="text-muted-foreground">Detailed view of question-form mapping</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Link href={`/form-questions/${formQuestion.id}/edit`}>
                        <Button variant="outline">
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Mapping
                        </Button>
                    </Link>
                    <Button variant="destructive" onClick={handleDelete}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Remove from Form
                    </Button>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                {/* Main Info Card */}
                <Card className="md:col-span-2 border-t-4 border-t-primary">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Database className="h-5 w-5 text-primary" />
                                <CardTitle>Core Association</CardTitle>
                            </div>
                            <Badge variant="outline" className="font-mono">
                                ID: {formQuestion.id}
                            </Badge>
                        </div>
                        <CardDescription>Relationships to forms, sections, and item bank</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="space-y-1">
                                <p className="text-sm font-medium text-muted-foreground">Container Form</p>
                                <div className="flex items-center gap-2">
                                    <FileText className="h-4 w-4 text-primary" />
                                    <span className="font-semibold">{formQuestion.form_title || `ID: ${formQuestion.form}`}</span>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm font-medium text-muted-foreground">Assigned Section</p>
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <Layers className="h-4 w-4" />
                                    <span className="font-medium">
                                        {formQuestion.section_title || (formQuestion.section ? `ID: ${formQuestion.section}` : "No specific section")}
                                    </span>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm font-medium text-muted-foreground">Question Bank Reference</p>
                                <div className="flex items-center gap-2">
                                    <HelpCircle className="h-4 w-4 text-amber-500" />
                                    <span className="font-mono font-bold">Q-{formQuestion.question_id}</span>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm font-medium text-muted-foreground">Display Sequence</p>
                                <div className="flex items-center gap-2">
                                    <Hash className="h-4 w-4 text-primary" />
                                    <span className="font-bold">Index #{formQuestion.order}</span>
                                </div>
                            </div>
                        </div>

                        <Separator />

                        <div>
                            <CardTitle className="text-base mb-4 flex items-center gap-2">
                                <CheckCircle2 className="h-4 w-4 text-primary" />
                                Configuration & Behavior
                            </CardTitle>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                <div className="flex flex-col gap-1 items-center justify-center p-3 rounded-lg bg-muted/50">
                                    <span className="text-xs text-muted-foreground uppercase font-bold">Points</span>
                                    <span className="text-lg font-bold">{formQuestion.marks}</span>
                                </div>
                                <div className="flex flex-col gap-1 items-center justify-center p-3 rounded-lg bg-muted/50 text-red-600">
                                    <span className="text-xs text-muted-foreground uppercase font-bold">Negative</span>
                                    <span className="text-lg font-bold">{formQuestion.negative_marks}</span>
                                </div>
                                <div className="flex flex-col gap-1 items-center justify-center p-3 rounded-lg bg-muted/50">
                                    <span className="text-xs text-muted-foreground uppercase font-bold">Required</span>
                                    {formQuestion.is_required ? <CheckCircle2 className="h-5 w-5 text-green-600" /> : <XCircle className="h-5 w-5 text-muted-foreground" />}
                                </div>
                                <div className="flex flex-col gap-1 items-center justify-center p-3 rounded-lg bg-muted/50">
                                    <span className="text-xs text-muted-foreground uppercase font-bold">Analytics</span>
                                    {formQuestion.consider_for_analytics ? <BarChart3 className="h-5 w-5 text-blue-600" /> : <XCircle className="h-5 w-5 text-muted-foreground" />}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Side Info Cards */}
                <div className="space-y-6">
                    <Card className="border-t-4 border-t-amber-500">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base">
                                <Timer className="h-4 w-4 text-amber-500" />
                                Overridden Settings
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 text-sm">
                            <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">Time Limit:</span>
                                <span className="font-semibold">{formQuestion.time_limit_seconds ? `${formQuestion.time_limit_seconds}s` : "Default"}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">Shuffle Options:</span>
                                <span className="font-semibold">
                                    {formQuestion.shuffle_options_override === null ? "Default" : (formQuestion.shuffle_options_override ? "Enabled" : "Disabled")}
                                </span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base uppercase text-muted-foreground tracking-wider font-bold">System Audit</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 text-sm">
                            <div className="space-y-1">
                                <p className="text-muted-foreground flex items-center gap-1">
                                    <Clock className="h-3 w-3" /> Created
                                </p>
                                <p className="font-medium">{formatDateTime(formQuestion.created_dt)}</p>
                            </div>
                            <Separator />
                            <div className="space-y-1">
                                <p className="text-muted-foreground flex items-center gap-1">
                                    <User className="h-3 w-3" /> Created By
                                </p>
                                <p className="font-medium">User ID: {formQuestion.created_by}</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
