"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Edit, Trash2, Calendar, User, Hash, Layers, FileText } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { formatDateTime } from "@/lib/form-utils";
import { formSectionsService } from "@/service/FormSectionsService";
import { FormSection } from "@/types/form.types";

export default function SectionDetailPage() {
    const router = useRouter();
    const { id } = useParams();
    const [section, setSection] = useState<FormSection | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchSection = async () => {
            setIsLoading(true);
            try {
                const data = await formSectionsService.getFormSectionById(Number(id));
                setSection(data);
            } catch (error) {
                console.error("Error fetching section:", error);
                toast.error("Failed to load section details");
            } finally {
                setIsLoading(false);
            }
        };

        if (id) fetchSection();
    }, [id]);

    const handleDelete = async () => {
        if (!section || !confirm(`Are you sure you want to delete section "${section.title}"?`)) return;

        try {
            await formSectionsService.deleteFormSection(section.id);
            toast.success("Section deleted successfully");
            router.push("/section-management");
        } catch (err) {
            console.error("Error deleting section:", err);
            toast.error("Failed to delete section");
        }
    };

    if (isLoading) {
        return (
            <div className="flex h-[400px] w-full flex-col items-center justify-center gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-muted-foreground">Loading section details...</p>
            </div>
        );
    }

    if (!section) {
        return (
            <div className="flex flex-col items-center justify-center gap-4 p-12 text-center">
                <Layers className="h-12 w-12 text-muted-foreground" />
                <h2 className="text-xl font-semibold">Section Not Found</h2>
                <p className="text-muted-foreground">The section you are looking for does not exist or has been deleted.</p>
                <Link href="/section-management">
                    <Button variant="outline">Back to Sections</Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6 p-6">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/section-management">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">{section.title}</h1>
                        <p className="text-muted-foreground">Section details and configuration</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Link href={`/section-management/${section.id}/edit`}>
                        <Button variant="outline">
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Section
                        </Button>
                    </Link>
                    <Button variant="destructive" onClick={handleDelete}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                    </Button>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Basic Info */}
                <Card>
                    <CardHeader>
                        <CardTitle>Basic Information</CardTitle>
                        <CardDescription>Main details of the form section</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <p className="text-sm font-medium text-muted-foreground">Title</p>
                                <p className="font-semibold">{section.title}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm font-medium text-muted-foreground">Order</p>
                                <p className="flex items-center gap-1">
                                    <Hash className="h-4 w-4 text-muted-foreground" />
                                    {section.order}
                                </p>
                            </div>
                        </div>
                        <Separator />
                        <div className="space-y-1">
                            <p className="text-sm font-medium text-muted-foreground">Description</p>
                            <p className="text-sm leading-relaxed">
                                {section.description || "No description provided."}
                            </p>
                        </div>
                        <Separator />
                        <div className="space-y-1">
                            <p className="text-sm font-medium text-muted-foreground">Associated Form</p>
                            <div className="flex items-center gap-2">
                                <FileText className="h-4 w-4 text-primary" />
                                <Link href={`/forms/${section.form}`} className="font-medium text-primary hover:underline">
                                    {section.form_title || `Form ID: ${section.form}`}
                                </Link>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Metadata */}
                <Card>
                    <CardHeader>
                        <CardTitle>Metadata & System Info</CardTitle>
                        <CardDescription>Creation and ownership details</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <User className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm font-medium">Created By</span>
                                </div>
                                <span className="text-sm">{section.created_by_username || section.created_by}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm font-medium">Created At</span>
                                </div>
                                <span className="text-sm text-muted-foreground">{formatDateTime(section.created_dt)}</span>
                            </div>
                            {section.updated_dt && (
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-sm font-medium">Last Updated</span>
                                    </div>
                                    <span className="text-sm text-muted-foreground">{formatDateTime(section.updated_dt)}</span>
                                </div>
                            )}
                        </div>
                        <Separator />
                        <div className="grid grid-cols-2 gap-4 pt-2">
                            <div className="space-y-1">
                                <p className="text-xs text-muted-foreground uppercase">Institute ID</p>
                                <p className="text-sm font-mono">{section.institute_id}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs text-muted-foreground uppercase">University ID</p>
                                <p className="text-sm font-mono">{section.university_id}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

function Loader2({ className }: { className?: string }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
        </svg>
    );
}
