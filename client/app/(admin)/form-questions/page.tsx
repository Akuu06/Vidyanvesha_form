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
    HelpCircle,
    Loader2,
    AlertCircle,
    Hash,
    Layers,
    FileText,
    Database,
    XCircle
} from "lucide-react";
import { toast } from "sonner";
import { formQuestionService } from "@/service/FormQuestionService";
import { FormQuestion } from "@/types/form.types";
import { Badge } from "@/components/ui/badge";

export default function FormQuestionListPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const formIdFilter = searchParams.get("formId");

    const [searchQuery, setSearchQuery] = useState("");
    const [formQuestions, setFormQuestions] = useState<FormQuestion[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchFormQuestions = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await formQuestionService.getAllFormQuestions();
            setFormQuestions(data || []);
        } catch (err) {
            console.error("Error fetching form questions:", err);
            setError("Failed to load form questions. Please try again later.");
            toast.error("Failed to load form questions");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchFormQuestions();
    }, []);

    const filteredQuestions = useMemo(() => {
        return formQuestions.filter((item) => {
            // Filter by formId if provided in URL
            if (formIdFilter && item.form !== Number(formIdFilter)) {
                return false;
            }

            const matchesSearch =
                (item.form_title && item.form_title.toLowerCase().includes(searchQuery.toLowerCase())) ||
                (item.section_title && item.section_title.toLowerCase().includes(searchQuery.toLowerCase())) ||
                (item.question_id.toString().includes(searchQuery));
            return matchesSearch;
        });
    }, [formQuestions, searchQuery, formIdFilter]);

    const handleDelete = async (id: number) => {
        if (!confirm(`Are you sure you want to remove this question from the form?`)) return;

        try {
            await formQuestionService.deleteFormQuestion(id);
            toast.success(`Question removed from form successfully`);
            fetchFormQuestions();
        } catch (err) {
            console.error("Error deleting form question:", err);
            toast.error("Failed to remove question");
        }
    };

    if (isLoading) {
        return (
            <div className="flex h-[400px] w-full flex-col items-center justify-center gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-muted-foreground">Loading form questions...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex h-[400px] w-full flex-col items-center justify-center gap-4 p-6 text-center">
                <AlertCircle className="h-12 w-12 text-destructive" />
                <div>
                    <h3 className="text-lg font-semibold">Error Loading Data</h3>
                    <p className="text-muted-foreground">{error}</p>
                </div>
                <Button onClick={fetchFormQuestions} variant="outline">
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
                    <h1 className="text-3xl font-bold tracking-tight">Form Questions</h1>
                    <p className="text-muted-foreground">
                        Manage question associations for your forms and sections
                    </p>
                </div>
                <Link href="/form-questions/create">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Question to Form
                    </Button>
                </Link>
            </div>

            {/* Filters */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by form or section title..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                </div>
                {formIdFilter && (
                    <Button
                        variant="secondary"
                        onClick={() => router.push("/form-questions")}
                        className="bg-primary/10 text-primary hover:bg-primary/20"
                    >
                        Showing Form #{formIdFilter}
                        <XCircle className="ml-2 h-4 w-4 text-primary" />
                    </Button>
                )}
            </div>

            {/* Table */}
            {filteredQuestions.length === 0 ? (
                <EmptyState
                    icon={HelpCircle}
                    title="No form questions found"
                    description={
                        searchQuery
                            ? "Try adjusting your search query"
                            : "Start by adding questions to your forms and sections"
                    }
                    action={
                        searchQuery
                            ? undefined
                            : {
                                label: "Add your first question",
                                onClick: () => (window.location.href = "/form-questions/create"),
                            }
                    }
                />
            ) : (
                <div className="rounded-lg border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Form & Section</TableHead>
                                <TableHead className="text-center">Question ID</TableHead>
                                <TableHead className="text-center">Order</TableHead>
                                <TableHead className="text-center">Marks</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredQuestions.map((item) => (
                                <TableRow key={item.id}>
                                    <TableCell>
                                        <div className="flex flex-col gap-1">
                                            <div className="flex items-center gap-2">
                                                <FileText className="h-4 w-4 text-primary" />
                                                <span className="font-semibold">{item.form_title || `Form ID: ${item.form}`}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                <Layers className="h-3 w-3" />
                                                <span>{item.section_title || `Section ID: ${item.section || 'None'}`}</span>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <Badge variant="outline" className="font-mono">
                                            Q-{item.question_id}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <div className="flex items-center justify-center gap-1 font-medium italic">
                                            <Hash className="h-3 w-3" />
                                            {item.order}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                                            {item.marks} pts
                                        </span>
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
                                                    <Link href={`/form-questions/${item.id}`}>
                                                        <Eye className="mr-2 h-4 w-4" />
                                                        View Details
                                                    </Link>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem asChild>
                                                    <Link href={`/form-questions/${item.id}/edit`}>
                                                        <Edit className="mr-2 h-4 w-4" />
                                                        Edit Mapping
                                                    </Link>
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem
                                                    className="text-red-600"
                                                    onClick={() => handleDelete(item.id)}
                                                >
                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                    Remove
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
