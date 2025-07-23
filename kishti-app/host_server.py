#!/usr/bin/env python3
"""
Kishti EMI Wallet - Production Hosting Server
A Flask-based server to host the complete application with API proxy
"""

import os
import sys
import logging
import requests
from flask import Flask, send_from_directory, jsonify, request, send_file
from flask_cors import CORS
from werkzeug.middleware.proxy_fix import ProxyFix
import subprocess
import threading
import time

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
app.wsgi_app = ProxyFix(app.wsgi_app, x_for=1, x_proto=1, x_host=1, x_prefix=1)

# Enable CORS for all domains
CORS(app, origins="*")

# Configuration
BACKEND_URL = "http://localhost:8080"
STATIC_FOLDER = "frontend/build"
FRONTEND_BUILD_EXISTS = os.path.exists(STATIC_FOLDER)

class BackendManager:
    def __init__(self):
        self.backend_process = None
        self.backend_ready = False
    
    def start_backend(self):
        """Start the Spring Boot backend in a separate thread"""
        def run_backend():
            try:
                os.chdir("backend")
                self.backend_process = subprocess.Popen(
                    ["./mvnw", "spring-boot:run"],
                    stdout=subprocess.PIPE,
                    stderr=subprocess.PIPE
                )
                
                # Wait for backend to be ready
                for _ in range(60):  # Wait up to 60 seconds
                    try:
                        response = requests.get(f"{BACKEND_URL}/api/users", timeout=5)
                        if response.status_code == 200:
                            self.backend_ready = True
                            logger.info("✅ Backend API is ready!")
                            break
                    except:
                        time.sleep(1)
                        
                if not self.backend_ready:
                    logger.error("❌ Backend failed to start within timeout")
                    
            except Exception as e:
                logger.error(f"Failed to start backend: {e}")
            finally:
                os.chdir("..")
        
        thread = threading.Thread(target=run_backend, daemon=True)
        thread.start()
        return thread

backend_manager = BackendManager()

@app.route('/health')
def health_check():
    """Health check endpoint"""
    backend_status = "healthy" if backend_manager.backend_ready else "starting"
    return jsonify({
        "status": "healthy",
        "backend": backend_status,
        "frontend": "healthy" if FRONTEND_BUILD_EXISTS else "demo-mode"
    })

@app.route('/api/<path:path>', methods=['GET', 'POST', 'PUT', 'DELETE', 'PATCH'])
def proxy_api(path):
    """Proxy API requests to Spring Boot backend"""
    try:
        url = f"{BACKEND_URL}/api/{path}"
        
        # Forward the request to backend
        resp = requests.request(
            method=request.method,
            url=url,
            headers={k: v for k, v in request.headers if k.lower() != 'host'},
            data=request.get_data(),
            params=request.args,
            timeout=30,
            allow_redirects=False
        )
        
        # Create response
        response = app.response_class(
            response=resp.content,
            status=resp.status_code,
            headers=dict(resp.headers)
        )
        
        # Add CORS headers
        response.headers['Access-Control-Allow-Origin'] = '*'
        response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
        response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
        
        return response
        
    except requests.exceptions.RequestException as e:
        logger.error(f"API proxy error: {e}")
        return jsonify({"error": "Backend service unavailable"}), 503

@app.route('/preview')
@app.route('/demo')
def serve_preview():
    """Serve the preview/demo page"""
    try:
        return send_file('preview.html')
    except Exception as e:
        logger.error(f"Error serving preview: {e}")
        return "Preview not available", 404

@app.route('/')
@app.route('/<path:path>')
def serve_frontend(path=''):
    """Serve React frontend or fallback to preview"""
    try:
        # If React build exists, serve it
        if FRONTEND_BUILD_EXISTS:
            if path and os.path.exists(os.path.join(STATIC_FOLDER, path)):
                return send_from_directory(STATIC_FOLDER, path)
            else:
                return send_from_directory(STATIC_FOLDER, 'index.html')
        else:
            # Fallback to preview page
            return send_file('preview.html')
            
    except Exception as e:
        logger.error(f"Error serving frontend: {e}")
        return send_file('preview.html')

@app.route('/status')
def status():
    """Application status endpoint"""
    return jsonify({
        "application": "Kishti EMI Wallet",
        "version": "1.0.0",
        "status": "running",
        "backend_ready": backend_manager.backend_ready,
        "frontend_mode": "react" if FRONTEND_BUILD_EXISTS else "preview",
        "endpoints": {
            "frontend": "/",
            "api": "/api/*",
            "preview": "/preview",
            "health": "/health",
            "status": "/status"
        }
    })

if __name__ == '__main__':
    print("🚀 Starting Kishti EMI Wallet Application Server...")
    print("=" * 60)
    
    # Start backend in background
    print("📡 Starting backend API server...")
    backend_manager.start_backend()
    
    # Wait a moment for backend to initialize
    time.sleep(5)
    
    # Start Flask server
    print("🌐 Starting web server...")
    print(f"📱 Frontend: http://0.0.0.0:5000/")
    print(f"🔗 API: http://0.0.0.0:5000/api/")
    print(f"👁️ Preview: http://0.0.0.0:5000/preview")
    print(f"💓 Health: http://0.0.0.0:5000/health")
    print("=" * 60)
    
    try:
        app.run(
            host='0.0.0.0',
            port=5000,
            debug=False,
            threaded=True
        )
    except KeyboardInterrupt:
        print("\n🛑 Shutting down server...")
        if backend_manager.backend_process:
            backend_manager.backend_process.terminate()
        sys.exit(0)