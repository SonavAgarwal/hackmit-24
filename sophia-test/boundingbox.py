import numpy as np
from PIL import Image, ImageDraw

RESOLUTION = 400
IMAGE_WIDTH_IN_METERS = 50
METERS_PER_PIXEL = IMAGE_WIDTH_IN_METERS / RESOLUTION
METERS_PER_LAT_DEGREE =  111320
ZONES_IN_METERS = [5, 15, 100]
MULTIPLIER = 1.35

def meters_per_long_degree(lat_center):
    return 111320 * np.cos(np.radians(lat_center))

def distance(coord1, coord2):
    lon1, lat1 = coord1
    lon2, lat2 = coord2
    # lat1, lon1 = coord1
    # lat2, lon2 = coord2
    dx = (lon2 - lon1) * meters_per_long_degree((lat1 + lat2) / 2) * MULTIPLIER
    dy = (lat2-lat1) * METERS_PER_LAT_DEGREE * MULTIPLIER
    return (dx, dy)

def bounding_box_to_pixel_coords(bounding_box):
    coords = []
    center = int(RESOLUTION / 2)
    coords.append((center, center))
    for i in range(1, len(bounding_box)):
        dx, dy = distance(bounding_box[i], bounding_box[0])
        x = center + dx / METERS_PER_PIXEL
        y = center + dy / METERS_PER_PIXEL
        coords.append((int(x), int(y)))

    return coords

def reflect_polygon(coords):
    # reflect polygon over first coordinate
    x0, y0 = coords[0]
    reflected_coords = []
    for x, y in coords:
        reflected_coords.append((2*x0 - x, y))
    return reflected_coords

def calculate_centroid(coords):
    # Average of the x and y coordinates of the polygon vertices
    x_coords = [coord[0] for coord in coords]
    y_coords = [coord[1] for coord in coords]
    centroid_x = sum(x_coords) / len(coords)
    centroid_y = sum(y_coords) / len(coords)
    return (centroid_x, centroid_y)

def scale_polygon(coords, buffer_in_pixels):
    centroid = calculate_centroid(coords)
    scaled_coords = []
    
    for x, y in coords:
        # Calculate vector from centroid to the point
        vector_x = x - centroid[0]
        vector_y = y - centroid[1]
        
        # Scale the vector
        scaled_x = centroid[0] + vector_x * (1 + buffer_in_pixels / np.sqrt(vector_x**2 + vector_y**2))
        scaled_y = centroid[1] + vector_y * (1 + buffer_in_pixels / np.sqrt(vector_x**2 + vector_y**2))
        
        scaled_coords.append((int(scaled_x), int(scaled_y)))
    
    return scaled_coords

def get_polygons_from_bounding_box(bounding_box):
    res = []
    bounding_box = bounding_box[:-1] if bounding_box[0] == bounding_box[-1] else bounding_box
    polygon_coords = bounding_box_to_pixel_coords(bounding_box)
    polygon_coords = reflect_polygon(polygon_coords)
    res.append(polygon_coords)
    for zone in ZONES_IN_METERS:
        scaled_polygon_coords = scale_polygon(polygon_coords, zone)
        res.append(scaled_polygon_coords)
    return res


def create_masks(image, polygons):
    masks = []
    for polygon in polygons:
        mask = Image.new('L', image.size, 1)
        ImageDraw.Draw(mask).polygon(polygon, outline=1, fill=1)
        masks.append(mask)
        mask.save('mask.png')
        mask.show()

    return masks


IMAGE_NAME = "50x50.png"
bounding_box = [[-120.1060273,38.8073838],[-120.1059951,38.8072709],[-120.1058791,38.807291],[-120.1059113,38.8074039],[-120.1060273,38.8073838]]

polygons = get_polygons_from_bounding_box(bounding_box)

# Load the image
image = Image.open(IMAGE_NAME)  # Replace with your image file path
draw = ImageDraw.Draw(image)


# Draw the polygon on the image
for polygon in polygons:   
    draw.polygon(polygon, outline='red', fill=None)  # Change 'red' to any color you want

create_masks(image, polygons)

# Save or display the result
image.save('image_with_polygon.jpg')  # You can save the modified image
image.show()  # To display the image directly


print(bounding_box_to_pixel_coords(bounding_box))