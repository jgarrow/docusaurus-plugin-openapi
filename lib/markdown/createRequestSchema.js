"use strict";
/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRequestSchema = exports.mergeAllOf = void 0;
const createArrayBracket_1 = require("./createArrayBracket");
const createDescription_1 = require("./createDescription");
const schema_1 = require("./schema");
const utils_1 = require("./utils");
const jsonSchemaMergeAllOf = require("json-schema-merge-allof");
/**
 * Returns a merged representation of allOf array of schemas.
 */
function mergeAllOf(allOf) {
    const mergedSchemas = jsonSchemaMergeAllOf(allOf, {
        resolvers: {
            readOnly: function () {
                return true;
            },
            example: function () {
                return true;
            },
            "x-examples": function () {
                return true;
            },
        },
        ignoreAdditionalProperties: true,
    });
    const required = allOf.reduce((acc, cur) => {
        if (Array.isArray(cur.required)) {
            const next = [...acc, ...cur.required];
            return next;
        }
        return acc;
    }, []);
    return { mergedSchemas, required };
}
exports.mergeAllOf = mergeAllOf;
// TODO: update this for new table format so we can update its return value
// to be just the Table data object instead of a component
/**
 * For handling nested anyOf/oneOf.
 */
function createAnyOneOf(schema) {
    const type = schema.oneOf ? "oneOf" : "anyOf";
    return (0, utils_1.create)("div", {
        children: [
            (0, utils_1.create)("span", {
                className: "badge badge--info",
                children: type,
            }),
            (0, utils_1.create)("SchemaTabs", {
                children: schema[type].map((anyOneSchema, index) => {
                    const label = anyOneSchema.title
                        ? anyOneSchema.title
                        : `MOD${index + 1}`;
                    const anyOneChildren = [];
                    if (anyOneSchema.properties !== undefined) {
                        anyOneChildren.push(createProperties(anyOneSchema));
                        delete anyOneSchema.properties;
                    }
                    if (anyOneSchema.allOf !== undefined) {
                        anyOneChildren.push(createNodes(anyOneSchema));
                        delete anyOneSchema.allOf;
                    }
                    if (anyOneSchema.items !== undefined) {
                        anyOneChildren.push(createItems(anyOneSchema));
                        delete anyOneSchema.items;
                    }
                    if (anyOneSchema.type === "string" ||
                        anyOneSchema.type === "number" ||
                        anyOneSchema.type === "integer" ||
                        anyOneSchema.type === "boolean") {
                        anyOneChildren.push(createNodes(anyOneSchema));
                    }
                    if (anyOneChildren.length) {
                        if (schema.type === "array") {
                            return (0, utils_1.create)("TabItem", {
                                label: label,
                                value: `${index}-item-properties`,
                                children: [
                                    (0, createArrayBracket_1.createOpeningArrayBracket)(),
                                    anyOneChildren,
                                    (0, createArrayBracket_1.createClosingArrayBracket)(),
                                ]
                                    .filter(Boolean)
                                    .flat(),
                            });
                        }
                        return (0, utils_1.create)("TabItem", {
                            label: label,
                            value: `${index}-item-properties`,
                            children: anyOneChildren.filter(Boolean).flat(),
                        });
                    }
                    return undefined;
                }),
            }),
        ],
    });
}
function createProperties(schema) {
    const discriminator = schema.discriminator;
    return Object.entries(schema.properties).map(([key, val]) => {
        return createEdges({
            name: key,
            schema: val,
            required: Array.isArray(schema.required)
                ? schema.required.includes(key)
                : false,
            discriminator,
        });
    });
}
function createAdditionalProperties(schema) {
    // TODO?:
    //   {
    //   description: 'Integration configuration. See \n' +
    //     '[Integration Configurations](https://prisma.pan.dev/api/cloud/api-integration-config/).\n',
    //   example: { webhookUrl: 'https://hooks.slack.com/abcdef' },
    //   externalDocs: { url: 'https://prisma.pan.dev/api/cloud/api-integration-config' },
    //   type: 'object'
    // }
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
    // TODO?:
    // {
    // items: {
    //     properties: {
    //       aliasField: [Object],
    //       displayName: [Object],
    //       fieldName: [Object],
    //       maxLength: [Object],
    //       options: [Object],
    //       redlockMapping: [Object],
    //       required: [Object],
    //       type: [Object],
    //       typeaheadUri: [Object],
    //       value: [Object]
    //     },
    //     type: 'object'
    //   },
    //   type: 'array'
    // }
    const additionalProperties = schema.additionalProperties;
    const type = additionalProperties === null || additionalProperties === void 0 ? void 0 : additionalProperties.type;
    // Handle free-form objects
    if (String(additionalProperties) === "true" && schema.type === "object") {
        return {
            field: "property name*",
            required: false,
            type: "any",
            qualifierMessage: (0, schema_1.getQualifierMessage)(schema.additionalProperties),
            schema,
            collapsible: false,
            discriminator: false,
            description: schema.description
                ? (0, createDescription_1.createDescription)(schema.description).trim()
                : null,
        };
        // return create("SchemaItem", {
        //   name: "property name*",
        //   required: false,
        //   schemaName: "any",
        //   qualifierMessage: getQualifierMessage(schema.additionalProperties),
        //   schema: schema,
        //   collapsible: false,
        //   discriminator: false,
        // });
    }
    if ((type === "object" || type === "array") &&
        ((additionalProperties === null || additionalProperties === void 0 ? void 0 : additionalProperties.properties) ||
            (additionalProperties === null || additionalProperties === void 0 ? void 0 : additionalProperties.items) ||
            (additionalProperties === null || additionalProperties === void 0 ? void 0 : additionalProperties.allOf) ||
            (additionalProperties === null || additionalProperties === void 0 ? void 0 : additionalProperties.additionalProperties) ||
            (additionalProperties === null || additionalProperties === void 0 ? void 0 : additionalProperties.oneOf) ||
            (additionalProperties === null || additionalProperties === void 0 ? void 0 : additionalProperties.anyOf))) {
        const title = additionalProperties.title;
        const schemaName = (0, schema_1.getSchemaName)(additionalProperties);
        const required = (_a = schema.required) !== null && _a !== void 0 ? _a : false;
        return createDetailsNode("property name*", title !== null && title !== void 0 ? title : schemaName, additionalProperties, required, schema.nullable);
    }
    if (((_b = schema.additionalProperties) === null || _b === void 0 ? void 0 : _b.type) === "string" ||
        ((_c = schema.additionalProperties) === null || _c === void 0 ? void 0 : _c.type) === "object" ||
        ((_d = schema.additionalProperties) === null || _d === void 0 ? void 0 : _d.type) === "boolean" ||
        ((_e = schema.additionalProperties) === null || _e === void 0 ? void 0 : _e.type) === "integer" ||
        ((_f = schema.additionalProperties) === null || _f === void 0 ? void 0 : _f.type) === "number") {
        const additionalProperties = (_g = schema.additionalProperties) === null || _g === void 0 ? void 0 : _g.additionalProperties;
        if (additionalProperties !== undefined) {
            const type = (_j = (_h = schema.additionalProperties) === null || _h === void 0 ? void 0 : _h.additionalProperties) === null || _j === void 0 ? void 0 : _j.type;
            const schemaName = (0, schema_1.getSchemaName)((_k = schema.additionalProperties) === null || _k === void 0 ? void 0 : _k.additionalProperties);
            return {
                field: "property name*",
                required: false,
                type: schemaName !== null && schemaName !== void 0 ? schemaName : type,
                qualifierMessage: (_l = schema.additionalProperties) !== null && _l !== void 0 ? _l : (0, schema_1.getQualifierMessage)(schema.additionalProperties),
                schema,
                collapsible: false,
                discriminator: false,
                description: schema.description
                    ? (0, createDescription_1.createDescription)(schema.description).trim()
                    : null,
            };
            // return create("SchemaItem", {
            //   name: "property name*",
            //   required: false,
            //   schemaName: schemaName ?? type,
            //   qualifierMessage:
            //     schema.additionalProperties ??
            //     getQualifierMessage(schema.additionalProperties),
            //   schema: schema,
            //   collapsible: false,
            //   discriminator: false,
            // });
        }
        const schemaName = (0, schema_1.getSchemaName)(schema.additionalProperties);
        return {
            field: "property name*",
            required: false,
            type: schemaName,
            qualifierMessage: (0, schema_1.getQualifierMessage)(schema),
            schema: schema.additionalProperties,
            collapsible: false,
            discriminator: false,
            description: schema.description
                ? (0, createDescription_1.createDescription)(schema.description).trim()
                : null,
        };
        // return create("SchemaItem", {
        //   name: "property name*",
        //   required: false,
        //   schemaName: schemaName,
        //   qualifierMessage: getQualifierMessage(schema),
        //   schema: schema.additionalProperties,
        //   collapsible: false,
        //   discriminator: false,
        // });
    }
    return Object.entries(schema.additionalProperties).map(([key, val]) => createEdges({
        name: key,
        schema: val,
        required: Array.isArray(schema.required)
            ? schema.required.includes(key)
            : false,
    }));
}
// TODO: figure out how to handle array of objects
function createItems(schema) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
    if (((_a = schema.items) === null || _a === void 0 ? void 0 : _a.properties) !== undefined) {
        return [createProperties(schema.items)].flat();
        // return [
        //   createOpeningArrayBracket(),
        //   createProperties(schema.items),
        //   createClosingArrayBracket(),
        // ].flat();
    }
    if (((_b = schema.items) === null || _b === void 0 ? void 0 : _b.additionalProperties) !== undefined) {
        return [createAdditionalProperties(schema.items)].flat();
        // return [
        //   createOpeningArrayBracket(),
        //   createAdditionalProperties(schema.items),
        //   createClosingArrayBracket(),
        // ].flat();
    }
    if (((_c = schema.items) === null || _c === void 0 ? void 0 : _c.oneOf) !== undefined || ((_d = schema.items) === null || _d === void 0 ? void 0 : _d.anyOf) !== undefined) {
        return [createAnyOneOf(schema.items)].flat();
        // return [
        //   createOpeningArrayBracket(),
        //   createAnyOneOf(schema.items!),
        //   createClosingArrayBracket(),
        // ].flat();
    }
    if (((_e = schema.items) === null || _e === void 0 ? void 0 : _e.allOf) !== undefined) {
        // TODO: figure out if and how we should pass merged required array
        const { mergedSchemas, } = mergeAllOf((_f = schema.items) === null || _f === void 0 ? void 0 : _f.allOf);
        // Handles combo anyOf/oneOf + properties
        if ((mergedSchemas.oneOf !== undefined ||
            mergedSchemas.anyOf !== undefined) &&
            mergedSchemas.properties) {
            return [
                // createOpeningArrayBracket(),
                createAnyOneOf(mergedSchemas),
                createProperties(mergedSchemas),
                // createClosingArrayBracket(),
            ].flat();
        }
        // Handles only anyOf/oneOf
        if (mergedSchemas.oneOf !== undefined ||
            mergedSchemas.anyOf !== undefined) {
            return [
                // createOpeningArrayBracket(),
                createAnyOneOf(mergedSchemas),
                // createClosingArrayBracket(),
            ].flat();
        }
        // Handles properties
        if (mergedSchemas.properties !== undefined) {
            return [
                // createOpeningArrayBracket(),
                createProperties(mergedSchemas),
                // createClosingArrayBracket(),
            ].flat();
        }
    }
    if (((_g = schema.items) === null || _g === void 0 ? void 0 : _g.type) === "string" ||
        ((_h = schema.items) === null || _h === void 0 ? void 0 : _h.type) === "number" ||
        ((_j = schema.items) === null || _j === void 0 ? void 0 : _j.type) === "integer" ||
        ((_k = schema.items) === null || _k === void 0 ? void 0 : _k.type) === "boolean" ||
        ((_l = schema.items) === null || _l === void 0 ? void 0 : _l.type) === "object") {
        return [
            // createOpeningArrayBracket(),
            createNodes(schema.items),
            // createClosingArrayBracket(),
        ].flat();
    }
    // TODO: clean this up or eliminate it?
    return [
        // createOpeningArrayBracket(),
        Object.entries(schema.items).map(([key, val]) => createEdges({
            name: key,
            schema: val,
            required: Array.isArray(schema.required)
                ? schema.required.includes(key)
                : false,
        })),
        // createClosingArrayBracket(),
    ].flat();
}
/**
 * For handling discriminators that do not map to a same-level property
 */
// function createDiscriminator(schema: SchemaObject) {
//   const discriminator = schema.discriminator;
//   const propertyName = discriminator?.propertyName;
//   const propertyType = "string"; // should always be string
//   const mapping: any = discriminator?.mapping;
//   // Explicit mapping is required since we can't support implicit
//   if (mapping === undefined) {
//     return undefined;
//   }
//   // Attempt to get the property description we want to display
//   // TODO: how to make it predictable when handling allOf
//   let propertyDescription;
//   const firstMappingSchema = mapping[Object.keys(mapping)[0]];
//   if (firstMappingSchema.properties !== undefined) {
//     propertyDescription =
//       firstMappingSchema.properties![propertyName!].description;
//   }
//   if (firstMappingSchema.allOf !== undefined) {
//     const { mergedSchemas }: { mergedSchemas: SchemaObject } = mergeAllOf(
//       firstMappingSchema.allOf
//     );
//     if (mergedSchemas.properties !== undefined) {
//       propertyDescription =
//         mergedSchemas.properties[propertyName!]?.description;
//     }
//   }
//   if (propertyDescription === undefined) {
//     if (
//       schema.properties !== undefined &&
//       schema.properties![propertyName!] !== undefined
//     ) {
//       propertyDescription = schema.properties![propertyName!].description;
//     }
//   }
//   return create("div", {
//     className: "discriminatorItem",
//     children: create("div", {
//       children: [
//         create("strong", {
//           style: { paddingLeft: "1rem" },
//           children: propertyName,
//         }),
//         guard(propertyType, (name) =>
//           create("span", {
//             style: { opacity: "0.6" },
//             children: ` ${propertyType}`,
//           })
//         ),
//         guard(getQualifierMessage(schema.discriminator as any), (message) =>
//           create("div", {
//             style: {
//               paddingLeft: "1rem",
//             },
//             children: createDescription(message),
//           })
//         ),
//         guard(propertyDescription, (description) =>
//           create("div", {
//             style: {
//               paddingLeft: "1rem",
//             },
//             children: createDescription(description),
//           })
//         ),
//         create("DiscriminatorTabs", {
//           children: Object.keys(mapping!).map((key, index) => {
//             if (mapping[key].allOf !== undefined) {
//               const { mergedSchemas }: { mergedSchemas: SchemaObject } =
//                 mergeAllOf(mapping[key].allOf);
//               // Cleanup duplicate property from mapping schema
//               delete mergedSchemas.properties![propertyName!];
//               mapping[key] = mergedSchemas;
//             }
//             if (mapping[key].properties !== undefined) {
//               // Cleanup duplicate property from mapping schema
//               delete mapping[key].properties![propertyName!];
//             }
//             const label = key;
//             return create("TabItem", {
//               label: label,
//               value: `${index}-item-discriminator`,
//               children: [
//                 create("div", {
//                   style: { marginLeft: "-4px" },
//                   children: createNodes(mapping[key]),
//                 }),
//               ],
//             });
//           }),
//         }),
//       ],
//     }),
//   });
// }
function createDetailsNode(name, schemaName, schema, required, nullable) {
    let nodes = createNodes(schema);
    if (!Array.isArray(nodes)) {
        nodes = [nodes];
    }
    return {
        field: name,
        type: schemaName,
        required,
        description: schema.description
            ? (0, createDescription_1.createDescription)(schema.description).trim()
            : null,
        subfields: nodes.filter(Boolean),
        schema,
    };
    // return create("SchemaItem", {
    //   collapsible: true,
    //   className: "schemaItem",
    //   children: [
    //     createDetails({
    //       children: [
    //         createDetailsSummary({
    //           children: [
    //             create("strong", { children: name }),
    //             create("span", {
    //               style: { opacity: "0.6" },
    //               children: ` ${schemaName}`,
    //             }),
    //             guard(
    //               (schema.nullable && schema.nullable === true) ||
    //                 (nullable && nullable === true),
    //               () => [
    //                 create("strong", {
    //                   style: {
    //                     fontSize: "var(--ifm-code-font-size)",
    //                     color: "var(--openapi-nullable)",
    //                   },
    //                   children: " nullable",
    //                 }),
    //               ]
    //             ),
    //             guard(
    //               Array.isArray(required)
    //                 ? required.includes(name)
    //                 : required === true,
    //               () => [
    //                 create("strong", {
    //                   style: {
    //                     fontSize: "var(--ifm-code-font-size)",
    //                     color: "var(--openapi-required)",
    //                   },
    //                   children: " required",
    //                 }),
    //               ]
    //             ),
    //           ],
    //         }),
    //         create("div", {
    //           style: { marginLeft: "1rem" },
    //           children: [
    //             guard(getQualifierMessage(schema), (message) =>
    //               create("div", {
    //                 style: { marginTop: ".5rem", marginBottom: ".5rem" },
    //                 children: createDescription(message),
    //               })
    //             ),
    //             guard(schema.description, (description) =>
    //               create("div", {
    //                 style: { marginTop: ".5rem", marginBottom: ".5rem" },
    //                 children: createDescription(description),
    //               })
    //             ),
    //             createNodes(schema),
    //           ],
    //         }),
    //       ],
    //     }),
    //   ],
    // });
}
function createOneOfProperty(name, schemaName, schema, required, nullable) {
    let nodes = createNodes(schema);
    if (!Array.isArray(nodes)) {
        nodes = [nodes];
    }
    return {
        field: name,
        type: schemaName,
        required,
        description: schema.description
            ? (0, createDescription_1.createDescription)(schema.description).trim()
            : null,
        subfields: nodes.filter(Boolean),
        schema,
    };
    // return create("SchemaItem", {
    //   collapsible: true,
    //   className: "schemaItem",
    //   children: [
    //     createDetails({
    //       children: [
    //         createDetailsSummary({
    //           children: [
    //             create("strong", { children: name }),
    //             create("span", {
    //               style: { opacity: "0.6" },
    //               children: ` ${schemaName}`,
    //             }),
    //             guard(
    //               (schema.nullable && schema.nullable === true) ||
    //                 (nullable && nullable === true),
    //               () => [
    //                 create("strong", {
    //                   style: {
    //                     fontSize: "var(--ifm-code-font-size)",
    //                     color: "var(--openapi-nullable)",
    //                   },
    //                   children: " nullable",
    //                 }),
    //               ]
    //             ),
    //             guard(
    //               Array.isArray(required)
    //                 ? required.includes(name)
    //                 : required === true,
    //               () => [
    //                 create("strong", {
    //                   style: {
    //                     fontSize: "var(--ifm-code-font-size)",
    //                     color: "var(--openapi-required)",
    //                   },
    //                   children: " required",
    //                 }),
    //               ]
    //             ),
    //           ],
    //         }),
    //         create("div", {
    //           style: { marginLeft: "1rem" },
    //           children: [
    //             guard(getQualifierMessage(schema), (message) =>
    //               create("div", {
    //                 style: { marginTop: ".5rem", marginBottom: ".5rem" },
    //                 children: createDescription(message),
    //               })
    //             ),
    //             guard(schema.description, (description) =>
    //               create("div", {
    //                 style: { marginTop: ".5rem", marginBottom: ".5rem" },
    //                 children: createDescription(description),
    //               })
    //             ),
    //           ],
    //         }),
    //         create("div", {
    //           children: [
    //             create("span", {
    //               className: "badge badge--info",
    //               children: "oneOf",
    //             }),
    //             create("SchemaTabs", {
    //               children: schema["oneOf"]!.map((property, index) => {
    //                 const label = property.type ?? `MOD${index + 1}`;
    //                 return create("TabItem", {
    //                   label: label,
    //                   value: `${index}-property`,
    //                   children: [
    //                     create("p", { children: label }),
    //                     guard(schema.description, (description) =>
    //                       create("div", {
    //                         style: { marginTop: ".5rem", marginBottom: ".5rem" },
    //                         children: createDescription(description),
    //                       })
    //                     ),
    //                   ],
    //                 });
    //               }),
    //             }),
    //           ],
    //         }),
    //       ],
    //     }),
    //   ],
    // });
}
/**
 * For handling discriminators that map to a same-level property (like 'petType').
 * Note: These should only be encountered while iterating through properties.
 */
function createPropertyDiscriminator(name, schemaName, schema, discriminator, required) {
    if (schema === undefined) {
        return undefined;
    }
    if (discriminator.mapping === undefined) {
        return undefined;
    }
    return {
        field: name,
        type: schemaName,
        required: Array.isArray(required) ? required.includes(name) : required,
        description: schema.description
            ? (0, createDescription_1.createDescription)(schema.description).trim()
            : null,
        discriminator: true,
        qualifierMessage: (0, schema_1.getQualifierMessage)(schema),
        schema,
    };
    // return create("SchemaItem", {
    //   name,
    //   required: Array.isArray(required) ? required.includes(name) : required,
    //   schemaName: schemaName,
    //   qualifierMessage: getQualifierMessage(schema),
    //   schema: schema,
    //   collapsible: false,
    //   discriminator: true,
    //   children: [
    //     create("DiscriminatorTabs", {
    //       children: Object.keys(discriminator?.mapping!).map((key, index) => {
    //         const label = key;
    //         return create("TabItem", {
    //           label: label,
    //           value: `${index}-item-discriminator`,
    //           children: createNodes(discriminator?.mapping[key]),
    //         });
    //       }),
    //     }),
    //   ],
    // });
}
/**
 * Creates the edges or "leaves" of a schema tree. Edges can branch into sub-nodes with createDetails().
 */
function createEdges({ name, schema, required, discriminator, }) {
    var _a, _b, _c, _d;
    const schemaName = (0, schema_1.getSchemaName)(schema);
    if (discriminator !== undefined && discriminator.propertyName === name) {
        return createPropertyDiscriminator(name, "string", schema, discriminator, required);
    }
    if (schema.oneOf !== undefined || schema.anyOf !== undefined) {
        return createOneOfProperty(name, schemaName, schema, required, schema.nullable);
    }
    if (schema.allOf !== undefined) {
        const { mergedSchemas, required, } = mergeAllOf(schema.allOf);
        const mergedSchemaName = (0, schema_1.getSchemaName)(mergedSchemas);
        if (mergedSchemas.oneOf !== undefined ||
            mergedSchemas.anyOf !== undefined) {
            return createDetailsNode(name, mergedSchemaName, mergedSchemas, required, schema.nullable);
        }
        if (mergedSchemas.properties !== undefined) {
            return createDetailsNode(name, mergedSchemaName, mergedSchemas, required, schema.nullable);
        }
        if (mergedSchemas.additionalProperties !== undefined) {
            return createDetailsNode(name, mergedSchemaName, mergedSchemas, required, schema.nullable);
        }
        // array of objects
        if (((_a = mergedSchemas.items) === null || _a === void 0 ? void 0 : _a.properties) !== undefined) {
            return createDetailsNode(name, mergedSchemaName, mergedSchemas, required, schema.nullable);
        }
        if (mergedSchemas.readOnly && mergedSchemas.readOnly === true) {
            return undefined;
        }
        return {
            field: name,
            type: schemaName,
            required: Array.isArray(required) ? required.includes(name) : required,
            description: schema.description ? schema.description.trim() : null,
            qualifierMessage: (0, schema_1.getQualifierMessage)(schema),
            schema: mergedSchemas,
        };
        // return create("SchemaItem", {
        //   collapsible: false,
        //   name,
        //   required: Array.isArray(required) ? required.includes(name) : required,
        //   schemaName: schemaName,
        //   qualifierMessage: getQualifierMessage(schema),
        //   schema: mergedSchemas,
        // });
    }
    if (schema.properties !== undefined) {
        return createDetailsNode(name, schemaName, schema, required, schema.nullable);
    }
    if (schema.additionalProperties !== undefined) {
        return createDetailsNode(name, schemaName, schema, required, schema.nullable);
    }
    // array of objects
    if (((_b = schema.items) === null || _b === void 0 ? void 0 : _b.properties) !== undefined) {
        return createDetailsNode(name, schemaName, schema, required, schema.nullable);
    }
    if (((_c = schema.items) === null || _c === void 0 ? void 0 : _c.anyOf) !== undefined || ((_d = schema.items) === null || _d === void 0 ? void 0 : _d.oneOf) !== undefined) {
        return createDetailsNode(name, schemaName, schema, required, schema.nullable);
    }
    if (schema.readOnly && schema.readOnly === true) {
        return undefined;
    }
    return {
        field: name,
        type: schemaName,
        required: Array.isArray(required) ? required.includes(name) : required,
        description: schema.description ? schema.description.trim() : null,
        qualifierMessage: (0, schema_1.getQualifierMessage)(schema),
        schema,
    };
    // primitives and array of non-objects
    // return create("SchemaItem", {
    //   collapsible: false,
    //   name,
    //   required: Array.isArray(required) ? required.includes(name) : required,
    //   schemaName: schemaName,
    //   qualifierMessage: getQualifierMessage(schema),
    //   schema: schema,
    // });
}
/**
 * Creates a hierarchical level of a schema tree. Nodes produce edges that can branch into sub-nodes with edges, recursively.
 */
function createNodes(schema) {
    const nodes = [];
    // if (schema.discriminator !== undefined) {
    //   return createDiscriminator(schema);
    // }
    if (schema.oneOf !== undefined || schema.anyOf !== undefined) {
        // TODO: update this function for new Table format so we can update its return value
        // to be just the Table data object instead of a component
        nodes.push(createAnyOneOf(schema));
    }
    if (schema.allOf !== undefined) {
        const { mergedSchemas } = mergeAllOf(schema.allOf);
        // allOf seems to always result in properties
        if (mergedSchemas.properties !== undefined) {
            nodes.push(createProperties(mergedSchemas));
        }
    }
    if (schema.properties !== undefined) {
        nodes.push(createProperties(schema));
    }
    if (schema.additionalProperties !== undefined) {
        nodes.push(createAdditionalProperties(schema));
    }
    // TODO: figure out how to handle array of objects
    if (schema.items !== undefined) {
        nodes.push(createItems(schema));
    }
    if (nodes.length && nodes.length > 0) {
        return nodes.filter(Boolean).flat();
    }
    // TODO: investigate what this is for so we can update its return value
    // to be just the Table data object instead of a component
    // primitive
    if (schema.type !== undefined) {
        if (schema.allOf) {
            //handle circular result in allOf
            if (schema.allOf.length && typeof schema.allOf[0] === "string") {
                return (0, utils_1.create)("div", {
                    style: {
                        marginTop: ".5rem",
                        marginBottom: ".5rem",
                        marginLeft: "1rem",
                    },
                    children: [(0, createDescription_1.createDescription)(schema.allOf[0])],
                });
            }
        }
        return (0, utils_1.create)("div", {
            style: {
                marginTop: ".5rem",
                marginBottom: ".5rem",
                marginLeft: "1rem",
            },
            children: [(0, createDescription_1.createDescription)(schema.type)],
        });
    }
    // handle circular references
    if (typeof schema === "string") {
        return (0, utils_1.create)("div", {
            style: {
                marginTop: ".5rem",
                marginBottom: ".5rem",
                marginLeft: "1rem",
            },
            children: [(0, createDescription_1.createDescription)(schema)],
        });
    }
    // Unknown node/schema type should return undefined
    // So far, haven't seen this hit in testing
    return "any";
}
function createRequestSchema({ title, body, ...rest }) {
    var _a;
    if (body === undefined ||
        body.content === undefined ||
        Object.keys(body).length === 0 ||
        Object.keys(body.content).length === 0) {
        return undefined;
    }
    // Get all MIME types, including vendor-specific
    const mimeTypes = Object.keys(body.content);
    if (mimeTypes && mimeTypes.length > 1) {
        return (0, utils_1.create)("MimeTabs", {
            schemaType: "request",
            children: mimeTypes.map((mimeType) => {
                const firstBody = body.content[mimeType].schema;
                if (firstBody === undefined) {
                    return undefined;
                }
                if (firstBody.properties !== undefined) {
                    if (Object.keys(firstBody.properties).length === 0) {
                        return undefined;
                    }
                }
                let nodes = createNodes(firstBody);
                if (!Array.isArray(nodes)) {
                    nodes = [nodes];
                }
                return (0, utils_1.create)("TabItem", {
                    label: mimeType,
                    value: `${mimeType}`,
                    children: [
                        (0, utils_1.create)("RequestBodyDetails", {
                            title,
                            description: body.description
                                ? (0, createDescription_1.createDescription)(body.description)
                                : null,
                            required: body.required,
                            data: nodes.filter(Boolean), // filter out any null or undefined values
                        }),
                        // createDetails({
                        //   "data-collapsed": false,
                        //   open: true,
                        //   ...rest,
                        //   children: [
                        // createDetailsSummary({
                        //   style: { textAlign: "left" },
                        //   children: [
                        //     create("strong", { children: `${title}` }),
                        //     guard(body.required && body.required === true, () => [
                        //       create("strong", {
                        //         style: {
                        //           fontSize: "var(--ifm-code-font-size)",
                        //           color: "var(--openapi-required)",
                        //         },
                        //         children: " required",
                        //       }),
                        //     ]),
                        //   ],
                        // }),
                        // create("div", {
                        //   style: { textAlign: "left", marginLeft: "1rem" },
                        //   children: [
                        //     guard(body.description, () => [
                        //       create("div", {
                        //         style: { marginTop: "1rem", marginBottom: "1rem" },
                        //         children: createDescription(body.description),
                        //       }),
                        //     ]),
                        //   ],
                        // }),
                        // create("ul", {
                        //   style: { marginLeft: "1rem" },
                        //   children: createNodes(firstBody),
                        // }),
                        //   ],
                        // }),
                    ],
                });
            }),
        });
    }
    const randomFirstKey = Object.keys(body.content)[0];
    const firstBody = (_a = body.content[randomFirstKey].schema) !== null && _a !== void 0 ? _a : body.content[randomFirstKey];
    if (firstBody === undefined) {
        return undefined;
    }
    // we don't show the table if there is no properties to show
    if (firstBody.properties !== undefined) {
        if (Object.keys(firstBody.properties).length === 0) {
            return undefined;
        }
    }
    let nodes = createNodes(firstBody);
    if (!Array.isArray(nodes)) {
        nodes = [nodes];
    }
    return (0, utils_1.create)("RequestBodyDetails", {
        title,
        description: body.description ? (0, createDescription_1.createDescription)(body.description) : null,
        required: body.required,
        data: nodes.filter(Boolean), // filter out any null or undefined values,
    });
    // return create("MimeTabs", {
    //   children: [
    //     create("TabItem", {
    //       label: randomFirstKey,
    //       value: `${randomFirstKey}-schema`,
    //       children: [
    //         createDetails({
    //           "data-collapsed": false,
    //           open: true,
    //           ...rest,
    //           children: [
    //             createDetailsSummary({
    //               style: { textAlign: "left" },
    //               children: [
    //                 create("strong", { children: `${title}` }),
    //                 guard(firstBody.type === "array", (format) =>
    //                   create("span", {
    //                     style: { opacity: "0.6" },
    //                     children: ` array`,
    //                   })
    //                 ),
    //                 guard(body.required, () => [
    //                   create("strong", {
    //                     style: {
    //                       fontSize: "var(--ifm-code-font-size)",
    //                       color: "var(--openapi-required)",
    //                     },
    //                     children: " required",
    //                   }),
    //                 ]),
    //               ],
    //             }),
    //             create("div", {
    //               style: { textAlign: "left", marginLeft: "1rem" },
    //               children: [
    //                 guard(body.description, () => [
    //                   create("div", {
    //                     style: { marginTop: "1rem", marginBottom: "1rem" },
    //                     children: createDescription(body.description),
    //                   }),
    //                 ]),
    //               ],
    //             }),
    //             create("Table", {
    //               // style: { marginLeft: "1rem" },
    //               data: createNodes(firstBody)[0],
    //             }),
    //           ],
    //         }),
    //       ],
    //     }),
    //   ],
    // });
}
exports.createRequestSchema = createRequestSchema;
