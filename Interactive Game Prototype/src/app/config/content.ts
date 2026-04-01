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
      "Aprillis loosime igal nädalal kõigi osalejate vahel välja Õhtuleht Kirjastuse üllatuspaki! Pane oma tähelepanu ja kiirus proovile. Meiega näed ja võidad rohkem!",
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
        header: "Juba päris hea! Natuke veel ja Õ-d on sinu! Juba selle töönädala lõpus selgub võitja!",
        subHeader: "Seniks hoia ennast kursis viimaste uudistega.",
      },
      {
        minScore: 100,
        header: "Õ-d kadusid kiiremini kui ilmusid! Väga tubli! Juba selle töönädala lõpus selgub võitja!",
        subHeader: "Seniks hoia ennast kursis viimaste uudistega.",
      },
      {
        minScore: 200,
        header: "Sa oled Õ-tähtede magnet! Super! Juba selle töönädala lõpus selgub võitja!",
        subHeader: "Seniks hoia ennast kursis viimaste uudistega.",
      },
      {
        minScore: 300,
        header: "Absoluutne tipp – Õ-meistrite meister! Erakordne saavutus! Juba selle töönädala lõpus selgub võitja!",
        subHeader: "Seniks hoia ennast kursis viimaste uudistega.",
      },
    ],
    ctaButton: "TELLI.OHTULEHT.EE",
    ctaUrl: "http://telli.ohtuleht.ee/",
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
