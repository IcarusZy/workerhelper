$ErrorActionPreference = "Stop"

# PowerShell fallback of the session-start hook, invoked by run-hook.cmd on
# Windows machines where Git Bash is not installed. Output format must match
# the bash version: Claude Code expects hookSpecificOutput.additionalContext.

$pluginRoot = Split-Path -Parent $PSScriptRoot
$skillPath = Join-Path $pluginRoot "skills\using-workerhelper\SKILL.md"
$skillContent = Get-Content -Raw -LiteralPath $skillPath -Encoding UTF8
$sessionContext = @"
<WORKERHELPER_IMPORTANT>
You have workerhelper.

**Below is the full content of your 'workerhelper:using-workerhelper' skill - your introduction to using skills. For all other skills, use the 'Skill' tool:**

$skillContent
</WORKERHELPER_IMPORTANT>
"@

@{
    hookSpecificOutput = @{
        hookEventName    = "SessionStart"
        additionalContext = $sessionContext
    }
} | ConvertTo-Json -Compress -Depth 4 | Write-Output
