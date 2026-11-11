# Tabs (onglets)

Traduction de [docs/settings/tabs.md](../../settings/tabs.md).

Texte, pastille, ombre, boutons de fermeture, reflets, onglets déchargés,
son, conteneurs, dossiers vides.

En-tête du groupe : `zen-fluent.ui.open-tabs` (ouvert par défaut : `false`).

| Réglage                                                                       | Préférence                       | Valeurs                                                                                                                    | Défaut    |
| ----------------------------------------------------------------------------- | -------------------------------- | -------------------------------------------------------------------------------------------------------------------------- | --------- |
| Tab text size                                                                 | `zen-fluent.tab-text-size`       | `small` Small<br>`normal` Normal<br>`large` Large                                                                          | `normal`  |
| Row height (expert)                                                           | `zen-fluent.tab-height`          | `auto` Automatic (celle du style)<br>`28` 28 px<br>`32` 32 px<br>`36` 36 px<br>`40` 40 px<br>`44` 44 px<br>`custom` Custom | `auto`    |
| Custom row height                                                             | `zen-fluent.tab-height-custom`   | une longueur en px                                                                                                         | `38px`    |
| Space between tabs (expert)                                                   | `zen-fluent.tab-gap`             | `auto` Automatic (celui du style)<br>`0` None<br>`2` 2 px<br>`4` 4 px<br>`6` 6 px<br>`8` 8 px<br>`custom` Custom           | `auto`    |
| Custom space between tabs                                                     | `zen-fluent.tab-gap-custom`      | une longueur en px                                                                                                         | `3px`     |
| Bold title on the selected tab                                                | `zen-fluent.tab-bold`            | `true` / `false`                                                                                                           | `false`   |
| Accent pill on the selected tab                                               | `zen-fluent.tab-pill`            | `true` / `false`                                                                                                           | `true`    |
| Tab shadow (coins Zen)                                                        | `zen-fluent.tab-shadow`          | `true` / `false`                                                                                                           | `true`    |
| Tab close button                                                              | `zen-fluent.tab-close-button`    | `1` Selected tab and hover<br>`2` Hover only<br>`3` Never                                                                  | `1`       |
| Close button in the collapsed sidebar                                         | `zen-fluent.collapsed-tab-close` | `default` Default (coin supérieur de début)<br>`overlay` Badge in the corner<br>`hidden` Hidden                            | `default` |
| Highlights on the selected tab, menus and panels                              | `zen-fluent.extra-highlights`    | `true` / `false`                                                                                                           | `false`   |
| Dim unloaded tabs (favicon et titre estompés jusqu'au chargement de l'onglet) | `zen-fluent.dim-unloaded-tabs`   | `true` / `false`                                                                                                           | `true`    |
| Animated sound bars on playing tabs                                           | `zen-fluent.sound-bars`          | `true` / `false`                                                                                                           | `true`    |
| Container tabs                                                                | `zen-fluent.container-tabs`      | `line` Colored line<br>`tint` Colored line and tint<br>`none` Zen’s look                                                   | `line`    |
| “Drag tabs here” in empty folders                                             | `zen-fluent.empty-folder-hint`   | `true` / `false`                                                                                                           | `true`    |

## Notes

- **Row height** (expert) : les onglets, les dossiers, la ligne Nouvel
  onglet et les lignes de la Bibliothèque (les 36 px de la densité, 32 px en
  compact).
- **Space between tabs** (expert) : entre deux lignes d'onglets (4 px par
  défaut).
- **Tab text size** : petit, normal ou grand (−1 px / +1 px). S'applique
  aussi aux dossiers, au nom de l'espace de travail, à la carte multimédia et
  aux panneaux latéraux de Firefox.
- **Accent pill** est masqué dans le style Edge (l'onglet sélectionné est
  surélevé à la place) ; **Tab shadow** ne s'applique qu'avec les coins Zen
  et est masqué sinon.
- **Close button in the collapsed sidebar** : par défaut (coin supérieur de
  début, par-dessus l'icône), un badge dans le coin supérieur de fin, ou
  masqué (fermez avec un clic du milieu ou le menu). Avec le badge, le badge
  audio d'un onglet en lecture passe dans le coin inférieur de fin de son
  icône.
- **Dim unloaded tabs** : un onglet sans page chargée (restauré au
  démarrage, ou déchargé) affiche son favicon et son titre à 65 %, le texte
  tertiaire de WinUI. Cela vaut pour les lignes, les onglets épinglés, les
  Essentials et la barre latérale repliée ; l'onglet sélectionné n'est jamais
  estompé. L'estompage des favicons déchargés par Zen est remplacé, pas
  ajouté.
- **Animated sound bars** : trois barres dans la couleur d'accent montent et
  descendent à la place du haut-parleur. Elles s'affichent dans le bouton
  audio après le favicon, et dans le badge audio par-dessus le favicon
  (Essentials et barre latérale repliée), là dans la couleur prévue sur
  l'accent. Les onglets muets et bloqués gardent les glyphes de Zen ; avec
  les animations réduites, les barres restent immobiles.
- **Container tabs** : une barre arrondie dans la couleur du conteneur au
  bord de début de l'onglet (Zen la dessine au bord de fin). Sur l'onglet
  sélectionné, la pastille d'accent prend sa place ; dans le style Edge, ou
  avec la pastille désactivée, la barre reste. **Colored line and tint** pose
  aussi un léger voile de la couleur du conteneur sur l'onglet. Les onglets
  du conteneur par défaut de l'espace, ce qui inclut tous les Essentials,
  restent sans marque, comme dans Zen
  (`zen.workspaces.hide-default-container-indicator`).
- **“Drag tabs here”** : un dossier ouvert sans onglet affiche un
  emplacement en tirets. Il disparaît en glissant avec le dossier quand
  celui-ci est replié et ne s'affiche pas dans la barre latérale repliée.
  Déposez des onglets sur le dossier comme d'habitude.
