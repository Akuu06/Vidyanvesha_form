"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import {
    ArrowLeft,
    Loader2,
    Edit,
    Trash2,
    HelpCircle,
    CalendarDays,
    Clock,
    User,
    ShieldCheck,
    Globe,
    Users,
    KeyRound
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
import { accessRuleService } from "@/service/AccessRuleService";
import { FormAccessRule } from "@/types/form.types";

export default function AccessRuleDetailPage() {
    const router = useRouter();
    const { id } = useParams();
    const [ruleRecord, setRuleRecord] = useState<FormAccessRule | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        const fetchRecord = async () => {
            setIsLoading(true);
            try {
                const data = await accessRuleService.getAccessRuleById(Number(id));
                setRuleRecord(data);
            } catch (error) {
                console.error("Error fetching record:", error);
                toast.error("Failed to load access rule details");
            } finally {
                setIsLoading(false);
            }
        };

        if (id) fetchRecord();
    }, [id]);

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this access rule?")) return;
        setIsDeleting(true);
        try {
            await accessRuleService.deleteAccessRule(Number(id));
            toast.success("Rule deleted successfully");
            router.push("/access-rules");
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
                <p className="text-muted-foreground">Loading rule parameters...</p>
            </div>
        );
    }

    if (!ruleRecord) {
        return (
            <div className="flex h-[400px] flex-col items-center justify-center gap-4">
                <HelpCircle className="h-12 w-12 text-muted-foreground" />
                <h2 className="text-xl font-semibold">Configuration not found</h2>
                <Button onClick={() => router.push("/access-rules")} variant="outline">
                    Return to Library
                </Button>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6 p-6">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/access-rules">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-3xl font-bold tracking-tight">Access Rule Details</h1>
                            <Badge variant="secondary">ID: {ruleRecord.id}</Badge>
                        </div>
                        <p className="text-muted-foreground">
                            Security parameters enforced for target form
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Link href={`/access-rules/${ruleRecord.id}/edit`}>
                        <Button variant="outline">
                            <Edit className="mr-2 h-4 w-4" />
                            Modify
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

                {/* Rule Parameter Block */}
                <div className="md:col-span-2 space-y-6">
                    <Card className="border-t-4 border-t-emerald-500 shadow-sm h-full">
                        <CardHeader>
                            <div className="flex items-center gap-2 mb-2">
                                <ShieldCheck className="h-5 w-5 text-emerald-500" />
                                <CardTitle>Rule Specifications</CardTitle>
                            </div>
                            <CardDescription>
                                Targeted assets and security thresholds
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">

                            {/* Targeted Form Box */}
                            <div className="rounded-lg bg-muted/50 p-4 border flex flex-col gap-2">
                                <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                    MAPPED RESOURCE CONNECTION
                                </div>
                                <div className="font-semibold text-xl text-foreground mt-1">
                                    {ruleRecord.form_title || "Unknown Form Name"}
                                </div>
                                <div className="text-sm font-mono text-muted-foreground bg-background self-start px-2 py-0.5 border rounded-sm">
                                    Form ID: {ruleRecord.form}
                                </div>
                            </div>

                            {/* Constraints Display */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="border rounded-lg p-5 bg-background shadow-sm hover:border-blue-200 transition-colors">
                                    <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4 flex items-center gap-2">
                                        <Globe className="h-4 w-4" />
                                        Approved Workspace
                                    </div>
                                    <div className="font-medium text-lg">
                                        {ruleRecord.allowed_email_domain || (
                                            <span className="text-muted-foreground italic">Unrestricted Domain</span>
                                        )}
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-2 text-balance leading-relaxed">
                                        Only endpoints matching this external email domain namespace will successfully authenticate.
                                    </p>
                                </div>

                                <div className="border rounded-lg p-5 bg-background shadow-sm hover:border-purple-200 transition-colors">
                                    <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4 flex items-center gap-2">
                                        <Users className="h-4 w-4" />
                                        Whitelisted Group Level
                                    </div>
                                    <div className="font-medium text-lg">
                                        {ruleRecord.allowed_user_group_id ? (
                                            <span>Tier ID: {ruleRecord.allowed_user_group_id}</span>
                                        ) : (
                                            <span className="text-muted-foreground italic">Public Tier</span>
                                        )}
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-2 text-balance leading-relaxed">
                                        Enforce role hierarchy verification requiring user clearance equal or superior to this tier.
                                    </p>
                                </div>

                                <div className="sm:col-span-2 border rounded-lg p-5 bg-background shadow-sm flex items-center justify-between">
                                    <div>
                                        <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-2">
                                            <KeyRound className="h-4 w-4 text-orange-500" />
                                            Active Verification Mode
                                        </div>
                                        <div className="font-medium text-lg">
                                            {ruleRecord.otp_required ? "Multi-Factor Required" : "Standard Token Auth"}
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-1 text-balance">
                                            Determines the friction levels users face upon initial gateway access ping.
                                        </p>
                                    </div>
                                    <div>
                                        {ruleRecord.otp_required ? (
                                            <Badge className="bg-orange-500/10 text-orange-600 border-orange-500/20 px-3 py-1" variant={"outline"}>ENABLED</Badge>
                                        ) : (
                                            <Badge className="bg-slate-100 text-slate-500 hover:bg-slate-100" variant="secondary">DISABLED</Badge>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Additional Metadata / Audit Log */}
                <div className="space-y-6">
                    <Card className="shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-md">Administrative Audit Log</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-start gap-3">
                                <CalendarDays className="h-4 w-4 text-muted-foreground mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium">Initially Deployed</p>
                                    <p className="text-sm text-muted-foreground">{formatDate(ruleRecord.created_dt)}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <User className="h-4 w-4 text-muted-foreground mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium">Author ID</p>
                                    <p className="text-sm text-muted-foreground">{ruleRecord.created_by || "System"}</p>
                                </div>
                            </div>
                            {ruleRecord.updated_dt && (
                                <div className="flex items-start gap-3 pt-4 border-t mt-4">
                                    <Clock className="h-4 w-4 text-muted-foreground mt-0.5" />
                                    <div>
                                        <p className="text-sm font-medium">Last Modified Epoch</p>
                                        <p className="text-sm text-muted-foreground">{formatDate(ruleRecord.updated_dt)}</p>
                                    </div>
                                </div>
                            )}
                            {ruleRecord.updated_by && (
                                <div className="flex items-start gap-3">
                                    <User className="h-4 w-4 text-muted-foreground mt-0.5" />
                                    <div>
                                        <p className="text-sm font-medium">Modified By ID</p>
                                        <p className="text-sm text-muted-foreground">{ruleRecord.updated_by}</p>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Organization metadata */}
                    <Card className="shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-md">Node Geography</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {ruleRecord.university_id ? (
                                <div className="flex flex-col gap-1">
                                    <p className="text-sm font-medium text-purple-700">University Node</p>
                                    <p className="text-sm text-muted-foreground"># {ruleRecord.university_id}</p>
                                </div>
                            ) : null}
                            {ruleRecord.institute_id ? (
                                <div className="flex flex-col gap-1 pt-2 border-t mt-2">
                                    <p className="text-sm font-medium text-emerald-700">Institute Node</p>
                                    <p className="text-sm text-muted-foreground"># {ruleRecord.institute_id}</p>
                                </div>
                            ) : null}
                            {!ruleRecord.university_id && !ruleRecord.institute_id ? (
                                <p className="text-sm text-muted-foreground">Global/No specific organizational routing.</p>
                            ) : null}
                        </CardContent>
                    </Card>
                </div>

            </div>
        </div>
    );
}
