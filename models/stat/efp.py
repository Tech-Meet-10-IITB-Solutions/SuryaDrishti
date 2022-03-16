import numpy as np

from scipy.optimize import curve_fit
from scipy.special import erf
from scipy.stats import chisquare

# import matplotlib.pyplot as plt


def EFP(x, A, B, C, D):
    Z = (2 * B + C**2 * D) / (2 * C)
    return 1 / 2 * np.sqrt(np.pi) * A * C \
        * np.exp(D * (B - x) + C**2 * D**2 / 4) \
        * (erf(Z) - erf(Z - x / C))


def efp2(time, rates, peak_time):
    non_nan_ids = ~np.isnan(rates)

    popt, pcov = curve_fit(EFP, np.float64(time[non_nan_ids]),
                           np.float64(rates[non_nan_ids]),
                           p0=([np.nanmax(rates), peak_time, 1, 0.2]))

    # print(popt, peak_time)
    # print(rates)
    # plt.scatter(time[non_nan_ids], rates[non_nan_ids])
    # plt.plot(time[non_nan_ids], EFP(time[non_nan_ids], *popt))
    # plt.show()
    # exit(0)

    # try:
    #     chisq, p = chisquare(EFP(np.float64(time[non_nan_ids]), *popt),
    #                      np.float64(rates[non_nan_ids]))
    # except Exception:
    #     chisq = np.nan

    res = {
        'A': popt[0],
        'B': popt[1],
        'C': popt[2],
        'D': popt[3],
        'ChiSq': np.inf,
    }
    # res = {
    #     'A': np.random.rand(),
    #     'B': np.random.rand(),
    #     'C': np.random.rand(),
    #     'D': np.random.rand(),
    #     'ChiSq': np.inf,
    # }
    return res
