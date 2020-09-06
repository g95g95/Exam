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
from hypothesis import settings

Results2018={'M5S':0.327,'Centrodestra':0.375,'Centrosinistra':0.22,'LeU':0.03}
Seats2018  ={'M5S':221,'Centrosinistra':113,'Centrodestra':260,'LeU':14} #excluding abroad seats






def test_max_key():
	"""
	This test verifies that if max_key has a dictionary with two keys sharing
	the same values which is also the highest value of the dictionary, then it
	will return a list of such two keys.

	Returns
	-------
	None.

	"""
	examples1 = {'A':400,'B':200,'C':400,'D':300}
	mk1       = Electoral_Montecarlo.max_key(examples1)
	assert (mk1 == ['A','C']) #the function returns a list of these two elements.
	with pytest.raises(ValueError):
		mk2       = Electoral_Montecarlo.max_key({})
		
		
		
		





def test_constructor_Montecarlo(): 
	"""
	
	This test makes sure that all the paremeters of the class Montecarlo_electoral
	are initialized with their default value.
	
	"""
	m = Electoral_Montecarlo.Montecarlo_electoral()
	#testing the proper initializion of the default parameter.
	assert m.election == 'Italian_2018_General_Election'
	assert m.Propcoef ==  0.61
	assert m.Majorcoef==  0.37
	assert m.Ndeputies==  630
	
	
	
def test_import_as_txt(): 
	"""
	
	This test function tests the efficienct of data acquiring from a txt file.
	The Results stored in a dictionary form are then compared with the results
	I expect to import.

	Returns
	-------
	None.

	"""
	m = Electoral_Montecarlo.Montecarlo_electoral()
	m.import_as_txt('Test/test.txt')
	#Comparing the two alleged similar dictionaries
	assert m.Results == Results2018 


def test_import_as_excel():
	"""
	
	This test function tests the efficienct of data acquiring from a txt file.
	The Results stored in a dictionary form are then compared with the results
	I expect to import.
	
	Returns
	-------
	None.
	"""
	m = Electoral_Montecarlo.Montecarlo_electoral()
	m.import_as_excel('Test/test.xls')
	#Comparing the two alleged similar dictionaries
	assert m.Results == Results2018 
	
	
	
def test_check_import():
	"""
	
	This test function checks if the ValueErrors in case of inconsistent acquired
	data are actually raised.

	Returns
	-------
	None.

	"""
	m = Electoral_Montecarlo.Montecarlo_electoral()

	m.Parties = ['Pd','Pd','Lega','FDI']
	#Results are not consistent: two parties with the same name, impossible
	with pytest.raises(ValueError):
		m.check_import()

	#Results are not consistent: The sum is larger than 1
	m.Propval = [0.2,0.3,0.5,0.1] 
	with pytest.raises(ValueError):
		m.check_import()
	
	#Results are not consistent: The coefficients'sum is larger than 1
	m.Propcoef,m.Majorcoef = [0.5,0.6]
	with pytest.raises(ValueError):
		m.check_import()
	
	
	m.import_as_txt('Test/test.txt')
	#We can see here that our check returns True when everyrhing is properly written
	assert m.check_import() == True 
		
		
@given(x = st.integers())
@settings(max_examples=20)
def test_fill_feats(x):
	"""
	
	This test verifies that the algorithm of fill_seats() is independent on the
	prop / maj coefficients and on the number of deputates.
	
	Returns:
	-------
	None
	
	"""
	
	
	m = Electoral_Montecarlo.Montecarlo_electoral()
	m.Results = {'A':0.33,'B':0.15,'C':0.27,'D':0.25}
	
	#Of course I don't look for high values (Approximations could be a problem as we approach infinity.
	#Besides it would make  no sense a Parliament made of 100000000 people)
	if (x>1 and x<10000000): 
		m.Majorcoef = float(1/x)
		m.Propcoef  = 1-float(1/x)
		m.Ndeputies = x
		#The number of assigned seats is not larger than the number of deputates
		assert sum(m.fill_seats().values()) <= m.Ndeputies 
		#The party with the highest parcentage gets the largest number of seats.
		assert Electoral_Montecarlo.max_key(m.fill_seats())[0] == 'A' 


def test_complete_simulation():
	"""
	With this test I compare the assigned seats of a past election (2018 Italian
	General Election) with the simulated results of complete_simulation(on the same
	election). I verify that the simulation converges on the real assigned seats
	with a discrepancy of the 5%.

	Returns
	-------
	None.

	"""
	m = Electoral_Montecarlo.Montecarlo_electoral()
	m.Results = Results2018

	s         = m.complete_simulation()
	for i in s.keys():
		#I want to proof that the function works because it converges to a value very close to the real one.
		assert  np.abs(s[i]-Seats2018[i])<(m.Ndeputies*0.05) 
	
	
	
