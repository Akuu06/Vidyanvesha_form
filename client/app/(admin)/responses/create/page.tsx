"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Loader2, Save, FileText, Calendar as CalendarIcon } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { z } from "zod";
import api from "@/config/axios";
import { API_CONTS } from "@/lib/api";
import { firebaseService } from "@/lib/firebaseService";
import { formResponseService } from "@/service/FormResponseService";
import { Form } from "@/types/form.types";
import { format } from "date-fns";

const createResponseSchema = z.object({
    form: z.number().min(1, "Please select a form"),
    started_at: z.string().min(1, "Start date is required"),
    user_id: z.string().optional().nullable(),
});

type CreateResponseInput = z.infer<typeof createResponseSchema>;

export default function CreateResponsePage() {
    const router = useRouter();
    const [isCreating, setIsCreating] = useState(false);
    const [forms, setForms] = useState<Form[]>([]);
    const [isLoadingForms, setIsLoadingForms] = useState(true);

    const {
        handleSubmit,
        formState: { errors },
        setValue,
        watch
    } = useForm<CreateResponseInput>({
        resolver: zodResolver(createResponseSchema),
        defaultValues: {
            started_at: new Date().toISOString(),
        }
    });

    const selectedForm = watch("form");

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

    const onSubmit = async (data: CreateResponseInput) => {
        setIsCreating(true);
        try {
            await formResponseService.createFormResponse(data);
            toast.success("Form response/attempt initialized successfully!");
            router.push("/responses");
        } catch (error: any) {
            console.error("Error creating response:", error);
            const errorMessage = error.response?.data?.detail || "Failed to initialize attempt. Please check all fields.";
            toast.error(errorMessage);
        } finally {
            setIsCreating(false);
        }
    };

    return (
        <div className="flex flex-col gap-6 p-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link href="/responses">
                    <Button variant="ghost" size="icon" disabled={isCreating}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Manual Response Entry</h1>
                    <p className="text-muted-foreground">
                        Initialize a new form attempt/response record
                    </p>
                </div>
            </div>

            {/* Form */}
            <div className="mx-auto w-full max-w-2xl">
                <Card className="border-t-4 border-t-primary">
                    <CardHeader>
                        <div className="flex items-center gap-2 mb-2">
                            <FileText className="h-5 w-5 text-primary" />
                            <CardTitle>Attempt Details</CardTitle>
                        </div>
                        <CardDescription>
                            Associate this record with a form and set the start time
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
                                <Label htmlFor="started_at">Started At *</Label>
                                <div className="relative">
                                    <CalendarIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <input
                                        type="datetime-local"
                                        id="started_at"
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-10 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        defaultValue={format(new Date(), "yyyy-MM-dd'T'HH:mm")}
                                        onChange={(e) => {
                                            const date = new Date(e.target.value);
                                            setValue("started_at", date.toISOString());
                                        }}
                                        disabled={isCreating}
                                    />
                                </div>
                                {errors.started_at && (
                                    <p className="text-sm text-red-500">{errors.started_at.message}</p>
                                )}
                            </div>

                            <div className="flex gap-3 pt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => router.push("/responses")}
                                    disabled={isCreating}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={isCreating} className="flex-1">
                                    {isCreating ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Initializing...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="mr-2 h-4 w-4" />
                                            Initialize Attempt
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