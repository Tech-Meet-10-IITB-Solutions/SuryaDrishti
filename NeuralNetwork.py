#Imports all the required dependencies
import matplotlib #Hasn't been used explicitly. Can be used for data visualisation when needed
import matplotlib.pyplot as plt
import numpy as np
from keras.models import Sequential
from keras.layers import Dense
from keras.layers import LeakyReLU

class NeuralNetwork():
#n denotes the number of light curve data points, n_hidden_i (i = 1,2) denotes the dimensions of the ith layer. alpha_i (i = 1,2) denotes the leaky slope of the LeakyReLU
  def __init__(self, n, n_hidden_1, n_hidden_2, alpha_1, alpha_2):
    self.model = Sequential()   
    self.model.add(Dense(n_hidden_1, input_dim=3*n + 3))
    self.model.add(LeakyReLU(alpha = alpha_1))
    self.model.add(Dense(n_hidden_2))
    self.model.add(LeakyReLU(alpha = alpha_2))
    self.model.add(Dense(1, activation='sigmoid')) 
    self.model.compile(loss='binary_crossentropy', optimizer='adam', metrics=['accuracy']) 
    self.model.summary() #Provides the summary of the model. Can be commented out. 

  def forward(self, input):
    output = self.model(input)
    return output

  def train(self, training_data, labeled_data, epochs):
    history = self.model.fit(training_data, labeled_data, epochs = epochs, verbose = 1) #verbose provides progress bar. Can be set to 0 if no info needs to be displayed. 
    return history

#Below code is for testing purposes
NN = NeuralNetwork(100, 128, 128, 0.1, 0.1)

training_data = np.random.rand(100, 303)
labeled_data = np.random.randint(0, 2, (100, 1))

history = NN.train(training_data, labeled_data, 20)

output = NN.forward(training_data)
print(output)
