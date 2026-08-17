import React from 'react';
import {
  Home,
  Zap,
  ShoppingCart,
  Car,
  Tv,
  HeartPulse,
  Coffee,
  GraduationCap,
  Tag,
  Briefcase,
  Laptop,
  TrendingUp,
  PlusCircle,
  CreditCard,
  Utensils,
  Plane,
  Gift,
  Smartphone,
  Shield,
  HelpCircle,
  LucideIcon
} from 'lucide-react';

const ICON_MAP: Record<string, LucideIcon> = {
  Home,
  Zap,
  ShoppingCart,
  Car,
  Tv,
  HeartPulse,
  Coffee,
  GraduationCap,
  Tag,
  Briefcase,
  Laptop,
  TrendingUp,
  PlusCircle,
  CreditCard,
  Utensils,
  Plane,
  Gift,
  Smartphone,
  Shield,
  HelpCircle
};

interface CategoryIconProps {
  name: string;
  className?: string;
  size?: number;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({ name, className = 'w-4 h-4', size = 16 }) => {
  const IconComponent = ICON_MAP[name] || Tag;
  return <IconComponent className={className} size={size} />;
};

export const AVAILABLE_ICONS = [
  'Home', 'Zap', 'ShoppingCart', 'Car', 'Tv', 'HeartPulse', 
  'Coffee', 'GraduationCap', 'Tag', 'Briefcase', 'Laptop', 
  'TrendingUp', 'CreditCard', 'Utensils', 'Plane', 'Gift', 
  'Smartphone', 'Shield'
];
