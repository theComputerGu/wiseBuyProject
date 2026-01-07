import socket
import os

class SimpleHTTPClient:
    def __init__(self, host='127.0.0.1', port=12345):
        self.host = host
        self.port = port

    def start(self):
        while True:
            # Get the path from the user
            print("Enter the request (or 'exit' to quit) and Type of connection: ")
            lines = []
            while True:
                line = input()
                if line == "":
                    break
                lines.append(line)
            if lines[0].lower() == "exit":
                print("Exiting client.")
                break
            # Ensure the path starts with a "/"
            path = lines[0]
            if not path.split(' ')[1].startswith("/"):
                path = path.split(' ')[0] + " " + f"/{path.split(' ')[1]}"
            if len(lines) > 1 and "Connection" in lines[1]:
                connection_type = lines[1]
            else:
                connection_type = "Connection: close"
            # Send the request and handle the response
            self.send_request(path, connection_type)

    def send_request(self, path, connection_type):
        try:
            # Create a socket
            with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as client_socket:
                client_socket.connect((self.host, self.port))

                # Prepare the HTTP GET request
                request = f"{path} HTTP/1.1\r\nHost: {self.host}:{self.port}\r\n{connection_type}\r\n"
                print(request)
                client_socket.sendall(request.encode('utf-8'))

                # Receive the response
                response = b""
                while True:
                    chunk = client_socket.recv(4096)
                    if not chunk:
                        break
                    response += chunk

                # Process and save the response
                self.process_response(response, path)

        except Exception as e:
            print(f"An error occurred: {e}")

    def process_response(self, response, path):
        try:
            # Split headers and body
            header, _, body = response.partition(b"\r\n\r\n")

            # Parse the status code from the header
            headers = header.decode('utf-8').splitlines()
            status_line = headers[0]
            status_code = int(status_line.split()[1])

            if status_code == 200:
                # Extract the file name from the path
                file_name = os.path.basename(path)
                if not file_name:  # Default to index.html for root paths
                    file_name = "index.html"

                # Write the body content to the file
                with open(file_name, "wb") as file:
                    file.write(body)

                print(f"File saved as {file_name}. You can now access it.")
            elif status_code == 404:
                print("Error 404: The requested resource was not found.")
            else:
                print(f"Error {status_code}: Unable to process the request.")
        except Exception as e:
            print(f"Failed to process the response: {e}")


if __name__ == "__main__":
    client = SimpleHTTPClient()
    client.start()
