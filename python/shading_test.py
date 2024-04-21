import cv2
import numpy as np
from PIL import Image


def load_image(path):
    image = cv2.imread(path)
    return cv2.cvtColor(image, cv2.COLOR_BGR2RGB)


# def normalize_normal_map(normal_map):
#     return (normal_map / 127.5) - 1.0
#
# def apply_shading(base_image, normal_map, light_vector):
#
#     normals = normalize_normal_map(normal_map)
#     light_vector /= np.linalg.norm(light_vector)
#     intensity = np.dot(normals, light_vector).clip(0, 1) * 2.4
#     shaded_image = base_image * intensity[:, :, np.newaxis]
#     return np.clip(shaded_image, 0, 255).astype(np.uint8)
#
#
# if __name__ == '__main__':
#
#     base_image = load_image("origin.png")
#     normal_map = load_image("normal_map_resize.png")
#
#     diffuse_light = np.array([10, 10, -10],dtype='float64')
#
#     shaded_image = apply_shading(base_image, normal_map, diffuse_light)
#
#     cv2.imshow('Shaded Image', cv2.cvtColor(shaded_image, cv2.COLOR_RGB2BGR))
#     cv2.waitKey(0)
#     cv2.destroyAllWindows()


def normalize_normal_map(normal_map):
    return (normal_map / 127.5) - 1.0


def apply_shading(base_image, normal_map, light_sources, ambient_light, norm_preprocess = True):
    if norm_preprocess == True:
        normal_map = normal_map.numpy().transpose(1, 2, 0)
        # process the normal to be the same size as input (resize to max dimension size then center crop)
        base_x, base_y = base_image.size
        y, x, _ = normal_map.shape
        normal_map = cv2.resize(normal_map, dsize=(max(base_y, base_x), max(base_y, base_x)), interpolation=cv2.INTER_CUBIC)
        y, x, _ = normal_map.shape
        startx = x//2-(base_x//2)
        starty = y//2-(base_y//2)
        normal_map = normal_map[starty:starty+base_y, startx:startx+base_x, :]
        # norm_pil = Image.fromarray(np.uint8(normal_map * 255))
        # norm_pil.show()

    # normals = normalize_normal_map(normal_map) # this line is likely deprecated as the model output an already normalized norm map.
    normals = normal_map.copy()
    final_shading = np.zeros_like(base_image, dtype='float64')[:, :, :3] # make sure final_shading does not include alpha channel

    for light in light_sources:
        light_vector, light_color = light['position'], light['color']
        light_vector /= np.linalg.norm(light_vector)
        intensity = np.dot(normals, light_vector).clip(0, 1)
        base_image_array = np.array(base_image)[:, :, :3] # make sure base_image_array does not include alpha channel
        shading = base_image_array * intensity[:, :, np.newaxis] * light_color
        final_shading += shading

    final_shading += ambient_light * base_image_array

    return np.clip(normal_map * 255, 0, 255).astype(np.uint8), np.clip(final_shading, 0, 255).astype(np.uint8)


if __name__ == '__main__':
    base_image = load_image("01_minimum_rgb.png")
    normal_map = load_image("02_basicLines_normal.png")
    print(base_image.shape)
    print(normal_map.shape)
    light_sources = [
        # {'position': np.array([0, 30, 5], dtype='float64'), 'color': np.array([1, 0, 0])},  # r
        # {'position': np.array([-30, -30, 5], dtype='float64'), 'color': np.array([0, 1, 0])},  # g
        # {'position': np.array([30, -30, 5], dtype='float64'), 'color': np.array([0, 0, 1])},  # b
        # {'position': np.array([-30,0,5], dtype='float64'), 'color': np.array([1, 0, 0])},  # r
        # {'position': np.array([30,0,5], dtype='float64'), 'color': np.array([0, 1, 0])},  # g
        {'position': np.array([30,0,5], dtype='float64'), 'color': np.array([1, 1, 1])},  # r
        {'position': np.array([-30,0,5], dtype='float64'), 'color': np.array([1, 1, 1])},  # g
        # {'position': np.array([0, 0, 5], dtype='float64'), 'color': np.array([1, 1, 1])},  # b
        # {'position': np.array([-30, -30, 2], dtype='float64'), 'color': np.array([1, 1, 0])},
    ]

    ambient_light = np.array([0.5, 0.5, 0.5])

    shaded_image = apply_shading(base_image, normal_map, light_sources, ambient_light)

    cv2.imshow('Shaded Image', cv2.cvtColor(shaded_image, cv2.COLOR_RGB2BGR))
    cv2.waitKey(0)
    cv2.destroyAllWindows()
