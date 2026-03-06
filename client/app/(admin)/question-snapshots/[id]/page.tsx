"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import {
    ArrowLeft,
    Loader2,
    Edit,
    Trash2,
    FileImage,
    HelpCircle,
    Copy,
    CheckCircle2,
    CalendarDays,
    Clock,
    User,
    ListChecks
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import Link from "next/link";
import { questionSnapshotService } from "@/service/QuestionSnapshotService";
import { QuestionSnapshot } from "@/types/form.types";

export default function QuestionSnapshotDetailPage() {
    const router = useRouter();
    const { id } = useParams();
    const [snapshot, setSnapshot] = useState<QuestionSnapshot | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        const fetchSnapshot = async () => {
            setIsLoading(true);
            try {
                const data = await questionSnapshotService.getQuestionSnapshotById(Number(id));
                setSnapshot(data);
            } catch (error) {
                console.error("Error fetching snapshot:", error);
                toast.error("Failed to load snapshot details");
            } finally {
                setIsLoading(false);
            }
        };

        if (id) fetchSnapshot();
    }, [id]);

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this snapshot?")) return;
        setIsDeleting(true);
        try {
            await questionSnapshotService.deleteQuestionSnapshot(Number(id));
            toast.success("Snapshot deleted successfully");
            router.push("/question-snapshots");
        } catch (error) {
            console.error("Error deleting snapshot:", error);
            toast.error("Failed to delete snapshot");
            setIsDeleting(false);
        }
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return "N/A";
        return new Date(dateString).toLocaleString();
    };

    if (isLoading) {
        return (
            <div className="flex h-[400px] w-full flex-col items-center justify-center gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-muted-foreground">Loading snapshot details...</p>
            </div>
        );
    }

    if (!snapshot) {
        return (
            <div className="flex h-[400px] flex-col items-center justify-center gap-4">
                <HelpCircle className="h-12 w-12 text-muted-foreground" />
                <h2 className="text-xl font-semibold">Snapshot not found</h2>
                <Button onClick={() => router.push("/question-snapshots")} variant="outline">
                    Return to List
                </Button>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6 p-6">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/question-snapshots">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-3xl font-bold tracking-tight">Snapshot Details</h1>
                            <Badge variant="secondary">ID: {snapshot.id}</Badge>
                        </div>
                        <p className="text-muted-foreground">
                            Captured state of Question #{snapshot.form_question}
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Link href={`/question-snapshots/${snapshot.id}/edit`}>
                        <Button variant="outline">
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                        </Button>
                    </Link>
                    <Button
                        variant="destructive"
                        onClick={handleDelete}
                        disabled={isDeleting}
                    >
                        {isDeleting ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <Trash2 className="mr-2 h-4 w-4" />
                        )}
                        Delete
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* Visual Snapshot State */}
                <div className="md:col-span-2 space-y-6">
                    <Card className="border-t-4 border-t-primary shadow-sm h-full">
                        <CardHeader>
                            <div className="flex items-center gap-2 mb-2">
                                <FileImage className="h-5 w-5 text-primary" />
                                <CardTitle>Captured State</CardTitle>
                            </div>
                            <CardDescription>
                                The exact content and options as they appeared in this version
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">

                            {/* Form Source Box */}
                            <div className="rounded-lg bg-muted p-4">
                                <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 flex items-center justify-between">
                                    <span>Source Form</span>
                                    <Badge variant="outline" className="bg-background">#{snapshot.form_question_detail.form_id}</Badge>
                                </div>
                                <div className="font-medium text-lg text-foreground">
                                    {snapshot.form_question_detail.form_title}
                                </div>
                                <div className="text-sm text-muted-foreground mt-1">
                                    Question Position: {snapshot.form_question_detail.order}
                                </div>
                            </div>

                            {/* Question Content */}
                            <div>
                                <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                                    Question Text
                                </div>
                                <div className="text-lg font-medium p-4 border rounded-md">
                                    {snapshot.question_text}
                                </div>
                            </div>

                            {/* Captured Options */}
                            <div>
                                <div className="flex items-center gap-2 mb-3">
                                    <ListChecks className="h-4 w-4 text-muted-foreground" />
                                    <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                        Captured Options
                                    </div>
                                    <Badge className="ml-auto" variant="secondary">
                                        Type: {snapshot.question_type.replace("_", " ").toUpperCase()}
                                    </Badge>
                                </div>

                                {snapshot.options_snapshot?.options && snapshot.options_snapshot.options.length > 0 ? (
                                    <div className="space-y-2">
                                        {snapshot.options_snapshot.options.map((option, idx) => (
                                            <div key={idx} className="flex items-center gap-3 p-3 border rounded-md bg-card">
                                                <div className="h-5 w-5 rounded-full border border-primary/30 flex items-center justify-center bg-primary/5 shrink-0">
                                                    <span className="text-xs text-primary font-medium">{String.fromCharCode(65 + idx)}</span>
                                                </div>
                                                <span className="flex-1">{option.text}</span>
                                                <span className="text-xs text-muted-foreground font-mono bg-muted px-2 py-1 rounded">
                                                    {option.id}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="p-4 border border-dashed rounded-md text-center text-muted-foreground bg-muted/20">
                                        No options captured in this snapshot.
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Additional Metadata */}
                <div className="space-y-6">
                    <Card className="shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-md">Audit Trail</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-start gap-3">
                                <CalendarDays className="h-4 w-4 text-muted-foreground mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium">Created</p>
                                    <p className="text-sm text-muted-foreground">{formatDate(snapshot.created_dt)}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <User className="h-4 w-4 text-muted-foreground mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium">Created By User ID</p>
                                    <p className="text-sm text-muted-foreground">{snapshot.created_by}</p>
                                </div>
                            </div>
                            {snapshot.updated_dt && (
                                <div className="flex items-start gap-3 pt-2 border-t mt-2">
                                    <Clock className="h-4 w-4 text-muted-foreground mt-0.5" />
                                    <div>
                                        <p className="text-sm font-medium">Last Modified</p>
                                        <p className="text-sm text-muted-foreground">{formatDate(snapshot.updated_dt)}</p>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="shadow-sm bg-muted/30">
                        <CardContent className="p-4 space-y-2">
                            <p className="text-xs text-muted-foreground leading-relaxed">
                                <strong>System Note:</strong> Question snapshots are typically immutable records created when an exam is published or taken. Manual editing should only occur for administrative corrections.
                            </p>
                        </CardContent>
                    </Card>
                </div>

            </div>
        </div>
    );
}
