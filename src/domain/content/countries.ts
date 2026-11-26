export type Continent = 'asia' | 'africa' | 'europe' | 'americas' | 'oceania';
export type Country = { code: string; ar: string; en: string; continent: Continent; flag: string };

/** Flag emoji from an ISO-3166 alpha-2 code (regional indicator symbols) – no image assets needed. */
export const flagOf = (code: string) =>
  String.fromCodePoint(...code.toUpperCase().split('').map((c) => 0x1f1e6 + c.charCodeAt(0) - 65));

const raw: [string, string, string, Continent][] = [
  ['SA', 'السعودية', 'Saudi Arabia', 'asia'], ['AE', 'الإمارات', 'UAE', 'asia'], ['KW', 'الكويت', 'Kuwait', 'asia'], ['QA', 'قطر', 'Qatar', 'asia'],
  ['BH', 'البحرين', 'Bahrain', 'asia'], ['OM', 'عُمان', 'Oman', 'asia'], ['YE', 'اليمن', 'Yemen', 'asia'], ['JO', 'الأردن', 'Jordan', 'asia'],
  ['PS', 'فلسطين', 'Palestine', 'asia'], ['LB', 'لبنان', 'Lebanon', 'asia'], ['SY', 'سوريا', 'Syria', 'asia'], ['IQ', 'العراق', 'Iraq', 'asia'],
  ['EG', 'مصر', 'Egypt', 'africa'], ['SD', 'السودان', 'Sudan', 'africa'], ['LY', 'ليبيا', 'Libya', 'africa'], ['TN', 'تونس', 'Tunisia', 'africa'],
  ['DZ', 'الجزائر', 'Algeria', 'africa'], ['MA', 'المغرب', 'Morocco', 'africa'], ['MR', 'موريتانيا', 'Mauritania', 'africa'], ['SO', 'الصومال', 'Somalia', 'africa'],
  ['TR', 'تركيا', 'Turkey', 'asia'], ['IR', 'إيران', 'Iran', 'asia'], ['PK', 'باكستان', 'Pakistan', 'asia'], ['IN', 'الهند', 'India', 'asia'],
  ['CN', 'الصين', 'China', 'asia'], ['JP', 'اليابان', 'Japan', 'asia'], ['KR', 'كوريا الجنوبية', 'South Korea', 'asia'], ['ID', 'إندونيسيا', 'Indonesia', 'asia'],
  ['MY', 'ماليزيا', 'Malaysia', 'asia'], ['TH', 'تايلاند', 'Thailand', 'asia'], ['VN', 'فيتنام', 'Vietnam', 'asia'], ['PH', 'الفلبين', 'Philippines', 'asia'],
  ['BD', 'بنغلاديش', 'Bangladesh', 'asia'], ['AF', 'أفغانستان', 'Afghanistan', 'asia'],
  ['NG', 'نيجيريا', 'Nigeria', 'africa'], ['ZA', 'جنوب أفريقيا', 'South Africa', 'africa'], ['KE', 'كينيا', 'Kenya', 'africa'], ['ET', 'إثيوبيا', 'Ethiopia', 'africa'],
  ['GH', 'غانا', 'Ghana', 'africa'], ['SN', 'السنغال', 'Senegal', 'africa'], ['CM', 'الكاميرون', 'Cameroon', 'africa'], ['TZ', 'تنزانيا', 'Tanzania', 'africa'],
  ['GB', 'بريطانيا', 'United Kingdom', 'europe'], ['FR', 'فرنسا', 'France', 'europe'], ['DE', 'ألمانيا', 'Germany', 'europe'], ['IT', 'إيطاليا', 'Italy', 'europe'],
  ['ES', 'إسبانيا', 'Spain', 'europe'], ['PT', 'البرتغال', 'Portugal', 'europe'], ['NL', 'هولندا', 'Netherlands', 'europe'], ['BE', 'بلجيكا', 'Belgium', 'europe'],
  ['CH', 'سويسرا', 'Switzerland', 'europe'], ['SE', 'السويد', 'Sweden', 'europe'], ['NO', 'النرويج', 'Norway', 'europe'], ['FI', 'فنلندا', 'Finland', 'europe'],
  ['DK', 'الدنمارك', 'Denmark', 'europe'], ['GR', 'اليونان', 'Greece', 'europe'], ['PL', 'بولندا', 'Poland', 'europe'], ['UA', 'أوكرانيا', 'Ukraine', 'europe'],
  ['IE', 'أيرلندا', 'Ireland', 'europe'], ['AT', 'النمسا', 'Austria', 'europe'],
  ['US', 'أمريكا', 'United States', 'americas'], ['CA', 'كندا', 'Canada', 'americas'], ['MX', 'المكسيك', 'Mexico', 'americas'], ['BR', 'البرازيل', 'Brazil', 'americas'],
  ['AR', 'الأرجنتين', 'Argentina', 'americas'], ['CL', 'تشيلي', 'Chile', 'americas'], ['CO', 'كولومبيا', 'Colombia', 'americas'], ['PE', 'بيرو', 'Peru', 'americas'],
  ['AU', 'أستراليا', 'Australia', 'oceania'], ['NZ', 'نيوزيلندا', 'New Zealand', 'oceania'],
];

export const COUNTRIES: readonly Country[] = raw.map(([code, ar, en, continent]) => ({ code, ar, en, continent, flag: flagOf(code) }));
