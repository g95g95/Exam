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


def test_max_key(): #key with the max value in a dictionary
	examples = dict([('A',400),('B',200),('C',400),('D',300)])
	mk       = Electoral_Montecarlo.max_key(examples) 
	assert (mk == ['A','C']) #the function returns a list of this two elements.

Results2018={'Movimento 5 stelle':0.327,'Centrosinistra':0.22,'Centrodestra':0.37,'Leu':0.03}
#ResultsHyp ={'Movimento 5 stelle':0.18,'Centrosinistra':0.20,'Lega':0.35,'Centrodestra':0.15}
Seats2018  ={'Movimento 5 stelle':221,'Centrosinistra':113,'Centrodestra':260,'Leu':14} #excluding abroad seats





def test_constructor_Montecarlo(): #testing for the proper initializion of the object of the class.
	with pytest.raises(ValueError):
		m = Electoral_Montecarlo.Montecarlo_electoral(chooseinput = 'not the right input')
	
	
	
	
def test_Import_Result(): #testing if the input files exist
	m = Electoral_Montecarlo.Montecarlo_electoral('txt','Not an existing file')
	with pytest.raises(FileNotFoundError):
		m.Import_Results()
		
	m = Electoral_Montecarlo.Montecarlo_electoral('excel','Not existing file')
	with pytest.raises(FileNotFoundError):
		m.Import_Results()
	
	
	
def test_check_input(): #Testing if the imported data can be used or not
	m = Electoral_Montecarlo.Montecarlo_electoral()
	m.Parties = rd.choice([['',''],[]]) #Parties were notproperly harvested
	with pytest.raises(ValueError):
		m.check_input()
	
	m.Parties = ['Pd','Pd','Lega','FDI'] #Two parties with the same name, impossible
	with pytest.raises(ValueError):
		m.check_input()
	
	m.Propval = rd.choice([['',''],[]])#Results were not properly harvested
	with pytest.raises(ValueError):
		m.check_input()
		
	m.Propval = [1,0.3,0.3] #Results are not consistent
	with pytest.raises(ValueError):
		m.check_input()
		
	m.Propval = [0.2,0.3,0.5,0.1] #Results are not consistent
	with pytest.raises(ValueError):
		m.check_input()
	
	
	m.Propcoef	= rd.choice(['','alpha','01']) #Coefficients cannot be properly interpreted
	with pytest.raises(ValueError):
		m.check_input()
		
	m.Majorcoef	= rd.choice(['','alpha','01'])
	with pytest.raises(ValueError):
		m.check_input()	
		
	m.Propcoef  = 1.5 #Coefficients are not consistent
	with pytest.raises(ValueError):
		m.check_input()
	
	m.Majorcoef = 1.5	
	with pytest.raises(ValueError):
		m.check_input()
		
	m.Propcoef,m.Majorcoef = 0.6,0.5
	with pytest.raises(ValueError):
		m.check_input()
		
		
		
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
		
	
	
	
def test_Graphics():
	m = Electoral_Montecarlo.Montecarlo_electoral()
	m.Results = {'A':0.33,'B':0.15,'C':0.27,'D':0.25}
	with pytest.raises(ValueError):
		m.Graphics({'t':0.33,'e':0.15,'s':0.27,'t':0.25}) #they have not the same names
		m.Graphics({'t':0.33})	#they have not the same number of elements!
		
	
	
	
	
	