"use client";

import { Flow, type Step } from "@/components/interactive/flow";

/** "Which upload do I need?" Every outcome is one of the five guides. */
const STEPS: Record<string, Step> = {
  start: {
    kind: "question",
    prompt: "What are you adding?",
    answers: [
      { label: "Photos of plants, animals, or fungi", hint: "Sightings from the field", next: "photos" },
      { label: "Sound recordings", hint: "From recorders left in the field", next: "sound" },
      { label: "A large archive or dataset", hint: "Many files, survey exports, spreadsheets", next: "batch" },
      { label: "Something already uploaded", hint: "Connect it to a Project", next: "link" },
    ],
  },
  photos: {
    kind: "question",
    prompt: "How would you like to add them?",
    answers: [
      { label: "On GainForest.app", hint: "Upload, review the species suggestion, add notes", next: "observations" },
      { label: "By chatting on Telegram", hint: "Tainá identifies the species for you", next: "taina" },
    ],
  },
  observations: {
    kind: "outcome",
    title: "Biodiversity observations",
    body: "The main self-serve flow: add photos, check the species suggestion, add notes, and link each observation to a Project.",
    href: "/evidence/biodiversity-observations",
  },
  taina: {
    kind: "outcome",
    title: "Tainá for observations",
    body: "Send Tainá a photo or a note on Telegram. She identifies the species and records the observation under your account.",
    href: "/evidence/taina-for-observations",
  },
  sound: {
    kind: "outcome",
    title: "Bioacoustic sensors",
    body: "Upload AudioMoth recordings and deployment records. AudioMoth is the bioacoustic sensor supported today.",
    href: "/evidence/bioacoustic-sensors",
  },
  batch: {
    kind: "outcome",
    title: "Batch uploads",
    body: "For archives too large to upload one at a time, such as many field photos or KoboToolbox exports. Batch upload is in beta and reviewed by the team.",
    href: "/evidence/batch-uploads",
  },
  link: {
    kind: "outcome",
    title: "Linking evidence to Projects",
    body: "Connect observations, files, and recordings you have already uploaded to the Project they support.",
    href: "/evidence/linking-evidence-to-projects",
  },
};

export function UploadPicker() {
  return <Flow title="Which upload do I need?" start="start" steps={STEPS} />;
}
