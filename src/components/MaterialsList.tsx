
import React from 'react';
import { Label } from '@/components/ui/label';
import { IndBillitemRecord } from '@/lib/pbtypes';

interface MaterialsListProps {
  title: string;
  materials: IndBillitemRecord[] | { name: string; quantity: number }[];
  className?: string;
}

const MaterialsList: React.FC<MaterialsListProps> = ({ title, materials, className = "text-gray-400" }) => {
  if (materials.length === 0) return null;

  return (
    <div className="space-y-2">
      <Label className="text-gray-300">{title}:</Label>
      <div className={`text-sm ${className} max-h-32 overflow-y-auto`}>
        {materials.map((item, index) => (
          <div key={index}>{item.name}: {item.quantity.toLocaleString()}</div>
        ))}
      </div>
    </div>
  );
};

export default MaterialsList;
