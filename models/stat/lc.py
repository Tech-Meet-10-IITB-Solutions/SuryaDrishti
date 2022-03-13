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

        self.ns_flares = self.ns(self.processed_lc[0], self.processed_lc[1])
        self.lm_flares = self.lm(self.processed_lc[0], self.processed_lc[1])

        self.base_flares = self.merge_flares(self.ns_flares, self.lm_flares)

        self.flares = self.add_efp(self.base_flares, self.processed_lc)

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

    def ns(self, time, rates):
        np.random.seed(0)
        flares = []
        sampled = sorted(np.random.choice(range(len(time)), size=10, replace=False))
        for i in range(0, len(sampled), 2):
            # start_time = time[sampled[i]]
            # end_time = time[sampled[i + 1]]
            peak_time = sampled[i] + np.argmax(rates[sampled[i]:sampled[i + 1]])
            flares.append([sampled[i], sampled[i + 1], peak_time])
        return flares

    def lm(self, time, rates):
        np.random.seed(0)
        flares = []
        sampled = sorted(np.random.choice(range(len(time)), size=12, replace=False))
        for i in range(0, len(sampled), 2):
            # start_time = time[sampled[i]]
            # end_time = time[sampled[i + 1]]
            peak_time = sampled[i] + np.argmax(rates[sampled[i]:sampled[i + 1]])
            flares.append([sampled[i], sampled[i + 1], peak_time])
        return flares

    def merge_flares(self, ns_flares, lm_flares):
        flares = []
        for flare in ns_flares:
            flare_base = {
                'peak_idx': flare[2],
                'ns': {},
                'lm': {}
            }

            flare_base['ns']['is_detected'] = True
            flare_base['ns']['start_idx'] = flare[0]
            flare_base['ns']['end_idx'] = flare[1]

            flare_base['lm']['is_detected'] = False

            flares.append(flare_base)

        for flare in lm_flares:
            found = False
            for flare_old in flares:
                if(flare[2] == flare_old['peak_idx']):
                    flare_old['lm']['is_detected'] = True
                    flare_old['lm']['start_idx'] = flare[0]
                    flare_old['lm']['end_idx'] = flare[1]
                    found = True
                    break

            if (not found):
                flare_base = {
                    'peak_idx': flare[2],
                    'ns': {},
                    'lm': {}
                }

                flare_base['ns']['is_detected'] = False

                flare_base['lm']['is_detected'] = True
                flare_base['lm']['start_idx'] = flare[0]
                flare_base['lm']['end_idx'] = flare[1]

                flares.append(flare_base)

        return flares

    def efp(self, time, rates):
        res = {}
        res['A'] = np.random.rand()
        res['B'] = np.random.rand()
        res['C'] = np.random.rand()
        res['D'] = np.random.rand()
        res['ChiSq'] = np.random.rand()
        return res

    def fit_efp(self, params, time):
        A, B, C, D = params['A'], params['B'], params['C'], params['D']
        return A * np.exp(-B) + C * np.exp(-D)

    def add_efp(self, base_flares, data):
        time = data[0]
        rates = data[1]
        flares = []

        for flare in base_flares:
            flare_propr = {
                'peak_time': time[flare['peak_idx']],
                'peak_rate': rates[flare['peak_idx']],
                'ns': {},
                'lm': {}
            }

            if flare['ns']['is_detected']:
                fl_time = time[flare['ns']['start_idx']:flare['ns']['end_idx']]
                fl_rates = rates[flare['ns']['start_idx']:flare['ns']['end_idx']]
                fit_params = self.efp(fl_time, fl_rates)
                fit_rates = self.fit_efp(fit_params, fl_time)
                flare_propr['ns'] = {
                    'is_detected': True,
                    'time': fl_time,
                    'rates': fl_rates,
                    'fit': fit_rates,
                    'fit_params': fit_params
                }
            else:
                flare_propr['ns'] = {
                    'is_detected': False,
                }

            if flare['lm']['is_detected']:
                fl_time = time[flare['lm']['start_idx']:flare['lm']['end_idx']]
                fl_rates = rates[flare['lm']['start_idx']:flare['lm']['end_idx']]
                fit_params = self.efp(fl_time, fl_rates)
                fit_rates = self.fit_efp(fit_params, fl_time)
                flare_propr['lm'] = {
                    'is_detected': True,
                    'time': fl_time,
                    'rates': fl_rates,
                    'fit': fit_rates,
                    'fit_params': fit_params
                }
            else:
                flare_propr['lm'] = {
                    'is_detected': False,
                }

            flares.append(flare_propr)

        return flares


if __name__ == '__main__':
    lc = LC('../../../ch2_xsm_20211013_v1_level2.lc', 20)

    print(lc.raw_time.shape, lc.processed_lc.shape)

    # plt.plot(lc.sm_time, lc.sm_rates)
    # plt.scatter(lc.sm_time, lc.sm_rates, s=0.01)
    # plt.plot(lc.bin_time, lc.bin_rates)
    # plt.scatter(lc.bin_time, lc.bin_rates, s=0.2)
    # plt.show()

    print(lc.ns_flares)
    print(lc.lm_flares)
    for flare in lc.flares:
        print(flare)
