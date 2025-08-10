import {
  UtensilsCrossed,  // For "Food & Drinks"
  Car,              // For "Transport"
  Zap,              // For "Utilities & Bills"
  ShoppingBag,      // For "Shopping"
  Smartphone,       // For "Electronics & Gadgets"
  HeartPulse,       // For "Healthcare"
  GraduationCap,    // For "Education"
  Home,             // For "Rent"
  Gamepad2,         // For "Entertainment"
  TrendingUp,       // For "Investments"
  Baby,             // For "Family & Kids"
  Heart,            // For "Charity & Donations"
  CircleDashed,     // For "Others"
  
  // Income category icons
  Banknote,         // For "Salary"
  Briefcase,        // For "Freelance"
  Building2,        // For "Business"
  PiggyBank,        // For "Investment"
  Building,         // For "Rental Income"
  Coins,            // For "Dividends"
  Percent,          // For "Interest"
  Gift,             // For "Bonus"
  HandCoins,        // For "Commission"
  Clock,            // For "Pension"
  Award,            // For "Scholarship"
  Gift as GiftIcon, // For "Gift"
  RotateCcw,        // For "Refund"
  FileCheck,        // For "Grant"
  Crown,            // For "Royalty"
  Package,          // For "Other"
  
  LucideProps
} from 'lucide-react';


interface CategoryIconProps extends Omit<LucideProps, 'ref'> {
  category: string;
}

const CategoryIcon = ({ category, ...props }: CategoryIconProps) => {
  switch (category.toLowerCase()) {
    // Expense categories
    case 'food & drinks':
      return <UtensilsCrossed {...props} />;
    case 'transport':
      return <Car {...props} />;
    case 'utilities & bills':
    case 'utilities':
    case 'bills':
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
    case 'entertainment':
      return <Gamepad2 {...props} />;
    case 'investments':
      return <TrendingUp {...props} />;
    case 'family & kids':
      return <Baby {...props} />;
    case 'charity & donations':
      return <Heart {...props} />;
    case 'others':
    case 'miscellaneous':
      return <CircleDashed {...props} />;
    
    // Income categories
    case 'salary':
      return <Banknote {...props} />;
    case 'freelance':
      return <Briefcase {...props} />;
    case 'business':
      return <Building2 {...props} />;
    case 'investment':
      return <PiggyBank {...props} />;
    case 'rental income':
      return <Building {...props} />;
    case 'dividends':
      return <Coins {...props} />;
    case 'interest':
      return <Percent {...props} />;
    case 'bonus':
      return <Gift {...props} />;
    case 'commission':
      return <HandCoins {...props} />;
    case 'pension':
      return <Clock {...props} />;
    case 'scholarship':
      return <Award {...props} />;
    case 'gift':
      return <GiftIcon {...props} />;
    case 'refund':
      return <RotateCcw {...props} />;
    case 'grant':
      return <FileCheck {...props} />;
    case 'royalty':
      return <Crown {...props} />;
    case 'other':
      return <Package {...props} />;
    
    // Default icon
    default:
      return <CircleDashed {...props} />;
  }
};

export default CategoryIcon;