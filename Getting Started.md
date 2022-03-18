---
tags: [Inter IIT]
title: Getting Started
created: '2022-03-18T16:56:51.173Z'
modified: '2022-03-18T17:38:51.412Z'
---

# Getting Started

#### 1. Uploading the data:
The upload section accepts files with extensions `.lc`, `.ascii`, `.csv` and `.hdf5`. It includes both a **drag-and-drop** as well as an **upload from GUI** feature. **Click submit** to proceed onto the statistical model that determines all the burst properties in the given data.

#### 2. User-defined bin value (optional):
The calibrated light curve data is first smoothened and then resampled before being fed into the statistical model. The latter requires a bin sized to be specified. Large bin sizes reduces the number of available data points while small bin sizes do not effectively remove the noise. A default bin size of 200 has been set. Nevertheless, the user may **adjust the bin sizes** by using the **slider** and recalculate the properties of the bursts.

#### 3. Interpreting the tables:
Astrophysical data is generally obtained with respect to an internal, standardised clock. This presents itself as an offset in the data, which may be in the $\mathcal O(years)$. In the depicted plots, the time on the x-axis is with respect to the start of that particular day, hence, from $0s$ to $86400s$. 

The first column reports the peak time of the burst (with respect to the start of the day). The second column presents some important flare characteristics which include the peak count rate and the class of the solar flare. The machine learning confidence level reports the predicted probability of the identified burst being a true positive. 

The third and fourth column represent the two different algorithms used to identify bursts from the light curve data, i.e., N-sigma algorithm and local maxima algorithm. Finally, the parameter values in the box represent the following:
- (A,B,C,D) are the curve-fit parameters
- $\chi^2$ value is a measure of the goodness of the fit (with values close to 0 being best)
- Decay constant is equivalent to the curve-fit parameter D
- Duration = end time - start time (note that the least count of XSM is 1 second)
- Rise time = peak time - start time
- Decay time = end time - peak time
For more information, please refer the documentation.

Each plot in the table can be sorted according to:
- Peak time
- Peak count rate
- Peak flux
- Peak temperature
- Machine learning confidence level
and the default setting sorts the bursts chornologically by their peak time

#### 4. Discarding flares and training the machine learning model

The identified bursts can be segregated into true and false positives through visual inspection by using the machine learning model. The model can be trained in advance with an appropriate validation data set and can be dynamically trained by submitting the edited list of accepted/rejected flares to the same model.

#### 5. Downloading the final report

The final report can be easily exported to `.pdf` by clicking the download button at the bottom of the page. 
