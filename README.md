# Label Hider

This project contains the following files:

- `runme.py`: A Python script.
- `Tampermonkey.js`: A JavaScript file for use with Tampermonkey.

## Getting Started

To get started with this project, follow these steps:

1. Clone the repository:
   ```bash
   git clone [repository URL]
   ```

2. Navigate to the project directory:
   ```bash
   cd Label\ Hider
   ```

3. Run the Python script:
   ```bash
   python runme.py
   ```

4. Install the Tampermonkey script:
   - Open your browser and go to the Tampermonkey extension.
   - Click "Create a new script..."
   - Copy and paste the contents of `Tampermonkey.js` into the editor.
   - Save the script.

## Usage

This project is designed to automatically blur the background image on pages of the website `purposegames.com`. This is intended to hide answers from the image.

The system consists of two main components:

1. **`runme.py`**: A Python script that runs a Flask web server. This server receives the URL of a background image, processes it to blur text regions, and serves the blurred image.
2. **`Tampermonkey.js`**: A userscript that runs on `purposegames.com` pages. It extracts the background image URL, sends it to the Flask server, and replaces the original background image with the blurred version returned by the server.

When a user visits a `purposegames.com` page with the Tampermonkey script installed, the script will automatically extract the background image URL, send it to the server for processing, and replace the original background image with the blurred version.

## Contributing

Contributions are welcome! Please read the contributing guidelines before getting started.

## License

This project is licensed under the MIT License.
