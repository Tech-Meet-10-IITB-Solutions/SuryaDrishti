import numpy as np

from scipy.optimize import curve_fit
from scipy.special import erf
from scipy.stats import chisquare


def EFP(x, A, B, C, D):
    Z = (2 * B + C**2 * D) / (2 * C)
    return 1 / 2 * np.sqrt(np.pi) * A * C \
        * np.exp(D * (B - x) + C**2 * D**2 / 4) \
        * (erf(Z) - erf(Z - x / C))


def efp(time, rates, peak_time):
    non_nan_ids = ~np.isnan(rates)

    popt, pcov = curve_fit(EFP, np.float128(time[non_nan_ids]),
                           np.float128(rates[non_nan_ids]),
                           p0=([25, peak_time, 17, 0.1]))

    try:
        chisq, p = chisquare(EFP(np.float128(time[non_nan_ids]), *popt),
                             np.float128(rates[non_nan_ids]))
    except Exception:
        chisq = np.nan

    res = {
        'A': popt[0],
        'B': popt[1],
        'C': popt[2],
        'D': popt[3],
        'ChiSq': chisq,
    }
    return res
