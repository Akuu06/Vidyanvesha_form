"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
    ArrowLeft,
    Loader2,
    Save,
    ShieldPlus,
    Globe,
    Users,
    KeyRound
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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
import { accessRuleService } from "@/service/AccessRuleService";
import { CreateAccessRulePayload } from "@/types/form.types";
import api from "@/config/axios";
import { API_CONTS } from "@/lib/api";
import { firebaseService } from "@/lib/firebaseService";

const createAccessRuleSchema = z.object({
    form: z.number().min(1, "Please select a target form"),
    allowed_email_domain: z.string().optional().nullable(),
    allowed_user_group_id: z.number().optional().nullable(),
    otp_required: z.boolean().default(false),
});

type CreateAccessRuleInput = z.infer<typeof createAccessRuleSchema>;

export default function CreateAccessRulePage() {
    const router = useRouter();
    const [isSaving, setIsSaving] = useState(false);

    // Define a basic Form type since we are fetching it directly here
    const [forms, setForms] = useState<{ id: number, title?: string, [key: string]: any }[]>([]);
    const [isLoadingForms, setIsLoadingForms] = useState(true);

    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
        watch,
    } = useForm<CreateAccessRuleInput>({
        resolver: zodResolver(createAccessRuleSchema),
        defaultValues: {
            allowed_email_domain: "",
            allowed_user_group_id: 4, // Default per user request
            otp_required: false,
        }
    });

    useEffect(() => {
        const fetchForms = async () => {
            setIsLoadingForms(true);
            try {
                const token = await firebaseService.getUserAccessToken();
                const headers = { Authorization: `Bearer ${token}` };
                const response = await api.get(API_CONTS.FORMS.LIST, { headers });

                if (response.data && response.data.results && Array.isArray(response.data.results)) {
                    setForms(response.data.results);
                } else if (Array.isArray(response.data)) {
                    setForms(response.data);
                } else {
                    setForms([]);
                }
            } catch (error) {
                console.error("Error fetching forms:", error);
                toast.error("Failed to load forms for dropdown");
            } finally {
                setIsLoadingForms(false);
            }
        };

        fetchForms();
    }, []);

    const onSubmit = async (data: CreateAccessRuleInput) => {
        setIsSaving(true);
        try {
            // Transform empty strings to null for backend
            const payload: CreateAccessRulePayload = {
                form: data.form,
                allowed_email_domain: data.allowed_email_domain ? data.allowed_email_domain.trim() : null,
                allowed_user_group_id: data.allowed_user_group_id || null, // Keep the default 4 if provided
                otp_required: data.otp_required,
            };

            await accessRuleService.createAccessRule(payload);
            toast.success("Access rule created successfully");
            router.push("/access-rules");
        } catch (error: any) {
            console.error("Error creating rule:", error);
            const errMsg = error.response?.data?.detail || "Failed to create access rule.";
            toast.error(errMsg);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="flex flex-col gap-6 p-6">
            <div className="flex items-center gap-4">
                <Link href="/access-rules">
                    <Button variant="ghost" size="icon" disabled={isSaving}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Create Access Rule</h1>
                    <p className="text-muted-foreground">
                        Define security restrictions for a specific form.
                    </p>
                </div>
            </div>

            <div className="mx-auto w-full max-w-2xl">
                <Card className="border-t-4 border-t-primary shadow-md">
                    <CardHeader>
                        <div className="flex items-center gap-2 mb-2">
                            <ShieldPlus className="h-5 w-5 text-primary" />
                            <CardTitle>Configuration</CardTitle>
                        </div>
                        <CardDescription>
                            Apply email, group, and OTP constraints.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

                            {/* Target Form */}
                            <div className="space-y-4 p-4 border rounded-lg bg-muted/20">
                                <h3 className="font-medium text-sm text-foreground">Target Resource</h3>

                                <div className="space-y-2">
                                    <Label htmlFor="form">Form Connection *</Label>
                                    <Select
                                        onValueChange={(value) => setValue("form", Number(value), { shouldValidate: true })}
                                        disabled={isSaving || isLoadingForms}
                                    >
                                        <SelectTrigger id="form">
                                            <SelectValue placeholder={isLoadingForms ? "Loading forms..." : "Select the target form"} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {forms.map((f) => (
                                                <SelectItem key={f.id} value={f.id.toString()}>
                                                    [{f.id}] {f.title || "Untitled Form"}
                                                </SelectItem>
                                            ))}
                                            {forms.length === 0 && !isLoadingForms && (
                                                <SelectItem value="0" disabled>No forms available</SelectItem>
                                            )}
                                        </SelectContent>
                                    </Select>
                                    {errors.form && (
                                        <p className="text-sm text-destructive">{errors.form.message}</p>
                                    )}
                                </div>
                            </div>

                            {/* Constraints */}
                            <div className="space-y-6">
                                <h3 className="font-medium text-sm text-foreground mb-4">Security Constraints</h3>

                                <div className="space-y-2">
                                    <Label htmlFor="allowed_email_domain" className="flex items-center gap-2">
                                        <Globe className="h-4 w-4 text-muted-foreground" />
                                        Allowed Email Domain
                                    </Label>
                                    <Input
                                        id="allowed_email_domain"
                                        placeholder="e.g., students.college.edu"
                                        {...register("allowed_email_domain")}
                                        disabled={isSaving}
                                    />
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Leave blank to allow any valid email domain.
                                    </p>
                                    {errors.allowed_email_domain && (
                                        <p className="text-sm text-destructive">{errors.allowed_email_domain.message}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="allowed_user_group_id" className="flex items-center gap-2">
                                        <Users className="h-4 w-4 text-muted-foreground" />
                                        Allowed User Group ID
                                    </Label>
                                    <Input
                                        id="allowed_user_group_id"
                                        type="number"
                                        placeholder="Default: 4"
                                        {...register("allowed_user_group_id", { valueAsNumber: true })}
                                        disabled={isSaving}
                                    />
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Restrict access to a specific internal user group by ID.
                                    </p>
                                    {errors.allowed_user_group_id && (
                                        <p className="text-sm text-destructive">{errors.allowed_user_group_id.message}</p>
                                    )}
                                </div>

                                <div className="flex flex-row items-center justify-between rounded-lg border p-4 bg-muted/10 shadow-sm">
                                    <div className="space-y-0.5 mt-1">
                                        <Label htmlFor="otp_required" className="text-base font-semibold flex items-center gap-2">
                                            <KeyRound className="h-4 w-4 text-orange-500" />
                                            Require Multi-Factor (OTP)
                                        </Label>
                                        <CardDescription>
                                            Enforce strict identity verification via One-Time Passcode before allowing respondents.
                                        </CardDescription>
                                    </div>
                                    <div className="flex items-center space-x-2 mr-4">
                                        <Switch
                                            id="otp_required"
                                            checked={watch("otp_required")}
                                            onCheckedChange={(checked) => setValue("otp_required", checked, { shouldValidate: true })}
                                            disabled={isSaving}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4 border-t">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => router.push("/access-rules")}
                                    disabled={isSaving}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={isSaving || isLoadingForms} className="flex-1">
                                    {isSaving ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Deploying Rule...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="mr-2 h-4 w-4" />
                                            Save Configuration
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
