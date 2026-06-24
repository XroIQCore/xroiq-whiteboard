$workers = @(
  'worker:ingestion',
  'worker:dedupe',
  'worker:classify',
  'worker:memory'
)

foreach ($w in $workers) {
  Start-Process -FilePath "pnpm.cmd" `
               -ArgumentList @("run", $w) `
               -WorkingDirectory $PSScriptRoot\.. `
               -WindowStyle Hidden
}

Write-Host "Launched $($workers.Count) worker processes."
