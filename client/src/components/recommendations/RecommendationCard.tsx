import TrendingUp from 'lucide-react/dist/esm/icons/trending-up';
import Building from 'lucide-react/dist/esm/icons/building';
import Cog from 'lucide-react/dist/esm/icons/cog';
import CreditCard from 'lucide-react/dist/esm/icons/credit-card';
import FileText from 'lucide-react/dist/esm/icons/file-text';
import ShoppingCart from 'lucide-react/dist/esm/icons/shopping-cart';

interface Props {
  title: string;
  percentage: number;
  count: number;
  score: number;
  selected: boolean;
  onSelect: () => void;
  productType: string;
}

const getCategoryIcon = (productType: string) => {
  const icons = {
    working_capital: <TrendingUp className="w-5 h-5" />,
    equipment_financing: <Cog className="w-5 h-5" />,
    line_of_credit: <CreditCard className="w-5 h-5" />,
    term_loan: <Building className="w-5 h-5" />,
    invoice_factoring: <FileText className="w-5 h-5" />,
    purchase_order_financing: <ShoppingCart className="w-5 h-5" />,
  };
  return icons[productType as keyof typeof icons] || <FileText className="w-5 h-5" />;
};

export const RecommendationCard = ({
  title,
  percentage,
  count,
  score,
  selected,
  onSelect,
  productType,
}: Props) => (
  <button
    onClick={onSelect}
    className={`w-full text-left border rounded-lg p-4 mb-4 hover:border-teal-500 transition-all duration-200
      ${selected ? "ring-2 ring-teal-500/60 border-teal-500 bg-teal-50" : "border-gray-200 bg-white"}`}
  >
    <div className="flex justify-between items-start">
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-lg ${selected ? 'bg-teal-100 text-teal-700' : 'bg-gray-100 text-gray-600'}`}>
          {getCategoryIcon(productType)}
        </div>
        <div>
          <h4 className="font-semibold mb-1 text-gray-900">{title}</h4>
          <p className="text-sm text-gray-500">
            {count} products available ({percentage}%)
          </p>
        </div>
      </div>
      <span
        className={`text-xs px-3 py-1 rounded-full font-medium ${
          score >= 90
            ? "bg-green-100 text-green-700"
            : score >= 75
            ? "bg-teal-100 text-teal-700"
            : score >= 60
            ? "bg-yellow-100 text-yellow-700"
            : "bg-gray-100 text-gray-700"
        }`}
      >
        {score}% Match
      </span>
    </div>
  </button>
);