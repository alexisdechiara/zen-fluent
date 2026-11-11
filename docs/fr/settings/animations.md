# Animations

Traduction de [docs/settings/animations.md](../../settings/animations.md).

Changement d'onglet, barre d'adresse, menus, boutons, icônes animées.

En-tête du groupe : `zen-fluent.ui.open-animations` (ouvert par défaut :
`false`).

| Réglage                                                   | Préférence                        | Valeurs                                                                                                                                                         | Défaut   |
| --------------------------------------------------------- | --------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| Tab switch animation                                      | `zen-fluent.tab-switch-animation` | `fluent` Fluent (entrée)<br>`fade` Fade<br>`none` None                                                                                                          | `fluent` |
| URL bar opening animation                                 | `zen-fluent.urlbar-animation`     | `fade` Fade<br>`zoom` Zoom<br>`slide` Slide<br>`stagger` Staggered results<br>`stagger-up` Staggered upward<br>`bounce` Bounce (Microsoft Store)<br>`none` None | `fade`   |
| Menu animation                                            | `zen-fluent.menu-animation`       | `flyout` Flyout (WinUI)<br>`popin` From the button<br>`fade` Fade<br>`none` None                                                                                | `flyout` |
| WinUI 3 button animations                                 | `zen-fluent.button-animations`    | `true` / `false`                                                                                                                                                | `true`   |
| Back / Forward arrow bounce                               | `zen-fluent.nav-bounce`           | `true` / `false`                                                                                                                                                | `false`  |
| Moving gradient (le dégradé de l'espace dérive lentement) | `zen-fluent.gradient-animation`   | `true` / `false`                                                                                                                                                | `false`  |
| Animated icons                                            | `zen-fluent.animated-icons`       | `true` / `false`                                                                                                                                                | `true`   |

## Notes

- **Moving gradient** : les couleurs d'un espace (choisies dans le sélecteur
  de dégradé de Zen) bougent lentement : un dégradé dérive d'un coin à
  l'autre et revient en une minute, et la teinte oscille de 10° de chaque
  côté, donc une couleur seule bouge aussi. Rien ne bouge sans couleur, ni
  avec les animations réduites.
- **URL bar opening animation** : fondu, zoom, et, repris de Firefox-WinUI,
  glissement, résultats échelonnés (vers le bas ou vers le haut) et le rebond
  du Microsoft Store. Les résultats ne s'animent qu'à l'ouverture de la
  barre, pas pendant la saisie.
- **Menu animation** : menu volant WinUI (par défaut), depuis le bouton,
  fondu ou aucune.
- **WinUI 3 button animations** : un changement de fond rapide et une
  réduction à l'appui sur les boutons de barre d'outils, les onglets et les
  résultats de la barre d'adresse. Les onglets de la Bibliothèque s'estompent
  et s'enfoncent sur leur pastille, et gardent leur propre transition, que
  ZenLibraryTweaks utilise pour les faire glisser pendant qu'on les
  réordonne.
- Les animations s'arrêtent avec `prefers-reduced-motion`.
- **Animated icons** : le mouvement des AnimatedIcon de WinUI sur les icônes
  Fluent (avec `zen-fluent.fluent-icons`), aux durées de WinUI : Précédent et
  Suivant se décalent de 2 px pendant l'appui, Actualiser fait un tour, le
  plus de Nouveau et de la ligne Nouvel onglet tourne d'un quart, les livres
  de la Bibliothèque sautent et l'engrenage des Paramètres tourne d'une dent
  sous le pointeur, une icône de dossier grossit un instant quand il s'ouvre
  ou se ferme, et le chevron de l'espace tourne sur la courbe de WinUI. Avec
  **Back / Forward arrow bounce** activé, les flèches rebondissent à la
  place.
