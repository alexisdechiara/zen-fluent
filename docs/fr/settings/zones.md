# Zones

Traduction de [docs/settings/zones.md](../../settings/zones.md).

Le style Fluent zone par zone : décochez une zone pour y garder l'apparence
de Zen.

En-tête du groupe : `zen-fluent.ui.open-zones` (ouvert par défaut : `false`).

| Réglage                                                                                      | Préférence                               | Valeurs          | Défaut |
| -------------------------------------------------------------------------------------------- | ---------------------------------------- | ---------------- | ------ |
| Window (teinte du fond, carte de la page, boutons de la barre de titre, barre de chargement) | `zen-fluent.fluent-window`               | `true` / `false` | `true` |
| Sidebar (onglets, dossiers, Essentials, espaces, boutons de barre d'outils, extensions)      | `zen-fluent.fluent-sidebar`              | `true` / `false` | `true` |
| URL bar (champ, boutons, suggestions)                                                        | `zen-fluent.fluent-urlbar`               | `true` / `false` | `true` |
| Menus and panels (menus, panneaux du site, téléchargements, infobulles, aperçu des onglets)  | `zen-fluent.fluent-menus`                | `true` / `false` | `true` |
| Notifications (barres de notification, demandes de permission, toasts)                       | `zen-fluent.fluent-notifications`        | `true` / `false` | `true` |
| Find bar                                                                                     | `zen-fluent.fluent-findbar`              | `true` / `false` | `true` |
| Library (la Bibliothèque, son bouton, la pile des téléchargements)                           | `zen-fluent.fluent-library`              | `true` / `false` | `true` |
| Media (carte multimédia, Picture-in-Picture)                                                 | `zen-fluent.fluent-media`                | `true` / `false` | `true` |
| Split view and Glance                                                                        | `zen-fluent.fluent-split-glance`         | `true` / `false` | `true` |
| Dialogs (invites, boîtes de dialogue de fenêtre, impression)                                 | `zen-fluent.fluent-dialogs`              | `true` / `false` | `true` |
| Firefox sidebar (marque-pages, historique, onglets synchronisés (Ctrl+B))                    | `zen-fluent.fluent-firefox-sidebar`      | `true` / `false` | `true` |
| Zen screens (création d'espace, sélecteur de thème, Ctrl+Tab, barre de marque-pages)         | `zen-fluent.fluent-screens`              | `true` / `false` | `true` |
| Fluent icons (décochez pour retrouver les icônes de Zen)                                     | `zen-fluent.fluent-icons`                | `true` / `false` | `true` |
| Allow the mod's icons (cochez-le : sans ce réglage de Firefox, Zen garde ses icônes)         | `svg.context-properties.content.enabled` | `true` / `false` | `true` |
| Settings and internal pages (paramètres de Zen, modules, about:config, nouvel onglet)        | `zen-fluent.fluent-content`              | `true` / `false` | `true` |

## Ce que couvre chaque zone

Fichiers sous `core/src/`. Une zone prend ses composants, les options qui les
habillent (`features/`), leurs règles de compatibilité (`compat/`) et leur
fichier de couleurs forcées (`a11y/forced-colors-<zone>.css`).

- **Window** : `base/window-background.css`, `base/page-card.css`,
  `base/compact-mode.css`, `features/corners-winui/page-card.css`,
  `features/style-edge/page-card.css`, `features/loading-bar.css`,
  `features/animations/tab-switch-animation.css`, `components/window/`.
- **Sidebar** : `components/sidebar/` et les options des onglets, des
  dossiers, des Essentials, des espaces, des boutons de barre d'outils et du
  mode compact (`features/tab-*`, `features/style-edge/tabs.css`,
  `style-edge/essentials.css`, `style-edge/toolbar-buttons.css`,
  `button-style.css`, `pinned-extensions.css`, `compact-sidebar-bg.css`,
  `essentials-per-row.css`, `compact-edge-hint.css`…),
  `features/animations/nav-bounce.css`, le repère du mode compact du panneau
  latéral de Firefox, `compat/advanced-tab-groups.css`.
- **URL bar** : `components/urlbar/`, `features/url-*`,
  `features/style-edge/urlbar.css`, les animations de la barre d'adresse,
  `components/panels/site-panel-anchor.css` (le bouton du panneau du site),
  `compat/command-palette.css`.
- **Menus and panels** : `components/menus/` (sauf Ctrl+Tab),
  `components/tooltips/`, `components/tab-preview/`, `components/panels/`
  (sauf le sélecteur de thème et le bouton du panneau du site),
  `features/extra-highlights/`, `style-edge/menus.css`,
  `style-edge/tab-preview.css`, `hide-shortcuts.css`,
  `hide-access-keys.css`, `context-navigation/`, l'animation des menus,
  `components/toggle-switch-motion.css`, `compat/calmer-context-menu.css`.
- **Notifications** : `components/notifications/`.
- **Find bar** : `components/findbar/`.
- **Library** : `components/library/`, `compat/zen-library-tweaks.css`.
- **Media** : `components/media/`.
- **Split view and Glance** : `components/split-view/`,
  `components/glance.css`.
- **Dialogs** : `components/dialogs/`.
- **Firefox sidebar** : `components/firefox-sidebar/`,
  `compat/second-sidebar.css`.
- **Zen screens** : `components/workspace-creation.css`,
  `components/panels/gradient-picker.css`, `components/menus/ctrl-tab.css`,
  `components/bookmarks-toolbar.css`, `features/bookmarks-autohide.css`.
- **Fluent icons** : `features/fluent-icons/`,
  `features/animations/animated-icons.css`.
- **Settings and internal pages**, dans `core/userContent.css` :
  `content/newtab.css`, `content/preferences/` (la disposition des
  Paramètres de Windows 11 pour les paramètres de Zen : `layout.css`,
  `controls.css`), `content/sine/dialog.css`, `content/sine/pane.css` (le
  volet Mods de Sine), `content/zen-settings.css`,
  `content/toggle-switches.css`, `content/preferences-dialogs.css`.

## Notes

- **Fonctionnement** : les imports de chaque zone dans `core/chrome.css` (et
  `core/userContent.css` pour Settings and internal pages) portent la
  condition média `not (-moz-pref("zen-fluent.fluent-<zone>", false))`.
  Décochée, Firefox retire ces feuilles aussitôt, dans chaque fenêtre, boîte
  de dialogue et page du panneau latéral de Firefox, sans redémarrage ;
  recochée, elles reviennent. Une préférence que Sine n'a pas encore écrite
  compte comme cochée : le mod a donc la même apparence avant et après le
  premier démarrage.
- **Toujours actifs**, quelles que soient les zones : les jetons (couleurs,
  accent, rayons, densité, police) et l'accent transmis à Firefox (anneaux de
  focus, liens, boutons principaux), la police de la fenêtre, des menus et
  des panneaux, la forme des coins (de simples arcs avec les coins WinUI ou
  Edge, là où Zen dessine des squircles), les barres de défilement fines, les
  animations de boutons WinUI, la sélection de texte en accent, le grain
  Acrylic, les keyframes partagés, les fichiers d'accessibilité qui ne sont
  liés à aucune zone (anneau de focus, animations réduites, les couleurs du
  système rendues aux variables de boîte à outils, de bouton et de champ de
  Zen dans un thème de contraste), et les groupes de réglages repliables de
  la boîte de dialogue Sine du mod. La plupart ont leur propre réglage :
  **Accent color** (Zen workspace color), **Font** (System font), **Corners
  and gaps** (Zen garde ses squircles), **Text selection in the accent
  color**, **Acrylic noise**, **WinUI 3 button animations**.
- **Les options d'une zone désactivée** ne font rien jusqu'à son retour (par
  exemple **URL bar shape** avec la zone URL bar désactivée) ; leurs lignes
  restent dans leurs groupes.
- **Parties partagées** : un élément garde ce que les autres zones lui
  donnent. La zone Menus and panels dessine tous les panneaux, donc la
  demande de permission, le panneau Ctrl+Tab et le sélecteur de thème gardent
  le texte et les lignes de panneau WinUI quand Notifications ou Zen screens
  sont désactivées ; les menus dans une boîte de dialogue ou dans le panneau
  latéral de Firefox suivent aussi Menus and panels. Les boutons de la carte
  multimédia et le bouton de la Bibliothèque sont des boutons de barre
  d'outils : c'est la zone Sidebar qui les habille.
- **Window et Firefox sidebar** : les coins WinUI qui collent le panneau à
  la page (`features/corners-winui/firefox-sidebar.css`) ont besoin des deux
  zones. Si l'une des deux est désactivée, le panneau et la page sont deux
  cartes séparées par la marge de Zen.
- **Fluent icons** a besoin de **Allow the mod's icons**
  (`svg.context-properties.content.enabled`, une préférence de Firefox). Les
  icônes prennent la couleur du thème par `context-fill`, que Firefox
  n'accorde aux fichiers hors de `chrome://` que si cette préférence vaut
  `true`. Sine ne l'écrit pas parce que la préférence existe déjà : cochez-la
  à la main. D'ici là, Zen garde ses icônes. Sa ligne se masque tant que
  **Fluent icons** est désactivé. Contrairement aux autres zones, les icônes
  Fluent ne sont actives qu'une fois que Sine a écrit leur préférence
  (`true`). Elles couvrent aussi les boutons que Glance Plus ajoute à Glance
  et les dossiers de marque-pages que ZenLibraryTweaks ajoute à la
  Bibliothèque ; sur les dossiers Zen seulement, donc Advanced Tab Groups
  garde sa propre icône de dossier et sa couleur
  ([compatibilité](../compatibility.md)). Les icônes animées de Zen pour la
  Bibliothèque et les dossiers restent masquées sous les icônes Fluent, qui
  reçoivent leur propre mouvement avec **Animated icons** (groupe
  Animations).
- **Settings and internal pages** désactivé : about:preferences,
  about:addons, about:config et la page de nouvel onglet sont ceux de Zen,
  tout comme les boîtes de dialogue d'about:preferences (elles appartiennent
  à cette zone, pas à Dialogs). Dans la boîte de dialogue Sine du mod, les
  lignes prennent les cases à cocher de Sine mais les groupes restent des
  cartes repliables : ce groupe peut donc rétablir le style.
