import sys
import os
import zipfile
from threading import Thread

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
lc = None
snn = SNN()
snn.load('base')


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
    global complete, file_path, error, lc

    complete = 0.0
    file_path = ''
    error = None
    lc = None
    os.system('rm -rf input*')

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
def bursts(bin_size: int = 20):
    global snn, file_path, lc

    print(file_path)
    lc = LC(file_path, bin_size)
    flares = lc.get_flares()

    for flare in flares:
        flare['ml_conf'] = snn.get_conf(flare['ml_data'])
        flare['class'] = 'A'
    
    return {'status': 200, 'flares': flares}


@ app.post('/train')
def train(content: dict = Form(...)):
    global snn, lc

    labels = content['labels']
    ml_data_list = []
    for flare in lc.get_flares():
        ml_data_list.append(flare['ml_data'])

    print(labels)
    snn.train(ml_data_list, labels, epochs=10)

    return {'status': 200}
