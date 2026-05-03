import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { Loader2, Plus, GripVertical, Trash, Save } from 'lucide-react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useSurveyStore, Survey } from '@/stores/surveyStore';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';

const questionSchema = z.object({
  type: z.enum(["text", "radio", "checkbox", "scale"]),
  prompt: z.string().min(1, "Question prompt is required"),
  required: z.boolean().default(true),
  options: z.array(z.string()).optional(), // For radio/checkbox
});

const surveySchema = z.object({
  title: z.string().min(3, "Title too short"),
  description: z.string().optional(),
  category: z.string().min(1, "Category is required"),
  reward: z.coerce.number().min(0, "Reward must be >= 0"),
  targetLimit: z.coerce.number().optional().nullable(),
  isActive: z.boolean().default(true),
  questions: z.array(questionSchema).min(1, "At least one question is required"),
});

type SurveyFormValues = z.infer<typeof surveySchema>;

export default function CreateSurveyPage() {
  const navigate = useNavigate();
  const { surveyId } = useParams();
  const { addSurvey, updateSurvey, surveys } = useSurveyStore();
  const [isLoading, setIsLoading] = useState(false);
  const isEdit = !!surveyId;

  const { register, control, handleSubmit, watch, reset, formState: { errors } } = useForm<SurveyFormValues>({
    // @ts-ignore zodResolver typing mismatch
    resolver: zodResolver(surveySchema),
    defaultValues: {
      title: "",
      description: "",
      category: "General",
      reward: 100,
      targetLimit: null,
      isActive: true,
      questions: [
        { type: "text", prompt: "", required: true, options: [] }
      ]
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "questions"
  });

  useEffect(() => {
    if (isEdit) {
      const existing = surveys.find(s => s.id === surveyId);
      if (existing) {
        reset({
          title: existing.title,
          description: existing.description,
          category: existing.category,
          reward: existing.reward,
          targetLimit: existing.targetLimit,
          isActive: existing.status === 'active',
          questions: existing.questions
        });
      } else {
        toast.error("Survey not found");
        navigate("/surveys");
      }
    }
  }, [isEdit, surveyId, surveys, reset, navigate]);

  const onSubmit = async (data: SurveyFormValues) => {
    setIsLoading(true);
    try {
      const payload = {
        title: data.title,
        description: data.description,
        category: data.category,
        reward: data.reward,
        targetLimit: data.targetLimit || null,
        status: (data.isActive ? 'active' : 'draft') as 'active' | 'draft',
        questions: data.questions
      };

      if (isEdit) {
        updateSurvey(surveyId!, payload);
        toast.success("Survey updated successfully");
      } else {
        addSurvey(payload);
        toast.success("Survey created successfully");
      }
      navigate("/surveys");
    } catch (e: any) {
      toast.error(isEdit ? "Failed to update survey" : "Failed to create survey");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{isEdit ? 'Edit Survey' : 'Create Survey'}</h2>
          <p className="text-muted-foreground">{isEdit ? 'Modify the survey parameters and questions.' : 'Build a new survey to gather user data.'}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Basic Settings</CardTitle>
            <CardDescription>Reward limits and survey metadata.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Survey Title</Label>
              <Input placeholder="e.g. Q2 Consumer Habits" {...register("title")} />
              {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea placeholder="Explain what this survey is about..." {...register("description")} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Category</Label>
                <Controller
                  control={control}
                  name="category"
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="General">General</SelectItem>
                        <SelectItem value="Tech">Tech</SelectItem>
                        <SelectItem value="Health">Health</SelectItem>
                        <SelectItem value="Finance">Finance</SelectItem>
                        <SelectItem value="Food">Food</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
              <div className="space-y-2">
                <Label>Reward per Completion (Berry)</Label>
                <Input type="number" {...register("reward")} />
                {errors.reward && <p className="text-sm text-destructive">{errors.reward.message}</p>}
              </div>
              <div className="space-y-2">
                <Label>Target Response Limit (Optional)</Label>
                <Input type="number" placeholder="Leave empty for unlimited" {...register("targetLimit")} />
              </div>
              <div className="space-y-2 flex flex-col justify-end pb-2">
                <div className="flex items-center justify-between p-3 border rounded-md">
                  <Label>Publish Immediately</Label>
                  <Controller
                    control={control}
                    name="isActive"
                    render={({ field }) => (
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    )}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
            <div>
              <CardTitle>Questions Builder</CardTitle>
              <CardDescription>Add and arrange questions for the users.</CardDescription>
            </div>
            <Button 
              type="button" 
              variant="outline" 
              size="sm" 
              onClick={() => append({ type: "text", prompt: "", required: true, options: [] })}
            >
              <Plus className="w-4 h-4 mr-2" /> Add Question
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            {errors.questions?.root && (
              <div className="p-4 bg-destructive/10 text-destructive text-sm font-medium">
                {errors.questions.root.message}
              </div>
            )}
            {fields.map((field, index) => (
              <div key={field.id} className="p-6 border-b last:border-b-0 space-y-4 bg-muted/20 relative group">
                <div className="flex items-start gap-4">
                  <div className="cursor-move pt-3 text-muted-foreground opacity-50 group-hover:opacity-100">
                    <GripVertical className="w-4 h-4" />
                  </div>
                  <div className="flex-1 space-y-4">
                    <div className="flex flex-col md:flex-row gap-4">
                      <div className="flex-1 space-y-2">
                        <Label>Question {index + 1}</Label>
                        <Input placeholder="Enter prompt..." {...register(`questions.${index}.prompt`)} />
                        {errors.questions?.[index]?.prompt && (
                          <p className="text-sm text-destructive">{errors.questions[index]?.prompt?.message}</p>
                        )}
                      </div>
                      <div className="w-full md:w-48 space-y-2">
                        <Label>Type</Label>
                        <Controller
                          control={control}
                          name={`questions.${index}.type`}
                          render={({ field }) => (
                            <Select onValueChange={field.onChange} value={field.value}>
                              <SelectTrigger className="bg-background">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="text">Text Input</SelectItem>
                                <SelectItem value="radio">Single Choice</SelectItem>
                                <SelectItem value="checkbox">Multiple Choice</SelectItem>
                                <SelectItem value="scale">Rating Scale</SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                        />
                      </div>
                    </div>

                    {(watch(`questions.${index}.type`) === "radio" || watch(`questions.${index}.type`) === "checkbox") && (
                      <div className="pl-4 border-l-2 border-primary/20 space-y-2">
                        <Label className="text-muted-foreground text-xs">Options (comma separated)</Label>
                        <Input 
                          placeholder="e.g. Yes, No, Maybe" 
                          onBlur={(e) => {
                            const val = e.target.value;
                            const options = val.split(',').map(o => o.trim()).filter(Boolean);
                            // Set options in form state
                            control._fields[`questions.${index}.options` as any] = options;
                          }}
                          defaultValue={watch(`questions.${index}.options`)?.join(', ')}
                        />
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col items-center gap-4">
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="icon" 
                      className="text-destructive hover:bg-destructive/10 mt-6"
                      onClick={() => remove(index)}
                    >
                      <Trash className="w-4 h-4" />
                    </Button>
                    <div className="flex flex-col items-center gap-1">
                      <Label className="text-[10px]">Required</Label>
                      <Controller
                        control={control}
                        name={`questions.${index}.required`}
                        render={({ field }) => (
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        )}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => navigate('/surveys')} disabled={isLoading}>Cancel</Button>
          <Button type="submit" className="bg-primary hover:bg-primary/90 min-w-[150px]" disabled={isLoading}>
            {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            {isEdit ? 'Update Survey' : 'Save Survey'}
          </Button>
        </div>
      </form>
    </div>
  );
}

