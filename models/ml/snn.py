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
        self.model.add(Dense(128, input_dim=3 * self.n + 3, name='layer1'))
        self.model.add(LeakyReLU(alpha=0.1))
        self.model.add(Dense(128, name='layer2'))
        self.model.add(LeakyReLU(alpha=0.1))
        self.model.add(Dense(1, activation='sigmoid', name='layer3'))
        self.model.compile(loss='binary_crossentropy', optimizer='adam', metrics=['accuracy'])
        self.model.summary()

    def forward(self, input):
        output = self.model(input)
        return output

    def create_base(self):
        ones_initializer = initializers.Ones()
        zeros_initializer = initializers.Zeros()
        self.model.layer3 = Dense(1, kernel_initializer=zeros_initializer,
                                  bias_initializer=ones_initializer)
        self.save('base')

    def save(self, path_loc):
        self.model.save(path_loc, include_optimizer=True, save_format='h5')

    def load(self, arg):
        if arg == 'checkpoint':
            self.model = load_model('checkpoint')
        else:
            self.model = load_model('base')

    def interpolate(self, processed_lc):
        spline = CubicSpline(processed_lc[0], processed_lc[1], extrapolate=True)

        start_time, end_time = processed_lc[0][0], processed_lc[0][-1]
        x = np.linspace(start_time, end_time, num=self.n, endpoint=True)

        return spline(x)

    def EFP(self, params):
        if params['is_detected']:
            x = np.linspace(params['start_time'], params['end_time'], num=self.n, endpoint=True)
            A = params['fit_params']['A']
            B = params['fit_params']['B']
            C = params['fit_params']['C']
            D = params['fit_params']['D']

            Z = (2 * B + C**2 * D) / (2 * C)
            EFP_fit = (0.5 * np.sqrt(np.pi) * A * C) \
                * np.exp(D * (B - x) + C**2 * D**2 / 4) \
                * (erf(Z) - erf(Z - x / C))
            return EFP_fit
        else:
            return np.ones((self.n,)) * params['bg_rate']

    def train(self, data_list, labels, epochs):
        training_data = []
        for data in data_list:
            processed_fit = self.interpolate(data['processed_data'])
            ns_fit = self.EFP(data['params_ns'])
            lm_fit = self.EFP(data['params_lm'])
            snr = data['snr']
            ns_chisq = data['params_ns']['fit_params']['chiSq']
            lm_chisq = data['params_lm']['fit_params']['chiSq']

            training_data.append(np.concatenate((processed_fit,
                                                 ns_fit,
                                                 lm_fit,
                                                 1 / ns_chisq,
                                                 1 / lm_chisq,
                                                 snr), axis=1))

        bs = min(32, len(training_data))
        history = self.model.fit(training_data, labels, epochs=epochs, verbose=1, batch_size=bs)
        return history

    def get_conf(self, data):
        processed_fit = self.interpolate(data['processed_data'])
        ns_fit = self.EFP(data['params_ns'])
        lm_fit = self.EFP(data['params_lm'])
        snr = data['snr']
        ns_chisq = data['params_ns']['fit_params']['chiSq']
        lm_chisq = data['params_lm']['fit_params']['chiSq']

        input_data = np.concatenate((processed_fit,
                                     ns_fit,
                                     lm_fit,
                                     1 / ns_chisq,
                                     1 / lm_chisq,
                                     snr), axis=1)

        return self.forward(input_data)


if __name__ == '__main__':
    model = SNN()
