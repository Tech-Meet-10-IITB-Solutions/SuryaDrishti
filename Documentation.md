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
