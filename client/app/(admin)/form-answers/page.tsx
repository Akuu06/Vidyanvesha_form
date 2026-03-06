"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
    CheckCircle2,
    XCircle,
    Loader2,
    AlertCircle,
    Hash,
    ClipboardCheck,
    HelpCircle
} from "lucide-react";
import { toast } from "sonner";
import { formAnswerService } from "@/service/FormAnswerService";
import { FormAnswer } from "@/types/form.types";
import { Badge } from "@/components/ui/badge";

export default function FormAnswerListPage() {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState("");
    const [formAnswers, setFormAnswers] = useState<FormAnswer[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchFormAnswers = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await formAnswerService.getAllFormAnswers();
            setFormAnswers(data || []);
        } catch (err) {
            console.error("Error fetching form answers:", err);
            setError("Failed to load form answers. Please try again later.");
            toast.error("Failed to load form answers");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchFormAnswers();
    }, []);

    const filteredAnswers = useMemo(() => {
        return formAnswers.filter((item) => {
            const matchesSearch =
                item.id.toString().includes(searchQuery) ||
                item.response.toString().includes(searchQuery) ||
                item.question_id.toString().includes(searchQuery) ||
                (item.answer_text && item.answer_text.toLowerCase().includes(searchQuery.toLowerCase()));
            return matchesSearch;
        });
    }, [formAnswers, searchQuery]);

    const handleDelete = async (id: number) => {
        if (!confirm(`Are you sure you want to delete this form answer?`)) return;

        try {
            await formAnswerService.deleteFormAnswer(id);
            toast.success(`Form answer deleted successfully`);
            fetchFormAnswers();
        } catch (err) {
            console.error("Error deleting form answer:", err);
            toast.error("Failed to delete form answer");
        }
    };

    if (isLoading) {
        return (
            <div className="flex h-[400px] w-full flex-col items-center justify-center gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-muted-foreground">Loading form answers...</p>
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
                <Button onClick={fetchFormAnswers} variant="outline">
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
                    <h1 className="text-3xl font-bold tracking-tight">Form Answers</h1>
                    <p className="text-muted-foreground">
                        View and manage individual answers submitted by users
                    </p>
                </div>
                <Link href="/form-answers/create">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Create Form Answer
                    </Button>
                </Link>
            </div>

            {/* Filters */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by ID, response, question or text..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                </div>
            </div>

            {/* Table */}
            {filteredAnswers.length === 0 ? (
                <EmptyState
                    icon={ClipboardCheck}
                    title="No form answers found"
                    description={
                        searchQuery
                            ? "Try adjusting your search query"
                            : "No answers have been recorded yet"
                    }
                    action={
                        searchQuery
                            ? undefined
                            : {
                                label: "Create first answer",
                                onClick: () => router.push("/form-answers/create"),
                            }
                    }
                />
            ) : (
                <div className="rounded-lg border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[100px]">ID</TableHead>
                                <TableHead>Response ID</TableHead>
                                <TableHead>Question ID</TableHead>
                                <TableHead>Correct</TableHead>
                                <TableHead>Marks</TableHead>
                                <TableHead>Created At</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredAnswers.map((item) => (
                                <TableRow key={item.id}>
                                    <TableCell className="font-mono text-xs">#{item.id}</TableCell>
                                    <TableCell>
                                        <Badge variant="secondary" className="font-mono">
                                            R-{item.response}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="font-mono">
                                            Q-{item.question_id}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        {item.is_correct ? (
                                            <Badge className="bg-green-100 text-green-700 hover:bg-green-200 border-none">
                                                <CheckCircle2 className="mr-1 h-3 w-3" />
                                                Yes
                                            </Badge>
                                        ) : (
                                            <Badge variant="destructive" className="bg-red-100 text-red-700 hover:bg-red-200 border-none">
                                                <XCircle className="mr-1 h-3 w-3" />
                                                No
                                            </Badge>
                                        )}
                                    </TableCell>
                                    <TableCell className="font-medium">
                                        {item.marks_awarded} pts
                                    </TableCell>
                                    <TableCell className="text-muted-foreground text-sm">
                                        {formatDateTime(item.created_dt)}
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
                                                <DropdownMenuItem onClick={() => router.push(`/form-answers/${item.id}`)}>
                                                    <Eye className="mr-2 h-4 w-4" />
                                                    View Details
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => router.push(`/form-answers/${item.id}/edit`)}>
                                                    <Edit className="mr-2 h-4 w-4" />
                                                    Edit Answer
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem
                                                    className="text-red-600 focus:bg-red-50 focus:text-red-600"
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
