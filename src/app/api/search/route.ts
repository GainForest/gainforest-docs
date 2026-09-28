import { createFromSource } from "fumadocs-core/search/server";

import { source } from "@/lib/source";

export const revalidate = false;

/** A static index, built once and searched in the browser. No service to run. */
export const { staticGET: GET } = createFromSource(source, { language: "english" });
