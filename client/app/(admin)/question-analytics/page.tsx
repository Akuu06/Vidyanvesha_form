"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EmptyState } from "@/components/ui/empty-state";
import {
    Plus,
    Search,
    MoreVertical,
    Edit,
    Eye,
    Trash2,
    BarChart3,
    Loader2,
    AlertCircle,
    XCircle,
    Target
} from "lucide-react";
import { toast } from "sonner";
import { questionAnalyticService } from "@/service/QuestionAnalyticService";
import { QuestionAnalytics } from "@/types/form.types";
import { Badge } from "@/components/ui/badge";

export default function QuestionAnalyticsListPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const formIdFilter = searchParams.get("formId");

    const [searchQuery, setSearchQuery] = useState("");
    const [analytics, setAnalytics] = useState<QuestionAnalytics[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchAnalytics = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await questionAnalyticService.getAllQuestionAnalytics();
            setAnalytics(data || []);
        } catch (err) {
            console.error("Error fetching analytics:", err);
            setError("Failed to load question analytics. Please try again later.");
            toast.error("Failed to load analytics");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const filteredAnalytics = useMemo(() => {
        return analytics.filter((item) => {
            if (formIdFilter && item.form !== Number(formIdFilter)) {
                return false;
            }

            const matchesSearch =
                (item.form_title && item.form_title.toLowerCase().includes(searchQuery.toLowerCase())) ||
                (item.question_id && item.question_id.toString().includes(searchQuery));
            return matchesSearch;
        });
    }, [analytics, searchQuery, formIdFilter]);

    const handleDelete = async (analyticsId: number) => {
        if (!confirm(`Are you sure you want to delete this analytic record?`)) return;

        try {
            await questionAnalyticService.deleteQuestionAnalytic(analyticsId);
            toast.success(`Analytic record deleted successfully`);
            fetchAnalytics();
        } catch (err) {
            console.error("Error deleting analytic:", err);
            toast.error("Failed to delete analytic record");
        }
    };

    const getAccuracyColor = (percentage: number) => {
        if (percentage >= 80) return "bg-green-100 text-green-800 border-green-200";
        if (percentage >= 50) return "bg-amber-100 text-amber-800 border-amber-200";
        return "bg-red-100 text-red-800 border-red-200";
    };

    if (isLoading) {
        return (
            <div className="flex h-[400px] w-full flex-col items-center justify-center gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-muted-foreground">Loading analytics...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex h-[400px] w-full flex-col items-center justify-center gap-4 p-6 text-center">
                <AlertCircle className="h-12 w-12 text-destructive" />
                <div>
                    <h3 className="text-lg font-semibold">Error Loading Analytics</h3>
                    <p className="text-muted-foreground">{error}</p>
                </div>
                <Button onClick={fetchAnalytics} variant="outline">
                    Try Again
                </Button>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6 p-6">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Question Analytics</h1>
                    <p className="text-muted-foreground">
                        Monitor performance metrics for form questions
                    </p>
                </div>
                <Link href="/question-analytics/create">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Analytics
                    </Button>
                </Link>
            </div>

            {/* Filters */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by form title or question ID..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                </div>
                {formIdFilter && (
                    <Button
                        variant="secondary"
                        onClick={() => router.push("/question-analytics")}
                        className="bg-primary/10 text-primary hover:bg-primary/20"
                    >
                        Showing Form #{formIdFilter}
                        <XCircle className="ml-2 h-4 w-4" />
                    </Button>
                )}
            </div>

            {/* Table */}
            {filteredAnalytics.length === 0 ? (
                <EmptyState
                    icon={BarChart3}
                    title="No analytics found"
                    description={
                        searchQuery
                            ? "Try adjusting your search query"
                            : "Analytics records will appear here once created or generated"
                    }
                    action={
                        searchQuery
                            ? undefined
                            : {
                                label: "Create First Record",
                                onClick: () => router.push("/question-analytics/create"),
                            }
                    }
                />
            ) : (
                <div className="rounded-lg border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Form</TableHead>
                                <TableHead className="text-center">Question ID</TableHead>
                                <TableHead className="text-center">Total Attempts</TableHead>
                                <TableHead className="text-center">Correct</TableHead>
                                <TableHead className="text-center">Accuracy</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredAnalytics.map((item) => (
                                <TableRow key={item.id}>
                                    <TableCell>
                                        <div className="flex flex-col gap-1">
                                            <span className="font-semibold">{item.form_title || `Form ID: ${item.form}`}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-center font-mono text-sm">
                                        #{item.question_id}
                                    </TableCell>
                                    <TableCell className="text-center font-medium">
                                        {item.total_attempts}
                                    </TableCell>
                                    <TableCell className="text-center text-green-600 font-medium">
                                        {item.correct_attempts}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <Badge variant="outline" className={`${getAccuracyColor(item.accuracy_percentage)} gap-1 font-bold`}>
                                            <Target className="h-3 w-3" />
                                            {item.accuracy_percentage.toFixed(1)}%
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon">
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem asChild>
                                                    <Link href={`/question-analytics/${item.id}`}>
                                                        <Eye className="mr-2 h-4 w-4" />
                                                        View Details
                                                    </Link>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem asChild>
                                                    <Link href={`/question-analytics/${item.id}/edit`}>
                                                        <Edit className="mr-2 h-4 w-4" />
                                                        Edit Record
                                                    </Link>
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem
                                                    className="text-red-600"
                                                    onClick={() => handleDelete(item.id)}
                                                >
                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                    Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}
        </div>
    );
}
