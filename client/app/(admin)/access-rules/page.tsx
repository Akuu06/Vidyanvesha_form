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
    ShieldCheck,
    Globe,
    Users,
    KeyRound
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
import { accessRuleService } from "@/service/AccessRuleService";
import { FormAccessRule } from "@/types/form.types";
import { Badge } from "@/components/ui/badge";

export default function AccessRulesPage() {
    const router = useRouter();
    const [rules, setRules] = useState<FormAccessRule[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    const fetchRules = async () => {
        setIsLoading(true);
        try {
            const data = await accessRuleService.getAllAccessRules();
            setRules(data);
        } catch (error) {
            console.error("Error fetching access rules:", error);
            toast.error("Failed to load access rules");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchRules();
    }, []);

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this access rule?")) return;
        try {
            await accessRuleService.deleteAccessRule(id);
            toast.success("Access rule deleted successfully");
            fetchRules();
        } catch (error) {
            console.error("Error deleting access rule:", error);
            toast.error("Failed to delete access rule");
        }
    };

    const filteredRules = rules.filter((r) => {
        const searchStr = searchTerm.toLowerCase();
        return (
            r.id.toString().includes(searchStr) ||
            r.form_title?.toLowerCase().includes(searchStr) ||
            r.allowed_email_domain?.toLowerCase().includes(searchStr) ||
            r.form.toString().includes(searchStr)
        );
    });

    if (isLoading) {
        return (
            <div className="flex h-[400px] w-full flex-col items-center justify-center gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-muted-foreground">Loading access rules...</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6 p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Access Rules</h1>
                    <p className="text-muted-foreground">
                        Manage security, privacy, and audience restrictions for forms
                    </p>
                </div>
                <Link href="/access-rules/create">
                    <Button className="w-full sm:w-auto">
                        <Plus className="mr-2 h-4 w-4" />
                        Create Rule
                    </Button>
                </Link>
            </div>

            <Card className="border-none shadow-sm bg-muted/40">
                <CardContent className="p-4">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Search by domain, form title, or ID..."
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
                            <TableHead>Target Form</TableHead>
                            <TableHead>Allowed Domain</TableHead>
                            <TableHead>User Group</TableHead>
                            <TableHead>Security</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredRules.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                                    No access rules found. Create one to restrict a form.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredRules.map((rule) => (
                                <TableRow key={rule.id} className="hover:bg-muted/30">
                                    <TableCell className="font-medium">#{rule.id}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0" />
                                            <div className="flex flex-col">
                                                <span className="truncate max-w-[200px]" title={rule.form_title || `Form ID: ${rule.form}`}>
                                                    {rule.form_title || "Unknown Form"}
                                                </span>
                                                <span className="text-xs text-muted-foreground font-mono">
                                                    ID: {rule.form}
                                                </span>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {rule.allowed_email_domain ? (
                                            <div className="flex items-center gap-2">
                                                <Globe className="h-3 w-3 text-muted-foreground" />
                                                <span className="font-mono text-sm">{rule.allowed_email_domain}</span>
                                            </div>
                                        ) : (
                                            <span className="text-muted-foreground text-sm italic">Any Domain</span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {rule.allowed_user_group_id ? (
                                            <div className="flex items-center gap-2">
                                                <Users className="h-3 w-3 text-muted-foreground" />
                                                <Badge variant="outline">Group ID: {rule.allowed_user_group_id}</Badge>
                                            </div>
                                        ) : (
                                            <span className="text-muted-foreground text-sm italic">Any Group</span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {rule.otp_required ? (
                                            <Badge variant="default" className="bg-orange-500 hover:bg-orange-600">
                                                <KeyRound className="mr-1 h-3 w-3" /> OTP verification
                                            </Badge>
                                        ) : (
                                            <span className="text-muted-foreground text-sm">Standard</span>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <Link href={`/access-rules/${rule.id}`}>
                                                    <DropdownMenuItem className="cursor-pointer">
                                                        <Eye className="mr-2 h-4 w-4" />
                                                        View Details
                                                    </DropdownMenuItem>
                                                </Link>
                                                <Link href={`/access-rules/${rule.id}/edit`}>
                                                    <DropdownMenuItem className="cursor-pointer">
                                                        <Edit className="mr-2 h-4 w-4" />
                                                        Edit Rule
                                                    </DropdownMenuItem>
                                                </Link>
                                                <DropdownMenuItem
                                                    className="cursor-pointer text-destructive focus:text-destructive"
                                                    onClick={() => handleDelete(rule.id)}
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
