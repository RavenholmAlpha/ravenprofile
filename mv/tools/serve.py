import http.server, os, urllib.parse
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(ROOT)
class H(http.server.SimpleHTTPRequestHandler):
    def send_head(self):
        r = self.headers.get('Range')
        p = self.translate_path(self.path)
        if not r or not os.path.isfile(p):
            return super().send_head()
        size = os.path.getsize(p)
        a, b = r.replace('bytes=', '').split('-')
        a = int(a or 0); b = int(b) if b else size - 1
        b = min(b, size - 1)
        f = open(p, 'rb'); f.seek(a)
        self.send_response(206)
        self.send_header('Content-Type', self.guess_type(p))
        self.send_header('Accept-Ranges', 'bytes')
        self.send_header('Content-Range', 'bytes %d-%d/%d' % (a, b, size))
        self.send_header('Content-Length', str(b - a + 1))
        self.end_headers()
        import io
        data = f.read(b - a + 1); f.close()
        return io.BytesIO(data)
    def do_POST(self):
        q = urllib.parse.parse_qs(urllib.parse.urlparse(self.path).query)
        name = os.path.basename(q.get('name', ['out.json'])[0])
        n = int(self.headers.get('Content-Length', 0))
        with open(os.path.join(ROOT, 'tools', name), 'wb') as f:
            f.write(self.rfile.read(n))
        self.send_response(200); self.end_headers(); self.wfile.write(b'ok')
    def log_message(self, *a): pass
http.server.ThreadingHTTPServer(('127.0.0.1', 8765), H).serve_forever()