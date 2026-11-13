// Zen Fluent setup: the application.
//
// Command line, for itself and for tests:
//   --bootloader <zip> <folder>  unpack Sine's bootloader into Zen's
//                                protected folder (the copy started with
//                                administrator rights), then quit
//   --remove-bootloader <folder> remove Sine's bootloader from Zen's
//                                protected folder (when it is Sine's)
//   --selftest <file>            build the window without showing it, write
//                                "ok" or the error to <file>, then quit
//   --screenshots <folder>       show the window, render each page to a PNG
//                                in <folder> (with result.txt), then quit;
//                                for the CI, which uploads them
// Any failure is written to %TEMP%\ZenFluentSetup-error.log and shown in a
// message box: a WinUI app without a console would otherwise just vanish.
using System.IO.Compression;
using System.Runtime.InteropServices;
using Microsoft.UI.Xaml;

namespace ZenFluentSetup;

public partial class App : Application
{
    private static readonly string ErrorLog = Path.Combine(Path.GetTempPath(), "ZenFluentSetup-error.log");
    private static readonly string[] Args = Environment.GetCommandLineArgs();
    private static string? SelfTestFile =>
        Array.IndexOf(Args, "--selftest") is var i and >= 0 && i + 1 < Args.Length ? Args[i + 1] : null;
    private static string? ScreenshotsDir =>
        Array.IndexOf(Args, "--screenshots") is var i and >= 0 && i + 1 < Args.Length ? Args[i + 1] : null;

    private Window? window;

    [DllImport("user32.dll", CharSet = CharSet.Unicode)]
    private static extern int MessageBoxW(IntPtr owner, string text, string caption, uint type);

    public App()
    {
        AppDomain.CurrentDomain.UnhandledException += (_, e) => Fatal(e.ExceptionObject as Exception);
        UnhandledException += (_, e) => Fatal(e.Exception);

        var index = Array.IndexOf(Args, "--bootloader");
        if (index >= 0 && index + 2 < Args.Length)
        {
            try
            {
                ZipFile.ExtractToDirectory(Args[index + 1], Args[index + 2], overwriteFiles: true);
                Environment.Exit(0);
            }
            catch (Exception error)
            {
                Fatal(error, show: false);
                Environment.Exit(1);
            }
        }

        index = Array.IndexOf(Args, "--remove-bootloader");
        if (index >= 0 && index + 1 < Args.Length)
        {
            try
            {
                Installer.RemoveBootloaderFiles(Args[index + 1]);
                Environment.Exit(0);
            }
            catch (Exception error)
            {
                Fatal(error, show: false);
                Environment.Exit(1);
            }
        }

        try
        {
            InitializeComponent();
        }
        catch (Exception error)
        {
            Fatal(error);
            throw;
        }
    }

    protected override async void OnLaunched(LaunchActivatedEventArgs args)
    {
        try
        {
            window = new MainWindow();
            if (SelfTestFile is { } file)
            {
                File.WriteAllText(file, "ok " + await ((MainWindow)window).SelfTestAsync());
                Environment.Exit(0);
            }
            window.Activate();
            if (ScreenshotsDir is { } dir)
            {
                var result = await ((MainWindow)window).ScreenshotsAsync(dir);
                File.WriteAllText(Path.Combine(dir, "result.txt"), "ok " + result);
                Environment.Exit(0);
            }
        }
        catch (Exception error)
        {
            Fatal(error);
            if (SelfTestFile is not null || ScreenshotsDir is not null) Environment.Exit(2);
        }
    }

    /// <summary>Writes the error down and, unless testing, shows it.</summary>
    internal static void Fatal(Exception? error, bool show = true)
    {
        var text = error?.ToString() ?? "Unknown error";
        try
        {
            File.WriteAllText(SelfTestFile ?? (ScreenshotsDir is { } dir ? Path.Combine(dir, "result.txt") : ErrorLog), "error " + text);
        }
        catch
        {
        }
        if (show && SelfTestFile is null && ScreenshotsDir is null)
        {
            MessageBoxW(IntPtr.Zero,
                $"{S.Get("Failed")}.\n\n{error?.Message}\n\n{ErrorLog}",
                S.Get("Title"), 0x10 /* MB_ICONERROR */);
        }
    }
}
