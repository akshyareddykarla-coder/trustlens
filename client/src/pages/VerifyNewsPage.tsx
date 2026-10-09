import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  FileText,
  Image as ImageIcon,
  Link2,
  Sparkles,
  ArrowRight,
  RotateCcw,
  Upload,
  AlertCircle,
  CheckCircle2,
  Languages,
  Loader2,
  ShieldAlert,
} from 'lucide-react';
import { api } from '../services/api.js';

export const VerifyNewsPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [activeTab, setActiveTab] = useState<'text' | 'image' | 'url'>('text');
  const [textContent, setTextContent] = useState(searchParams.get('q') || '');
  const [selectedLanguage, setSelectedLanguage] = useState<'auto' | 'en' | 'te' | 'hi'>('auto');

  // Image Upload state
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrConfidence, setOcrConfidence] = useState<number | null>(null);

  // URL state
  const [articleUrl, setArticleUrl] = useState('');
  const [urlLoading, setUrlLoading] = useState(false);
  const [urlTitle, setUrlTitle] = useState<string | null>(null);

  // Overall analysis state
  const [analyzing, setAnalyzing] = useState(false);
  const [pipelineStep, setPipelineStep] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const q = searchParams.get('q');
    if (q) setTextContent(q);
  }, [searchParams]);

  // Clean preview URL on unmount or file change
  useEffect(() => {
    return () => {
      if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl);
    };
  }, [imagePreviewUrl]);

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
      setError('Please upload a PNG, JPG, or WebP image file.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('Image size exceeds 10MB limit.');
      return;
    }

    setError(null);
    setSelectedImage(file);
    setImagePreviewUrl(URL.createObjectURL(file));

    // Run OCR extraction
    setOcrLoading(true);
    setPipelineStep('Running OCR extraction with Tesseract.js...');

    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('language', selectedLanguage === 'auto' ? 'eng' : selectedLanguage);

      const result = await api.uploadOcrImage(formData);
      setTextContent(result.extractedText || '');
      setOcrConfidence(result.confidence || null);
    } catch (err: any) {
      setError(`OCR extraction encountered an issue: ${err.message}. You can manually type or paste the message.`);
    } finally {
      setOcrLoading(false);
      setPipelineStep(null);
    }
  };

  const handleUrlFetch = async () => {
    if (!articleUrl.trim()) return;
    setError(null);
    setUrlLoading(true);
    setPipelineStep('Applying SSRF security policy and retrieving article...');

    try {
      const result = await api.previewUrl(articleUrl.trim());
      setUrlTitle(result.title);
      setTextContent(result.extractedText);
    } catch (err: any) {
      setError(`Article retrieval blocked or failed: ${err.message}. Please copy and paste the article text manually.`);
    } finally {
      setUrlLoading(false);
      setPipelineStep(null);
    }
  };

  const handleRunAnalysis = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!textContent || textContent.trim().length < 5) {
      setError('Please enter at least 5 characters of claim text to analyze.');
      return;
    }

    setError(null);
    setAnalyzing(true);

    try {
      setPipelineStep('Step 1/3: Analyzing linguistic patterns & emotional markers...');
      await new Promise((r) => setTimeout(r, 400));

      setPipelineStep('Step 2/3: Cross-referencing fact-checking registries & live sources...');
      await new Promise((r) => setTimeout(r, 400));

      setPipelineStep('Step 3/3: Synthesizing explainable report & uncertainties...');

      const result = await api.createAnalysis({
        inputType: activeTab,
        content: textContent.trim(),
        language: selectedLanguage,
        sourceUrl: activeTab === 'url' ? articleUrl : undefined,
      });

      navigate(`/analysis/${result.id}`);
    } catch (err: any) {
      setError(err.message || 'Analysis failed. Please try again.');
      setAnalyzing(false);
      setPipelineStep(null);
    }
  };

  const handleReset = () => {
    setTextContent('');
    setSelectedImage(null);
    if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl);
    setImagePreviewUrl(null);
    setArticleUrl('');
    setUrlTitle(null);
    setOcrConfidence(null);
    setError(null);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Workspace Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 text-xs font-semibold mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Multimodal News Verification Desk</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100">
          Verify Claims & News Stories
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
          Paste text from viral forwards, upload screenshot images for OCR extraction, or enter public web article links.
        </p>
      </div>

      {/* Input Mode Tabs */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
        <div className="flex border-b border-slate-200 dark:border-slate-800 pb-3 gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('text')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'text'
                ? 'bg-teal-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Text / Message</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('image')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'image'
                ? 'bg-teal-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            <span>Screenshot OCR</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('url')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'url'
                ? 'bg-teal-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Link2 className="w-4 h-4" />
            <span>Article URL</span>
          </button>
        </div>

        {/* Tab Specific Input Fields */}
        <div className="mt-5 space-y-4">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-200 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* 1. IMAGE UPLOAD TAB PANEL */}
          {activeTab === 'image' && (
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 space-y-4">
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <label className="flex-1 w-full flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl cursor-pointer hover:border-teal-500 transition-colors bg-white dark:bg-slate-900">
                  <Upload className="w-8 h-8 text-teal-600 mb-2" />
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    Click to upload screenshot or drag & drop
                  </span>
                  <span className="text-[11px] text-slate-400 mt-0.5">PNG, JPG, or WebP (Max 10MB)</span>
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={handleImageSelect}
                    className="hidden"
                  />
                </label>

                {imagePreviewUrl && (
                  <div className="w-40 h-32 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 relative bg-slate-100 dark:bg-slate-800 flex-shrink-0">
                    <img src={imagePreviewUrl} alt="Screenshot Preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedImage(null);
                        setImagePreviewUrl(null);
                        setOcrConfidence(null);
                      }}
                      className="absolute top-1 right-1 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>

              {ocrLoading && (
                <div className="flex items-center gap-2 text-xs text-teal-600 dark:text-teal-400 font-medium">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Extracting text with Tesseract.js OCR engine...</span>
                </div>
              )}

              {ocrConfidence !== null && (
                <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 font-medium bg-emerald-50 dark:bg-emerald-950/30 p-2.5 rounded-lg border border-emerald-200 dark:border-emerald-900">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>OCR text extracted with {ocrConfidence}% confidence. Please review the extracted text below before analyzing.</span>
                </div>
              )}
            </div>
          )}

          {/* 2. URL INPUT TAB PANEL */}
          {activeTab === 'url' && (
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 space-y-3">
              <div className="flex gap-2">
                <input
                  type="url"
                  value={articleUrl}
                  onChange={(e) => setArticleUrl(e.target.value)}
                  placeholder="https://example.com/article-to-verify"
                  className="flex-1 px-3.5 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-600/50 text-slate-800 dark:text-slate-100"
                />
                <button
                  type="button"
                  onClick={handleUrlFetch}
                  disabled={urlLoading || !articleUrl.trim()}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 disabled:opacity-50 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  {urlLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Link2 className="w-3.5 h-3.5" />}
                  <span>Fetch Content</span>
                </button>
              </div>

              {urlTitle && (
                <div className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                  Retrieved Article: <strong>{urlTitle}</strong>
                </div>
              )}

              <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-teal-600" />
                <span>Protected by Server-Side SSRF Guard: Private IPs, loopbacks, and credentials strictly blocked.</span>
              </div>
            </div>
          )}

          {/* 3. CORE TEXT CONTENT AREA (Shown in all tabs for inspection/editing) */}
          <div>
            <div className="flex items-center justify-between mb-1.5 text-xs text-slate-600 dark:text-slate-400">
              <label htmlFor="claim-text" className="font-semibold text-slate-700 dark:text-slate-300">
                {activeTab === 'image' ? 'Extracted Screenshot Text (Review & Edit)' : activeTab === 'url' ? 'Extracted Article Content' : 'Claim Text or Forwarded Message'}
              </label>
              <span>{textContent.length} / 15,000 characters</span>
            </div>

            <textarea
              id="claim-text"
              rows={6}
              value={textContent}
              onChange={(e) => setTextContent(e.target.value)}
              placeholder="Paste the statement, headline, or forwarded WhatsApp text here..."
              className="w-full p-4 text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-600/50 text-slate-900 dark:text-slate-100 leading-relaxed font-sans placeholder-slate-400 resize-y"
            />
          </div>

          {/* Language selector & Controls */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
            <div className="flex items-center gap-2 text-xs">
              <Languages className="w-4 h-4 text-slate-400" />
              <span className="font-medium text-slate-600 dark:text-slate-300">Language:</span>
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value as any)}
                className="px-2.5 py-1.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-800 dark:text-slate-200"
              >
                <option value="auto">Auto Detect</option>
                <option value="en">English</option>
                <option value="te">తెలుగు (Telugu)</option>
                <option value="hi">हिन्दी (Hindi)</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleReset}
                className="px-3 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-1.5 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>

              <button
                type="button"
                onClick={handleRunAnalysis}
                disabled={analyzing || !textContent.trim()}
                className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-semibold text-xs rounded-xl shadow-sm transition-colors flex items-center gap-2"
              >
                {analyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <span>Run Verification Analysis</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Live Progress Banner */}
          {analyzing && pipelineStep && (
            <div className="mt-4 p-4 rounded-xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-900 text-xs text-teal-900 dark:text-teal-200 flex items-center gap-3">
              <Loader2 className="w-4 h-4 text-teal-600 animate-spin flex-shrink-0" />
              <span className="font-medium">{pipelineStep}</span>
            </div>
          )}
        </div>
      </div>

      {/* Verified Sample Claims (Clearly Labeled) */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6">
        <h3 className="font-semibold text-xs uppercase tracking-wider text-slate-500 mb-3">
          Explore Demonstrative Test Cases (Pre-configured Inquiries)
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            type="button"
            onClick={() => {
              setActiveTab('text');
              setTextContent('PIB warns against fake recruitment letter claiming to offer railway posts for Rs 5000 deposit fee into personal UPI.');
            }}
            className="p-3 text-left rounded-xl border border-slate-200 dark:border-slate-800 hover:border-teal-500 bg-slate-50 dark:bg-slate-800/40 text-xs transition-colors"
          >
            <div className="font-semibold text-slate-800 dark:text-slate-200">Government Job Scam</div>
            <div className="text-[11px] text-slate-500 mt-1 line-clamp-2">PIB alerts against fake railway recruitment deposit letters.</div>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('text');
              setTextContent('Indian Space Research Organisation (ISRO) successfully completes landing demonstration of Reusable Launch Vehicle (RLV-LEX-02) in Chitradurga.');
            }}
            className="p-3 text-left rounded-xl border border-slate-200 dark:border-slate-800 hover:border-teal-500 bg-slate-50 dark:bg-slate-800/40 text-xs transition-colors"
          >
            <div className="font-semibold text-slate-800 dark:text-slate-200">Space Technology Report</div>
            <div className="text-[11px] text-slate-500 mt-1 line-clamp-2">Autonomous landing experiment verified by agency release.</div>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('text');
              setTextContent('ఈ సమాచారాన్ని వెంటనే షేర్ చేయండి: అత్యవసర హెచ్చరిక, డిలీట్ కాకముందే చూడండి.');
              setSelectedLanguage('te');
            }}
            className="p-3 text-left rounded-xl border border-slate-200 dark:border-slate-800 hover:border-teal-500 bg-slate-50 dark:bg-slate-800/40 text-xs transition-colors"
          >
            <div className="font-semibold text-slate-800 dark:text-slate-200">Telugu WhatsApp Viral</div>
            <div className="text-[11px] text-slate-500 mt-1 line-clamp-2">సంచలన మరియు అత్యవసర పదజాలం కలిగిన సందేశం.</div>
          </button>
        </div>
      </div>
    </div>
  );
};
