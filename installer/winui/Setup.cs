// Zen Fluent setup: finding Zen and its profiles, and installing.
//
// The same steps as installer/ZenFluentSetup.ps1 (installer/README.md):
// Sine's bootloader and engine when they are missing, then Zen Fluent and
// Zen Fluent Enhanced the way Sine installs mods, the preferences, and the
// startup cache cleared.
using System.Diagnostics;
using System.IO.Compression;
using System.Reflection;
using System.Text.Json;
using System.Text.Json.Nodes;
using Microsoft.Win32;

namespace ZenFluentSetup;

public sealed record ZenEdition(string Name, string Version, string Dir, string? Id)
{
    public string Label => string.IsNullOrEmpty(Version) ? Name : $"{Name} {Version}";

    /// <summary>Zen Fluent needs Zen 1.23 or later.</summary>
    public bool TooOld
    {
        get
        {
            var parts = Version.Split('.');
            if (parts.Length < 2 || !int.TryParse(parts[0], out var major))
            {
                return false;
            }
            var minorDigits = new string(parts[1].TakeWhile(char.IsDigit).ToArray());
            return int.TryParse(minorDigits, out var minor) && (major < 1 || (major == 1 && minor < 23));
        }
    }
}

public sealed record ZenProfile(string Name, string Path, bool IsMain, IReadOnlyList<string> OwnedBy)
{
    public string Folder => System.IO.Path.GetFileName(Path.TrimEnd('\\'));
}

public static class Zen
{
    private static readonly string Roaming = Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData);
    private static readonly string Local = Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData);

    /// <summary>
    /// The installed editions (Zen Browser, Zen Twilight): Zen's installer
    /// registers each under Software\Mozilla\&lt;name&gt; with its version and
    /// folder; Firefox's TaskBarIDs maps the folder to the install's id,
    /// which profiles.ini names in [Install&lt;id&gt;].
    /// </summary>
    public static List<ZenEdition> GetEditions()
    {
        var ids = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);
        foreach (var hive in new[] { Registry.CurrentUser, Registry.LocalMachine })
        {
            using var key = hive.OpenSubKey(@"Software\Mozilla\Firefox\TaskBarIDs");
            if (key is null) continue;
            foreach (var name in key.GetValueNames())
            {
                ids[name.TrimEnd('\\')] = key.GetValue(name)?.ToString() ?? "";
            }
        }

        var editions = new Dictionary<string, ZenEdition>(StringComparer.OrdinalIgnoreCase);
        foreach (var hive in new[] { Registry.CurrentUser, Registry.LocalMachine })
        {
            foreach (var root in new[] { @"Software\Mozilla", @"Software\WOW6432Node\Mozilla" })
            {
                using var mozilla = hive.OpenSubKey(root);
                if (mozilla is null) continue;
                foreach (var name in mozilla.GetSubKeyNames())
                {
                    // "Zen Browser", "Zen Twilight"; not "Zen Browser 1.24.1b"
                    if (!System.Text.RegularExpressions.Regex.IsMatch(name, @"^Zen( [A-Za-z]+)?$")) continue;
                    using var edition = mozilla.OpenSubKey(name);
                    var current = edition?.GetValue("CurrentVersion")?.ToString();
                    if (current is null) continue;
                    using var main = edition!.OpenSubKey($@"{current}\Main");
                    var dir = main?.GetValue("Install Directory")?.ToString()?.TrimEnd('\\');
                    if (string.IsNullOrEmpty(dir) || !File.Exists(System.IO.Path.Combine(dir, "zen.exe")) || editions.ContainsKey(dir)) continue;
                    var version = System.Text.RegularExpressions.Regex.Replace(current, @"\s*\(.*$", "");
                    editions[dir] = new ZenEdition(name, version, dir, ids.GetValueOrDefault(dir));
                }
            }
        }

        // Folders the registry does not know (a portable copy)
        var programFiles = Environment.GetFolderPath(Environment.SpecialFolder.ProgramFiles);
        foreach (var dir in new[]
        {
            System.IO.Path.Combine(programFiles, "Zen Browser"),
            System.IO.Path.Combine(programFiles, "Zen Twilight"),
            System.IO.Path.Combine(Local, "Zen Browser"),
        })
        {
            if (File.Exists(System.IO.Path.Combine(dir, "zen.exe")) && !editions.ContainsKey(dir))
            {
                editions[dir] = new ZenEdition(System.IO.Path.GetFileName(dir), "", dir, ids.GetValueOrDefault(dir));
            }
        }

        // Zen Browser before Twilight
        return editions.Values
            .OrderBy(e => e.Name.Contains("twilight", StringComparison.OrdinalIgnoreCase))
            .ThenBy(e => e.Name)
            .ToList();
    }

    public static ZenEdition EditionFromFolder(string dir) =>
        GetEditions().FirstOrDefault(e => string.Equals(e.Dir, dir.TrimEnd('\\'), StringComparison.OrdinalIgnoreCase))
        ?? new ZenEdition(System.IO.Path.GetFileName(dir.TrimEnd('\\')), "", dir.TrimEnd('\\'), null);

    public static List<ZenProfile> GetProfiles()
    {
        var root = System.IO.Path.Combine(Roaming, "zen");
        var ini = System.IO.Path.Combine(root, "profiles.ini");
        if (!File.Exists(ini)) return new();

        var sections = new List<(string Name, Dictionary<string, string> Values)>();
        foreach (var raw in File.ReadAllLines(ini))
        {
            var line = raw.Trim();
            if (line.StartsWith('[') && line.EndsWith(']'))
            {
                sections.Add((line[1..^1], new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase)));
            }
            else if (sections.Count > 0 && line.IndexOf('=') is var eq and > 0)
            {
                sections[^1].Values[line[..eq]] = line[(eq + 1)..];
            }
        }

        // [Install<id>] Default=<path>: the profile each edition opens
        var owners = new Dictionary<string, List<string>>(StringComparer.OrdinalIgnoreCase);
        foreach (var (name, values) in sections)
        {
            if (name.StartsWith("Install") && values.TryGetValue("Default", out var path))
            {
                if (!owners.TryGetValue(path, out var list)) owners[path] = list = new();
                list.Add(name["Install".Length..]);
            }
        }

        var profiles = new List<ZenProfile>();
        foreach (var (name, values) in sections)
        {
            if (!name.StartsWith("Profile") || !values.TryGetValue("Path", out var relativePath)) continue;
            var isRelative = !values.TryGetValue("IsRelative", out var rel) || rel != "0";
            var path = isRelative ? System.IO.Path.Combine(root, relativePath.Replace('/', '\\')) : relativePath;
            profiles.Add(new ZenProfile(
                values.GetValueOrDefault("Name") ?? System.IO.Path.GetFileName(path),
                path,
                values.GetValueOrDefault("Default") == "1",
                owners.GetValueOrDefault(relativePath) ?? new List<string>()));
        }
        return profiles;
    }

    /// <summary>
    /// An edition's profiles: the one it opens by default first, then those
    /// no other edition opens by default.
    /// </summary>
    public static List<ZenProfile> ProfilesOf(ZenEdition edition, List<ZenProfile> all)
    {
        var mine = all.Where(p => edition.Id is not null && p.OwnedBy.Contains(edition.Id));
        var free = all.Where(p => !(edition.Id is not null && p.OwnedBy.Contains(edition.Id))
                                  && (p.OwnedBy.Count == 0 || edition.Id is null))
                      .OrderBy(p => !p.IsMain).ThenBy(p => p.Name);
        return mine.Concat(free).ToList();
    }

    public static bool OpensByDefault(ZenEdition edition, ZenProfile profile) =>
        edition.Id is not null && profile.OwnedBy.Contains(edition.Id);

    /// <summary>Zen holds parent.lock open, unshared, while it uses a profile.</summary>
    public static bool ProfileInUse(string profileDir)
    {
        var lockFile = System.IO.Path.Combine(profileDir, "parent.lock");
        if (!File.Exists(lockFile)) return false;
        try
        {
            using var stream = new FileStream(lockFile, FileMode.Open, FileAccess.Read, FileShare.None);
            return false;
        }
        catch (IOException)
        {
            return true;
        }
    }

    public static bool SineInstalled(string zenDir, string profileDir) =>
        File.Exists(System.IO.Path.Combine(zenDir, "config.js")) &&
        File.Exists(System.IO.Path.Combine(profileDir, "chrome", "JS", "sine.sys.mjs"));
}

public sealed class Installer
{
    private const string Repo = "alexisdechiara/zen-fluent";
    // The Sine release Zen Fluent is tested with (components.json)
    private const string SineRepo = "CosmoCreeper/Sine";
    private const string SineTag = "v2.3.4.1c";
    private const string BootloaderRepo = "sineorg/bootloader";

    private static readonly HttpClient Http = CreateClient();

    /// <summary>The branch or tag whose mods are installed (set at build time).</summary>
    public static string SourceRef =>
        Assembly.GetExecutingAssembly().GetCustomAttributes<AssemblyMetadataAttribute>()
            .FirstOrDefault(a => a.Key == "SourceRef")?.Value ?? "main";

    private readonly Action<string> log;

    public Installer(Action<string> log) => this.log = log;

    private static HttpClient CreateClient()
    {
        var client = new HttpClient { Timeout = TimeSpan.FromSeconds(90) };
        client.DefaultRequestHeaders.UserAgent.ParseAdd("ZenFluentSetup");
        return client;
    }

    public async Task RunAsync(ZenEdition edition, ZenProfile profile, bool enhanced, bool allowUnsafeJs, bool reinstallSine = false)
    {
        if (Zen.ProfileInUse(profile.Path)) throw new InvalidOperationException(S.Get("ZenRunning"));
        if (enhanced && !allowUnsafeJs) throw new InvalidOperationException(S.Get("NeedConsent"));

        var temp = System.IO.Path.Combine(System.IO.Path.GetTempPath(), "zen-fluent-setup-" + Guid.NewGuid().ToString("N"));
        Directory.CreateDirectory(temp);
        try
        {
            if (reinstallSine || !Zen.SineInstalled(edition.Dir, profile.Path))
            {
                await InstallBootloaderAsync(edition.Dir, profile.Path, temp);
                await InstallEngineAsync(profile.Path, temp);
            }
            else
            {
                log(S.Get("SineKept"));
            }
            await InstallModsAsync(profile.Path, enhanced, temp);
            var prefs = new Dictionary<string, string> { ["svg.context-properties.content.enabled"] = "true" };
            if (allowUnsafeJs) prefs["sine.allow-unsafe-js"] = "true";
            SetPrefs(profile.Path, prefs);
            ClearStartupCache(profile.Path);
            log(S.Get("Done"));
        }
        finally
        {
            try { Directory.Delete(temp, recursive: true); } catch { }
        }
    }

    // GitHub sometimes answers 5xx or times out: five tries over about a
    // minute; a 4xx fails at once
    private async Task DownloadAsync(string url, string file)
    {
        var waits = new[] { 3, 8, 15, 30 };
        for (var attempt = 0; ; attempt++)
        {
            try
            {
                using var response = await Http.GetAsync(url, HttpCompletionOption.ResponseHeadersRead);
                var status = (int)response.StatusCode;
                if (status >= 400 && status < 500) response.EnsureSuccessStatusCode();
                if (status >= 500) throw new HttpRequestException($"{status}");
                await using var output = File.Create(file);
                await response.Content.CopyToAsync(output);
                return;
            }
            catch (Exception error) when (error is HttpRequestException or TaskCanceledException)
            {
                if (error is HttpRequestException { StatusCode: { } code } && (int)code is >= 400 and < 500) throw;
                if (attempt >= waits.Length) throw new InvalidOperationException(string.Format(S.Get("GitHubDown"), new Uri(url).Host));
                log(string.Format(S.Get("Retry"), waits[attempt]));
                await Task.Delay(TimeSpan.FromSeconds(waits[attempt]));
            }
        }
    }

    private static bool Writable(string dir)
    {
        try
        {
            var probe = System.IO.Path.Combine(dir, ".zf-write-test-" + Guid.NewGuid().ToString("N"));
            File.WriteAllText(probe, "");
            File.Delete(probe);
            return true;
        }
        catch
        {
            return false;
        }
    }

    private async Task InstallBootloaderAsync(string zenDir, string profileDir, string temp)
    {
        log(string.Format(S.Get("Downloading"), "Sine bootloader"));
        var program = System.IO.Path.Combine(temp, "program.zip");
        var profileZip = System.IO.Path.Combine(temp, "profile.zip");
        // releases/latest/download: no GitHub API (rate limits, timeouts)
        await DownloadAsync($"https://github.com/{BootloaderRepo}/releases/latest/download/program.zip", program);
        await DownloadAsync($"https://github.com/{BootloaderRepo}/releases/latest/download/profile.zip", profileZip);
        log(string.Format(S.Get("Bootloader"), zenDir));
        if (Writable(zenDir))
        {
            ZipFile.ExtractToDirectory(program, zenDir, overwriteFiles: true);
        }
        else
        {
            log(S.Get("Elevate"));
            var start = new ProcessStartInfo(Environment.ProcessPath!, $"--bootloader \"{program}\" \"{zenDir}\"")
            {
                UseShellExecute = true,
                Verb = "runas",
            };
            Process? process;
            try
            {
                process = Process.Start(start);
            }
            catch (System.ComponentModel.Win32Exception)
            {
                throw new InvalidOperationException(S.Get("ElevateRefused"));
            }
            if (process is null) throw new InvalidOperationException(S.Get("ElevateRefused"));
            await process.WaitForExitAsync();
            if (process.ExitCode != 0 || !File.Exists(System.IO.Path.Combine(zenDir, "config.js")))
            {
                throw new InvalidOperationException(string.Format(S.Get("BootloaderFailed"), zenDir));
            }
        }
        ZipFile.ExtractToDirectory(profileZip, System.IO.Path.Combine(profileDir, "chrome"), overwriteFiles: true);
    }

    private async Task InstallEngineAsync(string profileDir, string temp)
    {
        log(string.Format(S.Get("Downloading"), $"Sine {SineTag}"));
        var engine = System.IO.Path.Combine(temp, "engine.zip");
        await DownloadAsync($"https://github.com/{SineRepo}/releases/download/{SineTag}/engine.zip", engine);
        log(S.Get("Engine"));
        ZipFile.ExtractToDirectory(engine, System.IO.Path.Combine(profileDir, "chrome"), overwriteFiles: true);
    }

    private async Task InstallModsAsync(string profileDir, bool enhanced, string temp)
    {
        var sourceRef = SourceRef;
        log(string.Format(S.Get("Downloading"), $"Zen Fluent ({sourceRef})"));
        var zip = System.IO.Path.Combine(temp, "zen-fluent.zip");
        await DownloadAsync($"https://codeload.github.com/{Repo}/zip/{sourceRef}", zip);
        var extract = System.IO.Path.Combine(temp, "zen-fluent");
        ZipFile.ExtractToDirectory(zip, extract, overwriteFiles: true);
        var source = Directory.GetDirectories(extract).First();
        var modsDir = System.IO.Path.Combine(profileDir, "chrome", "sine-mods");
        Directory.CreateDirectory(modsDir);

        var listFile = System.IO.Path.Combine(modsDir, "mods.json");
        var list = new JsonObject();
        if (File.Exists(listFile))
        {
            var backup = listFile + ".zen-fluent-setup.bak";
            File.Copy(listFile, backup, overwrite: true);
            log(string.Format(S.Get("Backup"), backup));
            var text = File.ReadAllText(listFile);
            if (!string.IsNullOrWhiteSpace(text) && JsonNode.Parse(text) is JsonObject parsed) list = parsed;
        }

        var mods = new List<(string Id, string Name, string From, string Homepage, string Chrome, string Content, string Preferences)>
        {
            ("Zen-Fluent", "Zen Fluent", source, $"https://github.com/{Repo}", "core/chrome.css", "core/userContent.css", "core/preferences.json"),
        };
        if (enhanced)
        {
            mods.Add(("Zen-Fluent-Enhanced", "Zen Fluent Enhanced", System.IO.Path.Combine(source, "enhanced"),
                $"https://github.com/{Repo}/tree/main/enhanced", "chrome.css", "", "preferences.json"));
        }

        foreach (var mod in mods)
        {
            log(string.Format(S.Get("Mod"), mod.Name));
            var target = System.IO.Path.Combine(modsDir, mod.Id);
            if (Directory.Exists(target))
            {
                // A junction (a development checkout) is unlinked, never emptied
                var isLink = new DirectoryInfo(target).Attributes.HasFlag(FileAttributes.ReparsePoint);
                Directory.Delete(target, recursive: !isLink);
            }
            CopyDirectory(mod.From, target);

            // As Sine's syncModData writes it
            var entry = JsonNode.Parse(File.ReadAllText(System.IO.Path.Combine(target, "theme.json"))) as JsonObject ?? new JsonObject();
            entry["homepage"] = mod.Homepage;
            entry.Remove("origin");
            entry["style"] = new JsonObject { ["chrome"] = mod.Chrome, ["content"] = mod.Content };
            entry["preferences"] = mod.Preferences;
            entry["no-updates"] = false;
            entry["enabled"] = true;
            list[mod.Id] = entry;
        }
        File.WriteAllText(listFile, list.ToJsonString(new JsonSerializerOptions { WriteIndented = true }));
    }

    private static void CopyDirectory(string from, string to)
    {
        Directory.CreateDirectory(to);
        foreach (var file in Directory.GetFiles(from))
        {
            File.Copy(file, System.IO.Path.Combine(to, System.IO.Path.GetFileName(file)), overwrite: true);
        }
        foreach (var dir in Directory.GetDirectories(from))
        {
            CopyDirectory(dir, System.IO.Path.Combine(to, System.IO.Path.GetFileName(dir)));
        }
    }

    /// <summary>prefs.js, not user.js: the user can change them afterwards.</summary>
    private void SetPrefs(string profileDir, Dictionary<string, string> values)
    {
        log(S.Get("PrefsSet"));
        var file = System.IO.Path.Combine(profileDir, "prefs.js");
        var lines = File.Exists(file) ? File.ReadAllLines(file).ToList() : new List<string>();
        foreach (var (name, value) in values)
        {
            var line = $"user_pref(\"{name}\", {value});";
            var index = lines.FindIndex(l => l.StartsWith($"user_pref(\"{name}\","));
            if (index >= 0) lines[index] = line; else lines.Add(line);
        }
        File.WriteAllText(file, string.Join("\n", lines) + "\n");
    }

    private void ClearStartupCache(string profileDir)
    {
        log(S.Get("Cache"));
        var folder = System.IO.Path.GetFileName(profileDir.TrimEnd('\\'));
        var local = Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData);
        foreach (var dir in new[]
        {
            System.IO.Path.Combine(local, "zen", "Profiles", folder, "startupCache"),
            System.IO.Path.Combine(profileDir, "startupCache"),
        })
        {
            if (Directory.Exists(dir)) Directory.Delete(dir, recursive: true);
        }
    }
}
