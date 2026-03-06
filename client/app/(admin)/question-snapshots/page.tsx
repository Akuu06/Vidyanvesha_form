"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    Plus,
    Search,
    Filter,
    MoreVertical,
    Edit,
    Trash2,
    Eye,
    Loader2,
    History,
    FileText,
    HelpCircle
} from "lucide-react";
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
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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

export default function QuestionSnapshotsPage() {
    const router = useRouter();
    const [snapshots, setSnapshots] = useState<QuestionSnapshot[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    const fetchSnapshots = async () => {
        setIsLoading(true);
        try {
            const data = await questionSnapshotService.getAllQuestionSnapshots();
            setSnapshots(data);
        } catch (error) {
            console.error("Error fetching snapshots:", error);
            toast.error("Failed to load question snapshots");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchSnapshots();
    }, []);

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this snapshot?")) return;
        try {
            await questionSnapshotService.deleteQuestionSnapshot(id);
            toast.success("Snapshot deleted successfully");
            fetchSnapshots();
        } catch (error) {
            console.error("Error deleting snapshot:", error);
            toast.error("Failed to delete snapshot");
        }
    };

    const filteredSnapshots = snapshots.filter((s) =>
        (s.question_text?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
        (s.form_question_detail?.form_title?.toLowerCase() || "").includes(searchTerm.toLowerCase())
    );

    if (isLoading) {
        return (
            <div className="flex h-[400px] w-full flex-col items-center justify-center gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-muted-foreground">Loading question snapshots...</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6 p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Question Snapshots</h1>
                    <p className="text-muted-foreground">
                        Manage and view versioned snapshots of form questions
                    </p>
                </div>
                <Link href="/question-snapshots/create">
                    <Button className="w-full sm:w-auto">
                        <Plus className="mr-2 h-4 w-4" />
                        Create Snapshot
                    </Button>
                </Link>
            </div>

            <Card className="border-none shadow-sm bg-muted/40">
                <CardContent className="p-4">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Search by question text or form..."
                                className="pl-9 bg-background"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <Button variant="outline" size="sm">
                            <Filter className="mr-2 h-4 w-4" />
                            Filter
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <div className="rounded-md border bg-card">
                <Table>
                    <TableHeader className="bg-muted/50">
                        <TableRow>
                            <TableHead className="w-[80px]">ID</TableHead>
                            <TableHead>Form</TableHead>
                            <TableHead>Question Text</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Options</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredSnapshots.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                                    No snapshots found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredSnapshots.map((snapshot) => (
                                <TableRow key={snapshot.id} className="hover:bg-muted/30">
                                    <TableCell className="font-medium">#{snapshot.id}</TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-semibold">{snapshot.form_question_detail.form_title}</span>
                                            <span className="text-xs text-muted-foreground">ID: {snapshot.form_question}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="max-w-[300px] truncate">
                                        <div className="flex items-center gap-2">
                                            <HelpCircle className="h-4 w-4 text-blue-500 shrink-0" />
                                            <span className="truncate">
                                                {snapshot.form_question_detail?.question_id || "Question"}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="secondary" className="capitalize">
                                            {snapshot.question_type.replace("_", " ")}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="font-mono">
                                            {snapshot.options_snapshot?.options?.length || 0} Options
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <Link href={`/question-snapshots/${snapshot.id}`}>
                                                    <DropdownMenuItem className="cursor-pointer">
                                                        <Eye className="mr-2 h-4 w-4" />
                                                        View Details
                                                    </DropdownMenuItem>
                                                </Link>
                                                <Link href={`/question-snapshots/${snapshot.id}/edit`}>
                                                    <DropdownMenuItem className="cursor-pointer">
                                                        <Edit className="mr-2 h-4 w-4" />
                                                        Edit Snapshot
                                                    </DropdownMenuItem>
                                                </Link>
                                                <DropdownMenuItem
                                                    className="cursor-pointer text-destructive focus:text-destructive"
                                                    onClick={() => handleDelete(snapshot.id)}
                                                >
                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                    Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
