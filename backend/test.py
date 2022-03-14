import sys

sys.path.append("..")
from models.stat.lc import LC
from models.ml.snn import SNN

if __name__ == '__main__':
    snn = SNN()

    file_path = '../../ch2_xsm_20211013_v1_level2.lc'
    bin_size = 20
    lc = LC(file_path, bin_size)
    flares = lc.get_flares()

    for flare in flares:
        flare['ml_conf'] = snn.get_conf(flare['ml_data'])
        flare['class'] = 'A'

    for flare in flares:
        print(flare['ml_conf'])
