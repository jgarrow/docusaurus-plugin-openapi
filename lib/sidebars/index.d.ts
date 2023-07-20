import { ProcessedSidebar } from "@docusaurus/plugin-content-docs/src/sidebars/types";
import { TagObject } from "../openapi/types";
import type { SidebarOptions, APIOptions, ApiMetadata } from "../types";
type GenerateSidebarSliceArgs = {
    sidebarOptions: SidebarOptions;
    options: APIOptions;
    api: ApiMetadata[];
    tags: TagObject[][];
    nonApiMdxFiles: string[] | [];
    docPath: string;
};
export default function generateSidebarSlice({ sidebarOptions, options, api, tags, nonApiMdxFiles, docPath, }: GenerateSidebarSliceArgs): ProcessedSidebar;
export {};
