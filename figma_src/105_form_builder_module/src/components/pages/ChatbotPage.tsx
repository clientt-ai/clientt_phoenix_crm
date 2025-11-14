import { useState } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Switch } from '../ui/switch';
import { Badge } from '../ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { MessageSquare, Info, Sparkles, ArrowRight, MessageCircle, Brain, Calendar, Settings, Zap, Eye, ZoomIn, ZoomOut, Maximize2, Edit3 } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';

export function ChatbotPage() {
  const [chatbotActive, setChatbotActive] = useState(true);
  const [chatbotName, setChatbotName] = useState('Clientt Sales Bot');
  const [greetingMessage, setGreetingMessage] = useState(
    'Hi there! Want to see pricing or learn about our features before connecting with a rep?'
  );
  const [followupRouting, setFollowupRouting] = useState('Sales Inbox');
  const [sendEmailConfirmation, setSendEmailConfirmation] = useState(true);
  const [flowZoom, setFlowZoom] = useState(100);
  const [showChatPreview, setShowChatPreview] = useState(false);

  // Flow node content state
  const [welcomeMessage, setWelcomeMessage] = useState('Hey there! A few quick questions before we connect.');
  const [questionMessage, setQuestionMessage] = useState('What are you most interested in?');
  const [buttonOption1, setButtonOption1] = useState('Features');
  const [buttonOption2, setButtonOption2] = useState('Pricing');
  const [buttonOption3, setButtonOption3] = useState('Book a Demo');
  const [featuresResponse, setFeaturesResponse] = useState('Great! Here\'s what makes Clientt powerful: Real-time analytics, AI-powered insights...');
  const [pricingResponse, setPricingResponse] = useState('Our plans start at $49/month. Premium features unlock at $99/month...');
  const [bookDemoResponse, setBookDemoResponse] = useState('Perfect! Please select a time below to schedule your personalized demo.');
  const [integrationAction, setIntegrationAction] = useState('Opens Clientt Calendar Integration');

  // Edit dialog states
  const [editingNode, setEditingNode] = useState<string | null>(null);
  const [tempEditValue, setTempEditValue] = useState('');
  const [tempButtonValues, setTempButtonValues] = useState({ btn1: '', btn2: '', btn3: '' });

  const handleToggleChatbot = (checked: boolean) => {
    setChatbotActive(checked);
    toast.success(checked ? 'Chatbot activated' : 'Chatbot paused');
  };

  const handleOpenEdit = (nodeType: string, currentValue?: string) => {
    setEditingNode(nodeType);
    if (nodeType === 'question') {
      setTempEditValue(questionMessage);
      setTempButtonValues({ 
        btn1: buttonOption1, 
        btn2: buttonOption2, 
        btn3: buttonOption3 
      });
    } else {
      setTempEditValue(currentValue || '');
    }
  };

  const handleSaveEdit = () => {
    if (!editingNode) return;

    switch (editingNode) {
      case 'welcome':
        setWelcomeMessage(tempEditValue);
        break;
      case 'question':
        setQuestionMessage(tempEditValue);
        setButtonOption1(tempButtonValues.btn1);
        setButtonOption2(tempButtonValues.btn2);
        setButtonOption3(tempButtonValues.btn3);
        break;
      case 'features':
        setFeaturesResponse(tempEditValue);
        break;
      case 'pricing':
        setPricingResponse(tempEditValue);
        break;
      case 'bookdemo':
        setBookDemoResponse(tempEditValue);
        break;
      case 'integration':
        setIntegrationAction(tempEditValue);
        break;
    }

    toast.success('Node updated successfully!');
    setEditingNode(null);
    setTempEditValue('');
  };

  const handleCancelEdit = () => {
    setEditingNode(null);
    setTempEditValue('');
    setTempButtonValues({ btn1: '', btn2: '', btn3: '' });
  };

  return (
    <div className="max-w-5xl">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <h1 className="text-[38px]">Sales Chatbot</h1>
          <div className="group relative">
            <Info className="w-5 h-5 text-muted-foreground cursor-help" />
            <div className="absolute left-0 top-full mt-2 hidden group-hover:block w-80 p-3 bg-popover text-popover-foreground text-sm rounded-lg shadow-lg border border-border z-10">
              This chatbot handles sales leads only. Support chat will be separate under the Support module.
            </div>
          </div>
        </div>
        <p className="text-muted-foreground">
          Customize and manage your sales chatbot to capture qualified leads, collect pre-qualification questions, and route demo requests.
        </p>
      </div>

      {/* Activation Section */}
      <Card className="p-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3>Chatbot Status</h3>
                <Badge
                  className={
                    chatbotActive
                      ? 'bg-green-500/10 text-green-600 hover:bg-green-500/20'
                      : 'bg-gray-500/10 text-gray-600 hover:bg-gray-500/20'
                  }
                >
                  {chatbotActive ? 'Active' : 'Paused'}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {chatbotActive
                  ? 'Your chatbot is live and engaging with visitors'
                  : 'Chatbot is currently paused'}
              </p>
            </div>
          </div>
          <Switch
            checked={chatbotActive}
            onCheckedChange={handleToggleChatbot}
          />
        </div>
      </Card>

      {/* Configuration Section */}
      <Card className="p-6 mb-6">
        <h2 className="mb-4">Chatbot Configuration</h2>
        
        <div className="space-y-6">
          {/* Chatbot Name */}
          <div>
            <Label className="mb-2 block">Chatbot Name</Label>
            <Input
              value={chatbotName}
              onChange={(e) => setChatbotName(e.target.value)}
              placeholder="e.g., Clientt Sales Bot"
            />
          </div>

          {/* Greeting Message */}
          <div>
            <Label className="mb-2 block">Greeting Message</Label>
            <Textarea
              value={greetingMessage}
              onChange={(e) => setGreetingMessage(e.target.value)}
              rows={3}
              placeholder="Enter the first message users will see..."
            />
          </div>

          {/* Follow-up Routing */}
          <div>
            <Label className="mb-2 block">Follow-up Routing</Label>
            <Select value={followupRouting} onValueChange={setFollowupRouting}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Sales Inbox">Sales Inbox</SelectItem>
                <SelectItem value="Custom Email">Custom Email</SelectItem>
                <SelectItem value="CRM Lead Capture">CRM Lead Capture</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground mt-2">
              Choose where leads from this chatbot will be sent
            </p>
          </div>

          {/* Email Confirmation */}
          <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-muted/30">
            <div>
              <Label className="text-base">Send email confirmation to user</Label>
              <p className="text-sm text-muted-foreground mt-1">
                Users will receive a confirmation email after submitting their information
              </p>
            </div>
            <Switch
              checked={sendEmailConfirmation}
              onCheckedChange={setSendEmailConfirmation}
            />
          </div>
        </div>
      </Card>

      {/* Conversation Flow Section */}
      <Card className="p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-primary" />
              <h2>Conversation Flow Builder</h2>
            </div>
            <p className="text-sm text-muted-foreground">
              Visual map of your chatbot conversation logic and branching paths
            </p>
          </div>
          <div className="flex items-center gap-2">
            {/* Zoom Controls */}
            <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
              <Button
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0"
                onClick={() => setFlowZoom(Math.max(50, flowZoom - 10))}
              >
                <ZoomOut className="w-4 h-4" />
              </Button>
              <span className="text-xs text-muted-foreground px-2 min-w-[3rem] text-center">
                {flowZoom}%
              </span>
              <Button
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0"
                onClick={() => setFlowZoom(Math.min(150, flowZoom + 10))}
              >
                <ZoomIn className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0"
                onClick={() => setFlowZoom(100)}
              >
                <Maximize2 className="w-4 h-4" />
              </Button>
            </div>
            {/* Preview Chat Button */}
            <Button
              size="sm"
              className="gap-2 bg-primary hover:bg-primary/90 text-white"
              onClick={() => setShowChatPreview(!showChatPreview)}
            >
              <Eye className="w-4 h-4" />
              {showChatPreview ? 'Hide' : 'Preview'} Chat
            </Button>
          </div>
        </div>

        {/* Flow Canvas with Zoom */}
        <div className="relative bg-muted/20 rounded-lg border-2 border-dashed border-border p-8 overflow-auto min-h-[600px]">
          <div 
            className="relative mx-auto"
            style={{ 
              transform: `scale(${flowZoom / 100})`,
              transformOrigin: 'top center',
              transition: 'transform 0.2s ease'
            }}
          >
            {/* START NODE */}
            <div className="flex flex-col items-center">
              <div className="group relative bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-xl p-4 shadow-lg hover:shadow-xl transition-all cursor-pointer min-w-[280px]">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                    <Zap className="w-4 h-4" />
                  </div>
                  <Badge className="bg-white/20 hover:bg-white/30 border-white/30">START</Badge>
                </div>
                <p className="text-sm mb-2">Welcome Message</p>
                <p className="text-xs opacity-90">
                  {welcomeMessage}
                </p>
                <Button
                  size="sm"
                  variant="ghost"
                  className="absolute top-2 right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity bg-white/20 hover:bg-white/30"
                  onClick={() => handleOpenEdit('welcome')}
                >
                  <Edit3 className="w-3 h-3" />
                </Button>
              </div>

              {/* Connector Arrow */}
              <div className="flex flex-col items-center py-4">
                <div className="w-0.5 h-12 bg-gradient-to-b from-border to-primary"></div>
                <ArrowRight className="w-5 h-5 text-primary rotate-90" />
              </div>
            </div>

            {/* QUESTION NODE */}
            <div className="flex flex-col items-center">
              <div className="group relative bg-card border-2 border-primary/30 rounded-xl p-4 shadow-lg hover:shadow-xl transition-all cursor-pointer min-w-[320px]">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <MessageCircle className="w-4 h-4 text-primary" />
                  </div>
                  <Badge variant="outline" className="border-primary/30 text-primary">💬 BOT MESSAGE</Badge>
                </div>
                <p className="text-sm mb-3">{questionMessage}</p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="text-xs">{buttonOption1}</Badge>
                  <Badge variant="outline" className="text-xs">{buttonOption2}</Badge>
                  <Badge className="text-xs bg-primary/10 text-primary hover:bg-primary/20">{buttonOption3}</Badge>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  className="absolute top-2 right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => handleOpenEdit('question')}
                >
                  <Edit3 className="w-3 h-3" />
                </Button>
              </div>

              {/* Branching Connectors */}
              <div className="flex justify-center items-start gap-8 py-4 w-full">
                {/* Left Branch */}
                <div className="flex flex-col items-center">
                  <div className="w-0.5 h-8 bg-gradient-to-b from-primary to-blue-500"></div>
                  <ArrowRight className="w-5 h-5 text-blue-500 rotate-90" />
                </div>
                {/* Middle Branch */}
                <div className="flex flex-col items-center">
                  <div className="w-0.5 h-8 bg-gradient-to-b from-primary to-purple-500"></div>
                  <ArrowRight className="w-5 h-5 text-purple-500 rotate-90" />
                </div>
                {/* Right Branch */}
                <div className="flex flex-col items-center">
                  <div className="w-0.5 h-8 bg-gradient-to-b from-primary to-secondary"></div>
                  <ArrowRight className="w-5 h-5 text-secondary rotate-90" />
                </div>
              </div>
            </div>

            {/* BRANCHING LOGIC NODES */}
            <div className="flex justify-center gap-4 mb-8">
              {/* Features Branch */}
              <div className="flex flex-col items-center w-[280px]">
                <div className="group relative bg-blue-500/10 border-2 border-blue-500/30 rounded-xl p-4 shadow-lg hover:shadow-xl transition-all cursor-pointer w-full">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-7 h-7 rounded-full bg-blue-500/20 flex items-center justify-center">
                      <Brain className="w-4 h-4 text-blue-600" />
                    </div>
                    <Badge className="bg-blue-500/20 text-blue-600 hover:bg-blue-500/30 border-blue-500/30 text-xs">
                      🧠 IF FEATURES
                    </Badge>
                  </div>
                  <p className="text-sm text-foreground/90">
                    {featuresResponse}
                  </p>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="absolute top-2 right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => handleOpenEdit('features')}
                  >
                    <Edit3 className="w-3 h-3" />
                  </Button>
                </div>
                <div className="flex flex-col items-center py-2">
                  <div className="w-0.5 h-8 bg-gradient-to-b from-blue-500/50 to-border"></div>
                </div>
              </div>

              {/* Pricing Branch */}
              <div className="flex flex-col items-center w-[280px]">
                <div className="group relative bg-purple-500/10 border-2 border-purple-500/30 rounded-xl p-4 shadow-lg hover:shadow-xl transition-all cursor-pointer w-full">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-7 h-7 rounded-full bg-purple-500/20 flex items-center justify-center">
                      <Brain className="w-4 h-4 text-purple-600" />
                    </div>
                    <Badge className="bg-purple-500/20 text-purple-600 hover:bg-purple-500/30 border-purple-500/30 text-xs">
                      🧠 IF PRICING
                    </Badge>
                  </div>
                  <p className="text-sm text-foreground/90">
                    {pricingResponse}
                  </p>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="absolute top-2 right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => handleOpenEdit('pricing')}
                  >
                    <Edit3 className="w-3 h-3" />
                  </Button>
                </div>
                <div className="flex flex-col items-center py-2">
                  <div className="w-0.5 h-8 bg-gradient-to-b from-purple-500/50 to-border"></div>
                </div>
              </div>

              {/* Book Demo Branch */}
              <div className="flex flex-col items-center w-[280px]">
                <div className="group relative bg-gradient-to-br from-secondary/20 to-secondary/10 border-2 border-secondary/40 rounded-xl p-4 shadow-lg hover:shadow-xl transition-all cursor-pointer w-full">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-7 h-7 rounded-full bg-secondary/30 flex items-center justify-center">
                      <Brain className="w-4 h-4 text-secondary" />
                    </div>
                    <Badge className="bg-secondary/20 text-secondary hover:bg-secondary/30 border-secondary/30 text-xs">
                      🧠 IF BOOK DEMO
                    </Badge>
                  </div>
                  <p className="text-sm text-foreground/90 mb-3">
                    {bookDemoResponse}
                  </p>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="absolute top-2 right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => handleOpenEdit('bookdemo')}
                  >
                    <Edit3 className="w-3 h-3" />
                  </Button>
                </div>
                <div className="flex flex-col items-center py-2">
                  <div className="w-0.5 h-12 bg-gradient-to-b from-secondary/50 to-secondary"></div>
                  <ArrowRight className="w-5 h-5 text-secondary rotate-90" />
                </div>
              </div>
            </div>

            {/* INTEGRATION/ACTION NODE */}
            <div className="flex justify-center">
              <div className="group relative bg-gradient-to-br from-secondary to-pink-500 text-white rounded-xl p-4 shadow-lg hover:shadow-xl transition-all cursor-pointer min-w-[320px]">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <Badge className="bg-white/20 hover:bg-white/30 border-white/30">📅 INTEGRATION</Badge>
                </div>
                <p className="text-sm mb-2">Calendar Booking</p>
                <div className="flex items-center gap-2 text-xs opacity-90">
                  <Settings className="w-3 h-3" />
                  <span>→ {integrationAction}</span>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  className="absolute top-2 right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity bg-white/20 hover:bg-white/30"
                  onClick={() => handleOpenEdit('integration')}
                >
                  <Edit3 className="w-3 h-3" />
                </Button>
              </div>
            </div>

            {/* END NODE */}
            <div className="flex flex-col items-center mt-8">
              <div className="flex flex-col items-center py-2">
                <div className="w-0.5 h-8 bg-gradient-to-b from-secondary to-muted-foreground"></div>
                <ArrowRight className="w-5 h-5 text-muted-foreground rotate-90" />
              </div>
              <div className="bg-muted border-2 border-border rounded-xl p-4 shadow-lg min-w-[280px] text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <div className="w-7 h-7 rounded-full bg-muted-foreground/10 flex items-center justify-center">
                    <Zap className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <Badge variant="outline" className="text-xs">⚙️ ACTION</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Lead captured & routed to {followupRouting}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tooltip */}
        <div className="mt-4 flex items-center justify-center gap-2 p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/30">
          <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <p className="text-sm text-blue-700 dark:text-blue-300">
            <strong>Future update:</strong> Drag and drop to customize chatbot conversation paths.
          </p>
        </div>
      </Card>

      {/* Chat Preview Widget (Right Side) */}
      {showChatPreview && (
        <div className="fixed right-6 bottom-6 w-[380px] h-[600px] bg-card border-2 border-border rounded-xl shadow-2xl z-50 flex flex-col overflow-hidden">
          {/* Chat Header */}
          <div className="bg-gradient-to-r from-primary to-secondary p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-white font-medium">{chatbotName}</p>
                <p className="text-white/80 text-xs">Online now</p>
              </div>
            </div>
            <Button
              size="sm"
              variant="ghost"
              className="h-8 w-8 p-0 text-white hover:bg-white/20"
              onClick={() => setShowChatPreview(false)}
            >
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 p-4 space-y-3 overflow-y-auto bg-muted/30">
            {/* Bot Message 1 */}
            <div className="flex justify-start">
              <div className="max-w-[85%] bg-card p-3 rounded-lg rounded-bl-none shadow-sm border border-border">
                <p className="text-sm">{welcomeMessage}</p>
              </div>
            </div>

            {/* Bot Message 2 */}
            <div className="flex justify-start">
              <div className="max-w-[85%] bg-card p-3 rounded-lg rounded-bl-none shadow-sm border border-border">
                <p className="text-sm mb-3">{questionMessage}</p>
                <div className="flex flex-col gap-2">
                  <Button size="sm" variant="outline" className="w-full justify-start">
                    {buttonOption1}
                  </Button>
                  <Button size="sm" variant="outline" className="w-full justify-start">
                    {buttonOption2}
                  </Button>
                  <Button size="sm" className="w-full justify-start bg-primary hover:bg-primary/90 text-white">
                    {buttonOption3}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Chat Input */}
          <div className="p-4 border-t border-border bg-card">
            <div className="flex gap-2">
              <Input
                placeholder="Type a message..."
                className="flex-1"
                disabled
              />
              <Button size="sm" className="bg-primary hover:bg-primary/90 text-white" disabled>
                Send
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              Preview mode - interactions disabled
            </p>
          </div>
        </div>
      )}

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          className="bg-primary hover:bg-primary/90 text-white"
          onClick={() => toast.success('Chatbot settings saved successfully!')}
        >
          Save Changes
        </Button>
      </div>

      {/* Edit Dialogs */}
      <Dialog open={editingNode === 'welcome'} onOpenChange={(open) => !open && handleCancelEdit()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Welcome Message</DialogTitle>
            <DialogDescription>
              Customize the first message visitors see when the chatbot starts
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label className="mb-2 block">Welcome Message</Label>
            <Textarea
              value={tempEditValue}
              onChange={(e) => setTempEditValue(e.target.value)}
              rows={3}
              placeholder="Enter welcome message..."
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCancelEdit}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit} className="bg-primary hover:bg-primary/90 text-white">
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={editingNode === 'question'} onOpenChange={(open) => !open && handleCancelEdit()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Question & Options</DialogTitle>
            <DialogDescription>
              Customize the question and button options for user responses
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div>
              <Label className="mb-2 block">Question Message</Label>
              <Textarea
                value={tempEditValue}
                onChange={(e) => setTempEditValue(e.target.value)}
                rows={2}
                placeholder="Enter question..."
              />
            </div>
            <div>
              <Label className="mb-2 block">Button Option 1</Label>
              <Input
                value={tempButtonValues.btn1}
                onChange={(e) => setTempButtonValues({ ...tempButtonValues, btn1: e.target.value })}
                placeholder="e.g., Features"
              />
            </div>
            <div>
              <Label className="mb-2 block">Button Option 2</Label>
              <Input
                value={tempButtonValues.btn2}
                onChange={(e) => setTempButtonValues({ ...tempButtonValues, btn2: e.target.value })}
                placeholder="e.g., Pricing"
              />
            </div>
            <div>
              <Label className="mb-2 block">Button Option 3 (Primary Action)</Label>
              <Input
                value={tempButtonValues.btn3}
                onChange={(e) => setTempButtonValues({ ...tempButtonValues, btn3: e.target.value })}
                placeholder="e.g., Book a Demo"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCancelEdit}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit} className="bg-primary hover:bg-primary/90 text-white">
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={editingNode === 'features'} onOpenChange={(open) => !open && handleCancelEdit()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Features Response</DialogTitle>
            <DialogDescription>
              Customize the bot's response when users ask about features
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label className="mb-2 block">Response Message</Label>
            <Textarea
              value={tempEditValue}
              onChange={(e) => setTempEditValue(e.target.value)}
              rows={4}
              placeholder="Enter features response..."
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCancelEdit}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit} className="bg-primary hover:bg-primary/90 text-white">
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={editingNode === 'pricing'} onOpenChange={(open) => !open && handleCancelEdit()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Pricing Response</DialogTitle>
            <DialogDescription>
              Customize the bot's response when users ask about pricing
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label className="mb-2 block">Response Message</Label>
            <Textarea
              value={tempEditValue}
              onChange={(e) => setTempEditValue(e.target.value)}
              rows={4}
              placeholder="Enter pricing response..."
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCancelEdit}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit} className="bg-primary hover:bg-primary/90 text-white">
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={editingNode === 'bookdemo'} onOpenChange={(open) => !open && handleCancelEdit()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Book Demo Response</DialogTitle>
            <DialogDescription>
              Customize the bot's response when users want to book a demo
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label className="mb-2 block">Response Message</Label>
            <Textarea
              value={tempEditValue}
              onChange={(e) => setTempEditValue(e.target.value)}
              rows={4}
              placeholder="Enter book demo response..."
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCancelEdit}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit} className="bg-primary hover:bg-primary/90 text-white">
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={editingNode === 'integration'} onOpenChange={(open) => !open && handleCancelEdit()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Integration Action</DialogTitle>
            <DialogDescription>
              Customize the integration action description
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label className="mb-2 block">Action Description</Label>
            <Input
              value={tempEditValue}
              onChange={(e) => setTempEditValue(e.target.value)}
              placeholder="e.g., Opens Clientt Calendar Integration"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCancelEdit}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit} className="bg-primary hover:bg-primary/90 text-white">
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}