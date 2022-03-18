## N-sigma

The N-sigma method flags count rates above a certain threshold. It is a relatively simple statistical detection technique, which first calculates the mean ($\mu$) and the standard deviation ($\sigma$) by using the `astropy.stats.sigma_clipped_stats` function. This is an iterative algorithm which calculates the median and standard deviation of the input, clips all values which are $3\sigma$ above the median, and repeats till (a) the last clip clips nothing or (b) number of iterations exceeds `maxiters` 

Once the `sigma_clipped_stats` function returns the mean and standard deviation ($\mu$, $\sigma$) of the data, we flag all points which have count rates $>\mu + N\sigma$, where $N$ is the parameter of interest. 

## EFP

The overall time profile of a solar flare can be described (Gryciuk 2017) as a convolution of two functions $$f(t) = \int_0^t g(x)h(t-x)dx $$

where 
$$g(x) = A \exp({-(x-B)^2}/{C^2})$$
 is the heating (energy deposition) function , and 
$$h(x) = \exp(-Dx)$$
is the energy dissipation function. The closed form of the flare's time profile is 
$$f(t) = \frac{\sqrt{\pi}}{2}AC \left(\exp{D(B-t) + \frac{C^2D^2}{4}}\right) \left(erf(Z) -  erf\left(Z-\frac{t}{C}\right)\right)$$

The above curve with 4 parameters is fit to the burst using `scipy.optimize.curve_fit`. The fit is sensitive to the initial parameters `A0, B0, C0, D0`. `A0` and `C0` contribute to the amplitude of the burst, `B0` changes the peak location (in time), while `D0` decides the time needed for the burst to decay. Accordingly, rough initial estimates are used to initialize the above.

Using premultiplying factors such as 
    
    A0=1, B0=1, C0=1, D0=0.1
helps in tuning the fit

    
    A0 *= (max(rates_burst))**(1/2) 
    B0 *= time_burst[np.argmax(rates_burst)]
    C0 *= (max(rates_burst))**(1/2)
    D0 *= (time_burst[-1] - B0)/(time_burst[-1] - time_burst[0])

Additionally, `C0` and `D0` are not exactly the above, so we try to fit the curve to the burst with different values of each, and select the parameters returned by `scipy.optimize.curve_fit` with the lowest $\chi^2$ score.
