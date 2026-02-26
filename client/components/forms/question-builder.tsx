// Question Builder Component with Collapsible Sections

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { QuestionTypeIcon, getQuestionTypeLabel } from "@/components/forms/question-type-icon";
import { EmptyState } from "@/components/ui/empty-state";
import { FormSection, FormQuestion } from "@/types";
import { QUESTION_TYPES } from "@/lib/constants";
import { 
  Plus, 
  GripVertical, 
  Trash2, 
  ChevronDown,
  Edit2,
  FileQuestion
} from "lucide-react";
import { QuestionType } from "@/types";
import { toast } from "sonner";

interface QuestionBuilderProps {
  formId: number;
  sections: FormSection[];
  questions: FormQuestion[];
}

export function QuestionBuilder({ formId, sections: initialSections, questions: initialQuestions }: QuestionBuilderProps) {
  const [sections, setSections] = useState(initialSections);
  const [questions, setQuestions] = useState(initialQuestions);
  const [expandedSections, setExpandedSections] = useState<string[]>(["section-0"]);
  const [expandedQuestions, setExpandedQuestions] = useState<string[]>([]);

  const addSection = () => {
    const newSection: FormSection = {
      id: Date.now(),
      form: formId,
      title: `Section ${sections.length + 1}`,
      description: "",
      order: sections.length + 1,
      institute_id: 1,
      university_id: 1,
      created_dt: new Date().toISOString(),
      updated_dt: new Date().toISOString(),
      created_by: 1,
      updated_by: 1,
      created_by_username: "admin",
      updated_by_username: "admin"
    };
    setSections([...sections, newSection]);
    setExpandedSections([...expandedSections, `section-${newSection.id}`]);
    toast.success("Section added");
  };

  const deleteSection = (sectionId: number) => {
    setSections(sections.filter(s => s.id !== sectionId));
    // Also delete questions in this section
    setQuestions(questions.filter(q => q.section !== sectionId));
    toast.success("Section deleted");
  };

  const addQuestion = (sectionId: number | null) => {
    const newQuestion: Partial<FormQuestion> = {
      id: Date.now(),
      form: formId,
      section: sectionId,
      question_id: Date.now(),
      order: questions.filter(q => q.section === sectionId).length + 1,
      is_required: true,
      marks: 1,
      negative_marks: 0,
      consider_for_analytics: false,
      snapshot: {
        id: Date.now(),
        form_question: Date.now(),
        question_text: "Enter your question here",
        question_type: QuestionType.MCQ_SINGLE,
        options_snapshot: [
          { id: "opt_1", text: "Option 1", is_correct: false, order: 1 },
          { id: "opt_2", text: "Option 2", is_correct: false, order: 2 }
        ],
        institute_id: 1,
        university_id: 1,
        created_dt: new Date().toISOString(),
        updated_dt: new Date().toISOString(),
        created_by: 1,
        updated_by: 1
      }
    };
    setQuestions([...questions, newQuestion as FormQuestion]);
    setExpandedQuestions([...expandedQuestions, `question-${newQuestion.id}`]);
    toast.success("Question added");
  };

  const deleteQuestion = (questionId: number) => {
    setQuestions(questions.filter(q => q.id !== questionId));
    toast.success("Question deleted");
  };

  const updateQuestionOption = (questionId: number, optionId: string, text: string) => {
    setQuestions(questions.map(q => {
      if (q.id === questionId && q.snapshot?.options_snapshot) {
        return {
          ...q,
          snapshot: {
            ...q.snapshot,
            options_snapshot: q.snapshot.options_snapshot.map(opt =>
              opt.id === optionId ? { ...opt, text } : opt
            )
          }
        };
      }
      return q;
    }));
  };

  const addOption = (questionId: number) => {
    setQuestions(questions.map(q => {
      if (q.id === questionId && q.snapshot?.options_snapshot) {
        const newOptionId = `opt_${q.snapshot.options_snapshot.length + 1}`;
        return {
          ...q,
          snapshot: {
            ...q.snapshot,
            options_snapshot: [
              ...q.snapshot.options_snapshot,
              {
                id: newOptionId,
                text: `Option ${q.snapshot.options_snapshot.length + 1}`,
                is_correct: false,
                order: q.snapshot.options_snapshot.length + 1
              }
            ]
          }
        };
      }
      return q;
    }));
  };

  const toggleCorrectAnswer = (questionId: number, optionId: string, isSingle: boolean) => {
    setQuestions(questions.map(q => {
      if (q.id === questionId && q.snapshot?.options_snapshot) {
        return {
          ...q,
          snapshot: {
            ...q.snapshot,
            options_snapshot: q.snapshot.options_snapshot.map(opt => {
              if (isSingle) {
                // For single choice, only one can be correct
                return { ...opt, is_correct: opt.id === optionId };
              } else {
                // For multiple choice, toggle the clicked option
                return opt.id === optionId ? { ...opt, is_correct: !opt.is_correct } : opt;
              }
            })
          }
        };
      }
      return q;
    }));
  };

  if (sections.length === 0 && questions.length === 0) {
    return (
      <Card className="p-6">
        <EmptyState
          icon={FileQuestion}
          title="No questions yet"
          description="Start building your form by adding sections and questions"
          action={{
            label: "Add First Section",
            onClick: addSection
          }}
        />
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Questions & Sections</h3>
        <Button onClick={addSection}>
          <Plus className="mr-2 h-4 w-4" />
          Add Section
        </Button>
      </div>

      {/* Sections as Collapsible Accordions */}
      <Accordion type="multiple" value={expandedSections} onValueChange={setExpandedSections}>
        {sections.map((section) => {
          const sectionQuestions = questions.filter(q => q.section === section.id);
          
          return (
            <AccordionItem
              key={section.id}
              value={`section-${section.id}`}
              className="border rounded-lg mb-4"
            >
              <div className="bg-muted/50">
                <div className="flex items-center gap-2 px-4">
                  <GripVertical className="h-5 w-5 text-muted-foreground cursor-move" />
                  <AccordionTrigger className="flex-1 hover:no-underline py-4">
                    <div className="flex items-center gap-3 text-left">
                      <div>
                        <div className="font-semibold">{section.title}</div>
                        <div className="text-sm text-muted-foreground mt-0.5">
                          {sectionQuestions.length} question{sectionQuestions.length !== 1 ? 's' : ''}
                        </div>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteSection(section.id);
                    }}
                  >
                    <Trash2 className="h-4 w-4 text-muted-foreground hover:text-red-500" />
                  </Button>
                </div>
              </div>

              <AccordionContent className="px-4 pb-4 pt-2">
                {/* Section Edit Fields */}
                <div className="space-y-3 mb-4 bg-muted/30 p-4 rounded-lg">
                  <div className="space-y-2">
                    <Label>Section Title</Label>
                    <Input
                      value={section.title}
                      onChange={(e) => {
                        setSections(sections.map(s =>
                          s.id === section.id ? { ...s, title: e.target.value } : s
                        ));
                      }}
                      placeholder="e.g., Part A - General Questions"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Description (Optional)</Label>
                    <Textarea
                      value={section.description}
                      onChange={(e) => {
                        setSections(sections.map(s =>
                          s.id === section.id ? { ...s, description: e.target.value } : s
                        ));
                      }}
                      placeholder="Instructions for this section"
                      rows={2}
                    />
                  </div>
                </div>

                <Separator className="my-4" />

                {/* Questions in this section */}
                <div className="space-y-3">
                  {sectionQuestions.length === 0 ? (
                    <div className="text-center py-6 text-sm text-muted-foreground">
                      No questions in this section
                    </div>
                  ) : (
                    <Accordion type="multiple" value={expandedQuestions} onValueChange={setExpandedQuestions}>
                      {sectionQuestions.map((question, idx) => (
                        <AccordionItem
                          key={question.id}
                          value={`question-${question.id}`}
                          className="border rounded-lg mb-2"
                        >
                          <div className="flex items-center gap-2 px-3 bg-background">
                            <GripVertical className="h-4 w-4 text-muted-foreground cursor-move" />
                            <AccordionTrigger className="flex-1 hover:no-underline py-3">
                              <div className="flex items-center gap-3 text-left">
                                <div className="flex h-6 w-6 items-center justify-center rounded bg-primary/10 text-xs font-semibold text-primary">
                                  {idx + 1}
                                </div>
                                {question.snapshot && (
                                  <QuestionTypeIcon type={question.snapshot.question_type} />
                                )}
                                <div className="text-sm line-clamp-1">
                                  {question.snapshot?.question_text || "New Question"}
                                </div>
                              </div>
                            </AccordionTrigger>
                            <div className="flex items-center gap-1">
                              <span className="text-xs text-muted-foreground">
                                {question.marks} {question.marks === 1 ? 'mark' : 'marks'}
                              </span>
                              {question.is_required && (
                                <span className="text-xs text-red-500">*</span>
                              )}
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteQuestion(question.id);
                                }}
                              >
                                <Trash2 className="h-4 w-4 text-muted-foreground hover:text-red-500" />
                              </Button>
                            </div>
                          </div>

                          <AccordionContent className="px-3 pb-3">
                            {question.snapshot && (
                              <div className="space-y-4 pt-2">
                                {/* Question Text */}
                                <div className="space-y-2">
                                  <Label>Question Text</Label>
                                  <Textarea
                                    value={question.snapshot.question_text}
                                    placeholder="Enter your question"
                                    rows={3}
                                  />
                                </div>

                                {/* Question Type & Settings */}
                                <div className="grid gap-4 sm:grid-cols-3">
                                  <div className="space-y-2">
                                    <Label>Type</Label>
                                    <Select defaultValue={question.snapshot.question_type}>
                                      <SelectTrigger>
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {QUESTION_TYPES.map((type) => (
                                          <SelectItem key={type.value} value={type.value}>
                                            {type.label}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <div className="space-y-2">
                                    <Label>Marks</Label>
                                    <Input
                                      type="number"
                                      defaultValue={question.marks}
                                      min="0"
                                      step="0.5"
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label>Negative Marks</Label>
                                    <Input
                                      type="number"
                                      defaultValue={question.negative_marks}
                                      min="0"
                                      step="0.25"
                                    />
                                  </div>
                                </div>

                                {/* MCQ Options */}
                                {(question.snapshot.question_type === QuestionType.MCQ_SINGLE ||
                                  question.snapshot.question_type === QuestionType.MCQ_MULTIPLE) &&
                                  question.snapshot.options_snapshot && (
                                    <div className="space-y-2">
                                      <Label>Options</Label>
                                      <div className="space-y-2">
                                        {question.snapshot.options_snapshot.map((option) => (
                                          <div key={option.id} className="flex items-center gap-2">
                                            {question.snapshot!.question_type === QuestionType.MCQ_SINGLE ? (
                                              <RadioGroupItem
                                                value={option.id}
                                                checked={option.is_correct}
                                                onClick={() => toggleCorrectAnswer(question.id, option.id, true)}
                                              />
                                            ) : (
                                              <Checkbox
                                                checked={option.is_correct}
                                                onCheckedChange={() => toggleCorrectAnswer(question.id, option.id, false)}
                                              />
                                            )}
                                            <Input
                                              value={option.text}
                                              onChange={(e) => updateQuestionOption(question.id, option.id, e.target.value)}
                                              placeholder={`Option ${option.order}`}
                                              className="flex-1"
                                            />
                                            {option.is_correct && (
                                              <span className="text-xs text-green-600 font-medium">
                                                Correct
                                              </span>
                                            )}
                                          </div>
                                        ))}
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() => addOption(question.id)}
                                          className="w-full"
                                        >
                                          <Plus className="mr-2 h-3 w-3" />
                                          Add Option
                                        </Button>
                                      </div>
                                    </div>
                                  )}

                                {/* Additional Settings */}
                                <div className="flex items-center gap-4 pt-2">
                                  <div className="flex items-center space-x-2">
                                    <Switch
                                      id={`required-${question.id}`}
                                      defaultChecked={question.is_required}
                                    />
                                    <Label htmlFor={`required-${question.id}`} className="text-sm">
                                      Required
                                    </Label>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <Switch
                                      id={`analytics-${question.id}`}
                                      defaultChecked={question.consider_for_analytics}
                                    />
                                    <Label htmlFor={`analytics-${question.id}`} className="text-sm">
                                      Track Analytics
                                    </Label>
                                  </div>
                                </div>
                              </div>
                            )}
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  )}

                  <Button
                    variant="outline"
                    onClick={() => addQuestion(section.id)}
                    className="w-full"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Question to This Section
                  </Button>
                </div>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>

      {/* Questions without section */}
      {questions.filter(q => q.section === null).length > 0 && (
        <Card className="p-4">
          <h4 className="font-medium mb-3">Questions Without Section</h4>
          <div className="space-y-2">
            {questions.filter(q => q.section === null).map((question) => (
              <div key={question.id} className="flex items-center gap-2 p-2 border rounded">
                <GripVertical className="h-4 w-4 text-muted-foreground" />
                <span className="flex-1 text-sm">{question.snapshot?.question_text}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => deleteQuestion(question.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
