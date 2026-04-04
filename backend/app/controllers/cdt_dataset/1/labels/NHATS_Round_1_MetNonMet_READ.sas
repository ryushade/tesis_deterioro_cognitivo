/* NHATS_Round_1_MetNonMet_READ.sas  */

/* Section #1 - Creating the Formats */
PROC FORMAT;
    VALUE W00metro

	   -1 = '-1 Inapplicable'	
		1 = '1 Metropolitan'
		2 = '2 Non-metropolitan';

RUN;


/* Section #2 - Input statement with variable name and location on the .txt file  
		Reminder - change [PATH] to reflect your file locations       */

Data MetNonmet_file;
INFILE  "[PATH]\NHATS_Round_1_MetNonmet.txt"
LRECL=10 ;
INPUT  @1 spid 8.
	    @9 r1dmetnonmet 2.;

/* Section #3 - format assignment statement   */
	format 	r1dmetnonmet W00metro.;


/* Section #4 - Label assignment statement   */
	Label	spid="NHATS SAMPLED PERSON ID"
		r1dmetnonmet = "R1 D METRO / NON-METRO RESIDENCE";

run;
