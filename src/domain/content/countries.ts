export type Continent = 'asia' | 'africa' | 'europe' | 'americas' | 'oceania';
export type Country = { code: string; ar: string; continent: Continent; flag: string };

/** Flag emoji from an ISO-3166 alpha-2 code (regional indicator symbols) – no image assets needed. */
export const flagOf = (code: string) =>
  String.fromCodePoint(...code.toUpperCase().split('').map((c) => 0x1f1e6 + c.charCodeAt(0) - 65));

const raw: [string, string, Continent][] = [
  ['SA', 'السعودية', 'asia'], ['AE', 'الإمارات', 'asia'], ['KW', 'الكويت', 'asia'], ['QA', 'قطر', 'asia'],
  ['BH', 'البحرين', 'asia'], ['OM', 'عُمان', 'asia'], ['YE', 'اليمن', 'asia'], ['JO', 'الأردن', 'asia'],
  ['PS', 'فلسطين', 'asia'], ['LB', 'لبنان', 'asia'], ['SY', 'سوريا', 'asia'], ['IQ', 'العراق', 'asia'],
  ['EG', 'مصر', 'africa'], ['SD', 'السودان', 'africa'], ['LY', 'ليبيا', 'africa'], ['TN', 'تونس', 'africa'],
  ['DZ', 'الجزائر', 'africa'], ['MA', 'المغرب', 'africa'], ['MR', 'موريتانيا', 'africa'], ['SO', 'الصومال', 'africa'],
  ['TR', 'تركيا', 'asia'], ['IR', 'إيران', 'asia'], ['PK', 'باكستان', 'asia'], ['IN', 'الهند', 'asia'],
  ['CN', 'الصين', 'asia'], ['JP', 'اليابان', 'asia'], ['KR', 'كوريا الجنوبية', 'asia'], ['ID', 'إندونيسيا', 'asia'],
  ['MY', 'ماليزيا', 'asia'], ['TH', 'تايلاند', 'asia'], ['VN', 'فيتنام', 'asia'], ['PH', 'الفلبين', 'asia'],
  ['BD', 'بنغلاديش', 'asia'], ['AF', 'أفغانستان', 'asia'],
  ['NG', 'نيجيريا', 'africa'], ['ZA', 'جنوب أفريقيا', 'africa'], ['KE', 'كينيا', 'africa'], ['ET', 'إثيوبيا', 'africa'],
  ['GH', 'غانا', 'africa'], ['SN', 'السنغال', 'africa'], ['CM', 'الكاميرون', 'africa'], ['TZ', 'تنزانيا', 'africa'],
  ['GB', 'بريطانيا', 'europe'], ['FR', 'فرنسا', 'europe'], ['DE', 'ألمانيا', 'europe'], ['IT', 'إيطاليا', 'europe'],
  ['ES', 'إسبانيا', 'europe'], ['PT', 'البرتغال', 'europe'], ['NL', 'هولندا', 'europe'], ['BE', 'بلجيكا', 'europe'],
  ['CH', 'سويسرا', 'europe'], ['SE', 'السويد', 'europe'], ['NO', 'النرويج', 'europe'], ['FI', 'فنلندا', 'europe'],
  ['DK', 'الدنمارك', 'europe'], ['GR', 'اليونان', 'europe'], ['PL', 'بولندا', 'europe'], ['UA', 'أوكرانيا', 'europe'],
  ['IE', 'أيرلندا', 'europe'], ['AT', 'النمسا', 'europe'],
  ['US', 'أمريكا', 'americas'], ['CA', 'كندا', 'americas'], ['MX', 'المكسيك', 'americas'], ['BR', 'البرازيل', 'americas'],
  ['AR', 'الأرجنتين', 'americas'], ['CL', 'تشيلي', 'americas'], ['CO', 'كولومبيا', 'americas'], ['PE', 'بيرو', 'americas'],
  ['AU', 'أستراليا', 'oceania'], ['NZ', 'نيوزيلندا', 'oceania'],
];

export const COUNTRIES: readonly Country[] = raw.map(([code, ar, continent]) => ({ code, ar, continent, flag: flagOf(code) }));

export const CONTINENT_AR: Record<Continent, string> = {
  asia: 'آسيا', africa: 'أفريقيا', europe: 'أوروبا', americas: 'الأمريكتان', oceania: 'أوقيانوسيا',
};
