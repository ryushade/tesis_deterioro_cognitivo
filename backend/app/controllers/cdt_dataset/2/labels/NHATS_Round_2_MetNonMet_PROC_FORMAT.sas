/* NHATS_Round_2_MetNonMet_PROC_FORMAT.sas  */

PROC FORMAT;
    VALUE W00metro

	   -1 = '-1 Inapplicable'	
		1 = '1 Metropolitan'
		2 = '2 Non-metropolitan';

RUN;
