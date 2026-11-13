# Window and menus (fenêtre et menus)

Traduction de
[docs/settings/window-and-menus.md](../../settings/window-and-menus.md).

Boutons de la barre de titre, barre de marque-pages, barre de chargement,
icônes, menus, défilement.

En-tête du groupe : `zen-fluent.ui.open-window` (ouvert par défaut :
`false`).

| Réglage                                                                                            | Préférence                       | Valeurs                                                                                                | Défaut      |
| -------------------------------------------------------------------------------------------------- | -------------------------------- | ------------------------------------------------------------------------------------------------------ | ----------- |
| Caption buttons                                                                                    | `zen-fluent.titlebar-style`      | `windows11` Windows 11<br>`rounded` Rounded<br>`rounded-accent` Rounded, accent color<br>`short` Short | `windows11` |
| Auto-hide the bookmarks toolbar (affichée tant que le pointeur est sur la barre d'outils)          | `zen-fluent.bookmarks-autohide`  | `true` / `false`                                                                                       | `false`     |
| Page loading bar (pendant le chargement d'une page, avec l'indicateur de chargement de Zen activé) | `zen-fluent.loading-bar`         | `winui` WinUI ProgressBar<br>`zen` Zen’s indicator                                                     | `winui`     |
| macOS-style arrows                                                                                 | `zen-fluent.mac-back-forward`    | `true` / `false`                                                                                       | `false`     |
| Menu tint (menus et panneaux ; WinUI les garde neutres)                                            | `zen-fluent.menu-tint`           | `none` None (WinUI, blanc ou gris foncé)<br>`accent` Accent color<br>`space` Space color               | `none`      |
| Back / Forward in the context menu                                                                 | `zen-fluent.context-navigation`  | `icons` Icons (Firefox)<br>`list` List (WinUI)<br>`commandbar` Command bar (Explorateur de fichiers)   | `icons`     |
| Hide menu shortcuts                                                                                | `zen-fluent.hide-shortcuts`      | `true` / `false`                                                                                       | `false`     |
| Hide underlined letters in menus                                                                   | `zen-fluent.hide-access-keys`    | `true` / `false`                                                                                       | `false`     |
| Thin scrollbars in web pages (installation manuelle seulement)                                     | `zen-fluent.thin-scrollbars-web` | `true` / `false`                                                                                       | `false`     |

## Notes

- **Caption buttons**, « Rounded, accent color » : le glyphe ne prend
  l'accent qu'au survol et à l'appui.
- **Auto-hide the bookmarks toolbar** : quand la barre de marque-pages est
  affichée (`browser.toolbars.bookmarks.visibility`), elle ne prend aucune
  hauteur jusqu'à ce que le pointeur soit sur la zone de la barre d'outils,
  que le clavier y soit (F6, Tab), qu'un de ses menus soit ouvert, ou qu'un
  lien soit glissé au-dessus. Elle apparaît en glissant à la durée normale de
  WinUI, sans mouvement quand les animations réduites sont activées, et vient
  avec la barre d'outils en mode compact.
- **Page loading bar** : une ProgressBar indéterminée de WinUI (3 px, deux
  indicateurs en accent sur une boucle de 2 s) le long du bord supérieur de
  la page, coupée par ses coins ; en vue scindée, sur le volet sélectionné.
  Elle s'affiche tant que **Page loading indicator** de Zen est activé
  (groupe Zen settings) ; avec les animations réduites, c'est une ligne
  d'accent fixe. **Zen’s indicator** garde la pastille pulsante de Zen.
- **Back / Forward in the context menu** : des icônes (Firefox), une liste
  (WinUI) ou une barre de commandes (Explorateur de fichiers).
- **Thin scrollbars** : fines au repos, plus larges et plus marquées au
  survol (barre latérale, Bibliothèque, menus). L'option pour les pages web
  passe par `core/userContent.css` : avec Sine sous Zen 1.23, la feuille de
  contenu d'un mod n'atteint que les pages internes, donc l'option ne
  fonctionne que pour une
  [installation manuelle](../installation.md#installation-manuelle).

**Menu tint** : les menus et les menus volants de WinUI sont en Acrylic
neutre, blancs en mode clair. **Accent color** y mélange 14 % de l'accent de
Zen Fluent (l'accent de Windows par défaut), **Space color** 14 % de la
couleur de l'espace. Avec **None**, « Apply the Zen space accent color » de
Zen Calmer Context Menu s'efface aussi : c'est Zen Fluent qui décide de la
couleur des menus.
