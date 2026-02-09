import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface VerifyProductModalProps {
  productId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const VerifyProductModal: React.FC<VerifyProductModalProps> = ({ productId, open, onOpenChange }) => {
  const { t } = useTranslation();
  const [code, setCode] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleVerify = async () => {
    if (!code.trim()) return;
    setStatus('loading');
    try {
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/verify-code`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code: code.trim() }),
        }
      );
      const data = await res.json();
      setStatus(data.valid ? 'success' : 'error');
    } catch {
      setStatus('error');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-bg-card border-white/10 text-foreground">
        <DialogHeader>
          <DialogTitle className="font-oswald uppercase">
            {t('verification.title')}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Input
            placeholder={t('verification.placeholder')}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="bg-background border-white/10"
          />
          {status === 'success' && (
            <p className="text-green-500 text-sm font-mono">✓ Product is authentic</p>
          )}
          {status === 'error' && (
            <p className="text-destructive text-sm font-mono">✗ Invalid or used code</p>
          )}
          <div className="flex gap-2">
            <Button onClick={handleVerify} disabled={status === 'loading'} className="flex-1">
              {status === 'loading' ? '...' : t('verification.submit')}
            </Button>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              {t('verification.close')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VerifyProductModal;
