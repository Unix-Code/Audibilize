##############################################
# sample:
#   step = 3
#
#   url = "https://www.mathgoodies.com/sites/all/modules/custom/lessons/images/graphs/line_example1.jpg"
#
#   print(locate_point(url=url, step=step))

import cv2 as cv
import numpy as np
import urllib
import json

def url_to_image(url):
    resp = urllib.urlopen(url)
    image = np.asarray(bytearray(resp.read()), dtype="uint8")
    image = cv.imdecode(image, cv.IMREAD_COLOR)
    return image


def detect(img, x, y, t, th):
    if t > th:
        return True
    a = img[x][y][0]
    b = img[x][y][1]
    c = img[x][y][2]
    img[x][y][0] = img[x][y][1] = img[x][y][2] = 0
    if y + 1 < img.shape[1]:
        if abs(int(img[x][y + 1][0]) - a) + abs(int(img[x][y + 1][1]) - b) + abs(
                int(img[x][y + 1][2]) - c) < 100 and not (
                img[x][y + 1][0] == img[x][y + 1][1] == img[x][y + 1][2] == 255):
            if detect(img, x, y + 1, t + 1, th):
                img[x][y][0] = a
                img[x][y][1] = b
                img[x][y][2] = c
                return True
    if x - 1 > 0:
        if abs(int(img[x - 1][y][0]) - a) + abs(int(img[x - 1][y][1]) - b) + abs(
                int(img[x - 1][y][2]) - c) < 100 and not (
                img[x - 1][y][0] == img[x - 1][y][1] == img[x - 1][y][2] == 255):
            if detect(img, x - 1, y, t + 1, th):
                img[x][y][0] = a
                img[x][y][1] = b
                img[x][y][2] = c
                return True
    if x + 1 < img.shape[0]:
        if abs(int(img[x + 1][y][0]) - a) + abs(int(img[x + 1][y][1]) - b) + abs(
                int(img[x + 1][y][2]) - c) < 100 and not (
                img[x + 1][y][0] == img[x + 1][y][1] == img[x + 1][y][2] == 255):
            if detect(img, x + 1, y, t + 1, th):
                img[x][y][0] = a
                img[x][y][1] = b
                img[x][y][2] = c
                return True
    img[x][y][0] = a
    img[x][y][1] = b
    img[x][y][2] = c
    return False


def locate_point(url, step):

    f = url_to_image(url)

    for i in f:
        for j in i:
            if abs(int(j[0]) - int(j[1])) + abs(int(j[0]) - int(j[2])) + abs(int(j[2]) - int(j[1])) < 50:
                j[0] = j[1] = j[2] = 255

    # print(f.shape)
    # cv.imwrite('expand.jpg', f)

    find = False
    for j in range(0, f.shape[1], 1):
        for i in range(0, f.shape[0], 1):
            if detect(f, i, j, 0, min(f.shape[:1])/5):
                # print(i, j)
                xx = i + 1
                yy = j
                find = True
                break
        if find:
            break



    c = f[xx][yy].copy()
    for i in range(0, f.shape[0], 1):
        for j in range(0, f.shape[1], 1):
            if abs(int(f[i][j][0]) - int(c[0])) + abs(int(f[i][j][1]) - int(c[1])) + abs(int(f[i][j][2]) - int(c[2])) < 100:
                f[i][j][0] = f[i][j][1] = f[i][j][2] = 0
            else:
                f[i][j][0] = f[i][j][1] = f[i][j][2] = 255

    # cv.imwrite('gsd.jpg', f)
    grayf = cv.cvtColor(f, cv.COLOR_RGB2GRAY)
    kernel = np.ones((5, 5), np.uint8)
    grayf = cv.erode(grayf, kernel, iterations=1)
    grayf = cv.morphologyEx(grayf, cv.MORPH_OPEN, kernel)
    grayf = cv.dilate(grayf,kernel,iterations = 1)
    # cv.imwrite('gsd3.jpg', grayf)



    pointsy = []
    pointsx = []

    for j in range(yy, f.shape[1], step):
        isset = False
        for i in range(f.shape[0]-1, -1, -1):
            if grayf[i][j] == 0:
                pointsy.append(f.shape[0] - i)
		pointsx.append(j) 
                isset = True
                break
        if not isset:
            break

    res = dict()
    res['x'] = pointsx
    res['y'] = pointsy

    res['maxy'] = max(pointsy)
    res['miny'] = min(pointsy)
    return json.dumps(res)
