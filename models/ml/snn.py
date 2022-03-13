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

tf.device('cpu:0')


class SNN():
    def __init__(self):
        self.n = 10

        self.model = Sequential()
        self.model.add(Dense(128, input_dim=3 * self.n + 3))
        self.model.add(LeakyReLU(alpha=0.1))
        self.model.add(Dense(128))
        self.model.add(LeakyReLU(alpha=0.1))
        self.model.add(Dense(1, activation='sigmoid'))
        self.model.compile(loss='binary_crossentropy', optimizer='adam', metrics=['accuracy'])
        self.model.summary()

    def forward(self, input):
        output = self.model(input)
        return output

    def save(self, path_loc):
        self.model.save(path_loc, optimizer=True, save_format='h5')

    def load(self, path_loc):
        self.model = load_model(path_loc)

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
            (processed_fit, ns_fit, lm_fit, chisq_ns, chisq_lm, snr), axis=1)

        history = self.model.fit(training_data, labeled_data,
                                 epochs=epochs, verbose=1, batch_size=1)
        return history


if __name__ == '__main__':
    model = SNN()
