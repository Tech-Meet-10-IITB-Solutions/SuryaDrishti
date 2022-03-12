import os
import shutil
import zipfile
from threading import Thread
from time import sleep

from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()
origins = ['*']
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*']
)

# further populated post analysis:
globalDict = {
    'taskDone': 0
}


def analysis(pathToDataDir):
    # do work
    while(globalDict['taskDone'] < 1):
        sleep(1)
        globalDict['taskDone'] += 0.07
    globalDict['bursts'] = [
        {
            'peakTime': 30,
            'peakValue': 150,
            'BGValue': 140,
            'MLConf': 60,
            'Char': 'A',
            'NS': {
                    'moments': [0, 1, 2, 3, 4, 5],
                    'rate':[2, 3, 4, 1, None, 5],
                    'fit':[1, 2, 3, 4, 5, 6],
                    'isDetected':True,
                    'params':{
                        'chiSq': 90,
                        'A': 8,
                        'B': 89,
                        'C': 23,
                        'D': 43
                    }
            },
            'LM': {
                'moments': [0, 1, 2, 3, 4, 5],
                'rate':[2, 3, 4, 1, None, 5],
                'fit':[1, 2, 3, 4, 5, 6],
                'isDetected':True,
                'params':{
                    'chiSq': 90,
                    'A': 8,
                    'B': 89,
                    'C': 23,
                    'D': 43
                }
            },
        },
        {
            'peakTime': 34,
            'peakValue': 150,
            'BGValue': 140,
            'MLConf': 60,
            'Char': 'A',
            'NS': {
                    'moments': [0, 1, 2, 3, 4, 5],
                    'rate':[2, 3, 4, 1, None, 5],
                    'fit':[1, 2, 3, 4, 5, 6],
                    'isDetected':True,
                    'params':{
                        'chiSq': 90,
                        'A': 8,
                        'B': 89,
                        'C': 23,
                        'D': 43
                    }
            },
            'LM': {
                'moments': [0, 1, 2, 3, 4, 5],
                'rate':[2, 3, 4, 1, None, 5],
                'fit':[1, 2, 3, 4, 5, 6],
                'isDetected':True,
                'params':{
                    'chiSq': 90,
                    'A': 8,
                    'B': 89,
                    'C': 23,
                    'D': 43
                }
            },
        },
        {
            'peakTime': 56,
            'peakValue': 150,
            'BGValue': 140,
            'MLConf': 60,
            'Char': 'A',
            'NS': {
                    'moments': [0, 1, 2, 3, 4, 5],
                    'rate':[2, None, 4, 1, None, 5],
                    'fit':[1, 2, 3, 4, 5, 6],
                    'isDetected':True,
                    'params':{
                        'chiSq': 90,
                        'A': 8,
                        'B': 89,
                        'C': 23,
                        'D': 43
                    }
            },
            'LM': {
                'moments': [0, 1, 2, 3, 4, 5],
                'rate':[2, 3, 4, 1, None, 5],
                'fit':[1, 2, 3, 4, 5, 6],
                'isDetected':True,
                'params':{
                    'chiSq': 90,
                    'A': 8,
                    'B': 89,
                    'C': 23,
                    'D': 43
                }
            },
        }

    ]


def processZipFile(content):
    # TEST rmtree on linux cmdline
    if(os.path.isdir('input')):
        shutil.rmtree('input', ignore_errors=True)
    if(os.path.isfile('input.zip')):
        os.remove('input.zip')

    with open('input.zip', 'wb') as outfile:
        outfile.write(content)

    with zipfile.ZipFile('input.zip', 'r') as zip_ref:
        zip_ref.extractall('input/')
    analysis('input')


@app.post('/upload')
async def upload(file1: UploadFile = File(...)):
    content = await file1.read()
    thread = Thread(target=processZipFile, args=(content,))
    thread.start()
    return {'status': 200}


@app.get('/output')
def output():
    print(globalDict['taskDone'])
    if(globalDict['taskDone'] < 1):
        return {'taskDone': round(globalDict['taskDone'], 2)}
    return globalDict


@app.get('/bursts')
def bursts():
    if(globalDict['taskDone'] < 1):
        return {'success': False, 'detail': 'Data Not Ready'}
    return globalDict['bursts']


@app.get('/train')
def train():
    pass
    return {}
