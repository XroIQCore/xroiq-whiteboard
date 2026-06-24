$workers = @('worker:ingestion','worker:dedupe','worker:classify','worker:memory')
foreach ($w in $workers) { Start-Process -NoNewWindow pnpm "run $w" }
