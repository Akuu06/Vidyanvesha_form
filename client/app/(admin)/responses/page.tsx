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
import { formatDateTime } from "@/lib/form-utils";
import {
    Plus,
    Search,
    MoreVertical,
    Edit,
    Eye,
    Trash2,
    Inbox,
    Loader2,
    AlertCircle,
    CheckCircle2,
    XCircle,
    Clock
} from "lucide-react";
import { toast } from "sonner";
import { formResponseService } from "@/service/FormResponseService";
import { FormResponse } from "@/types/form.types";
import { Badge } from "@/components/ui/badge";

export default function ResponseListPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const formIdFilter = searchParams.get("formId");

    const [searchQuery, setSearchQuery] = useState("");
    const [responses, setResponses] = useState<FormResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchResponses = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await formResponseService.getAllFormResponses();
            setResponses(data || []);
        } catch (err) {
            console.error("Error fetching responses:", err);
            setError("Failed to load responses. Please try again later.");
            toast.error("Failed to load responses");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchResponses();
    }, []);

    const filteredResponses = useMemo(() => {
        return responses.filter((response) => {
            // Filter by formId if provided in URL
            if (formIdFilter && response.form !== Number(formIdFilter)) {
                return false;
            }

            const matchesSearch =
                (response.form_title && response.form_title.toLowerCase().includes(searchQuery.toLowerCase())) ||
                (response.user_name && response.user_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
                (response.user_email && response.user_email.toLowerCase().includes(searchQuery.toLowerCase()));
            return matchesSearch;
        });
    }, [responses, searchQuery, formIdFilter]);

    const handleDelete = async (responseId: number) => {
        if (!confirm(`Are you sure you want to delete this response?`)) return;

        try {
            await formResponseService.deleteFormResponse(responseId);
            toast.success(`Response deleted successfully`);
            fetchResponses();
        } catch (err) {
            console.error("Error deleting response:", err);
            toast.error("Failed to delete response");
        }
    };

    if (isLoading) {
        return (
            <div className="flex h-[400px] w-full flex-col items-center justify-center gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-muted-foreground">Loading responses...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex h-[400px] w-full flex-col items-center justify-center gap-4 p-6 text-center">
                <AlertCircle className="h-12 w-12 text-destructive" />
                <div>
                    <h3 className="text-lg font-semibold">Error Loading Responses</h3>
                    <p className="text-muted-foreground">{error}</p>
                </div>
                <Button onClick={fetchResponses} variant="outline">
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
                    <h1 className="text-3xl font-bold tracking-tight">Responses</h1>
                    <p className="text-muted-foreground">
                        View and manage user submissions
                    </p>
                </div>
                <Link href="/responses/create">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        New Attempt
                    </Button>
                </Link>
            </div>

            {/* Filters */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by form title or user..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                </div>
                {formIdFilter && (
                    <Button
                        variant="secondary"
                        onClick={() => router.push("/responses")}
                        className="bg-primary/10 text-primary hover:bg-primary/20"
                    >
                        Showing Form #{formIdFilter}
                        <XCircle className="ml-2 h-4 w-4" />
                    </Button>
                )}
            </div>

            {/* Table */}
            {filteredResponses.length === 0 ? (
                <EmptyState
                    icon={Inbox}
                    title="No responses found"
                    description={
                        searchQuery
                            ? "Try adjusting your search query"
                            : "Submissions will appear here once users start filling your forms"
                    }
                    action={
                        searchQuery
                            ? undefined
                            : {
                                label: "Manual Entry",
                                onClick: () => (window.location.href = "/responses/create"),
                            }
                    }
                />
            ) : (
                <div className="rounded-lg border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Form</TableHead>
                                <TableHead>User / Attempt</TableHead>
                                <TableHead>Started At</TableHead>
                                <TableHead className="text-center">Score</TableHead>
                                <TableHead className="text-center">Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredResponses.map((response) => (
                                <TableRow key={response.id}>
                                    <TableCell>
                                        <div className="flex flex-col gap-1">
                                            <span className="font-semibold">{response.form_title || `Form ID: ${response.form}`}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col gap-1">
                                            <span className="text-sm font-medium">
                                                {response.user_name || response.user_email || "Anonymous User"}
                                            </span>
                                            <span className="text-xs text-muted-foreground">
                                                Attempt #{response.attempt_number}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-sm text-muted-foreground">
                                        {formatDateTime(response.started_at)}
                                    </TableCell>
                                    <TableCell className="text-center font-bold">
                                        {response.score.toFixed(1)}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        {response.is_completed ? (
                                            <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-100 border-green-200 gap-1">
                                                <CheckCircle2 className="h-3 w-3" />
                                                Submitted
                                            </Badge>
                                        ) : (
                                            <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50 gap-1">
                                                <Clock className="h-3 w-3" />
                                                In Progress
                                            </Badge>
                                        )}
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
                                                    <Link href={`/responses/${response.id}`}>
                                                        <Eye className="mr-2 h-4 w-4" />
                                                        View Details
                                                    </Link>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem asChild>
                                                    <Link href={`/responses/${response.id}/edit`}>
                                                        <Edit className="mr-2 h-4 w-4" />
                                                        Edit Record
                                                    </Link>
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem
                                                    className="text-red-600"
                                                    onClick={() => handleDelete(response.id)}
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