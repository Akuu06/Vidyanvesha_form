"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Loader2, Save, Database, History } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { z } from "zod";
import api from "@/config/axios";
import { API_CONTS } from "@/lib/api";
import { firebaseService } from "@/lib/firebaseService";
import { questionPoolService } from "@/service/QuestionPoolService";
import { Form, QuestionPool } from "@/types/form.types";

const editPoolSchema = z.object({
    form: z.number().min(1, "Please select a form"),
    name: z.string().min(3, "Name must be at least 3 characters").max(200, "Name must not exceed 200 characters"),
    pick_count: z.number().min(1, "Pick count must be at least 1"),
    shuffle_questions: z.boolean(),
});

type EditPoolInput = z.infer<typeof editPoolSchema>;

export default function EditQuestionPoolPage() {
    const router = useRouter();
    const { id } = useParams();
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [forms, setForms] = useState<Form[]>([]);
    const [isLoadingForms, setIsLoadingForms] = useState(true);

    const {
        register,
        handleSubmit,
        formState: { errors, isDirty },
        setValue,
        reset,
        watch
    } = useForm<EditPoolInput>({
        resolver: zodResolver(editPoolSchema),
    });

    const shuffleValue = watch("shuffle_questions");

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const token = await firebaseService.getUserAccessToken();

                // Fetch forms for dropdown
                const formsResponse = await api.get(API_CONTS.FORMS.LIST, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setForms(formsResponse.data.results || []);
                setIsLoadingForms(false);

                // Fetch pool details
                const pool = await questionPoolService.getQuestionPoolById(Number(id));
                reset({
                    form: pool.form,
                    name: pool.name,
                    pick_count: pool.pick_count,
                    shuffle_questions: pool.shuffle_questions
                });
            } catch (error) {
                console.error("Error fetching data:", error);
                toast.error("Failed to load question pool details");
            } finally {
                setIsLoading(false);
            }
        };

        if (id) fetchData();
    }, [id, reset]);

    const onSubmit = async (data: EditPoolInput) => {
        setIsSaving(true);
        try {
            await questionPoolService.updateQuestionPool(Number(id), data);
            toast.success("Question pool updated successfully!");
            router.push("/question-pools");
        } catch (error: any) {
            console.error("Error updating question pool:", error);
            const errorMessage = error.response?.data?.detail || "Failed to update pool. Please try again.";
            toast.error(errorMessage);
        } finally {
            setIsSaving(false);
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

    return (
        <div className="flex flex-col gap-6 p-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link href="/question-pools">
                    <Button variant="ghost" size="icon" disabled={isSaving}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Edit Question Pool</h1>
                    <p className="text-muted-foreground">
                        Update random selection rules for this bank
                    </p>
                </div>
            </div>

            {/* Form */}
            <div className="mx-auto w-full max-w-2xl">
                <Card className="border-t-4 border-t-blue-600">
                    <CardHeader>
                        <div className="flex items-center gap-2 mb-2">
                            <Database className="h-5 w-5 text-blue-600" />
                            <CardTitle>Pool Configuration</CardTitle>
                        </div>
                        <CardDescription>
                            Modify how questions are picked for the exam
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="form">Target Form *</Label>
                                <Select
                                    value={watch("form")?.toString()}
                                    onValueChange={(value) => setValue("form", Number(value), { shouldDirty: true })}
                                    disabled={isSaving || isLoadingForms}
                                >
                                    <SelectTrigger id="form">
                                        <SelectValue placeholder={isLoadingForms ? "Loading forms..." : "Select a form"} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {forms.map((form) => (
                                            <SelectItem key={form.id} value={form.id.toString()}>
                                                {form.title}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.form && (
                                    <p className="text-sm text-red-500">{errors.form.message}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="name">Pool Name *</Label>
                                <Input
                                    id="name"
                                    placeholder="e.g., Final Year Math Question Bank"
                                    {...register("name")}
                                    disabled={isSaving}
                                />
                                {errors.name && (
                                    <p className="text-sm text-red-500">{errors.name.message}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="pick_count">Number of Questions to Pick *</Label>
                                <Input
                                    id="pick_count"
                                    type="number"
                                    min="1"
                                    {...register("pick_count", { valueAsNumber: true })}
                                    disabled={isSaving}
                                />
                                {errors.pick_count && (
                                    <p className="text-sm text-red-500">{errors.pick_count.message}</p>
                                )}
                            </div>

                            <div className="flex items-center justify-between rounded-lg border p-4 bg-muted/30">
                                <div className="space-y-0.5">
                                    <Label htmlFor="shuffle">Shuffle Questions</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Randomize the order of picked questions
                                    </p>
                                </div>
                                <Switch
                                    id="shuffle"
                                    checked={shuffleValue}
                                    onCheckedChange={(checked) => setValue("shuffle_questions", checked, { shouldDirty: true })}
                                    disabled={isSaving}
                                />
                            </div>

                            <div className="flex gap-3 pt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => router.push("/question-pools")}
                                    disabled={isSaving}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={isSaving || !isDirty} className="flex-1">
                                    {isSaving ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Saving Changes...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="mr-2 h-4 w-4" />
                                            Save Changes
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
