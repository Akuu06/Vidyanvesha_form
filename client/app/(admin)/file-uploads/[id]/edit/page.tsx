"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
    ArrowLeft,
    Loader2,
    Save,
    FileEdit
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import Link from "next/link";
import { fileUploadService } from "@/service/FileUploadService";
import { formResponseService } from "@/service/FormResponseService";
import { formQuestionService } from "@/service/FormQuestionService";
import { FormResponse, FormQuestion } from "@/types/form.types";

const editFileUploadSchema = z.object({
    response: z.number().min(1, "Please select a response"),
    question_id: z.number().min(1, "Please select a question"),
    file_path: z.string().min(1, "File path is required"),
});

type EditFileUploadInput = z.infer<typeof editFileUploadSchema>;

export default function EditFileUploadPage() {
    const router = useRouter();
    const { id } = useParams();
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    const [responses, setResponses] = useState<FormResponse[]>([]);
    const [questions, setQuestions] = useState<FormQuestion[]>([]);
    const [isLoadingData, setIsLoadingData] = useState(true);

    const {
        register,
        handleSubmit,
        formState: { errors, isDirty },
        setValue,
        reset,
        watch,
    } = useForm<EditFileUploadInput>({
        resolver: zodResolver(editFileUploadSchema),
    });

    useEffect(() => {
        const fetchInitialData = async () => {
            setIsLoadingData(true);
            try {
                const [respData, questData] = await Promise.all([
                    formResponseService.getAllFormResponses(),
                    formQuestionService.getAllFormQuestions()
                ]);
                setResponses(respData);
                setQuestions(questData);
            } catch (error) {
                console.error("Error fetching dependencies:", error);
                toast.error("Failed to load required data for dropdowns");
            } finally {
                setIsLoadingData(false);
            }
        };

        fetchInitialData();
    }, []);

    useEffect(() => {
        const fetchUploadData = async () => {
            if (!id) return;
            setIsLoading(true);
            try {
                const data = await fileUploadService.getFileUploadById(Number(id));
                reset({
                    response: data.response,
                    question_id: data.question_id,
                    file_path: data.file_path,
                });
            } catch (error) {
                console.error("Error fetching upload detailing:", error);
                toast.error("Failed to load file upload details");
            } finally {
                setIsLoading(false);
            }
        };

        fetchUploadData();
    }, [id, reset]);

    const onSubmit = async (data: EditFileUploadInput) => {
        setIsSaving(true);
        try {
            const payload = {
                id: Number(id),
                response: data.response,
                question_id: data.question_id,
                file_path: data.file_path,
            };

            await fileUploadService.updateFileUpload(Number(id), payload);
            toast.success("File upload record updated successfully");
            router.push("/file-uploads");
        } catch (error: any) {
            console.error("Error updating record:", error);
            const errMsg = error.response?.data?.detail || "Failed to update record.";
            toast.error(errMsg);
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex h-[400px] w-full flex-col items-center justify-center gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-muted-foreground">Loading record details...</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6 p-6">
            <div className="flex items-center gap-4">
                <Link href="/file-uploads">
                    <Button variant="ghost" size="icon" disabled={isSaving}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Edit File Upload Record</h1>
                    <p className="text-muted-foreground">
                        Modify the file reference or change the response/question mappings.
                    </p>
                </div>
            </div>

            <div className="mx-auto w-full max-w-2xl">
                <Card className="border-t-4 border-t-primary shadow-md">
                    <CardHeader>
                        <div className="flex items-center gap-2 mb-2">
                            <FileEdit className="h-5 w-5 text-primary" />
                            <CardTitle>Update Link Metadata</CardTitle>
                        </div>
                        <CardDescription>
                            Adjust the stored path or relations for record #{id}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

                            {/* Entity Maps */}
                            <div className="space-y-4 p-4 border rounded-lg bg-muted/20">
                                <h3 className="font-medium text-sm text-foreground">Relational Mapping</h3>

                                <div className="space-y-2">
                                    <Label htmlFor="response">Form Response Link *</Label>
                                    <Select
                                        value={watch("response")?.toString()}
                                        onValueChange={(value) => setValue("response", Number(value), { shouldValidate: true, shouldDirty: true })}
                                        disabled={isSaving || isLoadingData}
                                    >
                                        <SelectTrigger id="response">
                                            <SelectValue placeholder={isLoadingData ? "Loading responses..." : "Select the target response"} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {responses.map((r) => (
                                                <SelectItem key={r.id} value={r.id.toString()}>
                                                    Response #{r.id} {r.score ? `(Score: ${r.score})` : ''}
                                                </SelectItem>
                                            ))}
                                            {responses.length === 0 && !isLoadingData && (
                                                <SelectItem value="0" disabled>No responses available</SelectItem>
                                            )}
                                        </SelectContent>
                                    </Select>
                                    {errors.response && (
                                        <p className="text-sm text-destructive">{errors.response.message}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="question_id">Form Question Link *</Label>
                                    <Select
                                        value={watch("question_id")?.toString()}
                                        onValueChange={(value) => setValue("question_id", Number(value), { shouldValidate: true, shouldDirty: true })}
                                        disabled={isSaving || isLoadingData}
                                    >
                                        <SelectTrigger id="question_id">
                                            <SelectValue placeholder={isLoadingData ? "Loading questions..." : "Select the source question"} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {questions.map((q) => (
                                                <SelectItem key={q.id} value={q.id.toString()}>
                                                    [{q.id}] {q.question_text || "Untitled Question"}
                                                </SelectItem>
                                            ))}
                                            {questions.length === 0 && !isLoadingData && (
                                                <SelectItem value="0" disabled>No form questions available</SelectItem>
                                            )}
                                        </SelectContent>
                                    </Select>
                                    {errors.question_id && (
                                        <p className="text-sm text-destructive">{errors.question_id.message}</p>
                                    )}
                                </div>
                            </div>

                            {/* Resource Details */}
                            <div className="space-y-4">
                                <h3 className="font-medium text-sm text-foreground">Resource Information</h3>

                                <div className="space-y-2">
                                    <Label htmlFor="file_path">Storage Reference Path *</Label>
                                    <Input
                                        id="file_path"
                                        placeholder="e.g., uploads/2026/03/report.pdf"
                                        {...register("file_path")}
                                        disabled={isSaving}
                                    />
                                    {errors.file_path && (
                                        <p className="text-sm text-destructive">{errors.file_path.message}</p>
                                    )}
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    This should be the exact storage path where the file is hosted on your backend or CDN.
                                </p>
                            </div>

                            <div className="flex gap-3 pt-4 border-t">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => router.push("/file-uploads")}
                                    disabled={isSaving}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={isSaving || (!isDirty)} className="flex-1">
                                    {isSaving ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Saving Changes...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="mr-2 h-4 w-4" />
                                            Update Record
                                        </>
                                    )}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
