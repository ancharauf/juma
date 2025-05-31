import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Clock } from 'lucide-react';

export const durationOptions = [
  { value: 7, label: '7 Hari', token: 5 },
  { value: 14, label: '14 Hari', token: 8 },
  { value: 30, label: '30 Hari', token: 15 },
];

const DurationSelector = ({ durationDays, onDurationChange, tokenCost }) => {
  return (
    <div>
      <Label htmlFor="duration" className="text-foreground flex items-center">
        <Clock size={16} className="mr-2 text-primary" />
        Durasi Tayang
      </Label>
      <Select onValueChange={(value) => onDurationChange(parseInt(value))} value={durationDays.toString()}>
        <SelectTrigger className="w-full input-modern">
          <SelectValue placeholder="Pilih Durasi Tayang" />
        </SelectTrigger>
        <SelectContent className="bg-popover border-border text-popover-foreground">
          {durationOptions.map(opt => (
            <SelectItem key={opt.value} value={opt.value.toString()} className="hover:bg-accent/50 focus:bg-accent/50">
              {opt.label} ({opt.token} Token)
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <p className="text-xs text-muted-foreground mt-1">
        Biaya: <span className="font-semibold text-primary">{tokenCost} Token</span>. Pastikan saldo token Anda mencukupi.
      </p>
    </div>
  );
};

export default DurationSelector;