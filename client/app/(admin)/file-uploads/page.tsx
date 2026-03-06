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
    FileImage,
    HelpCircle,
    Download
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
} from "@/components/ui/card";
import { toast } from "sonner";
import Link from "next/link";
import { fileUploadService } from "@/service/FileUploadService";
import { ResponseFileUpload } from "@/types/form.types";
import { Badge } from "@/components/ui/badge";

export default function FileUploadsPage() {
    const router = useRouter();
    const [uploads, setUploads] = useState<ResponseFileUpload[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    const fetchUploads = async () => {
        setIsLoading(true);
        try {
            const data = await fileUploadService.getAllFileUploads();
            setUploads(data);
        } catch (error) {
            console.error("Error fetching file uploads:", error);
            toast.error("Failed to load file uploads");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchUploads();
    }, []);

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this file upload record?")) return;
        try {
            await fileUploadService.deleteFileUpload(id);
            toast.success("File upload record deleted successfully");
            fetchUploads();
        } catch (error) {
            console.error("Error deleting file upload:", error);
            toast.error("Failed to delete file upload");
        }
    };

    const _getFileNameFromPath = (path: string) => {
        try {
            return path.split('/').pop() || path;
        } catch (e) {
            return path;
        }
    };

    const filteredUploads = uploads.filter((u) => {
        const _filename = _getFileNameFromPath(u.file_path).toLowerCase();
        return (
            _filename.includes(searchTerm.toLowerCase()) ||
            u.id.toString().includes(searchTerm) ||
            u.response.toString().includes(searchTerm)
        );
    });

    if (isLoading) {
        return (
            <div className="flex h-[400px] w-full flex-col items-center justify-center gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-muted-foreground">Loading file uploads...</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6 p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">File Uploads</h1>
                    <p className="text-muted-foreground">
                        Manage file uploads gathered from form responses
                    </p>
                </div>
                <Link href="/file-uploads/create">
                    <Button className="w-full sm:w-auto">
                        <Plus className="mr-2 h-4 w-4" />
                        Create Record
                    </Button>
                </Link>
            </div>

            <Card className="border-none shadow-sm bg-muted/40">
                <CardContent className="p-4">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Search by filename, response ID, or record ID..."
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
                            <TableHead>File</TableHead>
                            <TableHead>Response Mapping</TableHead>
                            <TableHead>Question ID</TableHead>
                            <TableHead>Date Logged</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredUploads.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                                    No file uploads found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredUploads.map((upload) => (
                                <TableRow key={upload.id} className="hover:bg-muted/30">
                                    <TableCell className="font-medium">#{upload.id}</TableCell>
                                    <TableCell className="max-w-[250px] truncate">
                                        <div className="flex items-center gap-2">
                                            <FileImage className="h-4 w-4 text-blue-500 shrink-0" />
                                            <span className="truncate" title={upload.file_path}>
                                                {_getFileNameFromPath(upload.file_path)}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline">Resp: {upload.response}</Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-1">
                                            <HelpCircle className="h-3 w-3 text-muted-foreground" />
                                            <span>{upload.question_id}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground text-sm">
                                        {upload.created_dt ? new Date(upload.created_dt).toLocaleDateString() : 'N/A'}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <Link href={`/file-uploads/${upload.id}`}>
                                                    <DropdownMenuItem className="cursor-pointer">
                                                        <Eye className="mr-2 h-4 w-4" />
                                                        View Details
                                                    </DropdownMenuItem>
                                                </Link>
                                                <Link href={`/file-uploads/${upload.id}/edit`}>
                                                    <DropdownMenuItem className="cursor-pointer">
                                                        <Edit className="mr-2 h-4 w-4" />
                                                        Edit Record
                                                    </DropdownMenuItem>
                                                </Link>
                                                <DropdownMenuItem
                                                    className="cursor-pointer text-destructive focus:text-destructive"
                                                    onClick={() => handleDelete(upload.id)}
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
