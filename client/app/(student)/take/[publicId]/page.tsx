// Student Form Taking Page

"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Timer } from "@/components/forms/timer";
import { getFormByPublicId, getQuestionsByFormId } from "@/lib/mock-data";
import { QuestionType, FormMode } from "@/types";
import { calculateProgress, formatTime } from "@/lib/form-utils";
import { Clock, ChevronLeft, ChevronRight, Send, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export default function TakeFormPage() {
  const params = useParams();
  const publicId = params.publicId as string;
  
  const form = getFormByPublicId(publicId);
  const questions = form ? getQuestionsByFormId(form.id) : [];

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, any>>({});
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);

  useEffect(() => {
    if (form?.time_limit_minutes) {
      setTimeRemaining(form.time_limit_minutes * 60);
    }
  }, [form]);

  if (!form) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Form Not Found</CardTitle>
            <CardDescription>
              The form you're looking for doesn't exist or has been removed.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (isSubmitted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-green-50 via-white to-blue-50 p-4">
        <Card className="max-w-lg">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <CheckCircle2 className="h-10 w-10 text-green-600" />
            </div>
            <CardTitle className="text-2xl">Form Submitted Successfully!</CardTitle>
            <CardDescription>
              Thank you for completing this {form.mode === FormMode.QUIZ ? "quiz" : "form"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {form.mode === FormMode.QUIZ && form.show_result_immediately && (
              <div className="rounded-lg border bg-muted/50 p-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">87.5%</div>
                  <p className="text-sm text-muted-foreground mt-1">Your Score</p>
                  <Separator className="my-3" />
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="font-semibold">3/4</div>
                      <div className="text-muted-foreground">Correct</div>
                    </div>
                    <div>
                      <div className="font-semibold">1/4</div>
                      <div className="text-muted-foreground">Incorrect</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <Button className="w-full" onClick={() => window.location.href = "/login"}>
              View Detailed Results
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progress = calculateProgress(questions.length, Object.keys(answers).length);

  const handleAnswerChange = (questionId: number, value: any) => {
    setAnswers({
      ...answers,
      [questionId]: value
    });
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0 && form.allow_back_navigation) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmit = () => {
    const unansweredRequired = questions
      .filter(q => q.is_required && !answers[q.id])
      .length;
    
    if (unansweredRequired > 0) {
      toast.error(`Please answer all required questions (${unansweredRequired} remaining)`);
      return;
    }

    setShowSubmitDialog(true);
  };

  const confirmSubmit = () => {
    setShowSubmitDialog(false);
    toast.success("Submitting your responses...");
    setTimeout(() => {
      setIsSubmitted(true);
    }, 1500);
  };

  const handleTimeUp = () => {
    toast.error("Time's up! Your form is being submitted automatically.");
    setTimeout(() => {
      setIsSubmitted(true);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-lg font-semibold">{form.title}</h1>
              {form.mode === FormMode.QUIZ && (
                <p className="text-xs text-muted-foreground">
                  Question {currentQuestionIndex + 1} of {questions.length}
                </p>
              )}
            </div>
          </div>

          {timeRemaining !== null && (
            <Timer
              totalSeconds={timeRemaining}
              onTimeUp={handleTimeUp}
              warningThreshold={300}
            />
          )}
        </div>
      </header>

      {/* Progress Bar */}
      {form.show_progress_bar && (
        <div className="border-b bg-muted/30 px-4 py-2">
          <div className="container">
            <div className="flex items-center gap-3">
              <Progress value={progress} className="flex-1" />
              <span className="text-sm font-medium text-muted-foreground">
                {progress}%
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <main className="container max-w-3xl py-8 px-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-start gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                {currentQuestionIndex + 1}
              </span>
              <div className="flex-1">
                {currentQuestion.snapshot?.question_text}
                {currentQuestion.is_required && (
                  <span className="ml-1 text-red-500">*</span>
                )}
              </div>
            </CardTitle>
            {currentQuestion.marks > 0 && (
              <CardDescription>
                {currentQuestion.marks} {currentQuestion.marks === 1 ? "mark" : "marks"}
                {currentQuestion.negative_marks > 0 && (
                  <span className="text-orange-600">
                    {" "}• -{currentQuestion.negative_marks} for wrong answer
                  </span>
                )}
              </CardDescription>
            )}
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Answer Input */}
            {currentQuestion.snapshot?.question_type === QuestionType.MCQ_SINGLE && (
              <RadioGroup
                value={answers[currentQuestion.id]}
                onValueChange={(value) => handleAnswerChange(currentQuestion.id, value)}
              >
                <div className="space-y-3">
                  {currentQuestion.snapshot.options_snapshot?.map((option) => (
                    <div
                      key={option.id}
                      className="flex items-center space-x-3 rounded-lg border p-4 hover:bg-muted/50 cursor-pointer"
                    >
                      <RadioGroupItem value={option.id} id={option.id} />
                      <Label htmlFor={option.id} className="flex-1 cursor-pointer">
                        {option.text}
                      </Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            )}

            {currentQuestion.snapshot?.question_type === QuestionType.MCQ_MULTIPLE && (
              <div className="space-y-3">
                {currentQuestion.snapshot.options_snapshot?.map((option) => (
                  <div
                    key={option.id}
                    className="flex items-center space-x-3 rounded-lg border p-4 hover:bg-muted/50"
                  >
                    <Checkbox
                      id={option.id}
                      checked={answers[currentQuestion.id]?.includes(option.id)}
                      onCheckedChange={(checked) => {
                        const current = answers[currentQuestion.id] || [];
                        const updated = checked
                          ? [...current, option.id]
                          : current.filter((id: string) => id !== option.id);
                        handleAnswerChange(currentQuestion.id, updated);
                      }}
                    />
                    <Label htmlFor={option.id} className="flex-1 cursor-pointer">
                      {option.text}
                    </Label>
                  </div>
                ))}
              </div>
            )}

            {currentQuestion.snapshot?.question_type === QuestionType.TEXT_SHORT && (
              <Input
                value={answers[currentQuestion.id] || ""}
                onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                placeholder="Enter your answer"
                className="text-base"
              />
            )}

            {currentQuestion.snapshot?.question_type === QuestionType.TEXT_LONG && (
              <Textarea
                value={answers[currentQuestion.id] || ""}
                onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                placeholder="Enter your answer"
                rows={6}
                className="text-base"
              />
            )}

            {currentQuestion.snapshot?.hint && (
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-900">
                <span className="font-medium">Hint:</span> {currentQuestion.snapshot.hint}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="mt-6 flex gap-3">
          {form.allow_back_navigation && currentQuestionIndex > 0 && (
            <Button variant="outline" onClick={handlePrevious}>
              <ChevronLeft className="mr-2 h-4 w-4" />
              Previous
            </Button>
          )}

          <div className="flex-1" />

          {currentQuestionIndex < questions.length - 1 ? (
            <Button onClick={handleNext}>
              Next
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} className="bg-green-600 hover:bg-green-700">
              <Send className="mr-2 h-4 w-4" />
              Submit Form
            </Button>
          )}
        </div>
      </main>

      {/* Submit Confirmation Dialog */}
      <AlertDialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Submit Form?</AlertDialogTitle>
            <AlertDialogDescription>
              You have answered {Object.keys(answers).length} of {questions.length} questions.
              {form.mode === FormMode.QUIZ && " Once submitted, you cannot change your answers."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Review Answers</AlertDialogCancel>
            <AlertDialogAction onClick={confirmSubmit}>
              Submit
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
