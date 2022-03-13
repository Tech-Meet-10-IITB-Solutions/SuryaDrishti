from astropy.io import fits
from astropy.stats import sigma_clipped_stats as scs
from astropy.convolution import convolve, Box1DKernel

import numpy as np

from scipy.stats import linregress

import matplotlib.pyplot as plt


class LC:
    def __init__(self, lc_path, bin_size):
        self.lc_path = lc_path
        self.bin_size = bin_size
        self.sm_batch_size = 70
        self.sm_kernel_size = 8

        self.raw_time, self.raw_rates = self.load_lc(self.lc_path)

        self.sm_time, self.sm_rates = self.smoothen(
            self.raw_time, self.raw_rates, self.sm_batch_size, self.sm_kernel_size)

        self.bin_time, self.bin_rates = self.rebin_lc(
            self.sm_time, self.sm_rates, 1.0, self.bin_size)

        self.processed_lc = np.array([self.sm_time, self.sm_rates])
        # self.processed_lc = np.array([self.bin_time, self.bin_rates])

    def get_lc(self):
        return self.processed_lc

    def get_flares(self):
        return self.flares

    def load_lc(self, lc_path):
        lc = fits.open(lc_path)
        rates = lc[1].data['RATE']
        time = lc[1].data['TIME']
        return time, rates

    def bg_correction(self, time, rates, mode='linear'):
        if (mode == 'linear'):
            slope, intercept, r, p, se = linregress(time, rates)
            return rates - (slope * time + intercept)
        elif(mode == 'constant'):
            mean, _, _ = scs(rates)
            return rates - mean

    def rebin_lc(self, time, rates, t_bin, t_bin_new):
        new_time = np.arange(time[0] - t_bin / 2 + t_bin_new / 2,
                             time[-1] + t_bin / 2 + t_bin_new / 2, t_bin_new)
        bin_edges = self.bin_edges_from_time(new_time, t_bin_new)
        bin_counts = np.histogram(time, bins=bin_edges, weights=rates)[0]
        bin_widths = bin_edges[1:] - bin_edges[:-1]
        bin_rates = bin_counts / bin_widths
        return new_time, bin_rates

    def bin_edges_from_time(self, time, t_bin):
        time = np.array(time)
        bin_edges = (time[1:] + time[:-1]) / 2.0
        bin_edges = np.insert(bin_edges, 0, bin_edges[0] - t_bin)
        bin_edges = np.append(bin_edges, bin_edges[-1] + t_bin)
        return bin_edges

    def smoothen(self, time, rates, box_bin, kernel_size):
        box_time, box_count = np.array([]), np.array([])
        for i in range(len(time[:]) // box_bin):
            if(box_bin * i + i <= len(rates)):
                counts = rates[box_bin * i + i:box_bin * (i + 1) + kernel_size + 1 + i]
                boxavg_counts = convolve(counts, Box1DKernel(kernel_size))[
                    kernel_size // 2:box_bin + kernel_size // 2 + 1]
                box_count = np.concatenate((box_count, boxavg_counts))
                box_time = np.concatenate((box_time,
                                           time[box_bin * i + i + kernel_size // 2:
                                                box_bin * (i + 1) + kernel_size // 2 + 1 + i])
                                          )
            else:
                continue
        return box_time, box_count


if __name__ == '__main__':
    lc = LC('../../../ch2_xsm_20211013_v1_level2.lc', 20)

    print(lc.raw_time.shape, lc.processed_lc.shape)

    # plt.plot(lc.sm_time, lc.sm_rates)
    # plt.scatter(lc.sm_time, lc.sm_rates, s=0.01)
    # plt.plot(lc.bin_time, lc.bin_rates)
    # plt.scatter(lc.bin_time, lc.bin_rates, s=0.2)
    # plt.show()
