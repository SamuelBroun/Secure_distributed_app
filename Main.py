 ‏import hashlib
‏import os
‏import json
‏from cryptography.fernet import Fernet

‏class SecureNode:
‏    def __init__(self):
‏        self.data = {}
‏        self.key = Fernet.generate_key()
‏        self.cipher = Fernet(self.key)
        
‏    def encrypt_data(self, data):
‏        encrypted = self.cipher.encrypt(data.encode())
‏        return encrypted
    
‏    def decrypt_data(self, encrypted_data):
‏        decrypted = self.cipher.decrypt(encrypted_data).decode()
‏        return decrypted
    
‏    def add_data(self, key, value):
‏        encrypted_value = self.encrypt_data(value)
‏        hashed_key = hashlib.sha256(key.encode()).hexdigest()
‏        self.data[hashed_key] = encrypted_value
    
‏    def get_data(self, key):
‏        hashed_key = hashlib.sha256(key.encode()).hexdigest()
‏        if hashed_key in self.data:
‏            return self.decrypt_data(self.data[hashed_key])
‏        else:
‏            return "Key not found"
    
‏    def display_data(self):
‏        # For demonstration purposes, displaying the encrypted data
‏        print(json.dumps(self.data, indent=4))

‏def main():
‏    node = SecureNode()
‏    print("Welcome to the Secure Distributed Node")
‏    while True:
‏        choice = input("Choose an action (add/retrieve/display/exit): ").strip().lower()
‏        if choice == "add":
‏            key = input("Enter a key: ")
‏            value = input("Enter a value to store securely: ")
‏            node.add_data(key, value)
‏        elif choice == "retrieve":
‏            key = input("Enter the key to retrieve data: ")
‏            print("Retrieved Value:", node.get_data(key))
‏        elif choice == "display":
‏            node.display_data()
‏        elif choice == "exit":
‏            print("Exiting.")
‏            break
‏        else:
‏            print("Invalid choice, try again.")

‏if __name__ == "__main__":
‏    main()
