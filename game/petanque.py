import pygame
import math


class PetanqueGame:
    def __init__(self):
        pygame.init()
        self.screen = pygame.display.set_mode((800, 600))

    def calculate_distance(self, point1, point2):
        return math.sqrt((point1[0] - point2[0]) ** 2 +
                         (point1[1] - point2[1]) ** 2)

    def draw_terrain(self):
        # Dessin du terrain de pétanque
        pass

    def launch_boule(self, force, angle):
        # Physique simplifiée de lancer
        pass