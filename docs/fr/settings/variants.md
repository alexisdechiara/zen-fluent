# Variants (variantes)

Traduction de [docs/settings/variants.md](../../settings/variants.md).

Le fond et la forme des boutons et des tuiles, pour tous les composants à la
fois ou un par un.

En-tête du groupe : `zen-fluent.ui.open-variants` (ouvert par défaut :
`false`).

Chaque réglage de **fond** (« fill ») propose les mêmes valeurs :

| Valeur        | Libellé                                                      |
| ------------- | ------------------------------------------------------------ |
| `auto`        | Automatic (voir la colonne « Automatic » du tableau suivant) |
| `solid`       | Solid (opaque)                                               |
| `standard`    | Standard (bouton WinUI : fond de contrôle et bordure)        |
| `tint`        | Tint (fond teinté et bordure)                                |
| `outline`     | Outline (bordure seule)                                      |
| `subtle`      | Subtle (fond au survol)                                      |
| `transparent` | Transparent (glyphe en accent au survol)                     |
| `translucent` | Translucent (le fond propre à Zen)                           |

Chaque réglage de **forme** (« shape ») propose `auto` Automatic, `square`
Square, `rounded` Rounded et `pill` Pill.

| Réglage                                                                                 | Préférence                                | Automatic                                            | Défaut    |
| --------------------------------------------------------------------------------------- | ----------------------------------------- | ---------------------------------------------------- | --------- |
| Fill, everywhere                                                                        | `zen-fluent.variant.global`               | celui de chaque composant                            | `auto`    |
| Shape, everywhere                                                                       | `zen-fluent.variant.global-shape`         | celle de chaque composant                            | `auto`    |
| Toolbar and sidebar buttons: fill                                                       | `zen-fluent.variant.buttons`              | partout                                              | `auto`    |
| Toolbar and sidebar buttons: shape                                                      | `zen-fluent.variant.buttons-shape`        | partout                                              | `auto`    |
| Extension buttons: fill                                                                 | `zen-fluent.variant.extensions`           | partout                                              | `auto`    |
| Extension buttons: shape                                                                | `zen-fluent.variant.extensions-shape`     | partout                                              | `auto`    |
| Extensions row: fill                                                                    | `zen-fluent.variant.extensions-row`       | le réglage de fond de la ligne                       | `auto`    |
| Extensions row: shape                                                                   | `zen-fluent.variant.extensions-row-shape` | arrondie                                             | `auto`    |
| Extension buttons: fill and shape for (affiché seulement tant qu'il vaut The whole row) | `zen-fluent.variant.extensions-scope`     | valeurs : `buttons` Each button, `row` The whole row | `buttons` |
| Essentials: fill                                                                        | `zen-fluent.variant.essentials`           | partout                                              | `auto`    |
| Essentials: shape                                                                       | `zen-fluent.variant.essentials-shape`     | partout                                              | `auto`    |
| Tabs: fill                                                                              | `zen-fluent.variant.tabs`                 | partout                                              | `auto`    |
| Tabs: shape                                                                             | `zen-fluent.variant.tabs-shape`           | partout                                              | `auto`    |
| Pinned tabs: fill                                                                       | `zen-fluent.variant.pinned-tabs`          | partout                                              | `auto`    |
| Pinned tabs: shape                                                                      | `zen-fluent.variant.pinned-tabs-shape`    | partout                                              | `auto`    |
| Folder headers: fill                                                                    | `zen-fluent.variant.folders`              | partout                                              | `auto`    |
| Folder headers: shape                                                                   | `zen-fluent.variant.folders-shape`        | partout                                              | `auto`    |
| Space buttons: fill                                                                     | `zen-fluent.variant.spaces`               | partout                                              | `auto`    |
| Space buttons: shape                                                                    | `zen-fluent.variant.spaces-shape`         | partout                                              | `auto`    |
| URL bar: fill                                                                           | `zen-fluent.variant.urlbar`               | partout                                              | `auto`    |
| URL bar: shape                                                                          | `zen-fluent.variant.urlbar-shape`         | partout                                              | `auto`    |
| URL bar buttons: fill                                                                   | `zen-fluent.variant.urlbar-buttons`       | partout                                              | `auto`    |
| URL bar buttons: shape                                                                  | `zen-fluent.variant.urlbar-buttons-shape` | partout                                              | `auto`    |
| Badges: fill                                                                            | `zen-fluent.variant.badges`               | partout                                              | `auto`    |
| Badges: shape                                                                           | `zen-fluent.variant.badges-shape`         | partout                                              | `auto`    |
| Panel and dialog buttons: fill                                                          | `zen-fluent.variant.panel-buttons`        | partout                                              | `auto`    |
| Panel and dialog buttons: shape                                                         | `zen-fluent.variant.panel-buttons-shape`  | partout                                              | `auto`    |

« Partout » : Automatic suit alors le réglage **everywhere** correspondant.

## Comment les choix se combinent

Deux axes, pour que les choix se combinent : le **fond** (solid, standard,
tint, outline, subtle, transparent, translucent) et la **forme** (square,
rounded, pill). Un fond **Pill** enregistré par la 0.3 ou une version
antérieure se lit encore comme la forme pilule, et un fond **Ghost**
enregistré par la 0.4.1 ou une version antérieure comme Subtle.

- Le fond d'un composant est le sien quand il en nomme un, sinon celui qui
  est fixé pour tous les composants ; Automatic sur les deux garde
  l'apparence des autres réglages (par exemple **Button style** du groupe
  Sidebar, qu'un fond de boutons remplace).
- La forme est celle du composant, sinon celle qui est fixée pour tous les
  composants. Rounded garde le rayon propre au composant (et bloque une forme
  fixée pour tous les composants).

## Fonds

Les noms sont ceux de Microsoft : les apparences de bouton de Fluent 2
(outline, subtle, transparent), ses apparences de badge (tint) et les
couleurs de fond de WinUI (control fill, control solid fill, subtle fill).
Sources :
[Fluent UI Button](https://github.com/microsoft/fluentui/blob/master/packages/react-components/react-button/library/src/components/Button/Button.types.ts),
[Fluent UI Badge](https://github.com/microsoft/fluentui/blob/master/packages/react-components/react-badge/library/src/components/Badge/Badge.types.ts),
[WinUI theme resources](https://github.com/microsoft/microsoft-ui-xaml/blob/main/controls/dev/CommonStyles/Common_themeresources_any.xaml).

- **Solid** : opaque (`ControlSolidFillColorDefault` de WinUI : blanc en
  clair, gris foncé en sombre) avec le trait d'élévation ; rien ne
  transparaît. Dans le style Edge, avec le filet de Fluent 2.
- **Standard** : le bouton par défaut de WinUI : le fond de contrôle
  translucide (`ControlFillColorDefault`) et le trait d'élévation (style
  Edge : le champ blanc et le filet de la barre d'adresse). Fluent 2
  l'appelle le bouton secondaire.
- **Tint** : la moitié du fond de contrôle dans le trait de 1 px d'Outline,
  le fond de contrôle entier au survol (le badge tint de Fluent 2).
- **Outline** : un trait de 1 px, les fonds subtils au survol et à l'appui.
  Les thèmes de contraste le dessinent dans la couleur du texte des boutons.
- **Subtle** : aucun fond au repos, le fond subtil
  (`SubtleFillColorSecondary`) au survol (le bouton subtle de Fluent 2, les
  boutons de barre de commandes de WinUI).
- **Transparent** : aucun fond, même au survol ; les glyphes passent à
  l'accent au survol (le bouton transparent de Fluent 2).
- **Translucent** : les fonds translucides propres à Zen, une part de la
  couleur du texte qui laisse voir la couleur de la fenêtre (et le dégradé de
  l'espace) ; l'élément sélectionné prend le voile blanc de Zen. Ce n'est pas
  un nom de Microsoft : c'est l'apparence de Zen.

## Composants

Les boutons prennent le fond au repos, au survol et à l'appui. Les listes
(onglets, onglets épinglés, espaces) le prennent sur leur élément
sélectionné : les autres restent nus, avec le survol du fond. Solid surélève
l'élément sélectionné sur un fond opaque, Standard sur le fond de contrôle,
Tint lui donne le fond de contrôle dans le trait, Outline l'entoure, Subtle
lui donne le fond subtil, Transparent le laisse nu (la pastille ou le point
d'accent le marque toujours), Translucent pose dessus le voile blanc de Zen.

- **Toolbar and sidebar buttons** : les boutons du haut et du bas de la
  barre latérale (menu, mode compact, précédent, suivant, actualiser,
  Bibliothèque, Nouveau) et ceux de la barre d'outils avec plusieurs barres
  d'outils. La ligne Nouvel onglet, la carte multimédia et les espaces
  gardent leur apparence. Pill sur ces boutons carrés dessine des cercles.
- **Extension buttons** et **Extensions row** : les boutons de la ligne des
  extensions épinglées (groupe Extensions), et la ligne elle-même, une
  surface à 4 px autour d'eux. Les deux s'appliquent à la fois ; l'Automatic
  de la ligne s'en remet à **Row background** (groupe Extensions) et ne suit
  pas le fond fixé pour tous les composants. Un choix **Fill and shape for:
  The whole row** enregistré par la 0.4.2 ou une version antérieure déplace
  encore le fond et la forme des boutons vers la ligne, jusqu'à ce qu'un fond
  ou une forme de ligne soit choisi.
- **Essentials** : le fond est pour les tuiles au repos ; la tuile
  sélectionnée garde **Selected Essential** (groupe Essentials). La forme
  est pour toutes les tuiles. Subtle et Transparent laissent des icônes nues
  au repos, comme la barre des tâches.
- **Tabs** : l'onglet sélectionné garde sa pastille d'accent. Pill arrondit
  les extrémités de la ligne.
- **Pinned tabs** : les onglets épinglés d'un espace, ceux de ses dossiers
  compris.
- **Folder headers** : la ligne de libellé du dossier, comme un bouton.
- **Space buttons** : l'espace courant prend le fond. Un fond remplace le
  Fill de **Workspace icon style** ; son point Pill et son estompage Minimal
  restent.
- **URL bar** : le champ au repos et survolé ; avec le focus ou ouvert, il
  garde son apparence. Solid est un champ opaque, Standard le champ propre au
  style (les deux redonnent un champ à la forme Transparent de la barre
  d'adresse), Tint un fond léger dans un trait, Outline un trait sans fond,
  Translucent le champ translucide de Zen. Subtle et Transparent gardent un
  trait discret : sans aucun trait, rien ne montrerait où taper. La forme
  n'arrondit que le champ : le Pill de **URL bar shape** transforme aussi ses
  boutons en cercles.
- **URL bar buttons** : informations du site, permissions, protection contre
  le pistage, étoile de marque-page et actions de la page.
- **Badges** : les compteurs des extensions et le compteur de
  téléchargements de la Bibliothèque. Solid et Standard sont l'accent, Tint
  une teinte d'accent dans un anneau d'accent, Subtle et Transparent un texte
  en accent sur la couleur de la fenêtre, Outline ajoute un anneau d'accent,
  Translucent un accent translucide. Square leur donne des coins de 2 px.
- **Panel and dialog buttons** : les boutons standard des menus volants
  (téléchargements, informations du site) et des boîtes de dialogue ; le
  bouton d'accent garde son fond mais prend la forme.

Les boutons de la barre de titre de la fenêtre (réduire, agrandir, fermer)
suivent le réglage **Caption buttons** : un fond ou une forme ne
ressemblerait plus à ceux de Windows.
