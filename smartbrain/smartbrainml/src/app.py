from flask import Flask, jsonify, request
import cv2
import requests
import os
from mtcnn.mtcnn import MTCNN
from flask import jsonify
from flask_cors import CORS, cross_origin
import redis
import json

try:
    redis_host = os.environ['REDIS_HOST']
    redis_port = os.environ['REDIS_PORT']
    redis_password = os.environ['REDIS_PWD']
    redis_ssl = os.environ['REDIS_SSL']

except:
    redis_host = 'redis'

r = redis.Redis(host=redis_host, port=redis_port, db=0, ssl=redis_ssl)

app = Flask(__name__)

# get permitted origins. first attempt to get the client url from environment variable
try:
    origin = os.environ['CLIENT_URL']
except (KeyError):
    # origin = "http://localhost:*"
    origin = '*'
print(origin)
CORS(app, support_credentials=True, origins=[origin])


def run_ml_model(url, img_data, redisInstance, filename='image_name.jpg'):
    with open(filename, 'wb') as handler:
        handler.write(img_data)
    img = cv2.imread(filename)
    width = 500
    height = int(img.shape[0]/img.shape[1] * 500)
    dim = (width, height)
    pixels = cv2.resize(img, dim, interpolation=cv2.INTER_AREA)
    detector = MTCNN()
    # detect faces in the image
    faces = detector.detect_faces(pixels)
    # for face in faces:
    #     print(face)
    # print(faces)
    results = []
    for face in faces:
        # print(face)
        faces_coordinates = face["box"]
        # for (x, y, w, h) in faces_coordinates:
        x = faces_coordinates[0]
        y = faces_coordinates[1]
        w = faces_coordinates[2]
        h = faces_coordinates[3]
        results.append({"leftCol": x, "topRow": y,
                       "rightCol": width-(x+w), "bottomRow": height-(y+h)})
        cv2.rectangle(pixels, (x, y), (x+h, y+w), (255, 0, 0), 2)
        # cv2.rectangle(pixels, (x, y), (x+w, y+h), (255, 0, 0), 2)
        # print(x+w,y+h)
    # cv2.imwrite("image_name2.jpg",pixels)
    # print(height)
    os.remove(filename)
    results = results[0]
    redisInstance.set(url, json.dumps(results))
    print('had to run the calculation', json.dumps(results))
    return results


@cross_origin(supports_credentials=True)
@app.route('/', methods=['GET', 'POST'])
def get_rhome():
    return jsonify('okay python2')


@cross_origin(supports_credentials=True)
@app.route('/worker', methods=['GET', 'POST'])
def get_home():
    return jsonify('okay python')


@cross_origin(supports_credentials=True)
@app.route('/worker/ml', methods=['POST'])
def get_detected():
    data = json.loads(request.data)
    url = data['url']

    print('the url sent was', url)
    img_data = requests.get(url).content
    try:
        results = r.get(url).decode("utf-8")
        print('no calculation required', results)
        results = json.loads(results)
    except AttributeError as e:
        results = run_ml_model(url, img_data, r)
    return jsonify(results)


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=2000, debug=True)
