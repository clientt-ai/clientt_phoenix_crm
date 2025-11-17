import { Sparkles } from 'lucide-react';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { useState } from 'react';
import { generateFormFromPrompt } from '../utils/aiService';
import { toast } from 'sonner';

type AIAssistantProps = {
  onFormGenerated?: (formData: {
    title: string;
    description: string;
    fields: any[];
  }) => void;
};

export function AIAssistant({ onFormGenerated }: AIAssistantProps) {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleCreateWithAI = async () => {
    if (!prompt.trim()) {
      toast.error('Please enter a description for your form');
      return;
    }

    setIsGenerating(true);
    
    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const generatedForm = generateFormFromPrompt(prompt);
    
    toast.success(`Generated "${generatedForm.title}" with ${generatedForm.fields.length} fields!`);
    
    if (onFormGenerated) {
      onFormGenerated(generatedForm);
    }
    
    setPrompt('');
    setIsGenerating(false);
  };

  const handleSuggestionClick = async (suggestionPrompt: string) => {
    setPrompt(suggestionPrompt);
    setIsGenerating(true);
    
    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const generatedForm = generateFormFromPrompt(suggestionPrompt);
    
    toast.success(`Generated "${generatedForm.title}" with ${generatedForm.fields.length} fields!`);
    
    if (onFormGenerated) {
      onFormGenerated(generatedForm);
    }
    
    setPrompt('');
    setIsGenerating(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isGenerating) {
      handleCreateWithAI();
    }
  };

  return (
    <Card className="p-5 bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20 h-full flex flex-col">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#2278c0] to-[#ec4899] flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="mb-1">AI Forms Assistant</h3>
          <p className="text-sm text-muted-foreground">
            Generate a new form using AI
          </p>
        </div>
      </div>

      <div className="space-y-3 flex-1">
        <Input
          type="text"
          placeholder="e.g., Create a customer feedback form..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={isGenerating}
        />
        <Button 
          className="w-full bg-gradient-to-r from-[#2278c0] to-[#ec4899] hover:opacity-90 text-white"
          onClick={handleCreateWithAI}
          disabled={isGenerating || !prompt.trim()}
        >
          <Sparkles className="w-4 h-4 mr-2" />
          {isGenerating ? 'Generating...' : 'Create with AI'}
        </Button>
      </div>

      <div className="mt-4 pt-4 border-t border-border">
        <p className="text-xs text-muted-foreground mb-2">Smart Suggestions:</p>
        <div className="space-y-2">
          <button 
            className="w-full text-left px-3 py-2 rounded-lg bg-card text-sm hover:bg-muted transition-colors"
            onClick={() => handleSuggestionClick('Create an event registration form')}
            disabled={isGenerating}
          >
            📋 Event Registration Form
          </button>
          <button 
            className="w-full text-left px-3 py-2 rounded-lg bg-card text-sm hover:bg-muted transition-colors"
            onClick={() => handleSuggestionClick('Create a job application form')}
            disabled={isGenerating}
          >
            💼 Job Application Form
          </button>
        </div>
      </div>
    </Card>
  );
}