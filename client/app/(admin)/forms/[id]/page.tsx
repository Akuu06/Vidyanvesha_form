"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FormStatusBadge } from "@/components/forms/form-status-badge";
import { FormModeBadge } from "@/components/forms/form-mode-badge";
import { formatDateTime } from "@/lib/form-utils";
import {
    ArrowLeft,
    Calendar,
    Clock,
    Edit,
    FileText,
    Loader2,
    AlertCircle,
    Settings,
    Users,
    Eye,
    ChevronRight
} from "lucide-react";
import { Form } from "@/types";
import { toast } from "sonner";
import api from "@/config/axios";
import { API_CONTS } from "@/lib/api";
import { firebaseService } from "@/lib/firebaseService";

export default function FormDetailsPage() {
    const { id } = useParams();
    const router = useRouter();
    const [form, setForm] = useState<Form | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchFormDetails = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const token = await firebaseService.getUserAccessToken();
            const response = await api.get(API_CONTS.FORMS.GET.replace(":id", id as string), {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setForm(response.data);
        } catch (err: any) {
            console.error("Error fetching form details:", err);
            setError(err.response?.data?.detail || "Failed to load form details");
            toast.error("Failed to load form details");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (id) {
            fetchFormDetails();
        }
    }, [id]);

    if (isLoading) {
        return (
            <div className="flex h-[400px] w-full flex-col items-center justify-center gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-muted-foreground">Loading form details...</p>
            </div>
        );
    }

    if (error || !form) {
        return (
            <div className="flex h-[400px] w-full flex-col items-center justify-center gap-4 p-6 text-center">
                <AlertCircle className="h-12 w-12 text-destructive" />
                <div>
                    <h3 className="text-lg font-semibold">Error Loading Form</h3>
                    <p className="text-muted-foreground">{error || "Form not found"}</p>
                </div>
                <Button onClick={() => router.push("/forms")} variant="outline">
                    Back to Forms
                </Button>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6 p-6">
            {/* Breadcrumbs */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Link href="/forms" className="hover:text-foreground">Forms</Link>
                <ChevronRight className="h-4 w-4" />
                <span className="font-medium text-foreground truncate max-w-[200px]">{form.title}</span>
            </div>

            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/forms">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">{form.title}</h1>
                        <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                                <Calendar className="h-3.5 w-3.5" />
                                Created {formatDateTime(form.created_dt)}
                            </span>
                            <span>•</span>
                            <FormModeBadge mode={form.mode} />
                            <FormStatusBadge status={form.status} />
                        </div>
                    </div>
                </div>
                <div className="flex flex-wrap gap-2">
                    <Button variant="outline" asChild>
                        <Link href={`/take/${form.public_id}`}>
                            <Eye className="mr-2 h-4 w-4" />
                            Preview
                        </Link>
                    </Button>
                    <Button asChild>
                        <Link href={`/forms/${form.id}/edit`}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Form
                        </Link>
                    </Button>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                {/* Left Column: Details */}
                <div className="md:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Description</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground whitespace-pre-wrap">
                                {form.description || "No description provided."}
                            </p>
                        </CardContent>
                    </Card>

                    <div className="grid gap-6 sm:grid-cols-2">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Questions</CardTitle>
                                <FileText className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{form.question_count || 0}</div>
                                <p className="text-xs text-muted-foreground">
                                    Total questions in this form
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Responses</CardTitle>
                                <Users className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{form.response_count || 0}</div>
                                <p className="text-xs text-muted-foreground">
                                    Submissions collected so far
                                </p>
                                <Button variant="link" size="sm" className="px-0 mt-2" asChild>
                                    <Link href={`/forms/${form.id}/responses`}>
                                        View all responses
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Right Column: Info/Settings */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Timing & Availability</CardTitle>
                            <CardDescription>When this form is accessible</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                                    <Calendar className="h-4 w-4 text-primary" />
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-muted-foreground uppercase">Starts</p>
                                    <p className="text-sm font-semibold">{form.start_date ? formatDateTime(form.start_date) : "Immediate"}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10">
                                    <Clock className="h-4 w-4 text-amber-500" />
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-muted-foreground uppercase">Ends</p>
                                    <p className="text-sm font-semibold">{form.end_date ? formatDateTime(form.end_date) : "No deadline"}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10">
                                    <Clock className="h-4 w-4 text-blue-500" />
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-muted-foreground uppercase">Time Limit</p>
                                    <p className="text-sm font-semibold">{form.time_limit_minutes ? `${form.time_limit_minutes} minutes` : "No limit"}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Shortcuts</CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-2">
                            <Button variant="outline" className="justify-start" asChild>
                                <Link href={`/forms/${form.id}/edit`}>
                                    <Settings className="mr-2 h-4 w-4" />
                                    Form Settings
                                </Link>
                            </Button>
                            <Button variant="outline" className="justify-start text-red-600 hover:text-red-700" onClick={() => toast.error("Delete functionality not implemented in this view")}>
                                <Edit className="mr-2 h-4 w-4" />
                                Delete Form
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
