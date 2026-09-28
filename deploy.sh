#!/usr/bin/env bash
# Deploy this static site as a systemd service on port 8083 (auto-restart on failure/boot).
# Usage: sudo ./deploy.sh
set -euo pipefail

NAME=ravenprofile
PORT=8083
DEST=/opt/$NAME
SRC="$(cd "$(dirname "$0")" && pwd)"
UNIT=/etc/systemd/system/$NAME.service

[ "$(id -u)" -eq 0 ] || { echo "请用 sudo 运行"; exit 1; }
PY=$(command -v python3) || { echo "需要 python3"; exit 1; }

echo "==> 复制站点到 $DEST"
mkdir -p "$DEST"
if command -v rsync >/dev/null; then
  rsync -a --delete --exclude '.git' --exclude '.claude' --exclude '*.test.cjs' --exclude '*.sh' "$SRC/" "$DEST/"
else
  rm -rf "${DEST:?}"/*
  tar -C "$SRC" --exclude .git --exclude .claude --exclude '*.test.cjs' --exclude '*.sh' -cf - . | tar -C "$DEST" -xf -
fi

id -u $NAME >/dev/null 2>&1 || useradd --system --no-create-home --shell /usr/sbin/nologin $NAME
chown -R $NAME:$NAME "$DEST"

echo "==> 写入 $UNIT"
cat > "$UNIT" <<EOF
[Unit]
Description=$NAME static site
After=network.target

[Service]
User=$NAME
WorkingDirectory=$DEST
ExecStart=$PY -m http.server $PORT --bind 0.0.0.0 --directory $DEST
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable --now $NAME
systemctl restart $NAME
sleep 1
systemctl --no-pager status $NAME | head -n 5
echo "==> 已部署: http://<服务器IP>:$PORT"
