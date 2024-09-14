import modal
from fastapi import Request


app = modal.App("example-get-started")
vol = modal.Volume.from_name("data")

# @app.function(volumes={"/my_vol": modal.Volume.from_name("data")})                                                      
# def some_func():                                                                                                        
#     os.listdir("/my_vol")                                                                                               

@app.function(volumes={"/data": vol})
def square(x):
    import os
    print("This code is running on a remote worker!")
    files = os.listdir("/data")
    print("Files in /data:", files)
    return x**2

@app.function(
    volumes={"/data": vol},
    image=modal.Image.debian_slim().pip_install(
        "keras==2.12.0", "tensorflow==2.12.0", "Pillow", "numpy"
    ),
)
@modal.web_endpoint(method="POST")
async def classify_image(request: Request):
    from keras.models import load_model
    from PIL import Image
    import numpy as np
    import io

    # Get the form data
    form = await request.form()
    image_file = form.get("file")
    
    # Read the image file content asynchronously
    image_bytes = await image_file.read()

    # Convert the image bytes to an image object using PIL
    img = Image.open(io.BytesIO(image_bytes))
    
    # Convert image to RGB if it has an alpha channel
    if img.mode != 'RGB':
        img = img.convert('RGB')
    
    img = img.resize((256, 256))  # Resize to match the model input size
    img_array = np.array(img) / 255.0  # Normalize pixel values to [0, 1]
    img_array = np.expand_dims(img_array, axis=0)  # Add batch dimension
    
    # Load the model
    model = load_model('/data/fire_risk_model.h5')

    # Predict
    predictions = model.predict(img_array)
    output = float(predictions[0][0])  # Get the scalar prediction value

    # Decide the class based on a threshold (e.g., 0.5)
    if output >= 0.5:
        result = "Fire risk"
    else:
        result = "No fire risk"

    return {"result": result, "output": output}





@app.local_entrypoint()
def main():
    create_model.remote()
    print("the square is", square.remote(42))

