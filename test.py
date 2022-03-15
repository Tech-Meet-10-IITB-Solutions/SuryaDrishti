import sys

import numpy as np

sys.path.append("/content/drive/MyDrive/B76-ISRO-PS")
from models.stat.lc import LC
from models.ml.snn import SNN

if __name__ == '__main__':
    snn = SNN()
    file_path = '/content/ch2_xsm_20211013_v1_level2.lc'
    bin_size = 20
    lc = LC(file_path, bin_size)

    flares = lc.get_flares()
    
    ml_data_list = []
    for flare in lc.get_flares():
        ml_data_list.append(flare['ml_data'])
    
    print('Training = 0')
    for flare in flares:
       flare['ml_conf'] = snn.get_conf(flare['ml_data'])
       print(flare['ml_conf'])

    labels = np.ones((len(flares),))
    labels[-1] = 0.0
    snn.train(ml_data_list, labels, epochs=5)
    
    print('Training = 1')
    for flare in flares:
        flare['ml_conf'] = snn.get_conf(flare['ml_data'])
        print(flare['ml_conf'])
    
    labels = np.ones((len(flares),))
    snn.train(ml_data_list, labels, epochs=5)

    print('Training = 2')
    for flare in flares:
        flare['ml_conf'] = snn.get_conf(flare['ml_data'])
        print(flare['ml_conf'])
