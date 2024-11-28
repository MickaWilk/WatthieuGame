from flask import Flask, jsonify, render_template
import qrcode
import pygame
import io
import base64
import random
import math

app = Flask(__name__, template_folder='../templates')


class PetanqueGame:
    def __init__(self):
        pygame.init()
        self.screen_width = 800
        self.screen_height = 600
        self.screen = pygame.Surface((self.screen_width, self.screen_height))

        # Couleurs
        self.GREEN = (34, 139, 34)  # Vert forêt pour le terrain
        self.WHITE = (255, 255, 255)
        self.RED = (255, 0, 0)

        # Éléments du jeu
        self.cochonnet_pos = [self.screen_width // 2, self.screen_height // 2]
        self.boules = []

    def render_game_frame(self):
        # Remplir le fond
        self.screen.fill(self.GREEN)

        # Dessin du cochonnet
        pygame.draw.circle(self.screen, self.RED, self.cochonnet_pos, 10)

        # Dessin des boules
        for boule in self.boules:
            pygame.draw.circle(self.screen, self.WHITE, (int(boule[0]), int(boule[1])), 5)

        # Convertir la surface Pygame en image base64
        pygame_image = pygame.image.tostring(self.screen, 'RGB')
        img = base64.b64encode(pygame_image).decode('utf-8')
        return img

    def lancer_boule(self):
        # Lancer une boule avec une force et un angle aléatoire
        force = random.uniform(50, 200)
        angle = random.uniform(0, 2 * math.pi)
        x = self.cochonnet_pos[0] + force * math.cos(angle)
        y = self.cochonnet_pos[1] + force * math.sin(angle)
        self.boules.append((x, y))
        return self.render_game_frame()


# Instance globale du jeu
game = PetanqueGame()


def generate_game_qr():
    game_url = "http://localhost:5000/game"
    qr = qrcode.QRCode(version=1, box_size=10, border=5)
    qr.add_data(game_url)
    qr.make(fit=True)

    img = qr.make_image(fill_color="black", back_color="white")
    img.save("game_qr.png")
    return game_url


@app.route('/')
def index():
    return render_template('game.html')


@app.route('/create_game')
def create_game():
    game_url = generate_game_qr()
    print(f"QR Code généré pour l'URL : {game_url}")
    return jsonify({"url": game_url})


@app.route('/game', methods=['GET', 'POST'])
def game_route():
    # Lancer une boule et obtenir l'image du frame
    frame = game.lancer_boule()
    return jsonify({"frame": frame})


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)