/** @type {import('stylelint').Config} */
export default {
  extends: ["stylelint-config-standard"],
  rules: {
    // Mozilla-only queries and at-rules
    "media-query-no-invalid": [true, { ignoreFunctions: ["-moz-pref"] }],
    "media-feature-name-no-unknown": [
      true,
      {
        ignoreMediaFeatureNames: [
          "-moz-platform",
          "-moz-windows-mica",
          "-moz-windows-mica-popups",
        ],
      },
    ],
    "media-feature-name-no-vendor-prefix": null,
    "at-rule-no-vendor-prefix": [true, { ignoreAtRules: ["-moz-document"] }],
    "property-no-unknown": [true, { ignoreProperties: ["corner-shape"] }],

    // Browser ids, classes and variables are not ours to rename
    "selector-id-pattern": null,
    "selector-class-pattern": null,
    "custom-property-pattern": null,
    "keyframes-name-pattern": null,

    // Modules are organized in sections
    "no-duplicate-selectors": null,
    "no-descending-specificity": null,
    "comment-empty-line-before": null,
    "at-rule-empty-line-before": null,
    "declaration-empty-line-before": null,

    // Firefox chrome elements
    "selector-type-no-unknown": [
      true,
      {
        ignoreTypes: [
          "browser",
          "checkbox",
          "content-search-handoff-ui",
          "description",
          "groupbox",
          "hbox",
          "menu",
          "menuitem",
          "menulist",
          "menupopup",
          "menuseparator",
          "moz-box-button",
          "moz-box-group",
          "moz-box-item",
          "moz-box-link",
          "moz-card",
          "moz-page-nav",
          "moz-page-nav-button",
          "moz-toggle",
          "panel",
          "scrollbox",
          "search-textbox",
          "stack",
          "tab",
          "tab-group",
          "toolbaritem",
          "toolbarbutton",
          "toolbarseparator",
          "vbox",
          "zen-folder",
          "zen-library",
          "zen-library-downloads-section",
        ],
      },
    ],
  },
};
