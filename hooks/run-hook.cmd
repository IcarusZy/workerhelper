: << 'CMDBLOCK'
@echo off
REM Cross-platform polyglot wrapper for hook scripts.
REM On Windows: cmd.exe runs the batch portion, which finds and calls bash,
REM or falls back to a PowerShell equivalent (<script>.ps1) when no bash
REM suitable for Windows paths is available.
REM On Unix: the shell interprets this as a script (: is a no-op in bash).
REM
REM Hook scripts use extensionless filenames (e.g. "session-start" not
REM "session-start.sh") so Claude Code's Windows auto-detection -- which
REM prepends "bash" to any command containing .sh -- doesn't interfere.
REM
REM Note: the branches below use sequential statements + goto instead of
REM parenthesized blocks, because %ERRORLEVEL% expands at block-parse time
REM and would mask the child process's real exit code.
REM
REM Usage: run-hook.cmd <script-name> [args...]

if "%~1"=="" (
    echo run-hook.cmd: missing script name >&2
    exit /b 1
)

set "HOOK_DIR=%~dp0"

REM Try Git for Windows bash in standard locations
if not exist "C:\Program Files\Git\bin\bash.exe" goto try_x86
"C:\Program Files\Git\bin\bash.exe" "%HOOK_DIR%%~1" %2 %3 %4 %5 %6 %7 %8 %9
exit /b %ERRORLEVEL%

:try_x86
if not exist "C:\Program Files (x86)\Git\bin\bash.exe" goto try_path
"C:\Program Files (x86)\Git\bin\bash.exe" "%HOOK_DIR%%~1" %2 %3 %4 %5 %6 %7 %8 %9
exit /b %ERRORLEVEL%

:try_path
REM Try bash on PATH (e.g. user-installed Git Bash, MSYS2, Cygwin).
REM Skip WSL launchers (System32\bash.exe and the WindowsApps shim) - they
REM cannot run Windows-form hook paths and would fail silently. Use the
REM first remaining hit.
set "BASH_CMD="
for /f "delims=" %%B in ('where bash 2^>nul') do (
    if not defined BASH_CMD (
        if /i not "%%~dpB"=="C:\Windows\System32\" if /i not "%%~dpB"=="%LOCALAPPDATA%\Microsoft\WindowsApps\" set "BASH_CMD=%%~fB"
    )
)
if not defined BASH_CMD goto try_ps1
"%BASH_CMD%" "%HOOK_DIR%%~1" %2 %3 %4 %5 %6 %7 %8 %9
exit /b %ERRORLEVEL%

:try_ps1
REM No bash found - fall back to a PowerShell equivalent (<script>.ps1) if present
if not exist "%HOOK_DIR%%~1.ps1" goto no_hook
powershell.exe -NoProfile -NonInteractive -ExecutionPolicy Bypass -File "%HOOK_DIR%%~1.ps1" %2 %3 %4 %5 %6 %7 %8 %9
exit /b %ERRORLEVEL%

:no_hook
REM No bash and no .ps1 equivalent - exit silently rather than error
REM (plugin still works, just without SessionStart context injection)
exit /b 0
CMDBLOCK

# Unix: run the named script directly
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
SCRIPT_NAME="$1"
shift
exec bash "${SCRIPT_DIR}/${SCRIPT_NAME}" "$@"
