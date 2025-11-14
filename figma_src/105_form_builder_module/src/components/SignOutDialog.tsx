import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';
import { LogOut } from 'lucide-react';

type SignOutDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
};

export function SignOutDialog({ open, onOpenChange, onConfirm }: SignOutDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center mx-auto mb-4">
            <LogOut className="w-6 h-6 text-red-600 dark:text-red-400" />
          </div>
          <AlertDialogTitle className="text-center">Sign Out</AlertDialogTitle>
          <AlertDialogDescription className="text-center">
            Are you sure you want to sign out? Any unsaved changes will be lost.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            Sign Out
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
