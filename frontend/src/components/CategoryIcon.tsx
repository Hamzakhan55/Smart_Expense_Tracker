import {
  UtensilsCrossed,  // For "Food & Drinks"
  Car,              // For "Transport"
  Zap,              // For "Utilities"
  ShoppingBag,      // For "Shopping"
  Smartphone,       // For "Electronics & Gadgets"
  HeartPulse,       // For "Healthcare"
  GraduationCap,    // For "Education"
  Home,             // For "Rent"
  FileText,         // For "Bills"
  Gamepad2,         // For "Entertainment"
  TrendingUp,       // For "Investments"
  Scissors,         // For "Personal Care"
  Baby,             // For "Family & Kids"
  Heart,            // For "Charity & Donations"
  CircleDashed,     // For "Miscellaneous"
  
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
    case 'utilities':
      return <Zap {...props} />;
    case 'shopping':
      return <ShoppingBag {...props} />;
    case 'electronics & gadgets':
      return <Smartphone {...props} />;
    case 'healthcare':
      return <HeartPulse {...props} />;
    case 'education':
      return <GraduationCap {...props} />;
    case 'rent':
      return <Home {...props} />;
    case 'bills':
      return <FileText {...props} />;
    case 'entertainment':
      return <Gamepad2 {...props} />;
    case 'investments':
      return <TrendingUp {...props} />;
    case 'personal care':
      return <Scissors {...props} />;
    case 'family & kids':
      return <Baby {...props} />;
    case 'charity & donations':
      return <Heart {...props} />;
    case 'miscellaneous':
      return <CircleDashed {...props} />;
    // A default icon in case a category doesn't match
    default:
      return <CircleDashed {...props} />;
  }
};

export default CategoryIcon;