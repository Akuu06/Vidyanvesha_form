"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import {
    ArrowLeft,
    Loader2,
    Edit,
    Trash2,
    FileImage,
    HelpCircle,
    CalendarDays,
    Clock,
    User,
    Link as LinkIcon,
    HardDrive
} from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { fileUploadService } from "@/service/FileUploadService";
import { ResponseFileUpload } from "@/types/form.types";

export default function FileUploadDetailPage() {
    const router = useRouter();
    const { id } = useParams();
    const [uploadRecord, setUploadRecord] = useState<ResponseFileUpload | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        const fetchRecord = async () => {
            setIsLoading(true);
            try {
                const data = await fileUploadService.getFileUploadById(Number(id));
                setUploadRecord(data);
            } catch (error) {
                console.error("Error fetching record:", error);
                toast.error("Failed to load file upload details");
            } finally {
                setIsLoading(false);
            }
        };

        if (id) fetchRecord();
    }, [id]);

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this file upload record?")) return;
        setIsDeleting(true);
        try {
            await fileUploadService.deleteFileUpload(Number(id));
            toast.success("Record deleted successfully");
            router.push("/file-uploads");
        } catch (error) {
            console.error("Error deleting record:", error);
            toast.error("Failed to delete record");
            setIsDeleting(false);
        }
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return "N/A";
        return new Date(dateString).toLocaleString();
    };

    if (isLoading) {
        return (
            <div className="flex h-[400px] w-full flex-col items-center justify-center gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-muted-foreground">Loading record details...</p>
            </div>
        );
    }

    if (!uploadRecord) {
        return (
            <div className="flex h-[400px] flex-col items-center justify-center gap-4">
                <HelpCircle className="h-12 w-12 text-muted-foreground" />
                <h2 className="text-xl font-semibold">Record not found</h2>
                <Button onClick={() => router.push("/file-uploads")} variant="outline">
                    Return to List
                </Button>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6 p-6">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/file-uploads">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-3xl font-bold tracking-tight">File Upload Details</h1>
                            <Badge variant="secondary">ID: {uploadRecord.id}</Badge>
                        </div>
                        <p className="text-muted-foreground">
                            Mapping details for the uploaded resource
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Link href={`/file-uploads/${uploadRecord.id}/edit`}>
                        <Button variant="outline">
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                        </Button>
                    </Link>
                    <Button
                        variant="destructive"
                        onClick={handleDelete}
                        disabled={isDeleting}
                    >
                        {isDeleting ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <Trash2 className="mr-2 h-4 w-4" />
                        )}
                        Delete
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* Resource Info Main View */}
                <div className="md:col-span-2 space-y-6">
                    <Card className="border-t-4 border-t-primary shadow-sm h-full">
                        <CardHeader>
                            <div className="flex items-center gap-2 mb-2">
                                <HardDrive className="h-5 w-5 text-primary" />
                                <CardTitle>Resource Path</CardTitle>
                            </div>
                            <CardDescription>
                                The direct storage locator reference
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">

                            {/* Path Box */}
                            <div className="rounded-lg bg-muted p-4 border border-input">
                                <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-2">
                                    <FileImage className="h-4 w-4" />
                                    <span>File Reference</span>
                                </div>
                                <div className="font-mono text-sm break-all text-foreground">
                                    {uploadRecord.file_path}
                                </div>
                            </div>

                            {/* Entity Maps */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="border rounded-lg p-4 bg-background">
                                    <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-2">
                                        <LinkIcon className="h-4 w-4" />
                                        Mapped Response
                                    </div>
                                    <div className="font-medium text-lg">
                                        #{uploadRecord.response}
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-1 text-balance">
                                        This file was submitted as part of this response submission lifecycle.
                                    </p>
                                </div>

                                <div className="border rounded-lg p-4 bg-background">
                                    <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-2">
                                        <HelpCircle className="h-4 w-4" />
                                        Target Question
                                    </div>
                                    <div className="font-medium text-lg">
                                        #{uploadRecord.question_id}
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-1 text-balance">
                                        This file directly answers this specified form question.
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Additional Metadata / Audit Log */}
                <div className="space-y-6">
                    <Card className="shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-md">Audit Trail</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-start gap-3">
                                <CalendarDays className="h-4 w-4 text-muted-foreground mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium">Logged</p>
                                    <p className="text-sm text-muted-foreground">{formatDate(uploadRecord.created_dt)}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <User className="h-4 w-4 text-muted-foreground mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium">Uploaded By User ID</p>
                                    <p className="text-sm text-muted-foreground">{uploadRecord.created_by || "System / Unauthenticated"}</p>
                                </div>
                            </div>
                            {uploadRecord.updated_dt && (
                                <div className="flex items-start gap-3 pt-2 border-t mt-2">
                                    <Clock className="h-4 w-4 text-muted-foreground mt-0.5" />
                                    <div>
                                        <p className="text-sm font-medium">Last Modified</p>
                                        <p className="text-sm text-muted-foreground">{formatDate(uploadRecord.updated_dt)}</p>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Organization metadata */}
                    <Card className="shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-md">Organization</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {uploadRecord.university_id ? (
                                <div className="flex flex-col gap-1">
                                    <p className="text-sm font-medium">University ID</p>
                                    <p className="text-sm text-muted-foreground"># {uploadRecord.university_id}</p>
                                </div>
                            ) : null}
                            {uploadRecord.institute_id ? (
                                <div className="flex flex-col gap-1 pt-2 border-t mt-2">
                                    <p className="text-sm font-medium">Institute ID</p>
                                    <p className="text-sm text-muted-foreground"># {uploadRecord.institute_id}</p>
                                </div>
                            ) : null}
                            {!uploadRecord.university_id && !uploadRecord.institute_id ? (
                                <p className="text-sm text-muted-foreground">No organizational mapping.</p>
                            ) : null}
                        </CardContent>
                    </Card>
                </div>

            </div>
        </div>
    );
}
