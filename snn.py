import numpy as np

from scipy.interpolate import CubicSpline
from scipy.special import erf

import os
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'

import tensorflow as tf

from keras.models import load_model
from keras.layers import LeakyReLU
from keras.layers import Dense
from keras.models import Sequential
from keras import initializers

tf.device('cpu:0')


class SNN():
    def __init__(self):
        self.n = 10

        self.model = Sequential()
        self.model.add(Dense(128, input_dim=3 * self.n + 3, name = 'layer1'))
        self.model.add(LeakyReLU(alpha=0.1))
        self.model.add(Dense(128, name = 'layer2'))
        self.model.add(LeakyReLU(alpha=0.1))
        self.model.add(Dense(1, activation='sigmoid', name = 'layer3'))
        self.model.compile(loss='binary_crossentropy', optimizer='adam', metrics=['accuracy'])
        self.model.summary()

    def forward(self, input):
        output = self.model(input)
        return output

    def save(self, path_loc):
        self.model.save(path_loc, include_optimizer=True, save_format='h5')

    def load(self, arg):
        if arg == 'checkpoint':
            self.model = load_model('checkpoint')
        else:
            self.model = load_model('base')

    def interpolate(self, processed_data):
        spline = CubicSpline(processed_data[0], processed_data[1], extrapolate=True)

        start_time, end_time = processed_data[0][0], processed_data[0][-1]
        x = np.linspace(start_time, end_time, num=self.n, endpoint=True)

        return spline(x)

    def EFP(self, A, B, C, D, start_time, end_time):
        x = np.linspace(start_time, end_time, num=self.n, endpoint=True)

        Z = (2 * B + C**2 * D) / (2 * C)
        EFP_fit = (0.5 * np.sqrt(np.pi) * A * C) \
            * np.exp(D * (B - x) + C**2 * D**2 / 4) \
            * (erf(Z) - erf(Z - x / C))
        return EFP_fit

    def train(self, processed_data, parameters_ns, parameters_lm, snr, labeled_data, epochs):
        A_ns, B_ns, C_ns, D_ns, start_time_ns, end_time_ns, chisq_ns = parameters_ns
        A_lm, B_lm, C_lm, D_lm, start_time_lm, end_time_lm, chisq_lm = parameters_lm

        processed_fit = self.interpolate(processed_data)
        ns_fit = self.EFP(A_ns, B_ns, C_ns, D_ns, start_time_ns, end_time_ns)
        lm_fit = self.EFP(A_lm, B_lm, C_lm, D_lm, start_time_lm, end_time_lm)

        training_data = np.concatenate(
            (processed_fit, ns_fit, lm_fit, 1/chisq_ns, 1/chisq_lm, snr), axis=1)

        history = self.model.fit(training_data, labeled_data,
                                 epochs=epochs, verbose=1, batch_size=1)
        return history

    def create_base(self):
        ones_initializer = tf.keras.initializers.Ones()
        zeros_initializer = tf.keras.initializers.Zeros()
        self.model.layer3 = Dense(1, kernel_initializer = zeros_initializer, bias_initializer = ones_initializer)
        self.save('base')

if __name__ == '__main__':
    model = SNN()
