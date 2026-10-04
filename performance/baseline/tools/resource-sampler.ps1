# Temporary resource sampler (read-only). Records working set / private memory /
# CPU% for one process every 2s. Usage: powershell -File resource-sampler.ps1 <pid> <seconds> <outfile>
param(
  [int]$TargetPid,
  [int]$Seconds = 240,
  [string]$OutFile = "performance-reports/_resource-samples.csv"
)
$cores = [Environment]::ProcessorCount
"timestamp,workingSetMB,privateMB,cpuPercent,totalCpuSeconds" | Out-File -FilePath $OutFile -Encoding utf8
$prev = $null
$end = (Get-Date).AddSeconds($Seconds)
while ((Get-Date) -lt $end) {
  try {
    $p = Get-Process -Id $TargetPid -ErrorAction Stop
    $cpu = $p.TotalProcessorTime.TotalSeconds
    if ($prev -ne $null) {
      $cpuPct = [math]::Round((($cpu - $prev) / 2.0 / $cores) * 100, 2)
    } else { $cpuPct = 0 }
    $prev = $cpu
    $line = "{0},{1},{2},{3},{4}" -f (Get-Date -Format o), [math]::Round($p.WorkingSet64/1MB,1), [math]::Round($p.PrivateMemorySize64/1MB,1), $cpuPct, [math]::Round($cpu,1)
    $line | Out-File -FilePath $OutFile -Append -Encoding utf8
  } catch { Start-Sleep -Seconds 2; continue }
  Start-Sleep -Seconds 2
}
