import { IAutomaticReply } from "../page/post/posts";
import { ActionType, ItemType, MediaProductType, MediaType, StatusReplied } from "./enum";

///___Direct___/// بخش پیام‌های مستقیم اینستاگرام

// ساختار اصلی صندوق ورودی پیام‌های مستقیم
export interface IInbox {
  threads: IThread[]; // لیست گفتگوها
  ownerInbox: IOwnerInbox; // اطلاعات صاحب حساب
  nextMaxId: string; // شناسه برای بارگذاری صفحه بعدی
}
// اطلاعات کاربر در یک گفتگو
export interface IUserThread {
  username: string; // نام کاربری
  fullName: string; // نام کامل
  pk: number; // کلید اصلی کاربر
  profileUrl: string; // URL تصویر پروفایل
  lastSeenUnix: number; // زمان آخرین بازدید (Unix timestamp)
}
// اطلاعات صاحب صندوق ورودی (حساب فعلی)
export interface IOwnerInbox {
  userId: string; // شناسه کاربر
  name: string | null; // نام نمایشی
  profilePic: string; // URL تصویر پروفایل
  followerCount: number; // تعداد دنبال‌کنندگان
  followsCount: number; // تعداد دنبال شده‌ها
  mediaCount: number; // تعداد پست‌ها
  accountType: number; // نوع حساب (شخصی/کسب‌وکار)
  igId: string | null; // شناسه اینستاگرام
  username: string; // نام کاربری
}
// اطلاعات پیام در حال ارسال (برای نمایش موقت قبل از تایید سرور)
export interface IIsSendingMessage {
  message: string; // متن پیام
  threadId: string; // شناسه گفتگو
  itemType: ItemType; // نوع پیام (متن/تصویر/ویدیو و...)
  mediaType?: MediaType; // نوع رسانه (در صورت وجود)
  igId: string; // شناسه اینستاگرام
  file: File; // فایل ضمیمه
  imageBase64?: string; // تصویر به صورت base64 (برای پیش‌نمایش)
  imageUrl?: string; // URL تصویر
}
// ساختار یک گفتگو (Thread) شامل تمام پیام‌ها و اطلاعات مربوطه
export interface IThread {
  items: IItem[]; // لیست پیام‌های این گفتگو
  recp: IRecp; // اطلاعات گیرنده پیام
  graphThreadId: string; // شناسه گراف گفتگو
  nextMaxId: string | null; // شناسه برای بارگذاری پیام‌های قدیمی‌تر
  nextMinId: string | null; // شناسه برای بارگذاری پیام‌های جدیدتر
  threadId: string; // شناسه یکتای گفتگو
  ownerLastSeenUnix: number; // زمان آخرین بازدید صاحب حساب
  recpLastSeenUnix: number; // زمان آخرین بازدید گیرنده
  onCurrentSnapShot: boolean; // وضعیت به‌روزبودن گفتگو
  categoryId: number; // دسته‌بندی گفتگو (اصلی/درخواست/آرشیو)
  lastUpdate: number; // زمان آخرین به‌روزرسانی
  isPin: boolean; // آیا گفتگو سنجاق شده است
  isActive: boolean; // آیا گفتگو فعال است
}

// ساختار یک پیام منفرد - اصلی‌ترین واحد داده در سیستم پیام‌رسانی
export interface IItem {
  repliedToItemId: string | null; // شناسه پیامی که به آن پاسخ داده شده
  repliedToItem: IItem | null; // محتوای کامل پیام پاسخ داده شده
  itemType: ItemType; // نوع پیام (متن/رسانه/صوت/استوری و...)
  createdTime: number; // زمان ایجاد پیام (Unix timestamp در نانوثانیه)
  userId: string; // شناسه کاربر فرستنده
  itemId: string; // شناسه یکتای پیام
  graphItemId: string; // شناسه گراف پیام
  text: string; // متن پیام
  replyStory: ReplyStory | null; // اطلاعات پاسخ به استوری (اگر این پیام پاسخ به استوری باشد)
  mediaShares: MediaShare[]; // لیست رسانه‌های اشتراک گذاشته شده (پست‌های فوروارد شده)
  medias: Media[]; // لیست رسانه‌های ارسالی مستقیم (عکس/ویدیو)
  clientContext: null; // متن برای استفاده کلاینت
  audio: MediaShare | null; // فایل صوتی (ویس)
  audioUrl?: { url: string; externalUrl: string } | null; // URL صوت
  isUnsupporeted: boolean; // آیا نوع پیام پشتیبانی نمی‌شود
  recpEmojiReaction: null | string; // واکنش ایموجی گیرنده به پیام
  ownerEmojiReaction: null | string; // واکنش ایموجی صاحب حساب به پیام
  buttons: null; // دکمه‌های تعاملی (برای آینده)
  payloadId: null | string; // شناسه payload
  storyMention: IStoryMention | null; // اطلاعات منشن در استوری (اگر کسی شما را در استوری منشن کرده)
  sentByOwner: boolean; // آیا توسط صاحب حساب ارسال شده
}
// اطلاعات منشن در استوری (وقتی کسی شما را در استوری منشن می‌کند)
export interface IStoryMention {
  height: number; // ارتفاع رسانه استوری
  width: number; // عرض رسانه استوری
  isSticker: boolean; // آیا به صورت استیکر است
  maxHeight: number; // حداکثر ارتفاع
  maxWidth: number; // حداکثر عرض
  previewUrl: MediaShare; // URL پیش‌نمایش استوری
  url: MediaShare; // URL کامل استوری
}
// ساختار عمومی برای اشتراک‌گذاری رسانه (عکس/ویدیو/صوت)
export interface MediaShare {
  id: string; // شناسه رسانه
  url: string; // مسیر نسبی فایل در سرور
  externalUrl: string; // URL کامل خارجی
  title: string | null; // عنوان رسانه (در صورت وجود)
}
// کانتینر رسانه - می‌تواند عکس یا ویدیو باشد
export interface Media {
  image: IImage | null; // اطلاعات تصویر (در صورت وجود)
  video: IImage | null; // اطلاعات ویدیو (در صورت وجود)
}
// اطلاعات تصویر یا ویدیو
export interface IImage {
  previewUrl: MediaShare; // URL پیش‌نمایش (تصویر کوچک)
  url: MediaShare; // URL اصلی فایل
  height: number; // ارتفاع واقعی
  width: number; // عرض واقعی
  maxHeight: number; // حداکثر ارتفاع قابل نمایش
  maxWidth: number; // حداکثر عرض قابل نمایش
  isSticker: boolean; // آیا به عنوان استیکر است
}
// اطلاعات پاسخ به استوری (وقتی به استوری کسی پاسخ می‌دهید)
export interface ReplyStory {
  directStoryItemType: number; // نوع آیتم استوری
  link: string; // لینک استوری
  fbId: string; // شناسه فیسبوک
  externalUrl: string; // URL خارجی برای مشاهده استوری
}
// اطلاعات گیرنده پیام (مخاطب در گفتگو)
export interface IRecp {
  name: string | null; // نام نمایشی
  profilePic: string; // URL تصویر پروفایل
  followerCount: number; // تعداد دنبال‌کنندگان
  isFollower: boolean; // آیا این کاربر شما را دنبال می‌کند
  isFollowing: boolean; // آیا شما این کاربر را دنبال می‌کنید
  igId: string; // شناسه اینستاگرام
  username?: string; // نام کاربری
}
// ساختار نمایش پیام‌ها در UI
export interface IShowMessage {
  chats: IItem[]; // لیست پیام‌ها
  username: string; // نام کاربری مخاطب
  profileUrl: string; // URL پروفایل مخاطب
}

// اطلاعات ارسال تصویر
export interface ISendImage {
  imageBase64: string; // تصویر به صورت base64
  imageUrl: string; // URL تصویر
  imageName: string; // نام فایل
  imageSize: number; // حجم فایل (بایت)
  width: number; // عرض تصویر
  height: number; // ارتفاع تصویر
}

// اطلاعات ارسال ویدیو
export interface ISendVideo {
  videoBase64: string; // ویدیو به صورت base64
  videoUrl: string; // URL ویدیو
  videoName: string; // نام فایل
  videoSize: number; // حجم فایل (بایت)
  width: number; // عرض ویدیو
  height: number; // ارتفاع ویدیو
  length: number; // مدت زمان ویدیو (میلی‌ثانیه)
}
// ساختار پیام دریافتی از SignalR Hook (به‌روزرسانی realtime از سرور)
export interface IHookItem {
  OwnerId: string; // شناسه صاحب حساب
  RecpId: string; // شناسه گیرنده
  ThreadId: string; // شناسه گفتگو
  SentByOwner: boolean; // آیا توسط صاحب حساب ارسال شده
  DirectItem: IHookDirectItem | null; // پیام جدید (در صورت وجود)
  Reaction: IHookReact | null; // واکنش به پیام (در صورت وجود)
  Read: IHookRead | null; // اطلاعات خوانده شدن (در صورت وجود)
  PostBack: null; // برگشت پست (برای آینده)
  MessageEdit: { ItemId: string; Text: string } | null; // ویرایش پیام (در صورت وجود)
}
// اطلاعات خوانده شدن پیام (از طریق SignalR)
export interface IHookRead {
  TimeUnix: number; // زمان خوانده شدن
  ItemId: string; // شناسه پیام
  GraphItemId: string; // شناسه گراف پیام
  SentByOwner: boolean; // آیا توسط صاحب حساب ارسال شده بود
  ThreadId: string; // شناسه گفتگو
  RecpId: string | null; // شناسه گیرنده
}
// ساختار رسانه در Hook (با نام‌گذاری PascalCase برای سازگاری با C# backend)
export interface IHookMediaShare {
  Id: string; // شناسه رسانه
  Url: string; // مسیر نسبی
  ExternalUrl: string; // URL کامل
  Title: string | null; // عنوان
}

// منشن استوری در Hook
export interface IStoryMention {
  Height: number; // ارتفاع
  Width: number; // عرض
  IsSticker: boolean; // استیکر؟
  MaxHeight: number; // حداکثر ارتفاع
  MaxWidth: number; // حداکثر عرض
  PreviewUrl: IHookMediaShare; // پیش‌نمایش
  Url: IHookMediaShare; // URL اصلی
}

// کانتینر رسانه در Hook
export interface IHookMedia {
  Image: IHookSubMedia | null; // تصویر
  Video: IHookSubMedia | null; // ویدیو
}

// زیر رسانه (تصویر یا ویدیو) در Hook
export interface IHookSubMedia {
  Height: number; // ارتفاع
  Width: number; // عرض
  MaxHeight: number; // حداکثر ارتفاع
  MaxWidth: number; // حداکثر عرض
  IsSticker: boolean; // استیکر؟
  PreviewUrl: IHookMediaShare; // پیش‌نمایش
  Url: IHookMediaShare; // URL اصلی
}
// واکنش به پیام از طریق Hook
export interface IHookReact {
  Emoji: string; // ایموجی واکنش
  Reaction: string; // نوع واکنش
  SentByOwner: boolean; // توسط صاحب حساب؟
  UserId: string; // شناسه کاربر
  Action: string; // عملیات (افزودن/حذف)
  ThreadId: string; // شناسه گفتگو
  GraphItemId: string; // شناسه گراف
  ItemId: string; // شناسه پیام
}
// پیام مستقیم دریافتی از Hook (نسخه realtime از IItem)
export interface IHookDirectItem {
  ItemType: ItemType; // نوع پیام
  CreatedTime: number; // زمان ایجاد
  UserId: string; // شناسه فرستنده
  ItemId: string; // شناسه پیام
  GraphItemId: string; // شناسه گراف
  Text: string; // متن پیام
  ReplyStory: null; // پاسخ به استوری
  MediaShares: IHookMediaShare[]; // رسانه‌های اشتراک گذاشته شده
  Medias: IHookMedia[]; // رسانه‌های مستقیم
  ClientContext: null; // متن کلاینت
  Audio: IHookMediaShare | null; // صوت
  IsUnsupporeted: boolean; // پشتیبانی نمی‌شود؟
  RecpEmojiReaction: null; // واکنش گیرنده
  OwnerEmojiReaction: null; // واکنش صاحب حساب
  PayloadId: string | null; // شناسه payload
  SentByOwner: boolean; // توسط صاحب حساب ارسال شده؟
  GenericTemplate: null; // قالب عمومی
  StoryMention: IStoryMention | null; // منشن استوری
  File: null; // فایل
  RepliedToItemId: string | null; // شناسه پیام پاسخ داده شده
  IsDeleted: boolean; // حذف شده؟
  ThreadId: string; // شناسه گفتگو
}
// ساختار پایه برای ارسال پیام (شامل اطلاعات ناوبری)
interface INavOrder {
  threadId: string; // شناسه گفتگو
  clientContext: string; // متن کلاینت (برای tracking)
}

// درخواست آپلود تصویر
export interface IUploadImage extends INavOrder {
  imageBase64: string; // تصویر base64
  width: number; // عرض
  height: number; // ارتفاع
}

// درخواست آپلود ویدیو
export interface IUploadVideo extends INavOrder {
  videoBase64: string; // ویدیو base64
  width: number; // عرض
  height: number; // ارتفاع
  lengthInMs: number; // مدت زمان (میلی‌ثانیه)
}

// درخواست آپلود صدا (ویس)
export interface IUploadVoice extends INavOrder {
  voiceBase64: string | ArrayBuffer | null; // صدا base64
  waveformSamplingFrequencyHz: number; // فرکانس نمونه‌برداری
  durationInMs: number; // مدت زمان
  waveFormData: number[]; // داده‌های موج صوتی
  isWave: boolean; // فرمت WAV؟
  file: File; // فایل اصلی
}

// درخواست دریافت پیام‌های یک گفتگو
export interface IGetDirectInboxItems {
  threadId: string; // شناسه گفتگو
  oldCursor: string | null; // کرسر برای صفحه‌بندی
}

// درخواست دریافت لیست گفتگوها
export interface IGetDirectInbox {
  categoryId: number; // دسته‌بندی (0=اصلی, 1=عمومی, 2=درخواست)
  oldCursor: string | null; // کرسر برای صفحه‌بندی
  searchTerm: string | null; // عبارت جستجو
}
///___Ticket___/// بخش تیکت‌های پشتیبانی

// صندوق ورودی تیکت‌ها
export interface ITicketInbox {
  threads: IThread_Ticket[]; // لیست تیکت‌ها
  ownerInbox: IOwnerInbox; // اطلاعات صاحب حساب
  nextMaxId: string; // کرسر صفحه بعدی
}
// اطلاعات درخواست تیکت‌های فیسبوک
export interface IFbTicketInfo {
  oldCursor: string | null; // کرسر صفحه قبلی
  searchTerm: string | null; // عبارت جستجو
  isHidden: boolean; // نمایش تیکت‌های مخفی؟
}

// گفتگوی تیکت (وراثت از IThread با فیلدهای اضافی)
export interface IThread_Ticket extends IThread {
  createdTime: number; // زمان ایجاد تیکت
  subject: string; // موضوع تیکت
  ticketId: number; // شناسه تیکت
  actionTime: number; // زمان آخرین اقدام
  status: StatusReplied; // وضعیت پاسخ
  nullItems: string[] | null; // آیتم‌های null
  isHide: boolean; // مخفی شده؟
  isSatisfied: boolean | null; // رضایت کاربر؟
  lastSeenTicketUnix: number; // زمان آخرین بازدید تیکت
}

// رسانه در پاسخ تیکت (نسخه کلاینت - شامل base64)
export interface IReplyTicket_Media extends IReplyTicket_Media_Server {
  mediaBase64: string | null; // رسانه به صورت base64
}

// رسانه در پاسخ تیکت (نسخه سرور)
export interface IReplyTicket_Media_Server {
  text: string | null; // متن همراه رسانه
  itemType: ItemType; // نوع آیتم
  mediaType: MediaType | null; // نوع رسانه
  mediaId: string | null; // شناسه رسانه
}

// درخواست پاسخ به تیکت
export interface IReplyTicket {
  ticketId: number; // شناسه تیکت
  medias: IReplyTicket_Media[]; // لیست رسانه‌ها
}
// ___comment___// بخش نظرات اینستاگرام

// صندوق ورودی نظرات
export interface ICommetInbox {
  oldestCursor: string; // کرسر قدیمی‌ترین نظر
  hasOlder: boolean; // نظرات قدیمی‌تر وجود دارد؟
  medias: IMedia[]; // لیست پست‌ها (رسانه‌ها) که نظر دارند
  ownerInbox: IOwnerInbox; // اطلاعات صاحب حساب
}

// اطلاعات یک پست (رسانه) که نظر دارد
export interface IMedia {
  comments: IComment[]; // لیست نظرات
  users: IUser[]; // لیست کاربران
  productType: MediaProductType; // نوع محصول (پست/استوری/ریلز)
  lastCommentUnix: number; // زمان آخرین نظر
  lastSeenUnix: number; // زمان آخرین بازدید
  mediaId: string; // شناسه پست
  ownerId: string; // شناسه صاحب پست
  isPin: boolean; // سنجاق شده؟
  nextMaxId: null | string; // کرسر صفحه بعدی
  hasOlder: boolean; // نظرات قدیمی‌تر وجود دارد؟
  participantCount: number; // تعداد شرکت‌کنندگان
  unAnsweredCount: number; // تعداد نظرات پاسخ داده نشده
  vanishMode: boolean; // حالت ناپدید شونده؟
  sign: string; // امضای دیجیتال
  signTime: number; // زمان امضا
  commentCount: number; // تعداد کل نظرات
  unSeenCount: number; // تعداد نظرات دیده نشده
  newCommentCount: number; // تعداد نظرات جدید
  thumbnailMediaUrl: string | null; // URL تصویر کوچک پست
  tempId: number | null; // شناسه موقت
  postId: number | null; // شناسه پست در دیتابیس
  commentEnabled: boolean; // نظرات فعال است؟
  automaticCommentReply: IAutomaticReply | null; // پاسخ خودکار به نظرات
}

// ساختار یک نظر اینستاگرام
export interface IComment {
  replys: IComment[] | null; // لیست پاسخ‌ها به این نظر
  id: string; // شناسه نظر
  mediaId: string; // شناسه پست
  threadId: null | string; // شناسه thread (در صورت پاسخ خصوصی)
  sentByOwner: boolean; // توسط صاحب پست ارسال شده؟
  isDeleted: boolean; // حذف شده؟
  createdTime: number; // زمان ایجاد
  username: string; // نام کاربری نظردهنده
  fullName: string | null; // نام کامل نظردهنده
  isIgnored: boolean; // نادیده گرفته شده؟
  isAnswered: boolean; // پاسخ داده شده؟
  text: string; // متن نظر
  parentId: null | string; // شناسه نظر والد (اگر این یک پاسخ است)
  isHide: boolean; // مخفی شده؟
  likeCount: number; // تعداد لایک‌ها
  profileUrl: string; // URL پروفایل نظردهنده
  sign: string; // امضای دیجیتال
  signTime: number; // زمان امضا
  privateReply: IItem | null; // پاسخ خصوصی (در دایرکت)
}

// اطلاعات خلاصه کاربر
export interface IUser {
  username: string; // نام کاربری
  profileUrl: string; // URL پروفایل
}

// درخواست دریافت اطلاعات صندوق نظرات
export interface IGetCommentBoxInfo {
  nextMaxId: string | null; // کرسر صفحه بعدی
  searchTerm: string | null; // عبارت جستجو
  productType: MediaProductType; // نوع محصول
}

// درخواست دریافت نظرات یک پست خاص
export interface IGetMediaCommentInfo {
  mediaId: string; // شناسه پست
  searchInReplys: boolean; // جستجو در پاسخ‌ها؟
  justUnAnswered: boolean; // فقط پاسخ داده نشده‌ها؟
  searchTerm: string | null; // عبارت جستجو
  nextMaxId: string | null; // کرسر صفحه بعدی
}

// نظر دریافتی از Hook (realtime)
export interface IHookComment {
  IgId: string; // شناسه اینستاگرام
  Username: string; // نام کاربری
  MediaId: string; // شناسه پست
  MediaType: number; // نوع رسانه
  CommentId: string; // شناسه نظر
  Text: string; // متن نظر
  ParrentId: string | null; // شناسه نظر والد
  OwnerId: string; // شناسه صاحب پست
  IsLive: boolean; // لایو است؟
  SentByOwner: boolean; // توسط صاحب ارسال شده؟
  CreatedTime: number; // زمان ایجاد
  ProfileUrl: string; // URL پروفایل
  ThreadId: string; // شناسه thread
  Sign: string; // امضا
  SignTime: number; // زمان امضا
}

// اطلاعات پاسخ به نظر
export interface IReplyCommentInfo extends IActionCommentInfo {
  text: string; // متن پاسخ
  private: boolean; // پاسخ خصوصی؟
}

// اطلاعات پاسخ به نظر لایو
export interface IReplyLiveCommentInfo extends IActionCommentInfo {
  text: string; // متن پاسخ
  private: boolean; // پاسخ خصوصی؟
  sign: string; // امضا
  signTime: number; // زمان امضا
  lastCommentId: string; // شناسه آخرین نظر
  lastSign: string; // امضای آخرین نظر
  lastSignTime: number; // زمان امضای آخرین نظر
  lastCreatedTime: number; // زمان ایجاد آخرین نظر
}

// اطلاعات پایه برای اقدام روی نظر
export interface IActionCommentInfo {
  commentId: string; // شناسه نظر
  mediaId: string; // شناسه پست
  sign: string; // امضا
  signTime: number; // زمان امضا
  createdTime: number; // زمان ایجاد
}

// اقدام روی نظر از Hook
export interface IHookAction {
  ActionType: ActionType; // نوع اقدام (لایک/حذف/پین)
  CreatedTime: number; // زمان ایجاد
  FbId: string; // شناسه فیسبوک
  MediaId: string; // شناسه پست
  CommentId: string; // شناسه نظر
}

// پاسخ خصوصی به نظر از Hook
export interface IHookPrivateReply {
  OwnerId: string; // شناسه صاحب
  ParentCommentId: string; // شناسه نظر والد
  MediaId: string; // شناسه پست
  ItemId: string; // شناسه آیتم
  Text: string; // متن پاسخ
  IsLive: boolean; // لایو است؟
}
