import React, { useState } from 'react';
import { toast } from 'sonner';
import { Loader2, Plus, GripVertical, Trash, Save } from 'lucide-react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

const profileFieldSchema = z.object({
  id: z.string(),
  label: z.string().min(1, "Label is required"),
  type: z.enum(["text", "number", "select", "date"]),
  required: z.boolean().default(false),
  options: z.string().optional(), // For select (comma mapped)
});

const profileFormSchema = z.object({
  isActive: z.boolean().default(true),
  fields: z.array(profileFieldSchema).min(1, "At least one field is required"),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export default function ProfileBuilderPage() {
  const [isLoading, setIsLoading] = useState(false);

  const { register, control, handleSubmit, watch, formState: { errors } } = useForm<ProfileFormValues>({
    // @ts-ignore zodResolver typing mismatch
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      isActive: true,
      fields: [
        { id: "f1", label: "Age Group", type: "select", required: true, options: "18-24,25-34,35-44,45+" },
        { id: "f2", label: "State of Residence", type: "select", required: true, options: "Lagos,Abuja,Kano,Rivers,Other" },
        { id: "f3", label: "Monthly Income Bracket", type: "select", required: false, options: "Under 50k,50k-150k,150k-500k,Above 500k" },
      ]
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "fields"
  });

  const onSubmit = async (data: ProfileFormValues) => {
    setIsLoading(true);
    try {
      await new Promise(r => setTimeout(r, 800));
      console.log("Profile Builder Schema:", data);
      toast.success("Profile baseline updated successfully.");
    } catch (e) {
      toast.error("Failed to update profile builder");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Profile Builder</h2>
          <p className="text-muted-foreground">Define the demographic data users must provide to unlock regular surveys.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
            <div>
              <CardTitle>Baseline App Fields</CardTitle>
              <CardDescription>Drag, drop, and configure demographics requirements.</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                onClick={() => append({ id: `f${Date.now()}`, label: "", type: "text", required: false, options: "" })}
              >
                <Plus className="w-4 h-4 mr-2" /> Add Field
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {errors.fields?.root && (
              <div className="p-4 bg-destructive/10 text-destructive text-sm font-medium">
                {errors.fields.root.message}
              </div>
            )}
            {fields.map((item, index) => (
              <div key={item.id} className="p-6 border-b last:border-b-0 space-y-4 bg-muted/10 relative group">
                <div className="flex items-start gap-4">
                  <div className="cursor-move pt-3 text-muted-foreground opacity-50 group-hover:opacity-100">
                    <GripVertical className="w-4 h-4" />
                  </div>
                  <div className="flex-1 space-y-4">
                    <div className="flex flex-col md:flex-row gap-4">
                      <div className="flex-1 space-y-2">
                        <Label>Field Label</Label>
                        <Input placeholder="e.g. State of Origin..." {...register(`fields.${index}.label` as const)} />
                        {errors.fields?.[index]?.label && (
                          <p className="text-sm text-destructive">{errors.fields[index]?.label?.message}</p>
                        )}
                      </div>
                      <div className="w-full md:w-48 space-y-2">
                        <Label>Data Type</Label>
                        <Controller
                          control={control}
                          name={`fields.${index}.type` as const}
                          render={({ field }) => (
                            <Select onValueChange={field.onChange} value={field.value}>
                              <SelectTrigger className="bg-background">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="text">Text Input</SelectItem>
                                <SelectItem value="number">Numeric Input</SelectItem>
                                <SelectItem value="select">Dropdown Menu</SelectItem>
                                <SelectItem value="date">Date Picker</SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                        />
                      </div>
                    </div>

                    {watch(`fields.${index}.type`) === "select" && (
                      <div className="pl-4 border-l-2 border-primary/20 space-y-2">
                        <Label className="text-muted-foreground text-xs">Dropdown Options (comma separated)</Label>
                        <Input placeholder="e.g. Option A, Option B" {...register(`fields.${index}.options` as const)} />
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
                        name={`fields.${index}.required` as const}
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
          <CardFooter className="bg-muted/40 border-t py-4 justify-between">
             <div className="flex items-center space-x-2">
              <Controller
                  control={control}
                  name="isActive"
                  render={({ field }) => (
                    <Switch checked={field.value} onCheckedChange={field.onChange} id="active-switch" />
                  )}
                />
               <Label htmlFor="active-switch" className="cursor-pointer text-sm">Enforce Profile Gate on App Launch</Label>
             </div>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />} Save Changes
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
