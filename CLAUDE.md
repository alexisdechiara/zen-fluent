# Zen Fluent

Mod Sine pour Zen Browser 1.23+ : Mica, Mica Alt, Acrylic et contrôles WinUI 3.
Reprend les options de Firefox-WinUI, Nebula et Arc 2.0. Langue du projet : français
(README, libellés de `preferences.json`) ; commentaires du code en anglais.

## Structure

- `userChrome.css` / `userContent.css` importent les modules de `modules/`.
- `modules/tokens.css` : toutes les valeurs `--zf-*` (paires `light-dark()`), accent,
  rayons, police. Les autres modules ne lisent que ces variables.
- Un module par zone : `materials`, `sidebar`, `extensions`, `urlbar`, `split-glance`,
  `media`, `library`, `menus`, `tab-preview`, `scrollbars`, `window`, `icons`,
  `animations`, `content` (pages `about:`, défilement des pages web).
- `preferences.json` : réglages Sine, préfixe `zen-fluent.*`, valeurs ASCII sans
  espaces (Sine les refuse), séparateurs `"type": "separator"` par groupe.
- `icons/` : SVG en `stroke="context-fill"`. `screenshots/` : captures du README.

## Conventions

- Lint avant chaque commit : `npm run lint` (prettier + stylelint, config adaptée de
  Nebula). `npm run lint:fix` corrige le format.
- Chaque réglage passe par `@media (-moz-pref("zen-fluent.xxx", "valeur"))`.
- Le mod est chargé comme feuille **utilisateur** : une déclaration sans `!important`
  perd face au CSS de Zen, variables comprises. Mettre `!important` partout où l'on
  surcharge Zen.

## Fond de fenêtre

Sous Windows 11, le fond Mica / Mica Alt / Acrylic vient de **Mica For Everyone**
(règle pour `zen`). Le mod ne fait que teinter : `zen-fluent.material` choisit la teinte
à accorder avec la règle MFE. Pas de réglage d'intensité de teinte (abandonné).
Linux : `zen.widget.linux.transparency` + flou du compositeur (voir README).
Sans GPU, Zen pose `zen-no-acrylic` : les surfaces Acrylic passent en couleur pleine.

## Ce que Zen 1.23 fait vraiment (vérifié dans le navigateur)

- L'onglet actif porte `selected=""` (vide) : cibler `[selected]`, jamais
  `[selected="true"]`.
- Zen écrit `--zen-main-browser-background*` en style inline sur chaque
  `.zen-browser-generic-background` : les surcharger sur ces éléments, pas seulement `:root`.
- Un onglet Glance est imbriqué dans l'onglet parent : cibler
  `.tabbrowser-tab > .tab-stack > .tab-background`, pas un descendant quelconque.
- Extensions épinglées (barre unique) : `#zen-overflow-extensions-list`, sous la barre
  d'adresse. L'ancienne technique Arc/Nebula (`#TabsToolbar-customization-target`) ne
  marche plus.
- Icônes du mod (`icons/`, `stroke="context-fill"`) : invisibles sans
  `svg.context-properties.content.enabled` (fichiers hors `chrome://`) ; toutes
  les surcharges d'icônes sont dans `icons.css`, derrière cette préférence et
  `zen-fluent.fluent-icons`. Bibliothèque : sprite animé `.zen-library-sprite` ;
  espaces : `img.zen-workspace-icon[src$="/selectable/<nom>.svg"]` (remplacé
  par `content: url()`) ; dossiers : SVG en ligne dans `.tab-group-folder-icon`.
- Réglage Sine `string` : Sine pose `--<préférence avec des tirets>` sur `:root`
  des fenêtres chrome uniquement (pas dans les pages `about:`) ; typer la valeur
  avec `@property` pour qu'une saisie invalide ait un repli.
- Les feuilles **utilisateur** s'appliquent dans les Shadow DOM (sélecteur simple
  sur l'élément interne) ; `::part()` ne correspond pas depuis elles.
- Sine : sa feuille de contenu n'est pas injectée dans les pages web (acteur
  `SineUserContent` refusé pour `webIsolated`), seulement dans les pages `about:`.
- Sine 2.3 : carte `.sineItem`, réglages dans `dialog.sineItemPreferenceDialog`
  (séparateur = `vbox:has(> hr)` + `.separator-label`, lignes `hbox`, cases
  `.sineItemPreferenceCheckbox`). Volets Zen : `groupbox[data-category^="paneZen"]`.
- Firefox ne floute pas le contenu web derrière un `backdrop-filter` : une surface
  Acrylic posée sur la page la laisse voir nette. Tout ce qui flotte sur la page
  (barre d'adresse ouverte, barre latérale et barre du haut compactes,
  Bibliothèque) prend `--zf-acrylic-over-page` (couleur pleine).
- Mode compact, barre unique : `#zen-appcontent-navbar-wrapper` replié fait 8 px
  au-dessus de la page ; le mod le passe en `position: absolute` (zone de survol
  invisible) et neutralise la marge que Zen ajoute avec `has-toolbar-hovered`.
- Sine n'applique les `conditions` d'un réglage qu'au premier changement de
  préférence, pas à l'ouverture de la boîte : masquer la ligne en CSS
  (`content.css`, `@media not (-moz-pref(...))`).
- `zen.theme.acrylic-sidebar` / `acrylic-urlbar` (fond transparent + flou) :
  neutralisés par les `!important` utilisateur du mod (vérifié).
- Icône de dossier : variables `--zen-folder-stroke`, `--zen-folder-front-bgcolor`,
  `--zen-folder-behind-bgcolor`.
- Carte média : `.zen-media-card` (créée seulement quand un média audible joue).
  Zen la masque (`hidden`) tant que la vidéo est en image incrustée.
- Zen met `corner-shape: superellipse(2.3)` sur tous les éléments (Windows) : un
  rayon de 50 % donne un carré arrondi. `materials.css` remet `round` (WinUI) et
  sur les cercles / pilules ; ajouter là tout nouvel élément rond.
- Boutons de fenêtre : glyphe Segoe Fluent Icons en `::before`, pas
  `.toolbarbutton-icon`. En barre unique, ils n'apparaissent qu'au survol du haut
  de la page (`zen-has-hover` sur `#zen-appcontent-navbar-wrapper`).
- `about:preferences` (Firefox 158) : composants web `moz-*` à Shadow DOM, sans
  `part`. Jetons globaux (`--button-*`, `--card-*`, `--border-radius-*`,
  `--color-accent-primary`) sur `:root` ; jetons d'un composant
  (`--page-nav-button-*`, `--box-*`, `--toggle-*`, `--select-*`) sur son `:host`,
  donc à surcharger sur l'élément lui-même.
- Menus : jetons `--panel-menuitem-*`, `--panel-separator-*` (panneaux) et
  `--menuitem-padding-block` / `-inline` (menus contextuels).
- Nouvel onglet : `zen.urlbar.replace-newtab` (par défaut) ouvre la barre
  flottante sur une page vide ; `about:home` utilise `content-search-handoff-ui`.
- Image incrustée : `#controls .control-button` pour les boutons ; `#timestamp`,
  `#controls-bottom-gradient` et les curseurs sont aussi des `.control-item`.
- Le source de Zen (`zen-browser/desktop`, dossier `src/zen`) fait foi pour les sélecteurs.

## Tests

Campagne finale faite le 2026-10-28 sous Windows 11 (26 vérifications sur 26,
captures du README refaites). Après une nouvelle fonctionnalité : lint, puis
vérification dans Zen (édition en direct : Ctrl+Maj+Alt+I › Éditeur de style) et,
avant une publication, relancer la campagne.

Méthode : Zen piloté par Marionette
(`--marionette --remote-allow-system-access`), chaque valeur de chaque réglage
appliquée en direct puis vérifiée sur le style calculé **de l'élément affiché**
(pas de son conteneur), console filtrée sur les erreurs CSS, captures dans
`screenshots/` sans chemins locaux visibles (servir les pages sous de vraies adresses).

Sous Windows (Zen Twilight installé est resté en 1.21t) : `zen.exe` 1.23 avec
`-no-remote -profile <profil de test>`, Sine copié depuis un profil existant
(`chrome/utils`, `chrome/JS`), le mod en jonction `chrome/sine-mods/Zen-Fluent`
vers le dépôt et déclaré dans `sine-mods/mods.json`. Rechargement à chaud :
`ChromeUtils.clearResourceCache()` puis `windowUtils.removeSheet` / `loadSheet`
de `chrome://sine/content/chrome.css`. Le fond Mica n'apparaît pas dans les
captures Marionette : capturer l'écran (`CopyFromScreen`, processus DPI-aware).
Les feuilles chrome et utilisateur ne remontent aucune erreur CSS à la console :
valider les valeurs avec stylelint (`declaration-property-value-no-unknown`).
Glance ne s'ouvre bien que par un vrai clic (Alt+clic synthétique via les actions
WebDriver) ; `openGlance()` par script reste bloqué. Les captures d'écran échouent
tant que la session Windows est verrouillée (`LogonUI`).

## Reste à faire

Rien de prévu : fonctionnalités et campagne finale faites.
