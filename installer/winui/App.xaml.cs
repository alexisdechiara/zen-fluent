// Zen Fluent setup: the application.
//
// Command line, for itself and for tests:
//   --bootloader <zip> <folder>  unpack Sine's bootloader into Zen's
//                                protected folder (the copy started with
//                                administrator rights), then quit
//   --selftest <file>            build the window without showing it, write
//                                "ok" or the error to <file>, then quit
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

    protected override void OnLaunched(LaunchActivatedEventArgs args)
    {
        try
        {
            window = new MainWindow();
            if (SelfTestFile is { } file)
            {
                File.WriteAllText(file, "ok " + ((MainWindow)window).SelfTestSummary);
                Environment.Exit(0);
            }
            window.Activate();
        }
        catch (Exception error)
        {
            Fatal(error);
            if (SelfTestFile is not null) Environment.Exit(2);
        }
    }

    /// <summary>Writes the error down and, unless testing, shows it.</summary>
    internal static void Fatal(Exception? error, bool show = true)
    {
        var text = error?.ToString() ?? "Unknown error";
        try
        {
            File.WriteAllText(SelfTestFile ?? ErrorLog, "error " + text);
        }
        catch
        {
        }
        if (show && SelfTestFile is null)
        {
            MessageBoxW(IntPtr.Zero,
                $"{S.Get("Failed")}.\n\n{error?.Message}\n\n{ErrorLog}",
                S.Get("Title"), 0x10 /* MB_ICONERROR */);
        }
    }
}
