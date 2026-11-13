# Sidebar (barre latérale)

Traduction de [docs/settings/sidebar.md](../../settings/sidebar.md).

Boutons, espaces de travail, mode compact.

En-tête du groupe : `zen-fluent.ui.open-sidebar` (ouvert par défaut :
`false`).

| Réglage                                        | Préférence                          | Valeurs                                                                                                            | Défaut   |
| ---------------------------------------------- | ----------------------------------- | ------------------------------------------------------------------------------------------------------------------ | -------- |
| Button style                                   | `zen-fluent.button-style`           | `subtle` Subtle (fond au survol)<br>`standard` Standard (fond et bordure)                                          | `subtle` |
| Sidebar padding (expert)                       | `zen-fluent.sidebar-padding`        | `auto` Automatic (celui du style)<br>`0` None<br>`2` 2 px<br>`5` 5 px<br>`8` 8 px<br>`12` 12 px<br>`custom` Custom | `auto`   |
| Custom sidebar padding                         | `zen-fluent.sidebar-padding-custom` | une longueur en px                                                                                                 | `6px`    |
| Hide the Forward button when it is disabled    | `zen-fluent.hide-forward-disabled`  | `true` / `false`                                                                                                   | `false`  |
| Workspace indicator                            | `zen-fluent.workspace-indicator`    | `true` / `false`                                                                                                   | `true`   |
| Workspace icon style                           | `zen-fluent.workspace-style`        | `pill` Pill<br>`fill` Fill<br>`minimal` Minimal                                                                    | `pill`   |
| Page fills the window in compact mode          | `zen-fluent.compact-flush`          | `true` / `false`                                                                                                   | `false`  |
| Acrylic sidebar background in compact mode     | `zen-fluent.compact-sidebar-bg`     | `true` / `false`                                                                                                   | `true`   |
| Edge hint at the window border in compact mode | `zen-fluent.compact-edge-hint`      | `true` / `false`                                                                                                   | `true`   |

## Notes

- **Page fills the window in compact mode** : tant que la barre latérale est
  masquée, la page prend toute la fenêtre, sans marge, sans coins ni trait.
- **Sidebar padding** (expert) : l'espace entre le contenu de la barre
  latérale et ses bords ; celui de Zen est de 5 px.
- **Button style** : subtil (WinUI, un fond au survol) ou standard (fond et
  bordure au repos) ; dans le style Edge, le fond blanc et le filet de la
  barre d'adresse. Un fond choisi dans le groupe Variants le remplace.
