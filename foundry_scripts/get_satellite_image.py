import urllib.parse
import base64
import requests
import pyproj


def get_base64_from_url(url):
    response = requests.get(url)
    if response.status_code == 200:
        return base64.b64encode(response.content).decode('utf-8')
    return None


def calculate_bounding_box(lat, lon, width, height):
    """
    Calculate the bounding box in Web Mercator coordinates (EPSG:3857) 
    given a center latitude and longitude, along with the desired width and height in meters.

    Parameters:
    lat (float): Latitude of the center point.
    lon (float): Longitude of the center point.
    width (float): Width of the bounding box in meters.
    height (float): Height of the bounding box in meters.

    Returns:
    tuple: Bounding box as (xmin, ymin, xmax, ymax) in meters.
    """
    # Define the Web Mercator (EPSG:3857) projection
    web_mercator = pyproj.Proj(init='epsg:3857')

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

    Parameters:
    bbox (tuple): Bounding box as (xmin, ymin, xmax, ymax) in meters.

    Returns:
    str: The formatted and URL-encoded NAIP exportImage URL with the bounding box.
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
