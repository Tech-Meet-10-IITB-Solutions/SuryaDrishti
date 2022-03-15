## N-sigma

The N-sigma method flags count rates above a certain threshold. It is a relatively simple statistical detection technique, which first calculates the mean ($\mu$) and the standard deviation ($\sigma$) by using the `astropy.stats.sigma_clipped_stats` function. This is an iterative algorithm which calculates the median and standard deviation of the input, clips all values which are $3\sigma$ above the median, and repeats till (a) the last clip clips nothing or (b) number of iterations exceeds `maxiters` 

Once the `sigma_clipped_stats` function returns the mean and standard deviation ($\mu$, $\sigma$) of the data, we flag all points which have count rates $>\mu + N\sigma$, where $N$ is the parameter of interest. 



