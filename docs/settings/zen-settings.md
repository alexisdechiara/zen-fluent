# Zen settings

Zen and Firefox preferences, same defaults.

Group header: `zen-fluent.ui.open-zen` (open by default: `false`).

| Setting                                                     | Preference                                                                  | Values                                                                                  | Default            |
| ----------------------------------------------------------- | --------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- | ------------------ |
| Floating URL bar                                            | `zen.urlbar.behavior`                                                       | `floating-on-type` When typing<br>`float` Always<br>`normal` Never                      | `floating-on-type` |
| New tab in the floating URL bar                             | `zen.urlbar.replace-newtab`                                                 | `true` / `false`                                                                        | `true`             |
| Copy link button (single toolbar)                           | `zen.urlbar.single-toolbar-show-copy-url`                                   | `true` / `false`                                                                        | `true`             |
| Domain only in the URL bar (single toolbar)                 | `zen.urlbar.show-domain-only-in-sidebar`                                    | `true` / `false`                                                                        | `true`             |
| Tracking protection icon                                    | `zen.urlbar.show-protections-icon`                                          | `true` / `false`                                                                        | `false`            |
| Picture-in-Picture button in the URL bar                    | `zen.urlbar.show-pip-button`                                                | `true` / `false`                                                                        | `false`            |
| Tab preview on hover                                        | `browser.tabs.hoverPreview.enabled`                                         | `true` / `false`                                                                        | `false`            |
| Page thumbnail in the preview                               | `browser.tabs.hoverPreview.showThumbnails`                                  | `true` / `false`                                                                        | `true`             |
| Page loading indicator                                      | `zen.view.enable-loading-indicator`                                         | `true` / `false`                                                                        | `true`             |
| Grey out inactive windows                                   | `zen.view.grey-out-inactive-windows`                                        | `true` / `false`                                                                        | `true`             |
| Drop a tab on the page to split the view                    | `zen.splitView.enable-tab-drop`                                             | `true` / `false`                                                                        | `true`             |
| Glance                                                      | `zen.glance.enabled`                                                        | `true` / `false`                                                                        | `true`             |
| Open a link in Glance with                                  | `zen.glance.activation-method`                                              | `alt` Alt+click<br>`ctrl` Ctrl+click<br>`shift` Shift+click<br>`meta` Windows key+click | `alt`              |
| Picture-in-Picture when leaving a video's tab               | `media.videocontrols.picture-in-picture.enable-when-switching-tabs.enabled` | `true` / `false`                                                                        | `false`            |
| Full Picture-in-Picture controls (seek, skip, progress bar) | `media.videocontrols.picture-in-picture.improved-video-controls.enabled`    | `true` / `false`                                                                        | `true`             |

## Notes

This group exposes Zen and Firefox preferences with Zen's defaults. Sine only
writes a `defaultValue` when the preference does not exist yet, so values you
already have are kept.

- **Glance** and **Open a link in Glance with**: Zen's Glance (a link opened
  in a floating preview) and its click (Alt by default). Zen Fluent
  Enhanced's **Glance link preview** shows the link while that key is held.
- **Page thumbnail in the preview** is hidden without **Tab preview on hover**;
  without the preview, the WinUI tooltip shows instead.
- While a video is in Picture-in-Picture, Zen hides the media card in the
  sidebar; it comes back when Picture-in-Picture closes.
