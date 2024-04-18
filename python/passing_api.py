import numpy as np
from flask import Flask, request, jsonify
from werkzeug.utils import secure_filename
from PIL import Image, ImageDraw
from io import BytesIO
import base64
import os
from flask_cors import CORS
from omnidata_main.omnidata_tools.torch.demo_func import get_normal_map
from shading_test import apply_shading
from torchvision import transforms

to_pil = transforms.ToPILImage()

app = Flask(__name__)
CORS(app)# Ensure there's a folder for uploads
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
        raw_norm_map = get_normal_map('normal', input) # unprocessed square shape normal
        # norm_map
        img_io = BytesIO()
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
        shaded_image_io = BytesIO()
        norm_map, shaded_image = apply_shading(input, raw_norm_map, light_sources, ambient_light)
        shaded_pil = Image.fromarray(np.uint8(shaded_image))
        shaded_pil.show()
        shaded_pil.save(shaded_image_io, format="PNG")
        norm_pil = Image.fromarray(np.uint8(norm_map))
        norm_pil.save(img_io, format="PNG")
        # image_data.save(img_io, format="PNG")
        img_io.seek(0)
        shaded_image_io.seek(0)
        img_data = base64.b64encode(img_io.getvalue()).decode('utf-8')
        shaded_image_data = base64.b64encode(shaded_image_io.getvalue()).decode('utf-8')
        print(shaded_image_data)
        print(img_data)
        return jsonify({'normal_map': f'{img_data}', "shading_image": f'{shaded_image_data}'}), 200
        # return jsonify({'normal_map': f'{img_data}'}), 200
        #
        # return jsonify({'message': 'File successfully uploaded', 'filename': filename}), 200

@app.route('/update_normal_map', methods=['POST'])
def update_normal_map():
    global norm_map
    data = request.get_json()
    # Now you can access your points array from the data
    if data:
        canvasWidth = data.get('canvasWidth')
        canvasHeight = data.get('canvasHeight')
        points = data.get('points') if data else None
        point_tuples = [(point['x'], point['y']) for point in points]
        norm_direction = [1, 1, 1] # TODO: grab input from the front end
        input_np = np.array(input)
        print(canvasWidth, canvasHeight)
        print(point_tuples)
        print(input_np.shape)
        print(norm_map)
        height, width, _ = input_np.shape
        aspect_ratio = width / height
        scaling_ratio = height / canvasHeight
        mask_img = Image.new('L', (canvasWidth, canvasHeight), 0)
        ImageDraw.Draw(mask_img).polygon(point_tuples, outline=1, fill=1)
        new_height = int(canvasHeight * scaling_ratio)
        new_width = int(canvasWidth * scaling_ratio)
        mask_img = mask_img.resize((new_width, new_height))
        mask = np.array(mask_img)
        mask = mask[:, (new_width - width) // 2:(new_width + width) // 2]

        # combine the new normal with the existing normal
        new_normal = np.zeros_like(norm_map)
        new_normal[:, :, 0] = norm_direction[0]
        new_normal[:, :, 1] = norm_direction[1]
        new_normal[:, :, 2] = norm_direction[2]
        norm_map[mask == 1] = new_normal[mask == 1]

        mask_pil = Image.fromarray(np.uint8(mask * 255))
        mask_pil.show()

        norm_map_pil = Image.fromarray(np.uint8(norm_map))
        norm_map_pil.show()

        return jsonify({'normal_map': f'okay'}), 200

if __name__ == '__main__':
    app.run(debug=True)
