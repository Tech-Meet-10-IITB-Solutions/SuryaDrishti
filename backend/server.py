from time import sleep
import zipfile
import shutil
from fastapi import FastAPI, File,UploadFile,Form
from fastapi.middleware.cors import CORSMiddleware
from threading import Thread

app = FastAPI()
origins = ['*']
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*']
)
globalDict = {
    'taskDone':0,
    #further populated post analysis:
}
def analysis(pathToDataDir):
    #do work
    while(globalDict['taskDone']<1):
        sleep(1)
        globalDict['taskDone']+=0.07
    globalDict['tables']=[
        {'name':'H','age':13},
        {'name':'O','age':26},
    ]
    globalDict['lineData']={
        'x':[0,1,2,3,4,5],
        'y':[5,7,2,4,9,1]
    },
    globalDict['barData']={
        'data':[10,41,35,51,49,62,69,91,148],
        'cats':["Jan","Feb",  "Mar",  "Apr",  "May",  "Jun",  "Jul",  "Aug", "Sep"]
    }
def processZipFile(content):
    with open('input.zip','wb') as outfile:
        outfile.write(content)
    with zipfile.ZipFile('input.zip', 'r') as zip_ref:
        zip_ref.extractall('input/')
    analysis('input')
@app.post('/upload')
async def upload(file1:UploadFile = File(...)):
    content = await file1.read()
    thread = Thread(target=processZipFile, args=(content,))
    thread.start()
    return {'status':200}
@app.get('/output')
def output():
    print(globalDict['taskDone'])
    if(globalDict['taskDone']<1):
        return {'taskDone':round(globalDict['taskDone'],2)}
    return globalDict
