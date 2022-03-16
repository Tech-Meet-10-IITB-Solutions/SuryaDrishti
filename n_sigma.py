from cmath import isnan, nan
from turtle import color
from astropy.io import fits
import matplotlib.pyplot as plt 
from astropy.stats import sigma_clipped_stats as scs
import numpy as np
from scipy.stats import linregress
from scipy.optimize import curve_fit
from scipy.special import erf
import glob
from scipy.stats import chisquare
def load_lc(filename):
    '''filename : path to the .lc file
    Returns : time, rates'''
    lc = fits.open(filename)
    rates = lc[1].data['RATE']
    time = lc[1].data['TIME']
    return time, rates

def orbit_start_indices(time, step=1):
    output_arr = []
    length_arr = []
    for i in range(len(time)):
        if(i==0):
            output_arr.append(i)
        elif(time[i]-time[i-1]>step):
            length_arr.append(time[i-1]-time[output_arr[-1]])
            output_arr.append(i)
    return output_arr, length_arr

def n_sigma(time, counts, n):
    '''n-sigma : returns indices where counts>(mean+n*sigma)
    Returns flags, mean, sigma'''
    mean,_, sigma = scs(counts)
    #flags = np.where(counts>(mean+n*sigma)
    flags = np.where(counts>(mean+n*sigma))
    return flags, mean, sigma

def background_corrected(time, counts, mode='linear'):
    '''time, rates 
    Returns background corrected rates'''
    if(mode == 'linear'):
        #linear for now 
        slope, intercept, r, p, se = linregress(time, counts)
        return counts - (slope*time + intercept)
    elif(mode == 'constant'):
        mean, _ , _ = scs(counts)
        return counts - mean

def rebin_lc(time, rates, t_bin, t_bin_new):
    #t_bin_new is the new binning
    """time, rates
    t_bin : original binning in time
    t_bin_new : desired binning
    Returns time, rates (counts/s)"""
    new_time = np.arange(time[0]-t_bin/2 + t_bin_new/2, time[-1]+t_bin/2 + t_bin_new/2, t_bin_new)
    bin_edges = bin_edges_from_time(new_time, t_bin_new)
    bin_counts = np.histogram(time, bins = bin_edges, weights = rates)[0]
    bin_widths = np.histogram(time, bins=bin_edges, weights=np.ones_like(rates))[0]

    bin_rates = np.nan * bin_widths
    bin_rates[bin_widths != 0] = bin_counts[bin_widths != 0] / bin_widths[bin_widths != 0]
    return new_time, bin_rates

def bin_edges_from_time(time, t_bin):
    time = np.array(time)
    bin_edges = (time[1:] + time[:-1])/2.0
    bin_edges = np.insert(bin_edges, 0, bin_edges[0] - t_bin)
    bin_edges = np.append(bin_edges,bin_edges[-1] + t_bin)
    return bin_edges

def EFP(x, A, B, C, D):
    Z = (2*B + C**2*D)/(2*C)
    return 1/2 * np.sqrt(np.pi) *  A * C * np.exp(D*(B-x) + C**2*D**2/4) * (erf(Z) - erf(Z - x/C))

def fit_efp(flags, time, rates, t_bin_new, A0, B0, C0, D0):
    '''Returns fit'''
    #find the largest contiguous interval in flags
    orb_idx, len_arr = orbit_start_indices(np.array(time[flags]).flatten(), t_bin_new)
    burst_start_idx = int(np.argmax(len_arr))
    flags=np.array(flags).flatten()
    burst_flags = flags[orb_idx[burst_start_idx] : orb_idx[burst_start_idx+1]]
    #time_burst = time[burst_flags]
    #rates_burst = rates[burst_flags]
    time_burst = time[flags]
    rates_burst = rates[flags]
    t2 = np.linspace(time_burst[0], time_burst[-1], len(time_burst)*100)
    A0 *= np.sqrt(max(rates_burst))
    B0 *= time_burst[np.argmax(rates_burst)]
    C0 *= np.sqrt(max(rates_burst))
    popt, pcov = curve_fit(EFP, time_burst, rates_burst, p0 = [A0, B0 \
                                                               , C0, D0])
    fit2 = EFP(t2, *popt)
    return t2, fit2, time_burst, rates_burst

def plot_peak_countrates_hist(folder_path):
    filenames = glob.glob(folder_path + '*.lc')
    peak_arr = []
    file_arr = []
    num_files = len(filenames)
    i = 0
    for lc_file in filenames:
        time, rates = load_lc(lc_file)
        peak_arr.append(max(rates))
        i+=1
        print("{}/{}".format(i, num_files), end='\r')
    np.savetxt("peak.csv", peak_arr)
    plt.figure(0)
    plt.hist(peak_arr, 50)
    plt.xlabel("counts/s")
    plt.ylabel("Number of peaks")
    plt.savefig("peak_hist.png")
    return 0
def distinct_orbits(arr, indices_array):
    output_arr = []
    for i in range(len(indices_array)):
        if(i==0):
            temp = arr[indices_array[0]:indices_array[1]]
            output_arr.append(temp)
        elif(i<len(indices_array)-1):
            temp = arr[indices_array[i]:indices_array[i+1]]
            output_arr.append(temp)
        else:
            temp = arr[indices_array[-1]:]
            output_arr.append(temp)
    return output_arr
def start_end_of_flares(arr, indices_array):
    flare_arr = []
    for i in range(len(indices_array)):
        if(i==0):
            temp = arr[indices_array[0]:indices_array[1]]
            t_start = arr[indices_array[0]]
            t_end = arr[indices_array[1]-1]
            flare_arr.append([t_start, t_end])
        elif(i<len(indices_array)-1):
            temp = arr[indices_array[i]:indices_array[i+1]]
            t_start = arr[indices_array[i]]
            t_end = arr[indices_array[i]-1]
            flare_arr.append([t_start, t_end])
        else:
            t_start = arr[indices_array[-1]]
            t_end = arr[-1]
            flare_arr.append([t_start, t_end])
    return flare_arr
#plot_peak_countrates_hist('/media/pranav/page/Laptop data/Coursework/Semester 8/InterIIT/Extracted lightcurve/')
'''
peak_countrates = np.loadtxt("peak.csv")
print(peak_countrates)
plt.figure(0)
#print(np.log10(min(peak_countrates)), np.log10(max(peak_countrates)))
#bins_hist = np.logspace(np.log10(1), np.log10(max(peak_countrates)), 50)
plt.hist(peak_countrates,bins = 50, log=True)
plt.xlabel("counts/s")
plt.ylabel("Number of peaks")
#plt.gca().set_xscale("log")
plt.savefig("peak_hist_log_lin.png")
'''
def n_sigma_start_stop(time_new,rates_new, n):
    t_arr = []
    mean,_, sigma  = scs(rates_new)
    t_start = time_new[0]
    t_end = t_start
    j = 0
    for i in range(len(time_new)):
        if(rates_new[i] < mean + n*sigma):
            if(j!=0):
                t_end = temp
                if(j>3):
                    t_arr.append([t_start, t_end])
                #print([t_start, t_end])
            j = 0
        elif(j==0):
            if(not np.isnan(rates_new[i])):
                t_start = time_new[i]
                temp = t_start
                #print(time_new[i], rates_new[i], mean + n*sigma)
                j+=1
        else:
            if(not np.isnan(rates_new[i])):
                temp = time_new[i]
                j+=1
    return t_arr
def n_sigma_main(filename, n, t_bin, t_bin_new):
    time, rates = load_lc(filename)
    #print(time)
    time_new, rates_new = rebin_lc(time, rates, t_bin, t_bin_new)
    flags, mean, sigma = n_sigma(time_new, rates_new, n)
    t_arr = n_sigma_start_stop(time_new, rates_new, n)
    #idx_arr, _ = orbit_start_indices(time_new[flags], 2*t_bin_new)
    #output_arr = distinct_orbits(time_new[flags], idx_arr)
    #print(time_new[flags][idx_arr])
    #flare_arr = start_end_of_flares(time_new[flags], idx_arr)
    #print("Flares")
    #print(flare_arr)
    plt.plot(time,rates, alpha = 0.7)
    plt.scatter(time_new[flags], rates_new[flags], color = 'r')
    plt.axhline(mean+n*sigma,linestyle='--', color='r')
    plt.axhline(mean, linestyle = '--', color='g')
    for i in range(len(t_arr)):
        plt.axvline(t_arr[i][0], color = 'b', linestyle = '--')
        plt.axvline(t_arr[i][1], color = 'k', linestyle = '--')
    plt.savefig("n_sigma_start_stop.png")
    plt.show() 
    # need to return start time, end time for flares
    return 
n_sigma_main('/media/pranav/page/Laptop data/Coursework/Semester 8/InterIIT/Extracted lightcurve/ch2_xsm_20211111_v1_level2.lc', 3, 1.0, 10.0)