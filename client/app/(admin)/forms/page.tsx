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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FormStatusBadge } from "@/components/forms/form-status-badge";
import { FormModeBadge } from "@/components/forms/form-mode-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { formatDateTime } from "@/lib/form-utils";
import {
  Plus,
  Search,
  MoreVertical,
  Edit,
  Eye,
  Copy,
  Trash2,
  FileText,
  Loader2,
  AlertCircle
} from "lucide-react";
import { FormStatus, FormMode, Form } from "@/types";
import { toast } from "sonner";
import { firebaseService } from "@/lib/firebaseService";
import { API_CONTS } from "@/lib/api";

export default function FormsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [modeFilter, setModeFilter] = useState<string>("all");
  const [forms, setForms] = useState<Form[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchForms = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = await firebaseService.getUserAccessToken();
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://13.206.10.42:8000/api";
      const response = await fetch(`${baseUrl}${API_CONTS.FORMS.LIST}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch forms");
      }

      const data = await response.json();
      setForms(data.results || []);
    } catch (err) {
      console.error("Error fetching forms:", err);
      setError("Failed to load forms. Please try again later.");
      toast.error("Failed to load forms");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchForms();
  }, []);

  const filteredForms = useMemo(() => {
    return forms.filter((form) => {
      const matchesSearch = form.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (form.description && form.description.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesStatus = statusFilter === "all" || form.status === statusFilter;
      const matchesMode = modeFilter === "all" || form.mode === modeFilter;

      return matchesSearch && matchesStatus && matchesMode;
    });
  }, [forms, searchQuery, statusFilter, modeFilter]);

  const handleDelete = (formId: number, formTitle: string) => {
    // In a real app, you would call the DELETE API here
    toast.success(`Form "${formTitle}" deleted successfully`);
  };

  const handleDuplicate = (formId: number, formTitle: string) => {
    toast.success(`Form "${formTitle}" duplicated successfully`);
  };

  if (isLoading) {
    return (
      <div className="flex h-[400px] w-full flex-col items-center justify-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Loading forms...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-[400px] w-full flex-col items-center justify-center gap-4 p-6 text-center">
        <AlertCircle className="h-12 w-12 text-destructive" />
        <div>
          <h3 className="text-lg font-semibold">Error Loading Forms</h3>
          <p className="text-muted-foreground">{error}</p>
        </div>
        <Button onClick={fetchForms} variant="outline">
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
          <h1 className="text-3xl font-bold tracking-tight">Forms</h1>
          <p className="text-muted-foreground">
            Manage your forms and quizzes
          </p>
        </div>
        <Link href="/forms/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Form
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search forms..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value={FormStatus.DRAFT}>Draft</SelectItem>
            <SelectItem value={FormStatus.PUBLISHED}>Published</SelectItem>
            <SelectItem value={FormStatus.CLOSED}>Closed</SelectItem>
          </SelectContent>
        </Select>
        <Select value={modeFilter} onValueChange={setModeFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value={FormMode.NORMAL_FORM}>Forms</SelectItem>
            <SelectItem value={FormMode.QUIZ}>Quizzes</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      {filteredForms.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No forms found"
          description={
            searchQuery || statusFilter !== "all" || modeFilter !== "all"
              ? "Try adjusting your filters"
              : "Get started by creating your first form"
          }
          action={
            searchQuery || statusFilter !== "all" || modeFilter !== "all"
              ? undefined
              : {
                label: "Create Form",
                onClick: () => (window.location.href = "/forms/new"),
              }
          }
        />
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-center">Questions</TableHead>
                <TableHead className="text-center">Responses</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredForms.map((form) => (
                <TableRow key={form.id}>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <Link
                        href={`/forms/${form.id}/edit`}
                        className="font-medium hover:underline"
                      >
                        {form.title}
                      </Link>
                      {form.description && (
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          {form.description}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <FormModeBadge mode={form.mode} />
                  </TableCell>
                  <TableCell>
                    <FormStatusBadge status={form.status} />
                  </TableCell>
                  <TableCell className="text-center">
                    {form.question_count || 0}
                  </TableCell>
                  <TableCell className="text-center">
                    {form.response_count || 0}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDateTime(form.created_dt)}
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
                          <Link href={`/forms/${form.id}`}>
                            <Eye className="mr-2 h-4 w-4" />
                            View
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/forms/${form.id}/edit`}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/section-management/`}>
                            <Copy className="mr-2 h-4 w-4" />
                            Manage Sections
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/question-pools/`}>
                            <Copy className="mr-2 h-4 w-4" />
                            Manage Question Pools
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/take/${form.public_id}`}>
                            <Eye className="mr-2 h-4 w-4" />
                            Preview
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/responses`}>
                            <FileText className="mr-2 h-4 w-4" />
                            View Responses
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/form-questions/`}>
                            <Plus className="mr-2 h-4 w-4" />
                            Manage Questions
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDuplicate(form.id, form.title)}
                        >
                          <Copy className="mr-2 h-4 w-4" />
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => handleDelete(form.id, form.title)}
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
