import numpy as np


# W/m^2
def calc_flux(count):
    start_energy_flux = np.log10(3e-9)
    start_count_rate = np.log10(1e1)
    end_energy_flux = np.log10(7e-7)
    end_count_rate = np.log10(1e3)
    flux_slope = ((end_count_rate - start_count_rate) / (end_energy_flux - start_energy_flux))
    A = np.power(10, start_count_rate - flux_slope * start_energy_flux)
    flux = np.power(np.array(count / A), 1 / flux_slope)
    return flux


# sub-A (Q), A, B, C, M, X
def find_flare_class(flux):
    flare_class_val = np.log10(np.max(flux)) + 8
    flare_class = 'A'
    if(flare_class_val < 0):
        flare_class = 'sub-A'
    elif(flare_class_val < 1):
        flare_class = 'A' + str(np.int32(np.round(flare_class_val, 1) * 10))
    elif(flare_class_val < 2):
        flare_class = 'B' + str(np.int32(np.round(flare_class_val - 1, 1) * 10))
    elif(flare_class_val < 3):
        flare_class = 'C' + str(np.int32(np.round(flare_class_val - 2, 1) * 10))
    elif(flare_class_val < 4):
        flare_class = 'M' + str(np.int32(np.round(flare_class_val - 3, 1) * 10))
    else:
        flare_class = 'X' + str(np.int32(np.round(flare_class_val - 4, 1) * 10))
    return flare_class


# In MK
def calc_temperature(flux):
    if (flux < 7e-8):
        return 9.28 + 0.32 * np.log10(flux)
    elif (flux > 1e-7):
        return 34 + 3.9 * np.log10(flux)
    else:
        return ((np.log10(1e-7) - np.log10(flux)) * (9.28 + 0.32 * np.log10(flux))
                + (np.log10(flux) - np.log10(7e-8)) * (34 + 3.9 * np.log10(flux))) \
            / (np.log10(1e-7) - np.log10(7e-8))


# in cm^3
def calc_EM(flux):
    return 10**53 * np.log10(flux)**0.86
