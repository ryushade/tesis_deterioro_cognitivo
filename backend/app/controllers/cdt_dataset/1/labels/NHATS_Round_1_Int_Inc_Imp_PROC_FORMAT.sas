/* NHATS_Round_1_Int_Inc_Imp_PROC_FORMAT.sas  */

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
RUN;

