// Zen Fluent setup: the window, a wizard.
//
// Start:      Loading (Zen looked for off the UI thread) -> NoZen | Zen
// Install:    Zen (version + profile) -> What (Zen Fluent or Enhanced) -> Work -> Done
// Uninstall:  Zen -> Uninstall (what to remove)                        -> Work -> Done
//
// The window has a fixed width and the height of the page shown (header,
// page and footer as laid out), in logical pixels scaled to the monitor; it
// opens centered on its work area, then keeps its top edge as pages change
// (never past the work area: the page scrolls then). Each page
// is a panel of MainWindow.xaml, kept out of the tree and put in PageHost
// when shown: PageHost's EntranceThemeTransition slides it in. Picking uses
// GridView tiles (WinUI's own selection: an accent outline, keyboard
// arrows), as wide as the row allows. Coming back to the window (after
// installing Zen, or opening it once to make a profile) looks again.
using System.Diagnostics;
using System.Runtime.InteropServices;
using Microsoft.UI.Composition.SystemBackdrops;
using Microsoft.UI.Windowing;
using Microsoft.UI.Xaml;
using Microsoft.UI.Xaml.Controls;
using Microsoft.UI.Xaml.Media;
using Windows.Graphics;

namespace ZenFluentSetup;

public sealed partial class MainWindow : Window
{
    // The window's width, in logical pixels; its height fits the page shown.
    // Pages drawn in the middle (loading, no Zen) get at least this height.
    private const int WindowWidth = 860;
    private const int FirstHeight = 560;
    private const int CenteredPageHeight = 380;
    private const string ZenDownload = "https://zen-browser.app/download";
    private const string TwilightDownload = "https://zen-browser.app/download?twilight";

    private List<ZenEdition> editions = new();
    private List<ZenProfile> allProfiles = new();
    private List<ZenProfile> profiles = new();
    private readonly List<FrameworkElement> pages;
    private FrameworkElement? page;
    private Task? loading;
    private bool uninstalling;
    private bool running;
    private bool succeeded;
    private double scale = 1;
    private bool placed;
    private int fittedHeight;

    [DllImport("user32.dll")]
    private static extern uint GetDpiForWindow(IntPtr hwnd);

    public MainWindow()
    {
        InitializeComponent();

        // Windows 11: Mica behind the window, the title bar drawn in it
        SystemBackdrop = MicaController.IsSupported() ? new MicaBackdrop() : new DesktopAcrylicBackdrop();
        ExtendsContentIntoTitleBar = true;
        SetTitleBar(AppTitleBar);
        if (AppWindow.Presenter is OverlappedPresenter presenter)
        {
            presenter.IsMaximizable = false;
            presenter.IsResizable = false;
        }
        var dpi = GetDpiForWindow(WinRT.Interop.WindowNative.GetWindowHandle(this));
        scale = dpi > 0 ? dpi / 96.0 : 1;
        FitWindow();
        // No closing halfway through: the profile would be left half done
        AppWindow.Closing += (_, args) => args.Cancel = running;
        Activated += MainWindow_Activated;

        Title = S.Get("Title");
        TitleText.Text = Installer.SourceRef == "main" ? S.Get("Title") : $"{S.Get("Title")} · {Installer.SourceRef}";
        LoadingTitle.Text = S.Get("LoadingTitle");
        LoadingText.Text = S.Get("LoadingText");
        NoZenTitle.Text = S.Get("NoZenTitle");
        NoZenText.Text = S.Get("NoZenText");
        DownloadZenText.Text = S.Get("DownloadZen");
        DownloadTwilightText.Text = S.Get("DownloadTwilight");
        TwilightHint.Text = S.Get("TwilightHint");
        ElsewhereButton.Content = S.Get("ZenElsewhere");
        BrowseButton.Content = S.Get("OtherFolder");
        ProfileHeader.Text = S.Get("Profile");
        ConsentText.Text = S.Get("UnsafeJs");
        ConsentErrorText.Text = S.Get("ConsentNeeded");
        DetailsTitle.Text = S.Get("Details");
        DoneDetailsTitle.Text = S.Get("Details");
        ModeButton.Content = S.Get("UninstallMode");
        DangerButton.Content = S.Get("Uninstall");
        RemoveModsCheck.Content = S.Get("RemoveMods");
        RemoveModsCheck.IsChecked = true;
        RemoveSettingsCheck.Content = S.Get("RemoveSettings");
        RemoveSineCheck.Content = S.Get("RemoveSine");
        RemoveSineWarning.Message = S.Get("RemoveSineWarning");

        // The pages leave their store; one at a time goes into PageHost
        pages = new() { LoadingPage, NoZenPage, ZenPage, WhatPage, UninstallPage, WorkPage, DonePage };
        PageStore.Children.Clear();

        BuildComponentTiles();
        // Tiles built while their page was aside are measured once it shows
        EditionGrid.Loaded += (_, _) => SizeTiles(EditionGrid);
        ComponentGrid.Loaded += (_, _) => SizeTiles(ComponentGrid);
        // Something on screen at once, while Zen is looked for
        ShowPage(LoadingPage);
    }

    /// <summary>For --selftest: looks for Zen, then shows every page once,
    /// so a page that fails to build fails the test.</summary>
    public async Task<string> SelfTestAsync()
    {
        await (loading ??= LoadAsync(minimum: 0));
        var found = $"editions={editions.Count} profiles={allProfiles.Count} tiles={EditionGrid.Items.Count}+{ComponentGrid.Items.Count}";
        foreach (var p in pages) ShowPage(p);
        uninstalling = true;
        ShowPage(UninstallPage);
        uninstalling = false;
        ShowPage(editions.Count > 0 ? ZenPage : NoZenPage);
        return $"{found} pages={pages.Count} source={Installer.SourceRef}";
    }

    /// <summary>For --screenshots (the CI): every page, and the states that
    /// change its height, rendered to PNG files in `dir`, with the window's
    /// client size in each name. A runner has no Zen: two editions and two
    /// profiles stand in for it.</summary>
    public async Task<string> ScreenshotsAsync(string dir)
    {
        Directory.CreateDirectory(dir);
        // A render has no Mica behind it
        RootGrid.Background = Brush("SolidBackgroundFillColorBaseBrush");
        await (loading ??= LoadAsync(minimum: 0));
        var shots = new List<string>();

        async Task Shot(string name, Action show)
        {
            show();
            // The entrance transition, then the window fitting the page
            await Task.Delay(900);
            var bitmap = new Microsoft.UI.Xaml.Media.Imaging.RenderTargetBitmap();
            await bitmap.RenderAsync(RootGrid);
            var pixels = System.Runtime.InteropServices.WindowsRuntime.WindowsRuntimeBufferExtensions.ToArray(await bitmap.GetPixelsAsync());
            var size = AppWindow.ClientSize;
            var file = Path.Combine(dir, $"{shots.Count + 1:00}-{name}-{size.Width}x{size.Height}.png");
            using (var stream = new Windows.Storage.Streams.InMemoryRandomAccessStream())
            {
                var encoder = await Windows.Graphics.Imaging.BitmapEncoder.CreateAsync(Windows.Graphics.Imaging.BitmapEncoder.PngEncoderId, stream);
                encoder.SetPixelData(Windows.Graphics.Imaging.BitmapPixelFormat.Bgra8, Windows.Graphics.Imaging.BitmapAlphaMode.Premultiplied,
                    (uint)bitmap.PixelWidth, (uint)bitmap.PixelHeight, 96, 96, pixels);
                await encoder.FlushAsync();
                stream.Seek(0);
                var reader = new Windows.Storage.Streams.DataReader(stream);
                await reader.LoadAsync((uint)stream.Size);
                var bytes = new byte[stream.Size];
                reader.ReadBytes(bytes);
                await File.WriteAllBytesAsync(file, bytes);
            }
            shots.Add(Path.GetFileName(file));
        }

        await Shot("loading", () => ShowPage(LoadingPage));
        await Shot("no-zen", () => ShowPage(NoZenPage));
        var temp = Path.GetTempPath();
        editions = new()
        {
            new ZenEdition("Zen Browser", "1.24.2b", @"C:\Program Files\Zen Browser", "A"),
            new ZenEdition("Zen Twilight", "1.25t", @"C:\Program Files\Zen Twilight", "B"),
        };
        allProfiles = new()
        {
            new ZenProfile("Default (release)", Path.Combine(temp, "zf-shot-1"), true, new List<string> { "A" }),
            new ZenProfile("Test Zen Fluent", Path.Combine(temp, "zf-shot-2"), false, new List<string>()),
        };
        await Shot("zen", () =>
        {
            BuildEditionTiles(0);
            ShowPage(ZenPage);
        });
        await Shot("zen-running", () => ShowZenInfo(InfoBarSeverity.Error, S.Get("ZenRunning")));
        await Shot("what-enhanced", () =>
        {
            ShowZenInfo(InfoBarSeverity.Informational, "");
            ShowPage(WhatPage);
        });
        await Shot("what-consent", () => SetConsentError(true));
        await Shot("what-core", () =>
        {
            SetConsentError(false);
            ComponentGrid.SelectedIndex = 0;
        });
        ComponentGrid.SelectedIndex = 1;
        await Shot("work", () =>
        {
            ShowPage(WorkPage);
            var lines = Enumerable.Range(1, 14).Select(i => $"Step {i}: copying chrome\\sine-mods\\Zen-Fluent… done");
            LogText.Text = string.Join("\n", lines);
            WorkStep.Text = lines.Last();
            ScrollToEnd(LogScroller);
        });
        await Shot("done", () => ShowDone(null));
        await Shot("failed", () => ShowDone("The profile is in use: close Zen, then try again."));
        await Shot("uninstall", () =>
        {
            uninstalling = true;
            ShowPage(UninstallPage);
        });
        return string.Join(" ", shots);
    }

    // -------- Window --------

    /// <summary>The height the page shown needs: the title bar, the header,
    /// the page with its padding, and the footer, as laid out.</summary>
    private double ContentHeight()
    {
        if (PageHost.ActualHeight <= 0) return FirstHeight;
        var header = Header.Visibility == Visibility.Visible ? Header.ActualHeight : 0;
        return AppTitleBar.ActualHeight + header + PageHost.Margin.Top + PageHost.Margin.Bottom
               + PageHost.ActualHeight + Footer.ActualHeight;
    }

    /// <summary>Fixed width, the page's height, both scaled and never larger
    /// than the work area: centered the first time, then the top edge stays
    /// where it is (moved up only when the bottom would leave the screen).</summary>
    private void FitWindow()
    {
        var area = DisplayArea.GetFromWindowId(AppWindow.Id, DisplayAreaFallback.Primary).WorkArea;
        var width = Math.Min((int)Math.Round(WindowWidth * scale), area.Width);
        var height = (int)Math.Ceiling(ContentHeight() * scale);
        // The frame Windows adds around the client area
        var frame = Math.Max(0, AppWindow.Size.Height - AppWindow.ClientSize.Height);
        height = Math.Min(height, area.Height - frame);
        if (placed && height == fittedHeight && AppWindow.ClientSize.Width == width) return;
        fittedHeight = height;
        AppWindow.ResizeClient(new SizeInt32(width, height));
        var outer = AppWindow.Size;
        if (!placed)
        {
            placed = PageHost.ActualHeight > 0;
            AppWindow.Move(new PointInt32(area.X + (area.Width - outer.Width) / 2, area.Y + (area.Height - outer.Height) / 2));
            return;
        }
        var position = AppWindow.Position;
        var top = Math.Max(area.Y, Math.Min(position.Y, area.Y + area.Height - outer.Height));
        if (top != position.Y) AppWindow.Move(new PointInt32(position.X, top));
    }

    /// <summary>The header, the page or the footer changed height (a page
    /// shown, an InfoBar opened, text wrapping): the window follows.</summary>
    private void Content_SizeChanged(object sender, SizeChangedEventArgs e)
    {
        if (Math.Abs(e.NewSize.Height - e.PreviousSize.Height) >= 0.5) FitWindow();
    }

    private void RootGrid_Loaded(object sender, RoutedEventArgs e)
    {
        // The scale XAML really draws at (the monitor the window opened on)
        if (Content.XamlRoot is { } root)
        {
            scale = root.RasterizationScale;
            FitWindow();
            root.Changed += (_, _) =>
            {
                if (Math.Abs(root.RasterizationScale - scale) < 0.01) return;
                scale = root.RasterizationScale;
                FitWindow();
            };
        }
        loading ??= LoadAsync(minimum: 600);
    }

    /// <summary>Back to the window: Zen may have been installed, or opened
    /// once to make a profile.</summary>
    private void MainWindow_Activated(object sender, WindowActivatedEventArgs args)
    {
        if (args.WindowActivationState == WindowActivationState.Deactivated || running || loading is not { IsCompleted: true }) return;
        if (page == NoZenPage || (page == ZenPage && profiles.Count == 0))
        {
            loading = LoadAsync(minimum: 0, quiet: true);
        }
    }

    /// <summary>Looks for Zen and its profiles off the UI thread (the
    /// loading screen stays at least `minimum` ms, so it never flashes).</summary>
    private async Task LoadAsync(int minimum, bool quiet = false)
    {
        var timer = Stopwatch.StartNew();
        var keep = Edition?.Dir;
        var (foundEditions, foundProfiles) = await Task.Run(() => (Zen.GetEditions(), Zen.GetProfiles()));
        if (timer.ElapsedMilliseconds < minimum) await Task.Delay(minimum - (int)timer.ElapsedMilliseconds);
        // A folder picked by hand stays in the list
        foreach (var e in editions.Where(e => !foundEditions.Any(f => string.Equals(f.Dir, e.Dir, StringComparison.OrdinalIgnoreCase))))
        {
            foundEditions.Add(e);
        }
        editions = foundEditions;
        allProfiles = foundProfiles;
        if (editions.Count == 0)
        {
            if (!quiet || page != NoZenPage) ShowPage(NoZenPage);
            return;
        }
        var index = keep is null ? 0 : Math.Max(0, editions.FindIndex(x => string.Equals(x.Dir, keep, StringComparison.OrdinalIgnoreCase)));
        BuildEditionTiles(index);
        if (page != ZenPage) ShowPage(ZenPage);
    }

    // -------- Pages --------

    private ZenEdition? Edition =>
        EditionGrid.SelectedIndex >= 0 && EditionGrid.SelectedIndex < editions.Count ? editions[EditionGrid.SelectedIndex] : null;

    private ZenProfile? Profile =>
        ProfileBox.SelectedIndex >= 0 && ProfileBox.SelectedIndex < profiles.Count ? profiles[ProfileBox.SelectedIndex] : null;

    private bool Enhanced => ComponentGrid.SelectedIndex != 0;

    private void ShowPage(FrameworkElement next)
    {
        page = next;
        PageHost.Children.Clear();
        PageHost.Children.Add(next);
        // Pages drawn in the middle keep some room around them
        PageHost.MinHeight = next == LoadingPage || next == NoZenPage ? CenteredPageHeight : 0;
        LoadingRing.IsActive = next == LoadingPage;
        UpdateChrome();
    }

    /// <summary>The header and the footer of the page shown.</summary>
    private void UpdateChrome()
    {
        var step = page == ZenPage ? 1 : page == WhatPage || page == UninstallPage ? 2 : 0;
        StepRow.Visibility = step > 0 ? Visibility.Visible : Visibility.Collapsed;
        if (step > 0)
        {
            StepText.Text = string.Format(S.Get("Step"), step, 2);
            StepPips.SelectedPageIndex = step - 1;
        }

        (string title, string lead) = page switch
        {
            _ when page == ZenPage => (S.Get("ZenTitle"), S.Get("ZenLead")),
            _ when page == WhatPage => (S.Get("WhatTitle"), S.Get("WhatLead")),
            _ when page == UninstallPage => (S.Get("UninstallTitle"), S.Get("UninstallLead")),
            _ when page == WorkPage => (S.Get(uninstalling ? "WorkUninstall" : "WorkInstall"), S.Get("WorkLead")),
            _ => ("", ""),
        };
        PageTitle.Text = title;
        PageLead.Text = lead;
        PageTitle.Visibility = title.Length > 0 ? Visibility.Visible : Visibility.Collapsed;
        PageLead.Visibility = lead.Length > 0 ? Visibility.Visible : Visibility.Collapsed;
        Header.Visibility = step > 0 || title.Length > 0 ? Visibility.Visible : Visibility.Collapsed;

        // Footer: a link on the first page; Back, the main action, Close
        ModeButton.Visibility = page == ZenPage ? Visibility.Visible : Visibility.Collapsed;
        BackButton.Visibility = page == WhatPage || page == UninstallPage || page == NoZenPage ? Visibility.Visible : Visibility.Collapsed;
        BackButton.Content = S.Get(page == NoZenPage ? "CheckAgain" : "Back");
        DangerButton.Visibility = page == UninstallPage ? Visibility.Visible : Visibility.Collapsed;
        NextButton.Visibility = page == ZenPage || page == WhatPage || (page == DonePage && !(uninstalling && succeeded))
            ? Visibility.Visible
            : Visibility.Collapsed;
        NextButton.Content = page switch
        {
            _ when page == WhatPage => S.Get("Install"),
            _ when page == DonePage => S.Get(succeeded ? "OpenZen" : "TryAgain"),
            _ => S.Get("Next"),
        };
        CloseButton.Content = S.Get(page == DonePage || page == NoZenPage ? "Close" : "Cancel");
        CloseButton.IsEnabled = !running;
        CloseButton.Visibility = page == WorkPage ? Visibility.Collapsed : Visibility.Visible;
        UpdateNext();
    }

    /// <summary>The first page goes on once a Zen recent enough and one of
    /// its profiles are picked.</summary>
    private void UpdateNext()
    {
        if (page != ZenPage)
        {
            NextButton.IsEnabled = !running;
            ModeButton.IsEnabled = !running;
            return;
        }
        var ready = Edition is { TooOld: false } && Profile is not null;
        NextButton.IsEnabled = ready;
        ModeButton.IsEnabled = ready;
    }

    private void NextButton_Click(object sender, RoutedEventArgs e)
    {
        if (running) return;
        if (page == ZenPage)
        {
            if (!CheckClosed()) return;
            uninstalling = false;
            ShowPage(WhatPage);
        }
        else if (page == WhatPage)
        {
            _ = InstallAsync();
        }
        else if (page == DonePage)
        {
            if (succeeded) OpenZen(withProfile: true);
            else ShowPage(uninstalling ? UninstallPage : WhatPage);
        }
    }

    private void BackButton_Click(object sender, RoutedEventArgs e)
    {
        if (running) return;
        if (page == NoZenPage)
        {
            // Look again, with the loading screen
            ShowPage(LoadingPage);
            loading = LoadAsync(minimum: 600);
            return;
        }
        uninstalling = false;
        ShowPage(ZenPage);
    }

    private void ModeButton_Click(object sender, RoutedEventArgs e)
    {
        if (running || Edition is null || Profile is not { } profile) return;
        if (!CheckClosed()) return;
        uninstalling = true;
        UninstallTarget.Text = profile.Name;
        UninstallTargetLine.Text = $"{Edition.Label} · {string.Format(S.Get("ProfileFolder"), profile.Folder)}";
        ShowPage(UninstallPage);
    }

    private void CloseButton_Click(object sender, RoutedEventArgs e)
    {
        if (!running) Close();
    }

    /// <summary>Zen must be closed on the profile: said on the first page,
    /// before anything is chosen for nothing.</summary>
    private bool CheckClosed()
    {
        if (Profile is { } profile && Zen.ProfileInUse(profile.Path))
        {
            ShowZenInfo(InfoBarSeverity.Error, S.Get("ZenRunning"));
            return false;
        }
        return true;
    }

    /// <summary>The first page's message, with an action button or none.</summary>
    private void ShowZenInfo(InfoBarSeverity severity, string message, string? action = null, Action? onAction = null)
    {
        ZenInfo.Severity = severity;
        ZenInfo.Message = message;
        if (action is not null && onAction is not null)
        {
            var button = new Button { Content = action };
            button.Click += (_, _) => onAction();
            ZenInfo.ActionButton = button;
        }
        else
        {
            ZenInfo.ActionButton = null;
        }
        ZenInfo.IsOpen = message.Length > 0;
    }

    private static void OpenLink(string url)
    {
        try
        {
            Process.Start(new ProcessStartInfo(url) { UseShellExecute = true });
        }
        catch
        {
        }
    }

    private static bool IsTwilight(ZenEdition? edition) =>
        edition?.Name.Contains("twilight", StringComparison.OrdinalIgnoreCase) == true;

    private void DownloadZenButton_Click(object sender, RoutedEventArgs e) => OpenLink(ZenDownload);

    private void DownloadTwilightButton_Click(object sender, RoutedEventArgs e) => OpenLink(TwilightDownload);

    // -------- Tiles --------

    private static Brush Brush(string key) => (Brush)Application.Current.Resources[key];

    private static TextBlock Line(string text, string style = "CaptionTextBlockStyle", string brush = "TextFillColorSecondaryBrush") =>
        new()
        {
            Text = text,
            TextWrapping = TextWrapping.Wrap,
            Style = (Style)Application.Current.Resources[style],
            Foreground = Brush(brush),
        };

    /// <summary>A tile: an icon in a tinted square, a title (with an
    /// optional badge) and its lines. The GridViewItem around it draws the
    /// card, the hover and the accent outline of the picked tile.</summary>
    private static FrameworkElement Tile(string glyph, string title, string? badge, IEnumerable<UIElement> lines)
    {
        var panel = new StackPanel { Spacing = 4, Padding = new Thickness(18, 16, 18, 18), MinHeight = 150 };
        var icon = new Border { Style = (Style)Application.Current.Resources["TileIconBox"], Margin = new Thickness(0, 0, 0, 10) };
        icon.Child = new FontIcon { Glyph = glyph, FontSize = 22, Foreground = Brush("AccentTextFillColorPrimaryBrush") };
        panel.Children.Add(icon);

        var head = new StackPanel { Orientation = Orientation.Horizontal, Spacing = 8 };
        head.Children.Add(new TextBlock
        {
            Text = title,
            Style = (Style)Application.Current.Resources["BodyStrongTextBlockStyle"],
            FontSize = 16,
            VerticalAlignment = VerticalAlignment.Center,
        });
        if (badge is not null)
        {
            head.Children.Add(new Border
            {
                Background = Brush("AccentFillColorDefaultBrush"),
                CornerRadius = new CornerRadius(4),
                Padding = new Thickness(6, 1, 6, 2),
                VerticalAlignment = VerticalAlignment.Center,
                Child = new TextBlock
                {
                    Text = badge,
                    Style = (Style)Application.Current.Resources["CaptionTextBlockStyle"],
                    Foreground = Brush("TextOnAccentFillColorPrimaryBrush"),
                },
            });
        }
        panel.Children.Add(head);
        foreach (var line in lines) panel.Children.Add(line);
        Microsoft.UI.Xaml.Automation.AutomationProperties.SetName(panel, title);
        return panel;
    }

    /// <summary>The tiles share the row: as wide as it allows, the same
    /// height (the StackPanel row stretches them to the tallest).</summary>
    private void TileGrid_SizeChanged(object sender, SizeChangedEventArgs e)
    {
        if (sender is GridView grid) SizeTiles(grid);
    }

    private static void SizeTiles(GridView grid)
    {
        var count = grid.Items.Count;
        if (count == 0 || grid.ActualWidth <= 0) return;
        // Each item has a 12px margin on its right; the grid's -12px margin
        // gives it back on the last one
        var items = grid.Items.OfType<FrameworkElement>().ToList();
        var available = grid.ActualWidth - 12;
        var width = Math.Floor(grid.ActualWidth / Math.Max(count, 2)) - 12;
        foreach (var item in items) item.Width = width;
        // The list adds a few pixels of its own between items: measured,
        // then taken off, so the last tile ends where the cards below end
        double excess;
        try
        {
            grid.UpdateLayout();
            var last = items[^1];
            excess = last.TransformToVisual(grid).TransformPoint(new Windows.Foundation.Point(last.ActualWidth, 0)).X - available;
        }
        catch (Exception)
        {
            // Not on screen (a page kept aside): measured when shown
            return;
        }
        if (excess > 0.5)
        {
            width -= Math.Ceiling(excess / count);
            foreach (var item in items) item.Width = width;
        }
    }

    // -------- Step 1: Zen version and profile --------

    private void BuildEditionTiles(int select)
    {
        EditionGrid.Items.Clear();
        foreach (var e in editions)
        {
            var lines = new List<UIElement>();
            if (!string.IsNullOrEmpty(e.Version)) lines.Add(Line(e.Version, "BodyTextBlockStyle"));
            var path = Line(e.Dir, "CaptionTextBlockStyle", "TextFillColorTertiaryBrush");
            path.TextWrapping = TextWrapping.NoWrap;
            path.TextTrimming = TextTrimming.CharacterEllipsis;
            ToolTipService.SetToolTip(path, e.Dir);
            lines.Add(path);
            if (e.TooOld)
            {
                var warning = new StackPanel { Orientation = Orientation.Horizontal, Spacing = 6, Margin = new Thickness(0, 6, 0, 0) };
                warning.Children.Add(new FontIcon { Glyph = "", FontSize = 12, Foreground = Brush("SystemFillColorCautionBrush") });
                warning.Children.Add(Line(S.Get("UpdateNeeded"), "CaptionTextBlockStyle", "SystemFillColorCautionBrush"));
                lines.Add(warning);
            }
            // a moon for Twilight, a globe for Zen Browser
            EditionGrid.Items.Add(Tile(IsTwilight(e) ? "" : "", e.Name, null, lines));
        }
        SizeTiles(EditionGrid);
        EditionGrid.SelectedIndex = Math.Min(select, editions.Count - 1);
        FillProfiles();
    }

    private void EditionGrid_SelectionChanged(object sender, SelectionChangedEventArgs e)
    {
        // Keeps a tile picked: clicking the picked one again does not unpick it
        if (EditionGrid.SelectedIndex < 0 && editions.Count > 0 && e.RemovedItems.Count > 0)
        {
            EditionGrid.SelectedItem = e.RemovedItems[0];
            return;
        }
        FillProfiles();
    }

    /// <summary>The chosen Zen's profiles, the one it opens by default first.</summary>
    private void FillProfiles()
    {
        var keep = Profile?.Path;
        ProfileBox.Items.Clear();
        profiles = new();
        var edition = Edition;
        if (edition is not null)
        {
            profiles = Zen.ProfilesOf(edition, allProfiles);
            foreach (var profile in profiles)
            {
                var label = profile.Name;
                if (Zen.OpensByDefault(edition, profile)) label += " — " + S.Get("OpensDefault");
                ProfileBox.Items.Add(label);
            }
        }
        ProfileBox.IsEnabled = profiles.Count > 0;
        if (profiles.Count > 0)
        {
            var index = keep is null ? -1 : profiles.FindIndex(p => string.Equals(p.Path, keep, StringComparison.OrdinalIgnoreCase));
            ProfileBox.SelectedIndex = Math.Max(0, index);
        }

        if (edition is null) return;
        if (edition.TooOld)
        {
            // Too old: a way to the latest version of this edition
            ShowZenInfo(InfoBarSeverity.Warning, string.Format(S.Get("TooOld"), edition.Label),
                string.Format(S.Get("UpdateZen"), edition.Name),
                () => OpenLink(IsTwilight(edition) ? TwilightDownload : ZenDownload));
        }
        else if (profiles.Count == 0)
        {
            // No profile yet: open Zen once; coming back looks again
            ShowZenInfo(InfoBarSeverity.Warning, S.Get("NoProfile"),
                string.Format(S.Get("OpenEdition"), edition.Name),
                () => OpenZen(withProfile: false));
        }
        else
        {
            ShowZenInfo(InfoBarSeverity.Informational, "");
        }
        UpdateProfile();
    }

    private void ProfileBox_SelectionChanged(object sender, SelectionChangedEventArgs e) => UpdateProfile();

    private void UpdateProfile()
    {
        if (ProfileLine is null) return;
        var profile = Profile;
        ProfileLine.Text = profile is null ? "" : string.Format(S.Get("ProfileFolder"), profile.Folder);
        if (ZenInfo.Severity == InfoBarSeverity.Error) ShowZenInfo(InfoBarSeverity.Informational, "");
        var edition = Edition;
        SineText.Text = edition is null || profile is null
            ? ""
            : S.Get(Zen.SineInstalled(edition.Dir, profile.Path) ? "SineKeptNote" : "SineNote");
        UpdateNext();
    }

    private async void BrowseButton_Click(object sender, RoutedEventArgs e)
    {
        var picker = new Windows.Storage.Pickers.FolderPicker();
        picker.FileTypeFilter.Add("*");
        WinRT.Interop.InitializeWithWindow.Initialize(picker, WinRT.Interop.WindowNative.GetWindowHandle(this));
        var folder = await picker.PickSingleFolderAsync();
        if (folder is null) return;
        if (!File.Exists(Path.Combine(folder.Path, "zen.exe")))
        {
            var info = page == NoZenPage ? NoZenInfo : ZenInfo;
            info.Severity = InfoBarSeverity.Warning;
            info.Message = S.Get("NotZen");
            info.ActionButton = null;
            info.IsOpen = true;
            return;
        }
        NoZenInfo.IsOpen = false;
        var found = Zen.EditionFromFolder(folder.Path);
        var index = editions.FindIndex(x => string.Equals(x.Dir, found.Dir, StringComparison.OrdinalIgnoreCase));
        if (index < 0)
        {
            editions.Add(found);
            index = editions.Count - 1;
        }
        if (page != ZenPage) ShowPage(ZenPage);
        BuildEditionTiles(index);
    }

    // -------- Step 2: Zen Fluent or Zen Fluent Enhanced --------

    private void BuildComponentTiles()
    {
        ComponentGrid.Items.Add(Tile("", "Zen Fluent", null, new UIElement[]
        {
            Line(S.Get("CoreLine"), "BodyTextBlockStyle"),
            Line(S.Get("CoreTag"), "CaptionTextBlockStyle", "TextFillColorTertiaryBrush"),
        }));
        ComponentGrid.Items.Add(Tile("", "Zen Fluent Enhanced", S.Get("Recommended"), new UIElement[]
        {
            Line(S.Get("EnhancedLine"), "BodyTextBlockStyle"),
            Line(S.Get("EnhancedTag"), "CaptionTextBlockStyle", "TextFillColorTertiaryBrush"),
        }));
        ComponentGrid.SelectedIndex = 1;
    }

    private void ComponentGrid_SelectionChanged(object sender, SelectionChangedEventArgs e)
    {
        if (ComponentGrid.SelectedIndex < 0 && e.RemovedItems.Count > 0)
        {
            ComponentGrid.SelectedItem = e.RemovedItems[0];
            return;
        }
        if (ConsentCard is null) return;
        ConsentCard.Visibility = Enhanced ? Visibility.Visible : Visibility.Collapsed;
        SetConsentError(false);
    }

    private void ConsentCheck_Changed(object sender, RoutedEventArgs e)
    {
        if (ConsentCheck.IsChecked == true) SetConsentError(false);
    }

    /// <summary>Install was clicked with Enhanced picked and the box left
    /// unchecked: the card turns red, with what to do.</summary>
    private void SetConsentError(bool error)
    {
        if (ConsentError is null || ConsentCard is null) return;
        ConsentError.Visibility = error ? Visibility.Visible : Visibility.Collapsed;
        ConsentCard.BorderBrush = Brush(error ? "SystemFillColorCriticalBrush" : "CardStrokeColorDefaultBrush");
        ConsentCard.Background = Brush(error ? "SystemFillColorCriticalBackgroundBrush" : "CardBackgroundFillColorDefaultBrush");
        ConsentText.Foreground = Brush(error ? "SystemFillColorCriticalBrush" : "TextFillColorPrimaryBrush");
    }

    // -------- Uninstall --------

    private void RemoveSineCheck_Changed(object sender, RoutedEventArgs e)
    {
        if (RemoveSineWarning is not null) RemoveSineWarning.IsOpen = RemoveSineCheck.IsChecked == true;
    }

    private void DangerButton_Click(object sender, RoutedEventArgs e)
    {
        if (running || Edition is not { } zen || Profile is not { } profile) return;
        var removeSettings = RemoveSettingsCheck.IsChecked == true;
        var removeSine = RemoveSineCheck.IsChecked == true;
        _ = RunAsync(installer => installer.UninstallAsync(zen, profile, removeSettings, removeSine));
    }

    // -------- Install, progress and result --------

    private Task InstallAsync()
    {
        if (Edition is not { } zen || Profile is not { } profile) return Task.CompletedTask;
        var enhanced = Enhanced;
        var consent = ConsentCheck.IsChecked == true;
        if (enhanced && !consent)
        {
            SetConsentError(true);
            ConsentCheck.Focus(FocusState.Programmatic);
            return Task.CompletedTask;
        }
        return RunAsync(installer => installer.RunAsync(zen, profile, enhanced, enhanced && consent));
    }

    /// <summary>Shows the progress page, runs the work off the UI thread
    /// with each step written to the page, then shows the result.</summary>
    private async Task RunAsync(Func<Installer, Task> work)
    {
        running = true;
        LogText.Text = "";
        WorkStep.Text = "";
        ShowPage(WorkPage);
        var queue = DispatcherQueue;
        var installer = new Installer(message => queue.TryEnqueue(() =>
        {
            LogText.Text += (LogText.Text.Length > 0 ? "\n" : "") + message;
            WorkStep.Text = message;
            ScrollToEnd(LogScroller);
        }));
        string? failure = null;
        try
        {
            await Task.Run(() => work(installer));
        }
        catch (Exception error)
        {
            failure = error.Message;
        }
        // Lets the last log lines in before the result copies them
        await Task.Yield();
        running = false;
        ShowDone(failure);
    }

    private void ShowDone(string? failure)
    {
        succeeded = failure is null;
        DoneBadge.Background = Brush(succeeded ? "AccentFillColorDefaultBrush" : "SystemFillColorCriticalBrush");
        DoneGlyph.Glyph = succeeded ? "" : "";
        DoneTitle.Text = S.Get(succeeded
            ? (uninstalling ? "UninstalledTitle" : "DoneTitle")
            : (uninstalling ? "UninstallFailed" : "Failed"));
        DoneText.Text = failure ?? S.Get(uninstalling ? "UninstalledText" : "DoneText");
        DoneLog.Text = LogText.Text;
        DoneDetails.Visibility = DoneLog.Text.Length > 0 ? Visibility.Visible : Visibility.Collapsed;
        ShowPage(DonePage);
        ScrollToEnd(DoneScroller);
        if (succeeded) UpdateProfile();
    }

    /// <summary>The log follows its last line, once laid out.</summary>
    private void ScrollToEnd(ScrollViewer scroller)
    {
        DispatcherQueue.TryEnqueue(Microsoft.UI.Dispatching.DispatcherQueuePriority.Low,
            () => scroller.ChangeView(null, scroller.ScrollableHeight, null, disableAnimation: true));
    }

    /// <summary>Starts the chosen Zen, on the chosen profile once installed
    /// (then closes), or bare to make its first profile.</summary>
    private void OpenZen(bool withProfile)
    {
        if (Edition is not { } zen) return;
        try
        {
            var start = new ProcessStartInfo(Path.Combine(zen.Dir, "zen.exe")) { UseShellExecute = false };
            if (withProfile && Profile is { } profile)
            {
                start.ArgumentList.Add("-profile");
                start.ArgumentList.Add(profile.Path);
            }
            Process.Start(start);
            if (withProfile) Close();
        }
        catch (Exception error)
        {
            if (page == DonePage) DoneText.Text = error.Message;
            else ShowZenInfo(InfoBarSeverity.Error, error.Message);
        }
    }
}
