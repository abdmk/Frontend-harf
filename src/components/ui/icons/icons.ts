// أيقونات حرف من lucide-react (كما في shadcn) — نفس الأسماء في كل الموقع، وكل أيقونة تصدير مستقلّ
// فلا يدخل الحزمة إلا ما يُستعمل. أضف هنا: الاسم ← أيقونة lucide، وfillable للأشكال المغلقة.
import {
  ArrowDown as LucideArrowDown,
  ArrowLeft as LucideArrowLeft,
  ArrowRight as LucideArrowRight,
  ArrowUp as LucideArrowUp,
  ArrowUpDown as LucideArrowUpDown,
  Ban as LucideBan,
  Bell as LucideBell,
  Bookmark as LucideBookmark,
  Building2 as LucideBuilding2,
  Calendar as LucideCalendar,
  ChartColumn as LucideChartColumn,
  ChartNoAxesColumn as LucideChartNoAxesColumn,
  Check as LucideCheck,
  ChevronDown as LucideChevronDown,
  ChevronLeft as LucideChevronLeft,
  ChevronRight as LucideChevronRight,
  CircleAlert as LucideCircleAlert,
  CircleHelp as LucideCircleHelp,
  Clock as LucideClock,
  CloudUpload as LucideCloudUpload,
  Copy as LucideCopy,
  CreditCard as LucideCreditCard,
  Crown as LucideCrown,
  DollarSign as LucideDollarSign,
  Download as LucideDownload,
  Ellipsis as LucideEllipsis,
  Eye as LucideEye,
  EyeOff as LucideEyeOff,
  FileSignature as LucideFileSignature,
  FileText as LucideFileText,
  Fingerprint as LucideFingerprint,
  Flame as LucideFlame,
  Folder as LucideFolder,
  Gem as LucideGem,
  Gift as LucideGift,
  Globe as LucideGlobe,
  Grid3x3 as LucideGrid3x3,
  Heart as LucideHeart,
  History as LucideHistory,
  House as LucideHouse,
  Image as LucideImage,
  Info as LucideInfo,
  Landmark as LucideLandmark,
  Laptop as LucideLaptop,
  Layers as LucideLayers,
  LayoutGrid as LucideLayoutGrid,
  Link as LucideLink,
  List as LucideList,
  Lock as LucideLock,
  LogIn as LucideLogIn,
  LogOut as LucideLogOut,
  Mail as LucideMail,
  MapPin as LucideMapPin,
  Maximize as LucideMaximize,
  Minus as LucideMinus,
  Monitor as LucideMonitor,
  Moon as LucideMoon,
  Pencil as LucidePencil,
  Play as LucidePlay,
  Plus as LucidePlus,
  Receipt as LucideReceipt,
  RefreshCw as LucideRefreshCw,
  Search as LucideSearch,
  Share2 as LucideShare2,
  ShieldCheck as LucideShieldCheck,
  ShoppingCart as LucideShoppingCart,
  Signal as LucideSignal,
  SlidersHorizontal as LucideSlidersHorizontal,
  Smartphone as LucideSmartphone,
  Star as LucideStar,
  Sun as LucideSun,
  TextAlignCenter as LucideTextAlignCenter,
  TextAlignEnd as LucideTextAlignEnd,
  TextAlignJustify as LucideTextAlignJustify,
  TextAlignStart as LucideTextAlignStart,
  Trash2 as LucideTrash2,
  Type as LucideType,
  Upload as LucideUpload,
  User as LucideUser,
  WandSparkles as LucideWandSparkles,
  X as LucideX,
} from 'lucide-react';

import { createIcon } from './create-icon';

export const UserIcon = /*#__PURE__*/ createIcon(LucideUser, 'user', { fillable: true });
export const FolderIcon = /*#__PURE__*/ createIcon(LucideFolder, 'folder', { fillable: true });
export const HeartIcon = /*#__PURE__*/ createIcon(LucideHeart, 'heart', { fillable: true });
export const HeartFilledIcon = /*#__PURE__*/ createIcon(LucideHeart, 'heart-filled', { solid: true });
export const ReceiptIcon = /*#__PURE__*/ createIcon(LucideReceipt, 'receipt');
export const UsageIcon = /*#__PURE__*/ createIcon(LucideSignal, 'usage');
export const CrownIcon = /*#__PURE__*/ createIcon(LucideCrown, 'crown', { fillable: true });
export const AppsIcon = /*#__PURE__*/ createIcon(LucideLayoutGrid, 'apps');
export const SlidersIcon = /*#__PURE__*/ createIcon(LucideSlidersHorizontal, 'sliders');
export const LockIcon = /*#__PURE__*/ createIcon(LucideLock, 'lock');
export const HelpIcon = /*#__PURE__*/ createIcon(LucideCircleHelp, 'help');
export const SignOutIcon = /*#__PURE__*/ createIcon(LucideLogOut, 'sign-out');
export const LayersIcon = /*#__PURE__*/ createIcon(LucideLayers, 'layers');
export const CloudUploadIcon = /*#__PURE__*/ createIcon(LucideCloudUpload, 'cloud-upload');
export const LinkIcon = /*#__PURE__*/ createIcon(LucideLink, 'link');
export const InfoIcon = /*#__PURE__*/ createIcon(LucideInfo, 'info');
export const TrashIcon = /*#__PURE__*/ createIcon(LucideTrash2, 'trash');
export const CrossIcon = /*#__PURE__*/ createIcon(LucideX, 'cross');
export const CrossSmallIcon = /*#__PURE__*/ createIcon(LucideX, 'cross-small');
export const CheckIcon = /*#__PURE__*/ createIcon(LucideCheck, 'check');
export const SearchIcon = /*#__PURE__*/ createIcon(LucideSearch, 'search');
export const FlameIcon = /*#__PURE__*/ createIcon(LucideFlame, 'flame', { fillable: true });
export const TimePastIcon = /*#__PURE__*/ createIcon(LucideHistory, 'time-past');
export const ClockIcon = /*#__PURE__*/ createIcon(LucideClock, 'clock');
export const DownloadIcon = /*#__PURE__*/ createIcon(LucideDownload, 'download');
export const CartIcon = /*#__PURE__*/ createIcon(LucideShoppingCart, 'cart');
export const BellIcon = /*#__PURE__*/ createIcon(LucideBell, 'bell', { fillable: true });
export const MoonIcon = /*#__PURE__*/ createIcon(LucideMoon, 'moon');
export const SunIcon = /*#__PURE__*/ createIcon(LucideSun, 'sun');
export const ChevronDownIcon = /*#__PURE__*/ createIcon(LucideChevronDown, 'chevron-down');
export const ChevronLeftIcon = /*#__PURE__*/ createIcon(LucideChevronLeft, 'chevron-left');
export const ChevronRightIcon = /*#__PURE__*/ createIcon(LucideChevronRight, 'chevron-right');
export const ExpandIcon = /*#__PURE__*/ createIcon(LucideMaximize, 'expand');
export const CopyIcon = /*#__PURE__*/ createIcon(LucideCopy, 'copy');
export const RefreshIcon = /*#__PURE__*/ createIcon(LucideRefreshCw, 'refresh');
export const TextIcon = /*#__PURE__*/ createIcon(LucideType, 'text');
export const AlignLeftIcon = /*#__PURE__*/ createIcon(LucideTextAlignStart, 'align-left');
export const AlignRightIcon = /*#__PURE__*/ createIcon(LucideTextAlignEnd, 'align-right');
export const AlignCenterIcon = /*#__PURE__*/ createIcon(LucideTextAlignCenter, 'align-center');
export const AlignJustifyIcon = /*#__PURE__*/ createIcon(LucideTextAlignJustify, 'align-justify');
export const InterliningIcon = /*#__PURE__*/ createIcon(LucideArrowUpDown, 'interlining');
export const StarIcon = /*#__PURE__*/ createIcon(LucideStar, 'star', { fillable: true });
export const GemIcon = /*#__PURE__*/ createIcon(LucideGem, 'gem', { fillable: true });
export const ChartHistogramIcon = /*#__PURE__*/ createIcon(LucideChartColumn, 'chart-histogram');
export const ExclamationIcon = /*#__PURE__*/ createIcon(LucideCircleAlert, 'exclamation');
export const BanIcon = /*#__PURE__*/ createIcon(LucideBan, 'ban');
export const PlusIcon = /*#__PURE__*/ createIcon(LucidePlus, 'plus');
export const MinusIcon = /*#__PURE__*/ createIcon(LucideMinus, 'minus');
export const MailIcon = /*#__PURE__*/ createIcon(LucideMail, 'mail');
export const EyeIcon = /*#__PURE__*/ createIcon(LucideEye, 'eye');
export const EyeOffIcon = /*#__PURE__*/ createIcon(LucideEyeOff, 'eye-off');
export const CreditCardIcon = /*#__PURE__*/ createIcon(LucideCreditCard, 'credit-card');
export const ShieldCheckIcon = /*#__PURE__*/ createIcon(LucideShieldCheck, 'shield-check');
export const ArrowLeftIcon = /*#__PURE__*/ createIcon(LucideArrowLeft, 'arrow-left');
export const ArrowRightIcon = /*#__PURE__*/ createIcon(LucideArrowRight, 'arrow-right');
export const ArrowUpIcon = /*#__PURE__*/ createIcon(LucideArrowUp, 'arrow-up');
export const ArrowDownIcon = /*#__PURE__*/ createIcon(LucideArrowDown, 'arrow-down');
export const HomeIcon = /*#__PURE__*/ createIcon(LucideHouse, 'home');
export const DollarIcon = /*#__PURE__*/ createIcon(LucideDollarSign, 'dollar');
export const StatsIcon = /*#__PURE__*/ createIcon(LucideChartNoAxesColumn, 'stats');
export const CalendarIcon = /*#__PURE__*/ createIcon(LucideCalendar, 'calendar');
export const DocumentIcon = /*#__PURE__*/ createIcon(LucideFileText, 'document');
export const PencilIcon = /*#__PURE__*/ createIcon(LucidePencil, 'pencil');
export const GlobeIcon = /*#__PURE__*/ createIcon(LucideGlobe, 'globe');
export const BankIcon = /*#__PURE__*/ createIcon(LucideLandmark, 'bank');
export const MagicWandIcon = /*#__PURE__*/ createIcon(LucideWandSparkles, 'magic-wand');
export const UploadIcon = /*#__PURE__*/ createIcon(LucideUpload, 'upload');
export const PictureIcon = /*#__PURE__*/ createIcon(LucideImage, 'picture');
export const PlayIcon = /*#__PURE__*/ createIcon(LucidePlay, 'play');
export const ShareIcon = /*#__PURE__*/ createIcon(LucideShare2, 'share');
export const BookmarkIcon = /*#__PURE__*/ createIcon(LucideBookmark, 'bookmark', { fillable: true });
export const ListIcon = /*#__PURE__*/ createIcon(LucideList, 'list');
export const GridIcon = /*#__PURE__*/ createIcon(LucideGrid3x3, 'grid');
export const DocumentSignedIcon = /*#__PURE__*/ createIcon(LucideFileSignature, 'document-signed');
export const FingerprintIcon = /*#__PURE__*/ createIcon(LucideFingerprint, 'fingerprint');
export const LaptopIcon = /*#__PURE__*/ createIcon(LucideLaptop, 'laptop');
export const SignInIcon = /*#__PURE__*/ createIcon(LucideLogIn, 'sign-in');
export const GiftIcon = /*#__PURE__*/ createIcon(LucideGift, 'gift');
export const BuildingIcon = /*#__PURE__*/ createIcon(LucideBuilding2, 'building');
export const DiamondIcon = /*#__PURE__*/ createIcon(LucideGem, 'diamond', { fillable: true });
export const ComputerIcon = /*#__PURE__*/ createIcon(LucideMonitor, 'computer');
export const MapPinIcon = /*#__PURE__*/ createIcon(LucideMapPin, 'map-pin');
export const MobileIcon = /*#__PURE__*/ createIcon(LucideSmartphone, 'mobile');
export const MenuDotsIcon = /*#__PURE__*/ createIcon(LucideEllipsis, 'menu-dots');
