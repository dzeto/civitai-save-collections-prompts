# Civitai Save Collections Prompts

A simple JavaScript script that downloads positive generation prompts from Civitai collections. No installation, Python, or additional tools required. Just open your browser console, paste the code, and run it!

## Features

- Extract positive prompts from Civitai collections.
- Automatically download prompts as individual `.txt` files.
- Each file is named using its corresponding Civitai image ID (`image-id.txt`).
- Works directly in Chrome and Brave browsers.
- No installation or additional dependencies required.

## How to Use

1. Open [Civitai](https://civitai.com/) in Chrome or Brave.
2. Navigate to the collection containing the images you want to save.
3. Press **F12** to open Developer Tools.
4. Click the **Console** tab.
5. Copy the script code from this repository.
6. Paste the code into the console and press **Enter**.
7. The script will process the collection and download the positive prompts as individual text files.

## Output Example

Each image gets its own text file, named after its Civitai image ID:

```text
12345678.txt
12345679.txt
12345680.txt
12345681.txt
```

Each file contains the corresponding image's positive generation prompt.

## Requirements

- Google Chrome or Brave browser.
- Access to Civitai.
- A Civitai collection containing images with generation prompts.

## Disclaimer

This is an independent community script and is not affiliated with or endorsed by Civitai.

Use responsibly and respect Civitai's terms of service.

## License

MIT License
