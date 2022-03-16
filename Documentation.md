# B76 | ISRO | SNN Documentation

## Current Neural Network

### Online Machine Learning

The idea that we are trying to utilize here is that of **Online Machine Learning**. An online machine learning model is not very different from the regular machine learning models we talk about if we look at the architecture. The method of training is the one thing that is very different in both. The regular machine learning models utilize *batch learning* whereas in online learning we make use of *online* or *continuous* learning. 

In batch learning, a large amount of data is fed into the machine learning model and the neural network is trained on all the data together. In online learning, not all of the data is fed into the neural network at once, but one by one, as and when the data is received. 
This can be very useflul under two different situations:

- The system that the neural network is being trained on has limited memory capacity and it cannot be trained on all of the data together. Using online learning, the neural network can be trained on smaller datasets, one-by-one.
- The data that the neural network is supposed to be trained on is continuously evolving. If one was to train the neural network on the currently available dataset, there is a high chance that in some time, the model will become redundant. This is because it will not be aware of the newer data available. This is especially true in the case of highly erratic variables like stock prices and consumer preferences. 

In the case of solar flare data, we do not have a huge amount of data available. And even the data that is available, is unlabelled. This makes the task of training a machine learning model very difficult. The way online learning helps us is in the following manner: 

-  Using online learning, we can obtain trained data, albeit indirectly. Experts can visually inspect and determine if a light curve corresponds to a solar flare or not. The web application that is being developed allows the experts to log in and label the available light curves. This labelled data can then be used to train the machine learning model that has been created. Since we do not have a initially labelled set of data, we have no choice but to use online learning and make the model learn step by step. 
- As we keep on obtaining newer data with the passing of time, our model will be able to learn from all the new data that is being fed into it and will not remain stagnant.

### Model Architecture

The model utilizes a neural network architecture. The architecture can be understood using the following graph: 
*image*

The activation function between layers 1 and 2, and layers 2 and 3 is the Leaky Rectified Linear Unit function. It brings about some non-linearity to our neural network and allows it to better approximate complicated relationships between the inputs and the output. 

The final activation function, between layers 3 and the output is a sigmoid function, which converts the numerical value obtaind as the output of layer 3 into a probability - the probability of the input being a solar flare. 

The optimizer that we have utilized is Stochastic Gradient Descent (SGD). The reason we chose SGD over other, more advanced optimizers like Adam (Adaptive Momentum Estimation) and RMSProp, is simply that our online training needs to be faster, and also should not rely on large amounts of data. Adam and RMSProp work well when one is performing batch training on a huge dataset with multiple input parameters. In smaller datasets, like in our case, Adam can lead to overfitting. Also, we cannot control the learning rate in these algorithms. Using SGD, we can control the learning rate directly and therefore utilize the concept of *decay*.

The word decay is used in its literal sense here - the learning rate of the optimizer decays or grows smaller as we train the model more and more. This ensures that the model is less and less senstive to data that we introduce over time and retains memory of what it has been taught before. If we did not make use of this, our model would try to *unlearn* what it has learn before and would want to fit the new data that it is being trained on perfectly. With hyperparameter tuning, we can make sure that the *learning* is at a decent pace - neither too fast, nor too slow. 

The loss function is a binary cross entropy loss function. Since the problem is that of a binary classification (solar flare and not a solar flare), it makes sense to use the binary cross entropy function.

### Model Parameters

The model has certain internal parameters. They are listed down below: 
- n = number of data points being sampled from every light curve.
- sigma = controls the sensitivity of the porbability to the output of layer 3 of the neural network.
- value = decides the starting probability of the light curve detection
- alpha = decides the slope of the LeakyReLU activation function whenever x < 0
- a, b, c = parameters controlling the learning rate of the ML model. 

### Issues with the model and ways to improve it

There are multiple ways we can improve the ML model to obtain better results.

- The neural network hyperparameters can be tuned better using multiple algorithms available online. These hyperparameter tuning methods are somewhat complex and therefore have not been utilized here.
- Rather than make use of supervised learning, like we have made here, we can also make use of unsupervised learning and let the machine learning model categorise available light curves into categories. This might result in us discovering new features and also improving the classification problem.
- Our current model is not *adaptive* i.e. even if it detects changes in the trend of the data being fed into it, it will be unable to steer the parameters quickly towards this change in trend and therefore might take longer time to adapt to the new trend. In the case of solar flares and the obtained light curves, this should not be a problem since we do not expect the solar flare activity and its representation in the light curve to change drastically with time. - Semi-supervised learning is a relatively newer algorithm of machine learning where in the ideas of both supervised and unsupervised learning are utilized. Herein, the model is provided with a dataset which has only a small number of labeled data. The remaining data is unlabeled. The algorithms ensures that the model learns from the labeled dataset and applies the information obtained from the labeled dataset in characterizing the unlabeled dataset. Basically, we nudge the machine learning model in the correct direction using the labeled dataset and then let it perform the task of classification of the unlabeled dataset from what it has learnt from the labeled dataset. 
