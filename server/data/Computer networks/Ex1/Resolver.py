import socket
import sys

def main(args):
    my_port = int(args[0])
    parent_ip = args[1]
    parent_port = int(args[2])
    time = int(args[3])

    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    s.bind('',my_port)

    while True:
        data, addr = s.recvfrom(1024)

        
        
if __name__ == "__main__":
    main(sys.argv[1:])


   # [[www.google.com,120.4.4.2,A, 15:15], [] ]