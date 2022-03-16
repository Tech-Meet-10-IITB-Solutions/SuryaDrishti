from astropy.io import fits
from astropy.convolution import convolve, Box1DKernel

import numpy as np

from scipy.stats import linregress

# import matplotlib.pyplot as plt

<<<<<<< HEAD
from .efp import EFP, efp2
=======
from .efp import EFP, efp
>>>>>>> master
from .prop import calc_flux, find_flare_class, calc_temperature, calc_EM
from .lm import local_maxima


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

        self.day_start = self.bin_time[0]
        self.processed_lc = np.array([self.bin_time - self.day_start, self.bin_rates])

        self.ns_flares = self.lm(self.processed_lc[0], self.processed_lc[1])
        self.lm_flares = self.lm(self.processed_lc[0], self.processed_lc[1])

        self.flares = self.merge_flares(self.ns_flares, self.lm_flares)

        self.bg_params = self.bg_fit(self.processed_lc, self.flares)

        self.flares = self.add_efp(self.flares, self.processed_lc, self.bg_params)

        self.flares = self.add_char(self.flares)

        self.ml_data_list = self.add_ml_data(self.flares, self.processed_lc)

    def get_lc(self):
        time, rates = self.processed_lc[:, ~np.isnan(self.processed_lc[1])]

        res = {
            'start': float(self.day_start),
            'flare_count': len(self.flares),
            'lc_data': [
                {'x': round(x), 'y': round(y)}
                for x, y in zip(time, rates)
            ]
        }
        return res

    def get_flares(self):
        res = []

        for flare in self.flares:
            # if flare['ns']['is_detected']:
            #     ns = {
            #         'is_detected': True,
            #     }
            # else:
            ns = {
                'is_detected': False
            }

            lm = {
                'is_detected': False,
            }

            res.append({
                'peak_time': int(flare['peak_time']),
                'peak_rate': round(flare['peak_rate']),
                'bg_rate': round(flare['bg_rate']),
                'class': flare['class'],
                'peak_flux': float(flare['peak_flux']),
                'peak_temp': float(flare['peak_temp']),
                'peak_em': float(flare['peak_em']),
                'ns': ns,
                'lm': lm,
            })
        return res

    def get_ml_data(self):
        return self.ml_data_list

    def load_lc(self, lc_path):
        lc = fits.open(lc_path)
        rates = lc[1].data['RATE']
        time = lc[1].data['TIME']
        return time, rates

    def smoothen(self, time, rates, box_bin, kernel_size):
        box_time, box_count = np.array([]), np.array([])
        for i in range(len(time[:]) // box_bin):
            if box_bin * i + i <= len(rates):
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

    def rebin_lc(self, time, rates, t_bin, t_bin_new):
        def bin_edges_from_time(time, t_bin):
            time = np.array(time)
            bin_edges = (time[1:] + time[:-1]) / 2.0
            bin_edges = np.insert(bin_edges, 0, bin_edges[0] - t_bin)
            bin_edges = np.append(bin_edges, bin_edges[-1] + t_bin)
            return bin_edges

        new_time = np.arange(time[0] - t_bin / 2 + t_bin_new / 2,
                             time[-1] + t_bin / 2 + t_bin_new / 2, t_bin_new)
        bin_edges = bin_edges_from_time(new_time, t_bin_new)

        bin_counts = np.histogram(time, bins=bin_edges, weights=rates)[0]
        bin_widths = np.histogram(time, bins=bin_edges, weights=np.ones_like(rates))[0]

        bin_rates = np.nan * bin_widths
        bin_rates[bin_widths != 0] = bin_counts[bin_widths != 0] / bin_widths[bin_widths != 0]

        return new_time, bin_rates

    def ns(self, time, rates):
        np.random.seed(0)
        flares = []
        sampled = sorted(np.random.choice(range(len(time)), size=10, replace=False))
        for i in range(0, len(sampled), 2):
            peak_time = sampled[i] + np.nanargmax(rates[sampled[i]:sampled[i + 1]])
            flares.append([sampled[i], sampled[i + 1], peak_time])
        return flares

    # def lm(self, time, rates):
    #     np.random.seed(0)
    #     flares = []
    #     sampled = sorted(np.random.choice(range(len(time)), size=12, replace=False))
    #     for i in range(0, len(sampled), 2):
    #         peak_time = sampled[i] + np.nanargmax(rates[sampled[i]:sampled[i + 1]])
    #         flares.append([sampled[i], sampled[i + 1], peak_time])
    #     return flares

    def lm(self, time, rates):
        flares = []
        start_ids, end_ids = local_maxima(time, rates)
        for i in range(len(start_ids)):
            peak_idx = start_ids[i] + np.nanargmax(rates[start_ids[i]:end_ids[i]])
            flares.append([start_ids[i], end_ids[i], peak_idx])
        return flares

    def merge_flares(self, ns_flares, lm_flares):
        flares = []
        for flare in ns_flares:
            flare_base = {
                'peak_idx': flare[2],
                'start_idx': flare[0],
                'end_idx': flare[1],
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
                if flare[2] == flare_old['peak_idx']:
                    flare_old['lm']['is_detected'] = True
                    flare_old['lm']['start_idx'] = flare[0]
                    flare_old['lm']['end_idx'] = flare[1]

                    flare_old['start_idx'] = min(flare_old['start_idx'], flare[0])
                    flare_old['end_idx'] = max(flare_old['end_idx'], flare[1])

                    found = True
                    break

            if not found:
                flare_base = {
                    'peak_idx': flare[2],
                    'start_idx': flare[0],
                    'end_idx': flare[1],
                    'ns': {},
                    'lm': {}
                }

                flare_base['ns']['is_detected'] = False

                flare_base['lm']['is_detected'] = True
                flare_base['lm']['start_idx'] = flare[0]
                flare_base['lm']['end_idx'] = flare[1]

                flares.append(flare_base)

        return flares

    def bg_fit(self, data, flares):
        time = data[0]
        rates = data[1].copy()

        for flare in flares:
            rates[flare['start_idx']:flare['end_idx']] = np.nan

        not_nan_ids = ~np.isnan(rates)

        if np.sum(not_nan_ids):
            slope, intercept, _, _, _ = linregress(time[not_nan_ids], rates[not_nan_ids])
        else:
            slope, intercept, _, _, _ = linregress(time, rates)

        return (slope, intercept)

    def fit_efp(self, params, time):
        A, B, C, D = params['A'], params['B'], params['C'], params['D']
        return EFP(time, A, B, C, D)

    def add_efp(self, flares, data, bg_params):
        time = data[0]
        rates = data[1]
        slope, intercept = bg_params
        flares_new = []

        for flare in flares:
            flare_prop = {
                'peak_time': time[flare['peak_idx']],
                'peak_rate': rates[flare['peak_idx']],
                'bg_rate': intercept + slope * time[flare['peak_idx']],
                'start_idx': flare['start_idx'],
                'end_idx': flare['end_idx'],
                'peak_idx': flare['peak_idx'],
                'ns': {},
                'lm': {}
            }
            flare_prop['ratio'] = flare_prop['peak_rate'] / flare_prop['bg_rate']

            if flare['ns']['is_detected']:
                fl_time = time[flare['ns']['start_idx']: flare['ns']['end_idx']]
                fl_rates = rates[flare['ns']['start_idx']: flare['ns']['end_idx']]
                fl_duration = fl_time[-1] - fl_time[0]
                fit_params = efp2(fl_time, fl_rates, flare_prop['peak_time'])
                fit_rates = self.fit_efp(fit_params, fl_time)
                flare_prop['ns'] = {
                    'is_detected': True,
                    'start_idx': flare['ns']['start_idx'],
                    'end_idx': flare['ns']['end_idx'],
                    'duration': fl_duration,
                    'fit': fit_rates,
                    'fit_params': fit_params
                }
            else:
                flare_prop['ns'] = {
                    'is_detected': False,
                }

            if flare['lm']['is_detected']:
                fl_time = time[flare['lm']['start_idx']:flare['lm']['end_idx']]
                fl_rates = rates[flare['lm']['start_idx']:flare['lm']['end_idx']]
                fl_duration = fl_time[-1] - fl_time[0]
                fit_params = efp2(fl_time, fl_rates, flare_prop['peak_time'])
                fit_rates = self.fit_efp(fit_params, fl_time)
                flare_prop['lm'] = {
                    'is_detected': True,
                    'start_idx': flare['lm']['start_idx'],
                    'end_idx': flare['lm']['end_idx'],
                    'duration': fl_duration,
                    'fit': fit_rates,
                    'fit_params': fit_params
                }
            else:
                flare_prop['lm'] = {
                    'is_detected': False,
                }

            flares_new.append(flare_prop)

        return flares_new

    def add_char(self, flares):
        for flare in flares:
            flux = calc_flux(flare['peak_rate'])
            flare['peak_flux'] = flux
            flare['class'] = find_flare_class(flux)
            flare['peak_temp'] = calc_temperature(flux)
            flare['peak_em'] = calc_EM(flux)

        return flares

    def add_ml_data(self, flares, data):
        ml_data_list = []
        for flare in flares:
            processed_lc = data[:, flare['start_idx']:flare['end_idx']]
            processed_lc = processed_lc[:, ~np.isnan(processed_lc[1])]

            if flare['ns']['is_detected']:
                params_ns = {
                    'is_detected': True,
                    'start_time': data[0][flare['ns']['start_idx']],
                    'end_time': data[0][flare['ns']['end_idx']],
                    'fit_params': flare['ns']['fit_params'],
                }
            else:
                params_ns = {
                    'is_detected': False,
                    'bg_rate': flare['bg_rate'],
                    'fit_params': {
                        'ChiSq': np.inf
                    }
                }

            if flare['lm']['is_detected']:
                params_lm = {
                    'is_detected': True,
                    'start_time': data[0][flare['lm']['start_idx']],
                    'end_time': data[0][flare['lm']['end_idx']],
                    'fit_params': flare['lm']['fit_params'],
                }
            else:
                params_lm = {
                    'is_detected': False,
                    'bg_rate': flare['bg_rate'],
                    'fit_params': {
                        'ChiSq': np.inf
                    }
                }

            snr = flare['peak_rate'] / np.std(processed_lc[1])

            ml_data_list.append({
                'processed_lc': processed_lc,
                'params_ns': params_ns,
                'params_lm': params_lm,
                'snr': snr,
            })

        return ml_data_list


if __name__ == '__main__':
    lc = LC('../../backend/input/ch2_xsm_20211013_v1_level2.lc', 20)

    print(lc.raw_time.shape, lc.processed_lc.shape)
    # plt.plot(lc.sm_time, lc.sm_rates)
    # plt.scatter(lc.sm_time, lc.sm_rates, s=0.01)
    # plt.plot(lc.bin_time, lc.bin_rates)
    # plt.scatter(lc.bin_time, lc.bin_rates, s=0.2)

    # slope, intercept = lc.bg_params
    # plt.plot(lc.sm_time, slope * lc.sm_time + intercept)

    # plt.show()

    # print(lc.flares[-1])
    print(lc.get_flares()[-1].keys())
    print(lc.processed_lc[0] - lc.processed_lc[0][0])
    print(lc.get_lc().keys())
    print(len(lc.flares))
    for flare in lc.flares:
        print(flare['ns'])
