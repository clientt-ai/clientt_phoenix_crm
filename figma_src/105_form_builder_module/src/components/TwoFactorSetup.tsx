import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { CheckCircle2, Copy, Smartphone, AlertCircle, Shield, Key } from 'lucide-react';
import { toast } from 'sonner';

type TwoFactorSetupProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: () => void;
};

export function TwoFactorSetup({ open, onOpenChange, onComplete }: TwoFactorSetupProps) {
  const [step, setStep] = useState<'intro' | 'qr' | 'verify' | 'backup'>('intro');
  const [verificationCode, setVerificationCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState('');

  // Mock secret key and QR code (in real implementation, these come from the backend)
  const secretKey = 'JBSWY3DPEHPK3PXP';
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=otpauth://totp/Clientt:user@example.com?secret=${secretKey}&issuer=Clientt`;
  
  // Mock backup codes (in real implementation, these are generated server-side)
  const backupCodes = [
    '8274-9361',
    '4829-1847',
    '9284-7462',
    '1847-9263',
    '7462-8391',
    '2837-4926',
    '5928-1746',
    '3746-9182'
  ];

  const handleVerify = async () => {
    setIsVerifying(true);
    setError('');

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    // In a real implementation, this would verify against the server
    // For demo purposes, accept any 6-digit code
    if (verificationCode.length === 6 && /^\d+$/.test(verificationCode)) {
      setIsVerifying(false);
      setStep('backup');
      toast.success('Verification successful!');
    } else {
      setIsVerifying(false);
      setError('Invalid code. Please enter a valid 6-digit code.');
    }
  };

  const handleCopySecret = () => {
    navigator.clipboard.writeText(secretKey);
    toast.success('Secret key copied to clipboard');
  };

  const handleCopyBackupCodes = () => {
    navigator.clipboard.writeText(backupCodes.join('\n'));
    toast.success('Backup codes copied to clipboard');
  };

  const handleComplete = () => {
    onComplete();
    onOpenChange(false);
    setStep('intro');
    setVerificationCode('');
    toast.success('Two-factor authentication enabled successfully!');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        {/* Intro Step */}
        {step === 'intro' && (
          <>
            <DialogHeader>
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <DialogTitle className="text-center">Enable Two-Factor Authentication</DialogTitle>
              <DialogDescription className="text-center">
                Add an extra layer of security to your account with 2FA
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-sm font-medium text-primary">1</span>
                </div>
                <div>
                  <p className="font-medium mb-1">Download an authenticator app</p>
                  <p className="text-sm text-muted-foreground">
                    Get Google Authenticator, Authy, or any TOTP-compatible app
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-sm font-medium text-primary">2</span>
                </div>
                <div>
                  <p className="font-medium mb-1">Scan the QR code</p>
                  <p className="text-sm text-muted-foreground">
                    Use your authenticator app to scan the code we'll show you
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-sm font-medium text-primary">3</span>
                </div>
                <div>
                  <p className="font-medium mb-1">Verify with a code</p>
                  <p className="text-sm text-muted-foreground">
                    Enter the 6-digit code from your app to complete setup
                  </p>
                </div>
              </div>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  You'll need your authenticator app every time you sign in
                </AlertDescription>
              </Alert>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button 
                className="flex-1 bg-primary hover:bg-primary/90 text-white"
                onClick={() => setStep('qr')}
              >
                Get Started
              </Button>
            </div>
          </>
        )}

        {/* QR Code Step */}
        {step === 'qr' && (
          <>
            <DialogHeader>
              <DialogTitle>Scan QR Code</DialogTitle>
              <DialogDescription>
                Use your authenticator app to scan this QR code
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="flex justify-center">
                <div className="p-4 bg-white rounded-lg border-2 border-border">
                  <img 
                    src={qrCodeUrl} 
                    alt="QR Code"
                    className="w-48 h-48"
                  />
                </div>
              </div>

              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-2">
                  Can't scan the code? Enter this key manually:
                </p>
                <Card className="p-3 bg-muted">
                  <div className="flex items-center justify-between gap-2">
                    <code className="text-sm font-mono">{secretKey}</code>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleCopySecret}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </Card>
              </div>

              <Alert>
                <Smartphone className="h-4 w-4" />
                <AlertDescription>
                  Open your authenticator app and scan the QR code above or enter the key manually
                </AlertDescription>
              </Alert>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setStep('intro')}>
                Back
              </Button>
              <Button 
                className="flex-1 bg-primary hover:bg-primary/90 text-white"
                onClick={() => setStep('verify')}
              >
                Next
              </Button>
            </div>
          </>
        )}

        {/* Verification Step */}
        {step === 'verify' && (
          <>
            <DialogHeader>
              <DialogTitle>Verify Your Setup</DialogTitle>
              <DialogDescription>
                Enter the 6-digit code from your authenticator app
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="code">Verification Code</Label>
                <Input
                  id="code"
                  placeholder="000000"
                  value={verificationCode}
                  onChange={(e) => {
                    setError('');
                    setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6));
                  }}
                  maxLength={6}
                  className="text-center text-2xl tracking-widest font-mono"
                  autoFocus
                />
                {error && (
                  <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                )}
              </div>

              <Alert>
                <Key className="h-4 w-4" />
                <AlertDescription>
                  The code changes every 30 seconds. Enter the current code from your app.
                </AlertDescription>
              </Alert>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setStep('qr')}>
                Back
              </Button>
              <Button 
                className="flex-1 bg-primary hover:bg-primary/90 text-white"
                onClick={handleVerify}
                disabled={verificationCode.length !== 6 || isVerifying}
              >
                {isVerifying ? 'Verifying...' : 'Verify'}
              </Button>
            </div>
          </>
        )}

        {/* Backup Codes Step */}
        {step === 'backup' && (
          <>
            <DialogHeader>
              <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <DialogTitle className="text-center">Save Your Backup Codes</DialogTitle>
              <DialogDescription className="text-center">
                Store these codes in a safe place. Each can be used once if you lose access to your authenticator app.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <Card className="p-4 bg-muted">
                <div className="grid grid-cols-2 gap-2 mb-3">
                  {backupCodes.map((code, index) => (
                    <div key={index} className="text-center">
                      <code className="text-sm font-mono">{code}</code>
                    </div>
                  ))}
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full"
                  onClick={handleCopyBackupCodes}
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy All Codes
                </Button>
              </Card>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Important:</strong> Save these codes now. You won't be able to see them again.
                </AlertDescription>
              </Alert>
            </div>

            <Button 
              className="w-full bg-primary hover:bg-primary/90 text-white"
              onClick={handleComplete}
            >
              Done
            </Button>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

// Disable 2FA Dialog Component
type TwoFactorDisableProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
};

export function TwoFactorDisable({ open, onOpenChange, onConfirm }: TwoFactorDisableProps) {
  const [verificationCode, setVerificationCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState('');

  const handleDisable = async () => {
    setIsVerifying(true);
    setError('');

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Accept any 6-digit code for demo
    if (verificationCode.length === 6 && /^\d+$/.test(verificationCode)) {
      setIsVerifying(false);
      onConfirm();
      onOpenChange(false);
      setVerificationCode('');
      toast.success('Two-factor authentication disabled');
    } else {
      setIsVerifying(false);
      setError('Invalid code. Please try again.');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
          </div>
          <DialogTitle className="text-center">Disable Two-Factor Authentication?</DialogTitle>
          <DialogDescription className="text-center">
            Your account will be less secure without 2FA. Enter your current code to confirm.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="disable-code">Verification Code</Label>
            <Input
              id="disable-code"
              placeholder="000000"
              value={verificationCode}
              onChange={(e) => {
                setError('');
                setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6));
              }}
              maxLength={6}
              className="text-center text-2xl tracking-widest font-mono"
              autoFocus
            />
            {error && (
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            className="flex-1"
            variant="destructive"
            onClick={handleDisable}
            disabled={verificationCode.length !== 6 || isVerifying}
          >
            {isVerifying ? 'Verifying...' : 'Disable 2FA'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
