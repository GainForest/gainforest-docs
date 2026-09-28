/**
 * The words the docs use that a reader may not know, defined once.
 *
 * `remark-glossary` marks the first use of each term on a page; the hover
 * card reads the definition from here. Definitions are taken from how the
 * pages themselves describe the term, so the card and the page agree.
 * `match` is every spelling to look for, case-insensitive, whole words.
 */
export type GlossaryTerm = {
  id: string;
  term: string;
  match: readonly string[];
  definition: string;
  href?: string;
};

export const GLOSSARY: readonly GlossaryTerm[] = [
  {
    id: "bumicerts",
    term: "Bumicerts",
    match: ["Bumicerts"],
    definition:
      "GainForest.app's tools for turning environmental work into evidence-backed Projects that others can review and support.",
    href: "/bumicerts/what-is-bumicerts",
  },
  {
    id: "project",
    term: "Project",
    match: ["Project", "Projects"],
    definition:
      "The main unit on Bumicerts: one page that brings together the people, place, story, updates, and evidence behind environmental work.",
    href: "/bumicerts/what-is-a-project",
  },
  {
    id: "data-council",
    term: "Data Council",
    match: ["Data Council"],
    definition:
      "A small group of 3 to 5 local people who advise on data privacy, consent, and how Project data should be shared, published, or kept private.",
    href: "/organizations/data-council",
  },
  {
    id: "audiomoth",
    term: "AudioMoth",
    match: ["AudioMoth", "AudioMoths"],
    definition:
      "A small, low-cost acoustic recorder left in the field to capture soundscapes. Its recordings can be uploaded and linked to a Project as evidence.",
    href: "/evidence/bioacoustic-sensors",
  },
  {
    id: "taina",
    term: "Tainá",
    match: ["Tainá"],
    definition:
      "GainForest's Telegram field companion. Send a photo or note and she identifies the species and records the observation under your account.",
    href: "/taina",
  },
  {
    id: "bioblitz",
    term: "BioBlitz",
    match: ["BioBlitz"],
    definition:
      "A weekly challenge to photograph and upload as many living things as you can, with prizes each round.",
    href: "/opportunities/weekly-bioblitz-challenge",
  },
  {
    id: "mrv",
    term: "MRV",
    match: ["MRV"],
    definition:
      "Monitoring, Reporting, and Verification: how a nature project shows, with data, that the work it claims really happened.",
  },
  {
    id: "cdi",
    term: "Conservation Data Income",
    match: ["Conservation Data Income", "CDI"],
    definition:
      "GainForest's approach to rewarding communities for ecological data collection and stewardship knowledge.",
    href: "/conservation-data-income",
  },
  {
    id: "globe",
    term: "Globe",
    match: ["Globe"],
    definition:
      "A 3D map on GainForest.app for exploring organizations, Projects, and mapped environmental work around the world.",
    href: "/bumicerts/globe",
  },
  {
    id: "organization",
    term: "Organization",
    match: ["organization", "organizations"],
    definition:
      "A shared identity that lets a group act together on GainForest, from a registered nonprofit to an informal community group.",
    href: "/organizations",
  },
  {
    id: "local-champion",
    term: "Local champion",
    match: ["local champion"],
    definition:
      "Usually the person who applied for a grant. They receive Data Council stipends and pass each member their payment.",
  },
  {
    id: "kobotoolbox",
    term: "KoboToolbox",
    match: ["KoboToolbox"],
    definition:
      "A free tool for field surveys. Its exports can be sent to GainForest as a batch upload.",
    href: "/evidence/batch-uploads",
  },
  {
    id: "wallet",
    term: "Crypto wallet",
    match: ["crypto wallet", "wallet"],
    definition:
      "An app such as Rabby or MetaMask that holds an address for receiving funds. Prize and grant funds are sent to the wallet linked to your Project.",
  },
];

const BY_ID = new Map(GLOSSARY.map((t) => [t.id, t]));

export function glossaryTerm(id: string): GlossaryTerm | undefined {
  return BY_ID.get(id);
}
