# -*- coding: utf-8 -*-
"""
Created on Fri Nov 15 23:30:13 2019
@author: Giulio
"""

from Electoral_Montecarlo import Montecarlo_electoral



Seats2018  ={'M5S':221,'Centrosinistra':109,'Centrodestra':260,'LeU':22} #Examples for the graphic part


m = Montecarlo_electoral('2001_italian_general_elections')#Initializing an object of the class

m.import_as_txt('Test/test.txt') # Filling the parameters of the class

m.check_import() #Interpreting correctly the parameter of the class

CS  = m.complete_simulation() #I can roughly see what happens at the end of the simulation in the stoutput

m.graphic(CS) #This is the graphic part. A proper argument is given as an example.


