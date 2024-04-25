import numpy as np
from flask import Flask, request, jsonify
from PIL import Image, ImageDraw
from io import BytesIO
import base64
from flask_cors import CORS
from omnidata_main.omnidata_tools.torch.demo_func import get_normal_map
from shading_test import apply_shading
from torchvision import transforms

to_pil = transforms.ToPILImage()

app = Flask(__name__)
CORS(app, origins=["http://localhost:3000"], methods=["GET", "POST"], headers=["Content-Type"])
UPLOAD_FOLDER = 'uploads'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

input = Image.new("RGB", (256, 256), (255, 255, 255))
norm_map = []


@app.route('/upload', methods=['POST'])
def upload_file():
    global input, norm_map
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    if file:
        file.save(file.filename)
        # filename = secure_filename(file.filename)
        # filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        # file.save(filepath)
        # Process the file as needed
        input = Image.open(file)
        # img_io = BytesIO()
        # img.save(img_io, format="PNG")
        # img_data = base64.b64encode(img_io.getvalue()).decode('utf-8')
        # return jsonify({'normal_map': f'{img_data}'}), 200
        raw_norm_map = get_normal_map('normal', input)  # unprocessed square shape normal
        # norm_map
        img_io = BytesIO()
        light_sources = [
            {'position': np.array([0, 0, 5], dtype='float64'), 'color': np.array([1, 1, 1])},
        ]
        ambient_light = np.array([0.5, 0.5, 0.5])
        shaded_image_io = BytesIO()
        norm_map, shaded_image = apply_shading(input, raw_norm_map, light_sources, ambient_light)
        shaded_pil = Image.fromarray(np.uint8(shaded_image))
        shaded_pil.save(shaded_image_io, format="PNG")
        norm_pil = Image.fromarray(np.uint8(norm_map))
        norm_pil.save(img_io, format="PNG")
        # image_data.save(img_io, format="PNG")
        img_io.seek(0)
        shaded_image_io.seek(0)
        img_data = base64.b64encode(img_io.getvalue()).decode('utf-8')
        shaded_image_data = base64.b64encode(shaded_image_io.getvalue()).decode('utf-8')
        # print(shaded_image_data)
        # print(img_data)
        return jsonify({'normal_map': f'{img_data}', "shading_image": f'{shaded_image_data}'}), 200
        # return jsonify({'normal_map': f'{img_data}'}), 200
        #
        # return jsonify({'message': 'File successfully uploaded', 'filename': filename}), 200


@app.route('/update_normal_map', methods=['POST'])
def update_normal_map():
    global norm_map
    data = request.get_json()
    norm_dict = {
        "UP": [127, 217, 217],
        "DOWN": [127, 37, 217],
        "LEFT": [37, 127, 217],
        "RIGHT": [217, 127, 217],
        "TOP-LEFT": [63, 191, 217],
        "TOP-RIGHT": [191, 191, 217],
        "BOTTOM-LEFT": [63, 63, 217],
        "BOTTOM-RIGHT": [191, 63, 217]
    }
    # Now you can access your points array from the data
    if data:
        # print(data)
        direction = data.get('direction')
        canvas_size = data.get('canvasSize')
        canvas_width = canvas_size['width']
        canvas_height = canvas_size['height']
        points = data.get('pointerList') if data else None
        point_tuples = [(point['x'], point['y']) for point in points]
        norm_direction = norm_dict[direction]  # TODO: grab input from the front end
        input_np = np.array(input)
        # print(canvas_width, canvas_height)
        # print(point_tuples)
        # print(direction)
        # print(input_np.shape)
        # print(norm_map)
        height, width, _ = input_np.shape
        aspect_ratio = width / height
        scaling_ratio = height / canvas_height
        mask_img = Image.new('L', (canvas_width, canvas_height), 0)
        ImageDraw.Draw(mask_img).polygon(point_tuples, outline=1, fill=1)
        new_height = int(canvas_height * scaling_ratio)
        new_width = int(canvas_width * scaling_ratio)
        mask_img = mask_img.resize((new_width, new_height))
        mask = np.array(mask_img)
        mask = mask[:, (new_width - width) // 2:(new_width + width) // 2]

        # combine the new normal with the existing normal
        new_normal = np.zeros_like(norm_map)
        new_normal[:, :, 0] = norm_direction[0]
        new_normal[:, :, 1] = norm_direction[1]
        new_normal[:, :, 2] = norm_direction[2]
        norm_map[mask == 1] = new_normal[mask == 1]

        # mask_pil = Image.fromarray(np.uint8(mask * 255))
        # mask_pil.show()

        light_sources = [
            # {'position': np.array([0, 30, 5], dtype='float64'), 'color': np.array([1, 0, 0])},  # r
            # {'position': np.array([-30, -30, 5], dtype='float64'), 'color': np.array([0, 1, 0])},  # g
            # {'position': np.array([30, -30, 5], dtype='float64'), 'color': np.array([0, 0, 1])},  # b
            # {'position': np.array([-30,0,5], dtype='float64'), 'color': np.array([1, 0, 0])},  # r
            # {'position': np.array([30,0,5], dtype='float64'), 'color': np.array([0, 1, 0])},  # g
            {'position': np.array([30, 0, 5], dtype='float64'), 'color': np.array([1, 1, 1])},  # r
            {'position': np.array([-30, 0, 5], dtype='float64'), 'color': np.array([1, 1, 1])},  # g
            # {'position': np.array([0, 0, 5], dtype='float64'), 'color': np.array([1, 1, 1])},  # b
            # {'position': np.array([-30, -30, 2], dtype='float64'), 'color': np.array([1, 1, 0])},
        ]
        ambient_light = np.array([0.5, 0.5, 0.5])

        norm_map, shaded_image = apply_shading(input, norm_map / 255, light_sources, ambient_light, False)

        norm_map_pil = Image.fromarray(np.uint8(norm_map))
        shaded_pil = Image.fromarray(np.uint8(shaded_image))

        norm_img_io = BytesIO()
        shaded_img_io = BytesIO()

        norm_map_pil.save(norm_img_io, format="PNG")
        shaded_pil.save(shaded_img_io, format="PNG")

        norm_img_io.seek(0)
        shaded_img_io.seek(0)

        norm_img_data = base64.b64encode(norm_img_io.getvalue()).decode('utf-8')
        shaded_img_data = base64.b64encode(shaded_img_io.getvalue()).decode('utf-8')

        return jsonify({'normal_map': f'{norm_img_data}', "shading_image": f'{shaded_img_data}'}), 200


@app.route('/update_light', methods=['POST'])
def update_light():
    global norm_map
    light_sources = []
    data = request.get_json()
    light_list = data.get('lightSources')
    for light in light_list:
        position = light.get('position')
        print(light)
        x = position.get('x')
        y = position.get('y')
        print("input x, y:", x, y)
        width = light.get('canvasWidth')
        height = light.get('canvasHeight')
        print("canvas w, h:", width, height)
        color = light.get('color')
        r = color.get('r')
        g = color.get('g')
        b = color.get('b')
        [img_w, img_h] = input.size
        ratio_w = img_w / width
        ratio_h = img_h / height
        x = (x * ratio_w - (img_h / 2))
        y = (y * ratio_h - (img_w / 2))
        light_sources.append({'position': np.array([x, -y, 10], dtype='float64'), 'color': np.array([r/255, g/255, b/255])})
        print("light pos:", x, y)

    ambient_light = np.array([0.5, 0.5, 0.5])
    norm_map, shaded_image = apply_shading(input, norm_map / 255, light_sources, ambient_light, False)
    shaded_pil = Image.fromarray(np.uint8(shaded_image))
    shaded_img_io = BytesIO()
    shaded_pil.save(shaded_img_io, format="PNG")
    shaded_img_io.seek(0)
    shaded_img_data = base64.b64encode(shaded_img_io.getvalue()).decode('utf-8')
    return jsonify({"shading_image": f'{shaded_img_data}'}), 200


if __name__ == '__main__':
    app.run(debug=True)
