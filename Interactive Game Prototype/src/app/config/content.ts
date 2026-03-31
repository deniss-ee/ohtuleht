// ─────────────────────────────────────────────────────────
// Centralised UI strings – single source of truth for all
// user-facing copy across the Intro, Game, and Outro screens.
// ─────────────────────────────────────────────────────────

export interface IntroScreenContent {
  mainHeader: string;
  subHeader: string;
  emailPlaceholder: string;
  consentLabel: string;
  startButton: string;
  footerOne: {
    text: string;
    termsLabel: string;
    termsUrl: string;
    privacyLabel: string;
    privacyUrl: string;
  };
  footerTwo: {
    text: string;
    linkLabel: string;
    linkUrl: string;
  };
  submission: {
    endpoint: string;
    campaignId: number;
    agrees: number[];
    errorText: string;
  };
}

export interface GameScreenContent {
  scoreLabel: string;
  livesLabel: string;
  scorePopup: string;
}

export interface OutroTier {
  minScore: number;
  header: string;
  subHeader: string;
}

export interface OutroScreenContent {
  scoreLabel: string;
  tiers: OutroTier[];
  ctaButton: string;
  ctaUrl: string;
  bottomHeader: string;
}

export interface AppContent {
  introScreen: IntroScreenContent;
  gameScreen: GameScreenContent;
  outroScreen: OutroScreenContent;
}

const APP_CONTENT: AppContent = {
  // ── Screen 1 – Intro ──────────────────────────────────
  introScreen: {
    mainHeader: "Mängi ja võid võita!",
    subHeader:
      "Aprillis loosime kõigi osalejate vahel igal nädalal välja Õhtuleht Kirjastuse üllatuspaki! Pane oma tähelepanu ja kiirus proovile. Meiega näed ja võidad rohkem!",
    emailPlaceholder: "E-mail",
    consentLabel:
      "Annan Õhtuleht Kirjastus AS-ile õiguse töödelda minu e-posti aadressi pakkumiste ja uudiskirjade saatmiseks.",
    startButton: "ALUSTAN",
    footerOne: {
      text: "Alustamiseks palun sisesta oma e-posti aadress, et saaksime sinuga võidu korral ühendust võtta. Jätkates nõustun, et olen tutvunud",
      termsLabel: "üldtingimustega",
      termsUrl: "https://www.ohtulehtkirjastus.ee/uldtingimused/",
      privacyLabel: "andmekaitsetingimustega",
      privacyUrl: "https://www.ohtulehtkirjastus.ee/andmekaitsetingimused/",
    },
    footerTwo: {
      text: "Loosimised toimuvad 10.04, 17.04, 24.04 ja 30.04.2026.",
      linkLabel: "Tutvu kampaaniatingimustega",
      linkUrl: "https://pood.ohtuleht.ee/mangukampaania",
    },
    submission: {
      endpoint: "https://s.ohtuleht.ee/customer/insert",
      campaignId: 65,
      agrees: [1, 54],
      errorText: "Midagi l\u00e4ks valesti. Palun proovi uuesti!",
    },
  },

  // ── Screen 2 – Game ────────────────────────────────────
  gameScreen: {
    scoreLabel: "Punktid:",
    livesLabel: "Elud:",
    scorePopup: "+10",
  },

  // ── Screen 3 – Outro / Result ──────────────────────────
  outroScreen: {
    scoreLabel: "Sinu tulemus:",
    tiers: [
      {
        minScore: 0,
        header: "PLACEHOLDER HEADER (< 100)",
        subHeader: "Placeholder subheader (< 100)",
      },
      {
        minScore: 100,
        header: "PLACEHOLDER HEADER (100+)",
        subHeader: "Placeholder subheader (100+)",
      },
      {
        minScore: 200,
        header: "PLACEHOLDER HEADER (200+)",
        subHeader: "Placeholder subheader (200+)",
      },
      {
        minScore: 300,
        header: "PLACEHOLDER HEADER (300+)",
        subHeader: "Placeholder subheader (300+)",
      },
    ],
    ctaButton: "LOE ÕHTULEHTE",
    ctaUrl: "https://ohtuleht.ee",
    bottomHeader: "Meiega näed rohkem!",
  },
} as const;

/**
 * Returns the highest tier whose `minScore` ≤ the given score.
 * Falls back to the first (lowest) tier if something goes wrong.
 */
export function getOutroTier(score: number): OutroTier {
  const tiers = APP_CONTENT.outroScreen.tiers;
  // Walk backwards from the highest tier
  for (let i = tiers.length - 1; i >= 0; i--) {
    if (score >= tiers[i].minScore) return tiers[i];
  }
  return tiers[0];
}

export default APP_CONTENT;
