import { useState, useEffect } from 'react';
import { ArrowRight, ArrowLeft, Sparkles, RotateCcw } from 'lucide-react';
import { Button } from '@project/components/ui/button';
import { getProducts, GetProductsOutputType } from 'zitejs/api';
import { useLang } from '@/lib/lang';
import ProductCard from '@/components/ProductCard';

const tones = [
  { label: 'Fair', hex: '#F5E0D0' }, { label: 'Light', hex: '#E8CDB5' },
  { label: 'Light-Medium', hex: '#D4B896' }, { label: 'Medium', hex: '#C49A6C' },
  { label: 'Medium-Deep', hex: '#A67B5B' }, { label: 'Deep', hex: '#6B4226' },
];
const undertones = ['Cool', 'Warm', 'Neutral'];
const skinTypes = ['Dry', 'Oily', 'Combination', 'Normal', 'Sensitive'];
const concerns = ['Acne', 'Dark spots', 'Wrinkles', 'Dryness', 'Redness', 'Sun damage', 'Large pores'];

export default function QuizPage() {
  const { t, dir } = useLang();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({ tone: '', undertone: '', skinType: '', concerns: [] as string[] });
  const [showResults, setShowResults] = useState(false);
  const [allProducts, setAllProducts] = useState<GetProductsOutputType['products']>([]);

  useEffect(() => { getProducts({}).then(r => setAllProducts(r.products)); }, []);

  const totalSteps = 4;

  const toggleConcern = (c: string) => setAnswers(p => ({
    ...p, concerns: p.concerns.includes(c) ? p.concerns.filter(x => x !== c) : [...p.concerns, c],
  }));

  const results = allProducts.filter(p => {
    if (answers.skinType && p.skinTypes && !p.skinTypes.includes('All') && !p.skinTypes.includes(answers.skinType)) return false;
    return true;
  }).slice(0, 4);

  if (showResults) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-10 md:py-16 max-w-4xl">
          <div className="text-center mb-10">
            <Sparkles className="h-10 w-10 text-accent mx-auto mb-4" />
            <h1 className="font-display text-3xl md:text-4xl font-bold">{t('quizPage.resultsTitle')}</h1>
            <p className="text-muted-foreground mt-2 max-w-lg mx-auto">{t('quizPage.resultsSubtitle')}</p>
            <div className="flex justify-center gap-3 mt-4 flex-wrap">
              {answers.tone && <span className="px-3 py-1 rounded-full bg-muted text-sm">{answers.tone}</span>}
              {answers.undertone && <span className="px-3 py-1 rounded-full bg-muted text-sm">{answers.undertone}</span>}
              {answers.skinType && <span className="px-3 py-1 rounded-full bg-muted text-sm">{answers.skinType}</span>}
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {results.map(p => <ProductCard key={p.id} product={p as any} />)}
          </div>
          <div className="text-center">
            <Button variant="outline" onClick={() => { setShowResults(false); setStep(0); setAnswers({ tone: '', undertone: '', skinType: '', concerns: [] }); }}>
              <RotateCcw className="h-4 w-4 me-2" /> {t('quizPage.startOver')}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="container mx-auto px-4 py-10 max-w-xl">
        <div className="text-center mb-8">
          <Sparkles className="h-8 w-8 text-accent mx-auto mb-3" />
          <h1 className="font-display text-2xl md:text-3xl font-bold">{t('quizPage.title')}</h1>
          <p className="text-muted-foreground text-sm mt-2">{t('quizPage.subtitle')}</p>
        </div>

        {/* Progress */}
        <div className="flex gap-1.5 mb-8">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div key={i} className={`h-1.5 flex-1 rounded-full transition-colors ${i <= step ? 'bg-accent' : 'bg-muted'}`} />
          ))}
        </div>

        <div className="bg-card rounded-2xl border border-border p-6 md:p-8">
          {step === 0 && (
            <div>
              <h2 className="font-semibold text-lg mb-4">{t('quizPage.q1')}</h2>
              <div className="grid grid-cols-3 gap-3">
                {tones.map(tone => (
                  <button key={tone.label} onClick={() => setAnswers(p => ({ ...p, tone: tone.label }))}
                    className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${answers.tone === tone.label ? 'border-accent bg-accent/5' : 'border-border hover:border-accent/30'}`}>
                    <div className="h-12 w-12 rounded-full border" style={{ backgroundColor: tone.hex }} />
                    <span className="text-xs font-medium">{tone.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 1 && (
            <div>
              <h2 className="font-semibold text-lg mb-4">{t('quizPage.q2')}</h2>
              <div className="grid grid-cols-3 gap-3">
                {undertones.map(u => (
                  <button key={u} onClick={() => setAnswers(p => ({ ...p, undertone: u }))}
                    className={`p-4 rounded-xl border-2 text-center font-medium transition-all ${answers.undertone === u ? 'border-accent bg-accent/5' : 'border-border hover:border-accent/30'}`}>
                    {u}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 className="font-semibold text-lg mb-4">{t('quizPage.q3')}</h2>
              <div className="grid grid-cols-2 gap-3">
                {skinTypes.map(st => (
                  <button key={st} onClick={() => setAnswers(p => ({ ...p, skinType: st }))}
                    className={`p-4 rounded-xl border-2 font-medium transition-all ${answers.skinType === st ? 'border-accent bg-accent/5' : 'border-border hover:border-accent/30'}`}>
                    {st}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h2 className="font-semibold text-lg mb-4">{t('quizPage.q4')}</h2>
              <div className="flex flex-wrap gap-2">
                {concerns.map(c => (
                  <button key={c} onClick={() => toggleConcern(c)}
                    className={`px-4 py-2 rounded-full border-2 text-sm font-medium transition-all ${answers.concerns.includes(c) ? 'border-accent bg-accent/10 text-accent' : 'border-border hover:border-accent/30'}`}>
                    {c}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-between mt-6">
          <Button variant="ghost" onClick={() => setStep(s => s - 1)} disabled={step === 0}>
            {dir === 'rtl' ? <ArrowRight className="h-4 w-4 me-1" /> : <ArrowLeft className="h-4 w-4 me-1" />} {t('quizPage.back')}
          </Button>
          {step < totalSteps - 1 ? (
            <Button onClick={() => setStep(s => s + 1)} className="bg-accent hover:bg-accent/90 text-accent-foreground">
              {t('quizPage.next')} {dir === 'rtl' ? <ArrowLeft className="h-4 w-4 ms-1" /> : <ArrowRight className="h-4 w-4 ms-1" />}
            </Button>
          ) : (
            <Button onClick={() => setShowResults(true)} className="bg-accent hover:bg-accent/90 text-accent-foreground">
              <Sparkles className="h-4 w-4 me-1" /> {t('quizPage.seeResults')}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
