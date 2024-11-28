from kivy.app import App
from kivy.uix.boxlayout import BoxLayout
from pyzbar.pyzbar import decode
import cv2
import requests


class PetanqueApp(App):
    def build(self):
        layout = BoxLayout(orientation='vertical')
        # Ajoutez ici vos widgets
        return layout

    def scan_qr_code(self):
        # Logique de scan de QR code
        camera = cv2.VideoCapture(0)
        ret, frame = camera.read()

        decoded_objects = decode(frame)
        for obj in decoded_objects:
            game_url = obj.data.decode('utf-8')
            self.connect_to_game(game_url)

    def connect_to_game(self, url):
        # Connexion au jeu via l'URL
        response = requests.get(url)
        # Logique de connexion