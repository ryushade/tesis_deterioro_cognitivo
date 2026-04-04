/* NHATS_Round_1_Int_Inc_Imp_Read.SAS - General Use */

/* Section #1 - Creating the Formats */
PROC FORMAT;

    VALUE RFDK_F
    -7 = '-7 RF'
    -8 = '-8 DK'
    -1 = '-1 Inapplicable'
    -9 = '-9 Missing';

    VALUE RFDK_Y
     1 = ' 1 Yes'
    -7 = '-7 RF'
    -8 = '-8 DK'
    -1 = '-1 Inapplicable'
    -9 = '-9 Missing';
	  
	VALUE IMP_FMT 
      -9='-9 Missing'
      -1='-1 inapplicable'
      1='1 Not imputed: exact value reported'
      2='2 Imputed: bracket response only'
      3='3 Imputed: missing exact value and bracket response'
	  4='4 Imputed: other';

run;
/* Section #2 - Input statement with variable name and location on the .txt file  
		Reminder - change [PATH] to reflect your file locations       */

Data Int_Inc_Imp_File;
INFILE  "[PATH]\NHATS_Round_1_Int_Inc_Imp_File.txt"
LRECL=172 ;
INPUT @1 spid 8.
			@9 ia1toincimif 2.
			@11 ia1dtoincimi1 8.
			@19 ia1dtoincimi2 8.
			@27 ia1dtoincimi3 8.
			@35 ia1dtoincimi4 8.
			@43 ia1dtoincimi5 8.
			@51 ia1dtoincimi6 8.
			@59 ia1dtoincimi7 8.
			@67 ia1dtoincimi8 8.
			@75 ia1dtoincimi9 8.
			@83 ia1dtoincimi10 8.
			@91 ia1dtoincimi11 8.
			@99 ia1dtoincimi12 8.
			@107 ia1dtoincimi13 8.
			@115 ia1dtoincimi14 8.
			@123 ia1dtoincimi15 8.
			@131 ia1dtoincimi16 8.
			@139 ia1dtoincimi17 8.
			@147 ia1dtoincimi18 8.
			@155 ia1dtoincimi19 8.
			@163 ia1dtoincimi20 8.
			@171 ia1dtoincimreas 2.;
	
/* Section #3 - format assignment statement */
	format ia1toincimif RFDK_Y.
			ia1dtoincimi1-ia1dtoincimi20 RFDK_F.
			ia1dtoincimreas IMP_FMT.;

/* Section #4 - Label assignment statement   */
		Label	spid="NHATS SAMPLED PERSON ID"
			ia1toincimif="R1 F IMPUTED TOTAL INC FLG INTERVAL"		
			ia1dtoincimi1="R1 D IA50 IMPUTED TOTAL INC1 INTERVAL" 
			ia1dtoincimi2	="R1 D IA50 IMPUTED TOTAL INC2 INTERVAL"
			ia1dtoincimi3	="R1 D IA50 IMPUTED TOTAL INC3 INTERVAL"
			ia1dtoincimi4	="R1 D IA50 IMPUTED TOTAL INC4 INTERVAL"
			ia1dtoincimi5	="R1 D IA50 IMPUTED TOTAL INC5 INTERVAL"
			ia1dtoincimi6	="R1 D IA50 IMPUTED TOTAL INC6 INTERVAL"
			ia1dtoincimi7	="R1 D IA50 IMPUTED TOTAL INC7 INTERVAL"
			ia1dtoincimi8	="R1 D IA50 IMPUTED TOTAL INC8 INTERVAL"
			ia1dtoincimi9	="R1 D IA50 IMPUTED TOTAL INC9 INTERVAL"
			ia1dtoincimi10 ="R1 D IA50 IMPUTED TOTAL INC10 INTERVAL"
			ia1dtoincimi11 ="R1 D IA50 IMPUTED TOTAL INC11 INTERVAL"
			ia1dtoincimi12 ="R1 D IA50 IMPUTED TOTAL INC12 INTERVAL"
			ia1dtoincimi13 ="R1 D IA50 IMPUTED TOTAL INC13 INTERVAL"
			ia1dtoincimi14 ="R1 D IA50 IMPUTED TOTAL INC14 INTERVAL"
			ia1dtoincimi15 ="R1 D IA50 IMPUTED TOTAL INC15 INTERVAL"
			ia1dtoincimi16 ="R1 D IA50 IMPUTED TOTAL INC16 INTERVAL"
			ia1dtoincimi17 ="R1 D IA50 IMPUTED TOTAL INC17 INTERVAL"
			ia1dtoincimi18 ="R1 D IA50 IMPUTED TOTAL INC18 INTERVAL"
			ia1dtoincimi19 ="R1 D IA50 IMPUTED TOTAL INC19 INTERVAL"
			ia1dtoincimi20 ="R1 D IA50 IMPUTED TOTAL INC20 INTERVAL"
			ia1dtoincimreas="R1 D IMPUTED TOTAL INC REASON";
run;

