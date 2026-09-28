#!/usr/bin/env bash
# Stop the service and disable autostart. Pass --uninstall to also remove the unit and files.
# Usage: sudo ./stop.sh [--uninstall]
set -euo pipefail

NAME=ravenprofile
[ "$(id -u)" -eq 0 ] || { echo "请用 sudo 运行"; exit 1; }

systemctl disable --now $NAME 2>/dev/null || true
echo "==> 已停止并取消开机自启: $NAME"

if [ "${1:-}" = "--uninstall" ]; then
  rm -f /etc/systemd/system/$NAME.service
  systemctl daemon-reload
  rm -rf "/opt/$NAME"
  userdel $NAME 2>/dev/null || true
  echo "==> 已卸载服务与 /opt/$NAME"
fi
