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
    Trophy,
    CheckCircle2,
    XCircle,
    Loader2,
    Hash,
    Globe
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { formatDateTime } from "@/lib/form-utils";
import { formResponseService } from "@/service/FormResponseService";
import { FormResponse } from "@/types/form.types";

export default function ResponseDetailPage() {
    const router = useRouter();
    const { id } = useParams();
    const [response, setResponse] = useState<FormResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchResponse = async () => {
            setIsLoading(true);
            try {
                const data = await formResponseService.getFormResponseById(Number(id));
                setResponse(data);
            } catch (error) {
                console.error("Error fetching response:", error);
                toast.error("Failed to load response details");
            } finally {
                setIsLoading(false);
            }
        };

        if (id) fetchResponse();
    }, [id]);

    const handleDelete = async () => {
        if (!response || !confirm(`Are you sure you want to delete this response record?`)) return;

        try {
            await formResponseService.deleteFormResponse(response.id);
            toast.success("Response record deleted successfully");
            router.push("/responses");
        } catch (err) {
            console.error("Error deleting response:", err);
            toast.error("Failed to delete response");
        }
    };

    if (isLoading) {
        return (
            <div className="flex h-[400px] w-full flex-col items-center justify-center gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-muted-foreground">Loading response details...</p>
            </div>
        );
    }

    if (!response) {
        return (
            <div className="flex flex-col items-center justify-center gap-4 p-12 text-center">
                <FileText className="h-12 w-12 text-muted-foreground" />
                <h2 className="text-xl font-semibold">Response Not Found</h2>
                <p className="text-muted-foreground">The submission you are looking for does not exist.</p>
                <Link href="/responses">
                    <Button variant="outline">Back to Responses</Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6 p-6">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/responses">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Submission Details</h1>
                        <p className="text-muted-foreground">Form: {response.form_title || `ID: ${response.form}`}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Link href={`/responses/${response.id}/edit`}>
                        <Button variant="outline">
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Record
                        </Button>
                    </Link>
                    <Button variant="destructive" onClick={handleDelete}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                    </Button>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                {/* Score Card */}
                <Card className="md:col-span-1 border-t-4 border-t-primary">
                    <CardHeader className="text-center">
                        <CardTitle>Attempt Result</CardTitle>
                        <CardDescription>Performance summary</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center justify-center gap-4">
                        <div className="relative flex items-center justify-center h-32 w-32 rounded-full border-8 border-muted">
                            <div className="flex flex-col items-center">
                                <span className="text-4xl font-bold">{response.score.toFixed(1)}</span>
                                <span className="text-[10px] text-muted-foreground uppercase font-bold">Points</span>
                            </div>
                        </div>
                        <div className="text-center space-y-2">
                            {response.passed ? (
                                <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border-green-200 text-sm py-1 px-4">
                                    <Trophy className="mr-2 h-4 w-4" />
                                    PASSED
                                </Badge>
                            ) : (
                                <Badge variant="destructive" className="text-sm py-1 px-4">
                                    <XCircle className="mr-2 h-4 w-4" />
                                    FAILED
                                </Badge>
                            )}
                            <p className="text-sm text-muted-foreground">
                                Attempt #{response.attempt_number}
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Timing Information */}
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Clock className="h-5 w-5 text-primary" />
                            Timing & Status
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="space-y-1">
                                <p className="text-sm font-medium text-muted-foreground">Started On</p>
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-primary" />
                                    <span className="font-medium">{formatDateTime(response.started_at)}</span>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm font-medium text-muted-foreground">Submitted On</p>
                                <div className="flex items-center gap-2">
                                    <CheckCircle2 className="h-4 w-4 text-primary" />
                                    <span className="font-medium">
                                        {response.submitted_at ? formatDateTime(response.submitted_at) : "N/A (In Progress)"}
                                    </span>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm font-medium text-muted-foreground">Total Time Spent</p>
                                <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4 text-primary" />
                                    <span className="font-medium">{Math.floor(response.total_time_seconds / 60)}m {response.total_time_seconds % 60}s</span>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm font-medium text-muted-foreground">Completion Status</p>
                                <div>
                                    {response.is_completed ? (
                                        <Badge variant="secondary" className="bg-blue-100 text-blue-800">COMPLETED</Badge>
                                    ) : (
                                        <Badge variant="outline" className="text-amber-600 bg-amber-50">IN PROGRESS</Badge>
                                    )}
                                </div>
                            </div>
                        </div>

                        <Separator />

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="space-y-1">
                                <p className="text-sm font-medium text-muted-foreground">IP Address</p>
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <Globe className="h-4 w-4" />
                                    <span className="text-sm font-mono">{response.ip_address || "Not recorded"}</span>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm font-medium text-muted-foreground">Result Details</p>
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <Hash className="h-4 w-4" />
                                    <span className="text-sm">Questions Answered: {response.answer_count || 0}</span>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* User & Audit Information */}
                <Card className="md:col-span-3">
                    <CardHeader>
                        <CardTitle>Audit Information</CardTitle>
                    </CardHeader>
                    <CardContent className="grid sm:grid-cols-3 gap-6">
                        <div className="space-y-1">
                            <p className="text-sm font-medium text-muted-foreground">Respondent</p>
                            <div className="flex items-center gap-2">
                                <User className="h-5 w-5 text-primary" />
                                <div className="flex flex-col">
                                    <span className="font-semibold">{response.user_name || "Guest"}</span>
                                    <span className="text-xs text-muted-foreground">{response.user_email || "Anonymous"}</span>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm font-medium text-muted-foreground">Institute</p>
                            <p className="text-sm">ID: {response.institute_id || "None"}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm font-medium text-muted-foreground">University</p>
                            <p className="text-sm">ID: {response.university_id || "None"}</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}