import cv2
import numpy as np


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


def apply_shading(base_image, normal_map, light_sources, ambient_light):
    normals = normalize_normal_map(normal_map)
    final_shading = np.zeros_like(base_image, dtype='float64')

    for light in light_sources:
        light_vector, light_color = light['position'], light['color']
        light_vector /= np.linalg.norm(light_vector)
        intensity = np.dot(normals, light_vector).clip(0, 1)
        shading = base_image * intensity[:, :, np.newaxis] * light_color
        final_shading += shading

    final_shading += ambient_light * base_image

    return np.clip(final_shading, 0, 255).astype(np.uint8)


if __name__ == '__main__':
    base_image = load_image("test_1.png")
    normal_map = load_image("test_1_normal_map.png")

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
