# -*- coding: utf-8 -*-
"""
Created on Fri Nov 15 23:30:13 2019
@author: Giulio
"""
import numpy as np
from Electoral_Montecarlo import Montecarlo_electoral
import matplotlib.pylab as plt


Seats2018  ={'M5S':221,'Centrosinistra':109,'Centrodestra':260,'LeU':22} #excluding abroad seats


m = Montecarlo_electoral('txt','test.txt')
m.Import_Results()

m.check_input()
m.Complete_Simulation()
m.Graphics(Seats2018)


