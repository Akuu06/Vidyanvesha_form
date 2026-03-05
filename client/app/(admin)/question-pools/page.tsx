"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
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
    Database,
    Loader2,
    AlertCircle,
    Shuffle
} from "lucide-react";
import { toast } from "sonner";
import { questionPoolService } from "@/service/QuestionPoolService";
import { QuestionPool } from "@/types/form.types";
import { Badge } from "@/components/ui/badge";

export default function QuestionPoolListPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [pools, setPools] = useState<QuestionPool[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchPools = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await questionPoolService.getAllQuestionPools();
            setPools(data || []);
        } catch (err) {
            console.error("Error fetching question pools:", err);
            setError("Failed to load question pools. Please try again later.");
            toast.error("Failed to load question pools");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchPools();
    }, []);

    const filteredPools = useMemo(() => {
        return pools.filter((pool) => {
            const matchesSearch =
                pool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (pool.form_title && pool.form_title.toLowerCase().includes(searchQuery.toLowerCase()));
            return matchesSearch;
        });
    }, [pools, searchQuery]);

    const handleDelete = async (poolId: number, poolName: string) => {
        if (!confirm(`Are you sure you want to delete question pool "${poolName}"?`)) return;

        try {
            await questionPoolService.deleteQuestionPool(poolId);
            toast.success(`Question pool "${poolName}" deleted successfully`);
            fetchPools();
        } catch (err) {
            console.error("Error deleting question pool:", err);
            toast.error("Failed to delete question pool");
        }
    };

    if (isLoading) {
        return (
            <div className="flex h-[400px] w-full flex-col items-center justify-center gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-muted-foreground">Loading question pools...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex h-[400px] w-full flex-col items-center justify-center gap-4 p-6 text-center">
                <AlertCircle className="h-12 w-12 text-destructive" />
                <div>
                    <h3 className="text-lg font-semibold">Error Loading Question Pools</h3>
                    <p className="text-muted-foreground">{error}</p>
                </div>
                <Button onClick={fetchPools} variant="outline">
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
                    <h1 className="text-3xl font-bold tracking-tight">Question Pools</h1>
                    <p className="text-muted-foreground">
                        Manage your question banks and random picking rules
                    </p>
                </div>
                <Link href="/question-pools/create">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Create Pool
                    </Button>
                </Link>
            </div>

            {/* Filters */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by name or form..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                </div>
            </div>

            {/* Table */}
            {filteredPools.length === 0 ? (
                <EmptyState
                    icon={Database}
                    title="No question pools found"
                    description={
                        searchQuery
                            ? "Try adjusting your search query"
                            : "Get started by creating your first question pool"
                    }
                    action={
                        searchQuery
                            ? undefined
                            : {
                                label: "Create Pool",
                                onClick: () => (window.location.href = "/question-pools/create"),
                            }
                    }
                />
            ) : (
                <div className="rounded-lg border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Pool Name</TableHead>
                                <TableHead>Associated Form</TableHead>
                                <TableHead className="text-center">Pick Count</TableHead>
                                <TableHead className="text-center">Shuffle</TableHead>
                                <TableHead>Created</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredPools.map((pool) => (
                                <TableRow key={pool.id}>
                                    <TableCell>
                                        <Link
                                            href={`/question-pools/${pool.id}/edit`}
                                            className="font-medium hover:underline text-primary"
                                        >
                                            {pool.name}
                                        </Link>
                                    </TableCell>
                                    <TableCell>
                                        <span className="font-medium text-muted-foreground">
                                            {pool.form_title || `Form ID: ${pool.form}`}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-center font-mono">
                                        {pool.pick_count}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        {pool.shuffle_questions ? (
                                            <Badge variant="secondary" className="gap-1">
                                                <Shuffle className="h-3 w-3" />
                                                Yes
                                            </Badge>
                                        ) : (
                                            <Badge variant="outline">No</Badge>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-sm text-muted-foreground">
                                        {formatDateTime(pool.created_dt)}
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
                                                    <Link href={`/responses`}>
                                                        <Eye className="mr-2 h-4 w-4" />
                                                        View Responses
                                                    </Link>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem asChild>
                                                    <Link href={`/question-pools/${pool.id}`}>
                                                        <Eye className="mr-2 h-4 w-4" />
                                                        View
                                                    </Link>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem asChild>
                                                    <Link href={`/question-pools/${pool.id}/edit`}>
                                                        <Edit className="mr-2 h-4 w-4" />
                                                        Edit
                                                    </Link>
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem
                                                    className="text-red-600"
                                                    onClick={() => handleDelete(pool.id, pool.name)}
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
