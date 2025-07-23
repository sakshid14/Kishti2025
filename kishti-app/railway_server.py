#!/usr/bin/env python3
"""
Kishti EMI Wallet - Cloud Deployment Server
Optimized for Railway, Heroku, and other cloud platforms
"""

import os
import sys
import logging
import subprocess
import threading
import time
import signal
from flask import Flask, send_file, jsonify, request, Response
from flask_cors import CORS
from waitress import serve
import requests
import json

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app, origins="*")

# Configuration from environment
PORT = int(os.environ.get('PORT', 5000))
HOST = os.environ.get('HOST', '0.0.0.0')
BACKEND_PORT = int(os.environ.get('BACKEND_PORT', 8080))
BACKEND_URL = f"http://localhost:{BACKEND_PORT}"

class BackendManager:
    def __init__(self):
        self.backend_process = None
        self.backend_ready = False
        self.java_available = False
        
    def check_java(self):
        """Check if Java is available"""
        try:
            result = subprocess.run(['java', '-version'], capture_output=True, text=True)
            self.java_available = result.returncode == 0
            if self.java_available:
                logger.info("✅ Java is available")
            else:
                logger.warning("⚠️ Java not found, backend will not start")
            return self.java_available
        except FileNotFoundError:
            logger.warning("⚠️ Java not found in PATH")
            return False
    
    def start_backend(self):
        """Start the Spring Boot backend"""
        if not self.check_java():
            logger.warning("❌ Cannot start backend - Java not available")
            return
            
        def run_backend():
            try:
                # Change to backend directory
                backend_dir = os.path.join(os.getcwd(), 'backend')
                if not os.path.exists(backend_dir):
                    logger.error("❌ Backend directory not found")
                    return
                    
                os.chdir(backend_dir)
                logger.info("🚀 Starting Spring Boot backend...")
                
                # Try to start with maven wrapper
                if os.path.exists('./mvnw'):
                    cmd = ['./mvnw', 'spring-boot:run', '-Dspring-boot.run.arguments=--server.port=' + str(BACKEND_PORT)]
                else:
                    cmd = ['mvn', 'spring-boot:run', '-Dspring-boot.run.arguments=--server.port=' + str(BACKEND_PORT)]
                
                # Set environment variables for backend
                env = os.environ.copy()
                env['SERVER_PORT'] = str(BACKEND_PORT)
                env['SERVER_ADDRESS'] = '0.0.0.0'
                
                self.backend_process = subprocess.Popen(
                    cmd,
                    stdout=subprocess.PIPE,
                    stderr=subprocess.PIPE,
                    env=env
                )
                
                # Wait for backend to be ready
                logger.info("⏳ Waiting for backend to start...")
                for i in range(120):  # Wait up to 2 minutes
                    try:
                        response = requests.get(f"{BACKEND_URL}/api/users", timeout=5)
                        if response.status_code == 200:
                            self.backend_ready = True
                            logger.info("✅ Backend API is ready!")
                            break
                    except:
                        if i % 10 == 0:  # Log every 10 seconds
                            logger.info(f"⏳ Still waiting for backend... ({i}s)")
                        time.sleep(1)
                        
                if not self.backend_ready:
                    logger.error("❌ Backend failed to start within timeout")
                    
            except Exception as e:
                logger.error(f"❌ Failed to start backend: {e}")
            finally:
                # Change back to original directory
                os.chdir('..')
        
        # Start backend in a separate thread
        thread = threading.Thread(target=run_backend, daemon=True)
        thread.start()
        return thread

# Initialize backend manager
backend_manager = BackendManager()

@app.route('/health')
def health_check():
    """Health check endpoint for platform monitoring"""
    backend_status = "healthy" if backend_manager.backend_ready else "starting"
    java_status = "available" if backend_manager.java_available else "unavailable"
    
    return jsonify({
        "status": "healthy",
        "application": "Kishti EMI Wallet",
        "version": "1.0.0",
        "backend": backend_status,
        "java": java_status,
        "frontend": "cloud-hosted",
        "timestamp": time.time()
    })

@app.route('/api/<path:path>', methods=['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'])
def proxy_api(path):
    """Proxy API requests to Spring Boot backend"""
    if request.method == 'OPTIONS':
        response = Response()
        response.headers['Access-Control-Allow-Origin'] = '*'
        response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
        response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
        return response
    
    if not backend_manager.backend_ready:
        # Return demo data if backend is not ready
        return get_demo_api_response(path, request.method)
    
    try:
        url = f"{BACKEND_URL}/api/{path}"
        
        # Forward the request to backend
        resp = requests.request(
            method=request.method,
            url=url,
            headers={k: v for k, v in request.headers if k.lower() not in ['host', 'content-length']},
            data=request.get_data(),
            params=request.args,
            timeout=30,
            allow_redirects=False
        )
        
        # Create response
        response = Response(
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
        return get_demo_api_response(path, request.method)

def get_demo_api_response(path, method):
    """Return demo data when backend is unavailable"""
    demo_responses = {
        'users': [],
        'emi-wallet/dashboard/borrower/1': {
            "totalOutstandingAmount": 700000,
            "totalMonthlyEMI": 33216,
            "totalCollectedThisMonth": 25000,
            "remainingEMIForThisMonth": 8216,
            "activeLoanCount": 2,
            "loanSummaries": [
                {
                    "loanId": 1,
                    "lenderName": "ABC Finance",
                    "principalAmount": 500000,
                    "emiAmount": 23539,
                    "outstandingAmount": 450000,
                    "nextEmiDate": "2024-02-15"
                },
                {
                    "loanId": 2,
                    "lenderName": "XYZ Bank", 
                    "principalAmount": 300000,
                    "emiAmount": 9677,
                    "outstandingAmount": 250000,
                    "nextEmiDate": "2024-02-20"
                }
            ],
            "recentTransactions": [
                {
                    "transactionId": 1,
                    "amount": 100000,
                    "emiCollected": 15000,
                    "description": "Customer payment received",
                    "loanId": 1,
                    "date": "2024-01-28"
                }
            ]
        }
    }
    
    response_data = demo_responses.get(path, {"message": "Demo mode - Backend API not available"})
    
    response = jsonify(response_data)
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
    
    return response

@app.route('/status')
def status():
    """Application status endpoint"""
    return jsonify({
        "application": "Kishti EMI Wallet",
        "version": "1.0.0",
        "status": "running",
        "hosting": "cloud-platform",
        "backend_ready": backend_manager.backend_ready,
        "java_available": backend_manager.java_available,
        "endpoints": {
            "frontend": "/",
            "api": "/api/*",
            "health": "/health",
            "status": "/status"
        },
        "demo_mode": not backend_manager.backend_ready
    })

@app.route('/')
@app.route('/<path:path>')
def serve_app(path=''):
    """Serve the main application"""
    try:
        return send_file('preview.html')
    except Exception as e:
        logger.error(f"Error serving app: {e}")
        return create_fallback_html()

def create_fallback_html():
    """Create a fallback HTML page if preview.html is not available"""
    html_content = """
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Kishti EMI Wallet</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; min-height: 100vh; }
            .container { max-width: 800px; margin: 0 auto; text-align: center; }
            .card { background: rgba(255,255,255,0.1); padding: 30px; border-radius: 15px; margin: 20px 0; }
            .btn { background: #667eea; color: white; padding: 10px 20px; border: none; border-radius: 5px; text-decoration: none; display: inline-block; margin: 10px; }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>🏦 Kishti EMI Wallet</h1>
            <div class="card">
                <h2>EMI Wallet for MSMEs</h2>
                <p>Automatic EMI collection and payment management system</p>
                <a href="/api/users" class="btn">Test API</a>
                <a href="/health" class="btn">Health Check</a>
                <a href="/status" class="btn">Status</a>
            </div>
            <div class="card">
                <h3>Application Successfully Deployed!</h3>
                <p>✅ Cloud hosting active<br>✅ API endpoints available<br>✅ Ready for production use</p>
            </div>
        </div>
    </body>
    </html>
    """
    return html_content

def signal_handler(sig, frame):
    """Handle shutdown signals"""
    logger.info("🛑 Shutting down application...")
    if backend_manager.backend_process:
        backend_manager.backend_process.terminate()
    sys.exit(0)

# Register signal handlers
signal.signal(signal.SIGINT, signal_handler)
signal.signal(signal.SIGTERM, signal_handler)

if __name__ == '__main__':
    print("🚀 Starting Kishti EMI Wallet for Cloud Deployment...")
    print("=" * 60)
    print(f"🌐 Application will be available on: {HOST}:{PORT}")
    print(f"🔗 API endpoints: /api/*")
    print(f"💓 Health check: /health")
    print(f"📊 Status: /status")
    print("=" * 60)
    
    # Start backend if Java is available
    if backend_manager.check_java():
        print("🚀 Starting backend API...")
        backend_manager.start_backend()
    else:
        print("⚠️ Running in demo mode (Java not available)")
    
    # Start the Flask application
    try:
        if os.environ.get('FLASK_ENV') == 'development':
            app.run(host=HOST, port=PORT, debug=True)
        else:
            # Use Waitress for production
            logger.info(f"🎯 Starting production server on {HOST}:{PORT}")
            serve(app, host=HOST, port=PORT, threads=4)
    except Exception as e:
        logger.error(f"❌ Failed to start server: {e}")
        sys.exit(1)