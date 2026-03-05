"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { QuestionBuilder } from "@/components/forms/question-builder";
import { FormMode, FormStatus, TimerStartMode, LogicAction } from "@/types";
import { FORM_MODES, FORM_STATUSES, TIME_LIMIT_PRESETS, TIMER_START_MODES } from "@/lib/constants";
import { Save, Eye, ArrowLeft, Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import api from "@/config/axios";
import { API_CONTS } from "@/lib/api";
import { firebaseService } from "@/lib/firebaseService";
import { z } from "zod";

// Comprehensive schema based on the provided JSON
const formUpdateSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(300, "Title must not exceed 300 characters"),
  description: z.string().max(5000, "Description must not exceed 5000 characters").nullable().optional(),
  mode: z.nativeEnum(FormMode),
  status: z.nativeEnum(FormStatus),
  start_date: z.string().nullable().optional(), // Will be YYYY-MM-DDTHH:MM for input, then ISO string for API
  end_date: z.string().nullable().optional(), // Will be YYYY-MM-DDTHH:MM for input, then ISO string for API
  time_limit_minutes: z.number().min(0, "Time limit cannot be negative").nullable().optional(),
  max_attempts: z.number().min(1, "Max attempts must be at least 1").max(10, "Max attempts cannot exceed 10"),
  passing_marks: z.number().min(0, "Passing marks cannot be negative").max(100, "Passing marks cannot exceed 100").nullable().optional(),
  enable_negative_marking: z.boolean(),
  // Additional fields from successful creation result
  is_public: z.boolean().optional(),
  login_required: z.boolean().optional(),
  allow_anonymous: z.boolean().optional(),
  grace_minutes: z.number().min(0, "Grace minutes cannot be negative").optional(),
  cooldown_minutes: z.number().min(0, "Cooldown minutes cannot be negative").optional(),
  timer_starts_on: z.nativeEnum(TimerStartMode).optional(),
  auto_submit_on_close: z.boolean().optional(),
  allow_back_navigation: z.boolean().optional(),
  one_question_per_page: z.boolean().optional(),
  show_progress_bar: z.boolean().optional(),
  enable_review_page: z.boolean().optional(),
  shuffle_questions: z.boolean().optional(),
  shuffle_options_globally: z.boolean().optional(),
  round_score_to: z.number().optional(),
  show_result_immediately: z.boolean().optional(),
  show_correct_answers: z.boolean().optional(),
  show_explanations: z.boolean().optional(),
  show_score_breakup: z.boolean().optional(),
  auto_save_answers: z.boolean().optional(),
  save_interval_seconds: z.number().optional(),
  record_ip_address: z.boolean().optional(),
  detect_tab_switch: z.boolean().optional(),
  require_fullscreen: z.boolean().optional(),
  webcam_required: z.boolean().optional(),
  disable_copy_paste: z.boolean().optional()
});

type FormUpdateInput = z.infer<typeof formUpdateSchema>;

export default function FormEditPage() {
  const { id } = useParams();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formPublicId, setFormPublicId] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isDirty }
  } = useForm<FormUpdateInput>({
    resolver: zodResolver(formUpdateSchema),
    defaultValues: {
      title: "",
      description: null,
      mode: FormMode.QUIZ,
      status: FormStatus.DRAFT,
      start_date: null,
      end_date: null,
      time_limit_minutes: null,
      max_attempts: 1,
      passing_marks: null,
      enable_negative_marking: false,
      is_public: false,
      login_required: false,
      allow_anonymous: false,
      grace_minutes: 0,
      cooldown_minutes: 0,
      timer_starts_on: TimerStartMode.OPEN,
      auto_submit_on_close: false,
      allow_back_navigation: true,
      one_question_per_page: false,
      show_progress_bar: false,
      enable_review_page: false,
      shuffle_questions: false,
      shuffle_options_globally: false,
      round_score_to: 0,
      show_result_immediately: false,
      show_correct_answers: false,
      show_explanations: false,
      show_score_breakup: false,
      auto_save_answers: true,
      save_interval_seconds: 30,
      record_ip_address: false,
      detect_tab_switch: false,
      require_fullscreen: false,
      webcam_required: false,
      disable_copy_paste: false
    }
  });

  const fetchFormDetails = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = await firebaseService.getUserAccessToken();
      const response = await api.get(API_CONTS.FORMS.GET.replace(":id", id as string), {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = response.data;
      setFormPublicId(data.public_id);

      const formatDateForInput = (dateStr: string | null) => {
        if (!dateStr) return "";
        try {
          const date = new Date(dateStr);
          if (isNaN(date.getTime())) return "";
          return date.toISOString().slice(0, 16);
        } catch (e) {
          console.error("Error parsing date string:", dateStr, e);
          return "";
        }
      };

      reset({
        ...data,
        description: data.description || null,
        start_date: formatDateForInput(data.start_date),
        end_date: formatDateForInput(data.end_date),
        time_limit_minutes: data.time_limit_minutes === 0 ? null : data.time_limit_minutes,
        passing_marks: data.passing_marks === 0 ? null : data.passing_marks,
        max_attempts: data.max_attempts || 1,
        grace_minutes: data.grace_minutes || 0,
        cooldown_minutes: data.cooldown_minutes || 0,
        round_score_to: data.round_score_to || 0,
        save_interval_seconds: data.save_interval_seconds || 30,
      });
    } catch (err: any) {
      console.error("Error fetching form details:", err);
      setError("Failed to load form details. Please try again.");
      toast.error("Error loading form");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchFormDetails();
  }, [id]);

  const onSubmit = async (data: FormUpdateInput) => {
    setIsSaving(true);
    try {
      const token = await firebaseService.getUserAccessToken();
      const url = API_CONTS.FORMS.UPDATE.replace(":id", id as string);
      const updateUrl = url.endsWith('/') ? url : `${url}/`;

      const payload = {
        ...data,
        description: data.description || null,
        start_date: data.start_date ? new Date(data.start_date).toISOString() : null,
        end_date: data.end_date ? new Date(data.end_date).toISOString() : null,
        time_limit_minutes: data.time_limit_minutes === 0 ? null : data.time_limit_minutes,
        passing_marks: data.passing_marks === 0 ? null : data.passing_marks,
        max_attempts: Number(data.max_attempts),
        grace_minutes: Number(data.grace_minutes),
        cooldown_minutes: Number(data.cooldown_minutes),
        round_score_to: Number(data.round_score_to),
        save_interval_seconds: Number(data.save_interval_seconds),
      };

      await api.put(updateUrl, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success("Form updated successfully");
      router.push("/forms");
      reset(data);
    } catch (err: any) {
      console.error("Error updating form:", err);
      toast.error(err.response?.data?.detail || "Failed to save changes");
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublish = async () => {
    setValue("status", FormStatus.PUBLISHED, { shouldDirty: true });
    await handleSubmit(onSubmit)();
  };

  if (isLoading) {
    return (
      <div className="flex h-[400px] w-full flex-col items-center justify-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Loading form builder...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-[400px] w-full flex-col items-center justify-center gap-4 p-6 text-center">
        <AlertCircle className="h-12 w-12 text-destructive" />
        <div>
          <h3 className="text-lg font-semibold">Error Loading Form</h3>
          <p className="text-muted-foreground">{error}</p>
        </div>
        <Button onClick={() => router.push("/forms")} variant="outline">
          Back to Forms
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      {/* Header */}
      <div className="border-b bg-background px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href={`/forms/${id}`}>
              <Button variant="ghost" size="icon" disabled={isSaving}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold truncate max-w-[400px]">{watch("title")}</h1>
              <p className="text-sm text-muted-foreground">
                Editing form details and settings
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {formPublicId && (
              <Link href={`/take/${formPublicId}`} target="_blank">
                <Button variant="outline" size="sm" disabled={isSaving}>
                  <Eye className="mr-2 h-4 w-4" />
                  Preview
                </Button>
              </Link>
            )}
            {watch("status") === FormStatus.DRAFT && (
              <Button variant="outline" size="sm" onClick={handlePublish} disabled={isSaving}>
                Publish
              </Button>
            )}
            <Button size="sm" onClick={handleSubmit(onSubmit)} disabled={isSaving || !isDirty}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-5xl p-6">
          <form onSubmit={handleSubmit(onSubmit)}>
            <Tabs defaultValue="basic" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="questions">Questions</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
                <TabsTrigger value="preview">Preview</TabsTrigger>
              </TabsList>

              {/* Basic Info Tab */}
              <TabsContent value="basic" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Form Details</CardTitle>
                    <CardDescription>
                      Edit title, description and form mode
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Title *</Label>
                      <Input
                        id="title"
                        {...register("title")}
                        placeholder="Enter form title"
                        disabled={isSaving}
                      />
                      {errors.title && <p className="text-xs text-red-500">{errors.title.message}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        {...register("description")}
                        placeholder="Enter form description"
                        rows={4}
                        disabled={isSaving}
                      />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="mode">Form Type</Label>
                        <Select
                          value={watch("mode")}
                          onValueChange={(v) => setValue("mode", v as FormMode, { shouldDirty: true })}
                          disabled={isSaving}
                        >
                          <SelectTrigger id="mode">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {FORM_MODES.map((mode) => (
                              <SelectItem key={mode.value} value={mode.value}>
                                {mode.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="status">Status</Label>
                        <Select
                          value={watch("status")}
                          onValueChange={(v) => setValue("status", v as FormStatus, { shouldDirty: true })}
                          disabled={isSaving}
                        >
                          <SelectTrigger id="status">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {FORM_STATUSES.map((status) => (
                              <SelectItem key={status.value} value={status.value}>
                                {status.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Questions Tab */}
              <TabsContent value="questions">
                <QuestionBuilder
                  formId={Number(id)}
                  sections={[]}
                  questions={[]}
                />
              </TabsContent>

              {/* Settings Tab */}
              <TabsContent value="settings" className="space-y-6">
                <Accordion type="multiple" className="space-y-4">
                  <AccordionItem value="access" className="border rounded-lg px-4">
                    <AccordionTrigger className="hover:no-underline">
                      <span className="font-semibold">Access Control</span>
                    </AccordionTrigger>
                    <AccordionContent className="space-y-4 pt-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Public Form</Label>
                          <p className="text-sm text-muted-foreground">Anyone with the link can access</p>
                        </div>
                        <Switch
                          checked={watch("is_public")}
                          onCheckedChange={(v) => setValue("is_public", v, { shouldDirty: true })}
                          disabled={isSaving}
                        />
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Login Required</Label>
                          <p className="text-sm text-muted-foreground">Users must sign in to access</p>
                        </div>
                        <Switch
                          checked={watch("login_required")}
                          onCheckedChange={(v) => setValue("login_required", v, { shouldDirty: true })}
                          disabled={isSaving}
                        />
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Allow Anonymous</Label>
                          <p className="text-sm text-muted-foreground">Allow submissions without login</p>
                        </div>
                        <Switch
                          checked={watch("allow_anonymous")}
                          onCheckedChange={(v) => setValue("allow_anonymous", v, { shouldDirty: true })}
                          disabled={isSaving}
                        />
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="time" className="border rounded-lg px-4">
                    <AccordionTrigger className="hover:no-underline">
                      <span className="font-semibold">Time Management</span>
                    </AccordionTrigger>
                    <AccordionContent className="space-y-4 pt-4">
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label>Start Date & Time</Label>
                          <Input type="datetime-local" {...register("start_date")} disabled={isSaving} />
                        </div>
                        <div className="space-y-2">
                          <Label>End Date & Time</Label>
                          <Input type="datetime-local" {...register("end_date")} disabled={isSaving} />
                        </div>
                      </div>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label>Grace Period (minutes)</Label>
                          <Input type="number" {...register("grace_minutes", { valueAsNumber: true })} disabled={isSaving} />
                          {errors.grace_minutes && <p className="text-xs text-red-500">{errors.grace_minutes.message}</p>}
                        </div>
                        <div className="space-y-2">
                          <Label>Max Attempts</Label>
                          <Input type="number" {...register("max_attempts", { valueAsNumber: true })} disabled={isSaving} />
                          {errors.max_attempts && <p className="text-xs text-red-500">{errors.max_attempts.message}</p>}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Cooldown Period (minutes)</Label>
                        <Input type="number" {...register("cooldown_minutes", { valueAsNumber: true })} disabled={isSaving} />
                        {errors.cooldown_minutes && <p className="text-xs text-red-500">{errors.cooldown_minutes.message}</p>}
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="timer" className="border rounded-lg px-4">
                    <AccordionTrigger className="hover:no-underline">
                      <span className="font-semibold">Timer Configuration</span>
                    </AccordionTrigger>
                    <AccordionContent className="space-y-4 pt-4">
                      <div className="space-y-2">
                        <Label>Time Limit (minutes)</Label>
                        <Select
                          value={watch("time_limit_minutes")?.toString() || "none"}
                          onValueChange={(v) => setValue("time_limit_minutes", v === "none" ? null : Number(v), { shouldDirty: true })}
                          disabled={isSaving}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="No limit" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">No limit</SelectItem>
                            {TIME_LIMIT_PRESETS.map((preset) => (
                              <SelectItem key={preset.value} value={preset.value.toString()}>
                                {preset.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {errors.time_limit_minutes && <p className="text-xs text-red-500">{errors.time_limit_minutes.message}</p>}
                      </div>
                      <div className="space-y-2">
                        <Label>Timer Starts</Label>
                        <Select
                          value={watch("timer_starts_on")}
                          onValueChange={(v) => setValue("timer_starts_on", v as TimerStartMode, { shouldDirty: true })}
                          disabled={isSaving}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {TIMER_START_MODES.map((mode) => (
                              <SelectItem key={mode.value} value={mode.value}>
                                {mode.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-center justify-between pt-2">
                        <div className="space-y-0.5">
                          <Label>Auto-submit on Time Up</Label>
                          <p className="text-sm text-muted-foreground">Automatically submit when time expires</p>
                        </div>
                        <Switch
                          checked={watch("auto_submit_on_close")}
                          onCheckedChange={(v) => setValue("auto_submit_on_close", v, { shouldDirty: true })}
                          disabled={isSaving}
                        />
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="navigation" className="border rounded-lg px-4">
                    <AccordionTrigger className="hover:no-underline">
                      <span className="font-semibold">Navigation Options</span>
                    </AccordionTrigger>
                    <AccordionContent className="space-y-4 pt-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Allow Back Navigation</Label>
                          <p className="text-sm text-muted-foreground">Users can go back to previous questions</p>
                        </div>
                        <Switch
                          checked={watch("allow_back_navigation")}
                          onCheckedChange={(v) => setValue("allow_back_navigation", v, { shouldDirty: true })}
                          disabled={isSaving}
                        />
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>One Question Per Page</Label>
                          <p className="text-sm text-muted-foreground">Show questions one at a time</p>
                        </div>
                        <Switch
                          checked={watch("one_question_per_page")}
                          onCheckedChange={(v) => setValue("one_question_per_page", v, { shouldDirty: true })}
                          disabled={isSaving}
                        />
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Show Progress Bar</Label>
                          <p className="text-sm text-muted-foreground">Display completion progress</p>
                        </div>
                        <Switch
                          checked={watch("show_progress_bar")}
                          onCheckedChange={(v) => setValue("show_progress_bar", v, { shouldDirty: true })}
                          disabled={isSaving}
                        />
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Enable Review Page</Label>
                          <p className="text-sm text-muted-foreground">Allow review before submission</p>
                        </div>
                        <Switch
                          checked={watch("enable_review_page")}
                          onCheckedChange={(v) => setValue("enable_review_page", v, { shouldDirty: true })}
                          disabled={isSaving}
                        />
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Shuffle Questions</Label>
                          <p className="text-sm text-muted-foreground">Randomize the order of questions</p>
                        </div>
                        <Switch
                          checked={watch("shuffle_questions")}
                          onCheckedChange={(v) => setValue("shuffle_questions", v, { shouldDirty: true })}
                          disabled={isSaving}
                        />
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Shuffle Options Globally</Label>
                          <p className="text-sm text-muted-foreground">Randomize answer options for all questions</p>
                        </div>
                        <Switch
                          checked={watch("shuffle_options_globally")}
                          onCheckedChange={(v) => setValue("shuffle_options_globally", v, { shouldDirty: true })}
                          disabled={isSaving}
                        />
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  {watch("mode") === FormMode.QUIZ && (
                    <AccordionItem value="scoring" className="border rounded-lg px-4">
                      <AccordionTrigger className="hover:no-underline">
                        <span className="font-semibold">Scoring & Results</span>
                      </AccordionTrigger>
                      <AccordionContent className="space-y-4 pt-4">
                        <div className="space-y-2">
                          <Label>Passing Marks (%)</Label>
                          <Input
                            type="number"
                            {...register("passing_marks", { valueAsNumber: true })}
                            placeholder="40"
                            min="0"
                            max="100"
                            disabled={isSaving}
                          />
                          {errors.passing_marks && <p className="text-xs text-red-500">{errors.passing_marks.message}</p>}
                        </div>
                        <Separator />
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label>Enable Negative Marking</Label>
                            <p className="text-sm text-muted-foreground">Deduct marks for wrong answers</p>
                          </div>
                          <Switch
                            checked={watch("enable_negative_marking")}
                            onCheckedChange={(v) => setValue("enable_negative_marking", v, { shouldDirty: true })}
                            disabled={isSaving}
                          />
                        </div>
                        <Separator />
                        <div className="space-y-2">
                          <Label>Round Score To (decimal places)</Label>
                          <Input type="number" {...register("round_score_to", { valueAsNumber: true })} disabled={isSaving} />
                        </div>
                        <Separator />
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label>Show Result Immediately</Label>
                            <p className="text-sm text-muted-foreground">Display score after submission</p>
                          </div>
                          <Switch
                            checked={watch("show_result_immediately")}
                            onCheckedChange={(v) => setValue("show_result_immediately", v, { shouldDirty: true })}
                            disabled={isSaving}
                          />
                        </div>
                        <Separator />
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label>Show Correct Answers</Label>
                            <p className="text-sm text-muted-foreground">Reveal correct options to students</p>
                          </div>
                          <Switch
                            checked={watch("show_correct_answers")}
                            onCheckedChange={(v) => setValue("show_correct_answers", v, { shouldDirty: true })}
                            disabled={isSaving}
                          />
                        </div>
                        <Separator />
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label>Show Explanations</Label>
                            <p className="text-sm text-muted-foreground">Display explanations for answers</p>
                          </div>
                          <Switch
                            checked={watch("show_explanations")}
                            onCheckedChange={(v) => setValue("show_explanations", v, { shouldDirty: true })}
                            disabled={isSaving}
                          />
                        </div>
                        <Separator />
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label>Show Score Breakup</Label>
                            <p className="text-sm text-muted-foreground">Display detailed score per section/question</p>
                          </div>
                          <Switch
                            checked={watch("show_score_breakup")}
                            onCheckedChange={(v) => setValue("show_score_breakup", v, { shouldDirty: true })}
                            disabled={isSaving}
                          />
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  )}

                  <AccordionItem value="security" className="border rounded-lg px-4">
                    <AccordionTrigger className="hover:no-underline">
                      <span className="font-semibold">Security Features</span>
                    </AccordionTrigger>
                    <AccordionContent className="space-y-4 pt-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Detect Tab Switch</Label>
                          <p className="text-sm text-muted-foreground">Log when user switches tabs</p>
                        </div>
                        <Switch
                          checked={watch("detect_tab_switch")}
                          onCheckedChange={(v) => setValue("detect_tab_switch", v, { shouldDirty: true })}
                          disabled={isSaving}
                        />
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Require Fullscreen</Label>
                          <p className="text-sm text-muted-foreground">Force fullscreen mode</p>
                        </div>
                        <Switch
                          checked={watch("require_fullscreen")}
                          onCheckedChange={(v) => setValue("require_fullscreen", v, { shouldDirty: true })}
                          disabled={isSaving}
                        />
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Disable Copy/Paste</Label>
                          <p className="text-sm text-muted-foreground">Prevent copying question text</p>
                        </div>
                        <Switch
                          checked={watch("disable_copy_paste")}
                          onCheckedChange={(v) => setValue("disable_copy_paste", v, { shouldDirty: true })}
                          disabled={isSaving}
                        />
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Webcam Required</Label>
                          <p className="text-sm text-muted-foreground">Require webcam access during the form</p>
                        </div>
                        <Switch
                          checked={watch("webcam_required")}
                          onCheckedChange={(v) => setValue("webcam_required", v, { shouldDirty: true })}
                          disabled={isSaving}
                        />
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Record IP Address</Label>
                          <p className="text-sm text-muted-foreground">Store the user's IP address on submission</p>
                        </div>
                        <Switch
                          checked={watch("record_ip_address")}
                          onCheckedChange={(v) => setValue("record_ip_address", v, { shouldDirty: true })}
                          disabled={isSaving}
                        />
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Auto-save Answers</Label>
                          <p className="text-sm text-muted-foreground">Automatically save user's progress</p>
                        </div>
                        <Switch
                          checked={watch("auto_save_answers")}
                          onCheckedChange={(v) => setValue("auto_save_answers", v, { shouldDirty: true })}
                          disabled={isSaving}
                        />
                      </div>
                      {watch("auto_save_answers") && (
                        <div className="space-y-2">
                          <Label>Auto-save Interval (seconds)</Label>
                          <Input type="number" {...register("save_interval_seconds", { valueAsNumber: true })} disabled={isSaving} />
                        </div>
                      )}
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </TabsContent>

              {/* Preview Tab (Mock) */}
              <TabsContent value="preview">
                <Card>
                  <CardHeader>
                    <CardTitle>Form Preview</CardTitle>
                    <CardDescription>How the form appears to students</CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                    <p className="text-muted-foreground mb-4">Live preview integration coming soon.</p>
                    {formPublicId && (
                      <Link href={`/take/${formPublicId}`} target="_blank">
                        <Button variant="outline">
                          <Eye className="mr-2 h-4 w-4" />
                          Open Public Preview
                        </Button>
                      </Link>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </form>
        </div>
      </div>
    </div>
  );
}
