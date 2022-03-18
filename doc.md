# Local-Maxima Algorithm
	
The local maxima algorithm is based on **section 3.1 of Gryciuk et al., Solar Physics, 292, 77, 2017.**
It identifies flares from an appropriately smoothed and binned lightcurve by locating points of fast rise as the start of the burst. It then calculates the end time of the flare by looking for subsequent points that fall below the mean background in the flare duration.
	

## Boxcar smoothening

The raw lightcurve needs to be smoothed so that noise spikes are not classified as flares. The smoothening is carried out using a 1D box kernel over patches of length 70. We chose this value to minimize noise while maintaining enough structure to identify all flares. The smoothening is done using astropy Bix1DKernel, which is a f=smoothing filter. Box car averaging reduces statistical noise which improves the data that will be processed by the local maxima algorithm to flag bursts.

## Start of burst

The algorithm looks for a sequence of points such that the slope of the line joining the first and fourth points crosses a cutoff value, set as the average of top N slopes in the lightcurve. The cutoff is set dynamically according to the input data by checking the number of flares detected. This method works since a lower cutoff results in a large number of false positives, on the occurrence of which the cutoff is immediately switched to high. 
Since many consecutive points in the rise of the flare will satisfy the cutoff condition, the first point flagged is set as the start of the flare. 
Hence, we obtain a list of all burst start times in the input lightcurve file, which is used to estimate the peak and end time of the burst.


## End of burst

We begin by obtaining an estimate of the peak time of the flare by looking for consecutive decreases of 4 points. Once the approximate peaks are obtained, the first point between the peak time of the current burst and start time of the next burst which falls below the mean background is flagged as the end of flare. 
A linear fit estimates the background value to the lightcurve with flares removed. If the count rate doesn't fall below the background rate, which can happen towards the end of the count rate array, the end time is set to the first local minima after the peak.
