# Zen Fluent

Mica, Mica Alt, Acrylic et contrôles WinUI 3 pour [Zen Browser](https://zen-browser.app),
ou le style de Microsoft Edge (Fluent 2).
Le mod reprend les options de [Firefox-WinUI](https://github.com/Lockframe/Firefox-WinUI),
[Nebula](https://github.com/JustADumbPrsn/Zen-Nebula),
[Arc 2.0](https://github.com/YashjitPal/Arc-2.0) et [Zia](https://github.com/z1n-k/zia),
et se règle depuis [Sine](https://github.com/CosmoCreeper/Sine).

Conçu pour Zen 1.23 : barre latérale verticale, Essentials, dossiers, vue scindée,
Glance, lecteur multimédia, Bibliothèque. Testé avec Zen 1.23.4b sous Linux et
sous Windows 11 avec Mica For Everyone.

![Zen Fluent, Mica sombre](screenshots/dark-mica.png)

## Aperçu

| Mica clair                                         | Mica Alt                                          |
| -------------------------------------------------- | ------------------------------------------------- |
| ![Mica clair](screenshots/light-mica.png)          | ![Mica Alt sombre](screenshots/dark-mica-alt.png) |
| **Acrylic, accent orange**                         | **Angles Zen, accent violet**                     |
| ![Acrylic](screenshots/dark-acrylic-orange.png)    | ![Angles Zen](screenshots/zen-corners-violet.png) |
| **Barre d’adresse flottante**                      | **Mode compact, barre au survol**                 |
| ![Barre d’adresse](screenshots/urlbar.png)         | ![Mode compact](screenshots/compact.png)          |
| **Vue scindée**                                    | **Glance**                                        |
| ![Vue scindée](screenshots/split.png)              | ![Glance](screenshots/glance.png)                 |
| **Bibliothèque**                                   | **Réglages du mod dans Sine**                     |
| ![Bibliothèque](screenshots/library.png)           | ![Réglages Sine](screenshots/sine.png)            |
| **Barres multiples, Mica clair**                   |                                                   |
| ![Barres multiples](screenshots/multi-toolbar.png) |                                                   |

Captures prises sous Windows 11 avec Mica For Everyone (Zen 1.23.4b, fenêtre de
1280 × 800) : le fond Mica et Acrylic laisse transparaître le bureau.

## Installation

### Avec Sine

Paramètres › Sine › Mods : installer **Zen Fluent**, puis régler les options
dans la carte du mod. Sine écrit les valeurs par défaut de `preferences.json`,
sauf pour les préférences de Firefox et de Zen qui existent déjà (**Autoriser
les icônes du mod** et le groupe **Réglages de Zen**) : elles gardent leur
valeur, et **Autoriser les icônes du mod** est à cocher à la main.

Les réglages sont rangés en groupes repliables, comme les SettingsExpander de
WinUI : un clic sur le titre d’un groupe l’ouvre ou le ferme, et l’état est
gardé d’une session à l’autre. **Apparence** est ouvert au départ ; **Afficher
tous les réglages** déplie tout. Au clavier, Espace ouvre ou ferme le groupe
pour la session seulement (Sine n’enregistre pas une case changée au clavier).
Les lignes sans effet avec les valeurs choisies sont masquées : couleur et
police personnalisées tant qu’elles ne sont pas choisies, **Angles et marges**
et **Pastille d’accent** en style Edge, **Ombre des onglets** hors angles Zen,
**Miniature de la page** sans aperçu des onglets.

### Icônes Fluent

Le mod remplace les icônes de Zen par des icônes Fluent au trait (`icons/`,
tracés de la maquette quand elle en a) : précédent, suivant, actualiser,
nouvel onglet, fermeture d’onglet, Bibliothèque, mode compact, extensions, menu,
dossiers (ouvert / fermé), chevron d’espace, copie du lien et réglages du site
dans la barre d’adresse, boutons de Glance et de la vue scindée, lecteur
(lecture, pause, pistes, son, image incrustée), tout le menu ≡, et les icônes
d’espace « porte-documents » et « code » (les autres icônes d’espace restent
celles de Zen). **Icônes Fluent** décochée, Zen garde les siennes.

Ces icônes prennent la couleur du thème par `context-fill`, que Firefox réserve
aux fichiers internes tant que `svg.context-properties.content.enabled` vaut
`false`. Tant que cette préférence n’est pas à `true` (case **Autoriser les
icônes du mod** dans Sine, ou `about:config`), Zen garde aussi ses icônes.

### À la main

1. `about:config` : `toolkit.legacyUserProfileCustomizations.stylesheets` = `true`.
2. Copier `userChrome.css`, `userContent.css`, `modules/` et `icons/` dans le
   dossier `chrome/` du profil (`about:support` › Dossier du profil).
3. Créer dans `about:config` les préférences `zen-fluent.*` du tableau ci-dessous,
   avec les valeurs par défaut de `preferences.json` (`defaultValue`) : sans Sine,
   rien ne les écrit. Passer aussi `svg.context-properties.content.enabled` à
   `true` pour les icônes.
4. Redémarrer Zen.

### Windows 11 : Mica For Everyone

Le vrai fond Mica / Acrylic est appliqué par
[Mica For Everyone](https://github.com/MicaForEveryone/MicaForEveryone), comme
pour Nebula et Arc 2.0 ; Zen Fluent ne fait que le teinter.

1. Installer Mica For Everyone.
2. **Ajouter une règle** › **Règle de processus** : `zen`.
3. Choisir le type de fond identique à **Matériau de fond** dans Sine :

   | Matériau de fond (Sine) | Mica For Everyone |
   | ----------------------- | ----------------- |
   | Mica                    | Mica              |
   | Mica Alt (Tabbed)       | Tabbed            |
   | Acrylic                 | Acrylic           |

4. Paramètres Windows › Personnalisation › Couleurs : désactiver
   **Afficher la couleur d’accentuation sur les barres de titre et les bordures
   des fenêtres**, sinon la transparence ne s’affiche pas.
5. Laisser `widget.windows.mica` à `true` (valeur par défaut de Zen) : c’est ce
   qui garde la fenêtre transparente.
6. Si Zen n’est pas dans le même mode clair / sombre que Windows, régler
   **Couleur de la barre de titre** de la règle sur **Par défaut** : avec
   **Système**, Windows dessine le Mica du thème système sous la teinte du mod
   (Zen sombre sur Mica clair donne un fond gris).

Teinte posée sur le fond de Mica For Everyone (une seule couche) : Mica 64 %,
Acrylic 80,64 % en clair et 87,04 % en sombre, Mica Alt 0 %. La Bibliothèque
n’a pas de surface à elle : elle montre le matériau de la fenêtre, comme la
barre latérale qu’elle remplace.

### Mica Alt

Avec **Mica Alt (Tabbed)**, le mod ne teinte rien : c’est le Mica Alt de Mica
For Everyone, sans teinte, comme dans les applications WinUI. Barre latérale,
barres d’outils, Bibliothèque et marges autour de la page forment un seul fond
uniforme. Ce qui flotte sur la page (barre d’adresse ouverte, barre latérale et
barre du haut en mode compact, barre de recherche, boîtes de dialogue) prend une
couleur Mica Alt opaque, car Firefox ne floute pas le contenu web.

### Linux : transparence et flou du compositeur

Linux n’a pas de Mica : la fenêtre est rendue transparente par Zen et c’est le
compositeur qui floute ce qu’il y a derrière.

1. `about:config` : `zen.widget.linux.transparency` = `true`, puis redémarrer Zen.
   Zen Fluent passe alors des teintes pleines aux teintes translucides
   (Mica 64 %, Mica Alt 79,75 %, Acrylic 80,64 % en clair et 87,04 % en sombre).
2. Activer le flou selon le bureau :
   - **KDE Plasma** : installer
     [Better Blur DX](https://github.com/xarblu/kwin-effects-better-blur-dx),
     puis Paramètres › Fenêtres › Effets de bureau : désactiver **Flou**, activer
     **Better Blur DX**, et dans son onglet **Force blur** ajouter la classe `zen`
     (`zen-browser` pour le paquet AUR `zen-browser-bin`).
   - **GNOME** : extension [Blur my Shell](https://github.com/aunetx/blur-my-shell),
     onglet **Applications** : activer le flou des applications, désactiver
     **Opaque focused window**, opacité au maximum, ajouter `zen` à la liste.
   - **Hyprland** : `decoration { blur { enabled = true } }` dans `hyprland.conf` ;
     les fenêtres transparentes sont floutées.

Sans compositeur, la transparence donne un fond noir : laissez la préférence à
`false`, le mod peint alors le matériau en plein.

Sur macOS, le mod teinte le fond transparent de la fenêtre avec les mêmes
valeurs que sous Linux transparent.

### Sans accélération matérielle

En rendu logiciel, Zen marque la fenêtre `zen-no-acrylic` et le flou CSS ne
fonctionne pas. Les surfaces Acrylic (menus, panneaux, en-tête de la vue
scindée, boutons de Glance) prennent alors la couleur pleine de repli de WinUI,
comme avec « Réduire la transparence », et le grain Acrylic disparaît. Ce qui
flotte sur la page (barre d’adresse ouverte, fond Acrylic de la barre compacte)
est toujours en couleur pleine.

## Style Edge

**Style de l’interface** › **Microsoft Edge (Fluent 2)** reprend la géométrie
d’Edge : la page est une carte à 4 px de la barre latérale, du bord et du bas
de la fenêtre, aux coins de 8 px avec un filet ; onglets de 36 px aux coins de
8 px, onglet actif surélevé (fond et ombre) sans pastille d’accent ; boutons de
32 px espacés de 4 px ; Essentiels aux coins de 12 px ; bouton de fermeture
rond ; carte média surélevée ; barre d’adresse en pilule (au repos, ouverte et
flottante) ; menus et panneaux à 12 px, éléments à 8 px, ombres Fluent 2 ;
info-bulles à 8 px. Les coins sont de vrais arcs, et **Angles et marges** ne
s’applique pas.

## Réglages

| Groupe           | Réglage                                          | Préférence                                     | Origine               |
| ---------------- | ------------------------------------------------ | ---------------------------------------------- | --------------------- |
| Apparence        | Style de l’interface (WinUI 3, Microsoft Edge)   | `zen-fluent.style`                             | Edge                  |
|                  | Matériau de fond                                 | `zen-fluent.material`                          | Firefox-WinUI         |
|                  | Couleur d’accent                                 | `zen-fluent.accent`                            | Zen Fluent            |
|                  | Couleur personnalisée (accent « Personnalisé »)  | `zen-fluent.accent-custom`                     | Zen Fluent            |
|                  | Angles et marges (style WinUI)                   | `zen-fluent.corners`                           | Nebula                |
|                  | Police                                           | `zen-fluent.font`                              | Firefox-WinUI         |
|                  | Police personnalisée (police « Personnalisée »)  | `zen-fluent.font-custom`                       | Firefox-WinUI         |
|                  | Sélection de texte en couleur d’accent           | `zen-fluent.accent-selection`                  | Firefox-WinUI         |
|                  | Grain Acrylic                                    | `zen-fluent.acrylic-noise`                     | Firefox-WinUI, WinUI  |
| Barre latérale   | Style des boutons                                | `zen-fluent.button-style`                      | Firefox-WinUI         |
|                  | Masquer le bouton Suivant quand il est inactif   | `zen-fluent.hide-forward-disabled`             | Firefox-WinUI         |
|                  | Extensions sous la barre d’adresse (WinUI)       | `zen-fluent.pinned-extensions`                 | Arc 2.0               |
|                  | Indicateur d’espace de travail                   | `zen-fluent.workspace-indicator`               | Nebula                |
|                  | Style des icônes d’espace                        | `zen-fluent.workspace-style`                   | Nebula                |
|                  | Icônes des Essentials en gris                    | `zen-fluent.essentials-gray`                   | Nebula                |
|                  | Fond Acrylic de la barre en mode compact         | `zen-fluent.compact-sidebar-bg`                | Arc 2.0               |
|                  | Repère au bord de la fenêtre en mode compact     | `zen-fluent.compact-edge-hint`                 | Zen Fluent            |
| Onglets          | Taille du texte des onglets                      | `zen-fluent.tab-text-size`                     | Zia                   |
|                  | Titre de l’onglet actif en gras                  | `zen-fluent.tab-bold`                          | Firefox-WinUI         |
|                  | Pastille d’accent sur l’onglet actif (WinUI)     | `zen-fluent.tab-pill`                          | Zen Fluent            |
|                  | Ombre des onglets (angles Zen)                   | `zen-fluent.tab-shadow`                        | Nebula                |
|                  | Bouton de fermeture des onglets                  | `zen-fluent.tab-close-button`                  | Firefox-WinUI         |
|                  | Bouton de fermeture en barre latérale réduite    | `zen-fluent.collapsed-tab-close`               | Firefox-WinUI         |
|                  | Reflets sur l’onglet actif, les menus, panneaux  | `zen-fluent.extra-highlights`                  | Firefox-WinUI         |
| Barre d’adresse  | Forme de la barre d’adresse                      | `zen-fluent.url-style`                         | Firefox-WinUI, Edge   |
|                  | Ligne d’accent sous la barre d’adresse           | `zen-fluent.url-underline`                     | WinUI                 |
|                  | URL centrée                                      | `zen-fluent.url-centered`                      | Firefox-WinUI         |
|                  | Masquer le niveau de zoom                        | `zen-fluent.url-hide-zoom`                     | Firefox-WinUI         |
|                  | Masquer les icônes d’autorisations               | `zen-fluent.url-hide-permissions`              | Firefox-WinUI         |
| Fenêtre et menus | Boutons de fenêtre                               | `zen-fluent.titlebar-style`                    | Firefox-WinUI         |
|                  | Icônes Fluent                                    | `zen-fluent.fluent-icons`                      | Zen Fluent            |
|                  | Autoriser les icônes du mod                      | `svg.context-properties.content.enabled`       | Firefox               |
|                  | Flèches façon macOS                              | `zen-fluent.mac-back-forward`                  | Firefox-WinUI         |
|                  | Précédent / Suivant du menu contextuel           | `zen-fluent.context-navigation`                | Firefox-WinUI         |
|                  | Masquer les raccourcis des menus                 | `zen-fluent.hide-shortcuts`                    | Firefox-WinUI         |
|                  | Masquer les lettres soulignées des menus         | `zen-fluent.hide-access-keys`                  | Firefox-WinUI         |
|                  | Barres de défilement fines dans les pages web    | `zen-fluent.thin-scrollbars-web`               | Zen Fluent            |
| Animations       | Animation de changement d’onglet                 | `zen-fluent.tab-switch-animation`              | Nebula                |
|                  | Animation d’ouverture de la barre d’adresse      | `zen-fluent.urlbar-animation`                  | Nebula, Firefox-WinUI |
|                  | Animation des menus                              | `zen-fluent.menu-animation`                    | Firefox-WinUI         |
|                  | Animations des boutons WinUI 3                   | `zen-fluent.button-animations`                 | Firefox-WinUI         |
|                  | Rebond des flèches Précédent / Suivant           | `zen-fluent.nav-bounce`                        | Firefox-WinUI         |
| Réglages de Zen  | Barre d’adresse flottante                        | `zen.urlbar.behavior`                          | Zia                   |
|                  | Nouvel onglet dans la barre d’adresse flottante  | `zen.urlbar.replace-newtab`                    | Zia                   |
|                  | Bouton Copier le lien (barre unique)             | `zen.urlbar.single-toolbar-show-copy-url`      | Zia                   |
|                  | Domaine seul dans la barre d’adresse             | `zen.urlbar.show-domain-only-in-sidebar`       | Zia                   |
|                  | Icône de protection contre le pistage            | `zen.urlbar.show-protections-icon`             | Zia                   |
|                  | Bouton Image incrustée dans la barre d’adresse   | `zen.urlbar.show-pip-button`                   | Zia                   |
|                  | Aperçu des onglets au survol                     | `browser.tabs.hoverPreview.enabled`            | Zia                   |
|                  | Miniature de la page dans l’aperçu               | `browser.tabs.hoverPreview.showThumbnails`     | Zia                   |
|                  | Indicateur de chargement des pages               | `zen.view.enable-loading-indicator`            | Zia                   |
|                  | Griser les fenêtres inactives                    | `zen.view.grey-out-inactive-windows`           | Zia                   |
|                  | Glisser un onglet sur la page pour scinder       | `zen.splitView.enable-tab-drop`                | Zia                   |
|                  | Image incrustée en quittant l’onglet d’une vidéo | `media.videocontrols.picture-in-picture.…` (1) | Zia                   |
|                  | Commandes complètes de l’image incrustée         | `media.videocontrols.picture-in-picture.…` (2) | Zia                   |

(1) `…enable-when-switching-tabs.enabled`, (2) `…improved-video-controls.enabled`.
Le groupe **Réglages de Zen** expose des préférences de Zen et de Firefox,
avec les valeurs par défaut de Zen. Tant que la vidéo est incrustée, Zen masque
la carte du lecteur dans la barre latérale ; elle revient quand l’incrustation
se ferme. Sans **Aperçu des onglets au survol**, c’est l’infobulle WinUI qui
apparaît.

Valeurs des listes : voir `preferences.json`. Quelques précisions :

- **Couleur personnalisée** accepte toute couleur CSS (`#0078d4`,
  `rgb(0 120 212)`, `teal`…) ; une valeur invalide revient à l’accent Windows, de
  même que les pages internes (`about:`), où Sine ne transmet pas les réglages
  texte.
- **Police** : Segoe UI Variable (par défaut), Aptos, police du système ou police
  personnalisée : un nom de police (`Inter`, `Fira Sans`, `"Fira Sans"`) ou une
  liste de noms d’un seul mot (`Inter, Arial`). Une valeur invalide ou une liste
  mêlant les deux formes revient à Segoe UI Variable, de même que les pages
  internes.
- **Sélection de texte en couleur d’accent** : interface et pages internes, jamais
  les pages web.
- **Grain Acrylic** : environ 2 %, comme l’AcrylicBrush de WinUI, sur les menus,
  les panneaux, l’en-tête de la vue scindée, les boutons de Glance, le texte
  d’état et les surfaces flottantes (pas en Mica Alt). Il disparaît sans
  accélération matérielle, avec la transparence réduite et en contraste élevé.
- **Style des boutons** : discrets (WinUI, fond au survol) ou standards (fond et
  bordure au repos) ; en style Edge, le fond blanc et le filet de la barre
  d’adresse.
- **Taille du texte des onglets** : petite / normale / grande (−1 px / +1 px) ;
  s’applique aussi aux dossiers, au nom de l’espace, à la carte média et aux
  panneaux latéraux de Firefox.
- **Bouton de fermeture en barre latérale réduite** : par défaut (coin supérieur
  gauche, sur l’icône), pastille dans le coin supérieur droit, ou masqué (fermer
  par clic du milieu ou le menu).
- **Forme de la barre d’adresse** : selon le style (zone de texte en WinUI,
  pilule en Edge), zone de texte, pilule ou transparente. La pilule est une
  vraie pilule (rayon = moitié de la hauteur), avec le bouton du site au début et
  des boutons ronds de 28 px centrés sur les extrémités ; ouverte, la surface
  s’agrandit de 4 px tout autour (rayon 20) ; flottante, carte de rayon 24,
  pilule complète sans résultats.
- **Ligne d’accent** : au focus (WinUI, par défaut), au focus animée depuis le
  centre (Fluent 2), toujours (1 px au repos, 2 px au focus) ou jamais. En
  pilule, la ligne s’arrête aux extrémités arrondies.
- **Masquer les icônes d’autorisations** : seule la demande affichée garde son
  icône ; une demande refusée pour l’instant n’a plus d’icône pour y revenir.
- **Boutons de fenêtre** « Arrondis, couleur d’accent » : le glyphe ne prend
  l’accent qu’au survol et au clic (comme Firefox-WinUI).
- **Précédent / Suivant du menu contextuel** : en icônes (Firefox), en liste
  (WinUI) ou en barre de commandes (Explorateur).
- **Animation d’ouverture de la barre d’adresse** : fondu, zoom, et, de
  Firefox-WinUI, glissement, résultats en cascade (vers le bas ou vers le haut)
  et rebond du Microsoft Store. Les résultats ne s’animent qu’à l’ouverture, pas
  pendant la frappe.
- **Animation des menus** : menu volant WinUI (par défaut), depuis le bouton,
  fondu ou aucune.

Barres de défilement : fines au repos, plus larges et plus marquées au survol
(barre latérale, Bibliothèque, menus). L’option pour les pages web passe par
`userContent.css` : avec Sine sous Zen 1.23, la feuille de contenu des mods
n’atteint que les pages internes, l’option ne vaut donc que pour une
installation à la main.

Toutes les animations s’arrêtent avec `prefers-reduced-motion`.

## Limites connues

- L’icône de robot dans la barre d’adresse (`#remote-control-box`) n’apparaît que
  lorsque le navigateur est piloté à distance (Marionette, WebDriver) : ce n’est
  pas le mod.
- Mise à jour depuis une version antérieure : « Barre en pilule », « Barre transparente » et « Police Aptos » sont remplacés par « Forme de la barre d’adresse » et « Police » ; leurs anciennes valeurs ne sont pas reprises, à régler de nouveau.

## Structure

```
zen-fluent/
├─ theme.json
├─ preferences.json
├─ userChrome.css          → @import des modules
├─ userContent.css         → nouvel onglet, pages internes
├─ icons/                  → icônes Fluent (stroke="context-fill")
└─ modules/
   ├─ tokens.css           → --zf-* sombre / clair, accent, rayons, police
   ├─ materials.css        → mica, mica-alt, acrylic, carte de contenu
   ├─ sidebar.css          → onglets, Essentials, dossiers, espaces
   ├─ extensions.css       → extensions sous la barre d’adresse
   ├─ urlbar.css           → barre d’adresse, résultats
   ├─ split-glance.css     → vue scindée, Glance
   ├─ media.css            → lecteur, image incrustée
   ├─ library.css          → Bibliothèque (Zen 1.23)
   ├─ menus.css            → menus contextuels, panneaux
   ├─ scrollbars.css       → barres de défilement fines
   ├─ findbar.css          → barre de recherche (Ctrl+F)
   ├─ tooltips.css         → infobulles WinUI
   ├─ tab-preview.css      → aperçu d’onglet au survol
   ├─ site-panels.css      → panneaux du site, autorisations, téléchargements
   ├─ dialogs.css          → boîtes de dialogue (alertes, impression…)
   ├─ ff-sidebar.css       → barre latérale de Firefox (marque-pages, historique)
   ├─ window.css           → boutons de fenêtre
   ├─ icons.css            → icônes Fluent
   ├─ animations.css       → transitions WinUI
   ├─ content.css          → pages about:, réglages Zen et Sine, pages web
   └─ dialogs-content.css  → boîtes de dialogue de about:preferences
```

Les couleurs sont des paires `light-dark()` : le mode clair ou sombre suit
`zen.view.window.scheme`. L’accent est dérivé avec `color-mix()` (+ 45 % de blanc
en sombre, + 15 % de noir en clair), comme dans Firefox-WinUI.

## Développement

Édition en direct : [guide Zen](https://docs.zen-browser.app/guides/live-editing)
(Ctrl+Maj+Alt+I › Éditeur de style).

```sh
npm install
npm run lint       # prettier + stylelint
npm run lint:fix
```

## Crédits

- [Firefox-WinUI](https://github.com/Lockframe/Firefox-WinUI) (Lockframe) : tokens WinUI,
  accent, styles de boutons de fenêtre, options de la barre d’adresse, des
  onglets, des menus et des animations.
- [Nebula](https://github.com/JustADumbPrsn/Zen-Nebula) (JustADumbPrsn) : découpage en
  modules, options de la barre latérale et des animations.
- [Arc 2.0](https://github.com/YashjitPal/Arc-2.0) (YashjitPal) : extensions sous les
  Essentials, fond de la barre en mode compact.
- Microsoft Edge et Fluent 2 : style Edge (géométrie, couleurs, ombres).
- WinUI 3 et le Windows Community Toolkit : contrôles, ligne d’accent,
  SettingsExpander des réglages.
- [Zia](https://github.com/z1n-k/zia) (z1n-k) : taille du texte des onglets, réglages de Zen exposés dans le mod.

## Licence

[MIT](LICENSE)
