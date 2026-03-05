"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Loader2, Save, Database } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { z } from "zod";
import api from "@/config/axios";
import { API_CONTS } from "@/lib/api";
import { firebaseService } from "@/lib/firebaseService";
import { questionPoolService } from "@/service/QuestionPoolService";
import { Form } from "@/types/form.types";

const createPoolSchema = z.object({
    form: z.number().min(1, "Please select a form"),
    name: z.string().min(3, "Name must be at least 3 characters").max(200, "Name must not exceed 200 characters"),
    pick_count: z.number().min(1, "Pick count must be at least 1"),
    shuffle_questions: z.boolean(),
});

type CreatePoolInput = z.infer<typeof createPoolSchema>;

export default function CreateQuestionPoolPage() {
    const router = useRouter();
    const [isCreating, setIsCreating] = useState(false);
    const [forms, setForms] = useState<Form[]>([]);
    const [isLoadingForms, setIsLoadingForms] = useState(true);

    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
        watch
    } = useForm<CreatePoolInput>({
        resolver: zodResolver(createPoolSchema),
        defaultValues: {
            pick_count: 10,
            shuffle_questions: true
        }
    });

    const shuffleValue = watch("shuffle_questions");

    useEffect(() => {
        const fetchForms = async () => {
            setIsLoadingForms(true);
            try {
                const token = await firebaseService.getUserAccessToken();
                const response = await api.get(API_CONTS.FORMS.LIST, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setForms(response.data.results || []);
            } catch (error) {
                console.error("Error fetching forms:", error);
                toast.error("Failed to load forms");
            } finally {
                setIsLoadingForms(false);
            }
        };

        fetchForms();
    }, []);

    const onSubmit = async (data: CreatePoolInput) => {
        setIsCreating(true);
        try {
            await questionPoolService.createQuestionPool(data);
            toast.success("Question pool created successfully!");
            router.push("/question-pools");
        } catch (error: any) {
            console.error("Error creating question pool:", error);
            const errorMessage = error.response?.data?.detail || "Failed to create pool. Please try again.";
            toast.error(errorMessage);
        } finally {
            setIsCreating(false);
        }
    };

    return (
        <div className="flex flex-col gap-6 p-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link href="/question-pools">
                    <Button variant="ghost" size="icon" disabled={isCreating}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Create Question Pool</h1>
                    <p className="text-muted-foreground">
                        Define rules for randomizing questions from a larger bank
                    </p>
                </div>
            </div>

            {/* Form */}
            <div className="mx-auto w-full max-w-2xl">
                <Card className="border-t-4 border-t-primary">
                    <CardHeader>
                        <div className="flex items-center gap-2 mb-2">
                            <Database className="h-5 w-5 text-primary" />
                            <CardTitle>Pool Configuration</CardTitle>
                        </div>
                        <CardDescription>
                            Select a form and define how many questions should be picked
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="form">Target Form *</Label>
                                <Select
                                    onValueChange={(value) => setValue("form", Number(value))}
                                    disabled={isCreating || isLoadingForms}
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
                                    disabled={isCreating}
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
                                    disabled={isCreating}
                                />
                                <p className="text-xs text-muted-foreground">
                                    The system will randomly select this many questions for each student.
                                </p>
                                {errors.pick_count && (
                                    <p className="text-sm text-red-500">{errors.pick_count.message}</p>
                                )}
                            </div>

                            <div className="flex items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                    <Label htmlFor="shuffle">Shuffle Questions</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Randomize the order of picked questions
                                    </p>
                                </div>
                                <Switch
                                    id="shuffle"
                                    checked={shuffleValue}
                                    onCheckedChange={(checked) => setValue("shuffle_questions", checked)}
                                    disabled={isCreating}
                                />
                            </div>

                            <div className="flex gap-3 pt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => router.push("/question-pools")}
                                    disabled={isCreating}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={isCreating} className="flex-1">
                                    {isCreating ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Creating Pool...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="mr-2 h-4 w-4" />
                                            Create Pool
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
