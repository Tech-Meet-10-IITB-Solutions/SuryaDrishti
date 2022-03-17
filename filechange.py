import os
from astropy.io import ascii, fits
from astropy.table import Table

path = r"C:\Users\aswin\OneDrive\Desktop\XSM_data\50k_cts.lc"
fits_file = fits.open(r"C:\Users\aswin\OneDrive\Desktop\XSM_data\50k_cts.lc")
def fits_convert(fits_file, ext):
    filename, file_ext = os.path.splitext(path)
    data = Table([fits_file[1].data['Time'], fits_file[1].data['Rate']], names= ['TIME', 'RATE'])
    if ext == 'ascii':
        ascii.write(data, filename + '.ascii', delimiter = '\t', overwrite = True)
    elif ext == 'dat':
        ascii.write(data, filename + '.dat', format = 'ascii', overwrite = True)
    elif ext == 'csv':
        ascii.write(data, filename + '.csv', format = 'csv', overwrite = True)
    elif ext == 'hdf5':
        fits_file.write(filename + '.hdf5', overwrite = True, compression = True)
        
def load_lc(self, lc_path):
    filename, file_ext = os.path.splitext(lc_path)
    if file_ext == 'lc':
        lc = fits.open(lc_path)
        rates = lc[1].data['RATE']
        time = lc[1].data['TIME']
        return time, rates
    
    elif file_ext == 'ascii':
        t = Table.read(lc_path, format = 'ascii')
        rates = t['RATE']
        time = t['TIME']
        return time, rates
    
    elif file_ext == 'cds':
        t = Table.read(lc_path, format = 'ascii.cds')
        rates = t['RATE']
        time = t['TIME']
        return time, rates
    
    elif file_ext == 'csv':
        t = Table.read(lc_path, format = 'ascii.csv')
        rates = t['RATE']
        time = t['TIME']
        return time, rates
    
    elif file_ext == 'hdf5':
        t = Table.read(lc_path)
        rates = t['RATE']
        time = t['TIME']
        return time, rates
    
    elif file_ext == 'dat':
        t = Table.read(lc_path,format = 'ascii.daophot')
        rates = t['RATE']
        time = t['TIME']
        return time, rates