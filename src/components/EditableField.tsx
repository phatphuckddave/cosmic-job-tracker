import React, { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

interface EditableFieldProps {
  value: string | number | undefined;
  onSave: (value: string | number) => void;
  type?: 'text' | 'number' | 'date' | 'select' | 'textarea';
  options?: { value: string; label: string }[];
  placeholder?: string;
  className?: string;
  formatDisplay?: (value: string | number | undefined) => string;
}

export function EditableField({
  value,
  onSave,
  type = 'text',
  options = [],
  placeholder,
  className,
  formatDisplay,
}: EditableFieldProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isEditing) {
      if (type === 'textarea') {
        textareaRef.current?.focus();
      } else {
        inputRef.current?.focus();
      }
    }
  }, [isEditing, type]);

  const handleEdit = () => {
    setEditValue(value?.toString() || '');
    setIsEditing(true);
  };

  const handleSave = () => {
    const processedValue = type === 'number' ? Number(editValue) || 0 : editValue;
    onSave(processedValue);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditValue('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  const displayValue = formatDisplay ? formatDisplay(value) : (value?.toString() || placeholder || 'Click to edit');

  if (isEditing) {
    if (type === 'select') {
      return (
        <Select value={editValue} onValueChange={(newValue) => {
          setEditValue(newValue);
          onSave(newValue);
          setIsEditing(false);
        }}>
          <SelectTrigger className={cn("w-full", className)}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    }

    if (type === 'textarea') {
      return (
        <Textarea
          ref={textareaRef}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleSave}
          className={cn("w-full resize-none", className)}
          rows={3}
        />
      );
    }

    return (
      <Input
        ref={inputRef}
        type={type === 'date' ? 'datetime-local' : type}
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleSave}
        className={cn("w-full", className)}
      />
    );
  }

  return (
    <div
      onClick={handleEdit}
      className={cn(
        "cursor-pointer px-2 py-1 rounded border border-transparent hover:border-border hover:bg-muted/50 transition-colors min-h-[32px] flex items-center",
        !value && "text-muted-foreground italic",
        className
      )}
    >
      {displayValue}
    </div>
  );
}