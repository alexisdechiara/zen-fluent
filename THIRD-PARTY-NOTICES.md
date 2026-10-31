# Third-party notices

Zen Fluent is released under the MIT licence (see [LICENSE](LICENSE)). Some
files reuse code from other MIT-licensed projects; their copyright and licence
notices are reproduced below, as the MIT licence requires.

## Firefox-WinUI

<https://github.com/Lockframe/Firefox-WinUI>

Files (durations, curves and keyframe steps taken over, rewritten for Zen):

- `core/src/features/animations/urlbar-animation.css`,
  `core/src/features/animations/menu-animation.css`,
  `core/src/features/animations/button-animations.css`,
  `core/src/features/animations/nav-bounce.css`,
  `core/src/features/animations/keyframes.css`: URL bar
  animations (slide, stagger, bounce), menu and button animations;
- `core/src/features/hide-shortcuts.css`,
  `core/src/features/context-navigation/list.css`: menu options;
- `core/src/components/window/caption-buttons.css`: caption button
  styles;
- `core/src/features/acrylic-noise.css`,
  `core/src/features/accent-selection-browser.css`,
  `core/src/components/sidebar/tab-close-button.css`,
  `core/src/features/tab-close-button.css`,
  `core/src/features/collapsed-tab-close.css`: options taken over.

```
MIT License

Copyright (c) 2024 Jhen

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## Edge-Frfox

<https://github.com/bmFtZQ/edge-frfox>, through Firefox-WinUI.

Files: `core/src/features/hide-access-keys.css` (menu access keys) and
`core/src/features/context-navigation/list.css` (Back / Forward as a list).

```
MIT License

Copyright (c) 2021 bmFtZQ

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## Fluent UI System Icons

<https://github.com/microsoft/fluentui-system-icons>, npm package
`@fluentui/svg-icons` 1.1.345 (its `package.json` says MIT; the package ships
no licence file, the repository's is below).

Files: the 142 icons of `enhanced/icons/fluent/` (20 px regular, listed in
`enhanced/icons/fluent/icons.json`) and the 30 of `enhanced/settings/icons/`
(the settings page), unchanged but for `fill="context-fill"` on the root and
a comment naming the icon and this licence.

```
MIT License

Copyright (c) 2020 Microsoft Corporation

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## Inspiration, no code taken

- [Arc 2.0](https://github.com/YashjitPal/Arc-2.0) (YashjitPal): extensions
  under the Essentials, compact mode sidebar background.
- [Zia](https://github.com/z1n-k/zia) (z1nk, MIT): tab text size,
  Zen settings exposed in the mod.
- WinUI 3, Fluent 2 and Microsoft Edge: token values, geometry and colors.
  The Segoe Fluent Icons font is called by name, never bundled.
