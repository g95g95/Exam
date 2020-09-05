# -*- coding: utf-8 -*-
"""
Created on Thu Nov 14 23:03:10 2019
@author: Giulio
"""

import pytest
import numpy as np
import random as rd
import Electoral_Montecarlo
from hypothesis import given
import hypothesis.strategies as st

Results2018={'M5S':0.327,'Centrodestra':0.375,'Centrosinistra':0.22,'LeU':0.03}
#ResultsHyp ={'Movimento 5 stelle':0.18,'Centrosinistra':0.20,'Lega':0.35,'Centrodestra':0.15}
Seats2018  ={'M5S':221,'Centrosinistra':113,'Centrodestra':260,'LeU':14} #excluding abroad seats






def test_max_key(): #key with the max value in a dictionary
	examples1 = dict([('A',400),('B',200),('C',400),('D',300)])
	examples2 = dict([('A',''),('B',''),('C',''),('D','')])
	mk1       = Electoral_Montecarlo.max_key(examples1)
	assert (mk1 == ['A','C']) #the function returns a list of these two elements.
	#with pytest.raises(ValueError):
	#	mk2       = Electoral_Montecarlo.max_key(examples2)
		
		
		
		





def test_constructor_Montecarlo(): #testing for the proper initializion of the object of the class.
	m = Electoral_Montecarlo.Montecarlo_electoral()
	assert m.election == 'Italian_2018_General_Election'
	
	
	
	
def test_import_as_txt(): #testing if the input files exist
	m = Electoral_Montecarlo.Montecarlo_electoral()
	m.import_as_txt('test.txt')
	assert m.Results == Results2018 #Comparing the two alleged similar dictionaries


def test_import_as_excel():
	m = Electoral_Montecarlo.Montecarlo_electoral()
	m.import_as_excel('Prova.xls')
	assert m.Results == Results2018 
	
	
	
def test_check_import(): #Testing if the imported data can be used or not
	m = Electoral_Montecarlo.Montecarlo_electoral()

	m.Parties = ['Pd','Pd','Lega','FDI'] #Two parties with the same name, impossible
	
	with pytest.raises(ValueError):
		m.check_import()


	m.Propval = [0.2,0.3,0.5,0.1] #Results are not consistent
	with pytest.raises(ValueError):
		m.check_import()
	
	m.import_as_txt('test.txt')
	assert m.check_import() == True #We can see here that our check returns True when everyrhing is properly written
	
		
		
@given(x = st.integers())
def test_Fill_Seats(x): #with this we prove that the algorithm is independent on the prop coefficients and on the majority coefficients
	m = Electoral_Montecarlo.Montecarlo_electoral()
	m.Results = {'A':0.33,'B':0.15,'C':0.27,'D':0.25}
	if (x>0 and x<10000000): #Of course I don't look for high values (Approximations could be a problem as we approach infinity. Besides it would make a no sense a Parliament made of 100000000 people)
		m.Majorcoef = float(1/x)
		m.Propcoef  = 1-float(1/x)
		m.Ndeputies = x
		assert sum(m.Fill_Seats().values()) <= m.Ndeputies
	



#I have proven that it is ok for any results, for any number of total deputates and for the coefficients Major and Prop.
def test_Complete_Simulation():
	m = Electoral_Montecarlo.Montecarlo_electoral()
	m.Results = Results2018

	s         = m.Complete_Simulation()
	for i in s.keys():
		assert  np.abs(s[i]-Seats2018[i])<12 #I want to proof that the function works because it converges to a value very close to the real one.
		
	

	
	
	