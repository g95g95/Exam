# -*- coding: utf-8 -*-
"""
Created on Thu Nov 14 23:03:10 2019
@author: Giulio
"""

import pytest
import numpy as np
import random as rd
from Electoral_Montecarlo import Montecarlo_electoral
 
#Results2018={'Movimento 5 stelle':0.327,'Centrosinistra':0.22,'Centrodestra':0.37,'Leu':0.03}
#ResultsHyp ={'Movimento 5 stelle':0.18,'Centrosinistra':0.20,'Lega':0.35,'Centrodestra':0.15}
#Seats2018  ={'Movimento 5 stelle':221,'Centrosinistra':113,'Centrodestra':260,'Leu':14} #excluding abroad seats

def test_constructor_Montecarlo():
	with pytest.raises(ValueError):
		m = Montecarlo_electoral(chooseinput = 'not the right input')
	
def test_check_input():
	m = Montecarlo_electoral()
	m.Parties = rd.choice([['',''],[]])
	with pytest.raises(ValueError):
		m.check_input()
	m.Propval = rd.choice([['',''],[]])
	with pytest.raises(ValueError):
		m.check_input()
	m.Propval = [1,0.3,0.3]
	with pytest.raises(ValueError):
		m.check_input()
	m.Propval = [0.2,0.3,0.5,0.1]
	with pytest.raises(ValueError):
		m.check_input()
	
	
	m.Propcoef	= rd.choice(['','alpha','01'])
	with pytest.raises(ValueError):
		m.check_input()
		
	m.Majorcoef	= rd.choice(['','alpha','01'])
	with pytest.raises(ValueError):
		m.check_input()	
		
	m.Propcoef  = 1.5
	with pytest.raises(ValueError):
		m.check_input()
	
	m.Majorcoef = 1.5	
	with pytest.raises(ValueError):
		m.check_input()
		
	m.Propcoef,m.Majorcoef = 0.6,0.5
	with pytest.raises(ValueError):
		m.check_input()
	
	
	
	
	
	
	
	
	
	
	
	
	