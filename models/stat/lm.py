from astropy.stats import sigma_clipped_stats as scs

import numpy as np


def local_maxima(time, rates):
    length = 200
    st_nr = rates[4:] - rates[:-4]
    st_dr = time[4:] - time[:-4]
    st_cutoff = np.average(np.sort(np.divide(st_nr, st_dr))[-1 * length:])
    print(st_cutoff)
    st_flags = np.array(np.where(np.divide(st_nr, st_dr) > st_cutoff))
    print('cutoff : ', np.average(np.sort(np.divide(st_nr, st_dr))[-1 * length:]))

    new_st_flags = [st_flags[0][0]]
    for i in range(len(st_flags[0]) - 1):
        if st_flags[0][i + 1] - st_flags[0][i] > 20:
            new_st_flags.append(st_flags[0][i + 1])

    peak_flags = []

    for i in range(len(new_st_flags)):
        peak = rates[new_st_flags[i]:]
        pk_nr = peak[4:]
        pk_dr = peak[:-4]
        peak_flags.append(new_st_flags[i] + np.where(np.divide(pk_nr, pk_dr) < 1)[0][5])

    def bk_avg():
        iter_counts = np.copy(rates)
        iter = 5
        n = 0.8
        for i in range(iter):
            mean, med, sig = scs(iter_counts)
            iter_counts[iter_counts > mean + n * sig] = mean + n * sig
        mean, med, sig = scs(iter_counts)
        return mean + 3 * sig

    cut = bk_avg()

    def find_end(rates, mean):
        if len(np.where(rates < mean)[0]) != 0:
            end_time = np.where(rates < mean)[0][0]
        else:
            end_time = np.argmin(rates)
        return end_time

    end_flags = []

    for i in range(len(peak_flags)):
        if i != len(peak_flags) - 1:
            end_flags.append(
                peak_flags[i] + find_end(rates[peak_flags[i]:new_st_flags[i + 1]], cut))
        else:
            end_flags.append(peak_flags[i] + find_end(rates[peak_flags[i]:], cut))

    return new_st_flags, end_flags