import cv2
import numpy as np

images = ["fire1.png", "nofire1.png", "nofire2.png", "nofire3.png"]


def get_green_percentage(image):
    image = cv2.imread(f'./data/{image}')
    hsv_image = cv2.cvtColor(image, cv2.COLOR_BGR2HSV)

    lower_green = np.array([40, 40, 40])
    upper_green = np.array([80, 255, 255])

    # create binary mask
    brown_mask = cv2.inRange(hsv_image, lower_green, upper_green)

    # get percentage of brown pixels
    brown_pixels = np.count_nonzero(brown_mask)
    total_pixels = image.shape[0] * image.shape[1]
    brown_percentage = (brown_pixels / total_pixels) * 100

    return round(brown_percentage, 2)


for image in images:
    score = get_green_percentage(image)
    if score > 20:
        print(f"{image} is a fire hazard: {score}%")
    else:
        print(f"{image} is not a fire hazard: {score}%")

