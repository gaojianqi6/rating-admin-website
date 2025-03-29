// src/pages/template/components/TemplateBasicInfo.tsx
import { useEffect } from "react";
import { useAtom } from 'jotai';

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

import { templateAtom } from "../index";
import { INITIAL_TEMPLATE_DATA } from "@/store/template";

interface TemplateBasicInfoProps {
  mode: 'create' | 'edit' | 'view';
  onNext: () => void;
}

export function TemplateBasicInfo({ mode, onNext }: TemplateBasicInfoProps) {
  const [template, setTemplate] = useAtom(templateAtom);
  const isReadOnly = mode === 'view';
  
  // Reset template when creating new
  useEffect(() => {
    if (mode === 'create') {
      setTemplate({ ...INITIAL_TEMPLATE_DATA });
    }
  }, [mode, setTemplate]);
  
  // Update specific template properties
  const updateTemplateProp = (prop: string, value: any) => {
    if (isReadOnly) return;
    
    setTemplate(prev => ({
      ...prev,
      [prop]: value
    }));
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Basic Information</CardTitle>
        <CardDescription>
          {isReadOnly 
            ? "View the basic details of this template."
            : "Enter the basic details of your template."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="name">Template Name (Internal)</Label>
            <Input 
              id="name"
              value={template.name}
              onChange={(e) => updateTemplateProp('name', e.target.value)}
              placeholder="e.g. movie_ratings"
              readOnly={isReadOnly}
            />
            <p className="text-sm text-muted-foreground">
              Used internally in the system. No spaces, lowercase with
              underscores.
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="displayName">Display Name</Label>
            <Input
              id="displayName"
              value={template.displayName}
              onChange={(e) => updateTemplateProp('displayName', e.target.value)}
              placeholder="e.g. Movie Ratings"
              readOnly={isReadOnly}
            />
            <p className="text-sm text-muted-foreground">
              The name shown to users.
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={template.description}
            onChange={(e) => updateTemplateProp('description', e.target.value)}
            placeholder="Describe this template's purpose and usage"
            rows={4}
            readOnly={isReadOnly}
          />
        </div>

        <div className="space-y-2 max-w-xs">
          <Label htmlFor="fullMarks">Full Marks</Label>
          <Input
            id="fullMarks"
            type="number"
            value={template.fullMarks}
            onChange={(e) => updateTemplateProp('fullMarks', Number(e.target.value))}
            min={1}
            max={100}
            readOnly={isReadOnly}
          />
          <p className="text-sm text-muted-foreground">
            Maximum possible rating for this template.
          </p>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Switch
              id="isPublished"
              checked={template.isPublished}
              onCheckedChange={(checked) => updateTemplateProp('isPublished', checked)}
              disabled={isReadOnly}
            />
            <Label htmlFor="isPublished">Published</Label>
          </div>
          <p className="text-sm text-muted-foreground">
            Published templates are available for users to create ratings.
          </p>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        {!isReadOnly && (
          <Button
            variant="outline"
            type="button"
            onClick={onNext}
          >
            Next: Configure Fields
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}