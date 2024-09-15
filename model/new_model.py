import modal
from fastapi import Request

app = modal.App("abatement")
vol = modal.Volume.from_name("data") 

@app.function(
    volumes={"/data": vol},
    image=modal.Image.debian_slim().pip_install(
       "keras==3.5.0", 
       "tensorflow==2.17.0",
        "Pillow",
        "numpy",
        "requests",
        "pyproj",
    ),
)
@modal.web_endpoint(method="GET")
async def get_risk_endpoint(request: Request):
    from keras.models import load_model
    from PIL import Image
    import numpy as np
    import io
    import base64
    import requests
    import urllib.parse
    import pyproj

    # Get query parameters
    lat = float(request.query_params.get('lat'))
    lon = float(request.query_params.get('lon'))
    width = float(request.query_params.get('width'))
    height = float(request.query_params.get('height'))

    def get_base64_from_url(url):
        response = requests.get(url)
        if response.status_code == 200:
            return base64.b64encode(response.content).decode('utf-8')
        return None

    def calculate_bounding_box(lat, lon, width, height):
        """
        Calculate the bounding box in Web Mercator coordinates (EPSG:3857) 
        given a center latitude and longitude, along with the desired width and height in meters.
        """
        # Define the Web Mercator (EPSG:3857) projection
        web_mercator = pyproj.Proj('epsg:3857')

        # Convert the center point to Web Mercator (meters)
        x_center, y_center = web_mercator(lon, lat)

        # Calculate the half width and half height to determine the bounding box
        half_width = width / 2
        half_height = height / 2

        # Calculate the bounding box in meters
        x_min = x_center - half_width
        x_max = x_center + half_width
        y_min = y_center - half_height
        y_max = y_center + half_height

        return (x_min, y_min, x_max, y_max)

    def construct_naip_url_encoded(bbox):
        """
        Construct the NAIP image export URL using the bounding box coordinates, with URL encoding.
        """
        base_url = "https://map.dfg.ca.gov/arcgis/rest/services/Base_Remote_Sensing/NAIP_2016/ImageServer/exportImage"
        bbox_str = f"{bbox[0]},{bbox[1]},{bbox[2]},{bbox[3]}"

        # URL encode the bounding box string
        bbox_encoded = urllib.parse.quote(bbox_str)

        # Construct the full URL with the bounding box
        url = f"{base_url}?bbox={bbox_encoded}&bboxSR=&size=&imageSR=&time=&format=jpgpng&pixelType=U8&noData=&noDataInterpretation=esriNoDataMatchAny&interpolation=+RSP_BilinearInterpolation&compression=&compressionQuality=&bandIds=&mosaicRule=&renderingRule=&f=image"

        return url

    def get_base64_at(lat, lon, width, height):
        # Calculate the bounding box in Web Mercator coordinates
        bbox = calculate_bounding_box(lat, lon, width, height)

        # Construct the NAIP image export URL with the bounding box
        url = construct_naip_url_encoded(bbox)

        # Get the base64-encoded image data from the URL
        return get_base64_from_url(url)

    def classify_image(base64_image):
        # Decode the Base64 image
        image_data = base64.b64decode(base64_image)
        img = Image.open(io.BytesIO(image_data))

        # Ensure the image is in RGB format
        if img.mode != 'RGB':
            img = img.convert('RGB')

        # Resize the image to match the model's expected input size
        img = img.resize((256, 256))

        # Convert the image to a NumPy array and normalize pixel values
        img_array = np.array(img) / 255.0  # Normalize to [0, 1]

        # Expand dimensions to match the input shape expected by the model
        img_array = np.expand_dims(img_array, axis=0)  # Shape: (1, 256, 256, 3)

        # Load the trained model
        model = load_model('/data/fire_risk_model.h5')

        # Make a prediction
        predictions = model.predict(img_array)
        output = float(predictions[0][0])  # Get the scalar prediction value

        return output

    def get_risk(lat, lon, width, height):
        base64_image = get_base64_at(lat, lon, width, height)
        if base64_image:
            classification = classify_image(base64_image)
            return base64_image, classification
        return None

    # Compute the risk
    base64_image, classification = get_risk(lat, lon, width, height)

    return {"risk": classification, "image": base64_image}
