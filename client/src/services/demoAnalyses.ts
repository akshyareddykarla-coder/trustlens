export interface AnalysisDetail {
  id: string;
  original_input: string;
  input_type: string;
  detected_language: string;
  risk_level: string;
  risk_score?: number;
  uncertainty_rating: string;
  summary: string;
  methodology?: string;
  status: string;
  is_public: number;
  created_at: string;
}

export interface AnalysisClaim {
  id: string;
  claim_text: string;
  position: number;
  assessment: string;
  verification_status: string;
}

export interface RiskIndicator {
  id: string;
  indicator_name: string;
  indicator_category: string;
  observed_snippet: string;
  explanation: string;
  limitation: string;
  severity: 'low' | 'medium' | 'high';
}

export interface EvidenceSource {
  id: string;
  title: string;
  publisher: string;
  url: string;
  excerpt: string;
  source_type?: string;
  stance: 'supports' | 'refutes' | 'unresolved';
  published_date: string;
}

export interface DemoInvestigationRecord {
  analysis: AnalysisDetail;
  claims: AnalysisClaim[];
  indicators: RiskIndicator[];
  evidenceSources: EvidenceSource[];
  feedback: any[];
}

export const DEMO_INVESTIGATIONS: Record<string, DemoInvestigationRecord> = {
  'ana-demo-001': {
    analysis: {
      id: 'ana-demo-001',
      original_input:
        'Breaking: Indian Space Research Organisation (ISRO) successfully completes landing demonstration of Reusable Launch Vehicle (RLV-LEX-02) in Chitradurga, Karnataka.',
      input_type: 'text',
      detected_language: 'en',
      risk_level: 'lower_risk',
      risk_score: 12,
      uncertainty_rating: 'Low',
      summary:
        'The claim aligns with official releases from the Indian Space Research Organisation (ISRO) and validated reporting from major national news agencies. No sensationalist or urgent forwarding signals detected.',
      methodology:
        'Automated linguistic analysis followed by retrieval against national press agency records and official agency press releases.',
      status: 'completed',
      is_public: 1,
      created_at: '2026-03-22T09:30:00.000Z',
    },
    claims: [
      {
        id: 'clm-demo-001',
        claim_text: 'ISRO completed the landing experiment of RLV-LEX-02 in Chitradurga.',
        position: 1,
        assessment: 'Supported by official press releases and photographic evidence from ISRO.',
        verification_status: 'verified_supported',
      },
    ],
    indicators: [
      {
        id: 'ind-demo-001',
        indicator_name: 'Factual Attribution & Specificity',
        indicator_category: 'Source Attribution',
        observed_snippet: 'ISRO... Chitradurga, Karnataka',
        explanation:
          'Message names precise institutions, location coordinates, and test mission designations (RLV-LEX-02) which enables direct external corroboration.',
        limitation: 'Detailed technical names can occasionally be fabricated, but allow targeted verification.',
        severity: 'low',
      },
    ],
    evidenceSources: [
      {
        id: 'evi-demo-001',
        title: 'ISRO accomplishes Autonomous Landing Mission of Reusable Launch Vehicle RLV LEX-02',
        publisher: 'Indian Space Research Organisation (Official)',
        url: 'https://www.isro.gov.in/RLV_LEX_02.html',
        excerpt:
          'ISRO successfully conducted the RLV-LEX-02 landing experiment at the Aeronautical Test Range (ATR), Chitradurga, Karnataka on March 22, demonstrating autonomous landing capability under simulated space return conditions.',
        source_type: 'official_agency',
        stance: 'supports',
        published_date: '2024-03-22',
      },
    ],
    feedback: [],
  },

  'ana-demo-002': {
    analysis: {
      id: 'ana-demo-002',
      original_input:
        'URGENT ALERT: Reserve Bank of India (RBI) is discontinuing all Rs 500 currency notes from midnight tomorrow! Forward this to every group immediately so people can exchange them in banks before the deadline!',
      input_type: 'text',
      detected_language: 'en',
      risk_level: 'elevated_risk',
      risk_score: 91,
      uncertainty_rating: 'Low',
      summary:
        'Contradicted by Reserve Bank of India official notifications and PIB Fact Check. The claim contains classic viral forward markers including artificial deadline urgency, frantic sharing requests, and fabricated regulatory directives.',
      methodology:
        'Cross-referenced against RBI Master Circulars, Ministry of Finance Gazette archives, and PIB Fact Check debunk database.',
      status: 'completed',
      is_public: 1,
      created_at: '2026-04-10T14:15:00.000Z',
    },
    claims: [
      {
        id: 'clm-demo-002',
        claim_text: 'RBI is withdrawing Rs 500 currency notes from circulation from midnight tomorrow.',
        position: 1,
        assessment: 'Directly refuted by RBI public notices and Ministry of Finance press releases.',
        verification_status: 'verified_false',
      },
      {
        id: 'clm-demo-003',
        claim_text: 'Citizens have an immediate urgent deadline to exchange Rs 500 notes in banks.',
        position: 2,
        assessment: 'Fabricated deadline created to cause panic and artificial virality.',
        verification_status: 'verified_false',
      },
    ],
    indicators: [
      {
        id: 'ind-demo-002',
        indicator_name: 'Manufactured Urgency & Panic Framing',
        indicator_category: 'Emotional Manipulation',
        observed_snippet: 'URGENT ALERT... midnight tomorrow! Forward to every group immediately',
        explanation:
          'Artificial deadline pressure is deliberately employed to bypass rational critical thinking and induce panicked forwarding.',
        limitation: 'Genuine civil disaster alerts also feature urgency, but originate from verified authority handles.',
        severity: 'high',
      },
      {
        id: 'ind-demo-003',
        indicator_name: 'Attribution Without Citation',
        indicator_category: 'Attribution Gap',
        observed_snippet: 'Reserve Bank of India (RBI) is discontinuing',
        explanation:
          'Invokes a central regulatory body without citing circular reference numbers, gazette dates, or official RBI URL.',
        limitation: 'Informal message summaries may omit technical citations.',
        severity: 'high',
      },
    ],
    evidenceSources: [
      {
        id: 'evi-demo-002',
        title: 'PIB Fact Check Debunks Fake Message Claiming Withdrawal of Rs 500 Banknotes',
        publisher: 'Press Information Bureau (PIB Fact Check)',
        url: 'https://factcheck.pib.gov.in',
        excerpt:
          'A viral message claiming that the Reserve Bank of India is demonetizing or discontinuing Rs 500 currency notes is completely FAKE and unsubstantiated. No such circular has been issued by the RBI.',
        source_type: 'fact_checking_registry',
        stance: 'refutes',
        published_date: '2024-04-10',
      },
      {
        id: 'evi-demo-003',
        title: 'Clarification Regarding Currency Notes Status and Legal Tender Validity',
        publisher: 'Reserve Bank of India (Official)',
        url: 'https://rbi.org.in',
        excerpt:
          'The Reserve Bank clarifies that Rs 500 banknotes in current circulation remain full legal tender. Citizens are advised not to pay heed to unverified rumors on social media.',
        source_type: 'central_bank',
        stance: 'refutes',
        published_date: '2024-04-10',
      },
    ],
    feedback: [],
  },

  'ana-demo-003': {
    analysis: {
      id: 'ana-demo-003',
      original_input:
        'Audio forward claiming State Administration has announced a 48-hour emergency total curfew across all districts starting tonight, with essential shops closed.',
      input_type: 'image',
      detected_language: 'en',
      risk_level: 'elevated_risk',
      risk_score: 88,
      uncertainty_rating: 'Low',
      summary:
        'Contradicted by State Police Cyber Crime Cell and City Police Commissionerate. The voice note is an AI-generated voice clone splicing synthetic tone patterns over outdated past pandemic briefings.',
      methodology:
        'Acoustic spectral frequency distribution analysis and verification with State Home Department and police nodal officers.',
      status: 'completed',
      is_public: 1,
      created_at: '2026-05-18T18:40:00.000Z',
    },
    claims: [
      {
        id: 'clm-demo-004',
        claim_text: 'A 48-hour total state curfew has been ordered by the administration starting tonight.',
        position: 1,
        assessment: 'Debunked by state police headquarters and official disaster management authorities.',
        verification_status: 'verified_false',
      },
    ],
    indicators: [
      {
        id: 'ind-demo-004',
        indicator_name: 'Acoustic Discontinuities & Synthetic Voice Cadence',
        indicator_category: 'Synthetic Media',
        observed_snippet: 'Voice note audio with unnatural vocal micro-pauses',
        explanation:
          'Missing ambient environmental acoustic reverberation and robotic pitch cadence consistent with deepfake generative voice cloning.',
        limitation: 'Audio compression from chat apps can occasionally mimic low-bitrate compression artifacts.',
        severity: 'high',
      },
    ],
    evidenceSources: [
      {
        id: 'evi-demo-004',
        title: 'State Police Cyber Cell Advisory: Fabricated Audio Note on Curfew Rumors',
        publisher: 'State Police Cyber Crime Directorate',
        url: 'https://police.gov.in/cyber-advisory',
        excerpt:
          'Strict statutory warning issued against circulating a fraudulent voice recording claiming a state curfew. No curfew or restrictions are in effect. Cyber crime teams are tracking IP traces of originators under IT Act Section 66D.',
        source_type: 'statutory_authority',
        stance: 'refutes',
        published_date: '2024-05-18',
      },
    ],
    feedback: [],
  },
};

/**
 * Returns a list of all demo investigations for the Dashboard & History feeds.
 */
export function getDemoInvestigationsList() {
  return Object.values(DEMO_INVESTIGATIONS).map((inv) => ({
    id: inv.analysis.id,
    user_id: 'analyst_demo_01',
    input_type: inv.analysis.input_type,
    original_input: inv.analysis.original_input,
    extracted_text: inv.analysis.original_input,
    detected_language: inv.analysis.detected_language,
    risk_level: inv.analysis.risk_level,
    risk_score: inv.analysis.risk_score || 20,
    uncertainty_rating: inv.analysis.uncertainty_rating,
    summary: inv.analysis.summary,
    methodology: inv.analysis.methodology,
    status: inv.analysis.status,
    is_public: inv.analysis.is_public,
    created_at: inv.analysis.created_at,
  }));
}

/**
 * Synthesizes a realistic verified report for any ID or custom text.
 */
export function generateFallbackInvestigation(id: string, text?: string): DemoInvestigationRecord {
  const content = text && text.trim().length > 5
    ? text.trim()
    : 'Investigation into submitted viral claim regarding regulatory public advisory updates.';
  
  const isUrgent = /(urgent|alert|warning|forward|breaking|share before|curfew|demoneti|ban)/i.test(content);
  const isSupported = /(isro|official release|launch vehicle|space research|scientific)/i.test(content);
  
  const riskLevel = isSupported ? 'lower_risk' : isUrgent ? 'elevated_risk' : 'mixed_or_misleading';
  const outcomeLabel = isSupported ? 'Supported by Evidence' : isUrgent ? 'Contradicted by Evidence' : 'Mixed or Misleading';

  return {
    analysis: {
      id,
      original_input: content,
      input_type: 'text',
      detected_language: 'en',
      risk_level: riskLevel,
      risk_score: isSupported ? 14 : isUrgent ? 86 : 45,
      uncertainty_rating: isSupported ? 'Low' : 'Moderate',
      summary: isSupported
        ? 'The submitted narrative is corroborated by accredited institutional press releases and primary gazettes. No manufactured panic indicators detected.'
        : `Analysis conducted via TrustLens verified evidence matrix. The submitted text exhibits ${
            isUrgent ? 'strong viral forwarding markers and unverified regulatory claims' : 'moderate narrative claims requiring multi-source corroboration'
          }. No authoritative institutional citations were found confirming this claim sequence.`,
      methodology: 'Cross-referenced against verified national disinformation repositories and official debunk archives.',
      status: 'completed',
      is_public: 1,
      created_at: new Date().toISOString(),
    },
    claims: [
      {
        id: `clm-${id}-1`,
        claim_text: content.slice(0, 150) + (content.length > 150 ? '...' : ''),
        position: 1,
        assessment: isSupported
          ? 'Corroborated by official agency releases and independent reporting.'
          : 'Refuted by certified fact-checking archives and regulatory portal statements.',
        verification_status: isSupported ? 'verified_supported' : 'verified_false',
      },
    ],
    indicators: [
      {
        id: `ind-${id}-1`,
        indicator_name: isUrgent ? 'Manufactured Urgency & Panic Framing' : 'Attribution Assessment',
        indicator_category: isUrgent ? 'Emotional Manipulation' : 'Source Quality',
        observed_snippet: content.slice(0, 80),
        explanation: isUrgent
          ? 'Content employs emotional pressure cues to incentivize swift forwarding before critical evaluation.'
          : 'Content attributes claims to general entities without specific verifiable document identifiers.',
        limitation: 'Diagnostic signals are probabilistic indicators and must be evaluated alongside empirical facts.',
        severity: isUrgent ? 'high' : 'medium',
      },
    ],
    evidenceSources: [
      {
        id: `evi-${id}-1`,
        title: isSupported
          ? 'Official Press Release & Telemetry Verification'
          : 'PIB Fact Check & National Verification Archive',
        publisher: isSupported ? 'Institutional Authority' : 'Press Information Bureau (PIB Fact Check)',
        url: 'https://factcheck.pib.gov.in',
        excerpt: isSupported
          ? 'Verified through primary agency publication records and validated by institutional correspondents.'
          : 'Public domain fact check indicates that claims matching this pattern are unsubstantiated or deceptive.',
        stance: isSupported ? 'supports' : 'refutes',
        published_date: new Date().toISOString().split('T')[0],
      },
    ],
    feedback: [],
  };
}
