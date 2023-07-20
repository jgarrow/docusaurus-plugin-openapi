"use strict";
/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const utils_1 = require("@docusaurus/utils");
const clsx_1 = __importDefault(require("clsx"));
const gray_matter_1 = __importDefault(require("gray-matter"));
const lodash_1 = require("lodash");
const uniq_1 = __importDefault(require("lodash/uniq"));
function isApiItem(item) {
    return item.type === "api";
}
function isInfoItem(item) {
    return item.type === "info";
}
function groupByTags({ items, sidebarOptions, options, tags, nonApiMdxFiles, docPath, }) {
    let { outputDir, label } = options;
    // Remove trailing slash before proceeding
    outputDir = outputDir.replace(/\/$/, "");
    const { sidebarCollapsed, sidebarCollapsible, customProps, categoryLinkSource, } = sidebarOptions;
    const apiItems = items.filter(isApiItem);
    const infoItems = items.filter(isInfoItem);
    const intros = infoItems.map((item) => {
        return {
            id: item.id,
            title: item.title,
            description: item.description,
            tags: item.info.tags,
        };
    });
    const nonApiItems = nonApiMdxFiles
        .map((item) => {
        const itemFilePath = path_1.default.join(outputDir, item);
        const itemFileContents = fs_1.default.readFileSync(itemFilePath, "utf8");
        const { data: frontmatter } = (0, gray_matter_1.default)(itemFileContents);
        if (frontmatter === null || frontmatter === void 0 ? void 0 : frontmatter.draft) {
            return null;
        }
        return frontmatter;
    })
        .filter(Boolean);
    // TODO: make sure we only take the first tag
    const operationTags = (0, uniq_1.default)(apiItems
        .flatMap((item) => item.api.tags)
        .filter((item) => !!item));
    // Combine globally defined tags with operation tags
    // Only include global tag if referenced in operation tags
    let apiTags = [];
    tags.flat().forEach((tag) => {
        // Should we also check x-displayName?
        if (operationTags.includes(tag.name)) {
            apiTags.push(tag.name);
        }
    });
    apiTags = (0, uniq_1.default)(apiTags.concat(operationTags));
    const basePath = docPath
        ? outputDir.split(docPath)[1].replace(/^\/+/g, "")
        : outputDir.slice(outputDir.indexOf("/", 1)).replace(/^\/+/g, "");
    function createDocItem(item) {
        var _a, _b;
        const sidebar_label = item.frontMatter.sidebar_label;
        const title = item.title;
        const id = item.id;
        return {
            type: "doc",
            id: basePath === "" || undefined ? `${item.id}` : `${basePath}/${item.id}`,
            label: (_b = (_a = sidebar_label) !== null && _a !== void 0 ? _a : title) !== null && _b !== void 0 ? _b : id,
            customProps: customProps,
            className: (0, clsx_1.default)({
                "menu__list-item--deprecated": item.api.deprecated,
                "api-method": !!item.api.method,
            }, item.api.method),
        };
    }
    function createNonApiDocItem(item) {
        var _a, _b;
        const { sidebar_label, title, id } = item;
        return {
            type: "doc",
            id: basePath === "" || undefined ? `${id}` : `${basePath}/${id}`,
            label: (_b = (_a = sidebar_label) !== null && _a !== void 0 ? _a : title) !== null && _b !== void 0 ? _b : id,
            customProps,
        };
    }
    let rootIntroDoc = undefined;
    if (infoItems.length === 1) {
        const infoItem = infoItems[0];
        const id = infoItem.id;
        rootIntroDoc = {
            type: "doc",
            id: basePath === "" || undefined ? `${id}` : `${basePath}/${id}`,
        };
    }
    const tagged = apiTags
        .map((tag) => {
        var _a;
        // Map info object to tag
        const taggedInfoObject = intros.find((i) => i.tags ? i.tags.find((t) => t.name === tag) : undefined);
        const tagObject = tags.flat().find((t) => {
            var _a;
            return (_a = tag === t.name) !== null && _a !== void 0 ? _a : {
                name: tag,
                description: `${tag} Index`,
            };
        });
        // TODO: perhaps move this into a getLinkConfig() function
        let linkConfig = undefined;
        if (taggedInfoObject !== undefined && categoryLinkSource === "info") {
            linkConfig = {
                type: "doc",
                id: basePath === "" || undefined
                    ? `${taggedInfoObject.id}`
                    : `${basePath}/${taggedInfoObject.id}`,
            };
        }
        // TODO: perhaps move this into a getLinkConfig() function
        if (tagObject !== undefined && categoryLinkSource === "tag") {
            const tagId = (0, lodash_1.kebabCase)(tagObject.name);
            linkConfig = {
                type: "doc",
                id: basePath === "" || undefined ? `${tagId}` : `${basePath}/${tagId}`,
            };
        }
        // Default behavior
        if (categoryLinkSource === undefined) {
            linkConfig = {
                type: "generated-index",
                title: tag,
                slug: label
                    ? (0, utils_1.posixPath)(path_1.default.join("/category", basePath, (0, lodash_1.kebabCase)(label), (0, lodash_1.kebabCase)(tag)))
                    : (0, utils_1.posixPath)(path_1.default.join("/category", basePath, (0, lodash_1.kebabCase)(tag))),
            };
        }
        const tagApiItems = apiItems
            .filter((item) => { var _a; return !!((_a = item.api.tags) === null || _a === void 0 ? void 0 : _a.includes(tag)); })
            .map(createDocItem);
        const tagNonApiItems = nonApiItems
            .filter((i) => i.api_tags ? i.api_tags.find((t) => t === tag) : false)
            .map(createNonApiDocItem);
        const items = [...tagNonApiItems, ...tagApiItems];
        const tagObjectLabel = (_a = tagObject === null || tagObject === void 0 ? void 0 : tagObject["x-displayName"]) !== null && _a !== void 0 ? _a : tag;
        const uppercaseLabel = tagObjectLabel.charAt(0).toUpperCase() + tagObjectLabel.slice(1);
        return {
            type: "category",
            label: uppercaseLabel,
            link: linkConfig,
            collapsible: sidebarCollapsible,
            collapsed: sidebarCollapsed,
            items,
        };
    })
        .filter((item) => item.items.length > 0); // Filter out any categories with no items.
    // Handle items with no tag
    const untaggedApiItems = apiItems
        .filter(({ api }) => api.tags === undefined || api.tags.length === 0)
        .map(createDocItem);
    const untaggedNonApiItems = nonApiItems
        .filter((i) => i.api_tags === undefined || i.api_tags.length === 0)
        .map(createNonApiDocItem);
    const untaggedItems = [...untaggedNonApiItems, ...untaggedApiItems];
    let untagged = [];
    if (untaggedItems.length > 0) {
        untagged = [
            {
                type: "category",
                label: "UNTAGGED",
                collapsible: sidebarCollapsible,
                collapsed: sidebarCollapsed,
                items: untaggedItems,
            },
        ];
    }
    // Shift root intro doc to top of sidebar
    // TODO: Add input validation for categoryLinkSource options
    if (rootIntroDoc && categoryLinkSource !== "info") {
        tagged.unshift(rootIntroDoc);
    }
    return [...tagged, ...untagged];
}
function generateSidebarSlice({ sidebarOptions, options, api, tags, nonApiMdxFiles, docPath, }) {
    let sidebarSlice = [];
    if (sidebarOptions.groupPathsBy === "tag") {
        sidebarSlice = groupByTags({
            items: api,
            sidebarOptions,
            options,
            tags,
            nonApiMdxFiles,
            docPath,
        });
    }
    return sidebarSlice;
}
exports.default = generateSidebarSlice;
