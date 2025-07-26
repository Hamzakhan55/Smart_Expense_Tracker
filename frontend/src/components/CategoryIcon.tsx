import {
  UtensilsCrossed, // For "Food & Drinks"
  Car,              // For "Transport"
  HeartPulse,       // For "Healthcare"
  Receipt,          // For "Utilities"
  GraduationCap,    // For "Education"
  ShoppingBag,      // For "Shopping"
  Home,             // For "Rent"
  FileText,         // For "Bills & Fees"
  CircleDashed ,     // For "Other"
  
  LucideProps
} from 'lucide-react';


interface CategoryIconProps extends Omit<LucideProps, 'ref'> {
  category: string;
}

const CategoryIcon = ({ category, ...props }: CategoryIconProps) => {
  switch (category.toLowerCase()) {
    case 'food & drinks':
      return <UtensilsCrossed {...props} />;
    case 'transport':
      return <Car {...props} />;
    case 'healthcare':
      return <HeartPulse {...props} />;
    case 'utilities':
      return <Receipt {...props} />;
    case 'education':
      return <GraduationCap {...props} />;
    case 'shopping':
      return <ShoppingBag {...props} />;
    case 'rent':
      return <Home {...props} />;
    case 'bills & fees':
      return <FileText {...props} />;
    case 'other':
      return <CircleDashed  {...props} />;
    // A default icon in case a category doesn't match
    default:
      return <CircleDashed  {...props} />;
  }
};

export default CategoryIcon;