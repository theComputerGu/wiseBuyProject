import socket
import os
import sys

# Manually define MIME types for common file extensions
MIME_TYPES = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.bmp': 'image/bmp',
    '.txt': 'text/plain',
    '.json': 'application/json',
    '.pdf': 'application/pdf',
}

class SimpleHTTPServer:
    def __init__(self, host='127.0.0.1', port=80):
        self.host = host
        self.port = port

    def start(self):
        # Create a TCP socket
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as server_socket:
            server_socket.bind(('', self.port))
            server_socket.listen()
            print(f"Server running on http://{self.host}:{self.port}")

            # Handle client connections
            while True:
                client_socket, client_address = server_socket.accept()
                with client_socket:
                    print(f"Connection established with {client_address}")
                    try:
                        client_socket.settimeout(1)  # Set a 1-second timeout
                        request_data = client_socket.recv(1024).decode('utf-8')

                        # close connection in case of an empty request
                        if not request_data.splitlines()[0].strip():
                            print("Empty message, closing connection...")
                            client_socket.close()

                        print(f"Request received:\n{request_data}")

                        # Check for the "Connection: close" header
                        connection_type = self.get_connection_type(request_data)

                        # Parse the HTTP request
                        if request_data.startswith("GET"):
                            response = self.handle_get_request(request_data, connection_type)
                        else:
                            response = self.http_response(405, connection_type, "Method Not Allowed")

                        # Send the response
                        client_socket.sendall(response)

                        # If "Connection: close" is in the request, close the connection after sending the response
                        if connection_type == "Connection: close":
                            print("Closing connection as per request.")
                            client_socket.close()

                    except socket.timeout:
                        print("Client did not send data within 1 second. Disconnecting...")
                        client_socket.close()

    def get_connection_type(self, request_data):
        # Check if "Connection: close" exists in the request headers
        if "Connection: close" in request_data:
            return "Connection: close"
        else:
            return "Connection: keep-alive"  # Default connection type if not specified

    def handle_get_request(self, request_data, connection_type):
        # Extract the requested path
        try:
            path = request_data.splitlines()[0].split()[1]
        except IndexError:
            return self.http_response(400, connection_type, "Bad Request")

        # Check if the path is just "/"
        if path == "/":
            # Define the path to the index.html file in the "files" folder
            file_path = os.path.join(os.getcwd(), "files", "index.html")
        else:
            # For other paths, map the path to the "files" folder
            file_path = os.path.join(os.getcwd(), "files", path.lstrip('/'))  # Remove leading '/' from the path

        # Check if the file exists
        if os.path.exists(file_path) and os.path.isfile(file_path):
            # Determine the file extension
            file_extension = os.path.splitext(file_path)[1].lower()

            # Check if the file extension has a corresponding MIME type
            if file_extension in MIME_TYPES:
                content_type = MIME_TYPES[file_extension]
            else:
                content_type = 'application/octet-stream'  # Default for unknown file types

            # If it's an image or binary file, open in binary mode
            if content_type.startswith('image') or content_type == 'application/octet-stream':
                with open(file_path, "rb") as file:
                    file_content = file.read()
                # Return binary file response
                return self.http_response(200, connection_type, file_content, content_type=content_type, is_binary=True)
            else:
                # Handle text-based files (like HTML, CSS, etc.)
                with open(file_path, "r", encoding="utf-8") as file:
                    file_content = file.read()
                # Return text-based file response
                return self.http_response(200, connection_type, file_content, content_type=content_type)
        else:
            # Return a 404 response if the file does not exist
            return self.http_response(404, connection_type, "", content_type="text/html")

    def http_response(self, status_code, connection_type, body, content_type="text/plain", is_binary=False):
        # Prepare HTTP response
        reason_phrases = {
            200: "OK",
            400: "Bad Request",
            404: "Not Found",
            405: "Method Not Allowed",
        }
        reason_phrase = reason_phrases.get(status_code, "Unknown Status")

        # Prepare headers
        headers = (
            f"HTTP/1.1 {status_code} {reason_phrase}\r\n"
            f"Content-Type: {content_type}\r\n"
            f"{connection_type}\r\n"
            f"Content-Length: {len(body)}\r\n"
            f"\r\n"
        )

        # If the response is binary (e.g., an image), send the raw body (binary)
        if is_binary:
            return headers.encode('utf-8') + body

        # Otherwise, for text-based responses, encode the body as UTF-8 and send
        return (headers + body).encode('utf-8')


if __name__ == "__main__":
    # Get the port from command-line arguments
    if len(sys.argv) > 1:
        try:
            port = int(sys.argv[1])
        except ValueError:
            print("Invalid port number. Using default port 80.")
            port = 80
    else:
        port = 80  # Default port

    # Start the server with the specified or default port
    server = SimpleHTTPServer(port=port)
    try:
        server.start()
    except KeyboardInterrupt:
        print("\nServer stopped.")
