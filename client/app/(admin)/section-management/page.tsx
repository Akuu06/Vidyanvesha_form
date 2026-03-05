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
    Layers,
    Loader2,
    AlertCircle
} from "lucide-react";
import { toast } from "sonner";
import { formSectionsService } from "@/service/FormSectionsService";
import { FormSection } from "@/types/form.types";

export default function SectionManagementPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [sections, setSections] = useState<FormSection[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchSections = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await formSectionsService.getAllFormSections();
            setSections(data || []);
        } catch (err) {
            console.error("Error fetching sections:", err);
            setError("Failed to load sections. Please try again later.");
            toast.error("Failed to load sections");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchSections();
    }, []);

    const filteredSections = useMemo(() => {
        return sections.filter((section) => {
            const matchesSearch =
                section.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (section.description && section.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
                (section.form_title && section.form_title.toLowerCase().includes(searchQuery.toLowerCase()));
            return matchesSearch;
        });
    }, [sections, searchQuery]);

    const handleDelete = async (sectionId: number, sectionTitle: string) => {
        if (!confirm(`Are you sure you want to delete section "${sectionTitle}"?`)) return;

        try {
            await formSectionsService.deleteFormSection(sectionId);
            toast.success(`Section "${sectionTitle}" deleted successfully`);
            fetchSections();
        } catch (err) {
            console.error("Error deleting section:", err);
            toast.error("Failed to delete section");
        }
    };

    if (isLoading) {
        return (
            <div className="flex h-[400px] w-full flex-col items-center justify-center gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-muted-foreground">Loading sections...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex h-[400px] w-full flex-col items-center justify-center gap-4 p-6 text-center">
                <AlertCircle className="h-12 w-12 text-destructive" />
                <div>
                    <h3 className="text-lg font-semibold">Error Loading Sections</h3>
                    <p className="text-muted-foreground">{error}</p>
                </div>
                <Button onClick={fetchSections} variant="outline">
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
                    <h1 className="text-3xl font-bold tracking-tight">Sections</h1>
                    <p className="text-muted-foreground">
                        Manage your form sections
                    </p>
                </div>
                <Link href="/section-management/create">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Create Section
                    </Button>
                </Link>
            </div>

            {/* Filters */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search sections or forms..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                </div>
            </div>

            {/* Table */}
            {filteredSections.length === 0 ? (
                <EmptyState
                    icon={Layers}
                    title="No sections found"
                    description={
                        searchQuery
                            ? "Try adjusting your search query"
                            : "Get started by creating your first section"
                    }
                    action={
                        searchQuery
                            ? undefined
                            : {
                                label: "Create Section",
                                onClick: () => (window.location.href = "/section-management/create"),
                            }
                    }
                />
            ) : (
                <div className="rounded-lg border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Title</TableHead>
                                <TableHead>Form</TableHead>
                                <TableHead className="text-center">Order</TableHead>
                                <TableHead>Created</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredSections.map((section) => (
                                <TableRow key={section.id}>
                                    <TableCell>
                                        <div className="flex flex-col gap-1">
                                            <Link
                                                href={`/section-management/${section.id}/edit`}
                                                className="font-medium hover:underline"
                                            >
                                                {section.title}
                                            </Link>
                                            {section.description && (
                                                <p className="text-sm text-muted-foreground line-clamp-1">
                                                    {section.description}
                                                </p>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <span className="font-medium">{section.form_title || `Form ID: ${section.form}`}</span>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        {section.order}
                                    </TableCell>
                                    <TableCell className="text-sm text-muted-foreground">
                                        {formatDateTime(section.created_dt)}
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
                                                    <Link href={`/section-management/${section.id}`}>
                                                        <Eye className="mr-2 h-4 w-4" />
                                                        View
                                                    </Link>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem asChild>
                                                    <Link href={`/section-management/${section.id}/edit`}>
                                                        <Edit className="mr-2 h-4 w-4" />
                                                        Edit
                                                    </Link>
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem
                                                    className="text-red-600"
                                                    onClick={() => handleDelete(section.id, section.title)}
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
