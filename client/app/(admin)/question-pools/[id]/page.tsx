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
    Database,
    FileText,
    Shuffle,
    Hash,
    Loader2,
    AlertCircle
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { formatDateTime } from "@/lib/form-utils";
import { questionPoolService } from "@/service/QuestionPoolService";
import { QuestionPool } from "@/types/form.types";

export default function QuestionPoolDetailPage() {
    const router = useRouter();
    const { id } = useParams();
    const [pool, setPool] = useState<QuestionPool | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchPool = async () => {
            setIsLoading(true);
            try {
                const data = await questionPoolService.getQuestionPoolById(Number(id));
                setPool(data);
            } catch (error) {
                console.error("Error fetching question pool:", error);
                toast.error("Failed to load question pool details");
            } finally {
                setIsLoading(false);
            }
        };

        if (id) fetchPool();
    }, [id]);

    const handleDelete = async () => {
        if (!pool || !confirm(`Are you sure you want to delete question pool "${pool.name}"?`)) return;

        try {
            await questionPoolService.deleteQuestionPool(pool.id);
            toast.success("Question pool deleted successfully");
            router.push("/question-pools");
        } catch (err) {
            console.error("Error deleting question pool:", err);
            toast.error("Failed to delete question pool");
        }
    };

    if (isLoading) {
        return (
            <div className="flex h-[400px] w-full flex-col items-center justify-center gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-muted-foreground">Loading question pool details...</p>
            </div>
        );
    }

    if (!pool) {
        return (
            <div className="flex flex-col items-center justify-center gap-4 p-12 text-center">
                <Database className="h-12 w-12 text-muted-foreground" />
                <h2 className="text-xl font-semibold">Question Pool Not Found</h2>
                <p className="text-muted-foreground">The question pool you are looking for does not exist or has been deleted.</p>
                <Link href="/question-pools">
                    <Button variant="outline">Back to Question Pools</Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6 p-6">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/question-pools">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">{pool.name}</h1>
                        <p className="text-muted-foreground">Question pool configuration and rules</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Link href={`/question-pools/${pool.id}/edit`}>
                        <Button variant="outline">
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Pool
                        </Button>
                    </Link>
                    <Button variant="destructive" onClick={handleDelete}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                    </Button>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Pool Configuration */}
                <Card className="border-l-4 border-l-primary">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Database className="h-5 w-5 text-primary" />
                            Pool Configuration
                        </CardTitle>
                        <CardDescription>Rules for question selection</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <p className="text-sm font-medium text-muted-foreground">Pool Name</p>
                                <p className="font-semibold text-lg">{pool.name}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm font-medium text-muted-foreground">Questions to Pick</p>
                                <div className="flex items-center gap-2">
                                    <Hash className="h-4 w-4 text-primary" />
                                    <span className="text-xl font-bold font-mono">{pool.pick_count}</span>
                                </div>
                            </div>
                        </div>

                        <Separator />

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <p className="text-sm font-medium text-muted-foreground">Shuffle Questions</p>
                                <div>
                                    {pool.shuffle_questions ? (
                                        <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border-green-200">
                                            <Shuffle className="mr-1 h-3 w-3" />
                                            Enabled
                                        </Badge>
                                    ) : (
                                        <Badge variant="outline" className="text-muted-foreground">
                                            Disabled
                                        </Badge>
                                    )}
                                </div>
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm font-medium text-muted-foreground">ID</p>
                                <p className="text-sm font-mono text-muted-foreground">#{pool.id}</p>
                            </div>
                        </div>

                        <Separator />

                        <div className="space-y-1">
                            <p className="text-sm font-medium text-muted-foreground">Associated Form</p>
                            <div className="flex items-center gap-2 p-2 rounded-md bg-muted/50">
                                <FileText className="h-5 w-5 text-primary" />
                                <Link href={`/forms/${pool.form}`} className="font-medium text-primary hover:underline">
                                    {pool.form_title || `Form ID: ${pool.form}`}
                                </Link>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* System Information */}
                <Card>
                    <CardHeader>
                        <CardTitle>System Information</CardTitle>
                        <CardDescription>Creation and audit details</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <User className="h-4 w-4" />
                                    <span className="text-sm">Created By</span>
                                </div>
                                <span className="text-sm font-medium">{pool.created_by_username || `ID: ${pool.created_by}`}</span>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <Calendar className="h-4 w-4" />
                                    <span className="text-sm">Created At</span>
                                </div>
                                <span className="text-sm">{formatDateTime(pool.created_dt)}</span>
                            </div>

                            {pool.updated_dt && (
                                <>
                                    <Separator />
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                            <User className="h-4 w-4" />
                                            <span className="text-sm">Updated By</span>
                                        </div>
                                        <span className="text-sm font-medium">{pool.updated_by_username || `ID: ${pool.updated_by}`}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                            <Calendar className="h-4 w-4" />
                                            <span className="text-sm">Updated At</span>
                                        </div>
                                        <span className="text-sm">{formatDateTime(pool.updated_dt)}</span>
                                    </div>
                                </>
                            )}
                        </div>

                        <Separator className="my-4" />

                        <div className="grid grid-cols-2 gap-4 pt-2 text-center">
                            <div className="p-2 rounded-md bg-secondary/30">
                                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Institute ID</p>
                                <p className="text-sm font-mono mt-1">{pool.institute_id}</p>
                            </div>
                            <div className="p-2 rounded-md bg-secondary/30">
                                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">University ID</p>
                                <p className="text-sm font-mono mt-1">{pool.university_id}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
