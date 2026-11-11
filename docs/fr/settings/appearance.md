# Appearance (apparence)

Traduction de [docs/settings/appearance.md](../../settings/appearance.md).

Style, matériau, couleur d'accent, coins et leur rayon, densité, police et
flou Acrylic.

En-tête du groupe : `zen-fluent.ui.open-appearance` (ouvert par défaut :
`true`).

| Réglage                                                                                                                                                  | Préférence                           | Valeurs                                                                                                                                                                           | Défaut     |
| -------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- |
| Interface style                                                                                                                                          | `zen-fluent.style`                   | `winui` WinUI 3 (Windows 11)<br>`edge` Microsoft Edge (Fluent 2)                                                                                                                  | `winui`    |
| Backdrop material (le même que la règle Mica For Everyone pour zen)                                                                                      | `zen-fluent.material`                | `mica` Mica<br>`mica-alt` Mica Alt (Tabbed)<br>`acrylic` Acrylic                                                                                                                  | `mica`     |
| Tint opacity (la part de la couleur du matériau qui couvre la fenêtre transparente)                                                                      | `zen-fluent.tint-opacity`            | `auto` Automatic (celle du matériau)<br>`none` None (le fond seul)<br>`light` Light (40 %)<br>`strong` Strong (85 %)<br>`solid` Solid (aucune transparence)<br>`custom` Custom    | `auto`     |
| Custom opacity (un pourcentage, par exemple 50%)                                                                                                         | `zen-fluent.tint-opacity-custom`     | texte                                                                                                                                                                             | `64%`      |
| Space color (une couleur choisie dans le sélecteur de dégradé de Zen teinte la fenêtre)                                                                  | `zen-fluent.space-color`             | `zen` Le dégradé de Zen, le matériau s'il n'y en a pas<br>`material` Toujours le matériau                                                                                         | `zen`      |
| Accent color                                                                                                                                             | `zen-fluent.accent`                  | `system` Windows accent<br>`zen` Zen workspace color<br>`blue` Blue<br>`violet` Violet<br>`mint` Mint<br>`orange` Orange<br>`pink` Pink<br>`graphite` Graphite<br>`custom` Custom | `system`   |
| Custom color (toute couleur CSS : #0078d4, rgb(0 120 212), teal…)                                                                                        | `zen-fluent.accent-custom`           | texte                                                                                                                                                                             | `#0078d4`  |
| Corners and gaps                                                                                                                                         | `zen-fluent.corners`                 | `winui` WinUI (sans marges)<br>`zen` Zen (arrondi, avec marges)                                                                                                                   | `winui`    |
| Corner radius (boutons, onglets, cartes et menus ; les cercles et les pilules restent ronds)                                                             | `zen-fluent.corner-radius`           | `auto` Automatic (celui du style)<br>`square` Square<br>`small` Small (2 px)<br>`medium` Medium (4 px)<br>`large` Large (8 px)<br>`custom` Custom                                 | `auto`     |
| Custom radius (des boutons et des onglets, en px, par exemple 6px ; les cartes et les menus suivent)                                                     | `zen-fluent.corner-radius-custom`    | texte                                                                                                                                                                             | `6px`      |
| Density (hauteur des lignes et des contrôles ; pas le mode compact de Zen)                                                                               | `zen-fluent.density`                 | `standard` Standard<br>`compact` Compact (dimensions compactes de WinUI)                                                                                                          | `standard` |
| Expert mode (plus de réglages : marges autour de la page, ses coins, le padding de la barre latérale, la hauteur des lignes, l'espace entre les onglets) | `zen-fluent.expert`                  | `true` / `false`                                                                                                                                                                  | `false`    |
| Gap around the page (expert)                                                                                                                             | `zen-fluent.page-gap`                | `auto` Automatic (celle du style)<br>`0` None<br>`2` 2 px<br>`4` 4 px<br>`8` 8 px<br>`12` 12 px<br>`16` 16 px<br>`custom` Custom                                                  | `auto`     |
| Custom gap around the page                                                                                                                               | `zen-fluent.page-gap-custom`         | une longueur en px                                                                                                                                                                | `6px`      |
| Gap between the sidebar and the page (expert)                                                                                                            | `zen-fluent.page-gap-sidebar`        | `auto` Automatic (celle du style)<br>`0` None<br>`2` 2 px<br>`4` 4 px<br>`8` 8 px<br>`12` 12 px<br>`16` 16 px<br>`custom` Custom                                                  | `auto`     |
| Custom gap beside the sidebar                                                                                                                            | `zen-fluent.page-gap-sidebar-custom` | une longueur en px                                                                                                                                                                | `6px`      |
| Page corners (expert)                                                                                                                                    | `zen-fluent.page-radius`             | `auto` Automatic (ceux du style)<br>`0` Square<br>`4` 4 px<br>`8` 8 px<br>`12` 12 px<br>`16` 16 px<br>`24` 24 px<br>`custom` Custom                                               | `auto`     |
| Custom page corners                                                                                                                                      | `zen-fluent.page-radius-custom`      | une longueur en px                                                                                                                                                                | `10px`     |
| Font                                                                                                                                                     | `zen-fluent.font`                    | `segoe` Segoe UI Variable<br>`aptos` Aptos<br>`system` System font<br>`custom` Custom                                                                                             | `segoe`    |
| Custom font (un nom de police, par exemple Inter ou Fira Sans)                                                                                           | `zen-fluent.font-custom`             | texte                                                                                                                                                                             | `(vide)`   |
| Text selection in the accent color                                                                                                                       | `zen-fluent.accent-selection`        | `true` / `false`                                                                                                                                                                  | `true`     |
| Acrylic blur (en-tête de la vue scindée et boutons de Glance)                                                                                            | `zen-fluent.acrylic-blur`            | `auto` Automatic (20 px)<br>`none` None<br>`light` Light (10 px)<br>`strong` Strong (30 px, comme dans WinUI)<br>`custom` Custom                                                  | `auto`     |
| Custom blur (un rayon en px, par exemple 30px)                                                                                                           | `zen-fluent.acrylic-blur-custom`     | texte                                                                                                                                                                             | `20px`     |
| Acrylic noise (menus, panneaux et surfaces flottantes)                                                                                                   | `zen-fluent.acrylic-noise`           | `true` / `false`                                                                                                                                                                  | `false`    |

## Notes

- **Expert mode** (dans la vue d'ensemble de la page de réglages, ici dans
  la boîte de dialogue de Sine) : affiche (et applique) les réglages marqués
  « expert » dans chaque groupe : **Interface style** (sinon c'est un thème
  qui le fixe : Windows 11, Microsoft Edge), la marge entre la page et les
  bords de la fenêtre, la marge à côté de la barre latérale, les coins de la
  page (Appearance), le padding de la barre latérale (Sidebar), la hauteur
  des lignes et l'espace entre les onglets (Tabs). Il donne aussi à chaque
  réglage numérique une valeur **Custom (expert mode)** : les Essentials (par
  ligne, largeur, hauteur, espacement), la ligne des extensions (colonnes,
  lignes, taille des icônes et des boutons, espacement) et les durées de Zen
  Fluent Enhanced (archivage des onglets, délai des cartes de survol, mise en
  veille des onglets, durée d'une session de concentration). Une valeur
  personnalisée est un nombre (`6px` ou `6` pour une longueur) ; toute autre
  saisie revient à la valeur habituelle. Désactivé, les réglages experts
  gardent leurs valeurs mais ne s'appliquent plus. Avec les coins WinUI, une
  marge autour de la page en fait une carte flottante, arrondie et bordée
  tout autour.
- **Interface style** : voir [Style Edge](../core.md#style-edge). Dans le
  style Edge, **Corners and gaps** ne s'applique pas et sa ligne est masquée.
- **Density** : la valeur compacte suit les dimensions compactes de WinUI.
  Les contrôles (boutons, champs de texte, listes déroulantes) passent de 32
  à 24 px, les lignes de liste de 40 à 32 px, les onglets de la barre
  latérale, les dossiers et les lignes de la Bibliothèque de 36 à 32 px, les
  lignes d'arbre de 32 à 24 px, les lignes de menu de 32 à 28 px, les boutons
  de barre d'outils et d'icône à 28 px, les Essentials de 42 à 36 px, et le
  champ de la barre d'adresse à 28 px dans chaque forme (la barre garde la
  boîte de Zen, donc rien ne bouge autour). Le texte garde sa taille. Les
  boîtes de dialogue et les pages internes gardent les tailles standard. Ce
  n'est pas le mode compact de Zen, qui masque la barre latérale et la barre
  d'outils.
- **Custom color** accepte toute couleur CSS (`#0078d4`, `rgb(0 120 212)`,
  `teal`…). Sa ligne ne s'affiche que si l'accent est **Custom**. Une valeur
  invalide revient à l'accent de Windows, tout comme les pages internes
  (`about:`), où Sine ne transmet pas les réglages de texte.
- **Tint opacity** : la part de la teinte du matériau qui couvre le fond du
  système (Mica For Everyone, macOS, Linux transparent). **Automatic** garde
  celle de chaque matériau : Mica 64 %, Mica Alt 79,75 % (rien par-dessus le
  Mica Alt de Windows), Acrylic 80,64 % en clair et 87,04 % en sombre. Les
  autres valeurs fixent une seule opacité pour tous les matériaux, Mica Alt
  sous Windows compris : none montre le fond seul, solid le cache. La barre
  latérale compacte de Zen, au-dessus de la page, suit avec la couche unique
  correspondante. Le réglage ne fait rien sur une fenêtre opaque (ni Mica ni
  transparence) ni dans un thème de contraste.
- **Custom opacity** : un pourcentage comme `50%` (`50` seul signifie pour
  cent ; au-dessus de 100, la valeur compte pour 100). Sa ligne ne s'affiche
  que si l'opacité est **Custom**. Une valeur invalide garde l'opacité du
  matériau.
- **Font** : Segoe UI Variable (par défaut), Aptos, la police du système ou
  une police personnalisée. Une police personnalisée est un nom de police
  (`Inter`, `Fira Sans`, `"Fira Sans"`) ou une liste de noms en un mot
  (`Inter, Arial`). Une valeur invalide, ou une liste qui mélange les deux
  formes, revient à Segoe UI Variable, tout comme les pages internes. Sa
  ligne ne s'affiche que si la police est **Custom**.
- **Text selection in the accent color** : l'interface et les pages
  internes, jamais les pages web.
- **Acrylic noise** : environ 2 %, comme l'AcrylicBrush de WinUI, sur les
  menus, les panneaux, l'en-tête de la vue scindée, les boutons de Glance, le
  texte d'état et les surfaces flottantes (pas avec Mica Alt). Il disparaît
  sans accélération matérielle, avec la transparence réduite et en contraste
  élevé.
- **Corner radius** : **Automatic** garde les rayons de chaque style pour
  les contrôles, les cartes et les superpositions : WinUI 4 / 8 / 8 px, coins
  Zen 8 / 10 / 12 px, Edge 8 / 8 / 12 px. Les autres valeurs fixent le rayon
  des boutons, des onglets, des lignes et des champs (carré 0, petit 2 px,
  moyen 4 px, grand 8 px, ou personnalisé) ; les cartes et les superpositions
  (la carte de la page, les menus, les menus volants, les boîtes de dialogue)
  gardent le rapport du style avec lui, donc « large » dans le style WinUI
  donne 8 / 16 / 16 px. Les cercles et les pilules restent ronds. Avec les
  popups Mica (Windows 11), Windows dessine lui-même les coins des menus et
  des panneaux.
- **Custom radius** : une longueur comme `6px` (`6` seul signifie des
  pixels). Sa ligne ne s'affiche que si le rayon des coins est **Custom**.
  Une valeur invalide (du texte, un pourcentage, une longueur négative)
  revient aux rayons du style, tout comme les pages internes et les pages du
  panneau latéral de Firefox, où Sine ne transmet pas les réglages de texte.
- **Acrylic blur** : le flou derrière l'en-tête de la vue scindée et les
  boutons de Glance, les deux surfaces Acrylic translucides : 20 px par
  défaut, aucun, 10 px, 30 px (l'AcrylicBrush de WinUI) ou personnalisé.
  Firefox ne floute pas une page web derrière l'interface, donc au-dessus
  d'une page seule l'interface derrière elles est floutée ; les autres
  surfaces au-dessus de la page sont pleines. Aucun flou sans accélération
  matérielle, avec la transparence réduite ou dans un thème de contraste,
  quel que soit le réglage.
- **Custom blur** : une longueur comme `30px` (`30` seul signifie des
  pixels). Sa ligne ne s'affiche que si le flou est **Custom**. Une valeur
  invalide revient à 20 px.
