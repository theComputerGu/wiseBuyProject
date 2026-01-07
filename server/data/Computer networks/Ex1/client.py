import socket
import sys


def main(args):
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    ip = args[0]
    port = int(args[1])

    while True:
        domain = input()

        # Option to exit loop
        if domain.lower() == 'exit':
            break

        s.sendto(domain.encode(), (ip, port))

        data, addr = s.recvfrom(1024)
        print(data.decode())

    # Close the socket after exiting loop
    s.close()


if __name__ == "__main__":
    main(sys.argv[1:])
