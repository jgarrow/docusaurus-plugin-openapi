import { ApiPageMetadata, InfoPageMetadata, TagPageMetadata } from "../types";
export declare function createApiPageMD({ title, api: { deprecated, "x-deprecated-description": deprecatedDescription, description, extensions, parameters, requestBody, responses, }, frontMatter, }: ApiPageMetadata): string;
export declare function createInfoPageMD({ info: { title, version, description, contact, license, termsOfService, logo, darkLogo, }, securitySchemes, downloadUrl, }: InfoPageMetadata): string;
export declare function createTagPageMD({ tag: { description } }: TagPageMetadata): string;
