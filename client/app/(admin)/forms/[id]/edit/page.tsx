// Form Edit/Builder Page

"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { QuestionBuilder } from "@/components/forms/question-builder";
import { mockForms, getSectionsByFormId, getQuestionsByFormId } from "@/lib/mock-data";
import { FormMode, FormStatus } from "@/types";
import { FORM_MODES, FORM_STATUSES, TIME_LIMIT_PRESETS, TIMER_START_MODES } from "@/lib/constants";
import { Save, Eye, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

export default function FormEditPage() {
  const params = useParams();
  const formId = parseInt(params.id as string);
  
  const form = mockForms.find(f => f.id === formId);
  const sections = getSectionsByFormId(formId);
  const questions = getQuestionsByFormId(formId);

  const [formData, setFormData] = useState(form || {});
  const [isSaving, setIsSaving] = useState(false);

  if (!form) {
    return <div className="p-6">Form not found</div>;
  }

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      toast.success("Form saved successfully");
      setIsSaving(false);
    }, 1000);
  };

  const handlePublish = () => {
    setFormData({ ...formData, status: FormStatus.PUBLISHED });
    toast.success("Form published successfully");
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      {/* Header */}
      <div className="border-b bg-background px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/forms">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold">{form.title}</h1>
              <p className="text-sm text-muted-foreground">
                Editing form
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link href={`/take/${form.public_id}`} target="_blank">
              <Button variant="outline" size="sm">
                <Eye className="mr-2 h-4 w-4" />
                Preview
              </Button>
            </Link>
            {form.status === FormStatus.DRAFT && (
              <Button variant="default" size="sm" onClick={handlePublish}>
                Publish
              </Button>
            )}
            <Button size="sm" onClick={handleSave} disabled={isSaving}>
              {isSaving ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-5xl p-6">
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
                    Basic information about your form
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title *</Label>
                    <Input
                      id="title"
                      defaultValue={form.title}
                      placeholder="Enter form title"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      defaultValue={form.description}
                      placeholder="Enter form description"
                      rows={4}
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="mode">Form Type</Label>
                      <Select defaultValue={form.mode}>
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
                      <Select defaultValue={form.status}>
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
                formId={formId}
                sections={sections}
                questions={questions}
              />
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings" className="space-y-6">
              <Accordion type="multiple" className="space-y-4">
                {/* Access Control */}
                <AccordionItem value="access" className="border rounded-lg px-4">
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">Access Control</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-4 pt-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Public Form</Label>
                        <p className="text-sm text-muted-foreground">
                          Anyone with the link can access
                        </p>
                      </div>
                      <Switch defaultChecked={form.is_public} />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Login Required</Label>
                        <p className="text-sm text-muted-foreground">
                          Users must sign in to access
                        </p>
                      </div>
                      <Switch defaultChecked={form.login_required} />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Allow Anonymous</Label>
                        <p className="text-sm text-muted-foreground">
                          Allow submissions without login
                        </p>
                      </div>
                      <Switch defaultChecked={form.allow_anonymous} />
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* Time Management */}
                <AccordionItem value="time" className="border rounded-lg px-4">
                  <AccordionTrigger className="hover:no-underline">
                    <span className="font-semibold">Time Management</span>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-4 pt-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Start Date & Time</Label>
                        <Input type="datetime-local" />
                      </div>
                      <div className="space-y-2">
                        <Label>End Date & Time</Label>
                        <Input type="datetime-local" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Grace Period (minutes)</Label>
                      <Input
                        type="number"
                        defaultValue={form.grace_minutes}
                        placeholder="0"
                      />
                      <p className="text-sm text-muted-foreground">
                        Extra time allowed after end date
                      </p>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* Timer Configuration */}
                <AccordionItem value="timer" className="border rounded-lg px-4">
                  <AccordionTrigger className="hover:no-underline">
                    <span className="font-semibold">Timer Configuration</span>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <Label>Time Limit</Label>
                      <Select defaultValue={form.time_limit_minutes?.toString()}>
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
                    </div>
                    <div className="space-y-2">
                      <Label>Timer Starts</Label>
                      <Select defaultValue={form.timer_starts_on}>
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
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Auto-submit on Time Up</Label>
                        <p className="text-sm text-muted-foreground">
                          Automatically submit when time expires
                        </p>
                      </div>
                      <Switch defaultChecked={form.auto_submit_on_close} />
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* Navigation Options */}
                <AccordionItem value="navigation" className="border rounded-lg px-4">
                  <AccordionTrigger className="hover:no-underline">
                    <span className="font-semibold">Navigation Options</span>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-4 pt-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Allow Back Navigation</Label>
                        <p className="text-sm text-muted-foreground">
                          Users can go back to previous questions
                        </p>
                      </div>
                      <Switch defaultChecked={form.allow_back_navigation} />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>One Question Per Page</Label>
                        <p className="text-sm text-muted-foreground">
                          Show questions one at a time
                        </p>
                      </div>
                      <Switch defaultChecked={form.one_question_per_page} />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Show Progress Bar</Label>
                        <p className="text-sm text-muted-foreground">
                          Display completion progress
                        </p>
                      </div>
                      <Switch defaultChecked={form.show_progress_bar} />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Enable Review Page</Label>
                        <p className="text-sm text-muted-foreground">
                          Allow review before submission
                        </p>
                      </div>
                      <Switch defaultChecked={form.enable_review_page} />
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* Scoring & Results */}
                {form.mode === FormMode.QUIZ && (
                  <AccordionItem value="scoring" className="border rounded-lg px-4">
                    <AccordionTrigger className="hover:no-underline">
                      <span className="font-semibold">Scoring & Results</span>
                    </AccordionTrigger>
                    <AccordionContent className="space-y-4 pt-4">
                      <div className="space-y-2">
                        <Label>Passing Marks (%)</Label>
                        <Input
                          type="number"
                          defaultValue={form.passing_marks || 0}
                          placeholder="40"
                          min="0"
                          max="100"
                        />
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Enable Negative Marking</Label>
                          <p className="text-sm text-muted-foreground">
                            Deduct marks for wrong answers
                          </p>
                        </div>
                        <Switch defaultChecked={form.enable_negative_marking} />
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Show Result Immediately</Label>
                          <p className="text-sm text-muted-foreground">
                            Display score after submission
                          </p>
                        </div>
                        <Switch defaultChecked={form.show_result_immediately} />
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Show Correct Answers</Label>
                          <p className="text-sm text-muted-foreground">
                            Reveal correct options to students
                          </p>
                        </div>
                        <Switch defaultChecked={form.show_correct_answers} />
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                )}

                {/* Security Features */}
                <AccordionItem value="security" className="border rounded-lg px-4">
                  <AccordionTrigger className="hover:no-underline">
                    <span className="font-semibold">Security Features</span>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-4 pt-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Detect Tab Switch</Label>
                        <p className="text-sm text-muted-foreground">
                          Log when user switches tabs
                        </p>
                      </div>
                      <Switch defaultChecked={form.detect_tab_switch} />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Require Fullscreen</Label>
                        <p className="text-sm text-muted-foreground">
                          Force fullscreen mode
                        </p>
                      </div>
                      <Switch defaultChecked={form.require_fullscreen} />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Disable Copy/Paste</Label>
                        <p className="text-sm text-muted-foreground">
                          Prevent copying question text
                        </p>
                      </div>
                      <Switch defaultChecked={form.disable_copy_paste} />
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </TabsContent>

            {/* Preview Tab */}
            <TabsContent value="preview">
              <Card>
                <CardHeader>
                  <CardTitle>Form Preview</CardTitle>
                  <CardDescription>
                    This is how your form will appear to students
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">
                      Preview feature coming soon
                    </p>
                    <Link href={`/take/${form.public_id}`} target="_blank">
                      <Button className="mt-4" variant="outline">
                        <Eye className="mr-2 h-4 w-4" />
                        Open in New Tab
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
