import numpy as np

RESOLUTION = 400
IMAGE_WIDTH_IN_METERS = 50
METERS_PER_PIXEL = IMAGE_WIDTH_IN_METERS / RESOLUTION
bounding_box = [[-120.1060273,38.8073838],[-120.1059951,38.8072709],[-120.1058791,38.807291],[-120.1059113,38.8074039],[-120.1060273,38.8073838]]

METERS_PER_LAT_DEGREE = 111320

def meters_per_long_degree(lat_center):
    return 111320 * np.cos(np.radians(lat_center))

def distance(coord1, coord2):
    lon1, lat1 = coord1
    lon2, lat2 = coord2
    dx = (lon1 - lon2) * meters_per_long_degree((lat1 + lat2) / 2)
    dy = (lat1 - lat2) * METERS_PER_LAT_DEGREE
    return (dx, dy)

def bounding_box_to_pixel_coords(bounding_box):
    coords = []
    center = int(RESOLUTION / 2)
    coords.append([center, center])
    for i in range(1, len(bounding_box)):
        dx, dy = distance(bounding_box[i], bounding_box[0])
        x = center + dx / METERS_PER_PIXEL
        y = center + dy / METERS_PER_PIXEL
        coords.append([int(x), int(y)])

    return coords

print(bounding_box_to_pixel_coords(bounding_box))