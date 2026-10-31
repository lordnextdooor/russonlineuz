// Разметка Schema.org для лендинга: школа, курс с ценами в UZS, частые вопросы
import tariffs from '../data/tariffs.json';
import site from '../data/site.json';
import { fill, homePath, type Dict, type Locale } from '../i18n';

const isFilled = (s: string) => !s.includes('[ЗАПОЛНИТЬ');

export function landingSchema(t: Dict, lang: Locale, siteUrl: URL) {
  const url = new URL(homePath(lang), siteUrl).href;
  const orgId = new URL('/#school', siteUrl).href;

  const teacher = {
    '@type': 'Person',
    name: t.teacher.title,
    jobTitle: t.teacher.role,
  };

  const offers = [
    ...tariffs.individual.map((x) => ({ ...x, nameTpl: t.pricing.individualName })),
    ...tariffs.group.map((x) => ({ ...x, nameTpl: t.pricing.groupName })),
  ].map((x) => ({
    '@type': 'Offer',
    name: fill(x.nameTpl, { n: x.perWeek }),
    price: x.priceMonth,
    priceCurrency: 'UZS',
    category: 'Subscription',
    availability: 'https://schema.org/InStock',
    url: `${url}#narxlar`,
  }));

  return [
    {
      '@context': 'https://schema.org',
      '@type': 'EducationalOrganization',
      '@id': orgId,
      name: site.name,
      url: new URL('/', siteUrl).href,
      logo: new URL('/logo-512.png', siteUrl).href,
      description: t.meta.description,
      areaServed: { '@type': 'Country', name: 'Uzbekistan' },
      sameAs: [`https://instagram.com/${site.instagram}`],
      employee: teacher,
    },
    {
      '@context': 'https://schema.org',
      '@type': 'Course',
      name: t.schema.courseName,
      description: t.meta.description,
      inLanguage: 'ru',
      educationalLevel: 'Beginner',
      provider: { '@id': orgId },
      offers,
      hasCourseInstance: {
        '@type': 'CourseInstance',
        courseMode: 'Online',
        courseWorkload: 'PT1H',
        instructor: teacher,
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      // Вопросы с незаполненными ответами в разметку не попадают
      mainEntity: t.faq.items
        .filter((item) => isFilled(item.a))
        .map((item) => ({
          '@type': 'Question',
          name: item.q,
          acceptedAnswer: { '@type': 'Answer', text: item.a },
        })),
    },
  ];
}
