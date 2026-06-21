#!/usr/bin/env bash
# Build a single PDF of all lessons (write-ups + annotated source) for offline reading.
# Requires: pandoc, and Google Chrome (used headless for HTML -> PDF).
# Usage: bun run pdf   (or: bash scripts/make-pdf.sh)
set -euo pipefail
cd "$(dirname "$0")/.."   # repo root

OUT_MD=$(mktemp /tmp/react-learnings.XXXX.md)
OUT_HTML=$(mktemp /tmp/react-learnings.XXXX.html)
OUT_PDF="react-learnings.pdf"
CSS="scripts/pdf_style.css"

# Lesson order: "LESSON.md path | semicolon-separated source files"
MANIFEST=$(cat <<'EOF'
ROUTE|/|Home (useEffect baseline)|client/src/routes/Home.tsx
ROUTE|/items|Items (loader + discriminated union)|client/src/routes/Items.tsx
LESSON|client/src/routes/query/LESSON.md|client/src/routes/query/Query.tsx;client/src/lib/queryClient.ts
LESSON|client/src/routes/new-item/LESSON.md|client/src/routes/new-item/NewItem.tsx;server/src/index.ts
LESSON|client/src/routes/dashboard/LESSON.md|client/src/routes/dashboard/Dashboard.tsx;client/src/routes/dashboard/ThemeContext.tsx;client/src/routes/dashboard/counterStore.ts
LESSON|client/src/routes/mutate/LESSON.md|client/src/routes/mutate/Mutate.tsx
LESSON|client/src/routes/patterns/LESSON.md|client/src/routes/patterns/Patterns.tsx;client/src/routes/patterns/Patterns.test.tsx
LESSON|client/src/routes/auth/LESSON.md|client/src/routes/auth/Auth.tsx;client/src/routes/auth/AuthContext.tsx;client/src/routes/auth/authFetch.ts
EOF
)

cat > "$OUT_MD" <<'HDR'
% React refresher for backend developers
% A guided tour of modern React, one concept per lesson

# About this guide

A small full-stack app (React + Vite + React Router on the front, Express on Bun
for the API) where each route teaches one modern React concept, with explicit
parallels to how it'd work in production.

Each lesson below has two parts: a short write-up (what it teaches, the
production parallel, what to try, when not to use it), followed by the annotated
source code. Comments use a fixed vocabulary:

- **CONCEPT:** the React idea the block teaches
- **PROD:** the parallel to a real production system
- **GOTCHA:** the trap people hit

\newpage

HDR

ext_lang() { case "$1" in *.tsx|*.ts) echo typescript ;; *.md) echo markdown ;; *) echo "" ;; esac; }

emit_sources() {
  local IFS=';'
  for f in $1; do
    [ -z "$f" ] && continue
    { echo; echo "### \`$f\`"; echo; echo '```'"$(ext_lang "$f")"; cat "$f"; echo '```'; } >> "$OUT_MD"
  done
}

while IFS='|' read -r kind a b c; do
  [ -z "$kind" ] && continue
  if [ "$kind" = "ROUTE" ]; then
    { echo; echo "# Lesson: $b"; echo; echo "**Route:** \`$a\`"; } >> "$OUT_MD"
    emit_sources "$c"
  else
    { echo; cat "$a"; echo; echo "## Source"; } >> "$OUT_MD"
    emit_sources "$b"
  fi
  { echo; echo '\newpage'; echo; } >> "$OUT_MD"
done <<< "$MANIFEST"

pandoc "$OUT_MD" -f markdown -t html5 --standalone \
  --toc --toc-depth=1 --syntax-highlighting=kate \
  --metadata title="React refresher for backend developers" \
  --css "$CSS" --embed-resources -o "$OUT_HTML"

# Find Chrome across platforms.
CHROME=""
for c in \
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  "$(command -v google-chrome || true)" \
  "$(command -v chromium || true)" \
  "$(command -v chromium-browser || true)"; do
  [ -n "$c" ] && [ -x "$c" ] && CHROME="$c" && break
done
if [ -z "$CHROME" ]; then echo "Chrome/Chromium not found; install it or convert $OUT_HTML manually." >&2; exit 1; fi

"$CHROME" --headless --disable-gpu --no-pdf-header-footer \
  --print-to-pdf="$OUT_PDF" "$OUT_HTML" 2>/dev/null

rm -f "$OUT_MD" "$OUT_HTML"
echo "Wrote $OUT_PDF"
