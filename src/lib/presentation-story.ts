export type PresentationStepId =
  | 'journey'
  | 'overview'
  | 'wallet'
  | 'segments'
  | 'guests'
  | 'guest360'
  | 'leakage'
  | 'audience'
  | 'activation'
  | 'measurement'
  | 'simulator'
  | 'marketScan'
  | 'governance'
  | 'sourceMarkets'
  | 'corridorDetail'
  | 'acquisition';

export interface PresentationStep {
  id: PresentationStepId;
  title: string;
  href: string;
  match: 'exact' | 'prefix';
  presentationRole: string;
  observation: string;
  recommendedAction: string;
  nextHref: string;
  nextLabel: string;
  tourSummary: string;
}

export const presentationSteps: PresentationStep[] = [
  {
    id: 'journey',
    title: 'Journey',
    href: '/journey',
    match: 'exact',
    presentationRole: 'Agenda',
    observation: 'The product story is a closed loop: acquire, convert, capture, and grow.',
    recommendedAction: 'Use this as the meeting agenda, then move quickly into the wallet opportunity.',
    nextHref: '/',
    nextLabel: 'Open executive overview',
    tourSummary: 'Set up the closed-loop story before showing any detailed analytics.',
  },
  {
    id: 'overview',
    title: 'Overview',
    href: '/',
    match: 'exact',
    presentationRole: 'Executive opener',
    observation: 'Galaxy has a visible wallet gap and a ranked CDE-backed opportunity for the current quarter.',
    recommendedAction: 'Open with the matched base, wallet gap, and first recommended decision.',
    nextHref: '/wallet',
    nextLabel: 'Open wallet gap proof',
    tourSummary: 'Lead with the boardroom answer: where Galaxy should act first.',
  },
  {
    id: 'wallet',
    title: 'Wallet',
    href: '/wallet',
    match: 'exact',
    presentationRole: 'Gap proof',
    observation: 'Share-of-wallet evidence proves where Galaxy captures spend and where external wallet remains addressable.',
    recommendedAction: 'Show one selected segment and one category, then move to target selection.',
    nextHref: '/segments',
    nextLabel: 'Open target segments',
    tourSummary: 'Prove the wallet gap with one focused cut instead of touring every chart.',
  },
  {
    id: 'segments',
    title: 'Segments',
    href: '/segments',
    match: 'exact',
    presentationRole: 'Target choice',
    observation: 'The route contains the target segment, personas, evidence, plays, and CRM append proof in one workspace.',
    recommendedAction: 'Use only the selected segment, one reason-why card, and one recommended play in the live walkthrough.',
    nextHref: '/guests',
    nextLabel: 'Open guest priority',
    tourSummary: 'Choose the segment and explain why it deserves action now.',
  },
  {
    id: 'guests',
    title: 'Guests',
    href: '/guests',
    match: 'exact',
    presentationRole: 'Host action bridge',
    observation: 'The priority board translates segment strategy into a ranked host queue.',
    recommendedAction: 'Open the top lead quickly so the client sees who to contact and why.',
    nextHref: '/guests/MEM-%E2%80%A2%E2%80%A2%E2%80%A2%E2%80%A23421',
    nextLabel: 'Open top Customer 360',
    tourSummary: 'Show that the strategy becomes a real host action queue.',
  },
  {
    id: 'guest360',
    title: 'Customer 360',
    href: '/guests',
    match: 'prefix',
    presentationRole: 'Human proof point',
    observation: 'The page connects masked CRM identity, Galaxy first-party behavior, CDE enrichment, and next-best-action.',
    recommendedAction: 'Lead with what the host should do now, then show the evidence that supports it.',
    nextHref: '/propensity',
    nextLabel: 'Build target audience',
    tourSummary: 'Make the value human: who to contact, what to offer, what to say.',
  },
  {
    id: 'leakage',
    title: 'Leakage',
    href: '/leakage',
    match: 'exact',
    presentationRole: 'Opportunity proof',
    observation: 'The page proves where wallet leaves Galaxy across competitor hospitality, dining, entertainment, and luxury retail.',
    recommendedAction: 'Use the headline index, wallet-flow visual, and build-audience action; keep the table as backup evidence.',
    nextHref: '/propensity',
    nextLabel: 'Build win-back audience',
    tourSummary: 'Prove the recapture opportunity before audience creation.',
  },
  {
    id: 'audience',
    title: 'Audience',
    href: '/propensity',
    match: 'exact',
    presentationRole: 'Activation bridge',
    observation: 'The audience builder turns CDE-safe segment signals into a saveable activation audience.',
    recommendedAction: 'Preconfigure the selected segment so the client sees an audience ready to save.',
    nextHref: '/activation',
    nextLabel: 'Open next-best-action',
    tourSummary: 'Convert analysis into a target audience.',
  },
  {
    id: 'activation',
    title: 'Activation',
    href: '/activation',
    match: 'exact',
    presentationRole: 'Action hand-off',
    observation: 'The route turns a saved audience into Galaxy Rewards next-best-action cards.',
    recommendedAction: 'Show one recommended play first, then launch it into measurement.',
    nextHref: '/measurement',
    nextLabel: 'Review holdout proof',
    tourSummary: 'Show the payoff: the insight becomes a campaign action.',
  },
  {
    id: 'measurement',
    title: 'Measurement',
    href: '/measurement',
    match: 'exact',
    presentationRole: 'Proof close',
    observation: 'Measurement shows holdout proof and weekly lift without exposing raw customer-level CDE values.',
    recommendedAction: 'Show one holdout card and frame the method as test-versus-control, not loose attribution.',
    nextHref: '/governance',
    nextLabel: 'Open governance proof',
    tourSummary: 'Close the loop with causal proof before scaling.',
  },
  {
    id: 'simulator',
    title: 'Simulator',
    href: '/simulate',
    match: 'exact',
    presentationRole: 'Workshop tool',
    observation: 'The simulator is useful for exploring a chosen scenario after the client understands the core story.',
    recommendedAction: 'Use it only in workshop mode with one preloaded before-and-after scenario.',
    nextHref: '/activation',
    nextLabel: 'Return to action hand-off',
    tourSummary: 'Explore a what-if only after the main story lands.',
  },
  {
    id: 'marketScan',
    title: 'Market Scan',
    href: '/marketscan',
    match: 'exact',
    presentationRole: 'Appendix context',
    observation: 'The market scan adds synthetic context around external signals but is not the core CDE wallet proof.',
    recommendedAction: 'Frame it as a future companion board or appendix, not as the lead capability.',
    nextHref: '/governance',
    nextLabel: 'Open governance proof',
    tourSummary: 'Use market context as an appendix, not the main walkthrough.',
  },
  {
    id: 'governance',
    title: 'Governance',
    href: '/governance',
    match: 'exact',
    presentationRole: 'Trust close',
    observation: 'Governance explains modelled, aggregate, indexed, and auditable CDE controls.',
    recommendedAction: 'Close with three plain rules: no raw spend, masked records only, every answer traceable.',
    nextHref: '/corridors',
    nextLabel: 'Optional: open Lens B',
    tourSummary: 'End the main story by proving the experience is governed and CDE-safe.',
  },
  {
    id: 'sourceMarkets',
    title: 'Source Markets',
    href: '/corridors',
    match: 'exact',
    presentationRole: 'Lens B opener',
    observation: 'The route shifts from growing known guests to acquiring the next source markets.',
    recommendedAction: 'Introduce it as a second growth lens after the retention story is understood.',
    nextHref: '/corridors/korea',
    nextLabel: 'Open Korea detail',
    tourSummary: 'Open the acquisition chapter with the ranked corridor board.',
  },
  {
    id: 'corridorDetail',
    title: 'Korea Corridor',
    href: '/corridors',
    match: 'prefix',
    presentationRole: 'Corridor proof',
    observation: 'The corridor detail moves from aggregate source-market signal into persona, timing, offer, and content hand-off.',
    recommendedAction: 'Use Korea as one proof screen, then move quickly into the campaign content hand-off.',
    nextHref: '/acquisition?corridor=korea',
    nextLabel: 'Generate campaign content',
    tourSummary: 'Show why Korea is the priority corridor.',
  },
  {
    id: 'acquisition',
    title: 'Acquisition',
    href: '/acquisition',
    match: 'exact',
    presentationRole: 'Lens B hand-off',
    observation: 'The route converts corridor intelligence into deterministic campaign content without a live model call.',
    recommendedAction: 'Emphasize aggregate-only signals, no browser key, and no live AI dependency.',
    nextHref: '/journey',
    nextLabel: 'Return to journey',
    tourSummary: 'Close Lens B by showing acquisition intelligence becoming campaign content.',
  },
];

export const mainPresenterTourStops = [
  'journey',
  'overview',
  'wallet',
  'segments',
  'guests',
  'audience',
  'activation',
  'measurement',
  'governance',
].map((id) => presentationSteps.find((step) => step.id === id) as PresentationStep);

function normalizePathname(pathname: string) {
  if (!pathname || pathname === '/') return '/';
  const withoutQuery = pathname.split('?')[0] || '/';
  return withoutQuery.endsWith('/') && withoutQuery !== '/'
    ? withoutQuery.slice(0, -1)
    : withoutQuery;
}

export function resolvePresentationStep(pathname: string): PresentationStep {
  const normalizedPathname = normalizePathname(pathname);

  if (normalizedPathname.startsWith('/guests/')) {
    return presentationSteps.find((step) => step.id === 'guest360') as PresentationStep;
  }

  if (normalizedPathname.startsWith('/corridors/') && normalizedPathname !== '/corridors') {
    return presentationSteps.find((step) => step.id === 'corridorDetail') as PresentationStep;
  }

  return presentationSteps.find((step) => (
    step.match === 'exact' && step.href === normalizedPathname
  )) ?? presentationSteps.find((step) => step.id === 'overview') as PresentationStep;
}
