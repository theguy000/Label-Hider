import pytesseract
from PIL import Image, ImageEnhance, ImageFilter
import time

pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'

from flask import Flask, request, jsonify, send_file
import requests
import threading

app = Flask(__name__)
url = None

def process_image(url):
    try:
        r = requests.get(url)
        r.raise_for_status()
        with open("original.webp", "wb") as f:
            f.write(r.content)
        print("Original image saved successfully")

        image = Image.open("original.webp").convert("RGB")
        enhancer = ImageEnhance.Sharpness(image)
        image = enhancer.enhance(2.0)
        enhancer = ImageEnhance.Contrast(image)
        image = enhancer.enhance(1.5)

        data = pytesseract.image_to_data(image, output_type=pytesseract.Output.DICT, lang="eng", config="--psm 11")
        non_empty_indices = [i for i, text in enumerate(data['text']) if text.strip() != ""]

        # confidence threshold, default 80, causes issues, doesn't work well for all the texts
        # non_empty_indices = [i for i in non_empty_indices if data['conf'][i] > 80]

        for i in non_empty_indices:
            x, y, w, h = data['left'][i], data['top'][i], data['width'][i], data['height'][i]
            region = image.crop((x, y, x+w, y+h))
            region = region.filter(ImageFilter.GaussianBlur(radius=3))
            image.paste(region, (x, y))

        original_image = Image.open("original.webp").convert("RGB")
        for i in non_empty_indices:
            x, y, w, h = data['left'][i], data['top'][i], data['width'][i], data['height'][i]
            region = image.crop((x, y, x+w, y+h))
            original_image.paste(region, (x, y))
        image = original_image

        image.save("blurred_image.png")
        print("Blurred image saved successfully")

    except Exception as e:
        print(f"Error occurred: {e}")

@app.route('/set_url', methods=['POST'])
def set_url():
    global url
    data = request.get_json()
    print("Received request with data:", data)
    if data and 'url' in data:
        url = data['url']
        print(f"URL set to: {url}")
        process_image(url)
        return jsonify({'message': 'URL received'}), 200
    return jsonify({'message': 'Invalid request'}), 400

@app.route('/blurred_image.png')
def serve_blurred_image():
    try:
        return send_file('blurred_image.png', mimetype='image/png')
    except FileNotFoundError:
        return jsonify({'message': 'Blurred image not found'}), 404

def run_server():
    app.run(port=5000, threaded=True)

# Enable CORS
@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
    response.headers.add('Access-Control-Allow-Methods', 'POST, OPTIONS')
    return response

server_thread = threading.Thread(target=run_server)
server_thread.daemon = True
server_thread.start()

print("Server started, waiting for image URLs...")

while True:
    time.sleep(1)
