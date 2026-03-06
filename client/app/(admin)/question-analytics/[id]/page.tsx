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
    BarChart3,
    FileText,
    Target,
    CheckCircle2,
    XCircle,
    Loader2,
    Hash,
    Calendar,
    User
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { questionAnalyticService } from "@/service/QuestionAnalyticService";
import { QuestionAnalytics } from "@/types/form.types";
import { Progress } from "@/components/ui/progress";

export default function QuestionAnalyticDetailPage() {
    const router = useRouter();
    const { id } = useParams();
    const [analytics, setAnalytics] = useState<QuestionAnalytics | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchAnalytics = async () => {
            setIsLoading(true);
            try {
                const data = await questionAnalyticService.getQuestionAnalyticById(Number(id));
                setAnalytics(data);
            } catch (error) {
                console.error("Error fetching analytics:", error);
                toast.error("Failed to load analytic details");
            } finally {
                setIsLoading(false);
            }
        };

        if (id) fetchAnalytics();
    }, [id]);

    const handleDelete = async () => {
        if (!analytics || !confirm(`Are you sure you want to delete this analytic record?`)) return;

        try {
            await questionAnalyticService.deleteQuestionAnalytic(analytics.id);
            toast.success("Analytic record deleted successfully");
            router.push("/question-analytics");
        } catch (err) {
            console.error("Error deleting analytic:", err);
            toast.error("Failed to delete analytic record");
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

    if (!analytics) {
        return (
            <div className="flex flex-col items-center justify-center gap-4 p-12 text-center">
                <BarChart3 className="h-12 w-12 text-muted-foreground" />
                <h2 className="text-xl font-semibold">Analytic Record Not Found</h2>
                <p className="text-muted-foreground">The metrics record you are looking for does not exist.</p>
                <Link href="/question-analytics">
                    <Button variant="outline">Back to Analytics</Button>
                </Link>
            </div>
        );
    }

    const accuracy = analytics.accuracy_percentage || 0;
    const getAccuracyColor = (pct: number) => {
        if (pct >= 80) return "text-green-600";
        if (pct >= 50) return "text-amber-600";
        return "text-red-600";
    };

    return (
        <div className="flex flex-col gap-6 p-6">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/question-analytics">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Question Analytics Insight</h1>
                        <p className="text-muted-foreground">Form: {analytics.form_title || `ID: ${analytics.form}`}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Link href={`/question-analytics/${analytics.id}/edit`}>
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
                {/* Accuracy Card */}
                <Card className="md:col-span-1 border-t-4 border-t-primary">
                    <CardHeader className="text-center">
                        <CardTitle>Performance Accuracy</CardTitle>
                        <CardDescription>Based on total attempts</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center justify-center gap-6">
                        <div className="relative flex items-center justify-center h-40 w-40">
                            <svg className="h-full w-full" viewBox="0 0 100 100">
                                <circle
                                    className="text-muted stroke-current"
                                    strokeWidth="10"
                                    cx="50"
                                    cy="50"
                                    r="40"
                                    fill="transparent"
                                ></circle>
                                <circle
                                    className={`${accuracy >= 80 ? 'text-green-500' : accuracy >= 50 ? 'text-amber-500' : 'text-red-500'} stroke-current`}
                                    strokeWidth="10"
                                    strokeDasharray={`${analytics.accuracy_percentage * 2.51}, 251.2`}
                                    strokeLinecap="round"
                                    cx="50"
                                    cy="50"
                                    r="40"
                                    fill="transparent"
                                    transform="rotate(-90 50 50)"
                                ></circle>
                            </svg>
                            <div className="absolute flex flex-col items-center">
                                <span className="text-4xl font-bold">{accuracy.toFixed(1)}%</span>
                                <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Accuracy</span>
                            </div>
                        </div>

                        <div className="w-full space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Reliability Rating:</span>
                                <span className={`font-bold ${getAccuracyColor(accuracy)}`}>
                                    {accuracy >= 80 ? 'EXCELLENT' : accuracy >= 50 ? 'AVERAGE' : 'CRITICAL'}
                                </span>
                            </div>
                            <Progress value={accuracy} className="h-2" />
                        </div>
                    </CardContent>
                </Card>

                {/* Quantitative Data */}
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <BarChart3 className="h-5 w-5 text-primary" />
                            Attempt Breakdown
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-8">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-primary/10 rounded-lg">
                                    <Target className="h-6 w-6 text-primary" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-3xl font-bold">{analytics.total_attempts}</span>
                                    <span className="text-sm text-muted-foreground">Total Attempts recorded</span>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-green-100 rounded-lg">
                                    <CheckCircle2 className="h-6 w-6 text-green-600" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-3xl font-bold text-green-600">{analytics.correct_attempts}</span>
                                    <span className="text-sm text-muted-foreground">Correct Submissions</span>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-red-100 rounded-lg">
                                    <XCircle className="h-6 w-6 text-red-600" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-3xl font-bold text-red-600">{analytics.total_attempts - analytics.correct_attempts}</span>
                                    <span className="text-sm text-muted-foreground">Incorrect Submissions</span>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-blue-100 rounded-lg">
                                    <Hash className="h-6 w-6 text-blue-600" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-3xl font-bold text-blue-600">#{analytics.question_id}</span>
                                    <span className="text-sm text-muted-foreground">Question ID Tag</span>
                                </div>
                            </div>
                        </div>

                        <Separator />

                        <div className="p-4 bg-muted/50 rounded-lg border border-dashed flex items-center gap-3">
                            <FileText className="h-5 w-5 text-muted-foreground" />
                            <p className="text-sm text-muted-foreground italic">
                                "This question has a {accuracy.toFixed(1)}% success rate across {analytics.total_attempts} users."
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Metadata & Audit */}
                <Card className="md:col-span-3">
                    <CardHeader>
                        <CardTitle>System Information</CardTitle>
                    </CardHeader>
                    <CardContent className="grid sm:grid-cols-3 gap-6">
                        <div className="space-y-1">
                            <p className="text-sm font-medium text-muted-foreground">Associated Form</p>
                            <div className="flex items-center gap-2">
                                <FileText className="h-4 w-4 text-primary" />
                                <span className="font-semibold">{analytics.form_title || `Form ID: ${analytics.form}`}</span>
                            </div>
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm font-medium text-muted-foreground">Created On</p>
                            <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-primary" />
                                <span className="font-semibold">{new Date(analytics.created_dt).toLocaleDateString()}</span>
                            </div>
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm font-medium text-muted-foreground">Organization Context</p>
                            <div className="flex gap-2">
                                <Badge variant="secondary">Inst: {analytics.institute_id || 'Global'}</Badge>
                                <Badge variant="secondary">Univ: {analytics.university_id || 'Global'}</Badge>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
