import numpy as np
from flask import Flask, request, jsonify
from werkzeug.utils import secure_filename
from PIL import Image
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
@app.route('/upload', methods=['POST'])
def upload_file():
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
        img = Image.open(file)
        # img_io = BytesIO()
        # img.save(img_io, format="PNG")
        # img_data = base64.b64encode(img_io.getvalue()).decode('utf-8')
        # return jsonify({'normal_map': f'{img_data}'}), 200
        norm_map = get_normal_map('normal', img)
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
        shaded_image = apply_shading(img, norm_map, light_sources, ambient_light)
        shaded_pil = Image.fromarray(shaded_image)
        shaded_pil.show()
        # shaded_image.save(shaded_image_io, format="PNG")
        to_pil(norm_map[0]).save(img_io, format="PNG")
        # image_data.save(img_io, format="PNG")
        img_io.seek(0)
        # shaded_image.seek(0)
        img_data = base64.b64encode(img_io.getvalue()).decode('utf-8')
        # shaded_image_data = base64.b64encode(shaded_image.getvalue()).decode('utf-8')
        # return jsonify({'normal_map': f'{img_data}'}, "shading_image", f'{shaded_image_data}'), 200
        return jsonify({'normal_map': f'{img_data}'}), 200
        #
        # return jsonify({'message': 'File successfully uploaded', 'filename': filename}), 200
    
if __name__ == '__main__':
    app.run(debug=True)
