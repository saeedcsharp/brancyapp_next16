import Link from "next/link";
import SeoJsonLd from "brancy/components/website/SeoJsonLd";
import styles from "./TopicPage.module.css";

type Locale = "en" | "fa" | "ar" | "fr" | "ru" | "tr" | "gr" | "az";
type Topic = "management" | "automation" | "analytics" | "marketing" | "ai";

type TopicCopy = {
  title: string;
  description: string;
  intro: string;
  benefits: string[];
  questions: [string, string][];
};

const copy: Partial<Record<Locale, Record<Topic, TopicCopy>>> = {
  en: {
    management: {
      title: "Instagram Management Software",
      description: "A practical guide to managing Instagram content, messages, and customer workflows with Brancy.",
      intro:
        "Brancy brings the daily work of Instagram management into one organized workspace for businesses and teams.",
      benefits: [
        "Plan and manage content workflows",
        "Keep customer conversations organized",
        "Connect publishing, shop, and business tasks",
      ],
      questions: [
        [
          "What is Instagram management software?",
          "It is a workspace that helps a business organize Instagram content, conversations, publishing, and related customer tasks.",
        ],
        [
          "Who is Brancy for?",
          "Brancy is designed for businesses and teams that manage Instagram-centered marketing, communication, and commerce workflows.",
        ],
      ],
    },
    automation: {
      title: "Instagram Automation Platform",
      description:
        "Learn how Instagram automation can organize replies, messages, and repetitive customer communication.",
      intro:
        "Automation helps teams respond consistently while keeping important conversations and customer context visible.",
      benefits: [
        "Organize automated replies and flows",
        "Reduce repetitive communication work",
        "Keep human review in the customer workflow",
      ],
      questions: [
        [
          "What does Instagram automation do?",
          "It supports repeatable message and reply workflows so teams can handle common interactions more consistently.",
        ],
        [
          "Can automation replace a support team?",
          "Automation supports a team; businesses still need clear rules and human review for important conversations.",
        ],
      ],
    },
    analytics: {
      title: "Instagram Analytics Tool",
      description:
        "Understand Instagram analytics, audience insights, and performance workflows for better business decisions.",
      intro: "Useful analytics connect audience signals and content performance to decisions a business can act on.",
      benefits: [
        "Review audience and performance signals",
        "Compare content outcomes over time",
        "Use insights to improve marketing decisions",
      ],
      questions: [
        [
          "What is an Instagram analytics tool?",
          "It helps a business review content, audience, and performance signals in one place.",
        ],
        [
          "Why are Instagram insights useful?",
          "Insights help teams understand what resonates with their audience and where to improve their workflow.",
        ],
      ],
    },
    marketing: {
      title: "Instagram Marketing Platform",
      description:
        "Coordinate Instagram marketing, content, customer communication, and commerce workflows with Brancy.",
      intro:
        "Instagram marketing works best when content, audience communication, advertising, and customer journeys are connected.",
      benefits: [
        "Coordinate marketing and content work",
        "Connect campaigns with customer communication",
        "Support shop and business journeys",
      ],
      questions: [
        [
          "What is an Instagram marketing platform?",
          "It connects marketing activities such as content, communication, analytics, and customer workflows.",
        ],
        [
          "How does Brancy support marketing teams?",
          "Brancy gives teams a shared workspace for Instagram-centered marketing and customer operations.",
        ],
      ],
    },
    ai: {
      title: "AI Instagram Assistant",
      description: "Explore AI-assisted Instagram workflows for content, communication, and business operations.",
      intro:
        "AI can help teams move faster on repeatable content and communication tasks while people keep control of business decisions.",
      benefits: [
        "Assist content and communication workflows",
        "Create repeatable AI-supported flows",
        "Keep review and decision-making with the team",
      ],
      questions: [
        [
          "What is an AI Instagram assistant?",
          "It is an AI-supported workflow that helps with selected Instagram content or communication tasks.",
        ],
        [
          "Should AI responses be reviewed?",
          "Yes. Teams should review important content and customer communication before relying on it in production.",
        ],
      ],
    },
  },
  fa: {
    management: {
      title: "نرم‌افزار مدیریت اینستاگرام",
      description: "راهنمای کاربردی مدیریت محتوا، پیام‌ها و ارتباط با مشتریان اینستاگرام با برنسی.",
      intro: "برنسی کارهای روزانه مدیریت اینستاگرام را برای کسب‌وکارها و تیم‌ها در یک فضای منظم جمع می‌کند.",
      benefits: ["مدیریت روند تولید و انتشار محتوا", "مرتب‌سازی گفت‌وگوهای مشتریان", "اتصال فروشگاه و کارهای کسب‌وکار"],
      questions: [
        [
          "نرم‌افزار مدیریت اینستاگرام چیست؟",
          "فضایی برای مدیریت محتوا، گفت‌وگوها، انتشار و کارهای مرتبط با مشتریان است.",
        ],
        [
          "برنسی برای چه کسانی است؟",
          "برنسی برای کسب‌وکارها و تیم‌هایی ساخته شده که بازاریابی و ارتباطات خود را حول اینستاگرام مدیریت می‌کنند.",
        ],
      ],
    },
    automation: {
      title: "پلتفرم اتوماسیون اینستاگرام",
      description: "چطور اتوماسیون اینستاگرام پاسخ‌ها، پیام‌ها و ارتباطات تکراری با مشتری را منظم می‌کند.",
      intro: "اتوماسیون به تیم‌ها کمک می‌کند پاسخ‌های منسجم‌تری بدهند و زمینه گفت‌وگوهای مهم را ببینند.",
      benefits: ["مدیریت پاسخ‌ها و فلوهای خودکار", "کاهش کارهای تکراری ارتباطی", "حفظ بررسی انسانی در روند مشتری"],
      questions: [
        [
          "اتوماسیون اینستاگرام چه کاری انجام می‌دهد؟",
          "روندهای تکرارشونده پیام و پاسخ را منظم می‌کند تا تیم با ثبات بیشتری به تعاملات رایج رسیدگی کند.",
        ],
        [
          "آیا اتوماسیون جای تیم پشتیبانی را می‌گیرد؟",
          "اتوماسیون به تیم کمک می‌کند، اما برای گفت‌وگوهای مهم قوانین روشن و بررسی انسانی لازم است.",
        ],
      ],
    },
    analytics: {
      title: "ابزار تحلیل اینستاگرام",
      description: "تحلیل عملکرد، شناخت مخاطب و استفاده از داده‌های اینستاگرام برای تصمیم‌های بهتر کسب‌وکار.",
      intro: "تحلیل مفید، نشانه‌های مخاطب و عملکرد محتوا را به تصمیم‌هایی تبدیل می‌کند که کسب‌وکار بتواند اجرا کند.",
      benefits: [
        "بررسی نشانه‌های مخاطب و عملکرد",
        "مقایسه نتیجه محتوا در طول زمان",
        "بهبود تصمیم‌های بازاریابی با داده",
      ],
      questions: [
        [
          "ابزار تحلیل اینستاگرام چیست؟",
          "به کسب‌وکار کمک می‌کند نشانه‌های محتوا، مخاطب و عملکرد را در یک مکان بررسی کند.",
        ],
        [
          "چرا تحلیل اینستاگرام مهم است؟",
          "تحلیل نشان می‌دهد چه چیزی برای مخاطب مفیدتر بوده و کدام بخش از روند کاری نیاز به بهبود دارد.",
        ],
      ],
    },
    marketing: {
      title: "پلتفرم بازاریابی اینستاگرام",
      description: "هماهنگی بازاریابی، محتوا، ارتباط با مشتری و فروش در اینستاگرام با برنسی.",
      intro:
        "بازاریابی اینستاگرام زمانی بهتر نتیجه می‌دهد که محتوا، ارتباط با مخاطب، تبلیغات و مسیر مشتری به هم متصل باشند.",
      benefits: [
        "هماهنگی کارهای بازاریابی و محتوا",
        "اتصال کمپین‌ها به ارتباط با مشتری",
        "پشتیبانی از مسیر فروشگاه و کسب‌وکار",
      ],
      questions: [
        [
          "پلتفرم بازاریابی اینستاگرام چیست؟",
          "فعالیت‌هایی مانند محتوا، ارتباط، تحلیل و روندهای مشتری را در یک فضای مشترک به هم متصل می‌کند.",
        ],
        [
          "برنسی چطور به تیم بازاریابی کمک می‌کند؟",
          "برنسی یک فضای مشترک برای بازاریابی و عملیات مرتبط با اینستاگرام فراهم می‌کند.",
        ],
      ],
    },
    ai: {
      title: "دستیار هوش مصنوعی اینستاگرام",
      description: "آشنایی با روندهای هوش مصنوعی برای محتوا، ارتباطات و عملیات کسب‌وکار اینستاگرامی.",
      intro:
        "هوش مصنوعی می‌تواند کارهای تکراری محتوا و ارتباط را سریع‌تر کند، در حالی که تصمیم‌های کسب‌وکار در اختیار تیم می‌ماند.",
      benefits: ["کمک به روند محتوا و ارتباطات", "ساخت فلوهای تکرارشونده با AI", "حفظ بررسی و تصمیم‌گیری توسط تیم"],
      questions: [
        [
          "دستیار هوش مصنوعی اینستاگرام چیست؟",
          "روندی مبتنی بر هوش مصنوعی است که برای برخی کارهای محتوا یا ارتباط اینستاگرام کمک می‌کند.",
        ],
        [
          "آیا پاسخ‌های AI باید بررسی شوند؟",
          "بله. تیم باید محتوای مهم و ارتباط با مشتری را پیش از استفاده نهایی بررسی کند.",
        ],
      ],
    },
  },
};

const base = copy.en as Record<Topic, TopicCopy>;
const fallbackLocales: Locale[] = ["ar", "fr", "ru", "tr", "gr", "az"];
for (const locale of fallbackLocales) copy[locale] = base;

export const topics: Topic[] = ["management", "automation", "analytics", "marketing", "ai"];
export const locales: Locale[] = ["en", "fa", "ar", "fr", "ru", "tr", "gr", "az"];

export function getTopicCopy(locale: string, topic: string) {
  const safeLocale = locales.includes(locale as Locale) ? (locale as Locale) : "en";
  const safeTopic = topics.includes(topic as Topic) ? (topic as Topic) : "management";
  return (copy[safeLocale] || base)[safeTopic];
}

export default function TopicPage({ locale, topic }: { locale: string; topic: string }) {
  const content = getTopicCopy(locale, topic);
  const url = `https://www.brancy.app/${locale}/resources/${topic}`;
  const faqSchema = content.questions.map(([question, answer]) => ({
    "@type": "Question",
    name: question,
    acceptedAnswer: { "@type": "Answer", text: answer },
  }));
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Brancy", item: `https://www.brancy.app/${locale}` },
      { "@type": "ListItem", position: 2, name: content.title, item: url },
    ],
  };

  return (
    <>
      <SeoJsonLd locale={locale} url={url} title={content.title} description={content.description} />
      <main className={styles.page}>
        <nav className={styles.nav} aria-label="Breadcrumb">
          <Link href={`/${locale}`}>Brancy</Link>
          <span aria-hidden="true">/</span>
          <span>{content.title}</span>
        </nav>
        <article>
          <header className={styles.hero}>
            <p className={styles.eyebrow}>Brancy resources</p>
            <h1>{content.title}</h1>
            <p>{content.description}</p>
            <Link className={styles.cta} href={`/${locale}`}>
              Start with Brancy
            </Link>
          </header>
          <section className={styles.section}>
            <h2>{content.title}: a practical overview</h2>
            <p>{content.intro}</p>
            <ul>
              {content.benefits.map((benefit) => (
                <li key={benefit}>{benefit}</li>
              ))}
            </ul>
          </section>
          <section className={styles.section} aria-labelledby="faq-title">
            <h2 id="faq-title">Questions and answers</h2>
            <div className={styles.faq}>
              {content.questions.map(([question, answer]) => (
                <details key={question}>
                  <summary>{question}</summary>
                  <p>{answer}</p>
                </details>
              ))}
            </div>
          </section>
          <nav className={styles.related} aria-label="Related Brancy resources">
            <strong>Explore related topics</strong>
            {topics
              .filter((item) => item !== topic)
              .map((item) => (
                <Link key={item} href={`/${locale}/resources/${item}`}>
                  {getTopicCopy(locale, item).title}
                </Link>
              ))}
          </nav>
        </article>
      </main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faqSchema }),
        }}
      />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
    </>
  );
}
