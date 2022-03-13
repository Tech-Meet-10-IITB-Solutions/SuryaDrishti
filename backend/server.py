import sys
import os
import zipfile
from threading import Thread

from fastapi import FastAPI, File, Form, UploadFile
from fastapi.middleware.cors import CORSMiddleware

sys.path.append("..")
from models.stat.lc import LC

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


def process_zip(content):
    global complete, error, file_path

    try:
        with open('input.zip', 'wb') as outfile:
            outfile.write(content)

        with zipfile.ZipFile('input.zip', 'r') as zip_ref:
            zip_ref.extractall('input/')
    except Exception:
        error = 'Unable to extract ZIP file'

    complete = 0.8

    files = os.listdir('input/')
    if len(files) == 1:
        file_path = 'input/' + files[0]
    else:
        error = 'ZIP file contains more than one file'

    complete = 1.0


@ app.post('/upload')
def upload(file: UploadFile = File(...)):
    global complete, file_path, error, lc

    complete = 0.0
    file_path = ''
    error = None
    lc = None
    os.system('rm -rf input*')

    content = file.read()

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
    global file_path, lc

    lc = LC(file_path, bin_size)
    flares = lc.get_flares()

    for flare in flares:
        flare['bg_rate'] = flare['peak_rate']
        flare['ml_conf'] = 60
        flare['class'] = 'A'

    return {'status': 200, 'flares': flares}


@ app.post('/train')
def train(content: dict = Form(...)):
    global lc

    labels = content['labels']

    print(labels)

    return {'status': 200}
