#!/usr/bin/env python3
"""
Kishti EMI Wallet - Simple Hosting Server
A lightweight server using only Python standard library
"""

import http.server
import socketserver
import urllib.request
import urllib.parse
import json
import os
import sys
from urllib.error import URLError

class KishtiRequestHandler(http.server.SimpleHTTPRequestHandler):
    
    def __init__(self, *args, **kwargs):
        # Set the directory to serve files from
        super().__init__(*args, directory='/workspace/kishti-app', **kwargs)
    
    def do_GET(self):
        """Handle GET requests"""
        if self.path.startswith('/api/'):
            self.proxy_to_backend()
        elif self.path == '/' or self.path == '/index.html':
            self.serve_preview()
        elif self.path == '/health':
            self.serve_health()
        elif self.path == '/status':
            self.serve_status()
        elif self.path == '/preview' or self.path == '/demo':
            self.serve_preview()
        else:
            # Try to serve static file or default to preview
            if os.path.exists(f'/workspace/kishti-app{self.path}'):
                super().do_GET()
            else:
                self.serve_preview()
    
    def do_POST(self):
        """Handle POST requests"""
        if self.path.startswith('/api/'):
            self.proxy_to_backend()
        else:
            self.send_error(404)
    
    def do_OPTIONS(self):
        """Handle CORS preflight requests"""
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        self.end_headers()
    
    def proxy_to_backend(self):
        """Proxy API requests to the Spring Boot backend"""
        try:
            # Build the backend URL
            backend_url = f"http://localhost:8080{self.path}"
            
            # Get request data for POST requests
            content_length = int(self.headers.get('Content-Length', 0))
            post_data = self.rfile.read(content_length) if content_length > 0 else None
            
            # Create the request
            req = urllib.request.Request(backend_url, data=post_data)
            
            # Copy headers
            for header, value in self.headers.items():
                if header.lower() not in ['host', 'content-length']:
                    req.add_header(header, value)
            
            # Make the request
            with urllib.request.urlopen(req, timeout=30) as response:
                # Send response
                self.send_response(response.getcode())
                
                # Copy headers
                for header, value in response.headers.items():
                    self.send_header(header, value)
                
                # Add CORS headers
                self.send_header('Access-Control-Allow-Origin', '*')
                self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
                self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
                
                self.end_headers()
                
                # Copy response body
                self.wfile.write(response.read())
                
        except URLError as e:
            self.send_error(503, f"Backend service unavailable: {e}")
        except Exception as e:
            self.send_error(500, f"Proxy error: {e}")
    
    def serve_preview(self):
        """Serve the preview HTML page"""
        try:
            with open('/workspace/kishti-app/preview.html', 'r', encoding='utf-8') as f:
                content = f.read()
            
            self.send_response(200)
            self.send_header('Content-Type', 'text/html; charset=utf-8')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(content.encode('utf-8'))
            
        except Exception as e:
            self.send_error(404, f"Preview not available: {e}")
    
    def serve_health(self):
        """Serve health check"""
        try:
            # Check backend health
            req = urllib.request.Request("http://localhost:8080/api/users")
            with urllib.request.urlopen(req, timeout=5) as response:
                backend_status = "healthy" if response.getcode() == 200 else "unhealthy"
        except:
            backend_status = "unavailable"
        
        health_data = {
            "status": "healthy",
            "backend": backend_status,
            "frontend": "preview-mode"
        }
        
        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(json.dumps(health_data).encode('utf-8'))
    
    def serve_status(self):
        """Serve application status"""
        status_data = {
            "application": "Kishti EMI Wallet",
            "version": "1.0.0",
            "status": "running",
            "hosting": "simple-python-server",
            "endpoints": {
                "frontend": "/",
                "api": "/api/*",
                "preview": "/preview",
                "health": "/health",
                "status": "/status"
            }
        }
        
        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(json.dumps(status_data, indent=2).encode('utf-8'))

class KishtiServer(socketserver.TCPServer):
    allow_reuse_address = True

def main():
    port = 5000
    
    print("🚀 Starting Kishti EMI Wallet Hosting Server...")
    print("=" * 60)
    print(f"📱 Application: http://0.0.0.0:{port}/")
    print(f"🔗 API Proxy: http://0.0.0.0:{port}/api/")
    print(f"👁️ Preview: http://0.0.0.0:{port}/preview")
    print(f"💓 Health: http://0.0.0.0:{port}/health")
    print(f"📊 Status: http://0.0.0.0:{port}/status")
    print("=" * 60)
    print("✨ Backend API should be running on port 8080")
    print("🌐 Server ready for external access!")
    print("=" * 60)
    
    try:
        with KishtiServer(("0.0.0.0", port), KishtiRequestHandler) as httpd:
            print(f"🎯 Server running on all interfaces, port {port}")
            print("Press Ctrl+C to stop the server")
            httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n🛑 Shutting down server...")
        sys.exit(0)
    except Exception as e:
        print(f"❌ Server error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()