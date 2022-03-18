import shutil
import sys
import os

import numpy as np
import json
from threading import Thread
import zipfile

from fastapi import FastAPI, File, Form, UploadFile
from fastapi.middleware.cors import CORSMiddleware

sys.path.append("..")
from models.stat.lc import LC
from models.ml.snn import SNN

app = FastAPI()
origins = ['*']
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*']
)

complete = 0.0
error = None
file_path = ''
userFileName = ''
lc = None
snn = SNN()


def process_zip(content):
    global complete, error, file_path

    try:
        with open('input.zip', 'wb') as outfile:
            outfile.write(content)

        with zipfile.ZipFile('input.zip', 'r') as zip_ref:
            zip_ref.extractall('input/')
    except Exception:
        error = 'Unable to extract ZIP file'
        return

    complete = 0.8

    files = os.listdir('input/')
    print(files)
    if len(files) == 1:
        file_path = 'input/' + files[0]
    else:
        error = 'ZIP file contains more than one file'

    print(file_path)
    complete = 1.0


@ app.post('/upload')
async def upload(file: UploadFile = File(...)):
    global complete, file_path, error, lc, userFileName

    complete = 0.0
    file_path = ''
    userFileName = ''
    error = None
    lc = None
    shutil.rmtree('input/',ignore_errors=True)
    if(os.path.isfile('input.zip')):
        os.remove('input.zip')
    shutil.rmtree('../frontend/src/assets/')
    os.makedirs('../frontend/src/assets')

    # os.system('rm -rf input*')
    # os.system('rm -rf ../frontend/src/assets/*.jpg')

    userFileName = file.filename
    content = await file.read()

    thread = Thread(target=process_zip, args=(content,))
    thread.start()

    complete = 0.3

    return {'status': 200}


@ app.get('/progress')
def progress():
    global complete, error, lc

    if error is not None:
        return {'status': 422, 'error': error}

    return {'status': 200, 'complete': complete}


@ app.get('/flares')
def bursts(bin_size: int = 100):
    global snn, file_path, lc

    print(file_path)
    lc = LC(file_path, bin_size)

    flares = lc.get_flares()
    conf_list = snn.get_conf(lc.get_ml_data())

    for i in range(len(flares)):
        flares[i]['ml_conf'] = round(100.0 * conf_list[i])
    print({'flares': flares, })
    return {'status': 200, 'flares': flares, 'total': {**lc.get_lc(), 'file_name': userFileName}}


@ app.post('/train')
def train(content: str = Form(...)):
    global snn, lc

    content = json.loads(content)
    labels = np.array(content['labels'])

    snn.train(lc.get_ml_data(), labels, epochs=10)
    return {'status': 200}
