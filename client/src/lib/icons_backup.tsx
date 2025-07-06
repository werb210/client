/**
 * Unicode Icon System  
 * Replaces lucide-react with Unicode symbols for build optimization
 */

export interface IconProps {
  className?: string;
}

// Navigation icons
export const ArrowLeft = ({ className }: IconProps) => (
  <span className={`inline-block ${className}`}>←</span>
);

export const ArrowRight = ({ className }: IconProps) => (
  <span className={`inline-block ${className}`}>→</span>
);

export const ChevronDown = ({ className }: IconProps) => (
  <span className={`inline-block ${className}`}>▼</span>
);

export const ChevronUp = ({ className }: IconProps) => (
  <span className={`inline-block ${className}`}>▲</span>
);

export const ChevronLeft = ({ className }: IconProps) => (
  <span className={`inline-block ${className}`}>◀</span>
);

export const ChevronRight = ({ className }: IconProps) => (
  <span className={`inline-block ${className}`}>▶</span>
);

export const AlertTriangle = ({ className }: IconProps) => (
  <span className={`inline-block ${className}`}>⚠️</span>
);

// Action icons
export const Check = ({ className }: IconProps) => (
  <span className={`inline-block ${className}`}>✓</span>
);

export const X = ({ className }: IconProps) => (
  <span className={`inline-block ${className}`}>✕</span>
);

export const Plus = ({ className }: IconProps) => (
  <span className={`inline-block ${className}`}>+</span>
);

export const Minus = ({ className }: IconProps) => (
  <span className={`inline-block ${className}`}>−</span>
);

export const Upload = ({ className }: IconProps) => (
  <span className={`inline-block ${className}`}>↑</span>
);

export const Download = ({ className }: IconProps) => (
  <span className={`inline-block ${className}`}>↓</span>
);

export const Edit = ({ className }: IconProps) => (
  <span className={`inline-block ${className}`}>✎</span>
);

export const Copy = ({ className }: IconProps) => (
  <span className={`inline-block ${className}`}>⧉</span>
);

export const Search = ({ className }: IconProps) => (
  <span className={`inline-block ${className}`}>🔍</span>
);

export const Filter = ({ className }: IconProps) => (
  <span className={`inline-block ${className}`}>🔽</span>
);

export const Refresh = ({ className }: IconProps) => (
  <span className={`inline-block ${className}`}>↻</span>
);

export const RotateCcw = ({ className }: IconProps) => (
  <span className={`inline-block ${className}`}>↶</span>
);

export const RefreshCw = ({ className }: IconProps) => (
  <span className={`inline-block ${className}`}>↻</span>
);

export const MoreHorizontal = ({ className }: IconProps) => (
  <span className={`inline-block ${className}`}>⋯</span>
);

export const MoreVertical = ({ className }: IconProps) => (
  <span className={`inline-block ${className}`}>⋮</span>
);

export const Menu = ({ className }: IconProps) => (
  <span className={`inline-block ${className}`}>☰</span>
);

export const ExternalLink = ({ className }: IconProps) => (
  <span className={`inline-block ${className}`}>🔗</span>
);

export const Save = ({ className }: IconProps) => (
  <span className={`inline-block ${className}`}>💾</span>
);

// Status icons
export const CheckCircle = ({ className }: IconProps) => (
  <span className={`inline-block ${className}`}>✅</span>
);

export const XCircle = ({ className }: IconProps) => (
  <span className={`inline-block ${className}`}>❌</span>
);

export const Info = ({ className }: IconProps) => (
  <span className={`inline-block ${className}`}>ℹ️</span>
);

export const Loader2 = ({ className }: IconProps) => (
  <span className={`inline-block ${className}`}>⟳</span>
);

export const Clock = ({ className }: IconProps) => (
  <span className={`inline-block ${className}`}>🕐</span>
);

export const Calendar = ({ className }: IconProps) => (
  <span className={`inline-block ${className}`}>📅</span>
);

// Business icons
export const Building = ({ className }: IconProps) => (
  <span className={`inline-block ${className}`}>🏢</span>
);

export const Building2 = ({ className }: IconProps) => (
  <span className={`inline-block ${className}`}>🏢</span>
);

export const DollarSign = ({ className }: IconProps) => (
  <span className={`inline-block ${className}`}>💲</span>
);

export const Target = ({ className }: IconProps) => (
  <span className={`inline-block ${className}`}>🎯</span>
);

export const TrendingUp = ({ className }: IconProps) => (
  <span className={`inline-block ${className}`}>📈</span>
);

export const BarChart3 = ({ className }: IconProps) => (
  <span className={`inline-block ${className}`}>📊</span>
);

export const PieChart = ({ className }: IconProps) => (
  <span className={`inline-block ${className}`}>🥧</span>
);

export const Percent = ({ className }: IconProps) => (
  <span className={`inline-block ${className}`}>%</span>
);

export const CreditCard = ({ className }: IconProps) => (
  <span className={`inline-block ${className}`}>💳</span>
);

export const Banknote = ({ className }: IconProps) => (
  <span className={`inline-block ${className}`}>💵</span>
);

export const Receipt = ({ className }: IconProps) => (
  <span className={`inline-block ${className}`}>🧾</span>
);

export const Calculator = ({ className }: IconProps) => (
  <span className={`inline-block ${className}`}>🧮</span>
);

// User and team icons
export const User = ({ className }: IconProps) => (
  <span className={`inline-block ${className}`}>👤</span>
);

export const Users = ({ className }: IconProps) => (
  <span className={`inline-block ${className}`}>👥</span>
);

export const UserPlus = ({ className }: IconProps) => (
  <span className={`inline-block ${className}`}>👤➕</span>
);

export const UserCheck = ({ className }: IconProps) => (
  <span className={`inline-block ${className}`}>👤✓</span>
);

export const Crown = ({ className }: IconProps) => (
  <span className={`inline-block ${className}`}>👑</span>
);

// File and document icons
export const FileText = ({ className }: IconProps) => (
  <span className={`inline-block ${className}`}>📄</span>
);

export const File = ({ className }: IconProps) => (
  <span className={`inline-block ${className}`}>📄</span>
);

export const Files = ({ className }: IconProps) => (
  <span className={`inline-block ${className}`}>📁</span>
);

export const Folder = ({ className }: IconProps) => (
  <span className={`inline-block ${className}`}>📁</span>
);

export const FolderOpen = ({ className }: IconProps) => (
  <span className={`inline-block ${className}`}>📂</span>
);

export const FileSignature = ({ className }: IconProps) => (
  <span className={`inline-block ${className}`}>📝</span>
);

export const FilePlus = ({ className }: IconProps) => (
  <span className={`inline-block ${className}`}>📄+</span>
);

export const PenTool = ({ className }: IconProps) => (
  <span className={`inline-block ${className}`}>✍️</span>
);

export const Trash2 = ({ className }: IconProps) => (
  <span className={`inline-block ${className}`}>🗑️</span>
);

// Network and tech icons
export const Wifi = ({ className }: IconProps) => (
  <span className={`inline-block ${className}`}>📶</span>
);

export const WifiOff = ({ className }: IconProps) => (
  <span className={`inline-block ${className}`}>📵</span>
);

export const Server = ({ className }: IconProps) => (
  <span className={`inline-block ${className}`}>🖥️</span>
);

export const Database = ({ className }: IconProps) => (
  <span className={`inline-block ${className}`}>🗄️</span>
);

export const HardDrive = ({ className }: IconProps) => (
  <span className={`inline-block ${className}`}>💾</span>
);

export const Monitor = ({ className }: IconProps) => (
  <span className={`inline-block ${className}`}>🖥️</span>
);

export const Globe = ({ className }: IconProps) => (
  <span className={`inline-block ${className}`}>🌍</span>
);

export const Link = ({ className }: IconProps) => (
  <span className={`inline-block ${className}`}>🔗</span>
);

// Location icons
export const MapPin = ({ className }: IconProps) => (
  <span className={`inline-block ${className}`}>📍</span>
);

export const Home = ({ className }: IconProps) => (
  <span className={`inline-block ${className}`}>🏠</span>
);

export const Car = ({ className }: IconProps) => (
  <span className={`inline-block ${className}`}>🚗</span>
);

export const Truck = ({ className }: IconProps) => (
  <span className={`inline-block ${className}`}>🚚</span>
);

export const Package = ({ className }: IconProps) => (
  <span className={`inline-block ${className}`}>📦</span>
);

// Settings and controls
export const Settings = ({ className }: IconProps) => (
  <span className={`inline-block ${className}`}>⚙️</span>
);

export const Cog = ({ className }: IconProps) => (
  <span className={`inline-block ${className}`}>⚙️</span>
);

export const Sliders = ({ className }: IconProps) => (
  <span className={`inline-block ${className}`}>🎚️</span>
);

export const ToggleLeft = ({ className }: IconProps) => (
  <span className={`inline-block ${className}`}>⬅️</span>
);

export const ToggleRight = ({ className }: IconProps) => (
  <span className={`inline-block ${className}`}>➡️</span>
);

export const PanelLeft = ({ className }: IconProps) => (
  <span className={`inline-block ${className}`}>⬅</span>
);

export const Maximize = ({ className }: IconProps) => (
  <span className={`inline-block ${className}`}>⤢</span>
);

export const Minimize = ({ className }: IconProps) => (
  <span className={`inline-block ${className}`}>⤥</span>
);

export const FullScreen = ({ className }: IconProps) => (
  <span className={`inline-block ${className}`}>⛶</span>
);

// Media and communication
export const Mail = ({ className }: IconProps) => (
  <span className={`inline-block ${className}`}>✉️</span>
);

export const Phone = ({ className }: IconProps) => (
  <span className={`inline-block ${className}`}>📞</span>
);

export const MessageSquare = ({ className }: IconProps) => (
  <span className={`inline-block ${className}`}>💬</span>
);

export const Bell = ({ className }: IconProps) => (
  <span className={`inline-block ${className}`}>🔔</span>
);

export const BellOff = ({ className }: IconProps) => (
  <span className={`inline-block ${className}`}>🔕</span>
);

export const Volume2 = ({ className }: IconProps) => (
  <span className={`inline-block ${className}`}>🔊</span>
);

export const VolumeX = ({ className }: IconProps) => (
  <span className={`inline-block ${className}`}>🔇</span>
);

export const Play = ({ className }: IconProps) => (
  <span className={`inline-block ${className}`}>▶️</span>
);

export const Pause = ({ className }: IconProps) => (
  <span className={`inline-block ${className}`}>⏸️</span>
);

export const Square = ({ className }: IconProps) => (
  <span className={`inline-block ${className}`}>⏹️</span>
);

// Security icons
export const Lock = ({ className }: IconProps) => (
  <span className={`inline-block ${className}`}>🔒</span>
);

export const Unlock = ({ className }: IconProps) => (
  <span className={`inline-block ${className}`}>🔓</span>
);

export const Key = ({ className }: IconProps) => (
  <span className={`inline-block ${className}`}>🔑</span>
);

export const Shield = ({ className }: IconProps) => (
  <span className={`inline-block ${className}`}>🛡️</span>
);

export const ShieldCheck = ({ className }: IconProps) => (
  <span className={`inline-block ${className}`}>🛡️✓</span>
);

export const Eye = ({ className }: IconProps) => (
  <span className={`inline-block ${className}`}>👁️</span>
);

export const EyeOff = ({ className }: IconProps) => (
  <span className={`inline-block ${className}`}>🙈</span>
);

// Tools and utilities
export const Wrench = ({ className }: IconProps) => (
  <span className={`inline-block ${className}`}>🔧</span>
);

export const Hammer = ({ className }: IconProps) => (
  <span className={`inline-block ${className}`}>🔨</span>
);

export const Scissors = ({ className }: IconProps) => (
  <span className={`inline-block ${className}`}>✂️</span>
);

export const Paintbrush = ({ className }: IconProps) => (
  <span className={`inline-block ${className}`}>🖌️</span>
);

export const Palette = ({ className }: IconProps) => (
  <span className={`inline-block ${className}`}>🎨</span>
);

export const Zap = ({ className }: IconProps) => (
  <span className={`inline-block ${className}`}>⚡</span>
);

export const Lightbulb = ({ className }: IconProps) => (
  <span className={`inline-block ${className}`}>💡</span>
);

export const Flame = ({ className }: IconProps) => (
  <span className={`inline-block ${className}`}>🔥</span>
);

export const Star = ({ className }: IconProps) => (
  <span className={`inline-block ${className}`}>⭐</span>
);

export const Heart = ({ className }: IconProps) => (
  <span className={`inline-block ${className}`}>❤️</span>
);

export const ThumbsUp = ({ className }: IconProps) => (
  <span className={`inline-block ${className}`}>👍</span>
);

export const ThumbsDown = ({ className }: IconProps) => (
  <span className={`inline-block ${className}`}>👎</span>
);

export const Award = ({ className }: IconProps) => (
  <span className={`inline-block ${className}`}>🏆</span>
);

export const Gift = ({ className }: IconProps) => (
  <span className={`inline-block ${className}`}>🎁</span>
);

export const Tag = ({ className }: IconProps) => (
  <span className={`inline-block ${className}`}>🏷️</span>
);

export const Bookmark = ({ className }: IconProps) => (
  <span className={`inline-block ${className}`}>🔖</span>
);

export const Flag = ({ className }: IconProps) => (
  <span className={`inline-block ${className}`}>🚩</span>
);