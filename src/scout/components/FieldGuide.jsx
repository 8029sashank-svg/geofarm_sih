import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft, BookOpen, Leaf, Search, MapPin, ChevronRight,
  Camera, ClipboardCheck, ShieldAlert, Sprout, Eye, Clipboard,
  AlertTriangle, CheckSquare,
} from 'lucide-react';
import AgriImage from './AgriImage.jsx';
import { FIELD_GUIDE_SECTIONS, DISEASE_GUIDE, KNOWLEDGE_CATEGORIES, KNOWLEDGE_LIBRARY } from '../mockData.js';
import { MAHARASHTRA_DISTRICTS, CURATED_DISTRICT_CROPS } from '../data/districtIntelligence.js';
import { SANGLI_CROPS, SANGLI_PEST_LIBRARY, SANGLI_DISTRICT_NOTE, getSangliEntriesByCrop } from '../data/sangliKnowledge.js';
import { useLanguage } from '../../contexts/LanguageContext.jsx';

const CAT_KEYS = {
  All: 'knowledgeCatAll',
  Crops: 'knowledgeCatCrops',
  Diseases: 'knowledgeCatDiseases',
  Pests: 'knowledgeCatPests',
  Treatments: 'knowledgeCatTreatments',
  'Field Identification': 'knowledgeCatFieldId',
  'Quick Reference': 'knowledgeCatQuickRef',
};

// Category visual accent colours (pill bg / text)
const CAT_COLORS = {
  Diseases:            'bg-red-50 text-red-700 border-red-200',
  Pests:               'bg-orange-50 text-orange-700 border-orange-200',
  Crops:               'bg-green-50 text-green-700 border-green-200',
  Treatments:          'bg-blue-50 text-blue-700 border-blue-200',
  'Field Identification': 'bg-purple-50 text-purple-700 border-purple-200',
  'Quick Reference':   'bg-gray-100 text-gray-600 border-gray-200',
};

// Text-only variant of CAT_COLORS, used for category pills overlaid on a photo
// (solid white chip background, no tinted fill, so it stays legible over any image).
const CAT_TEXT_ONLY = {
  Diseases:            'text-red-700 border-red-200',
  Pests:               'text-orange-700 border-orange-200',
  Crops:               'text-green-700 border-green-200',
  Treatments:          'text-blue-700 border-blue-200',
  'Field Identification': 'text-purple-700 border-purple-200',
  'Quick Reference':   'text-gray-600 border-gray-200',
};

const FEATURED_DISTRICT = 'Sangli';

/**
 * Knowledge Library — Maharashtra district browser + topic search.
 *
 * Two tabs:
 *  - Districts: browse all 34 Maharashtra districts. Sangli (the demo
 *    district) drills down into crop -> pest/disease field-scout entries.
 *    Every other district shows a light general pointer, reusing the same
 *    KNOWLEDGE_LIBRARY topic data rather than inventing per-district facts.
 *  - Topics: the original search/category browser over KNOWLEDGE_LIBRARY,
 *    unchanged in behaviour.
 *
 * All content here is field reference material, not a diagnosis — see the
 * "educational reference only" note rendered below.
 */
export default function FieldGuide() {
  const { t } = useLanguage();
  const [tab, setTab] = useState('districts'); // 'districts' | 'topics'

  // Topic-browser state (existing behaviour, preserved)
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [selectedId, setSelectedId] = useState(null);

  // District-browser state (new)
  const [districtQuery, setDistrictQuery] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [selectedCropId, setSelectedCropId] = useState(null);
  const [selectedEntryId, setSelectedEntryId] = useState(null);

  const articles = useMemo(() => {
    const q = query.trim().toLowerCase();
    return KNOWLEDGE_LIBRARY.filter((a) => {
      if (category !== 'All' && a.category !== category) return false;
      if (!q) return true;
      return [a.title, a.crop, a.category, a.identification, a.treatment]
        .filter(Boolean)
        .some((v) => v.toLowerCase().includes(q));
    });
  }, [query, category]);

  const selected = KNOWLEDGE_LIBRARY.find((a) => a.id === selectedId);

  const filteredDistricts = useMemo(() => {
    const q = districtQuery.trim().toLowerCase();
    const list = q ? MAHARASHTRA_DISTRICTS.filter((d) => d.toLowerCase().includes(q)) : MAHARASHTRA_DISTRICTS;
    // Featured district always surfaces first when visible in the filtered set
    return [...list].sort((a, b) => {
      if (a === FEATURED_DISTRICT) return -1;
      if (b === FEATURED_DISTRICT) return 1;
      return a.localeCompare(b);
    });
  }, [districtQuery]);

  const isSangli = selectedDistrict === FEATURED_DISTRICT;
  const selectedCrop = SANGLI_CROPS.find((c) => c.id === selectedCropId);
  const cropEntries = selectedCropId ? getSangliEntriesByCrop(selectedCropId) : [];
  const selectedEntry = SANGLI_PEST_LIBRARY.find((e) => e.id === selectedEntryId);

  const jumpToTopicSearchForCrop = (cropName) => {
    setTab('topics');
    setCategory('All');
    setQuery(cropName);
    setSelectedId(null);
  };

  // Keep the drill-down readable: jump back to the top when the level changes.
  useEffect(() => {
    try {
      window.scrollTo({ top: 0 });
    } catch (_e) {
      /* ignore */
    }
  }, [selectedDistrict, selectedCropId, selectedEntryId]);

  const resetDistrictDrill = () => {
    setSelectedDistrict(null);
    setSelectedCropId(null);
    setSelectedEntryId(null);
  };

  return (
    <div className="space-y-4 max-w-3xl mx-auto">

      {/* Page header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-[#1A2E1A]">{t('knowledgeLibraryTitle')}</h1>
        <p className="text-[13px] text-[#6A8A6A] mt-0.5">{t('knowledgeLibrarySubtitle')}</p>
      </div>

      {/* Tabs */}
      <div className="flex bg-white border border-[#D5DDD5] rounded-xl p-1 gap-1">
        <button
          onClick={() => setTab('districts')}
          className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-[12px] font-bold transition-colors ${
            tab === 'districts'
              ? 'bg-[#00592D] text-white shadow-sm'
              : 'text-[#6A8A6A] hover:bg-[#F0F4F0]'
          }`}
        >
          <MapPin size={13} /> {t('knowledgeTabDistricts')}
        </button>
        <button
          onClick={() => setTab('topics')}
          className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-[12px] font-bold transition-colors ${
            tab === 'topics'
              ? 'bg-[#00592D] text-white shadow-sm'
              : 'text-[#6A8A6A] hover:bg-[#F0F4F0]'
          }`}
        >
          <BookOpen size={13} /> {t('knowledgeTabTopics')}
        </button>
      </div>

      {/* ═══════════════════ DISTRICTS TAB ═══════════════════ */}
      {tab === 'districts' ? (
        <div className="space-y-3">
          {!selectedDistrict && (
            <>
              {/* Search */}
              <div className="relative">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9AAA9A]" />
                <input
                  value={districtQuery}
                  onChange={(e) => setDistrictQuery(e.target.value)}
                  placeholder={t('searchDistricts')}
                  className="w-full pl-9 pr-3 py-2.5 text-[13px] border border-[#D5DDD5] rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#00592D]/20 focus:border-[#00592D]/40 placeholder:text-[#B0C0B0] transition-colors"
                />
              </div>
              <p className="text-[11px] text-[#9AAA9A]">{MAHARASHTRA_DISTRICTS.length} {t('districtsCountLabel')}</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {filteredDistricts.map((d) => {
                  const featured = d === FEATURED_DISTRICT;
                  return (
                    <button
                      key={d}
                      onClick={() => setSelectedDistrict(d)}
                      className={`text-left bg-white border rounded-xl p-3.5 hover:border-[#00592D]/40 hover:shadow-[0_2px_8px_rgba(0,0,0,0.05)] transition-all ${
                        featured
                          ? 'border-[#00592D]/40 ring-1 ring-[#00592D]/10'
                          : 'border-[#D5DDD5]'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-[13px] font-bold text-[#1A2E1A] truncate">{d}</span>
                        <ChevronRight size={13} className="text-[#C0CCC0] shrink-0" />
                      </div>
                      {featured && (
                        <span className="mt-1 inline-block text-[9px] font-bold uppercase tracking-wide text-[#00592D] bg-[#00592D]/10 rounded-full px-1.5 py-0.5">
                          {t('featuredDistrictBadge')}
                        </span>
                      )}
                    </button>
                  );
                })}
                {filteredDistricts.length === 0 && (
                  <div className="col-span-full bg-white border border-[#D5DDD5] rounded-xl py-10 px-6 text-center">
                    <p className="text-[13px] font-bold text-[#3A3A3A]">{t('noArticlesMatch')}</p>
                  </div>
                )}
              </div>
            </>
          )}

          {selectedDistrict && !selectedCropId && (
            <div className="space-y-3">
              <button onClick={resetDistrictDrill} className="flex items-center gap-1.5 text-[12px] font-bold text-[#6A8A6A] hover:text-[#00592D] transition-colors">
                <ArrowLeft size={14} /> {t('backToDistricts')}
              </button>
              <div className="bg-white border border-[#D5DDD5] rounded-xl p-4">
                <div className="flex items-center justify-between gap-2">
                  <h2 className="text-[18px] font-bold text-[#1A2E1A]">{selectedDistrict}</h2>
                  <span className={`text-[10px] font-bold uppercase tracking-wide rounded-full px-2.5 py-0.5 border shrink-0 ${
                    isSangli
                      ? 'text-[#00592D] bg-[#00592D]/8 border-[#00592D]/20'
                      : 'text-[#6A8A6A] bg-gray-50 border-gray-200'
                  }`}>
                    {isSangli ? t('featuredDistrictBadge') : t('generalDistrictBadge')}
                  </span>
                </div>

                {isSangli ? (
                  <p className="text-[12px] text-[#5A7A5A] mt-2 leading-relaxed">{SANGLI_DISTRICT_NOTE}</p>
                ) : (
                  <>
                    <p className="text-[12px] text-[#5A7A5A] mt-2 leading-relaxed">{t('otherDistrictNote')}</p>
                    {CURATED_DISTRICT_CROPS[selectedDistrict] && (
                      <div className="mt-3 bg-[#F7FAF7] border border-[#D5DDD5] rounded-xl p-3">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-[#8AAA8A]">{t('localCropReference')}</p>
                        <p className="text-[13px] font-semibold text-[#1A2E1A] mt-1">{CURATED_DISTRICT_CROPS[selectedDistrict]}</p>
                        <button
                          onClick={() => jumpToTopicSearchForCrop(CURATED_DISTRICT_CROPS[selectedDistrict])}
                          className="mt-2 text-[12px] font-bold text-[#00592D] border border-[#00592D]/30 rounded-lg px-3 py-1.5 hover:bg-[#00592D]/5 transition-colors"
                        >
                          {t('viewGeneralArticles')}
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>

              {isSangli && (
                <div className="space-y-2">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#9AAA9A] px-1">{t('cropsCovered')}</p>
                  {SANGLI_CROPS.map((c) => {
                    const count = getSangliEntriesByCrop(c.id).length;
                    return (
                      <button
                        key={c.id}
                        onClick={() => setSelectedCropId(c.id)}
                        className="w-full text-left bg-white border border-[#D5DDD5] rounded-xl p-3.5 hover:border-[#00592D]/40 hover:shadow-[0_2px_8px_rgba(0,0,0,0.05)] transition-all"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="flex items-center gap-2 text-[13px] font-bold text-[#1A2E1A]">
                            <Sprout size={14} className="text-[#00592D] shrink-0" /> {c.name}
                          </span>
                          <span className="text-[10px] font-bold text-[#9AAA9A] shrink-0">{count} {t('knowledgeEntriesLabel')}</span>
                        </div>
                        <p className="text-[11px] text-[#6A8A6A] mt-1 leading-relaxed">{c.areaNote}</p>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {isSangli && selectedCropId && !selectedEntryId && (
            <div className="space-y-3">
              <button onClick={() => setSelectedCropId(null)} className="flex items-center gap-1.5 text-[12px] font-bold text-[#6A8A6A] hover:text-[#00592D] transition-colors">
                <ArrowLeft size={14} /> {t('backToCrops')}
              </button>
              <div>
                <h2 className="text-[18px] font-bold text-[#1A2E1A]">{selectedCrop?.name}</h2>
                <p className="text-[12px] text-[#9AAA9A] mt-0.5">{t('fieldEntriesFor')} · {selectedDistrict}</p>
              </div>
              <div className="space-y-2">
                {cropEntries.map((entry) => (
                  <button
                    key={entry.id}
                    onClick={() => setSelectedEntryId(entry.id)}
                    className="w-full text-left bg-white border border-[#D5DDD5] rounded-xl p-3.5 hover:border-[#00592D]/40 hover:shadow-[0_2px_8px_rgba(0,0,0,0.05)] transition-all"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[13px] font-bold text-[#1A2E1A]">{entry.name}</span>
                      <ChevronRight size={13} className="text-[#C0CCC0] shrink-0" />
                    </div>
                    <span className={`mt-1.5 inline-block text-[9px] font-bold uppercase tracking-wide rounded-full px-1.5 py-0.5 border ${
                      CAT_COLORS[entry.type] || 'bg-gray-100 text-gray-600 border-gray-200'
                    }`}>
                      {entry.type}
                    </span>
                    <p className="text-[11px] text-[#6A8A6A] mt-1.5 line-clamp-2">{entry.symptoms.join(', ')}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {isSangli && selectedEntry && (
            <div className="bg-white border border-[#D5DDD5] rounded-xl overflow-hidden">
              <div className="px-4 pt-4 pb-3 border-b border-[#EBF0EB]">
                <button onClick={() => setSelectedEntryId(null)} className="flex items-center gap-1.5 text-[12px] font-bold text-[#6A8A6A] hover:text-[#00592D] mb-3 transition-colors">
                  <ArrowLeft size={14} /> {selectedCrop?.name}
                </button>
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-[17px] font-bold text-[#1A2E1A]">{selectedEntry.name}</h3>
                  <span className={`text-[9px] font-bold uppercase tracking-wide rounded-full px-2 py-0.5 border shrink-0 mt-0.5 ${
                    CAT_COLORS[selectedEntry.type] || 'bg-gray-100 text-gray-600 border-gray-200'
                  }`}>
                    {selectedEntry.type}
                  </span>
                </div>
                <p className="text-[11px] font-semibold text-[#9AAA9A] mt-0.5">{selectedEntry.crop} · {selectedDistrict}</p>
              </div>
              <div className="p-4 space-y-3">
                <FieldSection title={t('symptomsField')} icon={<Eye size={13} />}>
                  <BulletList items={selectedEntry.symptoms} />
                </FieldSection>
                <FieldSection title={t('whatToPhotograph')} icon={<Camera size={13} />}>
                  <BulletList items={selectedEntry.photograph} />
                </FieldSection>
                <FieldSection title={t('whatToCheckInField')} icon={<ClipboardCheck size={13} />}>
                  <BulletList items={selectedEntry.fieldCheck} />
                </FieldSection>
                <FieldSection title={t('riskCluesLabel')} icon={<ShieldAlert size={13} />}>
                  <BulletList items={selectedEntry.riskClues} />
                </FieldSection>
                <FieldSection title={t('managementLabel')} icon={<Leaf size={13} />}>
                  <BulletList items={selectedEntry.management} />
                </FieldSection>
                <div className="bg-amber-50 border border-amber-200 rounded-xl px-3 py-2.5">
                  <p className="text-[10px] font-bold text-amber-900 uppercase tracking-wide flex items-center gap-1.5">
                    <AlertTriangle size={11} /> {t('escalationLabel')}
                  </p>
                  <p className="text-[12px] text-amber-900 mt-1">{selectedEntry.escalation}</p>
                </div>
              </div>
            </div>
          )}
        </div>

      ) : (

        /* ═══════════════════ TOPICS TAB ═══════════════════ */
        <div className="space-y-3">

          {/* Search */}
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9AAA9A]" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('searchGuide')}
              className="w-full pl-9 pr-3 py-2.5 text-[13px] border border-[#D5DDD5] rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#00592D]/20 focus:border-[#00592D]/40 placeholder:text-[#B0C0B0] transition-colors"
            />
          </div>

          {/* Category pills */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-1 px-1">
            {KNOWLEDGE_CATEGORIES.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`shrink-0 px-3 py-1.5 rounded-full text-[11px] font-bold border transition-colors ${
                  category === c
                    ? 'bg-[#00592D] text-white border-[#00592D]'
                    : 'bg-white text-[#6A8A6A] border-[#D5DDD5] hover:border-[#00592D]/40'
                }`}
              >
                {CAT_KEYS[c] ? t(CAT_KEYS[c]) : c}
              </button>
            ))}
          </div>

          {/* Article detail view */}
          {selected ? (
            <div className="bg-white border border-[#D5DDD5] rounded-xl overflow-hidden">
              <div className="px-4 pt-4 pb-0">
                <button onClick={() => setSelectedId(null)} className="flex items-center gap-1.5 text-[12px] font-bold text-[#6A8A6A] hover:text-[#00592D] mb-3 transition-colors">
                  <ArrowLeft size={14} /> {t('backToGuides')}
                </button>
              </div>

              {/* Article hero image */}
              <div className="relative">
                <AgriImage
                  src={selected.image}
                  alt={`${selected.title} — reference photo`}
                  label={t('fieldImageUnavailable')}
                  className="w-full h-52"
                />
                {selected.image && (
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent px-4 pt-10 pb-3">
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-white uppercase tracking-wider drop-shadow-sm">
                      <Sprout size={12} className="shrink-0" /> {selected.crop}
                    </span>
                  </div>
                )}
              </div>

              <div className="p-4">
                {/* Title + category */}
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h3 className="text-[18px] font-bold text-[#1A2E1A] leading-snug">{selected.title}</h3>
                  <span className={`text-[9px] font-bold uppercase tracking-wide rounded-full px-2 py-0.5 border shrink-0 mt-1 ${
                    CAT_COLORS[selected.category] || 'bg-gray-100 text-gray-600 border-gray-200'
                  }`}>
                    {CAT_KEYS[selected.category] ? t(CAT_KEYS[selected.category]) : selected.category}
                  </span>
                </div>
                {!selected.image && (
                  <p className="text-[12px] font-semibold text-[#6A8A6A]">{selected.crop}</p>
                )}

                {/* Field-practical sections */}
                <div className="mt-4 space-y-3">

                  {/* What to look for */}
                  <ArticleSection
                    title={t('artSecLookFor')}
                    icon={<Eye size={13} />}
                    accent="green"
                  >
                    <p className="text-[13px] text-[#3A5A3A]">{selected.identification}</p>
                  </ArticleSection>

                  {/* Typical field signs */}
                  <ArticleSection
                    title={t('artSecFieldSigns')}
                    icon={<Leaf size={13} />}
                    accent="green"
                  >
                    <ul className="space-y-1">
                      {selected.symptoms.map((s, i) => (
                        <li key={i} className="flex gap-2 text-[13px] text-[#3A5A3A]">
                          <span className="text-[#00592D] font-bold shrink-0">·</span> {s}
                        </li>
                      ))}
                    </ul>
                  </ArticleSection>

                  {/* Field guidance */}
                  <ArticleSection
                    title={t('artSecGuidance')}
                    icon={<ClipboardCheck size={13} />}
                    accent="blue"
                  >
                    <p className="text-[13px] text-[#3A5A5A]">{selected.treatment}</p>
                    {selected.prevention && (
                      <p className="text-[13px] text-[#3A5A5A] mt-1">{selected.prevention}</p>
                    )}
                  </ArticleSection>

                  {/* What to record */}
                  <ArticleSection
                    title={t('artSecRecord')}
                    icon={<Clipboard size={13} />}
                    accent="amber"
                  >
                    <p className="text-[13px] text-[#5A4A2A]">{selected.fieldNotes}</p>
                  </ArticleSection>

                  {/* When to escalate */}
                  <div className="bg-amber-50 border border-amber-200 rounded-xl px-3 py-2.5">
                    <p className="text-[10px] font-bold text-amber-900 uppercase tracking-wide flex items-center gap-1.5">
                      <AlertTriangle size={11} /> {t('artSecEscalate')}
                    </p>
                    <p className="text-[12px] text-amber-900 mt-1">
                      {t('artSecEscalateBody')}
                    </p>
                  </div>
                </div>
              </div>
            </div>

          ) : (
            /* Article card grid */
            <>
              {articles.length > 0 ? (
                <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {articles.map((a) => (
                    <div
                      key={a.id}
                      className="bg-white border border-[#D5DDD5] rounded-xl overflow-hidden flex flex-col hover:border-[#00592D]/40 hover:shadow-[0_2px_10px_rgba(0,0,0,0.06)] transition-all"
                    >
                      {/* Card image — strong visual presentation with crop/category context overlaid */}
                      <div className="relative">
                        <AgriImage
                          src={a.image}
                          alt={`${a.title} — reference photo`}
                          label={t('fieldImageUnavailable')}
                          className="w-full h-44"
                        />
                        {a.image && (
                          <>
                            <span className={`absolute top-2 right-2 text-[9px] font-bold uppercase tracking-wide rounded-full px-2 py-0.5 border bg-white/95 ${
                              CAT_TEXT_ONLY[a.category] || 'text-gray-600 border-gray-200'
                            }`}>
                              {CAT_KEYS[a.category] ? t(CAT_KEYS[a.category]) : a.category}
                            </span>
                            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/25 to-transparent px-3 pt-8 pb-2">
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-white uppercase tracking-wider drop-shadow-sm">
                                <Sprout size={11} className="shrink-0" /> {a.crop}
                              </span>
                            </div>
                          </>
                        )}
                      </div>

                      <div className="p-3.5 flex flex-col flex-1">
                        {/* Crop + category — always shown here too, so context survives even without a photo */}
                        {!a.image && (
                          <div className="flex items-center justify-between gap-1.5 mb-1.5">
                            <p className="text-[10px] font-bold text-[#8AAA8A] uppercase tracking-wider">{a.crop}</p>
                            <span className={`text-[9px] font-bold uppercase tracking-wide rounded-full px-1.5 py-0.5 border shrink-0 ${
                              CAT_COLORS[a.category] || 'bg-gray-100 text-gray-600 border-gray-200'
                            }`}>
                              {CAT_KEYS[a.category] ? t(CAT_KEYS[a.category]) : a.category}
                            </span>
                          </div>
                        )}

                        {/* Title */}
                        <h3 className="text-[14.5px] font-bold text-[#1A2E1A] leading-snug mb-1.5">{a.title}</h3>

                        {/* Short practical description */}
                        <p className="text-[11.5px] text-[#5A7A5A] leading-relaxed line-clamp-2 flex-1">
                          {a.identification}
                        </p>

                        <button
                          onClick={() => setSelectedId(a.id)}
                          className="mt-3 w-full text-[12px] font-bold text-[#00592D] border border-[#00592D]/30 rounded-lg py-2 hover:bg-[#00592D]/5 transition-colors"
                        >
                          {t('viewGuide')}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white border border-[#D5DDD5] rounded-xl py-12 px-6 text-center">
                  <p className="text-[14px] font-bold text-[#3A3A3A]">{t('noArticlesMatch')}</p>
                  <p className="text-[12px] text-[#9AAA9A] mt-1">{t('tryAnotherKeyword')}</p>
                </div>
              )}
            </>
          )}

          {/* ── How-to field guide sections ── */}
          {!selected && tab === 'topics' && FIELD_GUIDE_SECTIONS.map((section) => {
            const isPhoto = section.title === 'How to photograph a leaf';
            const isTrap = section.title === 'How to inspect a sticky trap';
            const sectionTitle = isPhoto ? t('guideSecPhotoTitle') : isTrap ? t('guideSecTrapTitle') : section.title;
            const steps = isPhoto
              ? [t('guideSecPhotoStep1'), t('guideSecPhotoStep2'), t('guideSecPhotoStep3'), t('guideSecPhotoStep4'), t('guideSecPhotoStep5')]
              : isTrap
              ? [t('guideSecTrapStep1'), t('guideSecTrapStep2'), t('guideSecTrapStep3'), t('guideSecTrapStep4'), t('guideSecTrapStep5'), t('guideSecTrapStep6')]
              : section.steps;

            return (
              <div key={section.title} className="bg-white border border-[#D5DDD5] rounded-xl overflow-hidden">
                <div className="flex items-center gap-2.5 px-4 py-3 border-b border-[#EBF0EB]">
                  <span className="w-7 h-7 rounded-lg bg-[#00592D]/8 text-[#00592D] flex items-center justify-center shrink-0">
                    <BookOpen size={14} />
                  </span>
                  <h3 className="text-[13px] font-bold text-[#1A2E1A]">{sectionTitle}</h3>
                </div>
                <ol className="px-4 py-3 space-y-2">
                  {steps.map((s, i) => (
                    <li key={i} className="flex gap-2.5 text-[13px] text-[#3A5A3A]">
                      <span className="text-[#00592D] font-bold shrink-0 w-4 text-right">{i + 1}.</span>
                      <span>{s}</span>
                    </li>
                  ))}
                </ol>
              </div>
            );
          })}

          {/* ── Disease observation guide ── */}
          {!selected && tab === 'topics' && (
            <div className="bg-white border border-[#D5DDD5] rounded-xl overflow-hidden">
              <div className="flex items-center gap-2.5 px-4 py-3 border-b border-[#EBF0EB]">
                <span className="w-7 h-7 rounded-lg bg-[#00592D]/8 text-[#00592D] flex items-center justify-center shrink-0">
                  <Leaf size={14} />
                </span>
                <h3 className="text-[13px] font-bold text-[#1A2E1A]">{t('diseaseObservationGuide')}</h3>
              </div>
              <div className="divide-y divide-[#EBF0EB]">
                {DISEASE_GUIDE.map((d) => (
                  <div key={d.name} className="px-4 py-3">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-[13px] font-bold text-[#1A2E1A]">{d.name}</h4>
                      <span className="text-[11px] font-semibold text-[#9AAA9A] shrink-0">{d.crop}</span>
                    </div>
                    <p className="text-[12px] text-[#5A7A5A] mt-1">{d.symptoms}</p>
                    <p className="text-[12px] text-[#3A5A3A] mt-1">
                      <span className="font-semibold">{t('actionLabel')}:</span> {d.action}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      )}

      {/* Educational disclaimer */}
      <div className="flex gap-2.5 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
        <CheckSquare size={14} className="text-amber-600 shrink-0 mt-0.5" />
        <p className="text-[11px] text-amber-900">{t('eduRefOnly')}</p>
      </div>

    </div>
  );
}

// ── Article section block (inside article detail) ─────────────────────────────
const ACCENT_STYLES = {
  green: 'bg-[#F0F7F2] border-[#C8DEC8] text-[#00592D]',
  blue:  'bg-blue-50 border-blue-200 text-blue-700',
  amber: 'bg-amber-50 border-amber-200 text-amber-700',
};

function ArticleSection({ title, icon, accent = 'green', children }) {
  const styles = ACCENT_STYLES[accent] || ACCENT_STYLES.green;
  return (
    <div className={`border rounded-xl px-3 py-2.5 ${styles}`}>
      <p className={`text-[10px] font-bold uppercase tracking-wide flex items-center gap-1.5 mb-2`}>
        {icon} {title}
      </p>
      {children}
    </div>
  );
}

// ── Bullet list (inside Sangli entry detail) ──────────────────────────────────
function BulletList({ items }) {
  if (!items || items.length === 0) return null;
  return (
    <ul className="space-y-1">
      {items.map((it, i) => (
        <li key={i} className="flex gap-2 text-[12px]">
          <span className="font-bold shrink-0">·</span> {it}
        </li>
      ))}
    </ul>
  );
}

// ── Field section (inside Sangli entry detail) ────────────────────────────────
function FieldSection({ title, icon, children }) {
  if (!children) return null;
  return (
    <div className="bg-[#F7FAF7] border border-[#D5DDD5] rounded-xl p-3">
      <p className="text-[10px] font-bold uppercase tracking-wider text-[#8AAA8A] flex items-center gap-1.5 mb-2">
        <span className="text-[#00592D]">{icon}</span> {title}
      </p>
      {children}
    </div>
  );
}
